/**
 * panel de administración: CRUD de productos (api/productos.php) y gestión
 * de usuarios y roles (api/auth.php). Solo funciona si el usuario es admin;
 * el servidor vuelve a comprobarlo en cada acción
 */
(() => {
  const AUTH = '../api/auth.php', PROD = '../api/productos.php';
  const $ = (id) => document.getElementById(id);
  let miId = 0;

  const aviso = (t, err) => { $('admMsg').textContent = t; $('admMsg').className = 'adm__msg' + (err ? ' err' : ''); };
  const celda = (tr, txt) => { const td = document.createElement('td'); td.textContent = txt; tr.appendChild(td); return td; };
  const boton = (txt, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'b'; b.textContent = txt; b.addEventListener('click', fn); return b; };

  async function api(url, cuerpo) {
    const r = await fetch(url, cuerpo ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) } : undefined);
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || 'Error del servidor.');
    return d;
  }

  /* ---------- productos ---------- */
  function pintarProductos(lista) {
    const tb = $('tbProd'); tb.textContent = '';
    lista.forEach((p) => {
      const tr = document.createElement('tr');
      celda(tr, p.id); celda(tr, p.nombre); celda(tr, p.tipo); celda(tr, p.precio);
      const acc = document.createElement('td');
      acc.append(boton('Editar', () => editar(p)), ' ', boton('Eliminar', async () => {
        if (!confirm('¿Eliminar "' + p.nombre + '"? También saldrá de los carritos.')) return;
        try { pintarProductos((await api(PROD, { accion: 'eliminar', id: p.id })).productos); aviso('Producto eliminado.'); }
        catch (e) { aviso(e.message, true); }
      }));
      tr.appendChild(acc); tb.appendChild(tr);
    });
  }
  function editar(p) {
    $('pId').value = p.id; $('pNombre').value = p.nombre; $('pTipo').value = p.tipo;
    $('pDesc').value = p.descripcion; $('pPrecio').value = p.precio_valor;
    $('pGuardar').textContent = 'Guardar cambios'; $('pCancelar').hidden = false;
    $('pNombre').focus();
  }
  function limpiar() {
    $('formProd').reset(); $('pId').value = '';
    $('pGuardar').textContent = 'Crear producto'; $('pCancelar').hidden = true;
  }
  $('pCancelar').addEventListener('click', limpiar);
  $('formProd').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = Number($('pId').value);
    const datos = { accion: id ? 'actualizar' : 'crear', id, nombre: $('pNombre').value, tipo: $('pTipo').value,
                    descripcion: $('pDesc').value, precio: Number($('pPrecio').value) };
    try { pintarProductos((await api(PROD, datos)).productos); aviso(id ? 'Producto actualizado.' : 'Producto creado.'); limpiar(); }
    catch (er) { aviso(er.message, true); }
  });

  /* ---------- usuarios ---------- */
  async function cargarUsuarios() {
    const tb = $('tbUsu');
    try {
      const { usuarios } = await api(AUTH + '?accion=usuarios');
      tb.textContent = '';
      usuarios.forEach((u) => {
        const tr = document.createElement('tr');
        celda(tr, u.id); celda(tr, u.nombre); celda(tr, u.correo); celda(tr, u.rol);
        const acc = document.createElement('td');
        if (Number(u.id) !== miId) {
          const nuevo = u.rol === 'admin' ? 'usuario' : 'admin';
          acc.append(boton('Hacer ' + nuevo, async () => {
            try { await api(AUTH, { accion: 'cambiar_rol', id: Number(u.id), rol: nuevo }); aviso('Rol actualizado.'); cargarUsuarios(); }
            catch (e) { aviso(e.message, true); }
          }), ' ', boton('Eliminar', async () => {
            if (!confirm('¿Eliminar la cuenta de ' + u.correo + '? Se borran sus datos.')) return;
            try { await api(AUTH, { accion: 'eliminar_usuario', id: Number(u.id) }); aviso('Usuario eliminado.'); cargarUsuarios(); }
            catch (e) { aviso(e.message, true); }
          }));
        } else acc.textContent = '(tú)';
        tr.appendChild(acc); tb.appendChild(tr);
      });
    } catch (e) { aviso(e.message, true); }
  }

  /* ---------- pestañas y arranque ---------- */
  function pestana(prod) {
    $('secProd').hidden = !prod; $('secUsu').hidden = prod;
    $('tabProd').classList.toggle('on', prod); $('tabUsu').classList.toggle('on', !prod);
    if (!prod) cargarUsuarios();
  }
  $('tabProd').addEventListener('click', () => pestana(true));
  $('tabUsu').addEventListener('click', () => pestana(false));

  (async () => {
    try {
      const s = await api(AUTH + '?accion=sesion');
      if (!s.usuario) { $('admEstado').textContent = 'Inicia sesión para continuar.'; return; }
      if (s.usuario.rol !== 'admin') { $('admEstado').textContent = 'Esta página es solo para administradores.'; return; }
      miId = s.usuario.id;
      $('admEstado').textContent = 'Sesión: ' + s.usuario.nombre;
      $('admPanel').hidden = false;
      pintarProductos((await api(PROD)).productos);
    } catch (e) { $('admEstado').textContent = e.message; }
  })();
})();
