<?php
/**
 *
 * guarda y lee los datos de las herramientas (Pomodoro, Flashcards, Mapas
 * mentales, Agenda y el chat de la IA). Lo usan pomodoro.php, flashcards.php,
 * mapas-mentales.php, agenda.php e ia.php
 *
 * si la persona inició sesión, los datos se guardan en la tabla
 * herramientas_datos de la base, en su cuenta, y siguen ahí cuando vuelva a
 * entrar desde cualquier navegador. Si no inició sesión, se guardan en la
 * sesión de PHP y duran mientras el navegador esté abierto. Cada herramienta
 * guarda todos sus datos juntos, como un JSON, bajo su propia clave
 * ("pomodoro", "flashcards", "mapas", "agenda" o "ia_chat")
 *
 */
declare(strict_types=1);

require __DIR__ . '/app.php';

/**
 *
 * los datos guardados de una herramienta, o los datos por defecto si
 * todavía no hay nada guardado
 *
 */
function futuria_leer(string $clave, array $defecto): array
{
    $usuario = usuario_actual();
    if (!$usuario) {
        return $_SESSION['herramientas'][$clave] ?? $defecto;
    }

    $consulta = bd()->prepare('SELECT datos FROM herramientas_datos WHERE id_usuario = ? AND herramienta = ?');
    $consulta->execute([$usuario['id'], $clave]);
    $json = $consulta->fetchColumn();
    if ($json === false) {
        return $defecto;
    }
    $datos = json_decode((string)$json, true);
    return is_array($datos) ? $datos : $defecto;
}

/**
 *
 * guarda todos los datos de una herramienta, reemplazando los que había
 *
 * con sesión iniciada los guarda en la base (si ya había una fila para esa
 * herramienta la actualiza, con ON DUPLICATE KEY UPDATE); sin sesión, en la
 * sesión de PHP
 *
 */
function futuria_guardar(string $clave, array $datos): void
{
    $usuario = usuario_actual();
    if (!$usuario) {
        $_SESSION['herramientas'][$clave] = $datos;
        return;
    }

    bd()->prepare(
        'INSERT INTO herramientas_datos (id_usuario, herramienta, datos) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE datos = VALUES(datos)'
    )->execute([$usuario['id'], $clave, json_encode($datos, JSON_UNESCAPED_UNICODE)]);
}

/**
 *
 * responde en JSON con el código indicado y termina el programa (es la
 * función responder() de app.php con el nombre que usan las herramientas)
 *
 */
function futuria_responder(array $datos, int $codigo = 200): void
{
    responder($datos, $codigo);
}

/**
 *
 * el cuerpo de la petición, que llega en JSON, convertido en lista (es la
 * función entrada_json() de app.php con el nombre que usan las herramientas)
 *
 */
function futuria_leer_json_entrada(): array
{
    return entrada_json();
}
