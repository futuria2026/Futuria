<?php
/**
 *
 * el carrito de compras del usuario que inició sesión. Siempre contesta en
 * JSON con el carrito completo ya actualizado
 *
 * con GET devuelve el carrito. Con POST recibe un JSON con la acción:
 * { accion: "agregar", producto_id, cantidad } suma productos,
 * { accion: "cambiar", producto_id, cantidad } pone una cantidad exacta (0 lo
 * quita), { accion: "quitar", producto_id } lo saca y { accion: "vaciar" }
 * lo deja vacío. Si nadie inició sesión responde con el error 401
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';

/**
 *
 * cuántas unidades de un mismo producto se pueden tener como máximo
 *
 */
const MAXIMO_POR_PRODUCTO = 99;

$usuario = usuario_actual();
if (!$usuario) {
    responder(['ok' => false, 'error' => 'Inicia sesión para usar el carrito.'], 401);
}

/**
 *
 * arma la respuesta con el carrito del usuario: cada producto con su nombre,
 * su primera imagen, el precio, la cantidad y el subtotal, más el total en
 * pesos y cuántos productos hay en total
 *
 */
function carrito_completo(int $usuarioId): array
{
    $consulta = bd()->prepare(
        'SELECT p.id, p.nombre, p.precio, p.imagenes, c.cantidad
           FROM carrito c
           JOIN productos p ON p.id = c.producto_id
          WHERE c.usuario_id = ?
          ORDER BY c.agregado_en, c.id'
    );
    $consulta->execute([$usuarioId]);

    $items = [];
    $total = 0;
    $cantidad = 0;
    foreach ($consulta->fetchAll() as $fila) {
        $imagenes = json_decode($fila['imagenes'], true) ?: [];
        $subtotal = (int)$fila['precio'] * (int)$fila['cantidad'];
        $items[] = [
            'producto_id'     => (int)$fila['id'],
            'nombre'          => $fila['nombre'],
            'imagen'          => $imagenes ? '../assets/img/' . $imagenes[0] : '',
            'precio'          => (int)$fila['precio'],
            'precio_texto'    => formato_precio((int)$fila['precio']),
            'cantidad'        => (int)$fila['cantidad'],
            'subtotal'        => $subtotal,
            'subtotal_texto'  => formato_precio($subtotal),
        ];
        $total += $subtotal;
        $cantidad += (int)$fila['cantidad'];
    }

    return [
        'ok'          => true,
        'items'       => $items,
        'cantidad'    => $cantidad,
        'total'       => $total,
        'total_texto' => formato_precio($total),
    ];
}

/**
 *
 * mostrar el carrito
 *
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    responder(carrito_completo($usuario['id']));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$entrada    = entrada_json();
$accion     = (string)($entrada['accion'] ?? '');
$productoId = (int)($entrada['producto_id'] ?? 0);
$cantidad   = (int)($entrada['cantidad'] ?? 1);

/**
 *
 * vaciar el carrito completo
 *
 */
if ($accion === 'vaciar') {
    bd()->prepare('DELETE FROM carrito WHERE usuario_id = ?')->execute([$usuario['id']]);
    responder(carrito_completo($usuario['id']));
}

/**
 *
 * para las demás acciones el producto tiene que existir y estar activo; si
 * no, responde con el error 404
 *
 */
$existe = bd()->prepare('SELECT 1 FROM productos WHERE id = ? AND activo = 1');
$existe->execute([$productoId]);
if (!$existe->fetchColumn()) {
    responder(['ok' => false, 'error' => 'Ese producto no existe.'], 404);
}

/**
 *
 * agregar unidades de un producto (1 si no se dice cuántas)
 *
 * si el producto ya estaba en el carrito, se suma a lo que había (ON
 * DUPLICATE KEY UPDATE), sin pasar de 99
 *
 */
if ($accion === 'agregar') {
    $cantidad = max(1, min($cantidad, MAXIMO_POR_PRODUCTO));
    bd()->prepare(
        'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE cantidad = LEAST(cantidad + VALUES(cantidad), ?)'
    )->execute([$usuario['id'], $productoId, $cantidad, MAXIMO_POR_PRODUCTO]);
    responder(carrito_completo($usuario['id']));
}

/**
 *
 * poner una cantidad exacta de un producto (de 1 a 99). Con 0 o menos el
 * producto sale del carrito
 *
 */
if ($accion === 'cambiar') {
    if ($cantidad <= 0) {
        $accion = 'quitar';
    } else {
        bd()->prepare(
            'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)'
        )->execute([$usuario['id'], $productoId, min($cantidad, MAXIMO_POR_PRODUCTO)]);
        responder(carrito_completo($usuario['id']));
    }
}

/**
 *
 * sacar un producto del carrito
 *
 */
if ($accion === 'quitar') {
    bd()->prepare('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?')->execute([$usuario['id'], $productoId]);
    responder(carrito_completo($usuario['id']));
}

responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
