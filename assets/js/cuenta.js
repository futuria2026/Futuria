/**
 *
 * los formularios de cuenta: el de registro y el de inicio de sesión. Revisa
 * los campos mientras la persona los llena y los envía a api/auth.php
 *
 * el formulario dice qué hacer con data-accion ("registro" o "login"). Cada
 * campo se revisa al salir de él y, si ya tenía error, con cada letra. Si todo
 * está bien se envía; si el servidor responde con un error lo muestra, y si
 * sale bien lleva a la página de ?volver= (por ejemplo productos.html) o al
 * inicio
 *
 */
(() => {
  const form = document.getElementById('formCuenta');
  if (!form) return;

  const accion = form.dataset.accion;
  const aviso = document.getElementById('avisoForm');
  const boton = form.querySelector('button[type="submit"]');

  /**
   *
   * la página a la que se vuelve después de entrar: la que llega en
   * ?volver=, solo si es el nombre de una página de esta carpeta (por ejemplo
   * "carrito.html"); si no, el inicio
   *
   */
  const volver = new URLSearchParams(location.search).get('volver') || '';
  const destino = /^[a-z0-9-]+\.html$/.test(volver) ? volver : '../index.html';

  /**
   *
   * los enlaces entre registro e inicio de sesión conservan el ?volver=,
   * así la persona termina en la misma página aunque cambie de formulario
   *
   */
  if (destino !== '../index.html') {
    document.querySelectorAll('a[data-conserva-volver]').forEach((a) => {
      a.href = a.getAttribute('href') + '?volver=' + encodeURIComponent(destino);
    });
  }

  /**
   *
   * las reglas de cada campo. Cada regla devuelve true si el valor está bien,
   * o el texto del error. Solo se usan las de los campos que tiene el
   * formulario; la contraseña pide 6 caracteres solo al registrarse
   *
   */
  const reglas = {
    nombre: (v) => (v.trim().length >= 3 && v.trim().length <= 100) || 'Escribe tu nombre (mínimo 3 letras).',
    correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Correo no válido.',
    contrasena: (v) => accion === 'registro'
      ? v.length >= 6 || 'Mínimo 6 caracteres.'
      : v.length > 0 || 'Escribe tu contraseña.',
    confirmar: (v) => v.length === 0 ? 'Confirma tu contraseña.' : v === form.contrasena.value || 'Las contraseñas no coinciden.',
  };
  const campos = Object.keys(reglas).filter((nombre) => form[nombre]);

  /**
   *
   * muestra o quita el error de un campo. Sin error borra el mensaje y el
   * borde rojo y devuelve true; con error lo pinta y devuelve false
   *
   */
  const marcar = (nombre, resultado) => {
    const input = form[nombre];
    const small = form.querySelector(`.error[data-for="${nombre}"]`);
    if (resultado === true) {
      input.classList.remove('invalid');
      small.textContent = '';
      return true;
    }
    input.classList.add('invalid');
    small.textContent = resultado;
    return false;
  };

  /**
   *
   * muestra un mensaje del servidor arriba del botón, o lo esconde si el
   * texto está vacío
   *
   */
  const mostrarAviso = (texto) => {
    aviso.textContent = texto;
    aviso.hidden = !texto;
  };

  /**
   *
   * revisa cada campo al salir de él, y mientras se corrige uno que tiene
   * error lo revisa con cada letra
   *
   */
  campos.forEach((nombre) => {
    const input = form[nombre];
    input.addEventListener('blur', () => marcar(nombre, reglas[nombre](input.value)));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) marcar(nombre, reglas[nombre](input.value));
    });
  });

  /**
   *
   * al enviar: revisa todo, manda los datos a api/auth.php y responde
   *
   * si algún campo falla, pone el cursor en el primero con error y no envía.
   * Mientras espera, el botón queda apagado. Si el servidor dice que un campo
   * está mal (por ejemplo el correo ya registrado), lo marca en ese campo; los
   * demás errores van en el aviso. Si sale bien, va a la página de destino
   *
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mostrarAviso('');

    let ok = true;
    campos.forEach((nombre) => {
      if (!marcar(nombre, reglas[nombre](form[nombre].value))) ok = false;
    });
    if (!ok) {
      form.querySelector('.invalid')?.focus();
      return;
    }

    const datos = { accion };
    campos.forEach((nombre) => { datos[nombre] = form[nombre].value; });

    boton.disabled = true;
    try {
      const res = await fetch('../api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const respuesta = await res.json();
      if (respuesta.ok) {
        location.href = destino;
        return;
      }
      if (respuesta.campo && form[respuesta.campo]) {
        marcar(respuesta.campo, respuesta.error);
        form[respuesta.campo].focus();
      } else {
        mostrarAviso(respuesta.error || 'No se pudo completar, intenta de nuevo.');
      }
    } catch (err) {
      mostrarAviso('No se pudo conectar con el servidor.');
    }
    boton.disabled = false;
  });
})();
