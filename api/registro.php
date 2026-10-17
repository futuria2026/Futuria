<?php
/**
 *
 * crea la cuenta de un usuario nuevo con los datos del formulario de registro
 * y le muestra una página que dice si salió bien o qué estuvo mal
 *
 * revisa cada campo, comprueba que el correo y el usuario no estén repetidos y
 * guarda al usuario en el archivo datos/users.json (no usa base de datos). La
 * contraseña nunca se guarda tal cual: se guarda cifrada (con password_hash)
 *
 */

declare(strict_types=1);

/**
 *
 * la carpeta datos/ de la raíz del proyecto y el archivo users.json donde
 * quedan todos los usuarios. Si la carpeta no existe se crea sola
 *
 */
$DATA_DIR  = dirname(__DIR__) . '/datos';
if (!is_dir($DATA_DIR)) { @mkdir($DATA_DIR, 0775, true); }
$DATA_FILE = $DATA_DIR . '/users.json';

/**
 *
 * limpia un texto del formulario: le quita etiquetas HTML y los espacios
 * sobrantes al inicio y al final
 *
 */
function clean(string $v): string {
    return trim(strip_tags($v));
}

/**
 *
 * contesta al navegador y termina el programa
 *
 * si el formulario se envió con JavaScript (AJAX) responde en JSON con
 * { ok, message }; si se envió de la forma normal muestra la página de
 * resultado con render_page()
 *
 */
function respond(bool $ok, string $msg, array $extra = []): void {
    $body = array_merge(['ok' => $ok, 'message' => $msg], $extra);
    $isAjax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
        exit;
    }
    render_page($ok, $msg);
    exit;
}

/**
 *
 * la página de resultado del registro: el logo, un título verde si salió bien
 * o naranja si hubo un error, el mensaje y un botón para volver al formulario
 *
 * usa los mismos estilos de la página de registro (registro.css).
 * htmlspecialchars() evita que un texto escrito por el usuario se
 * convierta en HTML dentro de la página
 *
 */
function render_page(bool $ok, string $msg): void {
    $title = $ok ? '¡Registro exitoso!' : 'Error en el registro';
    $color = $ok ? '#15F166' : '#EB5727';
    ?>
    <!DOCTYPE html>
    <html lang="es"><head>
      <meta charset="UTF-8"><title><?= htmlspecialchars($title) ?> — Futuria</title>
      <link rel="stylesheet" href="../assets/css/registro.css">
    </head><body>
      <div class="bg-blobs">
        <span class="blob blob-1"></span>
        <span class="blob blob-2"></span>
        <span class="blob blob-3"></span>
      </div>
      <main class="card" style="text-align:center;">
        <div class="logo-wrap"><img src="../assets/img/logo-futuria.jpeg" alt="Futuria" class="logo"></div>
        <h1 style="color: <?= $color ?>; margin-top:16px;"><?= htmlspecialchars($title) ?></h1>
        <p class="subtitle" style="margin-top:12px;"><?= htmlspecialchars($msg) ?></p>
        <a href="../pages/registro.html" class="submit-btn" style="display:inline-block;text-decoration:none;margin-top:8px;">Volver</a>
      </main>
    </body></html>
    <?php
}

/**
 *
 * solo se puede llegar aquí enviando el formulario (POST); si no, se muestra
 * el error "Método no permitido"
 *
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método no permitido.');
}

/**
 *
 * los cinco campos del formulario. La contraseña y su confirmación se toman
 * tal cual las escribió la persona, sin limpiarlas
 *
 */
$fullname = clean($_POST['fullname'] ?? '');
$email    = clean($_POST['email']    ?? '');
$username = clean($_POST['username'] ?? '');
$password = (string)($_POST['password'] ?? '');
$confirm  = (string)($_POST['confirm']  ?? '');

/**
 *
 * las reglas de cada campo: nombre de 3 letras o más, correo válido, usuario
 * de 3 a 20 letras, números o guion bajo, contraseña de 6 caracteres o más y
 * que la confirmación sea igual. Al primer error se detiene y lo muestra
 *
 */
if (mb_strlen($fullname) < 3) respond(false, 'El nombre completo debe tener al menos 3 caracteres.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'El correo no es válido.');
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) respond(false, 'Usuario no válido (3-20 letras, números o _).');
if (strlen($password) < 6) respond(false, 'La contraseña debe tener al menos 6 caracteres.');
if ($password !== $confirm) respond(false, 'Las contraseñas no coinciden.');

/**
 *
 * los usuarios que ya están registrados, leídos de users.json. Si el archivo
 * no existe todavía o está dañado se empieza con la lista vacía
 *
 */
$users = [];
if (is_file($DATA_FILE)) {
    $raw = file_get_contents($DATA_FILE);
    $decoded = json_decode($raw ?: '[]', true);
    if (is_array($decoded)) $users = $decoded;
}

/**
 *
 * revisa que nadie más tenga ya ese correo o ese nombre de usuario
 *
 */
foreach ($users as $u) {
    if (($u['email'] ?? '') === $email)       respond(false, 'Ese correo ya está registrado.');
    if (($u['username'] ?? '') === $username) respond(false, 'Ese nombre de usuario ya existe.');
}

/**
 *
 * el usuario nuevo que se agrega a la lista: un id al azar de 16 caracteres,
 * sus datos, la contraseña cifrada (con BCRYPT) y la fecha en que se creó
 *
 */
$users[] = [
    'id'         => bin2hex(random_bytes(8)),
    'fullname'   => $fullname,
    'email'      => $email,
    'username'   => $username,
    'password'   => password_hash($password, PASSWORD_BCRYPT),
    'created_at' => date('c'),
];

/**
 *
 * guarda la lista completa otra vez en users.json. Si el servidor no deja
 * escribir en la carpeta se muestra el error
 *
 */
if (file_put_contents($DATA_FILE, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    respond(false, 'No se pudo guardar el usuario. Revisa permisos del servidor.');
}

respond(true, "¡Bienvenido a Futuria, {$fullname}! Tu cuenta ha sido creada.");
