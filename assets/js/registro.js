(() => {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const fields = {
    fullname: { el: form.fullname, validate: v => v.trim().length >= 3 || 'Ingresa al menos 3 caracteres.' },
    email: { el: form.email, validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Correo no válido.' },
    username: { el: form.username, validate: v => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Usuario: 3-20 letras, números o _.' },
    password: { el: form.password, validate: v => v.length >= 6 || 'Mínimo 6 caracteres.' },
    confirm: { el: form.confirm, validate: v => v === form.password.value || 'Las contraseñas no coinciden.' },
  };

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

  Object.entries(fields).forEach(([name, { el, validate }]) => {
    el.addEventListener('blur', () => setError(name, validate(el.value)));
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) setError(name, validate(el.value));
    });
  });

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
