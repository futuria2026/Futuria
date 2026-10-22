/**
 *
 * la página del carrito: muestra los productos que eligió la persona y deja
 * cambiar las cantidades, quitar productos o vaciar el carrito
 *
 * todo se guarda en api/carrito.php, que después de cada cambio devuelve el
 * carrito completo para volver a pintarlo. Si nadie inició sesión, muestra un
 * enlace para iniciar sesión que después regresa a esta página
 *
 */
(function () {
  'use strict';

  /**
   *
   * las partes de la página: el mensaje de estado, la lista, el resumen con
   * la cantidad y el total, y el botón de vaciar
   *
   */
  var el = {
    estado: document.getElementById('caEstado'),
    lista: document.getElementById('caLista'),
    resumen: document.getElementById('caResumen'),
    cantidad: document.getElementById('caCantidad'),
    total: document.getElementById('caTotal'),
    vaciar: document.getElementById('caVaciar')
  };
  if (!el.lista) return;

  /**
   *
   * le avisa a la barra de navegación (comun.js) cuántos productos hay ahora,
   * con el evento "futuria:carrito"
   *
   */
  function avisarCantidad(cantidad) {
    document.dispatchEvent(new CustomEvent('futuria:carrito', { detail: { cantidad: cantidad } }));
  }

  /**
   *
   * pinta el carrito que devolvió el servidor
   *
   * si está vacío muestra el mensaje con un enlace a productos y esconde el
   * resumen. Si tiene productos, arma una fila por cada uno con su foto, su
   * nombre, el precio por unidad, los botones − y + con la cantidad, el
   * subtotal y el botón Quitar, y actualiza el resumen
   *
   */
  function pintar(carrito) {
    el.lista.innerHTML = '';
    avisarCantidad(carrito.cantidad);

    if (!carrito.items.length) {
      el.estado.hidden = false;
      el.estado.innerHTML = 'Tu carrito está vacío. <a href="productos.html">Mira nuestros productos</a>.';
      el.resumen.hidden = true;
      return;
    }

    el.estado.hidden = true;
    carrito.items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'ca-item';
      li.innerHTML =
        '<div class="ca-foto"><img alt=""></div>' +
        '<div class="ca-info"><b class="ca-nombre"></b><span class="ca-precio"></span></div>' +
        '<div class="ca-cantidad">' +
          '<button type="button" data-accion="menos" aria-label="Quitar una unidad">−</button>' +
          '<span></span>' +
          '<button type="button" data-accion="mas" aria-label="Agregar una unidad">+</button>' +
        '</div>' +
        '<b class="ca-subtotal"></b>' +
        '<button type="button" class="ca-quitar" data-accion="quitar">Quitar</button>';

      var img = li.querySelector('img');
      img.src = item.imagen;
      img.alt = item.nombre;
      img.addEventListener('error', function () { img.remove(); });
      li.querySelector('.ca-nombre').textContent = item.nombre;
      li.querySelector('.ca-precio').textContent = item.precio_texto + ' c/u';
      li.querySelector('.ca-cantidad span').textContent = item.cantidad;
      li.querySelector('.ca-subtotal').textContent = item.subtotal_texto;
      li.dataset.producto = item.producto_id;
      li.dataset.cantidad = item.cantidad;
      el.lista.appendChild(li);
    });

    el.resumen.hidden = false;
    el.cantidad.textContent = carrito.cantidad;
    el.total.textContent = carrito.total_texto;
  }

  /**
   *
   * muestra que hay que iniciar sesión, con un enlace que después regresa al
   * carrito
   *
   */
  function pedirSesion() {
    el.estado.hidden = false;
    el.estado.innerHTML = 'Inicia sesión para ver tu carrito. <a href="login.html?volver=carrito.html">Iniciar sesión</a>';
    el.resumen.hidden = true;
  }

  /**
   *
   * habla con api/carrito.php: sin datos pide el carrito (GET); con datos
   * envía una acción (POST). Si la sesión se cerró, pide iniciar sesión; si
   * no hay conexión, lo dice en el mensaje de estado
   *
   */
  async function pedir(datos) {
    try {
      var res = await fetch('../api/carrito.php', datos ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      } : undefined);
      if (res.status === 401) { pedirSesion(); return; }
      var carrito = await res.json();
      if (carrito.ok) pintar(carrito);
    } catch (e) {
      el.estado.hidden = false;
      el.estado.textContent = 'No se pudo conectar con el servidor.';
    }
  }

  /**
   *
   * los botones de cada fila: − resta una unidad (con 1 unidad, quita el
   * producto), + suma una y Quitar saca el producto
   *
   * hay un solo escuchador para toda la lista; mira qué botón se tocó
   * (data-accion) y de qué producto es la fila
   *
   */
  el.lista.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    var fila = btn.closest('.ca-item');
    var producto = Number(fila.dataset.producto);
    var cantidad = Number(fila.dataset.cantidad);
    var accion = btn.dataset.accion;

    if (accion === 'mas') pedir({ accion: 'cambiar', producto_id: producto, cantidad: cantidad + 1 });
    if (accion === 'menos') pedir({ accion: 'cambiar', producto_id: producto, cantidad: cantidad - 1 });
    if (accion === 'quitar') pedir({ accion: 'quitar', producto_id: producto });
  });

  /**
   *
   * el botón Vaciar carrito saca todos los productos
   *
   */
  el.vaciar.addEventListener('click', function () {
    pedir({ accion: 'vaciar' });
  });

  /**
   *
   * al abrir la página se pide el carrito
   *
   */
  pedir();
})();
