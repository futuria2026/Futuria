<?php
/**
 *
 * lo que la página de productos muestra y que la tabla productos del diagrama
 * no guarda: el eslogan, la lista de características y las fotos
 *
 * la tabla productos solo tiene id_producto, id_integrante_creador, nombre,
 * tipo, descripcion y precio. Para no cambiar el diagrama, estos tres datos
 * viven aquí, por id_producto. Si se agrega un producto nuevo en la base y
 * no está en esta lista, se muestra igual, solo sin eslogan, sin
 * características y sin fotos
 *
 */
declare(strict_types=1);

/**
 *
 * los datos extra de un producto, o valores vacíos si no están en la lista
 *
 */
function datos_extra_producto(int $idProducto): array
{
    static $extra = [
        1 => [
            'eslogan'         => 'Organiza tu año completo',
            'caracteristicas' => ['Orientación vocacional', 'Métodos de estudio', 'Gestión del tiempo', 'Ilustraciones de Futuria'],
            'imagenes'        => ['p1-1.jpg', 'p1-2.jpg', 'p1-3.jpg', 'p1-4.jpg'],
        ],
        2 => [
            'eslogan'         => 'Aprende jugando',
            'caracteristicas' => ['Personajes de Futuria', 'Para jugar solo o en grupo', 'Áreas vocacionales', 'Diseño Futuria'],
            'imagenes'        => ['p2-1.jpg', 'p2-2.jpg', 'p2-3.jpg', 'p2-4.jpg'],
        ],
    ];
    return $extra[$idProducto] ?? ['eslogan' => '', 'caracteristicas' => [], 'imagenes' => []];
}
