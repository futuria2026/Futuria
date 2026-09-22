<?php
/* =========================================================
   FUTURIA - Backend de la página 3 (TEST VOCACIONAL)
   GET test-vocacional.php -> JSON con el resumen y los tests
   Sin HTML dentro: solo lógica y JSON.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder(array $datos, int $codigo = 200): void {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

$resumen = 'El test vocacional es una herramienta de orientación que te ayuda a descubrir tus '
         . 'intereses, habilidades y aptitudes para tomar decisiones sobre tu futuro. A través '
         . 'de preguntas sobre lo que te gusta hacer, lo que se te da bien y lo que valoras, '
         . 'el test te muestra áreas profesionales que encajan contigo.';

$tests = [
  [
    'id'          => 'chaside',
    'nombre'      => 'Test CHASIDE',
    'etiqueta'    => 'Intereses y aptitudes',
    'descripcion' => 'El test CHASIDE mide tus intereses y aptitudes en nueve áreas profesionales. '
                   . 'Responde una serie de preguntas sobre actividades que te gustan o disgustan y '
                   . 'el resultado te muestra las áreas donde tendrías mayor probabilidad de éxito y satisfacción.',
    'etiquetas'   => ['9 áreas', 'Intereses', 'Aptitudes', '~15 min'],
    'boton'       => 'Hacer el test CHASIDE',
    'enlace'      => 'https://orientacion-psicopedagogica.net/test/test-chaside/',
    'imagen'      => 'img/test-vocacional-1.jpg',
  ],
  [
    'id'          => 'holland',
    'nombre'      => 'Test de Holland (RIASEC)',
    'etiqueta'    => 'Personalidad profesional',
    'descripcion' => 'El test de Holland clasifica tu personalidad profesional en seis tipos (Realista, '
                   . 'Investigador, Artístico, Social, Emprendedor y Convencional). Conoce cuál es tu '
                   . 'código RIASEC y descubre las carreras y ocupaciones que mejor combinan con tu forma de ser.',
    'etiquetas'   => ['6 tipos', 'RIASEC', 'Carreras', '~10 min'],
    'boton'       => 'Hacer el test de Holland',
    'enlace'      => 'https://www.orientacionuniversitaria.com/test-vocacional/test-de-holland/',
    'imagen'      => 'img/test-vocacional-2.jpg',
  ],
];

responder([
  'ok'      => true,
  'resumen' => $resumen,
  'tests'   => $tests,
]);
