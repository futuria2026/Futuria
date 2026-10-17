<?php
// ============================================================
//  FUTURIA - Asistente IA "Futuria" (solo PHP, sin HTML)
//  Recibe { "mensaje": "..." } por POST (JSON) desde ia.js,
//  guarda el historial de la conversación por sesión y
//  responde en JSON: { ok, respuesta }.
//
//  Para conectarlo a un modelo real:
//   1) Escribe tu API key abajo en FUTURIA_IA_API_KEY.
//   2) Si usas otro proveedor (no OpenAI), ajusta la función
//      futuria_llamar_modelo() con la URL / formato de esa API.
//  Si no hay API key configurada, el asistente responde con
//  un modo local ("modo básico") para que la página funcione
//  igual mientras conectas el modelo.
// ============================================================
declare(strict_types=1);

require __DIR__ . '/inc/datos.php';

// -------- Configuración del modelo --------
const FUTURIA_IA_API_KEY = ''; // <-- pon aquí tu API key (OpenAI, por ejemplo)
const FUTURIA_IA_MODELO  = 'gpt-4o-mini';
const FUTURIA_IA_URL     = 'https://api.openai.com/v1/chat/completions';

// Personalidad / "conciencia" de Futuria: se envía como instrucción
// de sistema en cada llamada al modelo.
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$entrada = futuria_leer_json_entrada();
$mensaje = trim((string)($entrada['mensaje'] ?? ''));

if ($mensaje === '') {
    futuria_responder(['ok' => false, 'error' => 'Escribe un mensaje.'], 422);
}
if (mb_strlen($mensaje) > 1200) {
    futuria_responder(['ok' => false, 'error' => 'Tu mensaje es muy largo (máx. 1200 caracteres).'], 422);
}

// -------- Historial por sesión (para dar contexto al modelo) --------
$historial = futuria_leer('ia_chat', []);
$historial[] = ['rol' => 'usuario', 'texto' => $mensaje, 'hora' => date('c')];
$historial = array_slice($historial, -20); // conserva las últimas 20 entradas

$respuesta = futuria_llamar_modelo($mensaje, $historial);

$historial[] = ['rol' => 'futuria', 'texto' => $respuesta, 'hora' => date('c')];
futuria_guardar('ia_chat', $historial);

futuria_responder(['ok' => true, 'respuesta' => $respuesta]);

// ============================================================
//  Funciones
// ============================================================

/** Llama al modelo de lenguaje configurado, o responde en modo básico. */
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
 * Respuestas de respaldo (sin API), para que el asistente funcione
 * mientras se conecta un modelo real. Reconoce algunas palabras clave
 * relacionadas con las herramientas del sitio.
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
