/* =========================================================
   FUTURIA · Pomodoro - pomodoro.js
   ========================================================= */
(function () {
  'use strict';

  var MODOS = {
    trabajo:  { etiqueta: 'Concentración', minutosInput: 'pmDurTrabajo' },
    corto:    { etiqueta: 'Descanso corto', minutosInput: 'pmDurCorto' },
    largo:    { etiqueta: 'Descanso largo', minutosInput: 'pmDurLargo' }
  };

  var estado = {
    modo: 'trabajo',
    segundosRestantes: 25 * 60,
    segundosTotales: 25 * 60,
    corriendo: false,
    intervalo: null,
    ciclos: 0 // pomodoros de trabajo completados en esta sesión (para saber cuándo toca descanso largo)
  };

  var el = {
    tiempo:   document.getElementById('pmTiempo'),
    etiqueta: document.getElementById('pmEtiquetaModo'),
    progreso: document.getElementById('pmProgreso'),
    iniciar:  document.getElementById('pmIniciar'),
    pausar:   document.getElementById('pmPausar'),
    reiniciar:document.getElementById('pmReiniciar'),
    modos:    document.querySelectorAll('.pm-modo'),
    durTrabajo: document.getElementById('pmDurTrabajo'),
    durCorto:   document.getElementById('pmDurCorto'),
    durLargo:   document.getElementById('pmDurLargo'),
    statHoy:  document.getElementById('pmStatHoy'),
    statRacha:document.getElementById('pmStatRacha'),
    statTotal:document.getElementById('pmStatTotal'),
    historial:document.getElementById('pmHistorial')
  };

  var CIRCUNFERENCIA = 2 * Math.PI * 120; // r=120 (ver SVG en el HTML)

  function minutosDeInput(idInput) {
    var campo = document.getElementById(idInput);
    var val = parseInt(campo.value, 10);
    return isNaN(val) || val <= 0 ? 1 : Math.min(val, 180);
  }

  function segundosDelModo(modo) {
    if (modo === 'trabajo') return minutosDeInput('pmDurTrabajo') * 60;
    if (modo === 'corto')   return minutosDeInput('pmDurCorto') * 60;
    return minutosDeInput('pmDurLargo') * 60;
  }

  function formatear(segundos) {
    var m = Math.floor(segundos / 60);
    var s = segundos % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function pintar() {
    el.tiempo.textContent = formatear(estado.segundosRestantes);
    el.etiqueta.textContent = MODOS[estado.modo].etiqueta;
    var fraccion = estado.segundosRestantes / estado.segundosTotales;
    el.progreso.style.strokeDasharray = CIRCUNFERENCIA;
    el.progreso.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - fraccion));

    el.modos.forEach(function (btn) {
      btn.classList.toggle('activo', btn.dataset.modo === estado.modo);
    });
    document.title = (estado.corriendo ? formatear(estado.segundosRestantes) + ' · ' : '') + 'Pomodoro | Futuria';
  }

  function cambiarModo(modo, reiniciarConteo) {
    pausar();
    estado.modo = modo;
    estado.segundosTotales = segundosDelModo(modo);
    estado.segundosRestantes = estado.segundosTotales;
    if (reiniciarConteo) estado.ciclos = 0;
    pintar();
  }

  function sonarAlarma() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(function (t) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.value = 0.15;
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.18);
      });
    } catch (e) { /* si el navegador bloquea audio, seguimos sin sonido */ }
  }

  async function registrarSesion(tipo) {
    try {
      var res = await fetch('pomodoro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'registrar', tipo: tipo })
      });
      var datos = await res.json();
      if (datos.ok) pintarStats(datos);
    } catch (e) { /* sin conexión: seguimos igual, no bloquea el temporizador */ }
  }

  async function cargarStats() {
    try {
      var res = await fetch('pomodoro.php?accion=stats');
      var datos = await res.json();
      if (datos.ok) pintarStats(datos);
    } catch (e) { /* silencioso */ }
  }

  function pintarStats(datos) {
    el.statHoy.textContent = datos.hoy ?? 0;
    el.statRacha.textContent = (datos.racha ?? 0) + (datos.racha === 1 ? ' día' : ' días');
    el.statTotal.textContent = datos.total ?? 0;

    el.historial.innerHTML = '';
    var dias = datos.ultimos7 || {};
    var claves = Object.keys(dias);
    if (!claves.length) {
      el.historial.innerHTML = '<p class="ht-aviso">Aún no hay sesiones registradas. ¡Completa tu primer Pomodoro!</p>';
      return;
    }
    claves.forEach(function (fecha) {
      var fila = document.createElement('div');
      fila.className = 'pm-historial-fila';
      fila.innerHTML = '<span>' + fecha + '</span><strong>' + dias[fecha] + ' 🍅</strong>';
      el.historial.appendChild(fila);
    });
  }

  function siguienteModo() {
    if (estado.modo === 'trabajo') {
      estado.ciclos++;
      return (estado.ciclos % 4 === 0) ? 'largo' : 'corto';
    }
    return 'trabajo';
  }

  function terminar() {
    pausar();
    sonarAlarma();
    registrarSesion(estado.modo === 'trabajo' ? 'trabajo' : 'descanso');
    var siguiente = siguienteModo();
    cambiarModo(siguiente, false);
  }

  function iniciar() {
    if (estado.corriendo) return;
    estado.corriendo = true;
    el.iniciar.disabled = true;
    el.pausar.disabled = false;
    estado.intervalo = setInterval(function () {
      estado.segundosRestantes--;
      if (estado.segundosRestantes <= 0) {
        terminar();
        return;
      }
      pintar();
    }, 1000);
  }

  function pausar() {
    estado.corriendo = false;
    clearInterval(estado.intervalo);
    el.iniciar.disabled = false;
    el.pausar.disabled = true;
    document.title = 'Pomodoro | Futuria';
  }

  function reiniciar() {
    cambiarModo(estado.modo, false);
  }

  el.iniciar.addEventListener('click', iniciar);
  el.pausar.addEventListener('click', pausar);
  el.reiniciar.addEventListener('click', reiniciar);
  el.modos.forEach(function (btn) {
    btn.addEventListener('click', function () { cambiarModo(btn.dataset.modo, false); });
  });
  [el.durTrabajo, el.durCorto, el.durLargo].forEach(function (input) {
    input.addEventListener('change', function () {
      if (!estado.corriendo) cambiarModo(estado.modo, false);
    });
  });

  pintar();
  cargarStats();

  // Menú móvil (igual que el resto del sitio)
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () { items.classList.toggle('nb-abierto'); });
  }
})();
