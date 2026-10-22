<?php
/**
 *
 * lo que comparten los archivos de la API: la conexión a la base de datos,
 * la sesión del usuario, las respuestas en JSON y el permiso de administrador
 *
 * cada archivo de la API lo carga con require al principio. Al cargarse
 * inicia la sesión de PHP, que recuerda quién inició sesión con una cookie
 *
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 *
 * las fechas y horas se calculan con la hora de Colombia (Bogotá), por
 * ejemplo para saber cuántos Pomodoros se hicieron "hoy"
 *
 */
date_default_timezone_set('America/Bogota');

/**
 *
 * inicia la sesión de PHP con una cookie más segura
 *
 * la cookie no la puede leer JavaScript (httponly), no viaja en peticiones de
 * otros sitios (samesite Lax) y, si la página está en https, solo viaja por
 * https (secure)
 *
 */
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

/**
 *
 * convierte los datos en JSON, los envía con el código de respuesta indicado
 * (200 si todo está bien) y termina el programa
 *
 */
function responder(array $datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 *
 * lee el cuerpo de la petición, que llega en JSON, y lo devuelve como lista.
 * Si viene vacío o mal escrito devuelve una lista vacía
 *
 */
function entrada_json(): array
{
    $datos = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($datos) ? $datos : [];
}

/**
 *
 * los datos de config.php (base de datos y clave de la IA), leídos una sola
 * vez. Si el archivo no existe devuelve una lista vacía
 *
 */
function config(): array
{
    static $config = null;
    if ($config === null) {
        $archivo = __DIR__ . '/config.php';
        $config = is_file($archivo) ? (require $archivo) : [];
    }
    return $config;
}

/**
 *
 * la conexión a la base de datos, que se abre una sola vez y se reutiliza
 *
 * lee los datos de config.php. Si el archivo no existe o la base no responde,
 * contesta con el error 500 y un mensaje claro. Usa PDO (la forma de PHP de
 * hablar con bases de datos): si una consulta falla lanza un error y las
 * filas llegan como listas con el nombre de cada columna
 *
 */
function bd(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $c = config();
    if (!isset($c['host'], $c['base'], $c['usuario'])) {
        responder(['ok' => false, 'error' => 'Falta configurar la base de datos (api/inc/config.php).'], 500);
    }
    $c += ['puerto' => 3306, 'contrasena' => ''];

    try {
        $pdo = new PDO(
            "mysql:host={$c['host']};port={$c['puerto']};dbname={$c['base']};charset=utf8mb4",
            $c['usuario'],
            $c['contrasena'],
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (PDOException $e) {
        responder(['ok' => false, 'error' => 'No se pudo conectar a la base de datos.'], 500);
    }
    return $pdo;
}

/**
 *
 * el usuario que inició sesión ({ id, nombre, correo, rol, foto }), o null si
 * nadie ha iniciado sesión
 *
 * busca en la base el id guardado en la sesión. Si ese usuario ya no existe,
 * cierra la sesión
 *
 */
function usuario_actual(): ?array
{
    $id = $_SESSION['usuario_id'] ?? null;
    if (!$id) {
        return null;
    }
    $consulta = bd()->prepare('SELECT id_usuario AS id, nombre, email AS correo, rol, foto FROM usuarios WHERE id_usuario = ?');
    $consulta->execute([$id]);
    $usuario = $consulta->fetch();
    if (!$usuario) {
        unset($_SESSION['usuario_id']);
        return null;
    }
    $usuario['id'] = (int)$usuario['id'];
    return $usuario;
}

/**
 *
 * cuántos productos en total tiene un usuario en su carrito (una fila por
 * unidad en productos_usuarios)
 *
 */
function cantidad_carrito(int $usuarioId): int
{
    $consulta = bd()->prepare('SELECT COUNT(*) FROM productos_usuarios WHERE id_usuario = ?');
    $consulta->execute([$usuarioId]);
    return (int)$consulta->fetchColumn();
}

/**
 *
 * convierte un precio en pesos en el texto que se muestra, por ejemplo
 * 65000 → "$65.000 COP"
 *
 */
function formato_precio(int $pesos): string
{
    return '$' . number_format($pesos, 0, ',', '.') . ' COP';
}

/**
 *
 * deja pasar solo a un administrador. Si nadie inició sesión responde 401;
 * si inició sesión pero su rol no es "admin" responde 403. Devuelve el
 * usuario administrador para que el endpoint pueda usar su id
 *
 */
function requerir_admin(): array
{
    $usuario = usuario_actual();
    if (!$usuario) {
        responder(['ok' => false, 'error' => 'Inicia sesión para continuar.'], 401);
    }
    if (($usuario['rol'] ?? 'usuario') !== 'admin') {
        responder(['ok' => false, 'error' => 'Solo los administradores pueden hacer esto.'], 403);
    }
    return $usuario;
}
