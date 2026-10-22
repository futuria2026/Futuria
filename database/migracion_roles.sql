USE futuria;

ALTER TABLE usuarios
  ADD COLUMN rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario' AFTER password_hash;

-- Cambia el correo por el de la persona que será administradora (debe estar registrada)
UPDATE usuarios SET rol = 'admin' WHERE email = 'pauliyapolo@gmail.com';

SELECT id_usuario, nombre, email, rol FROM usuarios;
