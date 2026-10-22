<?php
/**
 *
 * lo que comparten auth.php, carrito.php y productos.php: la conexión a la
 * base de datos, la sesión del usuario y las respuestas en JSON
 *
 * cada archivo de la API lo carga con require al principio. Al cargarse
 * inicia la sesión de PHP, que recuerda quién inició sesión con una cookie
 *
 * CAMBIOS: (1) lee también las variables MYSQLHOST, MYSQLPORT, MYSQLDATABASE,
 * MYSQLUSER y MYSQLPASSWORD que ya tienes en Vercel; (2) activa TLS solo si el
 * host es de TiDB Cloud; (3) guarda las sesiones en la tabla "sesiones",
 * porque en Vercel no hay disco compartido entre peticiones
 *
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

date_default_timezone_set('America/Bogota');

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
 * los datos de config.php o de las variables de entorno, leídos una sola vez
 *
 * en Vercel se leen de las variables del proyecto. Se aceptan los dos
 * nombres: DB_HOST... o MYSQLHOST... Si config.php existe, sus valores
 * tienen prioridad
 *
 */
function config(): array
{
    static $config = null;
    if ($config === null) {
        $archivo = __DIR__ . '/config.php';
        $config = is_file($archivo) ? (require $archivo) : [];

        $entorno = [
            'host'       => getenv('DB_HOST')     ?: getenv('MYSQLHOST'),
            'puerto'     => getenv('DB_PORT')     ?: getenv('MYSQLPORT'),
            'base'       => getenv('DB_NAME')     ?: getenv('MYSQLDATABASE'),
            'usuario'    => getenv('DB_USER')     ?: getenv('MYSQLUSER'),
            'contrasena' => getenv('DB_PASSWORD') ?: getenv('MYSQLPASSWORD'),
            'ssl'        => getenv('DB_SSL'),
            'ssl_ca'     => getenv('DB_SSL_CA'),
            'ia_api_key' => getenv('IA_API_KEY'),
        ];
        foreach ($entorno as $clave => $valor) {
            if ($valor !== false && $valor !== '' && !isset($config[$clave])) {
                $config[$clave] = $clave === 'ssl' ? in_array(strtolower((string)$valor), ['1', 'true', 'si'], true) : $valor;
            }
        }

        // TiDB Cloud solo acepta conexiones cifradas: se activa solo si el host lo es
        if (!isset($config['ssl']) && isset($config['host']) && str_contains((string)$config['host'], 'tidbcloud.com')) {
            $config['ssl'] = true;
        }
    }
    return $config;
}

/**
 *
 * la conexión a la base de datos, que se abre una sola vez y se reutiliza
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
        responder(['ok' => false, 'error' => 'Falta configurar la base de datos (variables de entorno o api/inc/config.php).'], 500);
    }
    $c += ['puerto' => 3306, 'contrasena' => '', 'ssl' => false];

    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

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
 * guarda las sesiones de PHP en la tabla "sesiones" en vez de en archivos
 *
 * la base solo se toca cuando PHP realmente lee o escribe la sesión
 *
 */
class SesionEnBD implements SessionHandlerInterface
{
    public function open(string $path, string $name): bool { return true; }
    public function close(): bool { return true; }

    public function read(string $id): string|false
    {
        $c = bd()->prepare('SELECT datos FROM sesiones WHERE id = ?');
        $c->execute([$id]);
        $datos = $c->fetchColumn();
        return $datos === false ? '' : (string)$datos;
    }

    public function write(string $id, string $data): bool
    {
        bd()->prepare('REPLACE INTO sesiones (id, datos, actualizado) VALUES (?, ?, ?)')
            ->execute([$id, $data, time()]);
        return true;
    }

    public function destroy(string $id): bool
    {
        bd()->prepare('DELETE FROM sesiones WHERE id = ?')->execute([$id]);
        return true;
    }

    public function gc(int $max_lifetime): int|false
    {
        $c = bd()->prepare('DELETE FROM sesiones WHERE actualizado < ?');
        $c->execute([time() - $max_lifetime]);
        return $c->rowCount();
    }
}

/**
 *
 * inicia la sesión con una cookie más segura (httponly, samesite Lax y secure
 * en https). Si la base no está lista, bd() responde con el error 500
 *
 */
session_set_save_handler(new SesionEnBD(), true);
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
 * el usuario que inició sesión ({ id, nombre, correo }), o null
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
 * convierte un precio en pesos en el texto que se muestra: 65000 → "$65.000 COP"
 *
 */
function formato_precio(int $pesos): string
{
    return '$' . number_format($pesos, 0, ',', '.') . ' COP';
}
