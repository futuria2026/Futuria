/**
 *
 * revisa el formulario de registro mientras la persona lo llena, para
 * mostrarle los errores antes de enviarlo a api/registro.php
 *
 * cada campo se revisa al salir de él, y si ya tenía error se vuelve a
 * revisar con cada letra. Al enviar se revisan todos; si alguno falla, el
 * formulario no se envía y el cursor salta al primer campo con error
 *
 */
(() => {
  const form = document.getElementById('signupForm');
  if (!form) return;

  /**
   *
   * los cinco campos con su regla. Cada regla devuelve true si el valor está
   * bien, o el texto del error que se muestra debajo del campo
   *
   */
  const fields = {
    fullname: { el: form.fullname, validate: v => v.trim().length >= 3 || 'Ingresa al menos 3 caracteres.' },
    email: { el: form.email, validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Correo no válido.' },
    username: { el: form.username, validate: v => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Usuario: 3-20 letras, números o _.' },
    password: { el: form.password, validate: v => v.length >= 6 || 'Mínimo 6 caracteres.' },
    confirm: { el: form.confirm, validate: v => v === form.password.value || 'Las contraseñas no coinciden.' },
  };

  /**
   *
   * muestra o quita el error de un campo. Si no hay error borra el mensaje y
   * el borde rojo y devuelve true; si hay error, lo pinta y devuelve false
   *
   */
  const setError = (name, msg) => {
    const input = fields[name].el;
    const small = form.querySelector(`.error[data-for="${name}"]`);
    if (msg === true || !msg) {
      input.classList.remove('invalid');
      small.textContent = '';
      return true;
    }
    input.classList.add('invalid');
    small.textContent = msg;
    return false;
  };

  /**
   *
   * revisa cada campo al salir de él, y mientras se corrige uno que tiene
   * error lo revisa con cada letra
   *
   */
  Object.entries(fields).forEach(([name, { el, validate }]) => {
    el.addEventListener('blur', () => setError(name, validate(el.value)));
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) setError(name, validate(el.value));
    });
  });

  /**
   *
   * al enviar revisa todos los campos; si alguno falla, detiene el envío y
   * pone el cursor en el primer campo con error
   *
   */
  form.addEventListener('submit', (e) => {
    let ok = true;
    Object.entries(fields).forEach(([name, { el, validate }]) => {
      if (!setError(name, validate(el.value))) ok = false;
    });
    if (!ok) {
      e.preventDefault();
      form.querySelector('.invalid')?.focus();
    }
  });
})();
