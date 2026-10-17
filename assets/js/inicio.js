/* =========================================================
   FUTURIA - Página de inicio: carrusel de "Quiénes somos"
   (estrellas, menú y año están en comun.js)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const carrusel = document.getElementById('carrusel');
  if (!carrusel) return;

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
});
