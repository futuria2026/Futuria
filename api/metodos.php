<?php
/**
 *
 * guarda en la base de datos MySQL las tareas del calendario de la página de
 * métodos y los mensajes de contacto. Ninguna página lo usa todavía: el
 * calendario de métodos guarda las tareas solo en el navegador
 *
 * se conecta a la base "futuria" con el usuario root sin contraseña. Solo
 * acepta POST con un campo "accion": "guardar_tarea" (fecha, hora, titulo) o
 * "contacto" (nombre, correo, mensaje). Necesita dos tablas que no están en
 * database/futuria.sql: tareas (id, fecha DATE, hora TIME, titulo
 * VARCHAR(255), creado TIMESTAMP) y contactos (id, nombre VARCHAR(120), correo
 * VARCHAR(160), mensaje TEXT, creado TIMESTAMP)
 *
 */

/**
 *
 * responde en JSON y deja que cualquier página, incluso de otro dominio, le
 * envíe datos con POST (CORS)
 *
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

/**
 *
 * los datos para entrar a la base de datos: servidor, usuario, contraseña y
 * nombre de la base
 *
 */
$HOST = 'localhost';
$USER = 'root';
$PASS = '';
$DB   = 'futuria';

/**
 *
 * la conexión a la base de datos
 *
 * usa PDO (la forma de PHP de hablar con bases de datos). Si algo falla en una
 * consulta lanza un error, y las filas llegan como listas con nombre de
 * columna. Si no se puede conectar responde con el error 500
 *
 */
try {
    $pdo = new PDO(
        "mysql:host={$HOST};dbname={$DB};charset=utf8mb4",
        $USER,
        $PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    responder(['error' => 'No se pudo conectar a la base de datos'], 500);
}

/**
 *
 * convierte los datos en JSON, los envía con el código de respuesta indicado
 * (200 si todo está bien) y termina el programa
 *
 */
function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 *
 * limpia un texto: le quita etiquetas HTML y los espacios sobrantes al inicio
 * y al final
 *
 */
function limpiar($valor) {
    return trim(strip_tags((string) $valor));
}

/**
 *
 * solo se aceptan envíos POST; si no, error 405
 *
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['error' => 'Método no permitido. Usa POST.'], 405);
}

$accion = isset($_POST['accion']) ? $_POST['accion'] : '';

switch ($accion) {

    /**
     *
     * guarda una tarea del calendario en la tabla tareas
     *
     * el título es obligatorio y la fecha tiene que venir como AAAA-MM-DD. La
     * hora es opcional; si viene vacía se guarda sin hora. Responde con el id
     * que le dio la base de datos a la tarea nueva
     *
     */
    case 'guardar_tarea':
        $fecha  = limpiar($_POST['fecha'] ?? '');
        $hora   = limpiar($_POST['hora'] ?? '');
        $titulo = limpiar($_POST['titulo'] ?? '');

        if ($titulo === '') {
            responder(['error' => 'El título de la tarea es obligatorio'], 422);
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            responder(['error' => 'Formato de fecha inválido (usa YYYY-MM-DD)'], 422);
        }

        $sql  = "INSERT INTO tareas (fecha, hora, titulo) VALUES (:fecha, :hora, :titulo)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':fecha'  => $fecha,
            ':hora'   => $hora !== '' ? $hora : null,
            ':titulo' => $titulo,
        ]);

        responder([
            'ok'    => true,
            'id'    => (int) $pdo->lastInsertId(),
            'mensaje' => 'Tarea guardada correctamente',
        ]);

    /**
     *
     * guarda un mensaje de contacto en la tabla contactos
     *
     * nombre, correo y mensaje son obligatorios y el correo tiene que ser
     * válido. Responde con un "¡Gracias!" que incluye el nombre de la persona
     *
     */
    case 'contacto':
        $nombre  = limpiar($_POST['nombre'] ?? '');
        $correo  = limpiar($_POST['correo'] ?? '');
        $mensaje = limpiar($_POST['mensaje'] ?? '');

        if ($nombre === '' || $correo === '' || $mensaje === '') {
            responder(['error' => 'Nombre, correo y mensaje son obligatorios'], 422);
        }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            responder(['error' => 'Correo inválido'], 422);
        }

        $sql  = "INSERT INTO contactos (nombre, correo, mensaje) VALUES (:nombre, :correo, :mensaje)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre'  => $nombre,
            ':correo'  => $correo,
            ':mensaje' => $mensaje,
        ]);

        responder(['ok' => true, 'mensaje' => '¡Gracias ' . $nombre . '! Mensaje recibido.']);

    default:
        responder(['error' => 'Acción desconocida'], 400);
}
