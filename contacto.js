// Envía el formulario al backend PHP (contacto.php) y muestra la respuesta JSON.
document.addEventListener('DOMContentLoaded', function () {
  var form  = document.getElementById('form-contacto');
  var aviso = document.getElementById('aviso');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    aviso.hidden = false;
    aviso.style.color = '';
    aviso.textContent = 'Enviando...';
    try {
      var res  = await fetch('contacto.php', { method: 'POST', body: new FormData(form) });
      var data = await res.json();
      if (data.ok) {
        aviso.textContent = '¡Gracias! Tu mensaje fue enviado correctamente.';
        form.reset();
      } else {
        aviso.style.color = '#EB5727';
        aviso.textContent = (data.errores || ['No se pudo enviar.']).join(' ');
      }
    } catch (err) {
      aviso.style.color = '#EB5727';
      aviso.textContent = 'No se pudo conectar con el servidor.';
    }
  });
});