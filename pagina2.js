/* =========================================================
   FUTURIA - JavaScript de la PÁGINA 2
   1) Estrellas decorativas
   2) Menú móvil
   3) Integrantes (carga desde integrantes2.php + cambio persona/animal)
   ========================================================= */

/* Datos de respaldo: si el sitio se abre sin servidor PHP, la página
   sigue funcionando con esta misma información. */
var INTEGRANTES_RESPALDO = [
  { nombre:'Isabela M.', imagen:'img/isabela.jpeg',
    descripcion:'Diseñadora gráfica, diseña los personajes y la estructura visual y gráfica de la guía, juego, etc…',
    animal:{ nombre:'Pipo', imagen:'img/pipo.jpeg',
      descripcion:'Soy el experto en artes, me encanta trabajar con matices de luz y sombra, hacer ilustraciones coloridas y divertirme contando historias o desarrollando canciones.' } },
  { nombre:'Maria R.', imagen:'img/maria.jpeg',
    descripcion:'Redactora, revisa la adecuada estructura escrita en las cosas respecto al proyecto tales como la guía y otros textos oficiales del mismo.',
    animal:{ nombre:'Ellie', imagen:'img/ellie.jpeg',
      descripcion:'Soy la experta en ciencias sociales, si analizas la realidad, cuestionas las estructuras sociales, indagas sobre los conflictos a través del mundo y muestras empatia por los demas, definitivamente eres de los mios.' } },
  { nombre:'Estefania A.', imagen:'img/estefania.jpeg',
    descripcion:'Publicitaria, se encarga de la gestión de las redes y la parte de publicidad y marketing respecto a la marca.',
    animal:{ nombre:'Willow', imagen:'img/willow.jpeg',
      descripcion:'Soy la experta en lenguas, soy capaz de cambiar el idoma a mitad de la oración, puedo llegar todos los dias con nuevas palabras en otro idioma y soy capaz de identificar en menos de 3sg que idioma suena.' } },
  { nombre:'Carolina P.', imagen:'img/caro.jpeg',
    descripcion:'Investigadora, se dedica a buscar la información necesaria que ayude a complementar las ideas para una mejor construcción de la marca.',
    animal:{ nombre:'Copito', imagen:'img/copito.jpeg',
      descripcion:'Soy Copito la experta en ciencias naturales, siempre busco entender el "porque" de todo, buscar patrones, clasificar, experimentar y no quedarme solo en la teoria.' } },
  { nombre:'Mariana V.', imagen:'img/mariana.jpeg',
    descripcion:'Líder del equipo y programadora.',
    animal:{ nombre:'Mini', imagen:'img/mini.jpeg',
      descripcion:'Soy la experta en negocios y la administracion, disfruto pasar horas navegando y consultando sobre oportunidades en el mercado, puedo anticipar tendencias de crecimiento, amo tomar decisiones calculadas y disfruto de inspirar el equipo .' } },
  { nombre:'Paulina L.', imagen:'img/pau.jpeg',
    descripcion:'Constructora de ideas, organiza y recopila la información, brinda ideas y aportes para una mejor construcción del proyecto, programadora.',
    animal:{ nombre:'Alix', imagen:'img/alix.jpeg',
      descripcion:'Soy la experta en matemticas, me resulta facil comprender conceptos abtracto, tengo un pensamiento critico y creativo para los problemas y no me frustro rapidamente si no encuentro una respuesta inmediatamente.' } },
  { nombre:'Luciana D.', imagen:'img/luciana.jpeg',
    descripcion:'Diseñadora Ilustrativa, diseña las gráficas, imágenes y toda la parte del diseño gráfico del proyecto, programadora fronted.',
    animal:{ nombre:'Pequitas', imagen:'img/pequitas.jpeg',
      descripcion:'Soy experta en recreacion fisica, busco distraerme del estres con actividades fisicas, disfruto sentirme bien tanto fisica como mentalmente, amo la competitividad y disfruto de la compañia de los demas.' } },
  { nombre:'Juan C.', imagen:'img/juan.jpeg',
    descripcion:'Programador, aplica los lenguajes de programación en la creación de los distintos aplicativos web del proyecto.',
    animal:{ nombre:'Luka', imagen:'img/luka.jpeg',
      descripcion:'Soy el experto en artes culinarias, desde siempre me a gustado experimentar y descubrir los nuevos sabores, texturas y culturas gastronomicas, y a su vez disfruto de la estetica en los platilos.' } }
];

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1) Estrellas ---------- */
  var COLORES = ['#dbb6e8', '#FCFCFB', '#83AEE3'];
  document.querySelectorAll('.estrellas').forEach(function (capa) {
    var total = capa.classList.contains('estrellas--claras') ? 10 : 16;
    for (var i = 0; i < total; i++) {
      var e = document.createElement('span');
      var t = Math.random() * 10 + 5;
      e.className = 'estrella';
      e.style.top = Math.random() * 100 + '%';
      e.style.left = Math.random() * 100 + '%';
      e.style.width = t + 'px';
      e.style.height = t + 'px';
      e.style.background = capa.classList.contains('estrellas--claras')
        ? ['#dbb6e8', '#83AEE3', '#FE6A00'][i % 3]
        : COLORES[i % COLORES.length];
      e.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      capa.appendChild(e);
    }
  });

  /* ---------- 2) Menú móvil ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var lista = document.querySelector('.nav__lista');
  if (toggle && lista) {
    toggle.addEventListener('click', function () {
      var abierto = lista.classList.toggle('abierto');
      toggle.setAttribute('aria-expanded', String(abierto));
    });
    lista.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') {
        lista.classList.remove('abierto');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 3) Año del footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());

  /* ---------- 4) Integrantes ---------- */
  var grid = document.getElementById('integrantes-grid');
  if (!grid) return;

  function tarjeta(dato) {
    var art = document.createElement('article');
    art.className = 'integrante';
    art.innerHTML =
      '<h3 class="integrante__nombre"></h3>' +
      '<div class="integrante__circulo" role="button" tabindex="0" aria-label="Cambiar entre la persona y su personaje ilustrado">' +
        '<img class="integrante__principal" alt="">' +
        '<img class="integrante__mini" alt="">' +
      '</div>' +
      '<p class="integrante__descripcion"></p>' +
      '<span class="integrante__etiqueta"></span>';

    var nombre = art.querySelector('.integrante__nombre');
    var desc = art.querySelector('.integrante__descripcion');
    var etiqueta = art.querySelector('.integrante__etiqueta');
    var principal = art.querySelector('.integrante__principal');
    var mini = art.querySelector('.integrante__mini');
    var circulo = art.querySelector('.integrante__circulo');
    var esAnimal = false;
    var animando = false;

    function pintar() {
      var frente = esAnimal ? dato.animal : dato;
      var atras = esAnimal ? dato : dato.animal;
      nombre.textContent = frente.nombre;
      desc.textContent = frente.descripcion;
      etiqueta.textContent = esAnimal ? 'Personaje ilustrado' : 'Integrante';
      principal.src = frente.imagen;
      principal.alt = frente.nombre;
      mini.src = atras.imagen;
      mini.alt = atras.nombre;
      art.classList.toggle('es-animal', esAnimal);
    }

    function alternar() {
      if (animando) return;
      animando = true;
      art.classList.add('cambiando');
      setTimeout(function () {
        esAnimal = !esAnimal;
        pintar();
        art.classList.remove('cambiando');
        animando = false;
      }, 300);
    }

    circulo.addEventListener('click', alternar);
    circulo.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alternar(); }
    });

    pintar();
    return art;
  }

  function pintarTodos(lista) {
    grid.innerHTML = '';
    lista.forEach(function (dato) { grid.appendChild(tarjeta(dato)); });
  }

  fetch('integrantes2.php')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.ok && data.integrantes && data.integrantes.length) {
        pintarTodos(data.integrantes);
      } else {
        pintarTodos(INTEGRANTES_RESPALDO);
      }
    })
    .catch(function () { pintarTodos(INTEGRANTES_RESPALDO); });
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
