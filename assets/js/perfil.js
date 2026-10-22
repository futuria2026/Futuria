/**
 * la página "Mi perfil": cambia el nombre y la foto del usuario con sesión
 * iniciada. La foto se achica en el navegador a 128x128 (JPEG) y se envía a
 * api/auth.php con la acción "perfil"
 */
(() => {
  const AUTH = '../api/auth.php';
  const $ = (id) => document.getElementById(id);
  let foto; // undefined = sin cambio, '' = quitar, texto = foto nueva

  const aviso = (t, err) => { $('pfMsg').textContent = t; $('pfMsg').className = 'pf__msg' + (err ? ' err' : ''); };

  function pintarFoto(src, nombre) {
    $('pfFoto').hidden = !src;
    $('pfInicial').hidden = !!src;
    if (src) $('pfFoto').src = src;
    $('pfInicial').textContent = (nombre || '?').charAt(0).toUpperCase();
  }

  /* recorta al centro y achica a 128x128 */
  function achicar(archivo) {
    return new Promise((ok, mal) => {
      const lector = new FileReader();
      lector.onerror = () => mal(new Error('No se pudo leer la imagen.'));
      lector.onload = () => {
        const img = new Image();
        img.onerror = () => mal(new Error('Ese archivo no es una imagen válida.'));
        img.onload = () => {
          const lado = Math.min(img.width, img.height);
          const c = document.createElement('canvas');
          c.width = c.height = 128;
          c.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 128, 128);
          ok(c.toDataURL('image/jpeg', 0.85));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(archivo);
    });
  }

  $('pfElegir').addEventListener('click', () => $('pfArchivo').click());
  $('pfArchivo').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 10 * 1024 * 1024) { aviso('Elige una imagen de hasta 10 MB.', true); return; }
    try { foto = await achicar(f); pintarFoto(foto, $('pfNombre').value); aviso('Foto lista. Pulsa Guardar cambios.'); }
    catch (er) { aviso(er.message, true); }
  });
  $('pfQuitar').addEventListener('click', () => { foto = ''; pintarFoto('', $('pfNombre').value); aviso('Foto quitada. Pulsa Guardar cambios.'); });

  $('pfForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cuerpo = { accion: 'perfil', nombre: $('pfNombre').value };
    if (foto !== undefined) cuerpo.foto = foto;
    try {
      const r = await fetch(AUTH, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'No se pudo guardar.');
      foto = undefined;
      aviso('¡Perfil actualizado!');
    } catch (er) { aviso(er.message, true); }
  });

  (async () => {
    try {
      const d = await (await fetch(AUTH + '?accion=sesion')).json();
      if (!d.usuario) {
        const p = $('pfEstado'); p.textContent = '';
        const a = document.createElement('a'); a.href = 'login.html?volver=perfil.html'; a.textContent = 'Inicia sesión';
        p.append(a, ' para editar tu perfil.');
        return;
      }
      $('pfEstado').textContent = d.usuario.correo;
      $('pfNombre').value = d.usuario.nombre;
      pintarFoto(d.usuario.foto, d.usuario.nombre);
      $('pfForm').hidden = false;
    } catch (er) { $('pfEstado').textContent = 'No se pudo cargar tu perfil.'; }
  })();
})();
