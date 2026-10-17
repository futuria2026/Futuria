<?php
/* =========================================================
   FUTURIA - PÁGINA 4: productos4.php
   Devuelve en JSON los productos que se muestran en productos.html
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$productos = [
  [
    'nombre'      => 'Agenda Futuria 2026',
    'eslogan'     => 'Organiza tu año completo',
    'descripcion' => 'Agenda anual con vista semanal y mensual, espacio para metas, seguimiento de hábitos y páginas de repaso por materia. Diseñada para estudiantes de colegio y primeros semestres.',
    'caracteristicas' => ['Vista semanal y mensual', 'Seguimiento de hábitos', 'Stickers de Futuria', 'Portada personalizable'],
    'precio'      => '$65.000 COP',
    'imagenes'    => ['img/p1-1.jpg', 'img/p1-2.jpg', 'img/p1-3.jpg', 'img/p1-4.jpg'],
  ],
  [
    'nombre'      => 'Planner Semanal',
    'eslogan'     => 'Tu semana en una sola hoja',
    'descripcion' => 'Bloc desprendible de 52 hojas para planear cada semana: tareas, evaluaciones, tiempo libre y bloques de estudio con la técnica Pomodoro.',
    'caracteristicas' => ['52 hojas desprendibles', 'Bloques Pomodoro', 'Tamaño A4', 'Diseño Futuria'],
    'precio'      => '$28.000 COP',
    'imagenes'    => ['img/p2-1.jpg', 'img/p2-2.jpg', 'img/p2-3.jpg', 'img/p2-4.jpg'],
  ],
];

echo json_encode([
  'ok'        => true,
  'total'     => count($productos),
  'productos' => $productos,
], JSON_UNESCAPED_UNICODE);
