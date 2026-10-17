<?php
// ============================================================
//  FUTURIA - Backend del Pomodoro (solo PHP, sin HTML)
//  GET  ?accion=stats                -> devuelve el historial
//  POST { accion: "registrar",
//         tipo: "trabajo" | "descanso" } -> guarda una sesión
// ============================================================
declare(strict_types=1);

require __DIR__ . '/inc/datos.php';

header('Content-Type: application/json; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $accion = $_GET['accion'] ?? 'stats';
    if ($accion !== 'stats') {
        futuria_responder(['ok' => false, 'error' => 'Acción no reconocida.'], 400);
    }
    futuria_responder(['ok' => true] + futuria_pomodoro_resumen());
}

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

/** Calcula el resumen: hoy, últimos 7 días y racha de días con al menos un Pomodoro. */
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

    // Racha de días consecutivos (incluyendo hoy) con al menos un pomodoro
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
