/**
 *
 * la agenda escolar: un calendario del mes donde se eligen días y se agregan
 * o borran tareas con hora
 *
 * las tareas se guardan en api/agenda.php. Los días que tienen tareas
 * muestran un puntito, y al elegir un día se ven sus tareas ordenadas por hora
 *
 */
(function () {
  'use strict';

  /**
   *
   * los nombres de los meses, en el orden que usa JavaScript (enero = 0)
   *
   */
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  /**
   *
   * la fecha de hoy, el mes que se está viendo en el calendario, el día
   * elegido (como texto AAAA-MM-DD) y todas las tareas de la persona
   *
   */
  var hoy = new Date();
  var vista = { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  var fechaSeleccionada = formatoFecha(hoy);
  var tareas = [];

  /**
   *
   * las partes de la página: el título del mes, las flechas, la cuadrícula
   * de días, el formulario con sus campos y la lista de tareas del día
   *
   */
  var el = {
    titulo: document.getElementById('agTitulo'),
    prev: document.getElementById('agPrev'),
    next: document.getElementById('agNext'),
    cuadricula: document.getElementById('agCuadricula'),
    form: document.getElementById('agForm'),
    fecha: document.getElementById('agFecha'),
    hora: document.getElementById('agHora'),
    texto: document.getElementById('agTexto'),
    listaTitulo: document.getElementById('agListaTitulo'),
    lista: document.getElementById('agLista')
  };

  /**
   *
   * convierte una fecha en el texto AAAA-MM-DD, por ejemplo "2026-10-17"
   *
   */
  function formatoFecha(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /**
   *
   * las tareas de un día, ordenadas por hora. Las que no tienen hora quedan
   * al final
   *
   */
  function tareasPorFecha(fecha) {
    return tareas.filter(function (t) { return t.fecha === fecha; })
                 .sort(function (a, b) { return (a.hora || '99:99').localeCompare(b.hora || '99:99'); });
  }

  /**
   *
   * dibuja la cuadrícula del mes que se está viendo
   *
   * la semana empieza el lunes: primero pone casillas vacías hasta
   * el día de la semana en que cae el 1. Después una casilla por día: marca
   * hoy y el día elegido, y pone un puntito si ese día tiene tareas. Al hacer
   * clic en un día, ese queda elegido, se copia al campo Fecha y se muestran
   * sus tareas
   *
   */
  function pintarCalendario() {
    el.titulo.textContent = MESES[vista.mes] + ' ' + vista.anio;
    el.cuadricula.innerHTML = '';

    var primerDia = new Date(vista.anio, vista.mes, 1);
    var offset = (primerDia.getDay() + 6) % 7;
    var diasEnMes = new Date(vista.anio, vista.mes + 1, 0).getDate();
    var hoyStr = formatoFecha(hoy);

    for (var i = 0; i < offset; i++) {
      var vacio = document.createElement('div');
      vacio.className = 'ag-dia vacio';
      el.cuadricula.appendChild(vacio);
    }

    for (var dia = 1; dia <= diasEnMes; dia++) {
      var fechaStr = vista.anio + '-' + String(vista.mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
      var celda = document.createElement('div');
      celda.className = 'ag-dia' + (fechaStr === hoyStr ? ' hoy' : '') + (fechaStr === fechaSeleccionada ? ' seleccionado' : '');
      celda.innerHTML = '<span>' + dia + '</span>';
      if (tareasPorFecha(fechaStr).length) {
        var punto = document.createElement('span');
        punto.className = 'ag-punto';
        celda.appendChild(punto);
      }
      celda.addEventListener('click', function () {
        fechaSeleccionada = this.dataset.fecha;
        el.fecha.value = fechaSeleccionada;
        pintarCalendario();
        pintarLista();
      }.bind(celda));
      celda.dataset.fecha = fechaStr;
      el.cuadricula.appendChild(celda);
    }
  }

  /**
   *
   * muestra las tareas del día elegido con el título "Tareas del 17 de
   * octubre": cada una con su hora (o "Sin hora"), su texto y un botón
   * Eliminar. Si no hay ninguna muestra "Sin tareas este día"
   *
   */
  function pintarLista() {
    var d = new Date(fechaSeleccionada + 'T00:00:00');
    el.listaTitulo.textContent = 'Tareas del ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    var lista = tareasPorFecha(fechaSeleccionada);
    el.lista.innerHTML = '';
    if (!lista.length) {
      el.lista.innerHTML = '<p class="ag-vacio">Sin tareas este día. ¡Agrega la primera!</p>';
      return;
    }
    lista.forEach(function (t) {
      var item = document.createElement('div');
      item.className = 'ag-item';
      item.innerHTML =
        '<div><b>' + (t.hora || 'Sin hora') + '</b><p>' + escaparHTML(t.texto) + '</p></div>' +
        '<button type="button" data-id="' + t.id + '">Eliminar</button>';
      el.lista.appendChild(item);
    });
  }

  /**
   *
   * convierte un texto en HTML seguro: si alguien escribe etiquetas en una
   * tarea, se ven como texto y no cambian la página
   *
   */
  function escaparHTML(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /**
   *
   * trae las tareas guardadas al abrir la página y dibuja el calendario y la
   * lista. Si falla, empieza sin tareas
   *
   */
  async function cargar() {
    try {
      var res = await fetch('../api/agenda.php?accion=listar');
      var datos = await res.json();
      tareas = datos.ok ? (datos.tareas || []) : [];
    } catch (e) { tareas = []; }
    pintarCalendario();
    pintarLista();
  }

  /**
   *
   * las flechas cambian al mes anterior o al siguiente, pasando de año cuando
   * hace falta (de enero se va a diciembre del año anterior y al revés)
   *
   */
  el.prev.addEventListener('click', function () {
    vista.mes--; if (vista.mes < 0) { vista.mes = 11; vista.anio--; }
    pintarCalendario();
  });
  el.next.addEventListener('click', function () {
    vista.mes++; if (vista.mes > 11) { vista.mes = 0; vista.anio++; }
    pintarCalendario();
  });

  /**
   *
   * el campo Fecha arranca con el día de hoy
   *
   */
  el.fecha.value = fechaSeleccionada;

  /**
   *
   * al enviar el formulario se agrega la tarea en el servidor
   *
   * usa la fecha del campo (o el día elegido si está vacío) y la hora si se
   * puso. Si el servidor la guarda, se usa la lista que devuelve, ese día
   * queda elegido, se limpian el texto y la hora y se vuelve a dibujar. Si
   * falla, no pasa nada
   *
   */
  el.form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var texto = el.texto.value.trim();
    var fecha = el.fecha.value || fechaSeleccionada;
    var hora = el.hora.value;
    if (!texto) return;

    try {
      var res = await fetch('../api/agenda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'agregar', fecha: fecha, hora: hora, texto: texto })
      });
      var datos = await res.json();
      if (datos.ok) {
        tareas = datos.tareas;
        fechaSeleccionada = fecha;
        el.texto.value = '';
        el.hora.value = '';
        pintarCalendario();
        pintarLista();
      }
    } catch (err) {}
  });

  /**
   *
   * el botón Eliminar de cada tarea la borra en el servidor y vuelve a
   * dibujar con la lista que devuelve
   *
   * hay un solo escuchador para toda la lista; mira si el clic cayó en un
   * botón con data-id y usa ese id
   *
   */
  el.lista.addEventListener('click', async function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    try {
      var res = await fetch('../api/agenda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'eliminar', id: btn.dataset.id })
      });
      var datos = await res.json();
      if (datos.ok) {
        tareas = datos.tareas;
        pintarCalendario();
        pintarLista();
      }
    } catch (err) {}
  });

  /**
   *
   * al abrir la página se cargan las tareas guardadas
   *
   */
  cargar();

})();
