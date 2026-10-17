<?php
/**
 *
 * recibe el formulario de la página de contacto y lo manda por correo a
 * futuria2026@gmail.com. Siempre contesta en JSON
 *
 * solo acepta envíos POST. Revisa que haya nombre, un correo válido y un
 * mensaje de al menos 10 letras; si algo falla responde { ok: false, errores }
 * con la lista de problemas. Si todo está bien intenta enviar el correo con la
 * función mail() de PHP y responde { ok: true } si salió
 *
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

/**
 *
 * el correo de Futuria que recibe los mensajes
 *
 */
$destinatario = 'futuria2026@gmail.com';

/**
 *
 * si alguien entra sin enviar el formulario (por ejemplo abriendo la dirección
 * en el navegador) se le responde con el error 405 (método no permitido)
 *
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'errores' => ['Método no permitido.']], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 *
 * los tres campos del formulario, sin espacios sobrantes al inicio ni al final
 *
 */
$nombre  = trim((string)($_POST['nombre']  ?? ''));
$correo  = trim((string)($_POST['correo']  ?? ''));
$mensaje = trim((string)($_POST['mensaje'] ?? ''));

/**
 *
 * la lista de problemas que se le muestran a la persona: falta el nombre, el
 * correo no tiene forma de correo o el mensaje tiene menos de 10 letras
 *
 */
$errores = [];
if ($nombre === '')                              $errores[] = 'Escribe tu nombre.';
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) $errores[] = 'Escribe un correo válido.';
if (mb_strlen($mensaje) < 10)                    $errores[] = 'El mensaje es muy corto.';

/**
 *
 * si hubo algún problema se responde con el error 422 (datos inválidos) y la
 * lista de errores, y no se envía nada
 *
 */
if ($errores) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errores' => $errores], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 *
 * el correo que se arma: asunto fijo, el nombre, el correo y el mensaje de la
 * persona en el cuerpo
 *
 * "Reply-To" hace que al darle "responder" en Gmail la respuesta le llegue
 * directo a la persona que escribió
 *
 */
$asunto   = 'Nuevo mensaje desde Futuria';
$cuerpo   = "Nombre: $nombre\nCorreo: $correo\n\n$mensaje\n";
$cabecera = "From: Futuria <no-reply@futuria.com>\r\nReply-To: $correo\r\n";

/**
 *
 * envía el correo y responde si salió o no
 *
 * la @ evita que PHP muestre su propio aviso si el servidor no tiene correo
 * configurado; en ese caso se responde con el error 500 y un mensaje amable
 *
 */
if (@mail($destinatario, $asunto, $cuerpo, $cabecera)) {
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'errores' => ['No se pudo enviar el mensaje, intenta más tarde.']], JSON_UNESCAPED_UNICODE);
}
