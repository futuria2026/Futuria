# Base de datos de Futuria

## 1. Crear las tablas
1. Entra a phpMyAdmin (o al cliente de MySQL/MariaDB que uses) con la base de Futuria seleccionada.
2. Si la base tiene las tablas de la versión anterior (`usuarios` con `correo`/`contrasena`,
   `carrito`...), ejecuta primero `borrar_tablas_antiguas.sql`
   (borra `usuarios`, `productos`, `carrito` y `herramientas_datos` viejas **y sus datos**).
3. Importa `futuria.sql` completo. Se puede repetir sin problema.
4. Comprueba: `SHOW TABLES;` debe listar 11 tablas (las 10 del diagrama + `herramientas_datos`).

Si la base ya tenía estas tablas pero sin las columnas `rol` y `foto` en `usuarios`, ejecuta
`migracion_roles.sql`: las agrega y deja como administradora a la cuenta indicada ahí.

Los datos de conexión van en `api/inc/config.php` (copia de `config.ejemplo.php`).

## 2. Qué tabla usa cada parte de la página
| Parte                | Tabla(s)                                      |
|----------------------|-----------------------------------------------|
| Registro / login     | `usuarios`                                    |
| Productos            | `productos` (+ `api/inc/catalogo.php`)        |
| Carrito              | `productos_usuarios` (una fila por unidad)    |
| Agenda               | `planificador_tareas` + `metodos_estudio`     |
| Chat IA              | `interacciones_ia`                            |
| Pomodoro, Flashcards, Mapas | `herramientas_datos` (tabla de apoyo)  |
| Integrantes, tests   | `integrantes_equipo`, `tests_vocacionales`, `preguntas_test` (datos cargados; las páginas aún leen sus textos de los PHP) |
