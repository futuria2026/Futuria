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
 * el carrito se guarda en la tabla productos_usuarios del diagrama, con una
 * fila por cada unidad: 3 libros son 3 filas del mismo id_producto. La
 * cantidad de un producto es cuántas filas tiene
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';
require __DIR__ . '/inc/catalogo.php';

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
        'SELECT p.id_producto, p.nombre, p.precio, COUNT(*) AS cantidad, MIN(pu.id_adquisicion) AS orden
           FROM productos_usuarios pu
           JOIN productos p ON p.id_producto = pu.id_producto
          WHERE pu.id_usuario = ?
          GROUP BY p.id_producto, p.nombre, p.precio
          ORDER BY orden'
    );
    $consulta->execute([$usuarioId]);

    $items = [];
    $total = 0;
    $cantidad = 0;
    foreach ($consulta->fetchAll() as $fila) {
        $imagenes = datos_extra_producto((int)$fila['id_producto'])['imagenes'];
        $precio   = (int)round((float)$fila['precio']);
        $subtotal = $precio * (int)$fila['cantidad'];
        $items[] = [
            'producto_id'     => (int)$fila['id_producto'],
            'nombre'          => $fila['nombre'],
            'imagen'          => $imagenes ? '../assets/img/' . $imagenes[0] : '',
            'precio'          => $precio,
            'precio_texto'    => formato_precio($precio),
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
    bd()->prepare('DELETE FROM productos_usuarios WHERE id_usuario = ?')->execute([$usuario['id']]);
    responder(carrito_completo($usuario['id']));
}

/**
 *
 * para las demás acciones el producto tiene que existir; si no, responde con el error 404
 *
 */
$existe = bd()->prepare('SELECT 1 FROM productos WHERE id_producto = ?');
$existe->execute([$productoId]);
if (!$existe->fetchColumn()) {
    responder(['ok' => false, 'error' => 'Ese producto no existe.'], 404);
}

/**
 *
 * cuántas unidades de este producto tiene ya el usuario (cuántas filas)
 *
 */
function unidades_en_carrito(int $usuarioId, int $productoId): int
{
    $c = bd()->prepare('SELECT COUNT(*) FROM productos_usuarios WHERE id_usuario = ? AND id_producto = ?');
    $c->execute([$usuarioId, $productoId]);
    return (int)$c->fetchColumn();
}

/**
 *
 * deja el producto con exactamente esa cantidad de unidades (de 0 a 99):
 * agrega las filas que falten o borra las que sobren (las más recientes).
 * Todo en una transacción para que nunca quede a medias
 *
 */
function fijar_unidades(int $usuarioId, int $productoId, int $meta): void
{
    $meta = max(0, min($meta, MAXIMO_POR_PRODUCTO));
    $pdo  = bd();
    $pdo->beginTransaction();
    try {
        $actual = unidades_en_carrito($usuarioId, $productoId);
        if ($meta > $actual) {
            $nueva = $pdo->prepare('INSERT INTO productos_usuarios (id_usuario, id_producto) VALUES (?, ?)');
            for ($i = $actual; $i < $meta; $i++) {
                $nueva->execute([$usuarioId, $productoId]);
            }
        } elseif ($meta < $actual) {
            $sobran = $actual - $meta;
            $pdo->prepare(
                "DELETE FROM productos_usuarios
                  WHERE id_usuario = ? AND id_producto = ?
                  ORDER BY id_adquisicion DESC
                  LIMIT $sobran"
            )->execute([$usuarioId, $productoId]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        responder(['ok' => false, 'error' => 'No se pudo actualizar el carrito.'], 500);
    }
}

/**
 *
 * agregar unidades de un producto (1 si no se dice cuántas)
 *
 * se suman a las que ya había, sin pasar de 99
 *
 */
if ($accion === 'agregar') {
    $cantidad = max(1, min($cantidad, MAXIMO_POR_PRODUCTO));
    fijar_unidades($usuario['id'], $productoId, unidades_en_carrito($usuario['id'], $productoId) + $cantidad);
    responder(carrito_completo($usuario['id']));
}

/**
 *
 * poner una cantidad exacta de un producto (de 1 a 99). Con 0 o menos el
 * producto sale del carrito
 *
 */
if ($accion === 'cambiar') {
    fijar_unidades($usuario['id'], $productoId, max(0, $cantidad));
    responder(carrito_completo($usuario['id']));
}

/**
 *
 * sacar un producto del carrito
 *
 */
if ($accion === 'quitar') {
    fijar_unidades($usuario['id'], $productoId, 0);
    responder(carrito_completo($usuario['id']));
}

responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
