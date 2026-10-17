/**
 *
 * la página de productos: pide a api/productos.php el catálogo y arma una
 * tarjeta por producto, con un carrusel de fotos, su información y el botón
 * con el precio
 *
 * si el servidor no responde, o responde sin productos, usa la lista de
 * respaldo escrita aquí. Las tarjetas se alternan: una con las fotos a la
 * izquierda y la siguiente con las fotos a la derecha
 *
 */

/**
 *
 * los productos de respaldo (el libro y las cartas): nombre, eslogan,
 * descripción, características, precio y las 4 fotos de cada uno
 *
 */
var PRODUCTOS_RESPALDO = [
  { nombre:'Libro', eslogan:'Organiza tu año completo',
    descripcion:'Agenda anual con vista semanal y mensual, espacio para metas, seguimiento de hábitos y páginas de repaso por materia. Diseñada para estudiantes de colegio y primeros semestres.',
    caracteristicas:['Vista semanal y mensual','Seguimiento de hábitos','Stickers de Futuria','Portada personalizable'],
    precio:'$65.000 COP', imagenes:['../assets/img/p1-1.jpg','../assets/img/p1-2.jpg','../assets/img/p1-3.jpg','../assets/img/p1-4.jpg'] },
  { nombre:'Cartas', eslogan:'Tu semana en una sola hoja',
    descripcion:'Bloc desprendible de 52 hojas para planear cada semana: tareas, evaluaciones, tiempo libre y bloques de estudio con la técnica Pomodoro.',
    caracteristicas:['52 hojas desprendibles','Bloques Pomodoro','Tamaño A4','Diseño Futuria'],
    precio:'$28.000 COP', imagenes:['../assets/img/p2-1.jpg','../assets/img/p2-2.jpg','../assets/img/p2-3.jpg','../assets/img/p2-4.jpg'] }
];

/**
 *
 * cuando la página termina de cargar se piden los productos y se pintan
 *
 */
document.addEventListener('DOMContentLoaded', function () {

  var contenedor = document.getElementById('productos-lista');
  if (!contenedor) return;

  /**
   *
   * arma el carrusel de fotos de un producto
   *
   * pone todas las fotos una encima de otra y solo deja visible la que tiene
   * la clase "activa". Agrega un puntito por foto, las flechas ‹ › para
   * pasar, y avanza solo cada 5 segundos; se detiene mientras el mouse está
   * encima y vuelve a arrancar al quitarlo
   *
   */
  function crearCarrusel(imagenes, nombre) {
    var wrap = document.createElement('div');
    wrap.className = 'carrusel producto__carrusel';

    var pista = document.createElement('div');
    pista.className = 'carrusel__pista';
    var puntos = document.createElement('div');
    puntos.className = 'carrusel__puntos';

    var imgs = [];
    var botones = [];
    var actual = 0;

    imagenes.forEach(function (src, i) {
      var img = document.createElement('img');
      img.className = 'carrusel__img' + (i === 0 ? ' activa' : '');
      img.src = src;
      img.alt = nombre + ' - imagen ' + (i + 1);
      img.loading = 'lazy';
      pista.appendChild(img);
      imgs.push(img);

      var punto = document.createElement('button');
      punto.type = 'button';
      punto.className = 'carrusel__punto' + (i === 0 ? ' activo' : '');
      punto.setAttribute('aria-label', 'Ver imagen ' + (i + 1) + ' de ' + nombre);
      punto.addEventListener('click', function () { mostrar(i); });
      puntos.appendChild(punto);
      botones.push(punto);
    });

    /**
     *
     * muestra la foto número i. Si se pasa del final vuelve a la primera, y
     * si va antes de la primera salta a la última
     *
     */
    function mostrar(i) {
      actual = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('activa', k === actual); });
      botones.forEach(function (bt, k) { bt.classList.toggle('activo', k === actual); });
    }

    /**
     *
     * las flechas para ir a la foto anterior y a la siguiente
     *
     */
    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carrusel__flecha carrusel__flecha--prev';
    prev.setAttribute('aria-label', 'Imagen anterior');
    prev.innerHTML = '&#10094;';
    prev.addEventListener('click', function () { mostrar(actual - 1); });

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'carrusel__flecha carrusel__flecha--next';
    next.setAttribute('aria-label', 'Imagen siguiente');
    next.innerHTML = '&#10095;';
    next.addEventListener('click', function () { mostrar(actual + 1); });

    wrap.appendChild(pista);
    wrap.appendChild(prev);
    wrap.appendChild(next);
    wrap.appendChild(puntos);

    /**
     *
     * el avance automático cada 5 segundos, que se pausa con el mouse encima
     *
     */
    var timer = setInterval(function () { mostrar(actual + 1); }, 5000);
    wrap.addEventListener('mouseenter', function () { clearInterval(timer); });
    wrap.addEventListener('mouseleave', function () {
      timer = setInterval(function () { mostrar(actual + 1); }, 5000);
    });

    return wrap;
  }

  /**
   *
   * arma la tarjeta de un producto: el carrusel y al lado el nombre, el
   * eslogan, la descripción, la lista de características y el botón del
   * precio
   *
   * las tarjetas 2, 4, 6... llevan la clase producto--invertido, que pone las
   * fotos al otro lado. Al hacer clic en el precio, el botón dice "¡Agregado!"
   * durante 1,8 segundos y vuelve a mostrar el precio (todavía no hay
   * carrito de compras)
   *
   */
  function tarjeta(dato, indice) {
    var art = document.createElement('article');
    art.className = 'producto' + (indice % 2 === 1 ? ' producto--invertido' : '');

    var info = document.createElement('div');
    info.className = 'producto__info';

    var caracteristicas = (dato.caracteristicas || []).map(function (c) {
      return '<li>' + c + '</li>';
    }).join('');

    info.innerHTML =
      '<h3 class="producto__nombre"></h3>' +
      '<p class="producto__eslogan"></p>' +
      '<p class="producto__descripcion"></p>' +
      (caracteristicas ? '<ul class="producto__lista">' + caracteristicas + '</ul>' : '') +
      '<button class="producto__precio" type="button"></button>';

    info.querySelector('.producto__nombre').textContent = dato.nombre;
    info.querySelector('.producto__eslogan').textContent = dato.eslogan || '';
    info.querySelector('.producto__descripcion').textContent = dato.descripcion;

    var boton = info.querySelector('.producto__precio');
    boton.textContent = dato.precio;
    boton.addEventListener('click', function () {
      boton.classList.add('agregado');
      boton.textContent = '¡Agregado! ' + dato.precio;
      setTimeout(function () {
        boton.classList.remove('agregado');
        boton.textContent = dato.precio;
      }, 1800);
    });

    art.appendChild(crearCarrusel(dato.imagenes || [], dato.nombre));
    art.appendChild(info);
    return art;
  }

  /**
   *
   * vacía el catálogo y agrega una tarjeta por cada producto
   *
   */
  function pintarTodos(lista) {
    contenedor.innerHTML = '';
    lista.forEach(function (dato, i) { contenedor.appendChild(tarjeta(dato, i)); });
  }

  /**
   *
   * pide los productos al servidor; si no llegan, usa los de respaldo
   *
   */
  fetch('../api/productos.php')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.ok && data.productos && data.productos.length) {
        pintarTodos(data.productos);
      } else {
        pintarTodos(PRODUCTOS_RESPALDO);
      }
    })
    .catch(function () { pintarTodos(PRODUCTOS_RESPALDO); });
});
