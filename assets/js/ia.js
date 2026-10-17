/**
 *
 * el chat de la página IA: muestra la conversación con Futuria, envía cada
 * mensaje a api/ia.php y pinta la respuesta
 *
 * todo va dentro de una función que se ejecuta sola, y sus variables solo
 * existen ahí adentro. Si la página no tiene el chat, no hace nada
 *
 */
(function () {
  'use strict';

  /**
   *
   * las partes del chat en la página: la caja de mensajes, el formulario, el
   * cuadro de texto, el botón Enviar y las preguntas sugeridas (chips)
   *
   */
  var mensajesEl = document.getElementById('iaMensajes');
  var formEl     = document.getElementById('iaForm');
  var entradaEl  = document.getElementById('iaEntrada');
  var enviarBtn  = document.getElementById('iaEnviar');
  var chipsEl    = document.getElementById('iaChips');

  if (!mensajesEl || !formEl) return;

  /**
   *
   * agrega un mensaje a la conversación y baja la caja hasta el final para
   * que se vea
   *
   * arma una fila con el avatar ("Tú" o "F") y la burbuja con el texto. Los
   * mensajes de la persona van a la derecha y los de Futuria a la izquierda.
   * Devuelve la burbuja por si se necesita quitar después
   *
   */
  function crearBurbuja(texto, quien) {
    var fila = document.createElement('div');
    fila.className = 'ia-fila' + (quien === 'usuario' ? ' ia-fila--usuario' : '');

    var avatar = document.createElement('div');
    avatar.className = 'ia-avatar';
    avatar.textContent = quien === 'usuario' ? 'Tú' : 'F';

    var burbuja = document.createElement('div');
    burbuja.className = 'ia-burbuja ' + (quien === 'usuario' ? 'ia-burbuja--usuario' : 'ia-burbuja--futuria');
    burbuja.textContent = texto;

    fila.appendChild(avatar);
    fila.appendChild(burbuja);
    mensajesEl.appendChild(fila);
    mensajesEl.scrollTop = mensajesEl.scrollHeight;
    return burbuja;
  }

  /**
   *
   * muestra la burbuja "Futuria está escribiendo…" mientras llega la
   * respuesta. Cuando llega, se borra la fila completa (avatar y burbuja)
   *
   */
  function mostrarEscribiendo() {
    var burbuja = crearBurbuja('Futuria está escribiendo…', 'futuria');
    burbuja.classList.add('ia-burbuja--escribiendo');
    return burbuja;
  }

  /**
   *
   * envía un mensaje a Futuria y muestra su respuesta
   *
   * pinta el mensaje de la persona, limpia el cuadro, apaga el botón Enviar y
   * muestra "escribiendo…". Después manda el texto a api/ia.php. Si llega
   * respuesta la muestra; si el servidor devuelve un error o no contesta,
   * muestra un aviso con ⚠️. Al final vuelve a prender el botón y deja el
   * cursor en el cuadro de texto
   *
   */
  async function enviarMensaje(texto) {
    crearBurbuja(texto, 'usuario');
    entradaEl.value = '';
    enviarBtn.disabled = true;
    var indicador = mostrarEscribiendo();

    try {
      var res = await fetch('../api/ia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      });
      var datos = await res.json();
      indicador.parentElement.remove();

      if (datos.ok) {
        crearBurbuja(datos.respuesta, 'futuria');
      } else {
        crearBurbuja('⚠️ ' + (datos.error || 'No pude responder, intenta de nuevo.'), 'futuria');
      }
    } catch (err) {
      indicador.parentElement.remove();
      crearBurbuja('⚠️ No pude conectarme con el servidor. Revisa tu conexión e intenta de nuevo.', 'futuria');
    } finally {
      enviarBtn.disabled = false;
      entradaEl.focus();
    }
  }

  /**
   *
   * al enviar el formulario se manda lo escrito, sin recargar la página. Si
   * el cuadro está vacío no pasa nada
   *
   */
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = entradaEl.value.trim();
    if (!texto) return;
    enviarMensaje(texto);
  });

  /**
   *
   * la tecla Enter envía el mensaje; Shift + Enter hace un salto de línea
   *
   */
  entradaEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  /**
   *
   * al hacer clic en una pregunta sugerida se envía ese texto como si la
   * persona lo hubiera escrito
   *
   */
  if (chipsEl) {
    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.ia-chip');
      if (!chip) return;
      enviarMensaje(chip.textContent.trim());
    });
  }

})();
