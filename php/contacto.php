<?php
// ============================================================
//  FUTURIA - Backend del formulario (solo PHP, sin HTML)
//  Recibe POST desde contacto.html y responde JSON.
// ============================================================
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$destinatario = 'futuria2026@gmail.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'errores' => ['Método no permitido.']], JSON_UNESCAPED_UNICODE);
    exit;
}

$nombre  = trim((string)($_POST['nombre']  ?? ''));
$correo  = trim((string)($_POST['correo']  ?? ''));
$mensaje = trim((string)($_POST['mensaje'] ?? ''));

$errores = [];
if ($nombre === '')                              $errores[] = 'Escribe tu nombre.';
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) $errores[] = 'Escribe un correo válido.';
if (mb_strlen($mensaje) < 10)                    $errores[] = 'El mensaje es muy corto.';

if ($errores) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errores' => $errores], JSON_UNESCAPED_UNICODE);
    exit;
}

$asunto   = 'Nuevo mensaje desde Futuria';
$cuerpo   = "Nombre: $nombre\nCorreo: $correo\n\n$mensaje\n";
$cabecera = "From: Futuria <no-reply@futuria.com>\r\nReply-To: $correo\r\n";

if (@mail($destinatario, $asunto, $cuerpo, $cabecera)) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'errores' => ['No se pudo enviar el mensaje, intenta más tarde.']], JSON_UNESCAPED_UNICODE);
}
