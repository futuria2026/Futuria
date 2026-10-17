<?php
// ============================================================
//  FUTURIA - Backend de la Agenda escolar (solo PHP, sin HTML)
//  GET  ?accion=listar                                    -> lista de tareas
//  POST { accion:"agregar", fecha, hora, texto }          -> agrega una tarea
//  POST { accion:"eliminar", id }                         -> elimina una tarea
// ============================================================
declare(strict_types=1);

require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $agenda = futuria_leer('agenda', ['tareas' => []]);
    futuria_responder(['ok' => true, 'tareas' => $agenda['tareas'] ?? []]);
}

if ($metodo === 'POST') {
    $entrada = futuria_leer_json_entrada();
    $accion  = (string)($entrada['accion'] ?? '');
    $agenda  = futuria_leer('agenda', ['tareas' => []]);
    $tareas  = $agenda['tareas'] ?? [];

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
