<?php
/**
 *
 * recibe el formulario de la página de contacto y lo manda por correo a
 * futuria2026@gmail.com. Siempre contesta en JSON
 *
 * solo acepta envíos POST. Revisa que haya nombre, un correo válido y un
 * mensaje de al menos 10 letras; si algo falla responde { ok: false, errores }
 * con la lista de problemas. Si todo está bien envía el correo con la API de
 * Resend (en Vercel no existe la función mail() de PHP) y responde { ok: true }
 *
 * necesita la variable de entorno RESEND_API_KEY en Vercel
 *
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/**
 *
 * el correo de Futuria que recibe los mensajes
 *
 * con el remitente de prueba de Resend (onboarding@resend.dev) solo se puede
 * enviar al correo con el que se creó la cuenta de Resend, así que esta
 * cuenta debe crearse con futuria2026@gmail.com
 *
 */
$destinatario = 'futuria2026@gmail.com';
$remitente    = 'Futuria <onboarding@resend.dev>';

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

/**
 *
 * envía el correo con Resend usando cURL
 *
 * "reply_to" hace que al darle "responder" en Gmail la respuesta le llegue
 * directo a la persona que escribió. Si no hay clave, o Resend rechaza el
 * envío, se responde con el error 500 y el motivo queda en los logs de Vercel
 *
 */
$clave = (string)getenv('RESEND_API_KEY');
$enviado = false;

if ($clave !== '' && function_exists('curl_init')) {
    $cuerpo = json_encode([
        'from'     => $remitente,
        'to'       => [$destinatario],
        'reply_to' => $correo,
        'subject'  => 'Nuevo mensaje desde Futuria',
        'text'     => "Nombre: $nombre\nCorreo: $correo\n\n$mensaje\n",
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $cuerpo,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $clave,
        ],
    ]);
    $respuesta = curl_exec($ch);
    $codigo    = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $errorCurl = curl_error($ch);
    curl_close($ch);

    $enviado = ($respuesta !== false && $codigo >= 200 && $codigo < 300);
    if (!$enviado) {
        error_log("Futuria contacto: Resend respondió $codigo $errorCurl " . (string)$respuesta);
    }
} else {
    error_log('Futuria contacto: falta RESEND_API_KEY o cURL no está disponible.');
}

if ($enviado) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'errores' => ['No se pudo enviar el mensaje, intenta más tarde.']], JSON_UNESCAPED_UNICODE);
}
