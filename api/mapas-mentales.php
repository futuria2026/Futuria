<?php
/**
 *
 * guarda y devuelve el mapa mental de cada visitante: la lista de ideas
 * (nodos) con su texto, su color, su posición en el lienzo y de qué idea salen
 *
 * con GET ?accion=cargar devuelve el mapa guardado. Con POST
 * { accion: "guardar", nodos: [...] } reemplaza el mapa completo. Cada nodo es
 * { id, texto, color, x, y, padre }
 *
 */
declare(strict_types=1);

/**
 *
 * trae las funciones compartidas para leer y guardar los datos de la
 * persona (en su cuenta si inició sesión, o en la sesión del navegador)
 *
 */
require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

/**
 *
 * devolver el mapa. Si el visitante todavía no tiene uno, devuelve la lista
 * vacía
 *
 */
if ($metodo === 'GET') {
    $mapa = futuria_leer('mapas', ['nodos' => []]);
    futuria_responder(['ok' => true, 'nodos' => $mapa['nodos'] ?? []]);
}

/**
 *
 * guardar el mapa
 *
 * acepta como máximo 200 nodos. Descarta los que no tienen texto, corta el
 * texto a 120 letras, usa el morado #4b1c71 si el color no es un color válido
 * (#rrggbb) y convierte la posición x, y en números
 *
 */
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
