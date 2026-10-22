<?php
/**
 *
 * le entrega a la página de integrantes los 8 miembros del equipo en JSON,
 * cada uno con su foto, su descripción y el personaje que lo representa
 *
 * los datos están escritos aquí mismo, no salen de una base de datos. La
 * página los pide con fetch() y al hacer clic en cada círculo cambia entre la
 * persona y su personaje
 *
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/**
 *
 * la lista del equipo. Cada integrante tiene su nombre, su foto, qué hace en
 * el proyecto y su personaje (con nombre, descripción y foto propios)
 *
 */
$integrantes = [
  [
    'nombre'      => 'Isabela M.',
    'imagen'      => '../assets/img/isabela.jpeg',
    'descripcion' => 'Diseñadora gráfica, diseña los personajes y la estructura visual y gráfica de la guía, juego, etc…',
    'animal'      => [
      'nombre'      => 'Pipo',
      'imagen'      => '../assets/img/pipo.jpeg',
      'descripcion' => 'Soy el experto en artes, me encanta trabajar con matices de luz y sombra, hacer ilustraciones coloridas y divertirme contando historias o desarrollando canciones.',
    ],
  ],
  [
    'nombre'      => 'Maria R.',
    'imagen'      => '../assets/img/maria.jpeg',
    'descripcion' => 'Redactora, revisa la adecuada estructura escrita en las cosas respecto al proyecto tales como la guía y otros textos oficiales del mismo.',
    'animal'      => [
      'nombre'      => 'Ellie',
      'imagen'      => '../assets/img/ellie.jpeg',
      'descripcion' => 'Soy la experta en ciencias sociales, si analizas la realidad, cuestionas las estructuras sociales, indagas sobre los conflictos a través del mundo y muestras empatia por los demas, definitivamente eres de los mios.',
    ],
  ],
  [
    'nombre'      => 'Estefania A.',
    'imagen'      => '../assets/img/estefania.jpeg',
    'descripcion' => 'Publicitaria, se encarga de la gestión de las redes y la parte de publicidad y marketing respecto a la marca.',
    'animal'      => [
      'nombre'      => 'Willow',
      'imagen'      => '../assets/img/willow.jpeg',
      'descripcion' => 'Soy la experta en lenguas, soy capaz de cambiar el idoma a mitad de la oración, puedo llegar todos los dias con nuevas palabras en otro idioma y soy capaz de identificar en menos de 3sg que idioma suena.',
    ],
  ],
  [
    'nombre'      => 'Carolina P.',
    'imagen'      => '../assets/img/caro.jpeg',
    'descripcion' => 'Investigadora, se dedica a buscar la información necesaria que ayude a complementar las ideas para una mejor construcción de la marca.',
    'animal'      => [
      'nombre'      => 'Copito',
      'imagen'      => '../assets/img/copito.jpeg',
      'descripcion' => 'Soy Copito la experta en ciencias naturales, siempre busco entender el "porque" de todo, buscar patrones, clasificar, experimentar y no quedarme solo en la teoria.',
    ],
  ],
  [
    'nombre'      => 'Mariana V.',
    'imagen'      => '../assets/img/mariana.jpeg',
    'descripcion' => 'Líder del equipo y programadora.',
    'animal'      => [
      'nombre'      => 'Mini',
      'imagen'      => '../assets/img/mini.jpeg',
      'descripcion' => 'Soy la experta en negocios y la administracion, disfruto pasar horas navegando y consultando sobre oportunidades en el mercado, puedo anticipar tendencias de crecimiento, amo tomar decisiones calculadas y disfruto de inspirar el equipo .',
    ],
  ],
  [
    'nombre'      => 'Paulina L.',
    'imagen'      => '../assets/img/pau.jpeg',
    'descripcion' => 'Constructora de ideas, organiza y recopila la información, brinda ideas y aportes para una mejor construcción del proyecto, programadora.',
    'animal'      => [
      'nombre'      => 'Alix',
      'imagen'      => '../assets/img/alix.jpeg',
      'descripcion' => 'Soy la experta en matemticas, me resulta facil comprender conceptos abtracto, tengo un pensamiento critico y creativo para los problemas y no me frustro rapidamente si no encuentro una respuesta inmediatamente.',
    ],
  ],
  [
    'nombre'      => 'Luciana D.',
    'imagen'      => '../assets/img/luciana.jpeg',
    'descripcion' => 'Diseñadora Ilustrativa, diseña las gráficas, imágenes y toda la parte del diseño gráfico del proyecto, programadora fronted.',
    'animal'      => [
      'nombre'      => 'Pequitas',
      'imagen'      => '../assets/img/pequitas.jpeg',
      'descripcion' => 'Soy experta en recreacion fisica, busco distraerme del estres con actividades fisicas, disfruto sentirme bien tanto fisica como mentalmente, amo la competitividad y disfruto de la compañia de los demas.',
    ],
  ],
  [
    'nombre'      => 'Juan C.',
    'imagen'      => '../assets/img/juan.jpeg',
    'descripcion' => 'Programador, aplica los lenguajes de programación en la creación de los distintos aplicativos web del proyecto.',
    'animal'      => [
      'nombre'      => 'Luka',
      'imagen'      => '../assets/img/luka.jpeg',
      'descripcion' => 'Soy el experto en artes culinarias, desde siempre me a gustado experimentar y descubrir los nuevos sabores, texturas y culturas gastronomicas, y a su vez disfruto de la estetica en los platilos.',
    ],
  ],
];

/**
 *
 * le pone a cada integrante un número de id según su posición: 1, 2, 3...
 *
 */
foreach ($integrantes as $i => $dato) {
  $integrantes[$i]['id'] = $i + 1;
}

/**
 *
 * envía la lista con ok: true
 *
 */
echo json_encode(
  ['ok' => true, 'integrantes' => $integrantes],
  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

