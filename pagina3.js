/* =========================================================
   FUTURIA - Página 3 (TEST VOCACIONAL)
   1) Carga los tests desde test-vocacional.php (con respaldo local)
   2) Pinta cada tarjeta: imagen, título, descripción, etiquetas
      y un botón que guía al test vocacional
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('tests-grid');
  if (!grid) return;

  const resumenEl = document.getElementById('test-resumen');

  /* ---------- Respaldo si se abre sin servidor PHP ---------- */
  const RESPALDO = {
    resumen:
      'El test vocacional es una herramienta de orientación que te ayuda a descubrir tus ' +
      'intereses, habilidades y aptitudes para tomar decisiones sobre tu futuro. A través ' +
      'de preguntas sobre lo que te gusta hacer, lo que se te da bien y lo que valoras, ' +
      'el test te muestra áreas profesionales que encajan contigo.',
    tests: [
      {
        id: 'chaside',
        nombre: 'Test CHASIDE',
        etiqueta: 'Intereses y aptitudes',
        descripcion:
          'El test CHASIDE mide tus intereses y aptitudes en nueve áreas profesionales. ' +
          'Responde una serie de preguntas sobre actividades que te gustan o disgustan y ' +
          'el resultado te muestra las áreas donde tendrías mayor probabilidad de éxito y satisfacción.',
        etiquetas: ['9 áreas', 'Intereses', 'Aptitudes', '~15 min'],
        boton: 'Hacer el test CHASIDE',
        enlace: 'https://orientacion-psicopedagogica.net/test/test-chaside/',
        imagen: 'img/test-vocacional-1.jpg'
      },
      {
        id: 'holland',
        nombre: 'Test de Holland (RIASEC)',
        etiqueta: 'Personalidad profesional',
        descripcion:
          'El test de Holland clasifica tu personalidad profesional en seis tipos (Realista, ' +
          'Investigador, Artístico, Social, Emprendedor y Convencional). Conoce cuál es tu ' +
          'código RIASEC y descubre las carreras y ocupaciones que mejor combinan con tu forma de ser.',
        etiquetas: ['6 tipos', 'RIASEC', 'Carreras', '~10 min'],
        boton: 'Hacer el test de Holland',
        enlace: 'https://www.orientacionuniversitaria.com/test-vocacional/test-de-holland/',
        imagen: 'img/test-vocacional-2.jpg'
      }
    ]
  };

  fetch('test-vocacional.php')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (d.resumen && resumenEl) resumenEl.textContent = d.resumen;
      pintar(d.tests || RESPALDO.tests);
    })
    .catch(() => pintar(RESPALDO.tests));

  /* ---------- Pintado ---------- */
  function pintar(tests) {
    grid.innerHTML = '';
    tests.forEach((t, i) => grid.appendChild(tarjeta(t, i)));
  }

  function tarjeta(t, i) {
    const article = document.createElement('article');
    article.className = 'test' + (i % 2 === 1 ? ' test--alterno' : '');
    article.id = t.id;

    const etiquetas = (t.etiquetas || [])
      .map((e) => `<li>${e}</li>`)
      .join('');

    article.innerHTML = `
      <div class="test__imagen">
        <span class="test__etiqueta">${t.etiqueta}</span>
        <img src="${t.imagen}" alt="Ilustración del ${t.nombre}" width="800" height="600" loading="lazy">
      </div>
      <div class="test__cuerpo">
        <h3 class="test__titulo">${t.nombre}</h3>
        <p class="test__texto">${t.descripcion}</p>
        <ul class="test__lista">${etiquetas}</ul>
        <a class="test__boton" href="${t.enlace}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14"/>
            <path d="M12 5l7 7-7 7"/>
          </svg>
          ${t.boton}
        </a>
      </div>`;

    return article;
  }
});
