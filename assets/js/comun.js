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
   * el botón de las 3 rayas (solo se ve en pantallas de 920px o menos) abre
   * y cierra el menú poniéndole o quitándole la clase nb-abierto
   *
   */
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () {
      items.classList.toggle('nb-abierto');
    });
  }

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
 

  /**
   *
   * los enlaces de la barra que dependen de la sesión: "Carrito" y
   * "Ingresar". Las páginas sin esos enlaces (registro, login y contacto) no
   * hacen nada más
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
      enlaceCuenta.textContent = 'Salir';
      enlaceCuenta.title = 'Cerrar la sesión de ' + datos.usuario.nombre;
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
