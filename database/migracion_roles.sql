-- Se ejecuta en una base creada con una versión anterior de futuria.sql
-- (por ejemplo desde phpMyAdmin → SQL, con la base de Futuria seleccionada).
-- Se puede repetir sin error.

-- 1) Columna de rol (solo se agrega si no existe)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario' AFTER password_hash;

-- 1b) Columna de la foto de perfil (la usa la página Mi perfil)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS foto MEDIUMTEXT NULL AFTER rol;

-- 2) Primer administrador (esa persona debe estar registrada antes)
UPDATE usuarios SET rol = 'admin' WHERE email = 'pauliyapolo@gmail.com';

SELECT id_usuario, nombre, email, rol FROM usuarios;
