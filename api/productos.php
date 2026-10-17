<?php
/**
 *
 * le entrega a la página de productos el catálogo de Futuria en JSON: por
 * ahora la Agenda Futuria 2026 y el Planner Semanal
 *
 * los productos están escritos aquí mismo, no salen de una base de datos. La
 * página los pide con fetch() y arma una tarjeta con carrusel por cada uno
 *
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 *
 * la lista de productos. Cada uno tiene nombre, eslogan, descripción, la
 * lista de características (las que salen con estrellita), el precio en pesos
 * colombianos y las 4 fotos de su carrusel
 *
 */
$productos = [
  [
    'nombre'      => 'Agenda Futuria 2026',
    'eslogan'     => 'Organiza tu año completo',
    'descripcion' => 'Agenda anual con vista semanal y mensual, espacio para metas, seguimiento de hábitos y páginas de repaso por materia. Diseñada para estudiantes de colegio y primeros semestres.',
    'caracteristicas' => ['Vista semanal y mensual', 'Seguimiento de hábitos', 'Stickers de Futuria', 'Portada personalizable'],
    'precio'      => '$65.000 COP',
    'imagenes'    => ['../assets/img/p1-1.jpg', '../assets/img/p1-2.jpg', '../assets/img/p1-3.jpg', '../assets/img/p1-4.jpg'],
  ],
  [
    'nombre'      => 'Planner Semanal',
    'eslogan'     => 'Tu semana en una sola hoja',
    'descripcion' => 'Bloc desprendible de 52 hojas para planear cada semana: tareas, evaluaciones, tiempo libre y bloques de estudio con la técnica Pomodoro.',
    'caracteristicas' => ['52 hojas desprendibles', 'Bloques Pomodoro', 'Tamaño A4', 'Diseño Futuria'],
    'precio'      => '$28.000 COP',
    'imagenes'    => ['../assets/img/p2-1.jpg', '../assets/img/p2-2.jpg', '../assets/img/p2-3.jpg', '../assets/img/p2-4.jpg'],
  ],
];

/**
 *
 * envía el catálogo con ok: true y cuántos productos hay en total
 *
 */
echo json_encode([
  'ok'        => true,
  'total'     => count($productos),
  'productos' => $productos,
], JSON_UNESCAPED_UNICODE);
