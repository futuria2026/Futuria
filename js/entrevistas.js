/* Menú desplegable (botón de las 3 rayas) - Entrevistas */
window.addEventListener('load', function () {
  var btn = document.getElementById('nbBtn');
  var items = document.getElementById('nbItems');
  if (!btn || !items) return;
  var nuevo = btn.cloneNode(true);   // quita cualquier manejador duplicado
  btn.parentNode.replaceChild(nuevo, btn);
  nuevo.addEventListener('click', function () {
    items.classList.toggle('nb-abierto');
  });
});
