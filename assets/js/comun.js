/* =========================================================
   FUTURIA - JavaScript común (páginas con la barra .nb)
   1) Estrellas decorativas   2) Menú móvil   3) Año del footer
   Se carga antes del script propio de cada página.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1) Estrellas ---------- */
  var COLORES = ['#dbb6e8', '#FCFCFB', '#83AEE3'];
  var COLORES_CLARAS = ['#dbb6e8', '#83AEE3', '#FE6A00'];

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

  /* ---------- 2) Menú móvil ---------- */
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () {
      items.classList.toggle('nb-abierto');
    });
  }

  /* ---------- 3) Año del footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
