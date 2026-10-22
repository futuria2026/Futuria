/**
 *
 * la página de métodos de estudio: el cielo de estrellas de fondo, las
 * burbujas de información, la ventana con la guía de cada método y el
 * calendario personal de tareas
 *
 * comun.js se carga antes y se encarga de la barra de navegación (el menú en
 * celular y los enlaces de la sesión). El calendario guarda las tareas solo
 * en este navegador (localStorage, la memoria del navegador), no en el
 * servidor. Todo va dentro de una función que se ejecuta sola, y sus
 * variables solo existen ahí adentro
 *
 */
(function () {
  'use strict';

  /**
   *
   * llena el fondo #cielo con 55 estrellas de cuatro puntas y 24 puntitos de
   * luz, todos en lugares al azar. Si ya tiene algo adentro no hace nada
   *
   * cada estrella es un dibujo SVG metido en el fondo del span, de un color
   * al azar entre lila, naranja, azul cielo y blanco, de 8 a 28 píxeles, que
   * brilla a su propio ritmo (de 2,6 a 6 segundos). Los puntitos miden de 24
   * a 94 píxeles
   *
   */
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

  /**
   *
   * pone estrellas pequeñas que brillan sobre el degradado del pie de página
   *
   */
  function pintarEstrellasPie() {
    var pie = document.querySelector('.footer');
    if (!pie || pie.querySelector('.estrellas-pie')) return;
    var capa = document.createElement('div');
    capa.className = 'estrellas-pie';
    var colores = ['%23DBB6E0', '%2383AEE3', '%23FCFCFB'];
    for (var i = 0; i < 22; i++) {
      var s = document.createElement('span');
      s.className = 'estrella';
      var color = colores[Math.floor(Math.random() * colores.length)];
      s.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'' + color + '\' d=\'M12 0c1 7 5 11 12 12-7 1-11 5-12 12C11 17 7 13 0 12 7 11 11 7 12 0z\'/%3E%3C/svg%3E")';
      s.style.backgroundSize = '100% 100%';
      s.style.width = (6 + Math.random() * 12) + 'px';
      s.style.height = s.style.width;
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 100) + '%';
      s.style.animationDuration = (2.6 + Math.random() * 3.4) + 's';
      s.style.animationDelay = (Math.random() * 4) + 's';
      capa.appendChild(s);
    }
    pie.insertBefore(capa, pie.firstChild);
  }
  pintarEstrellasPie();

  /**
   *
   * las fotos de las mascotas y de cada método, que todavía no se han subido
   *
   * si una imagen ya tiene foto (src), se muestra y se esconde el cuadro de
   * "Aquí va la foto…". Si el src está vacío se le quita, y el navegador ya
   * no intenta cargar una imagen que no existe
   *
   */
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

  /**
   *
   * tocar una mascota de los lados muestra u oculta su burbuja de
   * información; en celular hace lo mismo que pasar el mouse por encima
   *
   */
  document.querySelectorAll('.animal-lateral').forEach(function (bloque) {
    bloque.addEventListener('click', function () {
      bloque.classList.toggle('tocado');
    });
  });

  /**
   *
   * el botón "Comienza ahora" del inicio baja suavemente hasta la sección de
   * métodos
   *
   */
  var btnCohete = document.getElementById('btnCohete');
  if (btnCohete) {
    btnCohete.addEventListener('click', function () {
      var destino = document.getElementById('metodos');
      if (destino) destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /**
   *
   * los 5 pasos de la guía de cada método, que se muestran en la ventana
   * antes de abrir la herramienta
   *
   */
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

  /**
   *
   * el color del nombre del método en el título de la ventana: naranja para
   * Pomodoro, azul cielo para mapas y morado para tarjetas
   *
   */
  var colorGuia = { pomodoro: '#EB5727', mapas: '#83AEE3', tarjetas: '#4b1c71' };

  /**
   *
   * las partes de la ventana de la guía: el fondo oscuro, la ventana, la
   * palabra del título y la lista de pasos
   *
   */
  var overlay = document.getElementById('modalOverlay');
  var modal = document.getElementById('modal');
  var modalPalabra = document.getElementById('modalPalabra');
  var modalPasos = document.getElementById('modalPasos');

  /**
   *
   * cierra la ventana de la guía y vuelve a dejar mover la página
   *
   */
  function cerrarModal() {
    if (overlay) overlay.classList.remove('abierto');
    document.body.style.overflow = '';
  }

  /**
   *
   * abre la ventana con la guía de un método: pone su nombre con mayúscula
   * inicial y en su color, escribe sus pasos y no deja mover la página de
   * fondo mientras está abierta
   *
   */
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

  /**
   *
   * la página de la herramienta a la que se va al darle "¡A darle!" en la
   * ventana (por ejemplo pomodoro.html)
   *
   */
  var enlacePendiente = null;

  /**
   *
   * los botones "Usar …" de cada método
   *
   * si el botón tiene una guía (data-guia), primero abre la ventana con los
   * pasos y guarda a dónde iba. Si no tiene guía, como "Usar Calendario", va
   * directo a su página
   *
   */
  document.querySelectorAll('.btn-usar').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var guia = btn.getAttribute('data-guia');
      var href = btn.getAttribute('href');

      if (guia && GUIA[guia]) {
        e.preventDefault();
        enlacePendiente = href || null;
        abrirModal(guia);
      }
    });
  });

  /**
   *
   * las formas de salir de la ventana: la X la cierra, "¡A darle!" lleva a la
   * herramienta (o cierra si no hay a dónde ir), y también se cierra al hacer
   * clic en el fondo oscuro o con la tecla Escape
   *
   */
  var modalCerrar = document.getElementById('modalCerrar');
  var modalInicio = document.getElementById('modalInicio');
  if (modalCerrar) modalCerrar.addEventListener('click', cerrarModal);
  if (modalInicio) modalInicio.addEventListener('click', function () {
    if (enlacePendiente) {
      window.location.href = enlacePendiente;
    } else {
      cerrarModal();
    }
  });
  if (overlay) overlay.addEventListener('click', function (e) {
    if (e.target === overlay) cerrarModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarModal();
  });

  /**
   *
   * los nombres de los meses y de los días, y la clave con la que se guardan
   * las tareas en la memoria del navegador
   *
   */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var CLAVE_TAREAS = 'futuria_tareas_v1';

  /**
   *
   * la fecha de hoy, el año y el mes que se ven en el calendario (enero = 0),
   * el día elegido y las tareas guardadas, agrupadas por fecha:
   * { "2026-10-17": [ { id, hora, titulo } ] }
   *
   */
  var hoy = new Date();
  var anio = hoy.getFullYear();
  var mes = hoy.getMonth();
  var diaSel = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  var tareas = cargarTareas();

  /**
   *
   * las partes del calendario: la cuadrícula, el título del mes, los campos
   * del formulario, la lista de tareas y el mensaje de día sin tareas
   *
   */
  var calCuadricula = document.getElementById('calCuadricula');
  var calTitulo = document.getElementById('calTitulo');
  var calFecha = document.getElementById('calFecha');
  var calHora = document.getElementById('calHora');
  var calTarea = document.getElementById('calTarea');
  var calForm = document.getElementById('calForm');
  var calLista = document.getElementById('calLista');
  var calVacio = document.getElementById('calVacio');

  /**
   *
   * lee las tareas guardadas en el navegador. Si no hay o están dañadas,
   * empieza sin tareas
   *
   */
  function cargarTareas() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_TAREAS)) || {};
    } catch (e) {
      return {};
    }
  }

  /**
   *
   * guarda todas las tareas en el navegador. Si el navegador no lo permite
   * (por ejemplo en modo privado), sigue sin guardar
   *
   */
  function guardarTareas() {
    try {
      localStorage.setItem(CLAVE_TAREAS, JSON.stringify(tareas));
    } catch (e) {}
  }

  /**
   *
   * convierte una fecha en el texto AAAA-MM-DD con el que se agrupan las
   * tareas
   *
   */
  function claveFecha(d) {
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  /**
   *
   * dice si dos fechas son el mismo día, sin importar la hora
   *
   */
  function mismaFecha(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /**
   *
   * dibuja la cuadrícula del mes que se está viendo
   *
   * la semana empieza el lunes. Primero pone los últimos días del mes
   * anterior que caben en la primera semana, después todos los días del mes
   * y al final los primeros días del mes siguiente hasta completar la última
   * fila de 7
   *
   */
  function renderCalendario() {
    calTitulo.textContent = MESES[mes] + ' ' + anio;

    var primerDia = new Date(anio, mes, 1);
    var diasEnMes = new Date(anio, mes + 1, 0).getDate();
    var diasEnMesAnt = new Date(anio, mes, 0).getDate();
    var desfase = (primerDia.getDay() + 6) % 7;

    calCuadricula.innerHTML = '';

    for (var i = desfase - 1; i >= 0; i--) {
      var fechaAnt = new Date(anio, mes - 1, diasEnMesAnt - i);
      calCuadricula.appendChild(crearCelda(fechaAnt, false));
    }
    for (var d = 1; d <= diasEnMes; d++) {
      calCuadricula.appendChild(crearCelda(new Date(anio, mes, d), true));
    }
    var total = calCuadricula.children.length;
    var resto = (7 - (total % 7)) % 7;
    for (var k = 1; k <= resto; k++) {
      calCuadricula.appendChild(crearCelda(new Date(anio, mes + 1, k), false));
    }
  }

  /**
   *
   * crea el botón de un día del calendario
   *
   * los días de otro mes se ven más claros, el sábado y el domingo de otro
   * color, y se marcan hoy y el día elegido. Si el día tiene tareas lleva un
   * puntito. Al hacer clic queda elegido; si era de otro mes, el calendario
   * pasa a ese mes
   *
   */
  function crearCelda(fecha, esMismoMes) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cal-dia';
    if (!esMismoMes) btn.classList.add('otro-mes');
    var diaSemana = fecha.getDay();
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
        anio = fecha.getFullYear();
        mes = fecha.getMonth();
        renderCalendario();
      }
      renderLista();
    });
    return btn;
  }

  /**
   *
   * escribe una fecha completa, por ejemplo "Sábado 17 de octubre de 2026"
   *
   */
  function textoFecha(d) {
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  /**
   *
   * muestra las tareas del día elegido, ordenadas por hora
   *
   * también escribe la fecha completa en el campo de fecha y lo ensancha al
   * largo de ese texto. Si el día no tiene tareas muestra el mensaje de
   * vacío; si tiene, pone cada una con su hora (o "Sin hora"), su título y
   * una X para borrarla
   *
   */
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

  /**
   *
   * al enviar el formulario se agrega la tarea al día elegido, se guarda en
   * el navegador, se limpian los campos y se vuelve a dibujar. Si no se
   * escribió nada, el cursor vuelve al campo de la tarea
   *
   */
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

  /**
   *
   * las flechas cambian al mes anterior o al siguiente, pasando de año cuando
   * hace falta
   *
   */
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

  /**
   *
   * al abrir la página se dibujan el calendario y las tareas de hoy
   *
   */
  if (calCuadricula) {
    renderCalendario();
    renderLista();
  }

  /**
   *
   * escribe el año actual en el footer
   *
   */
  var anioSpan = document.getElementById('anio');
  if (anioSpan) anioSpan.textContent = new Date().getFullYear();
})();
