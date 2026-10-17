/**
 *
 * el lienzo de la página de mapas mentales: un tema central del que salen
 * ramas con ideas, que se pueden agregar, mover, editar, pintar y borrar
 *
 * cada idea es un nodo { id, texto, color, x, y, padre }. Los nodos son
 * cuadritos posicionados encima del lienzo y las líneas entre ellos se dibujan
 * en un SVG de fondo. Cada cambio se guarda en api/mapas-mentales.php
 *
 */
(function () {
  'use strict';

  /**
   *
   * los 5 colores que se pueden elegir para las ramas: morado, azul noche,
   * naranja, azul cielo y lila oscuro
   *
   */
  var COLORES = ['#4b1c71', '#2d2c57', '#EB5727', '#83AEE3', '#8a5aa8'];

  /**
   *
   * todos los nodos del mapa, el id del nodo seleccionado (o null si no hay
   * ninguno) y el color elegido para las ramas nuevas
   *
   */
  var nodos = [];
  var seleccionadoId = null;
  var colorActivo = COLORES[0];

  /**
   *
   * las partes de la página: el lienzo, el SVG de las líneas, el cuadro de
   * texto, los botones Agregar, Eliminar y Centrar, y la fila de colores
   *
   */
  var el = {
    lienzo: document.getElementById('mmLienzo'),
    svg: document.getElementById('mmLineas'),
    entrada: document.getElementById('mmTexto'),
    btnAgregar: document.getElementById('mmAgregar'),
    btnEliminar: document.getElementById('mmEliminar'),
    btnCentro: document.getElementById('mmCentro'),
    colores: document.getElementById('mmColores')
  };

  /**
   *
   * crea un id para un nodo nuevo con la hora actual y un número al azar
   *
   */
  function idUnico() { return 'nd_' + Date.now() + '_' + Math.floor(Math.random() * 1000); }

  /**
   *
   * el ancho y el alto del lienzo en pantalla, en píxeles
   *
   */
  function medidasLienzo() {
    var r = el.lienzo.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  /**
   *
   * el tema central: el único nodo que no sale de ningún otro (padre null)
   *
   */
  function nodoRaiz() { return nodos.find(function (n) { return n.padre === null; }); }

  /**
   *
   * si el mapa no tiene tema central, crea uno que dice "Tema central" en la
   * mitad del lienzo
   *
   */
  function crearRaizSiNoExiste() {
    if (nodoRaiz()) return;
    var m = medidasLienzo();
    nodos.push({ id: idUnico(), texto: 'Tema central', color: COLORES[0], x: m.w / 2, y: m.h / 2, padre: null });
  }

  /**
   *
   * los nodos que salen directamente de un nodo
   *
   */
  function hijosDe(id) { return nodos.filter(function (n) { return n.padre === id; }); }

  /**
   *
   * dónde poner una rama nueva alrededor de su nodo padre
   *
   * las ramas se reparten en círculo a 130 píxeles del padre: la primera va
   * arriba y cada una siguiente gira 55 grados en el sentido del reloj
   *
   */
  function posicionParaHijo(padre) {
    var hermanos = hijosDe(padre.id).length;
    var angulo = (hermanos * 55) * (Math.PI / 180) - Math.PI / 2;
    var radio = 130;
    return { x: padre.x + Math.cos(angulo) * radio, y: padre.y + Math.sin(angulo) * radio };
  }

  /**
   *
   * vuelve a dibujar todo el mapa
   *
   * borra los nodos de la pantalla y los crea de nuevo en su posición y con
   * su color; cada uno responde al arrastre, al doble clic (editar) y al clic
   * (seleccionar). Después dibuja una línea desde cada nodo hasta su padre y
   * apaga el botón Eliminar si no hay nada seleccionado o si lo seleccionado
   * es el tema central
   *
   */
  function render() {
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

  /**
   *
   * marca un nodo como seleccionado (o ninguno con null) y vuelve a dibujar
   *
   */
  function seleccionar(id) {
    seleccionadoId = id;
    render();
  }

  /**
   *
   * hacer clic en un espacio vacío del lienzo quita la selección
   *
   */
  el.lienzo.addEventListener('click', function () { seleccionar(null); });

  /**
   *
   * cambia el texto de un nodo con una ventanita del navegador. Si se cancela
   * o se deja vacío no cambia nada; el texto se corta a 120 letras y se guarda
   *
   */
  function editarNodo(id) {
    var n = nodos.find(function (x) { return x.id === id; });
    if (!n) return;
    var nuevo = window.prompt('Editar texto del nodo:', n.texto);
    if (nuevo === null) return;
    nuevo = nuevo.trim();
    if (nuevo) { n.texto = nuevo.slice(0, 120); render(); guardar(); }
  }

  /**
   *
   * crea una rama con lo escrito en el cuadro de texto
   *
   * la rama sale del nodo seleccionado, o del tema central si no hay ninguno
   * seleccionado. Toma el color elegido, queda seleccionada (para colgarle
   * más ramas) y se guarda
   *
   */
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

  /**
   *
   * borra el nodo seleccionado junto con todas las ramas que salen de él
   *
   * el tema central no se puede borrar. Para encontrar todas las ramas de
   * abajo, repite la búsqueda hasta que ya no aparezcan nodos nuevos cuyo
   * padre esté en la lista para borrar
   *
   */
  function eliminarSeleccionado() {
    if (!seleccionadoId) return;
    var raiz = nodoRaiz();
    if (raiz && raiz.id === seleccionadoId) return;

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

  /**
   *
   * mueve todo el mapa hasta que el tema central queda en la mitad del
   * lienzo, sin cambiar la forma del mapa
   *
   */
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

  /**
   *
   * el nodo que se está arrastrando y a qué distancia del centro del nodo se
   * agarró, o null si no se está arrastrando nada
   *
   */
  var arrastrando = null;

  /**
   *
   * empieza a arrastrar un nodo cuando se presiona encima con el mouse o el
   * dedo: lo selecciona, recuerda dónde se agarró y empieza a escuchar el
   * movimiento en toda la ventana
   *
   */
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

  /**
   *
   * mientras se arrastra, mueve el nodo con el puntero sin dejarlo salir del
   * lienzo (queda siempre a 20 píxeles o más del borde)
   *
   */
  function moverArrastre(e) {
    if (!arrastrando) return;
    var n = nodos.find(function (x) { return x.id === arrastrando.id; });
    var rectLienzo = el.lienzo.getBoundingClientRect();
    n.x = Math.max(20, Math.min(rectLienzo.width - 20, e.clientX - rectLienzo.left - arrastrando.offX));
    n.y = Math.max(20, Math.min(rectLienzo.height - 20, e.clientY - rectLienzo.top - arrastrando.offY));
    render();
  }

  /**
   *
   * al soltar el nodo se guarda su nueva posición y se deja de escuchar el
   * movimiento
   *
   */
  function terminarArrastre() {
    if (arrastrando) guardar();
    arrastrando = null;
    window.removeEventListener('pointermove', moverArrastre);
    window.removeEventListener('pointerup', terminarArrastre);
  }

  /**
   *
   * crea un botón redondo por cada color. Al hacer clic, ese color queda
   * marcado y será el de las próximas ramas
   *
   */
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

  /**
   *
   * trae el mapa guardado en el servidor al abrir la página. Si falla o no
   * hay nada, empieza solo con el tema central
   *
   */
  async function cargar() {
    try {
      var res = await fetch('../api/mapas-mentales.php?accion=cargar');
      var datos = await res.json();
      nodos = datos.ok ? (datos.nodos || []) : [];
    } catch (e) { nodos = []; }
    crearRaizSiNoExiste();
    render();
  }

  /**
   *
   * guarda el mapa en el servidor
   *
   * espera 350 milisegundos antes de enviar; si llega otro cambio en ese
   * tiempo, vuelve a esperar. Así, al arrastrar o hacer varios cambios
   * seguidos, se envía una sola vez. Si falla no muestra error
   *
   */
  var guardarTimeout = null;
  function guardar() {
    clearTimeout(guardarTimeout);
    guardarTimeout = setTimeout(async function () {
      try {
        await fetch('../api/mapas-mentales.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'guardar', nodos: nodos })
        });
      } catch (e) {}
    }, 350);
  }

  /**
   *
   * conecta los botones: Agregar (o la tecla Enter en el cuadro de texto),
   * Eliminar y Centrar. Si cambia el tamaño de la ventana se vuelve a dibujar
   *
   */
  el.btnAgregar.addEventListener('click', agregarNodo);
  el.entrada.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); agregarNodo(); }
  });
  el.btnEliminar.addEventListener('click', eliminarSeleccionado);
  el.btnCentro.addEventListener('click', centrarMapa);
  window.addEventListener('resize', render);

  /**
   *
   * al abrir la página se carga el mapa guardado
   *
   */
  cargar();

})();
