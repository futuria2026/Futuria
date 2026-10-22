/**
 *
 * el formulario de la página de contacto: lo envía a FormSubmit sin recargar
 * la página y muestra debajo del título si el mensaje salió o qué faltó
 *
 * FormSubmit (formsubmit.co) es un servicio gratis que recibe el formulario y
 * lo reenvía por correo a futuria2026@gmail.com. Antes de enviar revisa que
 * haya nombre, un correo válido y un mensaje de al menos 10 letras. Mientras
 * envía muestra "Enviando..."; si sale bien muestra el agradecimiento y
 * limpia el formulario; si algo falla lo muestra en naranja
 *
 */
document.addEventListener('DOMContentLoaded', function () {
  var form  = document.getElementById('form-contacto');
  var aviso = document.getElementById('aviso');
  if (!form) return;

  /**
   *
   * la dirección de FormSubmit para envíos sin recargar la página (/ajax/),
   * que contesta en JSON en vez de mostrar su propia página
   *
   */
  var FORMSUBMIT = 'https://formsubmit.co/ajax/futuria2026@gmail.com';

  /**
   *
   * muestra un texto en el aviso; con error = true lo pone en naranja
   *
   */
  function avisar(texto, error) {
    aviso.hidden = false;
    aviso.style.color = error ? '#EB5727' : '';
    aviso.textContent = texto;
  }

  /**
   *
   * revisa los tres campos y devuelve la lista de problemas: falta el
   * nombre, el correo no tiene forma de correo o el mensaje tiene menos de
   * 10 letras
   *
   */
  function revisar(datos) {
    var errores = [];
    if (datos.nombre.trim() === '') errores.push('Escribe tu nombre.');
    if (!form.elements.email.checkValidity() || datos.email.trim() === '') errores.push('Escribe un correo válido.');
    if (datos.mensaje.trim().length < 10) errores.push('El mensaje es muy corto.');
    return errores;
  }

  /**
   *
   * al enviar: revisa los campos y, si están bien, manda todo el formulario
   * a FormSubmit en JSON
   *
   * la primera vez que se usa, FormSubmit no envía el mensaje: manda a
   * futuria2026@gmail.com un correo para activar el formulario y contesta
   * success "false". En ese caso se avisa que el formulario aún no está
   * activado
   *
   */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var datos = Object.fromEntries(new FormData(form));

    var errores = revisar(datos);
    if (errores.length) {
      avisar(errores.join(' '), true);
      return;
    }

    avisar('Enviando...', false);
    try {
      var res = await fetch(FORMSUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(datos)
      });
      var respuesta = await res.json();
      if (String(respuesta.success) === 'true') {
        avisar('¡Gracias! Tu mensaje fue enviado correctamente.', false);
        form.reset();
      } else if (/activat/i.test(respuesta.message || '')) {
        avisar('El formulario todavía no está activado. Revisa el correo de Futuria y dale clic a "Activate Form".', true);
      } else {
        avisar('No se pudo enviar el mensaje, intenta más tarde.', true);
      }
    } catch (err) {
      avisar('No se pudo conectar con el servidor.', true);
    }
  });
});
