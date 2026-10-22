/**
 *
 * la base de datos de Futuria, con las tablas del diagrama (modelo
 * entidad-relación) más una tabla de apoyo, herramientas_datos
 *
 * tablas del diagrama: integrantes_equipo, tests_vocacionales,
 * preguntas_test, resultados_test, usuarios, interacciones_ia, productos,
 * productos_usuarios, planificador_tareas y metodos_estudio
 *
 * tabla de apoyo: herramientas_datos guarda en JSON lo de Pomodoro,
 * Flashcards y Mapas mentales, que el diagrama no tiene dónde guardar
 *
 * se importa dentro de una base que ya exista (en TiDB Cloud, desde SQL
 * Editor con la base seleccionada), por eso no trae CREATE DATABASE. Se puede
 * volver a importar sin perder nada: las tablas solo se crean si no existen y
 * los datos iniciales se actualizan si ya estaban. Si ya habías creado las
 * tablas de la versión anterior (usuarios con correo/contrasena, productos
 * con eslogan, carrito...), ejecuta ANTES borrar_tablas_antiguas.sql
 *
 */

SET NAMES utf8mb4;

/**
 *
 * las personas del equipo de Futuria
 *
 */
CREATE TABLE IF NOT EXISTS `integrantes_equipo` (
  `id_integrante`  INT          NOT NULL AUTO_INCREMENT,
  `nombre`         VARCHAR(100) NOT NULL,
  `rol`            VARCHAR(100) NOT NULL,
  `media_tecnica`  VARCHAR(100) NOT NULL,
  `bio`            TEXT         NOT NULL,
  PRIMARY KEY (`id_integrante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * las cuentas de los usuarios
 *
 * el email no se puede repetir. La contraseña nunca se guarda tal cual: se
 * guarda cifrada con password_hash() de PHP en password_hash (por eso mide
 * 255). fecha_nacimiento es opcional porque el formulario de registro no la
 * pide
 *
 */
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario`       INT          NOT NULL AUTO_INCREMENT,
  `nombre`           VARCHAR(100) NOT NULL,
  `email`            VARCHAR(150) NOT NULL,
  `password_hash`    VARCHAR(255) NOT NULL,
  `fecha_nacimiento` DATE         NULL,
  `fecha_registro`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uk_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * las técnicas de estudio que ofrece Futuria (Pomodoro, Flashcards...)
 *
 */
CREATE TABLE IF NOT EXISTS `metodos_estudio` (
  `id_metodo`   INT          NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(100) NOT NULL,
  `descripcion` TEXT         NOT NULL,
  `categoria`   VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id_metodo`),
  UNIQUE KEY `uk_metodos_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * los tests vocacionales y quién del equipo los creó
 *
 */
CREATE TABLE IF NOT EXISTS `tests_vocacionales` (
  `id_test`             INT          NOT NULL AUTO_INCREMENT,
  `id_integrante_creador` INT        NULL,
  `titulo`              VARCHAR(100) NOT NULL,
  `descripcion`         TEXT         NOT NULL,
  `duracion_minutos`    INT          NOT NULL,
  PRIMARY KEY (`id_test`),
  UNIQUE KEY `uk_tests_titulo` (`titulo`),
  KEY `idx_tests_creador` (`id_integrante_creador`),
  CONSTRAINT `fk_tests_integrante` FOREIGN KEY (`id_integrante_creador`) REFERENCES `integrantes_equipo` (`id_integrante`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * las preguntas de cada test, con el área vocacional a la que pertenecen
 *
 */
CREATE TABLE IF NOT EXISTS `preguntas_test` (
  `id_pregunta`          INT         NOT NULL AUTO_INCREMENT,
  `id_test`              INT         NOT NULL,
  `enunciado`            TEXT        NOT NULL,
  `categoria_vocacional` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_pregunta`),
  KEY `idx_preguntas_test` (`id_test`),
  CONSTRAINT `fk_preguntas_test` FOREIGN KEY (`id_test`) REFERENCES `tests_vocacionales` (`id_test`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * los productos de la tienda (libro guía y juego de cartas)
 *
 * el precio va en pesos colombianos (65000.00 = $65.000 COP). El eslogan, las
 * características y las fotos no están en el diagrama: viven en
 * api/inc/catalogo.php
 *
 */
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto`           INT           NOT NULL AUTO_INCREMENT,
  `id_integrante_creador` INT           NULL,
  `nombre`                VARCHAR(100)  NOT NULL,
  `tipo`                  ENUM('Plantilla','Guia','Software','Curso') NOT NULL,
  `descripcion`           TEXT          NOT NULL,
  `precio`                DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `idx_productos_creador` (`id_integrante_creador`),
  CONSTRAINT `fk_productos_integrante` FOREIGN KEY (`id_integrante_creador`) REFERENCES `integrantes_equipo` (`id_integrante`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * los productos de cada usuario: es el carrito de compras
 *
 * una fila por cada unidad: si alguien lleva 3 libros hay 3 filas con el
 * mismo id_producto, y la cantidad es cuántas filas hay
 *
 */
CREATE TABLE IF NOT EXISTS `productos_usuarios` (
  `id_adquisicion`    INT       NOT NULL AUTO_INCREMENT,
  `id_usuario`        INT       NOT NULL,
  `id_producto`       INT       NOT NULL,
  `fecha_adquisicion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_adquisicion`),
  KEY `idx_pu_usuario_producto` (`id_usuario`, `id_producto`),
  KEY `idx_pu_producto` (`id_producto`),
  CONSTRAINT `fk_pu_usuario`  FOREIGN KEY (`id_usuario`)  REFERENCES `usuarios`  (`id_usuario`)  ON DELETE CASCADE,
  CONSTRAINT `fk_pu_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * el resultado que obtuvo un usuario en un test
 *
 */
CREATE TABLE IF NOT EXISTS `resultados_test` (
  `id_resultado`     INT          NOT NULL AUTO_INCREMENT,
  `id_usuario`       INT          NOT NULL,
  `id_test`          INT          NOT NULL,
  `perfil_sugerido`  VARCHAR(100) NOT NULL,
  `puntaje`          INT          NOT NULL,
  `fecha_realizacion` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resultado`),
  KEY `idx_resultados_usuario` (`id_usuario`),
  KEY `idx_resultados_test` (`id_test`),
  CONSTRAINT `fk_resultados_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_resultados_test`    FOREIGN KEY (`id_test`)    REFERENCES `tests_vocacionales` (`id_test`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * cada mensaje que un usuario le escribe a la IA y la respuesta que recibe;
 * si tenía un resultado de test, queda enlazado en id_resultado
 *
 */
CREATE TABLE IF NOT EXISTS `interacciones_ia` (
  `id_interaccion` INT       NOT NULL AUTO_INCREMENT,
  `id_usuario`     INT       NOT NULL,
  `id_resultado`   INT       NULL,
  `prompt_usuario` TEXT      NOT NULL,
  `respuesta_ia`   TEXT      NOT NULL,
  `fecha_consulta` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_interaccion`),
  KEY `idx_ia_usuario` (`id_usuario`),
  KEY `idx_ia_resultado` (`id_resultado`),
  CONSTRAINT `fk_ia_usuario`   FOREIGN KEY (`id_usuario`)   REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_ia_resultado` FOREIGN KEY (`id_resultado`) REFERENCES `resultados_test` (`id_resultado`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * las tareas de la agenda de cada usuario
 *
 * fecha_limite lleva el día y la hora (una tarea sin hora se guarda a las
 * 00:00:00) e id_metodo dice de qué método de estudio viene
 *
 */
CREATE TABLE IF NOT EXISTS `planificador_tareas` (
  `id_tarea`     INT          NOT NULL AUTO_INCREMENT,
  `id_usuario`   INT          NOT NULL,
  `id_metodo`    INT          NULL,
  `titulo_tarea` VARCHAR(150) NOT NULL,
  `descripcion`  TEXT         NULL,
  `fecha_limite` DATETIME     NOT NULL,
  `estado`       ENUM('Pendiente','En Progreso','Completada') NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`id_tarea`),
  KEY `idx_tareas_usuario_fecha` (`id_usuario`, `fecha_limite`),
  KEY `idx_tareas_metodo` (`id_metodo`),
  CONSTRAINT `fk_tareas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_tareas_metodo`  FOREIGN KEY (`id_metodo`)  REFERENCES `metodos_estudio` (`id_metodo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/**
 *
 * TABLA DE APOYO (no está en el diagrama): lo que cada usuario guarda en
 * Pomodoro, Flashcards y Mapas mentales, en formato JSON. Una fila por
 * usuario y herramienta ("pomodoro", "flashcards" o "mapas")
 *
 */
CREATE TABLE IF NOT EXISTS `herramientas_datos` (
  `id_usuario`     INT         NOT NULL,
  `herramienta`    VARCHAR(30) NOT NULL,
  `datos`          MEDIUMTEXT  NOT NULL,
  `actualizado_en` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`, `herramienta`),
  CONSTRAINT `fk_herramientas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ======================== DATOS INICIALES ======================== */

/**
 *
 * el equipo (los mismos 8 de la página de integrantes). media_tecnica de
 * quienes no tienen su especialidad escrita queda "Por definir": se cambia
 * desde la base
 *
 */
INSERT INTO `integrantes_equipo` (`id_integrante`, `nombre`, `rol`, `media_tecnica`, `bio`) VALUES
(1, 'Isabela M.',   'Líder creativa e identidad visual', 'Por definir', 'Líder creativa del equipo: coordinó la identidad visual de Futuria y definió la paleta y el logo del zorro.'),
(2, 'Maria R.',     'Investigación vocacional',          'Por definir', 'Encargada de la investigación vocacional: diseñó las preguntas del test y estudió los perfiles de interés de los estudiantes.'),
(3, 'Estefania A.', 'Pre-prensa y diagramación',         'Preprensa',   'Responsable de pre-prensa y diagramación: preparó los folletos, revisó márgenes, tipografías y colores para impresión.'),
(4, 'Carolina P.',  'Community manager',                 'Por definir', 'Community manager del proyecto: administra las redes de Futuria y responde a los estudiantes que escriben.'),
(5, 'Mariana V.',   'Gestión del tiempo',                'Por definir', 'Especialista en gestión del tiempo: construyó la agenda inteligente y las plantillas de horarios.'),
(6, 'Paulina L.',   'Métodos de estudio',                'Por definir', 'Encargada de los métodos de estudio: recopiló técnicas como Pomodoro, mapas mentales y repaso espaciado.'),
(7, 'Luciana D.',   'Entrevistas',                       'Por definir', 'Responsable de las entrevistas: contactó a profesionales y estudiantes para recoger sus historias vocacionales.'),
(8, 'Juan C.',      'Desarrollo del sitio e IA',         'Programación de Software', 'Desarrollador del sitio y de la sección de IA: programó la página, el formulario de contacto y el asistente.')
ON DUPLICATE KEY UPDATE
  `nombre` = VALUES(`nombre`), `rol` = VALUES(`rol`),
  `media_tecnica` = VALUES(`media_tecnica`), `bio` = VALUES(`bio`);

/**
 *
 * los métodos de estudio del sitio. "Agenda" tiene que llamarse así: api/agenda.php
 * lo busca por ese nombre para marcar las tareas
 *
 */
INSERT INTO `metodos_estudio` (`id_metodo`, `nombre`, `descripcion`, `categoria`) VALUES
(1, 'Pomodoro',       'Bloques de 25 minutos de estudio con descansos de 5 minutos.',              'Gestión del tiempo'),
(2, 'Flashcards',     'Tarjetas de pregunta y respuesta para practicar la memoria activa.',        'Memorización'),
(3, 'Mapas mentales', 'Un tema central con ramas de ideas para organizar y relacionar conceptos.',  'Organización de ideas'),
(4, 'Agenda',         'Calendario con tareas por día y hora para que nada se olvide.',             'Planificación')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`), `categoria` = VALUES(`categoria`);

/**
 *
 * los dos tests recomendados en la página de test vocacional y unas
 * preguntas de ejemplo de Holland (una por tipo RIASEC)
 *
 */
INSERT INTO `tests_vocacionales` (`id_test`, `id_integrante_creador`, `titulo`, `descripcion`, `duracion_minutos`) VALUES
(1, 2, 'Test CHASIDE',            'Mide tus intereses y aptitudes en nueve áreas profesionales.', 15),
(2, 2, 'Test de Holland (RIASEC)', 'Clasifica tu personalidad profesional en seis tipos: Realista, Investigador, Artístico, Social, Emprendedor y Convencional.', 10)
ON DUPLICATE KEY UPDATE
  `id_integrante_creador` = VALUES(`id_integrante_creador`), `descripcion` = VALUES(`descripcion`),
  `duracion_minutos` = VALUES(`duracion_minutos`);

INSERT INTO `preguntas_test` (`id_pregunta`, `id_test`, `enunciado`, `categoria_vocacional`) VALUES
(1, 2, '¿Te gusta arreglar, construir o armar cosas con tus manos?',        'Realista'),
(2, 2, '¿Disfrutas investigar por qué pasan las cosas y resolver problemas?', 'Investigador'),
(3, 2, '¿Te gusta dibujar, escribir, componer o crear cosas originales?',   'Artístico'),
(4, 2, '¿Disfrutas ayudar, enseñar o acompañar a otras personas?',          'Social'),
(5, 2, '¿Te gusta liderar grupos o convencer a otros de tus ideas?',        'Emprendedor'),
(6, 2, '¿Prefieres tener tus tareas ordenadas, con pasos y reglas claras?', 'Convencional')
ON DUPLICATE KEY UPDATE
  `enunciado` = VALUES(`enunciado`), `categoria_vocacional` = VALUES(`categoria_vocacional`);

/**
 *
 * los dos productos de Futuria. El libro es una Guia; las cartas se
 * clasifican como Plantilla porque el enum no tiene una opción de juego
 *
 */
INSERT INTO `productos` (`id_producto`, `id_integrante_creador`, `nombre`, `tipo`, `descripcion`, `precio`) VALUES
(1, 3, 'Libro',  'Guia',      'Libro guía de Futuria con orientación vocacional, métodos de estudio y herramientas para organizar tu tiempo. Diseñado para estudiantes de colegio y primeros semestres.', 65000.00),
(2, 1, 'Cartas', 'Plantilla', 'Juego de cartas de Futuria con los personajes del equipo para descubrir tus intereses y repasar métodos de estudio de forma divertida, solo o con amigos.', 28000.00)
ON DUPLICATE KEY UPDATE
  `id_integrante_creador` = VALUES(`id_integrante_creador`), `nombre` = VALUES(`nombre`),
  `tipo` = VALUES(`tipo`), `descripcion` = VALUES(`descripcion`), `precio` = VALUES(`precio`);
