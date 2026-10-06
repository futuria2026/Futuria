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
      descripcion:'Astuta y visionaria, siempre encuentra el camino corto hacia una buena idea. Representa la chispa creativa que abre cada proyecto de Futuria.' } },
  { nombre:'Maria R.', imagen:'img/maria.jpeg',
    descripcion:'Redactado, revisa la adecuada estructura escrita en las cosas respecto al proyecto tales como la guía y otros textos oficiales del mismo.',
    animal:{ nombre:'Ellie', imagen:'img/ellie.jpeg',
      descripcion:'Observador y paciente, analiza antes de decidir. Simboliza la investigación cuidadosa detrás de cada recomendación vocacional.' } },
  { nombre:'Estefania A.', imagen:'img/estefania.jpeg',
    descripcion:'Publicitaria, se encarga de la gestión de las redes y la parte de publicidad y marketing respecto a la marca.',
    animal:{ nombre:'Willow', imagen:'img/willow.jpeg',
      descripcion:'Ordenada y constante, cuida cada detalle del panal. Representa el trabajo minucioso que hace que lo impreso quede perfecto.' } },
  { nombre:'Carolina P.', imagen:'img/caro.jpeg',
    descripcion:'Investigadora, se dedica a buscar la información necesaria que ayude a complementar las ideas para una mejor construcción de la marca.',
    animal:{ nombre:'Copito', imagen:'img/copito.jpeg',
      descripcion:'Comunicativo y alegre, se entiende con todos. Es la voz cercana de Futuria en cada mensaje y comentario.' } },
  { nombre:'Mariana V.', imagen:'img/mariana.jpeg',
    descripcion:'Líder del equipo y programadora.',
    animal:{ nombre:'Mini', imagen:'img/mini.jpeg',
      descripcion:'Rápido y preciso, aprovecha cada segundo sin agotarse. Encarna la buena administración del tiempo que propone Futuria.' } },
  { nombre:'Paulina L.', imagen:'img/pau.jpeg',
    descripcion:'Constructora de ideas, organiza y recopila la información, brinda ideas y aportes para una mejor construcción del proyecto, programadora.',
    animal:{ nombre:'Alix', imagen:'img/alix.jpeg',
      descripcion:'Guarda y organiza todo para el momento justo. Representa los métodos que convierten el repaso en un hábito sencillo.' } },
  { nombre:'Luciana D.', imagen:'img/luciana.jpeg',
    descripcion:'Diseñadora Ilustrativa, diseña las gráficas, imágenes y toda la parte del diseño gráfico del proyecto, programadora fronted.',
    animal:{ nombre:'Pequitas', imagen:'img/pequitas.jpeg',
      descripcion:'Atenta y preguntona, se acerca a lo desconocido sin miedo. Simboliza la curiosidad que da vida a cada entrevista.' } },
  { nombre:'Juan C.', imagen:'img/juan.jpeg',
    descripcion:'Programador, aplica los lenguajes de programación en la creación de los distintos aplicativos web del proyecto.',
    animal:{ nombre:'Luka', imagen:'img/luka.jpeg',
      descripcion:'Resistente y trabajador en equipo, sostiene la manada. Representa la parte técnica que mantiene Futuria funcionando.' } }
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
