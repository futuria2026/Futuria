/* =========================================================
   FUTURIA · Mapas mentales - mapas-mentales.js
   ========================================================= */
(function () {
  'use strict';

  var COLORES = ['#4b1c71', '#2d2c57', '#EB5727', '#83AEE3', '#8a5aa8'];

  var nodos = [];               // { id, texto, color, x, y, padre }
  var seleccionadoId = null;
  var colorActivo = COLORES[0];

  var el = {
    lienzo: document.getElementById('mmLienzo'),
    svg: document.getElementById('mmLineas'),
    entrada: document.getElementById('mmTexto'),
    btnAgregar: document.getElementById('mmAgregar'),
    btnEliminar: document.getElementById('mmEliminar'),
    btnCentro: document.getElementById('mmCentro'),
    colores: document.getElementById('mmColores')
  };

  function idUnico() { return 'nd_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }

  function medidasLienzo() {
    var r = el.lienzo.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function nodoRaiz() { return nodos.find(function (n) { return n.padre === null; }); }

  function crearRaizSiNoExiste() {
    if (nodoRaiz()) return;
    var m = medidasLienzo();
    nodos.push({ id: idUnico(), texto: 'Tema central', color: COLORES[0], x: m.w / 2, y: m.h / 2, padre: null });
  }

  function hijosDe(id) { return nodos.filter(function (n) { return n.padre === id; }); }

  function posicionParaHijo(padre) {
    var hermanos = hijosDe(padre.id).length;
    var angulo = (hermanos * 55) * (Math.PI / 180) - Math.PI / 2;
    var radio = 130;
    return { x: padre.x + Math.cos(angulo) * radio, y: padre.y + Math.sin(angulo) * radio };
  }

  function render() {
    // Nodos
    el.lienzo.querySelectorAll('.mm-nodo').forEach(function (n) { n.remove(); });
    nodos.forEach(function (n) {
      var div = document.createElement('div');
      div.className = 'mm-nodo' + (n.padre === null ? ' raiz' : '') + (n.id === seleccionadoId ? ' seleccionado' : '');
      div.style.left = n.x + 'px';
      div.style.top = n.y + 'px';
      div.style.background = n.color;
      div.textContent = n.texto;
      div.dataset.id = n.id;
      div.addEventListener('pointerdown', function (e) { iniciarArrastre(e, n.id); });
      div.addEventListener('dblclick', function () { editarNodo(n.id); });
      div.addEventListener('click', function (e) { e.stopPropagation(); seleccionar(n.id); });
      el.lienzo.appendChild(div);
    });

    // Líneas
    var m = medidasLienzo();
    el.svg.setAttribute('viewBox', '0 0 ' + m.w + ' ' + m.h);
    el.svg.innerHTML = '';
    nodos.forEach(function (n) {
      if (n.padre === null) return;
      var padre = nodos.find(function (p) { return p.id === n.padre; });
      if (!padre) return;
      var linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      linea.setAttribute('x1', padre.x); linea.setAttribute('y1', padre.y);
      linea.setAttribute('x2', n.x); linea.setAttribute('y2', n.y);
      el.svg.appendChild(linea);
    });

    el.btnEliminar.disabled = !seleccionadoId || (nodoRaiz() && nodoRaiz().id === seleccionadoId);
  }

  function seleccionar(id) {
    seleccionadoId = id;
    render();
  }

  el.lienzo.addEventListener('click', function () { seleccionar(null); });

  function editarNodo(id) {
    var n = nodos.find(function (x) { return x.id === id; });
    if (!n) return;
    var nuevo = window.prompt('Editar texto del nodo:', n.texto);
    if (nuevo === null) return;
    nuevo = nuevo.trim();
    if (nuevo) { n.texto = nuevo.slice(0, 120); render(); guardar(); }
  }

  function agregarNodo() {
    var texto = el.entrada.value.trim();
    if (!texto) return;
    crearRaizSiNoExiste();

    var padre = seleccionadoId ? nodos.find(function (n) { return n.id === seleccionadoId; }) : nodoRaiz();
    var pos = posicionParaHijo(padre);
    var nuevo = { id: idUnico(), texto: texto.slice(0, 120), color: colorActivo, x: pos.x, y: pos.y, padre: padre.id };
    nodos.push(nuevo);
    seleccionadoId = nuevo.id;
    el.entrada.value = '';
    render();
    guardar();
  }

  function eliminarSeleccionado() {
    if (!seleccionadoId) return;
    var raiz = nodoRaiz();
    if (raiz && raiz.id === seleccionadoId) return; // no se borra el tema central

    var aEliminar = new Set([seleccionadoId]);
    var cambiado = true;
    while (cambiado) {
      cambiado = false;
      nodos.forEach(function (n) {
        if (n.padre && aEliminar.has(n.padre) && !aEliminar.has(n.id)) {
          aEliminar.add(n.id); cambiado = true;
        }
      });
    }
    nodos = nodos.filter(function (n) { return !aEliminar.has(n.id); });
    seleccionadoId = null;
    render();
    guardar();
  }

  function centrarMapa() {
    var raiz = nodoRaiz();
    if (!raiz) return;
    var m = medidasLienzo();
    var dx = (m.w / 2) - raiz.x;
    var dy = (m.h / 2) - raiz.y;
    nodos.forEach(function (n) { n.x += dx; n.y += dy; });
    render();
    guardar();
  }

  // ---- Arrastrar nodos ----
  var arrastrando = null;
  function iniciarArrastre(e, id) {
    e.stopPropagation();
    seleccionar(id);
    var n = nodos.find(function (x) { return x.id === id; });
    var rectLienzo = el.lienzo.getBoundingClientRect();
    arrastrando = {
      id: id,
      offX: e.clientX - rectLienzo.left - n.x,
      offY: e.clientY - rectLienzo.top - n.y
    };
    window.addEventListener('pointermove', moverArrastre);
    window.addEventListener('pointerup', terminarArrastre);
  }
  function moverArrastre(e) {
    if (!arrastrando) return;
    var n = nodos.find(function (x) { return x.id === arrastrando.id; });
    var rectLienzo = el.lienzo.getBoundingClientRect();
    n.x = Math.max(20, Math.min(rectLienzo.width - 20, e.clientX - rectLienzo.left - arrastrando.offX));
    n.y = Math.max(20, Math.min(rectLienzo.height - 20, e.clientY - rectLienzo.top - arrastrando.offY));
    render();
  }
  function terminarArrastre() {
    if (arrastrando) guardar();
    arrastrando = null;
    window.removeEventListener('pointermove', moverArrastre);
    window.removeEventListener('pointerup', terminarArrastre);
  }

  // ---- Colores ----
  COLORES.forEach(function (c, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mm-color' + (i === 0 ? ' activo' : '');
    btn.style.background = c;
    btn.addEventListener('click', function () {
      colorActivo = c;
      el.colores.querySelectorAll('.mm-color').forEach(function (b) { b.classList.remove('activo'); });
      btn.classList.add('activo');
    });
    el.colores.appendChild(btn);
  });

  // ---- Backend ----
  async function cargar() {
    try {
      var res = await fetch('mapas-mentales.php?accion=cargar');
      var datos = await res.json();
      nodos = datos.ok ? (datos.nodos || []) : [];
    } catch (e) { nodos = []; }
    crearRaizSiNoExiste();
    render();
  }

  var guardarTimeout = null;
  function guardar() {
    clearTimeout(guardarTimeout);
    guardarTimeout = setTimeout(async function () {
      try {
        await fetch('mapas-mentales.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'guardar', nodos: nodos })
        });
      } catch (e) { /* silencioso */ }
    }, 350);
  }

  el.btnAgregar.addEventListener('click', agregarNodo);
  el.entrada.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); agregarNodo(); }
  });
  el.btnEliminar.addEventListener('click', eliminarSeleccionado);
  el.btnCentro.addEventListener('click', centrarMapa);
  window.addEventListener('resize', render);

  cargar();

  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () { items.classList.toggle('nb-abierto'); });
  }
})();
