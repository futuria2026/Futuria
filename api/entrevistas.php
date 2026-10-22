<?php
/**
 *
 * le entrega a la página de entrevistas la lista de profesionales
 * entrevistados en JSON, una por cada área
 *
 * los datos están escritos aquí mismo. La página los pide con fetch() y arma
 * un acordeón: cada área se abre y muestra la foto, los dos consejos y el
 * reproductor con el audio de la entrevista
 *
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 *
 * la lista de entrevistas. Cada una tiene el área, el nombre y la profesión
 * de la persona, la imagen, el audio, el consejo para quien aún no sabe qué
 * estudiar (orientacion) y el consejo para quien ya piensa en esa carrera
 *
 */
$entrevistas = [
  [
    'area'        => 'Transporte - Piloto',
    'nombre'      => 'Jacobo Román',
    'profesion'   => 'Aviación',
    'imagen'      => '../assets/img/piloto.jpg',
    'audio'       => '../assets/audio/jacobo.mp3',
    'orientacion' => 'Le diría que primero estudie algo que le guste; a mí me parece que estudiar algo que a uno no le guste es un infierno  y me he dado cuenta de que en cualquier área o cualquier campo que uno escoja, uno mismo se hace su destino',
    'carrera'     => 'SIIII.',
  ],
  [
    'area'        => 'Entretenimiento - Streamer',
    'nombre'      => 'Juan Felipe Restrepo (Ñe)',
    'profesion'   => 'Streamer - Estudiante',
    'imagen'      => '../assets/img/stremer.jpg',
    'audio'       => '../assets/audio/ñe.mp3',
    'orientacion' => '.',
    'carrera'     => 'La verdad es muy complejo, pero también trato de asimilarlo mucho con las personas que trabajan y estudian al mismo tiempo ya que la creación de contenido es como un trabajo y se le tiene que dedicar mucho tiempo para que pueda ser rentable.',
  ],
  [
    'area'        => 'Social y Humanidades - Abogado',
    'nombre'      => 'Santiago Mejía',
    'profesion'   => 'Abogado',
    'imagen'      => '../assets/img/abogado.jpg',
    'audio'       => '../assets/audio/sebastian.mp3',
    'orientacion' => 'SIIIII.',
    'carrera'     => 'Si vas a estudiar derecho, dedícate completamente, lee más de lo que te dan en clases, estudia muchos libros, busca prácticas adicionales, no te quedes con lo mínimo',
  ],
];

/**
 *
 * envía la lista con ok: true y cuántas entrevistas hay
 *
 */
echo json_encode(['ok' => true, 'total' => count($entrevistas), 'entrevistas' => $entrevistas], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
