# Base de datos de Futuria (TiDB + Vercel)

## 1. Crear las tablas en TiDB Cloud
1. TiDB Cloud → tu cluster → **SQL Editor** (o Chat2Query), con tu base seleccionada.
2. Si ya habías creado las tablas de la versión anterior, ejecuta primero `borrar_tablas_antiguas.sql`
   (borra `usuarios`, `productos`, `carrito` y `herramientas_datos` viejas **y sus datos**).
3. Ejecuta `futuria.sql` completo. Se puede repetir sin problema.
4. Comprueba: `SHOW TABLES;` debe listar 11 tablas (las 10 del diagrama + `herramientas_datos`).

## 2. Variables de entorno en Vercel
Project → Settings → Environment Variables (y luego **Redeploy**):

| Variable      | Valor                                                    |
|---------------|----------------------------------------------------------|
| `DB_HOST`     | host de TiDB (`gateway01....prod.aws.tidbcloud.com`)     |
| `DB_PORT`     | `4000`                                                   |
| `DB_NAME`     | el nombre de tu base                                     |
| `DB_USER`     | usuario de TiDB (con prefijo, ej. `xxxx.root`)           |
| `DB_PASSWORD` | contraseña                                               |
| `DB_SSL`      | `true`                                                   |
| `DB_SSL_CA`   | (solo si falla el TLS) ruta del certificado del servidor |
| `IA_API_KEY`  | (opcional) clave de Gemini                               |

En un servidor propio se usa `api/inc/config.php` (copia de `config.ejemplo.php`).

## 3. Qué tabla usa cada parte de la página
| Parte                | Tabla(s)                                      |
|----------------------|-----------------------------------------------|
| Registro / login     | `usuarios`                                    |
| Productos            | `productos` (+ `api/inc/catalogo.php`)        |
| Carrito              | `productos_usuarios` (una fila por unidad)    |
| Agenda               | `planificador_tareas` + `metodos_estudio`     |
| Chat IA              | `interacciones_ia`                            |
| Pomodoro, Flashcards, Mapas | `herramientas_datos` (tabla de apoyo)  |
| Integrantes, tests   | `integrantes_equipo`, `tests_vocacionales`, `preguntas_test` (datos cargados; las páginas aún leen sus textos de los PHP) |
