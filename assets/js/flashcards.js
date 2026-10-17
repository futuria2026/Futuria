/**
 *
 * la página de flashcards: crear tarjetas de pregunta y respuesta, verlas en
 * una lista, estudiarlas volteándolas y marcar las que ya se saben
 *
 * el mazo se guarda en api/flashcards.php cada vez que cambia. Para estudiar
 * se usan solo las tarjetas que todavía no están "dominadas"
 *
 */
(function () {
  'use strict';

  /**
   *
   * todas las tarjetas de la persona, las que quedan por estudiar (sin
   * dominar) y la posición de la tarjeta que se está viendo
   *
   */
  var tarjetas = [];
  var mazoEstudio = [];
  var indiceActual = 0;

  /**
   *
   * las partes de la página: el formulario con sus dos campos, la lista
   * pequeña del mazo, la tarjeta grande con sus dos caras, el contador, el
   * mensaje de mazo vacío, los botones de estudio y el aviso
   *
   */
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

  /**
   *
   * crea un id para una tarjeta nueva con la hora actual y un número al azar,
   * por ejemplo "tc_1760000000000_42"
   *
   */
  function idUnico() {
    return 'tc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  /**
   *
   * muestra un aviso corto (verde si salió bien, naranja si es un error) que
   * desaparece solo a los 2,2 segundos
   *
   */
  function mostrarAviso(texto, esError) {
    if (!el.aviso) return;
    el.aviso.hidden = false;
    el.aviso.textContent = texto;
    el.aviso.className = 'ht-aviso ' + (esError ? 'ht-aviso--error' : 'ht-aviso--ok');
    setTimeout(function () { el.aviso.hidden = true; }, 2200);
  }

  /**
   *
   * trae el mazo guardado en el servidor al abrir la página y lo pinta. Si
   * falla, se empieza con el mazo vacío
   *
   */
  async function cargar() {
    try {
      var res = await fetch('../api/flashcards.php?accion=cargar');
      var datos = await res.json();
      tarjetas = datos.ok ? (datos.tarjetas || []) : [];
    } catch (e) {
      tarjetas = [];
    }
    pintarListaMini();
    prepararEstudio();
  }

  /**
   *
   * envía el mazo completo al servidor para guardarlo. Si no se puede, avisa
   * que las tarjetas solo se ven en este navegador
   *
   */
  async function guardar() {
    try {
      var res = await fetch('../api/flashcards.php', {
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

  /**
   *
   * pinta la lista pequeña "Tu mazo": una fila por tarjeta con su pregunta
   * (con ✅ si está dominada) y un botón Eliminar. Si no hay tarjetas muestra
   * un mensaje invitando a crear la primera
   *
   */
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

  /**
   *
   * convierte un texto en HTML seguro: si alguien escribe etiquetas como <b>
   * en una pregunta, se ven como texto y no cambian la página
   *
   */
  function escaparHTML(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /**
   *
   * arma el mazo de estudio con las tarjetas que no están dominadas y vuelve
   * a la primera
   *
   */
  function prepararEstudio() {
    mazoEstudio = tarjetas.filter(function (t) { return !t.dominada; });
    indiceActual = 0;
    pintarEstudio();
  }

  /**
   *
   * muestra la tarjeta que toca estudiar, siempre por el lado de la pregunta
   *
   * si no hay tarjetas, esconde la zona de estudio y deja el mensaje de mazo
   * vacío. Si todas están dominadas, muestra "🎉 ¡Dominaste todas tus
   * tarjetas!". Si no, pone la pregunta y la respuesta en las dos caras y
   * actualiza el contador ("Tarjeta 1 de 5 · 2 dominadas")
   *
   */
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

  /**
   *
   * al enviar el formulario se crea la tarjeta (si tiene pregunta y
   * respuesta), se limpian los campos, se actualiza todo, se guarda y se
   * muestra "Tarjeta agregada."
   *
   */
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

  /**
   *
   * el botón Eliminar de cada fila borra esa tarjeta y guarda el mazo
   *
   * hay un solo escuchador para toda la lista; mira si el clic cayó en un
   * botón con data-id y usa ese id para saber cuál borrar
   *
   */
  el.listaMini.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    tarjetas = tarjetas.filter(function (t) { return t.id !== btn.dataset.id; });
    pintarListaMini();
    prepararEstudio();
    guardar();
  });

  /**
   *
   * al tocar la tarjeta grande se voltea entre la pregunta y la respuesta
   *
   */
  el.tarjeta.addEventListener('click', function () {
    el.tarjeta.classList.toggle('volteada');
  });

  /**
   *
   * el botón Siguiente pasa a la próxima tarjeta y, al llegar a la última,
   * vuelve a la primera
   *
   */
  el.btnSiguiente.addEventListener('click', function () {
    if (!mazoEstudio.length) return;
    indiceActual = (indiceActual + 1) % mazoEstudio.length;
    pintarEstudio();
  });

  /**
   *
   * el botón "La domino" marca la tarjeta actual como dominada, la saca del
   * mazo de estudio y guarda
   *
   */
  el.btnDominada.addEventListener('click', function () {
    if (!mazoEstudio.length) return;
    var actual = mazoEstudio[indiceActual];
    var real = tarjetas.find(function (t) { return t.id === actual.id; });
    if (real) real.dominada = true;
    pintarListaMini();
    prepararEstudio();
    guardar();
  });

  /**
   *
   * el botón Mezclar pone las tarjetas de estudio en un orden al azar y
   * vuelve a la primera
   *
   * recorre el mazo de atrás para adelante y cambia cada tarjeta de lugar con
   * otra elegida al azar (el método de Fisher-Yates)
   *
   */
  el.btnMezclar.addEventListener('click', function () {
    for (var i = mazoEstudio.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = mazoEstudio[i]; mazoEstudio[i] = mazoEstudio[j]; mazoEstudio[j] = tmp;
    }
    indiceActual = 0;
    pintarEstudio();
  });

  /**
   *
   * al abrir la página se carga el mazo guardado
   *
   */
  cargar();

})();
