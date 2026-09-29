<?php
// ============================================================
//  FUTURIA - Backend de Flashcards (solo PHP, sin HTML)
//  GET  ?accion=cargar                         -> devuelve el mazo
//  POST { accion: "guardar", tarjetas: [...] } -> reemplaza el mazo
// ============================================================
declare(strict_types=1);

require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $mazo = futuria_leer('flashcards', ['tarjetas' => []]);
    futuria_responder(['ok' => true, 'tarjetas' => $mazo['tarjetas'] ?? []]);
}

if ($metodo === 'POST') {
    $entrada  = futuria_leer_json_entrada();
    $accion   = (string)($entrada['accion'] ?? '');
    $tarjetas = $entrada['tarjetas'] ?? null;

    if ($accion !== 'guardar' || !is_array($tarjetas)) {
        futuria_responder(['ok' => false, 'error' => 'Datos inválidos.'], 422);
    }
    if (count($tarjetas) > 300) {
        futuria_responder(['ok' => false, 'error' => 'Demasiadas tarjetas (máx. 300).'], 422);
    }

    $limpias = [];
    foreach ($tarjetas as $t) {
        $pregunta  = trim((string)($t['pregunta'] ?? ''));
        $respuesta = trim((string)($t['respuesta'] ?? ''));
        if ($pregunta === '' || $respuesta === '') continue;
        $limpias[] = [
            'id'        => (string)($t['id'] ?? uniqid('tc_', true)),
            'pregunta'  => mb_substr($pregunta, 0, 300),
            'respuesta' => mb_substr($respuesta, 0, 500),
            'dominada'  => (bool)($t['dominada'] ?? false),
        ];
    }

    futuria_guardar('flashcards', ['tarjetas' => $limpias]);
    futuria_responder(['ok' => true, 'tarjetas' => $limpias]);
}

futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
