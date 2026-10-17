<?php
/**
 *
 * guarda y devuelve las tareas de la agenda escolar de cada visitante, cada
 * una con su fecha, su hora y el texto de la tarea
 *
 * con GET ?accion=listar devuelve todas las tareas. Con POST
 * { accion: "agregar", fecha, hora, texto } agrega una y con
 * { accion: "eliminar", id } borra una. Después de cada cambio devuelve la
 * lista completa ya actualizada
 *
 */
declare(strict_types=1);

/**
 *
 * trae las funciones compartidas para leer y guardar los datos de la
 * persona (en su cuenta si inició sesión, o en la sesión del navegador)
 *
 */
require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

/**
 *
 * devolver todas las tareas guardadas
 *
 */
if ($metodo === 'GET') {
    $agenda = futuria_leer('agenda', ['tareas' => []]);
    futuria_responder(['ok' => true, 'tareas' => $agenda['tareas'] ?? []]);
}

/**
 *
 * agregar o eliminar una tarea, según la acción que llegue
 *
 */
if ($metodo === 'POST') {
    $entrada = futuria_leer_json_entrada();
    $accion  = (string)($entrada['accion'] ?? '');
    $agenda  = futuria_leer('agenda', ['tareas' => []]);
    $tareas  = $agenda['tareas'] ?? [];

    /**
     *
     * agregar una tarea nueva
     *
     * la fecha tiene que venir como AAAA-MM-DD y el texto no puede estar
     * vacío. La hora es opcional (HH:MM); si viene mal se guarda vacía. Se
     * aceptan como máximo 500 tareas y el texto se corta a 200 letras. Cada
     * tarea recibe un id único que empieza con "tk_"
     *
     */
    if ($accion === 'agregar') {
        $fecha = (string)($entrada['fecha'] ?? '');
        $hora  = (string)($entrada['hora']  ?? '');
        $texto = trim((string)($entrada['texto'] ?? ''));

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            futuria_responder(['ok' => false, 'error' => 'Fecha inválida.'], 422);
        }
        if ($texto === '') {
            futuria_responder(['ok' => false, 'error' => 'Escribe la tarea.'], 422);
        }
        if (count($tareas) >= 500) {
            futuria_responder(['ok' => false, 'error' => 'Límite de tareas alcanzado.'], 422);
        }

        $tareas[] = [
            'id'    => uniqid('tk_', true),
            'fecha' => $fecha,
            'hora'  => preg_match('/^\d{2}:\d{2}$/', $hora) ? $hora : '',
            'texto' => mb_substr($texto, 0, 200),
        ];
        futuria_guardar('agenda', ['tareas' => $tareas]);
        futuria_responder(['ok' => true, 'tareas' => $tareas]);
    }

    /**
     *
     * eliminar la tarea que tenga ese id. Si no existe, la lista queda igual
     *
     */
    if ($accion === 'eliminar') {
        $id = (string)($entrada['id'] ?? '');
        $tareas = array_values(array_filter($tareas, function ($t) use ($id) {
            return $t['id'] !== $id;
        }));
        futuria_guardar('agenda', ['tareas' => $tareas]);
        futuria_responder(['ok' => true, 'tareas' => $tareas]);
    }

    futuria_responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
}

futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
