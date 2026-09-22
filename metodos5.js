/* ==========================================================
   FUTURIA · Página 5 · MÉTODOS  (metodos5.js)
   - Estrellas decorativas de 4 puntas y puntitos degradados
   - Menú móvil, burbujas de info táctiles
   - Modal de guía para cada método
   - Calendario de organización personal (día · fecha · hora)
     con persistencia en localStorage
   ========================================================== */
(function () {
  'use strict';

  /* ---------------- Cielo de estrellas ---------------- */
  function pintarEstrellas() {
    var cielo = document.getElementById('cielo');
    if (!cielo || cielo.childNodes.length) return;

    var colores = [
      { clase: 'estrella', color: '%23DBB6E0' },
      { clase: 'estrella', color: '%23FE6A00' },
      { clase: 'estrella', color: '%2383AEE3' },
      { clase: 'estrella', color: '%23FCFCFB' }
    ];

    var svgEstrella = function (color) {
      return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'' +
        color +
        '\' d=\'M12 0c1 7 5 11 12 12-7 1-11 5-12 12C11 17 7 13 0 12 7 11 11 7 12 0z\'/%3E%3C/svg%3E")';
    };

    for (var i = 0; i < 55; i++) {
      var s = document.createElement('span');
      var tono = colores[Math.floor(Math.random() * colores.length)];
      s.className = tono.clase;
      s.style.backgroundImage = svgEstrella(tono.color);
      s.style.backgroundSize = '100% 100%';
      s.style.width = (8 + Math.random() * 20) + 'px';
      s.style.height = s.style.width;
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDuration = (2.6 + Math.random() * 3.4) + 's';
      s.style.animationDelay = (Math.random() * 4) + 's';
      cielo.appendChild(s);
    }

    for (var j = 0; j < 24; j++) {
      var p = document.createElement('span');
      p.className = 'puntito';
      p.style.width = (24 + Math.random() * 70) + 'px';
      p.style.height = p.style.width;
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = (Math.random() * 100) + '%';
      p.style.animationDuration = (3 + Math.random() * 4) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      cielo.appendChild(p);
    }
  }
  pintarEstrellas();

  /* ---------------- Imágenes (placeholders) ---------------- */
  // Si el usuario ya puso un src, se muestra la foto y se oculta el placeholder.
  // Si el src está vacío, se quita el atributo para no generar errores.
  document.querySelectorAll('img.mascota, img.real').forEach(function (img) {
    var src = (img.getAttribute('src') || '').trim();
    if (!src || src === '#') {
      img.removeAttribute('src');
      return;
    }
    img.classList.add('mostrar');
    var caja = img.closest('[data-caja]');
    if (caja) {
      var ph = caja.querySelector('.ph');
      if (ph) ph.classList.add('oculto');
    }
  });

  /* ---------------- Menú móvil ---------------- */
  var menuBtn = document.getElementById('menuBtn');
  var navItems = document.getElementById('navItems');
  if (menuBtn && navItems) {
    menuBtn.addEventListener('click', function () {
      navItems.classList.toggle('abierto');
    });
    navItems.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', function () {
        navItems.classList.remove('abierto');
      });
    });
  }

  /* ---------------- Burbujas de info táctiles ---------------- */
  document.querySelectorAll('.animal-lateral').forEach(function (bloque) {
    bloque.addEventListener('click', function () {
      bloque.classList.toggle('tocado');
    });
  });

  /* ---------------- Scroll: botón cohete ---------------- */
  var btnCohete = document.getElementById('btnCohete');
  if (btnCohete) {
    btnCohete.addEventListener('click', function () {
      var destino = document.getElementById('metodos');
      if (destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------- Modal de guía por método ---------------- */
  var GUIA = {
    pomodoro: [
      'Elige una sola tarea concreta para trabajar.',
      'Pon un temporizador de 25 minutos (tu teléfono o una app).',
      'Estudia sin distracciones hasta que suene la alarma.',
      'Descansa 5 minutos: estira, hidrátate, mira lejos.',
      'Repite el ciclo y después de 4 bloques toma 30 minutos de descanso.'
    ],
    mapas: [
      'Escribe el tema principal en el centro de una hoja.',
      'Trazá ramas con las ideas más importantes.',
      'Dale color: cada rama con un color distinto.',
      'Añade dibujos y palabras clave en cada rama.',
      'Repásalo en voz alta siguiendo las ramas.'
    ],
    tarjetas: [
      'Escribe una pregunta en la cara frontal de la tarjeta.',
      'Escribe la respuesta en la parte de atrás.',
      'Baraja el mazo y responde en voz alta.',
      'Las que fallaste vuelven al mazo de mañana.',
      'Repite a diario hasta que todas te salgan bien.'
    ]
  };
  var colorGuia = { pomodoro: '#EB5727', mapas: '#83AEE3', tarjetas: '#4b1c71' };

  var overlay = document.getElementById('modalOverlay');
  var modal = document.getElementById('modal');
  var modalPalabra = document.getElementById('modalPalabra');
  var modalPasos = document.getElementById('modalPasos');

  function cerrarModal() {
    if (overlay) overlay.classList.remove('abierto');
    document.body.style.overflow = '';
  }
  function abrirModal(guia) {
    if (!overlay || !GUIA[guia]) return;
    modalPalabra.textContent = GUIA[guia] ? guia.charAt(0).toUpperCase() + guia.slice(1) : guia;
    modalPalabra.style.color = colorGuia[guia] || '#EB5727';
    modalPasos.innerHTML = '';
    (GUIA[guia] || []).forEach(function (paso) {
      var li = document.createElement('li');
      li.textContent = paso;
      modalPasos.appendChild(li);
    });
    overlay.classList.add('abierto');
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('.btn-usar').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var guia = btn.getAttribute('data-guia');
      var scroll = btn.getAttribute('data-scroll');
      if (guia && GUIA[guia]) {
        abrirModal(guia);
      } else if (scroll) {
        var zona = document.getElementById(scroll);
        if (zona) zona.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        var cajaMetodo = btn.closest('.metodo');
        if (cajaMetodo) cajaMetodo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  var modalCerrar = document.getElementById('modalCerrar');
  var modalInicio = document.getElementById('modalInicio');
  if (modalCerrar) modalCerrar.addEventListener('click', cerrarModal);
  if (modalInicio) modalInicio.addEventListener('click', cerrarModal);
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) cerrarModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarModal();
  });

  /* ====================================================
     CALENDARIO DE ORGANIZACIÓN PERSONAL (día · fecha · hora)
     ==================================================== */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var CLAVE_TAREAS = 'futuria_tareas_v1';

  var hoy = new Date();
  var anio = hoy.getFullYear();
  var mes = hoy.getMonth(); // 0 = enero
  var diaSel = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  var tareas = cargarTareas();

  var calCuadricula = document.getElementById('calCuadricula');
  var calTitulo = document.getElementById('calTitulo');
  var calFecha = document.getElementById('calFecha');
  var calHora = document.getElementById('calHora');
  var calTarea = document.getElementById('calTarea');
  var calForm = document.getElementById('calForm');
  var calLista = document.getElementById('calLista');
  var calVacio = document.getElementById('calVacio');

  function cargarTareas() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_TAREAS)) || {};
    } catch (e) {
      return {};
    }
  }
  function guardarTareas() {
    try {
      localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
    } catch (e) { /* almacenamiento no disponible */ }
  }
  function claveFecha(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  function mismaFecha(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCalendario() {
    calTitulo.textContent = MESES[mes] + ' ' + anio;

    var primerDia = new Date(anio, mes, 1);
    var diasEnMes = new Date(anio, mes + 1, 0).getDate();
    var diasEnMesAnt = new Date(anio, mes, 0).getDate();
    var desfase = (primerDia.getDay() + 6) % 7; // lunes = 0

    calCuadricula.innerHTML = '';

    // Celdas del mes anterior
    for (var i = desfase - 1; i >= 0; i--) {
      var fechaAnt = new Date(anio, mes - 1, diasEnMesAnt - i);
      calCuadricula.appendChild(crearCelda(fechaAnt, false));
    }
    // Días del mes actual
    for (var d = 1; d <= diasEnMes; d++) {
      calCuadricula.appendChild(crearCelda(new Date(anio, mes, d), true));
    }
    // Celdas del mes siguiente (para completar la grilla)
    var total = calCuadricula.children.length;
    var resto = (7 - (total % 7)) % 7;
    for (var k = 1; k <= resto; k++) {
      calCuadricula.appendChild(crearCelda(new Date(anio, mes + 1, k), false));
    }
  }

  function crearCelda(fecha, esMismoMes) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-dia';
    if (!esMismoMes) btn.classList.add('otro-mes');
    var diaSemana = fecha.getDay(); // 0 domingo
    if (diaSemana === 0 || diaSemana === 6) btn.classList.add('fin');
    if (mismaFecha(fecha, hoy)) btn.classList.add('hoy');
    if (mismaFecha(fecha, diaSel)) btn.classList.add('sel');

    var tareasDia = tareas[claveFecha(fecha)];
    btn.textContent = fecha.getDate();
    if (tareasDia && tareasDia.length) {
      var punto = document.createElement('span');
      punto.className = 'puntito-dia';
      btn.appendChild(punto);
    }

    btn.addEventListener('click', function () {
      diaSel = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      if (esMismoMes) {
        renderCalendario();
      } else {
        // Navegar al mes del día vecino
        anio = fecha.getFullYear();
        mes = fecha.getMonth();
        renderCalendario();
      }
      renderLista();
    });
    return btn;
  }

  function textoFecha(d) {
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function renderLista() {
    var clave = claveFecha(diaSel);
    calFecha.value = textoFecha(diaSel);
    calFecha.size = textoFecha(diaSel).length;

    var lista = (tareas[clave] || []).slice().sort(function (a, b) {
      return (a.hora || '').localeCompare(b.hora || '');
    });

    calLista.innerHTML = '';
    if (!lista.length) {
      calVacio.style.display = 'block';
      return;
    }
    calVacio.style.display = 'none';
    lista.forEach(function (t) {
      var li = document.createElement('li');
      var hora = document.createElement('span');
      hora.className = 'hora';
      hora.textContent = t.hora || 'Sin hora';
      var titulo = document.createElement('span');
      titulo.className = 'titulo';
      titulo.textContent = t.titulo;
      var borrar = document.createElement('button');
      borrar.className = 'borrar';
      borrar.setAttribute('aria-label', 'Borrar tarea');
      borrar.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      borrar.addEventListener('click', function () {
        tareas[clave] = (tareas[clave] || []).filter(function (x) { return x.id !== t.id; });
        if (!tareas[clave].length) delete tareas[clave];
        guardarTareas();
        renderCalendario();
        renderLista();
      });
      li.appendChild(hora);
      li.appendChild(titulo);
      li.appendChild(borrar);
      calLista.appendChild(li);
    });
  }

  if (calForm) {
    calForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var titulo = calTarea.value.trim();
      if (!titulo) { calTarea.focus(); return; }
      var clave = claveFecha(diaSel);
      if (!tareas[clave]) tareas[clave] = [];
      tareas[clave].push({ id: Date.now() + Math.random(), hora: calHora.value, titulo: titulo });
      guardarTareas();
      calTarea.value = '';
      calHora.value = '';
      renderCalendario();
      renderLista();
    });
  }

  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  if (calPrev) calPrev.addEventListener('click', function () {
    mes -= 1;
    if (mes < 0) { mes = 11; anio -= 1; }
    renderCalendario(); renderLista();
  });
  if (calNext) calNext.addEventListener('click', function () {
    mes += 1;
    if (mes > 11) { mes = 0; anio += 1; }
    renderCalendario(); renderLista();
  });

  // Arranque del calendario
  if (calCuadricula) {
    renderCalendario();
    renderLista();
  }

  /* ---------------- Año del footer ---------------- */
  var anioSpan = document.getElementById('anio');
  if (anioSpan) anioSpan.textContent = new Date().getFullYear();
})();