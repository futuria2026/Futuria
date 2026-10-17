<?php
/**
 *
 * las cuentas de usuario: registrarse, iniciar sesión, cerrar sesión y saber
 * quién inició sesión. Siempre contesta en JSON
 *
 * con GET ?accion=sesion devuelve el usuario conectado (o null) y cuántos
 * productos tiene en el carrito. Con POST recibe un JSON con la acción:
 * { accion: "registro", nombre, correo, contrasena, confirmar },
 * { accion: "login", correo, contrasena } o { accion: "logout" }
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';

$metodo = $_SERVER['REQUEST_METHOD'];

/**
 *
 * decir quién inició sesión. La barra de navegación de todas las páginas lo
 * pregunta al cargar para mostrar "Ingresar" o "Salir" y el número del carrito
 *
 */
if ($metodo === 'GET') {
    if (($_GET['accion'] ?? 'sesion') !== 'sesion') {
        responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
    }
    $usuario = usuario_actual();
    responder([
        'ok'      => true,
        'usuario' => $usuario,
        'carrito' => $usuario ? cantidad_carrito($usuario['id']) : 0,
    ]);
}

if ($metodo !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$entrada = entrada_json();
$accion  = (string)($entrada['accion'] ?? '');

/**
 *
 * crear una cuenta nueva y dejarla con la sesión iniciada
 *
 * revisa que el nombre tenga 3 letras o más (y 100 como máximo), que el
 * correo sea válido, que la contraseña tenga 6 caracteres o más y que la
 * confirmación sea igual. Si el correo ya está registrado responde con el
 * error 409. La contraseña se guarda cifrada con password_hash()
 *
 */
if ($accion === 'registro') {
    $nombre     = trim((string)($entrada['nombre'] ?? ''));
    $correo     = mb_strtolower(trim((string)($entrada['correo'] ?? '')));
    $contrasena = (string)($entrada['contrasena'] ?? '');
    $confirmar  = (string)($entrada['confirmar'] ?? '');

    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 100) {
        responder(['ok' => false, 'error' => 'El nombre debe tener entre 3 y 100 caracteres.', 'campo' => 'nombre'], 422);
    }
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 150) {
        responder(['ok' => false, 'error' => 'El correo no es válido.', 'campo' => 'correo'], 422);
    }
    if (strlen($contrasena) < 6) {
        responder(['ok' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres.', 'campo' => 'contrasena'], 422);
    }
    if ($contrasena !== $confirmar) {
        responder(['ok' => false, 'error' => 'Las contraseñas no coinciden.', 'campo' => 'confirmar'], 422);
    }

    $existe = bd()->prepare('SELECT 1 FROM usuarios WHERE correo = ?');
    $existe->execute([$correo]);
    if ($existe->fetchColumn()) {
        responder(['ok' => false, 'error' => 'Ese correo ya está registrado.', 'campo' => 'correo'], 409);
    }

    $nuevo = bd()->prepare('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)');
    $nuevo->execute([$nombre, $correo, password_hash($contrasena, PASSWORD_DEFAULT)]);

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int)bd()->lastInsertId();

    responder(['ok' => true, 'usuario' => usuario_actual(), 'carrito' => 0], 201);
}

/**
 *
 * iniciar sesión con correo y contraseña
 *
 * busca el correo y compara la contraseña con la cifrada usando
 * password_verify(). Si no coinciden responde con el error 401 y el mismo
 * mensaje en los dos casos, sin decir si el correo existe. Al entrar cambia el
 * id de la sesión (session_regenerate_id) y guarda el id del usuario
 *
 */
if ($accion === 'login') {
    $correo     = mb_strtolower(trim((string)($entrada['correo'] ?? '')));
    $contrasena = (string)($entrada['contrasena'] ?? '');

    if ($correo === '' || $contrasena === '') {
        responder(['ok' => false, 'error' => 'Escribe tu correo y tu contraseña.'], 422);
    }

    $consulta = bd()->prepare('SELECT id, contrasena FROM usuarios WHERE correo = ?');
    $consulta->execute([$correo]);
    $fila = $consulta->fetch();

    if (!$fila || !password_verify($contrasena, $fila['contrasena'])) {
        responder(['ok' => false, 'error' => 'Correo o contraseña incorrectos.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int)$fila['id'];

    $usuario = usuario_actual();
    responder(['ok' => true, 'usuario' => $usuario, 'carrito' => cantidad_carrito($usuario['id'])]);
}

/**
 *
 * cerrar sesión: borra los datos de la sesión, su cookie y la sesión misma
 *
 */
if ($accion === 'logout') {
    $_SESSION = [];
    $p = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'],
    ]);
    session_destroy();
    responder(['ok' => true]);
}

responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
