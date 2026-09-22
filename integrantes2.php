<?php
/* =========================================================
   FUTURIA - Backend de la PÁGINA 2 (INTEGRANTES)
   Devuelve en JSON los 8 integrantes con su persona y su animal.
   Uso:  fetch('integrantes2.php')  desde pagina2.js
   Imágenes personas: img/2.jpg ... img/9.jpg
   Imágenes animales: img/10.jpg ... img/17.jpg
   ========================================================= */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$integrantes = [
  [
    'nombre'      => 'Isabela M.',
    'imagen'      => 'img/2.jpg',
    'descripcion' => 'Líder creativa del equipo: coordinó la identidad visual de Futuria y definió la paleta y el logo del zorro. Le encanta transformar ideas sueltas en piezas gráficas claras.',
    'animal'      => [
      'nombre'      => 'Zorra Aurora',
      'descripcion' => 'Astuta y visionaria, siempre encuentra el camino corto hacia una buena idea. Representa la chispa creativa que abre cada proyecto de Futuria.',
      'imagen'      => 'img/10.jpg',
    ],
  ],
  [
    'nombre'      => 'Maria R.',
    'imagen'      => 'img/3.jpg',
    'descripcion' => 'Encargada de la investigación vocacional: diseñó las preguntas del test y estudió los perfiles de interés de los estudiantes para que cada resultado tenga sentido.',
    'animal'      => [
      'nombre'      => 'Búho Sabio',
      'descripcion' => 'Observador y paciente, analiza antes de decidir. Simboliza la investigación cuidadosa detrás de cada recomendación vocacional.',
      'imagen'      => 'img/11.jpg',
    ],
  ],
  [
    'nombre'      => 'Estefania A.',
    'imagen'      => 'img/4.jpg',
    'descripcion' => 'Responsable de pre-prensa y diagramación: preparó los folletos, revisó márgenes, tipografías y colores para que todo se imprima impecable.',
    'animal'      => [
      'nombre'      => 'Abeja Meticulosa',
      'descripcion' => 'Ordenada y constante, cuida cada detalle del panal. Representa el trabajo minucioso que hace que lo impreso quede perfecto.',
      'imagen'      => 'img/12.jpg',
    ],
  ],
  [
    'nombre'      => 'Carolina P.',
    'imagen'      => 'img/5.jpg',
    'descripcion' => 'Community manager del proyecto: administra las redes de Futuria, escribe los textos de las publicaciones y responde a los estudiantes que escriben.',
    'animal'      => [
      'nombre'      => 'Delfín Sociable',
      'descripcion' => 'Comunicativo y alegre, se entiende con todos. Es la voz cercana de Futuria en cada mensaje y comentario.',
      'imagen'      => 'img/13.jpg',
    ],
  ],
  [
    'nombre'      => 'Mariana V.',
    'imagen'      => 'img/6.jpg',
    'descripcion' => 'Especialista en gestión del tiempo: construyó la agenda inteligente y las plantillas de horarios que ayudan a organizar semanas de estudio reales.',
    'animal'      => [
      'nombre'      => 'Colibrí Puntual',
      'descripcion' => 'Rápido y preciso, aprovecha cada segundo sin agotarse. Encarna la buena administración del tiempo que propone Futuria.',
      'imagen'      => 'img/14.jpg',
    ],
  ],
  [
    'nombre'      => 'Paulina L.',
    'imagen'      => 'img/7.jpg',
    'descripcion' => 'Encargada de los métodos de estudio: recopiló técnicas como Pomodoro, mapas mentales y repaso espaciado, y las adaptó al ritmo del colegio.',
    'animal'      => [
      'nombre'      => 'Ardilla Estratega',
      'descripcion' => 'Guarda y organiza todo para el momento justo. Representa los métodos que convierten el repaso en un hábito sencillo.',
      'imagen'      => 'img/15.jpg',
    ],
  ],
  [
    'nombre'      => 'Luciana D.',
    'imagen'      => 'img/8.jpg',
    'descripcion' => 'Responsable de las entrevistas: contactó a profesionales y estudiantes para recoger sus historias y mostrar caminos vocacionales distintos.',
    'animal'      => [
      'nombre'      => 'Gata Curiosa',
      'descripcion' => 'Atenta y preguntona, se acerca a lo desconocido sin miedo. Simboliza la curiosidad que da vida a cada entrevista.',
      'imagen'      => 'img/16.jpg',
    ],
  ],
  [
    'nombre'      => 'Juan C.',
    'imagen'      => 'img/9.jpg',
    'descripcion' => 'Desarrollador del sitio y de la sección de IA: programó la página, el formulario de contacto y el asistente que orienta a los estudiantes.',
    'animal'      => [
      'nombre'      => 'Lobo Técnico',
      'descripcion' => 'Resistente y trabajador en equipo, sostiene la manada. Representa la parte técnica que mantiene Futuria funcionando.',
      'imagen'      => 'img/17.jpg',
    ],
  ],
];

foreach ($integrantes as $i => $dato) {
  $integrantes[$i]['id'] = $i + 1;
}

echo json_encode(
  ['ok' => true, 'integrantes' => $integrantes],
  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
