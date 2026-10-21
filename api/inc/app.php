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

        /**
         *
         * en Vercel no existe config.php (no se sube a git): los datos se
         * leen de las variables de entorno del proyecto (DB_HOST, DB_PORT,
         * DB_NAME, DB_USER, DB_PASSWORD, DB_SSL, DB_SSL_CA e IA_API_KEY). Si config.php
         * existe, sus valores tienen prioridad
         *
         */
        $entorno = [
            'host'       => getenv('DB_HOST'),
            'puerto'     => getenv('DB_PORT'),
            'base'       => getenv('DB_NAME'),
            'usuario'    => getenv('DB_USER'),
            'contrasena' => getenv('DB_PASSWORD'),
            'ssl'        => getenv('DB_SSL'),
            'ssl_ca'     => getenv('DB_SSL_CA'),
            'ia_api_key' => getenv('IA_API_KEY'),
        ];
        foreach ($entorno as $clave => $valor) {
            if ($valor !== false && $valor !== '' && !isset($config[$clave])) {
                $config[$clave] = $clave === 'ssl' ? in_array(strtolower($valor), ['1', 'true', 'si'], true) : $valor;
            }
        }
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
    $c += ['puerto' => 3306, 'contrasena' => '', 'ssl' => false];

    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    /**
     *
     * TiDB Cloud solo acepta conexiones cifradas (TLS). Con 'ssl' => true se
     * usa el certificado de autoridades del sistema; si el servidor lo tiene
     * en otra ruta se indica con 'ssl_ca'
     *
     */
    if (!empty($c['ssl'])) {
        $ca = $c['ssl_ca'] ?? null;
        if (!$ca) {
            foreach (['/etc/ssl/certs/ca-certificates.crt', '/etc/pki/tls/certs/ca-bundle.crt', '/etc/ssl/cert.pem'] as $ruta) {
                if (is_file($ruta)) { $ca = $ruta; break; }
            }
        }
        if ($ca) {
            $opciones[PDO::MYSQL_ATTR_SSL_CA] = $ca;
        }
        $opciones[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = (bool)$ca;
    }

    try {
        $pdo = new PDO(
            "mysql:host={$c['host']};port={$c['puerto']};dbname={$c['base']};charset=utf8mb4",
            $c['usuario'],
            $c['contrasena'],
            $opciones
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
    $consulta = bd()->prepare('SELECT id_usuario AS id, nombre, email AS correo FROM usuarios WHERE id_usuario = ?');
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
 * cuántos productos en total tiene un usuario en su carrito
 *
 * el carrito se guarda en la tabla productos_usuarios del diagrama: una fila
 * por cada unidad (3 libros = 3 filas), así no hace falta una columna de
 * cantidad
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
