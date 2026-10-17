/* =========================================================
   FUTURIA - JavaScript
   1) Estrellas decorativas   2) Carrusel   3) Menú móvil
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1) Estrellas ---------- */
  const COLORES = ['#dbb6e8', '#FCFCFB', '#83AEE3'];
  document.querySelectorAll('.estrellas').forEach((capa) => {
    for (let i = 0; i < 14; i++) {
      const e = document.createElement('span');
      const t = Math.random() * 10 + 5;
      e.className = 'estrella';
      e.style.top = Math.random() * 100 + '%';
      e.style.left = Math.random() * 100 + '%';
      e.style.width = t + 'px';
      e.style.height = t + 'px';
      e.style.background = COLORES[i % COLORES.length];
      e.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      capa.appendChild(e);
    }
  });

  /* ---------- 2) Carrusel ---------- */
  const carrusel = document.getElementById('carrusel');
  if (carrusel) {
    const pista   = carrusel.querySelector('.carrusel__pista');
    const imgs    = carrusel.querySelectorAll('.carrusel__img');
    const puntos  = carrusel.querySelector('.carrusel__puntos');
    let indice = 0;

    imgs.forEach((_, i) => {
      const p = document.createElement('button');
      p.type = 'button';
      p.className = 'carrusel__punto' + (i === 0 ? ' activo' : '');
      p.setAttribute('aria-label', 'Ir a la imagen ' + (i + 1));
      p.addEventListener('click', () => mostrar(i));
      puntos.appendChild(p);
    });

    function mostrar(i) {
      indice = (i + imgs.length) % imgs.length;
      pista.style.transform = `translateX(-${indice * 100}%)`;
      puntos.querySelectorAll('.carrusel__punto')
        .forEach((p, n) => p.classList.toggle('activo', n === indice));
    }

    carrusel.querySelector('.carrusel__btn--prev').addEventListener('click', () => mostrar(indice - 1));
    carrusel.querySelector('.carrusel__btn--next').addEventListener('click', () => mostrar(indice + 1));

    let auto = setInterval(() => mostrar(indice + 1), 5000);
    carrusel.addEventListener('mouseenter', () => clearInterval(auto));
    carrusel.addEventListener('mouseleave', () => { auto = setInterval(() => mostrar(indice + 1), 5000); });
  }

  /* ---------- 3) Menú móvil ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const lista  = document.querySelector('.nav__lista');
  if (toggle && lista) {
    toggle.addEventListener('click', () => {
      const abierto = lista.classList.toggle('abierto');
      toggle.setAttribute('aria-expanded', String(abierto));
    });
    lista.addEventListener('click', (ev) => {
      if (ev.target.tagName === 'A') {
        lista.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
    (function () {
      var btn = document.getElementById('nbBtn');
      var items = document.getElementById('nbItems');
      if (btn && items) {
        btn.addEventListener('click', function () {
          items.classList.toggle('nb-abierto');
        });
      }
    })();