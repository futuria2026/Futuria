<?php
/**
 *
 * las cuentas de usuario: registrarse, iniciar sesión, cerrar sesión y saber
 * quién inició sesión. Siempre contesta en JSON
 *
 * con GET ?accion=sesion devuelve el usuario conectado (con su rol) o null y
 * cuántos productos tiene en el carrito. Con GET ?accion=usuarios (solo admin)
 * devuelve todos los usuarios. Con POST recibe un JSON con la acción:
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
    $accionGet = $_GET['accion'] ?? 'sesion';

    /**
     *
     * solo para administradores: la lista de todos los usuarios con su rol
     *
     */
    if ($accionGet === 'usuarios') {
        requerir_admin();
        $filas = bd()->query(
            'SELECT id_usuario AS id, nombre, email AS correo, rol, fecha_registro FROM usuarios ORDER BY id_usuario'
        )->fetchAll();
        responder(['ok' => true, 'usuarios' => $filas]);
    }

    if ($accionGet !== 'sesion') {
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

    $existe = bd()->prepare('SELECT 1 FROM usuarios WHERE email = ?');
    $existe->execute([$correo]);
    if ($existe->fetchColumn()) {
        responder(['ok' => false, 'error' => 'Ese correo ya está registrado.', 'campo' => 'correo'], 409);
    }

    $nuevo = bd()->prepare('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)');
    $nuevo->execute([$nombre, $correo, password_hash($contrasena, PASSWORD_DEFAULT)]);
    $idNuevo = (int)bd()->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = $idNuevo;

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

    $consulta = bd()->prepare('SELECT id_usuario, password_hash FROM usuarios WHERE email = ?');
    $consulta->execute([$correo]);
    $fila = $consulta->fetch();

    if (!$fila || !password_verify($contrasena, $fila['password_hash'])) {
        responder(['ok' => false, 'error' => 'Correo o contraseña incorrectos.'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['usuario_id'] = (int)$fila['id_usuario'];

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


/**
 *
 * editar el perfil del usuario que inició sesión: su nombre y su foto
 *
 * { accion: "perfil", nombre, foto }. El nombre debe tener entre 3 y 100
 * caracteres. La foto es opcional: si viene, es una imagen pequeña en base64
 * (data:image/jpeg;base64,...) de hasta 60 KB; si viene vacía ("") se quita
 * la foto; si no viene el campo, la foto no cambia
 *
 */
if ($accion === 'perfil') {
    $usuario = usuario_actual();
    if (!$usuario) {
        responder(['ok' => false, 'error' => 'Inicia sesión para editar tu perfil.'], 401);
    }
    $nombre = trim((string)($entrada['nombre'] ?? $usuario['nombre']));
    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 100) {
        responder(['ok' => false, 'error' => 'El nombre debe tener entre 3 y 100 caracteres.', 'campo' => 'nombre'], 422);
    }

    if (array_key_exists('foto', $entrada)) {
        $foto = (string)$entrada['foto'];
        if ($foto === '') {
            $valor = null;
        } elseif (strlen($foto) > 60000 || !preg_match('#^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$#', $foto)) {
            responder(['ok' => false, 'error' => 'La foto no es válida o pesa demasiado.', 'campo' => 'foto'], 422);
        } else {
            $valor = $foto;
        }
        bd()->prepare('UPDATE usuarios SET nombre = ?, foto = ? WHERE id_usuario = ?')
            ->execute([$nombre, $valor, $usuario['id']]);
    } else {
        bd()->prepare('UPDATE usuarios SET nombre = ? WHERE id_usuario = ?')
            ->execute([$nombre, $usuario['id']]);
    }
    responder(['ok' => true, 'usuario' => usuario_actual()]);
}

/**
 *
 * solo para administradores: cambiar el rol de un usuario ("usuario" o
 * "admin") o eliminar su cuenta
 *
 * un administrador no puede cambiarse el rol ni eliminarse a sí mismo, así
 * siempre queda al menos un administrador. Al eliminar un usuario la base
 * borra también sus tareas, su carrito y sus datos (ON DELETE CASCADE)
 *
 */
if ($accion === 'cambiar_rol' || $accion === 'eliminar_usuario') {
    $admin = requerir_admin();
    $id    = (int)($entrada['id'] ?? 0);

    $existe = bd()->prepare('SELECT 1 FROM usuarios WHERE id_usuario = ?');
    $existe->execute([$id]);
    if (!$existe->fetchColumn()) {
        responder(['ok' => false, 'error' => 'Ese usuario no existe.'], 404);
    }
    if ($id === $admin['id']) {
        responder(['ok' => false, 'error' => 'No puedes cambiar ni eliminar tu propia cuenta.'], 422);
    }

    if ($accion === 'cambiar_rol') {
        $rol = (string)($entrada['rol'] ?? '');
        if (!in_array($rol, ['usuario', 'admin'], true)) {
            responder(['ok' => false, 'error' => 'Rol no válido.'], 422);
        }
        bd()->prepare('UPDATE usuarios SET rol = ? WHERE id_usuario = ?')->execute([$rol, $id]);
    } else {
        bd()->prepare('DELETE FROM usuarios WHERE id_usuario = ?')->execute([$id]);
    }
    responder(['ok' => true]);
}

responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
