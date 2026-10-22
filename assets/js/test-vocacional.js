/**
 *
 * la página de test vocacional: pide a api/test-vocacional.php el resumen y
 * los tests recomendados y arma una tarjeta por cada test
 *
 * si el servidor no responde (por ejemplo al abrir el HTML sin PHP) usa los
 * mismos datos guardados aquí como respaldo
 *
 */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('tests-grid');
  if (!grid) return;

  const resumenEl = document.getElementById('test-resumen');

  /**
   *
   * los datos de respaldo: el mismo resumen y los mismos cuatro tests
   * (CHASIDE, Holland, Filadd y Edumatch) que devuelve el servidor
   *
   */
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
        imagen: '../assets/img/test-vocacional-1.jpg'
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
        imagen: '../assets/img/test-vocacional-2.jpg'
      },
      {
        id: 'filadd',
        nombre: 'Test vocacional Filadd',
        etiqueta: 'Carrera ideal',
        descripcion:
          'Test interactivo y gratuito pensado para estudiantes colombianos. En menos de 8 minutos ' +
          'te sugiere tu carrera ideal y te muestra recomendaciones de universidades.',
        etiquetas: ['Gratis', 'Menos de 8 min', 'Colombia', 'Universidades'],
        boton: 'Hacer el test de Filadd',
        enlace: 'https://test-vocacional.filadd.com.co/?hl=es-US',
        imagen: '../assets/img/test-vocacional-1.jpg'
      },
      {
        id: 'edumatch',
        nombre: 'Test vocacional Edumatch',
        etiqueta: 'Carreras y universidades',
        descripcion:
          'Test de orientación vocacional online y gratuito de Cursos y Carreras. Te ayuda a descubrir ' +
          'tu vocación y a encontrar carreras y universidades que se ajusten a tu perfil. Para usarlo ' +
          'te pide crear una cuenta.',
        etiquetas: ['Gratis', 'En línea', 'Carreras', 'Universidades'],
        boton: 'Hacer el test de Edumatch',
        enlace: 'https://www.cursosycarreras.co/test_vocacional_orientacion_vocacional.php?hl=es-US',
        imagen: '../assets/img/test-vocacional-2.jpg'
      }
    ]
  };

  /**
   *
   * pide los datos al servidor. Si llegan, cambia el resumen y pinta sus
   * tests; si algo falla, pinta los tests de respaldo
   *
   */
  fetch('../api/test-vocacional.php')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (d.resumen && resumenEl) resumenEl.textContent = d.resumen;
      pintar(d.tests || RESPALDO.tests);
    })
    .catch(() => pintar(RESPALDO.tests));

  /**
   *
   * vacía la cuadrícula y agrega una tarjeta por cada test
   *
   */
  function pintar(tests) {
    grid.innerHTML = '';
    tests.forEach((t, i) => grid.appendChild(tarjeta(t, i)));
  }

  /**
   *
   * arma la tarjeta de un test: la imagen con su etiqueta encima, el nombre,
   * la descripción, las etiquetas pequeñas y el botón con flecha que abre el
   * test en otra pestaña
   *
   * las tarjetas 2, 4, 6... llevan además la clase test--alterno, que les
   * cambia los colores
   *
   */
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
