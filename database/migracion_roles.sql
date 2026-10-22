-- Ejecutar en TiDB Cloud → SQL Editor, con la base de Futuria seleccionada.
-- Se puede repetir sin error.

-- 1) Columna de rol (solo se agrega si no existe)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario' AFTER password_hash;

-- 2) Tabla de sesiones que usa api/inc/app.php (no estaba en futuria.sql)
CREATE TABLE IF NOT EXISTS sesiones (
  id          VARCHAR(128) NOT NULL,
  datos       MEDIUMTEXT   NOT NULL,
  actualizado INT          NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Primer administrador (esa persona debe estar registrada antes)
UPDATE usuarios SET rol = 'admin' WHERE email = 'pauliyapolo@gmail.com';

SELECT id_usuario, nombre, email, rol FROM usuarios;
