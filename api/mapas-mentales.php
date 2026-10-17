<?php
// ============================================================
//  FUTURIA - Backend de Mapas mentales (solo PHP, sin HTML)
//  GET  ?accion=cargar                       -> devuelve el mapa
//  POST { accion: "guardar", nodos: [...] }  -> reemplaza el mapa
//  Cada nodo: { id, texto, color, x, y, padre }
// ============================================================
declare(strict_types=1);

require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $mapa = futuria_leer('mapas', ['nodos' => []]);
    futuria_responder(['ok' => true, 'nodos' => $mapa['nodos'] ?? []]);
}

if ($metodo === 'POST') {
    $entrada = futuria_leer_json_entrada();
    $accion  = (string)($entrada['accion'] ?? '');
    $nodos   = $entrada['nodos'] ?? null;

    if ($accion !== 'guardar' || !is_array($nodos)) {
        futuria_responder(['ok' => false, 'error' => 'Datos inválidos.'], 422);
    }
    if (count($nodos) > 200) {
        futuria_responder(['ok' => false, 'error' => 'Demasiados nodos (máx. 200).'], 422);
    }

    $limpios = [];
    foreach ($nodos as $n) {
        $texto = trim((string)($n['texto'] ?? ''));
        if ($texto === '') continue;
        $limpios[] = [
            'id'     => (string)($n['id'] ?? uniqid('nd_', true)),
            'texto'  => mb_substr($texto, 0, 120),
            'color'  => preg_match('/^#[0-9a-fA-F]{6}$/', (string)($n['color'] ?? '')) ? $n['color'] : '#4b1c71',
            'x'      => (float)($n['x'] ?? 0),
            'y'      => (float)($n['y'] ?? 0),
            'padre'  => $n['padre'] !== null ? (string)$n['padre'] : null,
        ];
    }

    futuria_guardar('mapas', ['nodos' => $limpios]);
    futuria_responder(['ok' => true, 'nodos' => $limpios]);
}

futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
