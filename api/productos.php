<?php
/**
 *
 * le entrega a la página de productos el catálogo de Futuria en JSON, leído
 * de la tabla productos de la base de datos
 *
 * solo devuelve los productos activos, en orden de id. Cada uno lleva su id
 * (para agregarlo al carrito), su precio como número y como texto
 * ("$65.000 COP"), sus características y las rutas de sus fotos
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';

/**
 *
 * los productos activos, convertidos al formato que usa productos.js
 *
 * las características y las imágenes están guardadas como JSON en la base;
 * aquí se convierten en listas y a cada imagen se le agrega la carpeta
 * ../assets/img/
 *
 */
$filas = bd()->query(
    'SELECT id, nombre, eslogan, descripcion, caracteristicas, precio, imagenes
       FROM productos
      WHERE activo = 1
      ORDER BY id'
)->fetchAll();

$productos = [];
foreach ($filas as $f) {
    $productos[] = [
        'id'              => (int)$f['id'],
        'nombre'          => $f['nombre'],
        'eslogan'         => $f['eslogan'],
        'descripcion'     => $f['descripcion'],
        'caracteristicas' => json_decode($f['caracteristicas'], true) ?: [],
        'precio'          => formato_precio((int)$f['precio']),
        'precio_valor'    => (int)$f['precio'],
        'imagenes'        => array_map(fn($img) => '../assets/img/' . $img, json_decode($f['imagenes'], true) ?: []),
    ];
}

responder([
    'ok'        => true,
    'total'     => count($productos),
    'productos' => $productos,
]);
