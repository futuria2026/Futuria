/**
 *
 * la página de integrantes: pide a api/integrantes.php los 8 miembros del
 * equipo y pinta una tarjeta por cada uno. Al hacer clic en el círculo, la
 * tarjeta cambia entre la persona y su personaje ilustrado
 *
 * si el servidor no responde, o responde sin integrantes, usa la lista de
 * respaldo escrita aquí, que tiene las fotos reales del equipo
 *
 */

/**
 *
 * los integrantes de respaldo: nombre, foto, qué hace en el proyecto y su
 * personaje (nombre, foto y descripción escrita por el mismo personaje)
 *
 */
var INTEGRANTES_RESPALDO = [
  { nombre:'Isabela M.', imagen:'../assets/img/isabela.jpeg',
    descripcion:'Diseñadora gráfica, diseña los personajes y la estructura visual y gráfica de la guía, juego, etc…',
    animal:{ nombre:'Pipo', imagen:'../assets/img/pipo.jpeg',
      descripcion:'Soy el experto en artes, me encanta trabajar con matices de luz y sombra, hacer ilustraciones coloridas y divertirme contando historias o desarrollando canciones.' } },
  { nombre:'Maria R.', imagen:'../assets/img/maria.jpeg',
    descripcion:'Redactora, revisa la adecuada estructura escrita en las cosas respecto al proyecto tales como la guía y otros textos oficiales del mismo.',
    animal:{ nombre:'Ellie', imagen:'../assets/img/ellie.jpeg',
      descripcion:'Soy la experta en ciencias sociales, si analizas la realidad, cuestionas las estructuras sociales, indagas sobre los conflictos a través del mundo y muestras empatia por los demas, definitivamente eres de los mios.' } },
  { nombre:'Estefania A.', imagen:'../assets/img/estefania.jpeg',
    descripcion:'Publicitaria, se encarga de la gestión de las redes y la parte de publicidad y marketing respecto a la marca.',
    animal:{ nombre:'Willow', imagen:'../assets/img/willow.jpeg',
      descripcion:'Soy la experta en lenguas, soy capaz de cambiar el idoma a mitad de la oración, puedo llegar todos los dias con nuevas palabras en otro idioma y soy capaz de identificar en menos de 3sg que idioma suena.' } },
  { nombre:'Carolina P.', imagen:'../assets/img/caro.jpeg',
    descripcion:'Investigadora, se dedica a buscar la información necesaria que ayude a complementar las ideas para una mejor construcción de la marca.',
    animal:{ nombre:'Copito', imagen:'../assets/img/copito.jpeg',
      descripcion:'Soy Copito la experta en ciencias naturales, siempre busco entender el "porque" de todo, buscar patrones, clasificar, experimentar y no quedarme solo en la teoria.' } },
  { nombre:'Mariana V.', imagen:'../assets/img/mariana.jpeg',
    descripcion:'Líder del equipo y programadora.',
    animal:{ nombre:'Mini', imagen:'../assets/img/mini.jpeg',
      descripcion:'Soy la experta en negocios y la administracion, disfruto pasar horas navegando y consultando sobre oportunidades en el mercado, puedo anticipar tendencias de crecimiento, amo tomar decisiones calculadas y disfruto de inspirar el equipo .' } },
  { nombre:'Paulina L.', imagen:'../assets/img/pau.jpeg',
    descripcion:'Constructora de ideas, organiza y recopila la información, brinda ideas y aportes para una mejor construcción del proyecto, programadora.',
    animal:{ nombre:'Alix', imagen:'../assets/img/alix.jpeg',
      descripcion:'Soy la experta en matemticas, me resulta facil comprender conceptos abtracto, tengo un pensamiento critico y creativo para los problemas y no me frustro rapidamente si no encuentro una respuesta inmediatamente.' } },
  { nombre:'Luciana D.', imagen:'../assets/img/luciana.jpeg',
    descripcion:'Diseñadora Ilustrativa, diseña las gráficas, imágenes y toda la parte del diseño gráfico del proyecto, programadora fronted.',
    animal:{ nombre:'Pequitas', imagen:'../assets/img/pequitas.jpeg',
      descripcion:'Soy experta en recreacion fisica, busco distraerme del estres con actividades fisicas, disfruto sentirme bien tanto fisica como mentalmente, amo la competitividad y disfruto de la compañia de los demas.' } },
  { nombre:'Juan C.', imagen:'../assets/img/juan.jpeg',
    descripcion:'Programador, aplica los lenguajes de programación en la creación de los distintos aplicativos web del proyecto.',
    animal:{ nombre:'Luka', imagen:'../assets/img/luka.jpeg',
      descripcion:'Soy el experto en artes culinarias, desde siempre me a gustado experimentar y descubrir los nuevos sabores, texturas y culturas gastronomicas, y a su vez disfruto de la estetica en los platilos.' } }
];

/**
 *
 * cuando la página termina de cargar se piden los integrantes y se pintan
 *
 */
document.addEventListener('DOMContentLoaded', function () {

  var grid = document.getElementById('integrantes-grid');
  if (!grid) return;

  /**
   *
   * arma la tarjeta de un integrante y la deja lista para cambiar entre la
   * persona y su personaje
   *
   * la tarjeta tiene el nombre, el círculo con la foto grande y una foto
   * pequeña en la esquina (la del otro lado), la descripción y una etiqueta
   * ("Integrante" o "Personaje ilustrado"). El círculo funciona con clic y
   * también con las teclas Enter y espacio
   *
   */
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

    /**
     *
     * pone en la tarjeta los datos del lado que se está mostrando: el nombre,
     * la descripción y la foto grande del frente, y en la foto pequeña el otro
     * lado
     *
     */
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

    /**
     *
     * cambia de lado con una animación corta
     *
     * agrega la clase "cambiando" (que desvanece la tarjeta), espera 300
     * milisegundos, cambia los datos y la quita. Mientras anima, los clics de
     * más se ignoran
     *
     */
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

  /**
   *
   * vacía la cuadrícula y agrega una tarjeta por cada integrante
   *
   */
  function pintarTodos(lista) {
    grid.innerHTML = '';
    lista.forEach(function (dato) { grid.appendChild(tarjeta(dato)); });
  }

  /**
   *
   * pide los integrantes al servidor; si no llegan, usa los de respaldo
   *
   */
  fetch('../api/integrantes.php')
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
