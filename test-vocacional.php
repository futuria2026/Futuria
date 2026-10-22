<?php
/**
 *
 * le entrega a la página de test vocacional el texto de resumen y los dos
 * tests recomendados (CHASIDE y Holland), en JSON
 *
 * los datos están escritos aquí mismo, no salen de una base de datos. La
 * página los pide con fetch() y arma una tarjeta por cada test
 *
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 *
 * convierte los datos en JSON, los envía con el código de respuesta indicado
 * (200 si todo está bien) y termina el programa
 *
 */
function responder(array $datos, int $codigo = 200): void {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

/**
 *
 * el párrafo que explica qué es un test vocacional, debajo del título de la
 * página
 *
 */
$resumen = 'El test vocacional es una herramienta de orientación que te ayuda a descubrir tus '
         . 'intereses, habilidades y aptitudes para tomar decisiones sobre tu futuro. A través '
         . 'de preguntas sobre lo que te gusta hacer, lo que se te da bien y lo que valoras, '
         . 'el test te muestra áreas profesionales que encajan contigo.';

/**
 *
 * los tests que se muestran como tarjetas. Cada uno tiene su nombre, una
 * etiqueta corta, la descripción, las etiquetas pequeñas de abajo, el texto
 * del botón, el enlace a la página externa donde se hace el test y su imagen
 *
 */
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
    'imagen'      => '../assets/img/test-vocacional-1.jpg',
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
    'imagen'      => '../assets/img/test-vocacional-2.jpg',
  ],
];

responder([
  'ok'      => true,
  'resumen' => $resumen,
  'tests'   => $tests,
]);
