/**
 *
 * el carrusel de fotos de la sección "¿Quiénes somos?" en la página de inicio
 *
 * las 3 fotos están una al lado de la otra dentro de una pista, y para
 * mostrar una se corre la pista hacia la izquierda (100% por cada foto).
 * Tiene flechas, un puntito por foto y avanza solo cada 5 segundos; se
 * detiene mientras el mouse está encima
 *
 */
document.addEventListener('DOMContentLoaded', () => {
  const carrusel = document.getElementById('carrusel');
  if (!carrusel) return;

  /**
   *
   * la pista que se mueve, las fotos, la caja de puntitos y la foto que se
   * está mostrando (empieza en la primera, 0)
   *
   */
  const pista   = carrusel.querySelector('.carrusel__pista');
  const imgs    = carrusel.querySelectorAll('.carrusel__img');
  const puntos  = carrusel.querySelector('.carrusel__puntos');
  let indice = 0;

  /**
   *
   * crea un puntito por foto; el de la foto actual queda marcado y al hacer
   * clic en uno se salta a esa foto
   *
   */
  imgs.forEach((_, i) => {
    const p = document.createElement('button');
    p.type = 'button';
    p.className = 'carrusel__punto' + (i === 0 ? ' activo' : '');
    p.setAttribute('aria-label', 'Ir a la imagen ' + (i + 1));
    p.addEventListener('click', () => mostrar(i));
    puntos.appendChild(p);
  });

  /**
   *
   * muestra la foto número i corriendo la pista y marcando su puntito. Si se
   * pasa de la última vuelve a la primera, y al revés
   *
   */
  function mostrar(i) {
    indice = (i + imgs.length) % imgs.length;
    pista.style.transform = `translateX(-${indice * 100}%)`;
    puntos.querySelectorAll('.carrusel__punto')
      .forEach((p, n) => p.classList.toggle('activo', n === indice));
  }

  /**
   *
   * las flechas ‹ › pasan a la foto anterior o a la siguiente
   *
   */
  carrusel.querySelector('.carrusel__btn--prev').addEventListener('click', () => mostrar(indice - 1));
  carrusel.querySelector('.carrusel__btn--next').addEventListener('click', () => mostrar(indice + 1));

  /**
   *
   * el avance automático cada 5 segundos, que se detiene con el mouse encima
   * y vuelve a arrancar al quitarlo
   *
   */
  let auto = setInterval(() => mostrar(indice + 1), 5000);
  carrusel.addEventListener('mouseenter', () => clearInterval(auto));
  carrusel.addEventListener('mouseleave', () => { auto = setInterval(() => mostrar(indice + 1), 5000); });
});
