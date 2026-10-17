<?php
/**
 *
 * lo que comparten auth.php, carrito.php y productos.php: la conexión a la
 * base de datos, la sesión del usuario y las respuestas en JSON
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

    $archivo = __DIR__ . '/config.php';
    if (!is_file($archivo)) {
        responder(['ok' => false, 'error' => 'Falta configurar la base de datos (api/inc/config.php).'], 500);
    }
    $c = require $archivo;

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
 * el usuario que inició sesión ({ id, nombre, correo }), o null si nadie ha
 * iniciado sesión
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
    $consulta = bd()->prepare('SELECT id, nombre, correo FROM usuarios WHERE id = ?');
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
 * cuántos productos en total (sumando las cantidades) tiene un usuario en su
 * carrito
 *
 */
function cantidad_carrito(int $usuarioId): int
{
    $consulta = bd()->prepare('SELECT COALESCE(SUM(cantidad), 0) FROM carrito WHERE usuario_id = ?');
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
