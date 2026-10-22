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
 * si la persona inició sesión, las tareas se guardan en la tabla
 * planificador_tareas (el texto en titulo_tarea y la fecha con la hora en
 * fecha_limite; una tarea sin hora se guarda a las 00:00:00). Si no inició
 * sesión, se guardan en la sesión del navegador como antes
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

$usuario = usuario_actual();

/**
 *
 * el id de la fila de metodos_estudio que se llama "Agenda" (null si no
 * existe), para marcar de qué método viene cada tarea
 *
 */
function id_metodo_agenda(): ?int
{
    $c = bd()->prepare('SELECT id_metodo FROM metodos_estudio WHERE nombre = ? LIMIT 1');
    $c->execute(['Agenda']);
    $id = $c->fetchColumn();
    return $id === false ? null : (int)$id;
}

/**
 *
 * las tareas de un usuario con sesión, en el formato que usa agenda.js:
 * { id, fecha, hora, texto }. La hora 00:00:00 significa "sin hora"
 *
 */
function tareas_de_usuario(int $usuarioId): array
{
    $c = bd()->prepare(
        'SELECT id_tarea, titulo_tarea, DATE_FORMAT(fecha_limite, \'%Y-%m-%d\') AS fecha, DATE_FORMAT(fecha_limite, \'%H:%i\') AS hora
           FROM planificador_tareas
          WHERE id_usuario = ?
          ORDER BY fecha_limite, id_tarea'
    );
    $c->execute([$usuarioId]);
    $tareas = [];
    foreach ($c->fetchAll() as $f) {
        $tareas[] = [
            'id'    => (string)$f['id_tarea'],
            'fecha' => $f['fecha'],
            'hora'  => $f['hora'] === '00:00' ? '' : $f['hora'],
            'texto' => $f['titulo_tarea'],
        ];
    }
    return $tareas;
}

/**
 *
 * devolver todas las tareas guardadas
 *
 */
if ($metodo === 'GET') {
    if ($usuario) {
        futuria_responder(['ok' => true, 'tareas' => tareas_de_usuario($usuario['id'])]);
    }
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
     * aceptan como máximo 500 tareas y el texto se corta a 200 letras (150 con sesión iniciada, el largo de titulo_tarea). Cada
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
        if ($usuario) {
            $total = bd()->prepare('SELECT COUNT(*) FROM planificador_tareas WHERE id_usuario = ?');
            $total->execute([$usuario['id']]);
            if ((int)$total->fetchColumn() >= 500) {
                futuria_responder(['ok' => false, 'error' => 'Límite de tareas alcanzado.'], 422);
            }
            $horaValida = preg_match('/^\d{2}:\d{2}$/', $hora) ? $hora : '00:00';
            try {
                bd()->prepare(
                    'INSERT INTO planificador_tareas (id_usuario, id_metodo, titulo_tarea, fecha_limite, estado)
                     VALUES (?, ?, ?, ?, ?)'
                )->execute([$usuario['id'], id_metodo_agenda(), mb_substr($texto, 0, 150), $fecha . ' ' . $horaValida . ':00', 'Pendiente']);
            } catch (PDOException $e) {
                futuria_responder(['ok' => false, 'error' => 'Fecha inválida.'], 422);
            }
            futuria_responder(['ok' => true, 'tareas' => tareas_de_usuario($usuario['id'])]);
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
        if ($usuario) {
            bd()->prepare('DELETE FROM planificador_tareas WHERE id_tarea = ? AND id_usuario = ?')
                ->execute([(int)$id, $usuario['id']]);
            futuria_responder(['ok' => true, 'tareas' => tareas_de_usuario($usuario['id'])]);
        }
        $tareas = array_values(array_filter($tareas, function ($t) use ($id) {
            return $t['id'] !== $id;
        }));
        futuria_guardar('agenda', ['tareas' => $tareas]);
        futuria_responder(['ok' => true, 'tareas' => $tareas]);
    }

    futuria_responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
}

futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
