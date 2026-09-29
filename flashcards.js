/* =========================================================
   FUTURIA · Flashcards - flashcards.js
   ========================================================= */
(function () {
  'use strict';

  var tarjetas = [];
  var mazoEstudio = [];
  var indiceActual = 0;

  var el = {
    form: document.getElementById('fcForm'),
    pregunta: document.getElementById('fcPregunta'),
    respuesta: document.getElementById('fcRespuesta'),
    listaMini: document.getElementById('fcListaMini'),
    tarjeta: document.getElementById('fcTarjeta'),
    frente: document.getElementById('fcFrente'),
    reverso: document.getElementById('fcReverso'),
    contador: document.getElementById('fcContador'),
    vacio: document.getElementById('fcVacio'),
    estudioBox: document.getElementById('fcEstudioBox'),
    btnSiguiente: document.getElementById('fcSiguiente'),
    btnDominada: document.getElementById('fcDominada'),
    btnMezclar: document.getElementById('fcMezclar'),
    aviso: document.getElementById('fcAviso')
  };

  function idUnico() {
    return 'tc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  function mostrarAviso(texto, esError) {
    if (!el.aviso) return;
    el.aviso.hidden = false;
    el.aviso.textContent = texto;
    el.aviso.className = 'ht-aviso ' + (esError ? 'ht-aviso--error' : 'ht-aviso--ok');
    setTimeout(function () { el.aviso.hidden = true; }, 2200);
  }

  async function cargar() {
    try {
      var res = await fetch('flashcards.php?accion=cargar');
      var datos = await res.json();
      tarjetas = datos.ok ? (datos.tarjetas || []) : [];
    } catch (e) {
      tarjetas = [];
    }
    pintarListaMini();
    prepararEstudio();
  }

  async function guardar() {
    try {
      var res = await fetch('flashcards.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'guardar', tarjetas: tarjetas })
      });
      var datos = await res.json();
      if (datos.ok) tarjetas = datos.tarjetas;
    } catch (e) {
      mostrarAviso('No se pudo guardar en el servidor (se sigue viendo localmente).', true);
    }
  }

  function pintarListaMini() {
    el.listaMini.innerHTML = '';
    if (!tarjetas.length) {
      el.listaMini.innerHTML = '<p class="ht-aviso">Aún no tienes tarjetas. ¡Crea la primera!</p>';
      return;
    }
    tarjetas.forEach(function (t) {
      var fila = document.createElement('div');
      fila.className = 'fc-item-mini';
      fila.innerHTML =
        '<span>' + (t.dominada ? '✅ ' : '') + escaparHTML(t.pregunta) + '</span>' +
        '<button type="button" data-id="' + t.id + '">Eliminar</button>';
      el.listaMini.appendChild(fila);
    });
  }

  function escaparHTML(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function prepararEstudio() {
    mazoEstudio = tarjetas.filter(function (t) { return !t.dominada; });
    indiceActual = 0;
    pintarEstudio();
  }

  function pintarEstudio() {
    el.tarjeta.classList.remove('volteada');
    var quedan = mazoEstudio.length;
    var dominadas = tarjetas.length - quedan;

    if (!tarjetas.length) {
      el.estudioBox.hidden = true;
      el.vacio.hidden = false;
      el.contador.textContent = '';
      return;
    }
    el.vacio.hidden = true;

    if (!quedan) {
      el.estudioBox.hidden = true;
      el.vacio.hidden = false;
      el.vacio.textContent = '🎉 ¡Dominaste todas tus tarjetas! Agrega más o reinicia el progreso.';
      return;
    }

    el.estudioBox.hidden = false;
    var actual = mazoEstudio[indiceActual];
    el.frente.textContent = actual.pregunta;
    el.reverso.textContent = actual.respuesta;
    el.contador.textContent = 'Tarjeta ' + (indiceActual + 1) + ' de ' + quedan + ' · ' + dominadas + ' dominadas';
  }

  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var pregunta = el.pregunta.value.trim();
    var respuesta = el.respuesta.value.trim();
    if (!pregunta || !respuesta) return;

    tarjetas.push({ id: idUnico(), pregunta: pregunta, respuesta: respuesta, dominada: false });
    el.form.reset();
    pintarListaMini();
    prepararEstudio();
    guardar();
    mostrarAviso('Tarjeta agregada.');
  });

  el.listaMini.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    tarjetas = tarjetas.filter(function (t) { return t.id !== btn.dataset.id; });
    pintarListaMini();
    prepararEstudio();
    guardar();
  });

  el.tarjeta.addEventListener('click', function () {
    el.tarjeta.classList.toggle('volteada');
  });

  el.btnSiguiente.addEventListener('click', function () {
    if (!mazoEstudio.length) return;
    indiceActual = (indiceActual + 1) % mazoEstudio.length;
    pintarEstudio();
  });

  el.btnDominada.addEventListener('click', function () {
    if (!mazoEstudio.length) return;
    var actual = mazoEstudio[indiceActual];
    var real = tarjetas.find(function (t) { return t.id === actual.id; });
    if (real) real.dominada = true;
    pintarListaMini();
    prepararEstudio();
    guardar();
  });

  el.btnMezclar.addEventListener('click', function () {
    for (var i = mazoEstudio.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = mazoEstudio[i]; mazoEstudio[i] = mazoEstudio[j]; mazoEstudio[j] = tmp;
    }
    indiceActual = 0;
    pintarEstudio();
  });

  cargar();

  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () { items.classList.toggle('nb-abierto'); });
  }
})();
