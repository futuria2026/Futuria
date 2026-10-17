/**
 *
 * el formulario de la página de contacto: lo envía a api/contacto.php sin
 * recargar la página y muestra debajo del título si el mensaje salió o qué
 * faltó
 *
 * mientras envía muestra "Enviando...". Si sale bien muestra el
 * agradecimiento y limpia el formulario; si el servidor devuelve errores los
 * muestra juntos en naranja; si no hay conexión avisa que no se pudo conectar
 *
 */
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
      var res  = await fetch('../api/contacto.php', { method: 'POST', body: new FormData(form) });
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
