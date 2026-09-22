<?php
/**
 * Futuria — Registro de usuario
 * Procesa el formulario enviado desde index.html
 *
 * NOTA: Este archivo requiere un servidor con PHP (Apache/Nginx + PHP-FPM,
 * XAMPP, Laragon, o `php -S localhost:8000` desde la carpeta futuria/).
 */

declare(strict_types=1); 

// --- Config -----------------------------------------------------------------
$DATA_FILE = __DIR__ . '/users.json';

// --- Helpers ----------------------------------------------------------------
function clean(string $v): string {
    return trim(strip_tags($v));
}

function respond(bool $ok, string $msg, array $extra = []): void {
    $body = array_merge(['ok' => $ok, 'message' => $msg], $extra);
    // Si es una petición AJAX devuelve JSON, si no muestra una página HTML.
    $isAjax = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
        exit;
    }
    render_page($ok, $msg);
    exit;
}

function render_page(bool $ok, string $msg): void {
    $title = $ok ? '¡Registro exitoso!' : 'Error en el registro';
    $color = $ok ? '#15F166' : '#EB5727';
    ?>
    <!DOCTYPE html>
    <html lang="es"><head>
      <meta charset="UTF-8"><title><?= htmlspecialchars($title) ?> — Futuria</title>
      <link rel="stylesheet" href="iniciosecc.css">
    </head><body>
      <div class="bg-blobs">
        <span class="blob blob-1"></span>
        <span class="blob blob-2"></span>
        <span class="blob blob-3"></span>
      </div>
      <main class="card" style="text-align:center;">
        <div class="logo-wrap"><img src="logo.jpg" alt="Futuria" class="logo"></div>
        <h1 style="color: <?= $color ?>; margin-top:16px;"><?= htmlspecialchars($title) ?></h1>
        <p class="subtitle" style="margin-top:12px;"><?= htmlspecialchars($msg) ?></p>
        <a href="index.html" class="submit-btn" style="display:inline-block;text-decoration:none;margin-top:8px;">Volver</a>
      </main>
    </body></html>
    <?php
}

// --- Validación -------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Método no permitido.');
}

$fullname = clean($_POST['fullname'] ?? '');
$email    = clean($_POST['email']    ?? '');
$username = clean($_POST['username'] ?? '');
$password = (string)($_POST['password'] ?? '');
$confirm  = (string)($_POST['confirm']  ?? '');

if (mb_strlen($fullname) < 3) respond(false, 'El nombre completo debe tener al menos 3 caracteres.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'El correo no es válido.');
if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) respond(false, 'Usuario no válido (3-20 letras, números o _).');
if (strlen($password) < 6) respond(false, 'La contraseña debe tener al menos 6 caracteres.');
if ($password !== $confirm) respond(false, 'Las contraseñas no coinciden.');

// --- Persistencia (archivo JSON como demo) ----------------------------------
$users = [];
if (is_file($DATA_FILE)) {
    $raw = file_get_contents($DATA_FILE);
    $decoded = json_decode($raw ?: '[]', true);
    if (is_array($decoded)) $users = $decoded;
}

foreach ($users as $u) {
    if (($u['email'] ?? '') === $email)       respond(false, 'Ese correo ya está registrado.');
    if (($u['username'] ?? '') === $username) respond(false, 'Ese nombre de usuario ya existe.');
}

$users[] = [
    'id'         => bin2hex(random_bytes(8)),
    'fullname'   => $fullname,
    'email'      => $email,
    'username'   => $username,
    'password'   => password_hash($password, PASSWORD_BCRYPT),
    'created_at' => date('c'),
];

if (file_put_contents($DATA_FILE, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    respond(false, 'No se pudo guardar el usuario. Revisa permisos del servidor.');
}

respond(true, "¡Bienvenido a Futuria, {$fullname}! Tu cuenta ha sido creada.");
