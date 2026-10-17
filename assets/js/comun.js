/**
 *
 * lo que comparten todas las páginas con la barra de navegación lila: las
 * estrellas que brillan de fondo, el botón del menú en celular y el año del
 * footer
 *
 * se carga antes del script propio de cada página. Todo va dentro de una
 * función que se ejecuta sola, y sus variables solo existen ahí adentro
 *
 */
(function () {
  'use strict';

  /**
   *
   * los colores de las estrellas: en las secciones oscuras lila, blanco y
   * azul cielo; en las secciones claras lila, azul cielo y naranja
   *
   */
  var COLORES = ['#dbb6e8', '#FCFCFB', '#83AEE3'];
  var COLORES_CLARAS = ['#dbb6e8', '#83AEE3', '#FE6A00'];

  /**
   *
   * llena cada caja .estrellas con estrellitas de cuatro puntas
   *
   * pone 16 estrellas en las secciones oscuras y 10 en las claras
   * (.estrellas--claras). Cada una sale en un lugar al azar, mide entre 5 y
   * 15 píxeles, toma los colores por turnos y empieza a brillar con un
   * retraso al azar de hasta 3 segundos, así cada una brilla a su tiempo
   *
   */
  document.querySelectorAll('.estrellas').forEach(function (capa) {
    var claras = capa.classList.contains('estrellas--claras');
    var colores = claras ? COLORES_CLARAS : COLORES;
    var total = claras ? 10 : 16;
    for (var i = 0; i < total; i++) {
      var e = document.createElement('span');
      var t = Math.random() * 10 + 5;
      e.className = 'estrella';
      e.style.top = Math.random() * 100 + '%';
      e.style.left = Math.random() * 100 + '%';
      e.style.width = t + 'px';
      e.style.height = t + 'px';
      e.style.background = colores[i % colores.length];
      e.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      capa.appendChild(e);
    }
  });

  /**
   *
   * el botón de las 3 rayas (solo se ve en pantallas de 920px o menos) abre
   * y cierra el menú poniéndole o quitándole la clase nb-abierto
   *
   */
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () {
      items.classList.toggle('nb-abierto');
    });
  }

  /**
   *
   * escribe el año actual en el footer, en las páginas que tienen el espacio
   * #anio
   *
   */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
