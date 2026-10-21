<?php
/**
 *
 * le entrega a la página de productos el catálogo de Futuria en JSON, leído
 * de la tabla productos de la base de datos
 *
 * devuelve los productos en orden de id. Cada uno lleva su id
 * (para agregarlo al carrito), su precio como número y como texto
 * ("$65.000 COP"), sus características y las rutas de sus fotos
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';

/**
 *
 * los productos, convertidos al formato que usa productos.js
 *
 * el eslogan, las características y las imágenes salen de inc/catalogo.php
 * (la tabla productos no las tiene); a cada imagen se le agrega la carpeta
 * ../assets/img/
 *
 */
require __DIR__ . '/inc/catalogo.php';

$filas = bd()->query(
    'SELECT id_producto, nombre, descripcion, precio
       FROM productos
      ORDER BY id_producto'
)->fetchAll();

$productos = [];
foreach ($filas as $f) {
    $extra  = datos_extra_producto((int)$f['id_producto']);
    $precio = (int)round((float)$f['precio']);
    $productos[] = [
        'id'              => (int)$f['id_producto'],
        'nombre'          => $f['nombre'],
        'eslogan'         => $extra['eslogan'],
        'descripcion'     => $f['descripcion'],
        'caracteristicas' => $extra['caracteristicas'],
        'precio'          => formato_precio($precio),
        'precio_valor'    => $precio,
        'imagenes'        => array_map(fn($img) => '../assets/img/' . $img, $extra['imagenes']),
    ];
}

responder([
    'ok'        => true,
    'total'     => count($productos),
    'productos' => $productos,
]);
