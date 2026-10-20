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
 * lee config.php y las variables MYSQL del entorno una sola vez. Si el archivo
 * no existe, usa solo las variables de entorno disponibles
 *
 */
function config(): array
{
    static $config = null;
    if ($config === null) {
        $archivo = __DIR__ . '/config.php';
        $datos = is_file($archivo) ? (require $archivo) : [];
        $config = is_array($datos) ? $datos : [];

        $variables = [
            'host'       => ['MYSQLHOST', 'MYSQL_HOST'],
            'puerto'     => ['MYSQLPORT', 'MYSQL_PORT'],
            'base'       => ['MYSQLDATABASE', 'MYSQL_DATABASE'],
            'usuario'    => ['MYSQLUSER', 'MYSQL_USER'],
            'contrasena' => ['MYSQLPASSWORD', 'MYSQL_PASSWORD'],
        ];

        foreach ($variables as $clave => $nombres) {
            foreach ($nombres as $nombre) {
                $valor = getenv($nombre);
                if ($valor === false || $valor === '') {
                    $valor = $_ENV[$nombre] ?? false;
                }
                if ($valor === false || $valor === '') {
                    $valor = $_SERVER[$nombre] ?? false;
                }
                if (is_scalar($valor) && (string)$valor !== '') {
                    $config[$clave] = (string)$valor;
                    break;
                }
            }
        }
        $url = getenv('MYSQL_URL');
        if ($url === false || $url === '') {
            $url = $_ENV['MYSQL_URL'] ?? false;
        }
        if ($url === false || $url === '') {
            $url = $_SERVER['MYSQL_URL'] ?? false;
        }

        if (is_string($url) && $url !== '') {
            $partes = parse_url($url);
            if (is_array($partes) && isset($partes['host'], $partes['path'])) {
                $desdeUrl = [
                    'host'       => $partes['host'],
                    'puerto'     => $partes['port'] ?? 3306,
                    'base'       => rawurldecode(ltrim($partes['path'], '/')),
                    'usuario'    => isset($partes['user']) ? rawurldecode($partes['user']) : '',
                    'contrasena' => isset($partes['pass']) ? rawurldecode($partes['pass']) : '',
                ];
                foreach ($desdeUrl as $clave => $valor) {
                    if (!isset($config[$clave]) || $config[$clave] === '') {
                        $config[$clave] = (string)$valor;
                    }
                }
            }
        }
    }
    return $config;
}

/**
 *
 * la conexión a la base de datos, que se abre una sola vez y se reutiliza
 *
 * lee la configuración de config.php o del entorno. Si la base no responde,
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
        responder(['ok' => false, 'error' => 'Falta configurar la base de datos (variables MYSQL o api/inc/config.php).'], 500);
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
