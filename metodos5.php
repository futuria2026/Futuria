<?php
/* ==========================================================
   FUTURIA · Página 5 · MÉTODOS  (metodos5.php)
   ----------------------------------------------------------
   IMPORTANTE: este archivo NO se ejecuta en la plataforma
   Enter (el backend de Enter usa funciones cloud, no PHP).
   Es un archivo listo para usar en tu propio servidor PHP
   (XAMPP / WAMP / Apache + MySQL) sin necesidad de Enter.

   Cómo usarlo:
   1) Coloca metodos5.html, estilos5.css, metodos5.js y
      metodos5.php juntos en la carpeta pública del servidor.
   2) Crea la base de datos y la tabla con el SQL de abajo.
   3) Ajusta $HOST, $USER, $PASS y $DB de este archivo.
   4) En metodos5.js, descomenta el bloque "Sincronizar con
      el servidor PHP" para enviar las tareas del calendario
      aquí.
   ========================================================== */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');      // ajusta el dominio en producción
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

/* ---------- Configuración de la base de datos ---------- */
$HOST = 'localhost';
$USER = 'root';
$PASS = '';
$DB   = 'futuria';

/* ---------- Conexión (PDO + prepared statements) ---------- */
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
 * SQL para crear la tabla de tareas (ejecutar una sola vez):
 *
 * CREATE DATABASE IF NOT EXISTS futuria CHARACTER SET utf8mb4;
 *
 * CREATE TABLE IF NOT EXISTS tareas (
 *   id       INT AUTO_INCREMENT PRIMARY KEY,
 *   fecha    DATE NOT NULL,
 *   hora     TIME NULL,
 *   titulo   VARCHAR(255) NOT NULL,
 *   creado   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * CREATE TABLE IF NOT EXISTS contactos (
 *   id       INT AUTO_INCREMENT PRIMARY KEY,
 *   nombre   VARCHAR(120) NOT NULL,
 *   correo   VARCHAR(160) NOT NULL,
 *   mensaje  TEXT NOT NULL,
 *   creado   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

/* ---------- Utilidades ---------- */
function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function limpiar($valor) {
    return trim(strip_tags((string) $valor));
}

/* ---------- Solo POST ---------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['error' => 'Método no permitido. Usa POST.'], 405);
}

$accion = isset($_POST['accion']) ? $_POST['accion'] : '';

switch ($accion) {

    /* Guardar una tarea del calendario: accion=guardar_tarea */
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

    /* Guardar un mensaje de contacto: accion=contacto */
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

/* ==========================================================
   Ejemplo de uso desde metodos5.js (descomentar y ajustar):

   fetch('metodos5.php', {
     method: 'POST',
     body: new URLSearchParams({
       accion: 'guardar_tarea',
       fecha:  '2026-08-17',
       hora:   '15:30',
       titulo: 'Estudiar biología'
     })
   }).then(r => r.json()).then(console.log);
   ========================================================== */