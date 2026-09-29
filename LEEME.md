# Futuria · Novedades agregadas

Este paquete contiene tu sitio original **más 5 páginas nuevas**, listas para
copiar sobre tu carpeta del proyecto (reemplaza los archivos que se repiten).

## Qué se agregó

1. **`ia.html` / `ia.css` / `ia.js` / `ia.php`** — Asistente con IA llamado
   "Futuria" (mismo nombre y personalidad del sitio). El enlace **IA** de la
   barra de navegación ahora apunta aquí en todas las páginas
   (`index.html`, `pagina2.html`, `productos.html`, `metodos5.html`).

2. **`pomodoro.html/.css/.js/.php`** — Temporizador Pomodoro real (25/5/15 min
   configurables), con anillo de progreso, sonido al terminar y estadísticas
   (pomodoros de hoy, racha de días y últimos 7 días) guardadas en el servidor.

3. **`flashcards.html/.css/.js/.php`** — Crea tarjetas de pregunta/respuesta,
   estúdialas volteándolas, márcalas como "dominadas" y mézclalas. El mazo se
   guarda en el servidor por sesión de navegador.

4. **`mapas-mentales.html/.css/.js/.php`** — Lienzo interactivo: crea un tema
   central, agrégale ramas (selecciona un nodo y escribe la idea), arrástralas
   para acomodarlas, cambia el color y elimínalas. Se guarda automáticamente.

5. **`agenda.html/.css/.js/.php`** — Calendario mensual con tareas por día,
   hora y descripción. Se guarda en el servidor (no solo en el navegador).

6. **`herramientas.css`** — Hoja de estilos compartida por las 5 páginas
   nuevas (misma paleta de colores y misma barra de navegación del sitio).

7. **`inc/datos.php`** — Utilidad compartida que guarda los datos de cada
   herramienta como un archivo JSON dentro de la carpeta `datos/`, uno por
   sesión de navegador (no necesita base de datos). Esa carpeta se crea sola
   y se protege con un `.htaccess` para que nadie pueda leerla desde fuera.

8. **`metodos5.html` / `metodos5.js`** — Los botones "Usar Pomodoro", "Usar
   Mapas mentales", "Usar Flashcards" y "Usar Calendario" ahora sí llevan a
   las páginas reales de cada herramienta (antes solo abrían una guía).

## Cómo conectar la IA a un modelo real

Por defecto, `ia.php` responde con un **modo básico** (reglas simples) para
que la página funcione sin configuración. Para conectarla a un modelo real:

1. Abre `ia.php`.
2. Escribe tu clave en la constante `FUTURIA_IA_API_KEY` (arriba del archivo).
3. Por defecto está configurado para la API de OpenAI (`gpt-4o-mini`). Si vas
   a usar otro proveedor, ajusta `FUTURIA_IA_URL`, `FUTURIA_IA_MODELO` y el
   formato dentro de la función `futuria_llamar_modelo()`.
4. La "personalidad" de Futuria (cómo debe hablar, qué debe saber del sitio)
   está en la constante `FUTURIA_PERSONA`, al inicio del archivo — puedes
   editarla libremente.

## Requisitos del servidor

- PHP 7.4 o superior, con la extensión **cURL** habilitada (para llamar a la
  IA; si no está disponible, el modo básico funciona igual).
- Permisos de escritura en la carpeta del sitio para poder crear la carpeta
  `datos/` automáticamente.
- No se necesita base de datos: todo se guarda en archivos `.json`.

## Notas

- Cada herramienta guarda su información según la **sesión del navegador**
  (cookie `PHPSESSID`); si el usuario borra sus cookies o entra desde otro
  navegador, no verá los mismos datos. Si más adelante conectas el sistema de
  registro que ya tienes en `INICIO DE SECCIÓN/`, puedes cambiar
  `inc/datos.php` para usar el usuario logueado en lugar de la sesión.
- Todos los archivos siguen el mismo estilo que ya usabas en `contacto.php`
  (PHP puro, `declare(strict_types=1)`, respuestas en JSON).
