<?php
/**
 *
 * le entrega a la página de test vocacional el texto de resumen y los
 * tests recomendados (Filadd, EduMatch y TestLibrary), en JSON
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
    'id'          => 'filadd',
    'nombre'      => 'Test vocacional Filadd',
    'etiqueta'    => 'Tu carrera ideal',
    'descripcion' => 'Test vocacional interactivo y gratuito pensado para estudiantes colombianos. En '
                   . 'menos de 8 minutos te sugiere carreras que van contigo y te muestra universidades '
                   . 'donde podrías estudiarlas.',
    'etiquetas'   => ['Gratis', '~8 min', 'Carreras', 'Universidades'],
    'boton'       => 'Hacer el test de Filadd',
    'enlace'      => 'https://test-vocacional.filadd.com.co/?hl=es-US',
    'imagen'      => '../assets/img/test-vocacional-3.jpg',
  ],
  [
    'id'          => 'edumatch',
    'nombre'      => 'Test EduMatch',
    'etiqueta'    => 'Carreras y universidades',
    'descripcion' => 'EduMatch combina un test vocacional online gratuito con tus preferencias de estudio '
                   . '(presencial o en línea, duración y horarios) para mostrarte carreras y universidades '
                   . 'que encajan con tu perfil. Pide crear una cuenta con tu nombre y correo.',
    'etiquetas'   => ['Gratis', 'Preferencias', 'Universidades', 'Requiere cuenta'],
    'boton'       => 'Hacer el test de EduMatch',
    'enlace'      => 'https://www.cursosycarreras.co/test_vocacional_orientacion_vocacional.php?hl=es-US',
    'imagen'      => '../assets/img/test-vocacional-4.jpg',
  ],
  [
    'id'          => 'testlibrary',
    'nombre'      => 'Test de orientación profesional TestLibrary',
    'etiqueta'    => 'De pago',
    'descripcion' => 'Test de orientación profesional en línea de TestLibrary para explorar carreras '
                   . 'acordes a tu perfil. Es un servicio de pago, así que revisa el costo en su página '
                   . 'antes de empezar.',
    'etiquetas'   => ['De pago', 'En línea', 'Carreras'],
    'boton'       => 'Ir al test de TestLibrary',
    'enlace'      => 'https://testlibrary.com/es/career-test/',
    'imagen'      => '../assets/img/test-vocacional-5.jpg',
  ],
];

responder([
  'ok'      => true,
  'resumen' => $resumen,
  'tests'   => $tests,
]);
