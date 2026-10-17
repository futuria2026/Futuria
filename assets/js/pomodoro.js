/**
 *
 * el temporizador de la página Pomodoro: cuenta los bloques de concentración
 * y de descanso, suena al terminar y muestra las estadísticas de la persona
 *
 * cada vez que termina un bloque lo guarda en api/pomodoro.php y pasa solo al
 * siguiente: después de cada concentración viene un descanso corto, y cada 4
 * concentraciones un descanso largo
 *
 */
(function () {
  'use strict';

  /**
   *
   * los tres modos del temporizador, con el nombre que se muestra y el campo
   * donde la persona escribe cuántos minutos dura cada uno
   *
   */
  var MODOS = {
    trabajo:  { etiqueta: 'Concentración', minutosInput: 'pmDurTrabajo' },
    corto:    { etiqueta: 'Descanso corto', minutosInput: 'pmDurCorto' },
    largo:    { etiqueta: 'Descanso largo', minutosInput: 'pmDurLargo' }
  };

  /**
   *
   * cómo va el temporizador en este momento: el modo, los segundos que
   * faltan, los segundos que dura el bloque completo, si está corriendo, el
   * reloj interno que descuenta cada segundo y cuántas concentraciones se
   * completaron (ciclos)
   *
   */
  var estado = {
    modo: 'trabajo',
    segundosRestantes: 25 * 60,
    segundosTotales: 25 * 60,
    corriendo: false,
    intervalo: null,
    ciclos: 0
  };

  /**
   *
   * las partes de la página que se leen o se cambian: el tiempo, el nombre
   * del modo, el anillo de progreso, los botones, los campos de minutos y las
   * estadísticas
   *
   */
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

  /**
   *
   * el largo del borde del anillo de progreso, que es un círculo de radio 120
   * en el HTML
   *
   */
  var CIRCUNFERENCIA = 2 * Math.PI * 120;

  /**
   *
   * lee los minutos que escribió la persona en un campo. Si está vacío o es 0
   * o menos usa 1 minuto, y nunca deja pasar de 180
   *
   */
  function minutosDeInput(idInput) {
    var campo = document.getElementById(idInput);
    var val = parseInt(campo.value, 10);
    return isNaN(val) || val <= 0 ? 1 : Math.min(val, 180);
  }

  /**
   *
   * cuántos segundos dura un modo, según los minutos de su campo
   *
   */
  function segundosDelModo(modo) {
    if (modo === 'trabajo') return minutosDeInput('pmDurTrabajo') * 60;
    if (modo === 'corto')   return minutosDeInput('pmDurCorto') * 60;
    return minutosDeInput('pmDurLargo') * 60;
  }

  /**
   *
   * convierte segundos en el texto mm:ss, por ejemplo 1500 → "25:00"
   *
   */
  function formatear(segundos) {
    var m = Math.floor(segundos / 60);
    var s = segundos % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /**
   *
   * actualiza todo lo que se ve: el tiempo, el nombre del modo, el anillo,
   * qué botón de modo está marcado y el título de la pestaña
   *
   * el anillo se va vaciando moviendo dónde empieza el borde dibujado
   * (strokeDashoffset) según la parte del tiempo que ya pasó. Mientras corre,
   * la pestaña del navegador muestra el tiempo que falta
   *
   */
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

  /**
   *
   * pasa a otro modo: pausa el reloj, carga la duración completa de ese modo
   * y vuelve a pintar. Si se pide, también reinicia la cuenta de ciclos
   *
   */
  function cambiarModo(modo, reiniciarConteo) {
    pausar();
    estado.modo = modo;
    estado.segundosTotales = segundosDelModo(modo);
    estado.segundosRestantes = estado.segundosTotales;
    if (reiniciarConteo) estado.ciclos = 0;
    pintar();
  }

  /**
   *
   * hace sonar tres pitidos cortos cuando termina un bloque
   *
   * los genera el mismo navegador (Web Audio), sin archivos de sonido: tres
   * tonos de 660 Hz que duran 0,18 segundos, separados por un cuarto de
   * segundo. Si el navegador no deja reproducir sonido, sigue sin sonar
   *
   */
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
    } catch (e) {}
  }

  /**
   *
   * le avisa al servidor que terminó un bloque ("trabajo" o "descanso") y
   * pinta las estadísticas que devuelve. Si no hay conexión el temporizador
   * sigue funcionando igual
   *
   */
  async function registrarSesion(tipo) {
    try {
      var res = await fetch('../api/pomodoro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'registrar', tipo: tipo })
      });
      var datos = await res.json();
      if (datos.ok) pintarStats(datos);
    } catch (e) {}
  }

  /**
   *
   * pide las estadísticas guardadas al abrir la página. Si falla, se quedan
   * en 0 sin mostrar error
   *
   */
  async function cargarStats() {
    try {
      var res = await fetch('../api/pomodoro.php?accion=stats');
      var datos = await res.json();
      if (datos.ok) pintarStats(datos);
    } catch (e) {}
  }

  /**
   *
   * muestra las estadísticas: Pomodoros de hoy, racha ("1 día" o "N días"),
   * total, y una fila por cada uno de los últimos 7 días con actividad. Si no
   * hay ninguno muestra un mensaje invitando a completar el primero
   *
   */
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

  /**
   *
   * decide qué modo viene después del actual: tras una concentración suma un
   * ciclo y toca descanso corto, o descanso largo si ya van 4, 8, 12...;
   * tras cualquier descanso vuelve la concentración
   *
   */
  function siguienteModo() {
    if (estado.modo === 'trabajo') {
      estado.ciclos++;
      return (estado.ciclos % 4 === 0) ? 'largo' : 'corto';
    }
    return 'trabajo';
  }

  /**
   *
   * lo que pasa cuando el tiempo llega a 0: se detiene, suena, se guarda la
   * sesión y se carga el siguiente modo (sin arrancarlo)
   *
   */
  function terminar() {
    pausar();
    sonarAlarma();
    registrarSesion(estado.modo === 'trabajo' ? 'trabajo' : 'descanso');
    var siguiente = siguienteModo();
    cambiarModo(siguiente, false);
  }

  /**
   *
   * arranca el reloj: cada segundo resta uno y vuelve a pintar; al llegar a 0
   * llama a terminar(). Mientras corre, el botón Iniciar se apaga y Pausar se
   * prende
   *
   */
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

  /**
   *
   * detiene el reloj sin perder el tiempo que falta, cambia qué botón está
   * prendido y deja el título normal de la pestaña
   *
   */
  function pausar() {
    estado.corriendo = false;
    clearInterval(estado.intervalo);
    el.iniciar.disabled = false;
    el.pausar.disabled = true;
    document.title = 'Pomodoro | Futuria';
  }

  /**
   *
   * vuelve a poner el modo actual en su tiempo completo
   *
   */
  function reiniciar() {
    cambiarModo(estado.modo, false);
  }

  /**
   *
   * conecta los botones: Iniciar, Pausar, Reiniciar y los tres botones de
   * modo. Si la persona cambia los minutos de un campo mientras el reloj está
   * quieto, el tiempo se actualiza de una vez
   *
   */
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

  /**
   *
   * al abrir la página: muestra 25:00 y carga las estadísticas guardadas
   *
   */
  pintar();
  cargarStats();

})();
