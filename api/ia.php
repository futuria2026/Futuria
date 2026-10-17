<?php
/**
 *
 * el asistente "Futuria" de la página IA: recibe el mensaje que escribe la
 * persona y le devuelve la respuesta en JSON { ok, respuesta }
 *
 * guarda las últimas 20 entradas de la conversación de cada visitante. Si hay
 * una clave de OpenAI configurada le pasa la conversación al modelo
 * gpt-4o-mini; si no la hay, o si la llamada falla, responde con el "modo
 * básico", que busca palabras clave como "pomodoro" o "agenda" y contesta con
 * un texto ya escrito
 *
 */
declare(strict_types=1);

/**
 *
 * trae las funciones compartidas para leer y guardar datos por visitante
 * (futuria_leer, futuria_guardar, futuria_responder, futuria_leer_json_entrada)
 *
 */
require __DIR__ . '/inc/datos.php';

/**
 *
 * la clave de la API de OpenAI. Mientras esté vacía el asistente funciona en
 * modo básico
 *
 */
const FUTURIA_IA_API_KEY = '';

/**
 *
 * el modelo de inteligencia artificial que se usa y la dirección de la API a
 * la que se le envían los mensajes
 *
 */
const FUTURIA_IA_MODELO  = 'gpt-4o-mini';
const FUTURIA_IA_URL     = 'https://api.openai.com/v1/chat/completions';

/**
 *
 * la personalidad de Futuria: cómo debe hablar, en qué ayuda y qué no debe
 * hacer
 *
 * se le envía al modelo al inicio de cada conversación como instrucción de
 * sistema (el mensaje que el modelo siempre obedece)
 *
 */
const FUTURIA_PERSONA = <<<TXT
Eres "Futuria", la inteligencia artificial y guía del sitio web Futuria.
Futuria acompaña a estudiantes de bachillerato en su orientación vocacional,
gestión del tiempo y métodos de estudio (Pomodoro, Flashcards, Mapas
mentales y Agenda escolar).

Tu forma de ser:
- Hablas siempre en español, con un tono cercano, cálido y motivador, como
  una guía mayor que acompaña sin sermonear.
- Te presentas como Futuria cuando te saludan por primera vez.
- Ayudas con: dudas vocacionales, técnicas de estudio, organización del
  tiempo, motivación y cómo usar las herramientas del sitio (Pomodoro,
  Flashcards, Mapas mentales, Agenda).
- Cuando sea útil, invitas a la persona a probar la herramienta relacionada
  (por ejemplo: "puedes practicarlo en nuestra sección de Flashcards").
- Eres honesta: si no sabes algo, lo dices, y nunca inventas datos médicos,
  legales o académicos oficiales.
- Respuestas breves y claras (máximo un par de párrafos), salvo que te
  pidan explícitamente más detalle.
- Nunca rompes tu personaje ni dices que eres "solo un modelo de lenguaje
  genérico"; eres Futuria, la asistente de este sitio.
TXT;

header('Content-Type: application/json; charset=utf-8');

/**
 *
 * solo se aceptan mensajes enviados con POST; si no, error 405
 *
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

/**
 *
 * el mensaje que escribió la persona. Si está vacío o pasa de 1200 caracteres
 * se responde con el error 422 y no se le pregunta nada al modelo
 *
 */
$entrada = futuria_leer_json_entrada();
$mensaje = trim((string)($entrada['mensaje'] ?? ''));

if ($mensaje === '') {
    futuria_responder(['ok' => false, 'error' => 'Escribe un mensaje.'], 422);
}
if (mb_strlen($mensaje) > 1200) {
    futuria_responder(['ok' => false, 'error' => 'Tu mensaje es muy largo (máx. 1200 caracteres).'], 422);
}

/**
 *
 * la conversación de este visitante: se agrega el mensaje nuevo y se dejan
 * solo las últimas 20 entradas
 *
 */
$historial = futuria_leer('ia_chat', []);
$historial[] = ['rol' => 'usuario', 'texto' => $mensaje, 'hora' => date('c')];
$historial = array_slice($historial, -20);

/**
 *
 * pide la respuesta, la agrega a la conversación, guarda todo y se la envía
 * a la página
 *
 */
$respuesta = futuria_llamar_modelo($mensaje, $historial);

$historial[] = ['rol' => 'futuria', 'texto' => $respuesta, 'hora' => date('c')];
futuria_guardar('ia_chat', $historial);

futuria_responder(['ok' => true, 'respuesta' => $respuesta]);

/**
 *
 * le pregunta al modelo de OpenAI y devuelve su respuesta como texto
 *
 * si no hay clave o el servidor no tiene cURL (la herramienta de PHP para
 * llamar a otras páginas) responde en modo básico. Si hay clave, arma la
 * lista de mensajes: primero la personalidad, después las últimas entradas de
 * la conversación y al final el mensaje nuevo. Pide como máximo 400 tokens
 * (pedazos de palabra) y espera hasta 25 segundos. Si la llamada falla o
 * llega sin texto, también responde en modo básico
 *
 */
function futuria_llamar_modelo(string $mensaje, array $historial): string
{
    if (FUTURIA_IA_API_KEY === '' || !function_exists('curl_init')) {
        return futuria_modo_basico($mensaje);
    }

    $mensajes = [['role' => 'system', 'content' => FUTURIA_PERSONA]];
    foreach (array_slice($historial, -10, -1) as $turno) {
        $mensajes[] = [
            'role'    => $turno['rol'] === 'usuario' ? 'user' : 'assistant',
            'content' => (string)$turno['texto'],
        ];
    }
    $mensajes[] = ['role' => 'user', 'content' => $mensaje];

    $cuerpo = json_encode([
        'model'       => FUTURIA_IA_MODELO,
        'messages'    => $mensajes,
        'max_tokens'  => 400,
        'temperature' => 0.7,
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init(FUTURIA_IA_URL);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $cuerpo,
        CURLOPT_TIMEOUT        => 25,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . FUTURIA_IA_API_KEY,
        ],
    ]);
    $resultado = curl_exec($ch);
    $error     = curl_error($ch);
    curl_close($ch);

    if ($resultado === false || $error !== '') {
        return futuria_modo_basico($mensaje);
    }

    $json = json_decode($resultado, true);
    $texto = $json['choices'][0]['message']['content'] ?? null;

    return $texto !== null ? trim($texto) : futuria_modo_basico($mensaje);
}

/**
 *
 * las respuestas del modo básico, cuando no hay modelo de IA conectado
 *
 * pasa el mensaje a minúsculas y busca, en este orden, las palabras pomodoro,
 * flashcard, tarjeta, mapa, agenda, vocacion, estres y hola. Devuelve el texto
 * de la primera que encuentre; si no encuentra ninguna, devuelve un saludo que
 * explica que está en modo básico
 *
 */
function futuria_modo_basico(string $mensaje): string
{
    $m = mb_strtolower($mensaje);

    $reglas = [
        'pomodoro'  => 'El método Pomodoro divide tu estudio en bloques de 25 minutos con descansos de 5. Puedes usar el temporizador real en nuestra sección de Pomodoro. ¿Quieres que te explique cómo armar tu primer bloque de estudio?',
        'flashcard' => 'Las Flashcards son tarjetas de pregunta-respuesta para memoria activa: repasa lo que fallas más seguido y lo que dominas déjalo descansar un poco. Puedes crear tu propio mazo en la sección de Flashcards.',
        'tarjeta'   => 'Las tarjetas (flashcards) funcionan mejor si las repasas en sesiones cortas y frecuentes. Puedes crear las tuyas en la sección de Flashcards del sitio.',
        'mapa'      => 'Un mapa mental empieza con una idea central y de ahí se abren ramas con subtemas y palabras clave. Puedes construir el tuyo en la sección de Mapas mentales.',
        'agenda'    => 'La Agenda escolar te ayuda a anotar tareas con día, fecha y hora para que nada se te olvide. Puedes organizarla en la sección de Agenda.',
        'vocacion'  => 'Para tu orientación vocacional, piensa en qué actividades te hacen perder la noción del tiempo y qué problemas te gustaría resolver en el mundo. Esa combinación suele ser una buena pista sobre tu vocación.',
        'estres'    => 'Si sientes estrés por los estudios, prueba dividir tus tareas en bloques pequeños (Pomodoro) y date descansos reales. No tienes que resolverlo todo en un solo día.',
        'hola'      => '¡Hola! Soy Futuria, tu guía para orientación vocacional, estudio y organización del tiempo. Cuéntame qué necesitas: ¿tienes dudas sobre tu vocación, quieres mejorar tus hábitos de estudio, u organizar tu agenda?',
    ];

    foreach ($reglas as $clave => $texto) {
        if (mb_strpos($m, $clave) !== false) {
            return $texto;
        }
    }

    return "Soy Futuria 🌙 Todavía estoy en modo básico porque esta instancia no tiene una API de IA conectada, "
         . "pero puedo orientarte sobre nuestros métodos (Pomodoro, Flashcards, Mapas mentales, Agenda) y sobre "
         . "orientación vocacional. Cuéntame un poco más sobre lo que necesitas.";
}
