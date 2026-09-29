/* =========================================================
   FUTURIA · IA - chat.js
   Envía mensajes a ia.php (JSON) y pinta la conversación.
   ========================================================= */
(function () {
  'use strict';

  var mensajesEl = document.getElementById('iaMensajes');
  var formEl     = document.getElementById('iaForm');
  var entradaEl  = document.getElementById('iaEntrada');
  var enviarBtn  = document.getElementById('iaEnviar');
  var chipsEl    = document.getElementById('iaChips');

  if (!mensajesEl || !formEl) return;

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

  function mostrarEscribiendo() {
    var burbuja = crearBurbuja('Futuria está escribiendo…', 'futuria');
    burbuja.classList.add('ia-burbuja--escribiendo');
    return burbuja;
  }

  async function enviarMensaje(texto) {
    crearBurbuja(texto, 'usuario');
    entradaEl.value = '';
    enviarBtn.disabled = true;
    var indicador = mostrarEscribiendo();

    try {
      var res = await fetch('ia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto })
      });
      var datos = await res.json();
      indicador.remove();

      if (datos.ok) {
        crearBurbuja(datos.respuesta, 'futuria');
      } else {
        crearBurbuja('⚠️ ' + (datos.error || 'No pude responder, intenta de nuevo.'), 'futuria');
      }
    } catch (err) {
      indicador.remove();
      crearBurbuja('⚠️ No pude conectarme con el servidor. Revisa tu conexión e intenta de nuevo.', 'futuria');
    } finally {
      enviarBtn.disabled = false;
      entradaEl.focus();
    }
  }

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = entradaEl.value.trim();
    if (!texto) return;
    enviarMensaje(texto);
  });

  // Enviar con Enter (Shift+Enter = salto de línea)
  entradaEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  if (chipsEl) {
    chipsEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.ia-chip');
      if (!chip) return;
      enviarMensaje(chip.textContent.trim());
    });
  }

  // Menú móvil (igual que el resto del sitio)
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (btn && items) {
    btn.addEventListener('click', function () {
      items.classList.toggle('nb-abierto');
    });
  }
})();
