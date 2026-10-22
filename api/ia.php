<?php
/**
 *
 * el asistente "Futuria" de la página IA: recibe el mensaje que escribe la
 * persona y le devuelve la respuesta en JSON { ok, respuesta }
 *
 * guarda la conversación de cada persona (con sesión, en interacciones_ia). Si hay
 * una clave de Gemini (Google AI Studio) en config.php le pasa la
 * conversación al modelo; si no la hay, o si Gemini no responde, contesta con
 * el "modo básico", que busca palabras clave como "pomodoro" o "agenda" y
 * responde con un texto ya escrito
 *
 */
declare(strict_types=1);

/**
 *
 * trae las funciones compartidas para leer y guardar datos (futuria_leer,
 * futuria_guardar, futuria_responder, futuria_leer_json_entrada) y para leer
 * config.php (config)
 *
 */
require __DIR__ . '/inc/datos.php';

/**
 *
 * la clave de la API de Gemini (Google AI Studio), que se escribe en
 * api/inc/config.php como 'ia_api_key'. Mientras esté vacía el asistente
 * funciona en modo básico
 *
 */
define('FUTURIA_IA_API_KEY', (string)(config()['ia_api_key'] ?? ''));

/**
 *
 * los modelos de Gemini que se prueban, en orden: si el primero está
 * saturado o no responde, se usa el siguiente
 *
 * primero van dos modelos con versión fija que contestan en 1 a 3 segundos,
 * y al final los alias "latest", que Google mantiene apuntando al modelo
 * Flash más nuevo; así, si Google retira una versión fija, los alias siguen
 * funcionando. Se pueden cambiar en config.php con 'ia_modelos'
 *
 */
define('FUTURIA_IA_MODELOS', (array)(config()['ia_modelos'] ?? [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
]));

/**
 *
 * la dirección de la API de Gemini; {modelo} se cambia por el nombre de cada
 * modelo
 *
 */
const FUTURIA_IA_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent';

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
- Escribes en texto simple, sin formato Markdown: nada de asteriscos,
  numerales ni guiones para dar formato.
- No supones el género de la persona: usas palabras neutras (por ejemplo
  "te doy la bienvenida" en lugar de "bienvenido" o "bienvenida").
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
 * la conversación de este visitante
 *
 * con sesión iniciada, cada mensaje y su respuesta son una fila de la tabla
 * interacciones_ia (prompt_usuario y respuesta_ia); de ahí se leen las
 * últimas 10 para darle contexto al modelo. Sin sesión, se guardan en la
 * sesión del navegador como antes. En los dos casos se agrega el mensaje
 * nuevo y se dejan solo las últimas 20 entradas
 *
 */
$usuario = usuario_actual();

if ($usuario) {
    $previas = bd()->prepare(
        'SELECT prompt_usuario, respuesta_ia FROM interacciones_ia
          WHERE id_usuario = ? ORDER BY id_interaccion DESC LIMIT 10'
    );
    $previas->execute([$usuario['id']]);
    $historial = [];
    foreach (array_reverse($previas->fetchAll()) as $fila) {
        $historial[] = ['rol' => 'usuario', 'texto' => $fila['prompt_usuario'], 'hora' => ''];
        $historial[] = ['rol' => 'futuria', 'texto' => $fila['respuesta_ia'],   'hora' => ''];
    }
} else {
    $historial = futuria_leer('ia_chat', []);
}
$historial[] = ['rol' => 'usuario', 'texto' => $mensaje, 'hora' => date('c')];
$historial = array_slice($historial, -20);

/**
 *
 * pide la respuesta, la guarda y se la envía a la página
 *
 * con sesión iniciada se inserta una fila en interacciones_ia, enlazada con
 * el último resultado de test del usuario si tiene alguno (id_resultado)
 *
 */
$respuesta = futuria_llamar_modelo($mensaje, $historial);

if ($usuario) {
    $ultimo = bd()->prepare('SELECT id_resultado FROM resultados_test WHERE id_usuario = ? ORDER BY id_resultado DESC LIMIT 1');
    $ultimo->execute([$usuario['id']]);
    $idResultado = $ultimo->fetchColumn();
    bd()->prepare(
        'INSERT INTO interacciones_ia (id_usuario, id_resultado, prompt_usuario, respuesta_ia) VALUES (?, ?, ?, ?)'
    )->execute([$usuario['id'], $idResultado === false ? null : (int)$idResultado, $mensaje, $respuesta]);
} else {
    $historial[] = ['rol' => 'futuria', 'texto' => $respuesta, 'hora' => date('c')];
    futuria_guardar('ia_chat', $historial);
}

futuria_responder(['ok' => true, 'respuesta' => $respuesta]);

/**
 *
 * le pregunta a Gemini y devuelve su respuesta como texto
 *
 * si no hay clave o el servidor no tiene cURL (la herramienta de PHP para
 * llamar a otras páginas) responde en modo básico. Si hay clave, arma la
 * conversación: la personalidad va como instrucción de sistema y después las
 * últimas entradas de la conversación (la persona como "user" y Futuria como
 * "model") con el mensaje nuevo al final. Prueba los modelos en orden, cada
 * uno con 20 segundos como máximo: si uno está saturado, no existe o tarda
 * demasiado, pasa al siguiente; si la clave es rechazada (400, 401 o 403) no
 * sigue probando. Si ninguno responde, usa el modo básico
 *
 */
function futuria_llamar_modelo(string $mensaje, array $historial): string
{
    if (FUTURIA_IA_API_KEY === '' || !function_exists('curl_init')) {
        return futuria_modo_basico($mensaje);
    }

    $contenidos = [];
    foreach (array_slice($historial, -10, -1) as $turno) {
        $rol = $turno['rol'] === 'usuario' ? 'user' : 'model';
        if (!$contenidos && $rol === 'model') {
            continue;
        }
        $contenidos[] = ['role' => $rol, 'parts' => [['text' => (string)$turno['texto']]]];
    }
    $contenidos[] = ['role' => 'user', 'parts' => [['text' => $mensaje]]];

    $cuerpo = json_encode([
        'system_instruction' => ['parts' => [['text' => FUTURIA_PERSONA]]],
        'contents'           => $contenidos,
        'generationConfig'   => ['maxOutputTokens' => 2048, 'temperature' => 0.7],
    ], JSON_UNESCAPED_UNICODE);

    set_time_limit(120);
    foreach (FUTURIA_IA_MODELOS as $modelo) {
        $ch = curl_init(str_replace('{modelo}', rawurlencode((string)$modelo), FUTURIA_IA_URL));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $cuerpo,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 20,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . FUTURIA_IA_API_KEY,
            ],
        ]);
        $resultado = curl_exec($ch);
        $codigo    = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error     = curl_error($ch);
        curl_close($ch);

        if ($resultado !== false && $codigo === 200) {
            $texto = futuria_texto_respuesta((string)$resultado);
            if ($texto !== '') {
                return $texto;
            }
        }

        error_log("Futuria IA: el modelo $modelo respondió $codigo $error");
        if (in_array($codigo, [400, 401, 403], true)) {
            break;
        }
    }

    return futuria_modo_basico($mensaje);
}

/**
 *
 * saca el texto de la respuesta de Gemini
 *
 * la respuesta trae una lista de candidatos y cada uno trae partes; se juntan
 * las partes de texto del primero, sin las de "pensamiento" (thought). Si no
 * hay texto devuelve una cadena vacía
 *
 */
function futuria_texto_respuesta(string $json): string
{
    $datos = json_decode($json, true);
    $partes = $datos['candidates'][0]['content']['parts'] ?? [];
    $texto = '';
    foreach ($partes as $parte) {
        if (empty($parte['thought']) && isset($parte['text'])) {
            $texto .= $parte['text'];
        }
    }
    return trim($texto);
}

/**
 *
 * las respuestas del modo básico, cuando no hay modelo de IA conectado
 *
 * pasa el mensaje a minúsculas y sin tildes y busca, en este orden, las
 * palabras pomodoro, flashcard, tarjeta, mapa, agenda, vocacion, estres y
 * hola. Devuelve el texto de la primera que encuentre; si no encuentra
 * ninguna, devuelve un saludo que explica que está en modo básico
 *
 */
function futuria_modo_basico(string $mensaje): string
{
    $m = strtr(mb_strtolower($mensaje), ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u']);

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
