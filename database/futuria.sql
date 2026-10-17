/**
 *
 * la base de datos de Futuria: las cuentas de los usuarios, los productos de
 * la tienda y el carrito de compras de cada usuario
 *
 * se importa en phpMyAdmin dentro de una base que ya exista (en Hostinger se
 * crea en hPanel → Bases de datos MySQL), por eso no trae CREATE DATABASE. Se
 * puede volver a importar sin perder nada: las tablas solo se crean si no
 * existen y los productos se actualizan si ya estaban
 *
 */

SET NAMES utf8mb4;
SET time_zone = '+00:00';

/**
 *
 * las cuentas de los usuarios: nombre, correo y contraseña
 *
 * el correo no se puede repetir. La contraseña nunca se guarda tal cual, se
 * guarda cifrada con password_hash() de PHP (por eso mide hasta 255
 * caracteres)
 *
 */
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nombre`     VARCHAR(100)  NOT NULL,
  `correo`     VARCHAR(150)  NOT NULL,
  `contrasena` VARCHAR(255)  NOT NULL,
  `creado_en`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * los productos de la tienda que se muestran en la página de productos
 *
 * el precio va en pesos colombianos sin decimales (65000 = $65.000 COP).
 * caracteristicas e imagenes guardan una lista en formato JSON; las imágenes
 * son nombres de archivo dentro de assets/img/. Con activo = 0 el producto
 * deja de mostrarse sin borrarlo
 *
 */
CREATE TABLE IF NOT EXISTS `productos` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nombre`          VARCHAR(100)  NOT NULL,
  `eslogan`         VARCHAR(150)  NOT NULL DEFAULT '',
  `descripcion`     TEXT          NOT NULL,
  `caracteristicas` TEXT          NOT NULL,
  `precio`          INT UNSIGNED  NOT NULL,
  `imagenes`        TEXT          NOT NULL,
  `activo`          TINYINT(1)    NOT NULL DEFAULT 1,
  `creado_en`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * el carrito de compras: qué productos tiene cada usuario y cuántos de cada
 * uno
 *
 * cada usuario tiene una sola fila por producto; si agrega el mismo producto
 * otra vez, se suma a la cantidad. Si se borra un usuario o un producto, sus
 * filas del carrito se borran solas (ON DELETE CASCADE)
 *
 */
CREATE TABLE IF NOT EXISTS `carrito` (
  `id`          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `usuario_id`  INT UNSIGNED      NOT NULL,
  `producto_id` INT UNSIGNED      NOT NULL,
  `cantidad`    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `agregado_en` TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_carrito_usuario_producto` (`usuario_id`, `producto_id`),
  KEY `idx_carrito_producto` (`producto_id`),
  CONSTRAINT `fk_carrito_usuario`  FOREIGN KEY (`usuario_id`)  REFERENCES `usuarios`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carrito_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * los dos productos de Futuria: el libro guía y el juego de cartas
 *
 * los textos son provisionales; el equipo puede cambiarlos aquí o desde
 * phpMyAdmin. Si los productos ya existen (mismo id), se actualizan con estos
 * datos
 *
 */
INSERT INTO `productos` (`id`, `nombre`, `eslogan`, `descripcion`, `caracteristicas`, `precio`, `imagenes`) VALUES
(1, 'Libro', 'Organiza tu año completo',
 'Libro guía de Futuria con orientación vocacional, métodos de estudio y herramientas para organizar tu tiempo. Diseñado para estudiantes de colegio y primeros semestres.',
 '["Orientación vocacional","Métodos de estudio","Gestión del tiempo","Ilustraciones de Futuria"]',
 65000,
 '["p1-1.jpg","p1-2.jpg","p1-3.jpg","p1-4.jpg"]'),
(2, 'Cartas', 'Aprende jugando',
 'Juego de cartas de Futuria con los personajes del equipo para descubrir tus intereses y repasar métodos de estudio de forma divertida, solo o con amigos.',
 '["Personajes de Futuria","Para jugar solo o en grupo","Áreas vocacionales","Diseño Futuria"]',
 28000,
 '["p2-1.jpg","p2-2.jpg","p2-3.jpg","p2-4.jpg"]')
ON DUPLICATE KEY UPDATE
  `nombre` = VALUES(`nombre`),
  `eslogan` = VALUES(`eslogan`),
  `descripcion` = VALUES(`descripcion`),
  `caracteristicas` = VALUES(`caracteristicas`),
  `precio` = VALUES(`precio`),
  `imagenes` = VALUES(`imagenes`);
