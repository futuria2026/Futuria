<?php
/**
 *
 * guarda los bloques del Pomodoro que termina cada visitante y le devuelve sus
 * estadísticas: cuántos hizo hoy, su racha de días y los últimos 7 días
 *
 * con GET ?accion=stats solo devuelve las estadísticas. Con POST
 * { accion: "registrar", tipo: "trabajo" | "descanso" } guarda la sesión que
 * acaba de terminar y devuelve las estadísticas ya actualizadas
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
 * pedir las estadísticas. Cualquier otra acción que no sea "stats" responde
 * con el error 400
 *
 */
if ($metodo === 'GET') {
    $accion = $_GET['accion'] ?? 'stats';
    if ($accion !== 'stats') {
        futuria_responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
    }
    futuria_responder(['ok' => true] + futuria_pomodoro_resumen());
}

/**
 *
 * registrar una sesión terminada
 *
 * solo acepta los tipos "trabajo" y "descanso". Guarda el tipo con la fecha y
 * la hora de ese momento y conserva solo las últimas 500 sesiones
 *
 */
if ($metodo === 'POST') {
    $entrada = futuria_leer_json_entrada();
    $accion  = (string)($entrada['accion'] ?? '');
    $tipo    = (string)($entrada['tipo'] ?? 'trabajo');

    if ($accion !== 'registrar' || !in_array($tipo, ['trabajo', 'descanso'], true)) {
        futuria_responder(['ok' => false, 'error' => 'Datos inválidos.'], 422);
    }

    $registro   = futuria_leer('pomodoro', ['sesiones' => []]);
    $registro['sesiones'][] = ['tipo' => $tipo, 'fecha' => date('Y-m-d'), 'hora' => date('H:i:s')];
    $registro['sesiones'] = array_slice($registro['sesiones'], -500);
    futuria_guardar('pomodoro', $registro);

    futuria_responder(['ok' => true] + futuria_pomodoro_resumen());
}

futuria_responder(['ok' => false, 'error' => 'Método no permitido.'], 405);

/**
 *
 * calcula el resumen del Pomodoro: cuántos bloques de estudio se hicieron hoy,
 * cuántos días seguidos lleva la racha, el total y los últimos 7 días con
 * actividad
 *
 * cuenta solo las sesiones de tipo "trabajo", agrupadas por fecha y ordenadas
 * de la más nueva a la más vieja. La racha arranca en hoy y va restando un día
 * mientras haya al menos un Pomodoro en esa fecha
 *
 */
function futuria_pomodoro_resumen(): array
{
    $registro = futuria_leer('pomodoro', ['sesiones' => []]);
    $sesiones = $registro['sesiones'] ?? [];

    $porDia = [];
    foreach ($sesiones as $s) {
        if (($s['tipo'] ?? '') !== 'trabajo') continue;
        $porDia[$s['fecha']] = ($porDia[$s['fecha']] ?? 0) + 1;
    }
    krsort($porDia);

    $hoy = date('Y-m-d');
    $totalHoy = $porDia[$hoy] ?? 0;

    $racha = 0;
    $cursor = new DateTime($hoy);
    while (isset($porDia[$cursor->format('Y-m-d')])) {
        $racha++;
        $cursor->modify('-1 day');
    }

    $ultimos7 = array_slice($porDia, 0, 7, true);

    return [
        'hoy'       => $totalHoy,
        'racha'     => $racha,
        'total'     => array_sum($porDia),
        'ultimos7'  => $ultimos7,
    ];
}
