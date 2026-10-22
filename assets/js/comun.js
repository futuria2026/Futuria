/**
 *
 * lo que comparten todas las páginas con la barra de navegación lila: las
 * estrellas que brillan de fondo, el botón del menú en celular, el año del
 * footer y los enlaces de la sesión ("Ingresar" o "Salir" y el carrito)
 *
 * se carga antes del script propio de cada página. Todo va dentro de una
 * función que se ejecuta sola, y sus variables solo existen ahí adentro
 *
 */
(function () {
  'use strict';

  /**
   *
   * los colores de las estrellas: en las secciones oscuras lila, blanco y
   * azul cielo; en las secciones claras lila, azul cielo y naranja
   *
   */
  var COLORES = ['#dbb6e8', '#FCFCFB', '#83AEE3'];
  var COLORES_CLARAS = ['#dbb6e8', '#83AEE3', '#FE6A00'];

  /**
   *
   * llena cada caja .estrellas con estrellitas de cuatro puntas
   *
   * pone 16 estrellas en las secciones oscuras y 10 en las claras
   * (.estrellas--claras). Cada una sale en un lugar al azar, mide entre 5 y
   * 15 píxeles, toma los colores por turnos y empieza a brillar con un
   * retraso al azar de hasta 3 segundos, así cada una brilla a su tiempo
   *
   */
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

  /**
   *
   * la barra, su botón de las 3 rayas y la lista de enlaces
   *
   */
  var barra = document.querySelector('.nb');
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');

  /**
   *
   * revisa si los enlaces caben en una fila y, si no caben, pasa la barra al
   * modo compacto (.nb--compacta), con el botón de las 3 rayas
   *
   * quita la clase, mide si la lista es más ancha que el espacio del menú y
   * la vuelve a poner si hace falta. Se llama al cargar, al cambiar el tamaño
   * de la ventana, cuando termina de cargar la fuente y cuando cambian los
   * enlaces (el número del carrito, "Mi perfil" o "Admin")
   *
   */
  function ajustarBarra() {
    if (!barra || !items) return;
    barra.classList.remove('nb--compacta');
    var noCabe = items.scrollWidth > items.parentNode.clientWidth;
    barra.classList.toggle('nb--compacta', noCabe);
  }
  ajustarBarra();
  window.addEventListener('resize', ajustarBarra);
  if (document.fonts) document.fonts.ready.then(ajustarBarra);

  /**
   *
   * el botón de las 3 rayas (solo se ve en el modo compacto) abre y cierra el
   * menú poniéndole o quitándole la clase nb-abierto
   *
   * al tocar cualquier enlace del menú, o al hacer clic fuera de la barra, el
   * menú se cierra
   *
   */
  function cerrarMenu() {
    items.classList.remove('nb-abierto');
    btn.setAttribute('aria-expanded', 'false');
  }
  if (btn && items) {
    btn.addEventListener('click', function () {
      var abierto = items.classList.toggle('nb-abierto');
      btn.setAttribute('aria-expanded', String(abierto));
    });
    items.addEventListener('click', function (e) {
      if (e.target.closest('a')) cerrarMenu();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nb')) cerrarMenu();
    });
  }

  /**
   *
   * si una imagen no carga (por ejemplo una foto de producto que todavía no
   * se ha subido), en su lugar se muestra el logo de Futuria centrado sobre
   * fondo hueso, así la página no se ve rota
   *
   * escucha los errores de todas las imágenes de la página, también las que
   * se crean después con JavaScript. Cambia cada imagen una sola vez, para
   * no repetir si el logo tampoco carga. Se salta las fotos de métodos
   * (.mascota y .real), que tienen su propio cuadro de "Aquí va la foto"
   *
   */
  var LOGO = new URL('../img/logo-futuria.jpeg', document.currentScript.src).href;
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.respaldo || img.matches('.mascota, .real')) return;
    img.dataset.respaldo = '1';
    img.src = LOGO;
    img.style.objectFit = 'contain';
    img.style.background = '#FCFCFB';
    img.style.padding = '12%';
  }, true);

  /**
   *
   * escribe el año actual en el footer, en las páginas que tienen el espacio
   * #anio
   *
   */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());

  /**
   *
   * la dirección de api/auth.php, calculada desde donde está este archivo
   * (assets/js/comun.js); así sirve igual en index.html y en las páginas de
   * pages/
   *
   */
  var API_AUTH = new URL('../../api/auth.php', document.currentScript.src).href;
  var URL_ADMIN = new URL('../../pages/admin.html', document.currentScript.src).href;
  var URL_PERFIL = new URL('../../pages/perfil.html', document.currentScript.src).href;

  /**
   *
   * los enlaces de la barra que dependen de la sesión: "Carrito" y
   * "Ingresar". Las páginas sin esos enlaces (registro y login) no hacen
   * nada más
   *
   */
  var enlaceCarrito = document.querySelector('#navCarrito a');
  var enlaceCuenta = document.querySelector('#navCuenta a');
  if (!enlaceCarrito || !enlaceCuenta) return;

  /**
   *
   * escribe en el enlace del carrito cuántos productos tiene, por ejemplo
   * "Carrito (3)"; con 0 dice solo "Carrito"
   *
   */
  function pintarCarrito(cantidad) {
    enlaceCarrito.textContent = cantidad > 0 ? 'Carrito (' + cantidad + ')' : 'Carrito';
    ajustarBarra();
  }

  /**
   *
   * cuando otra parte de la página cambia el carrito (productos.js o
   * carrito.js) avisa con el evento "futuria:carrito" y aquí se actualiza el
   * número
   *
   */
  document.addEventListener('futuria:carrito', function (e) {
    pintarCarrito(e.detail.cantidad);
  });

  /**
   *
   * el enlace "Ingresar" lleva al inicio de sesión con ?volver= y el nombre
   * de esta página, así después de entrar se regresa aquí
   *
   */
  var paginaActual = location.pathname.split('/').pop();
  if (/\/pages\/[a-z0-9-]+\.html$/.test(location.pathname) && paginaActual !== 'login.html') {
    enlaceCuenta.href = enlaceCuenta.getAttribute('href') + '?volver=' + encodeURIComponent(paginaActual);
  }

  /**
   *
   * pregunta al servidor quién inició sesión
   *
   * si hay alguien, "Ingresar" cambia por "Salir" (al pasar el mouse dice
   * de quién es la sesión) y el carrito muestra su número. Al tocar "Salir"
   * se cierra la sesión y se recarga la página. Si el servidor no responde,
   * los enlaces se quedan como están
   *
   */
  fetch(API_AUTH + '?accion=sesion')
    .then(function (r) { return r.json(); })
    .then(function (datos) {
      if (!datos.ok || !datos.usuario) return;
      pintarCarrito(datos.carrito);
      if (datos.usuario.rol === 'admin' && !document.getElementById('navAdmin')) {
        var li = document.createElement('li');
        li.id = 'navAdmin';
        var a = document.createElement('a');
        a.href = URL_ADMIN;
        a.textContent = 'Admin';
        li.appendChild(a);
        enlaceCarrito.parentNode.parentNode.insertBefore(li, enlaceCarrito.parentNode);
      }
      if (!document.getElementById('navPerfil')) {
        var lp = document.createElement('li');
        lp.id = 'navPerfil';
        var ap = document.createElement('a');
        ap.href = URL_PERFIL;
        ap.title = 'Editar mi perfil';
        if (datos.usuario.foto) {
          var im = document.createElement('img');
          im.src = datos.usuario.foto;
          im.alt = '';
          im.style.cssText = 'width:26px;height:26px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px';
          ap.appendChild(im);
        }
        ap.appendChild(document.createTextNode('Mi perfil'));
        lp.appendChild(ap);
        enlaceCarrito.parentNode.parentNode.insertBefore(lp, enlaceCarrito.parentNode);
      }
      enlaceCuenta.textContent = 'Salir';
      enlaceCuenta.title = 'Cerrar la sesión de ' + datos.usuario.nombre;
      ajustarBarra();
      enlaceCuenta.href = '#';
      enlaceCuenta.addEventListener('click', function (e) {
        e.preventDefault();
        fetch(API_AUTH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'logout' })
        }).then(function () { location.reload(); });
      });
    })
    .catch(function () {});
})();
