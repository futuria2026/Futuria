<?php
/**
 *
 * el catálogo de productos de Futuria, leído y administrado en la tabla
 * productos de la base de datos
 *
 * con GET (público) devuelve los productos en orden de id, cada uno con su id
 * (para agregarlo al carrito), su tipo, su precio como número y como texto
 * ("$65.000 COP"), sus características y las rutas de sus fotos
 *
 * con POST (solo administradores) recibe un JSON con la acción:
 * { accion: "crear", nombre, tipo, descripcion, precio },
 * { accion: "actualizar", id, nombre, tipo, descripcion, precio } o
 * { accion: "eliminar", id }. Después de cada cambio devuelve la lista
 * completa ya actualizada
 *
 */
declare(strict_types=1);

require __DIR__ . '/inc/app.php';

/**
 *
 * el eslogan, las características y las imágenes salen de inc/catalogo.php
 * (la tabla productos no las tiene); a cada imagen se le agrega la carpeta
 * ../assets/img/
 *
 */
require __DIR__ . '/inc/catalogo.php';

/**
 *
 * los tipos de producto que acepta la columna "tipo" de la tabla
 *
 */
const TIPOS_PRODUCTO = ['Plantilla', 'Guia', 'Software', 'Curso'];

/**
 *
 * los productos de la base, convertidos al formato que usa productos.js
 *
 */
function lista_productos(): array
{
    $filas = bd()->query(
        'SELECT id_producto, nombre, tipo, descripcion, precio
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
            'tipo'            => $f['tipo'],
            'eslogan'         => $extra['eslogan'],
            'descripcion'     => $f['descripcion'],
            'caracteristicas' => $extra['caracteristicas'],
            'precio'          => formato_precio($precio),
            'precio_valor'    => $precio,
            'imagenes'        => array_map(fn($img) => '../assets/img/' . $img, $extra['imagenes']),
        ];
    }
    return $productos;
}

/**
 *
 * arma la respuesta con la lista completa
 *
 */
function respuesta_lista(int $codigo = 200): void
{
    $productos = lista_productos();
    responder(['ok' => true, 'total' => count($productos), 'productos' => $productos], $codigo);
}

/**
 *
 * READ: mostrar el catálogo (lo puede ver cualquiera)
 *
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respuesta_lista();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

/**
 *
 * CREATE, UPDATE y DELETE: solo administradores
 *
 */
requerir_admin();

$entrada = entrada_json();
$accion  = (string)($entrada['accion'] ?? '');

/**
 *
 * crear o actualizar un producto
 *
 * el nombre es obligatorio (hasta 100 letras), el tipo tiene que ser uno de
 * la lista y el precio un número de 0 en adelante
 *
 */
if ($accion === 'crear' || $accion === 'actualizar') {
    $nombre      = trim((string)($entrada['nombre'] ?? ''));
    $tipo        = (string)($entrada['tipo'] ?? '');
    $descripcion = trim((string)($entrada['descripcion'] ?? ''));
    $precio      = $entrada['precio'] ?? null;

    if ($nombre === '' || mb_strlen($nombre) > 100) {
        responder(['ok' => false, 'error' => 'El nombre es obligatorio (máximo 100 caracteres).'], 422);
    }
    if (!in_array($tipo, TIPOS_PRODUCTO, true)) {
        responder(['ok' => false, 'error' => 'Tipo de producto no válido.'], 422);
    }
    if (!is_numeric($precio) || (float)$precio < 0 || (float)$precio > 99999999) {
        responder(['ok' => false, 'error' => 'El precio no es válido.'], 422);
    }
    $precio = round((float)$precio, 2);

    if ($accion === 'crear') {
        bd()->prepare('INSERT INTO productos (nombre, tipo, descripcion, precio) VALUES (?, ?, ?, ?)')
            ->execute([$nombre, $tipo, $descripcion, $precio]);
        respuesta_lista(201);
    }

    $id = (int)($entrada['id'] ?? 0);
    $existe = bd()->prepare('SELECT 1 FROM productos WHERE id_producto = ?');
    $existe->execute([$id]);
    if (!$existe->fetchColumn()) {
        responder(['ok' => false, 'error' => 'Ese producto no existe.'], 404);
    }
    bd()->prepare('UPDATE productos SET nombre = ?, tipo = ?, descripcion = ?, precio = ? WHERE id_producto = ?')
        ->execute([$nombre, $tipo, $descripcion, $precio, $id]);
    respuesta_lista();
}

/**
 *
 * eliminar un producto. Como la tabla productos_usuarios lo referencia con
 * ON DELETE CASCADE, también desaparece de los carritos que lo tenían
 *
 */
if ($accion === 'eliminar') {
    $id = (int)($entrada['id'] ?? 0);
    $existe = bd()->prepare('SELECT 1 FROM productos WHERE id_producto = ?');
    $existe->execute([$id]);
    if (!$existe->fetchColumn()) {
        responder(['ok' => false, 'error' => 'Ese producto no existe.'], 404);
    }
    bd()->prepare('DELETE FROM productos WHERE id_producto = ?')->execute([$id]);
    respuesta_lista();
}

responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);

responder([
    'ok'        => true,
    'total'     => count($productos),
    'productos' => $productos,
]);
