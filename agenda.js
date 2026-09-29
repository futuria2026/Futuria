/* =========================================================
   FUTURIA · Agenda escolar - agenda.js
   ========================================================= */
(function () {
  'use strict';

  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  var hoy = new Date();
  var vista = { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  var fechaSeleccionada = formatoFecha(hoy);
  var tareas = [];

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

  function formatoFecha(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function tareasPorFecha(fecha) {
    return tareas.filter(function (t) { return t.fecha === fecha; })
                 .sort(function (a, b) { return (a.hora || '99:99').localeCompare(b.hora || '99:99'); });
  }

  function pintarCalendario() {
    el.titulo.textContent = MESES[vista.mes] + ' ' + vista.anio;
    el.cuadricula.innerHTML = '';

    var primerDia = new Date(vista.anio, vista.mes, 1);
    var offset = (primerDia.getDay() + 6) % 7; // lunes = 0
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

  function escaparHTML(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  async function cargar() {
    try {
      var res = await fetch('agenda.php?accion=listar');
      var datos = await res.json();
      tareas = datos.ok ? (datos.tareas || []) : [];
    } catch (e) { tareas = []; }
    pintarCalendario();
    pintarLista();
  }

  el.prev.addEventListener('click', function () {
    vista.mes--; if (vista.mes < 0) { vista.mes = 11; vista.anio--; }
    pintarCalendario();
  });
  el.next.addEventListener('click', function () {
    vista.mes++; if (vista.mes > 11) { vista.mes = 0; vista.anio++; }
    pintarCalendario();
  });

  el.fecha.value = fechaSeleccionada;

  el.form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var texto = el.texto.value.trim();
    var fecha = el.fecha.value || fechaSeleccionada;
    var hora = el.hora.value;
    if (!texto) return;

    try {
      var res = await fetch('agenda.php', {
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
    } catch (err) { /* silencioso */ }
  });

  el.lista.addEventListener('click', async function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    try {
      var res = await fetch('agenda.php', {
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
    } catch (err) { /* silencioso */ }
  });

  cargar();

  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () { items.classList.toggle('nb-abierto'); });
  }
})();
