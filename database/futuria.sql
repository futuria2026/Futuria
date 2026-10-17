-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-08-2026 a las 23:12:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `futuria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integrantes_equipo`
--

CREATE TABLE `integrantes_equipo` (
  `id_integrante` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `media_tecnica` varchar(100) DEFAULT 'Pre-prensa digital y Software',
  `bio` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `integrantes_equipo`
--

INSERT INTO `integrantes_equipo` (`id_integrante`, `nombre`, `rol`, `media_tecnica`, `bio`) VALUES
(1, 'Mariana Villa Builes', 'Líder 1', 'Programación de Software', 'Líder'),
(2, 'Paulina Lombana Gómez', 'Constructora', 'Programación de Software', 'Constructora'),
(3, 'Isabela Montoya Cardona', 'Diseñadora Gráfica', 'Pre-Prensa Digital', 'Creativa'),
(4, 'Luciana Díaz Castañeda', 'Diseñadora Frontend', 'Programación de Software', 'Ilustradora'),
(5, 'Estefania Arias Orozco', 'Publicitaria', 'Pre-Prensa Digital', 'Marketing'),
(6, 'Carolina Piedrahita Restrepo', 'Investigadora', 'Pre-Prensa Digital', 'Información'),
(7, 'Maria José Roas Ruiz', 'Redactora', 'Pre-Prensa Digital', 'Escritora'),
(8, 'Juan José Clavio Vélez', 'Programador', 'Programador de Software', 'Codificador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `interacciones_ia`
--

CREATE TABLE `interacciones_ia` (
  `id_interaccion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_resultado` int(11) DEFAULT NULL,
  `prompt_usuario` text NOT NULL,
  `respuesta_ia` text NOT NULL,
  `fecha_consulta` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_estudio`
--

CREATE TABLE `metodos_estudio` (
  `id_metodo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `categoria` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodos_estudio`
--

INSERT INTO `metodos_estudio` (`id_metodo`, `nombre`, `descripcion`, `categoria`) VALUES
(1, 'Método Pomodoro', 'Consiste en dividir el tiempo de estudio en bloques de 25 minutos intensos con 5 minutos de descanso.', 'Gestión del tiempo'),
(2, 'Técnica Feynman', 'Explicar un concepto en términos muy sencillos como si se le enseñara a un niño para detectar vacíos de conocimiento.', 'Comprensión'),
(3, 'Active Recall (Recuerdo Activo)', 'Poner a prueba la memoria intentando recordar el tema sin mirar los apuntes.', 'Memoria'),
(4, 'Método de Cornell', 'Técnica de toma de notas dividida en notas principales, ideas clave y un resumen final.', 'Organización');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificador_tareas`
--

CREATE TABLE `planificador_tareas` (
  `id_tarea` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_metodo` int(11) DEFAULT NULL,
  `titulo_tarea` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_limite` datetime DEFAULT NULL,
  `estado` enum('Pendiente','En Progreso','Completada') DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas_test`
--

CREATE TABLE `preguntas_test` (
  `id_pregunta` int(11) NOT NULL,
  `id_test` int(11) NOT NULL,
  `enunciado` text NOT NULL,
  `categoria_vocacional` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `id_integrante_creador` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('Plantilla','Guía','Software','Curso') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `id_integrante_creador`, `nombre`, `tipo`, `descripcion`, `precio`) VALUES
(1, 1, 'Plantilla de Planificación Académica', 'Plantilla', 'Organizador semanal y mensual editable para estudiantes.', 0.00),
(2, 2, 'Guía Rápida de Orientación Vocacional', 'Guía', 'Manual paso a paso para evaluar tus áreas de interés.', 0.00),
(3, 6, 'Software Pomodoro Futuria', 'Software', 'Herramienta interactiva de cronómetro para aplicar la técnica Pomodoro.', 0.00),
(4, 3, 'Curso Introductorio a Técnicas de Estudio', 'Curso', 'Módulo interactivo para aprender a gestionar el tiempo eficazmente.', 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_usuarios`
--

CREATE TABLE `productos_usuarios` (
  `id_adquisicion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha_adquisicion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultados_test`
--

CREATE TABLE `resultados_test` (
  `id_resultado` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_test` int(11) NOT NULL,
  `perfil_sugerido` varchar(100) NOT NULL,
  `puntaje` int(11) NOT NULL,
  `fecha_realizacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tests_vocacionales`
--

CREATE TABLE `tests_vocacionales` (
  `id_test` int(11) NOT NULL,
  `id_integrante_creador` int(11) DEFAULT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion_minutos` int(11) DEFAULT 15
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `integrantes_equipo`
--
ALTER TABLE `integrantes_equipo`
  ADD PRIMARY KEY (`id_integrante`);

--
-- Indices de la tabla `interacciones_ia`
--
ALTER TABLE `interacciones_ia`
  ADD PRIMARY KEY (`id_interaccion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_resultado` (`id_resultado`);

--
-- Indices de la tabla `metodos_estudio`
--
ALTER TABLE `metodos_estudio`
  ADD PRIMARY KEY (`id_metodo`);

--
-- Indices de la tabla `planificador_tareas`
--
ALTER TABLE `planificador_tareas`
  ADD PRIMARY KEY (`id_tarea`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_metodo` (`id_metodo`);

--
-- Indices de la tabla `preguntas_test`
--
ALTER TABLE `preguntas_test`
  ADD PRIMARY KEY (`id_pregunta`),
  ADD KEY `id_test` (`id_test`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_integrante_creador` (`id_integrante_creador`);

--
-- Indices de la tabla `productos_usuarios`
--
ALTER TABLE `productos_usuarios`
  ADD PRIMARY KEY (`id_adquisicion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `resultados_test`
--
ALTER TABLE `resultados_test`
  ADD PRIMARY KEY (`id_resultado`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_test` (`id_test`);

--
-- Indices de la tabla `tests_vocacionales`
--
ALTER TABLE `tests_vocacionales`
  ADD PRIMARY KEY (`id_test`),
  ADD KEY `id_integrante_creador` (`id_integrante_creador`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `integrantes_equipo`
--
ALTER TABLE `integrantes_equipo`
  MODIFY `id_integrante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `interacciones_ia`
--
ALTER TABLE `interacciones_ia`
  MODIFY `id_interaccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_estudio`
--
ALTER TABLE `metodos_estudio`
  MODIFY `id_metodo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `planificador_tareas`
--
ALTER TABLE `planificador_tareas`
  MODIFY `id_tarea` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preguntas_test`
--
ALTER TABLE `preguntas_test`
  MODIFY `id_pregunta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `productos_usuarios`
--
ALTER TABLE `productos_usuarios`
  MODIFY `id_adquisicion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resultados_test`
--
ALTER TABLE `resultados_test`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tests_vocacionales`
--
ALTER TABLE `tests_vocacionales`
  MODIFY `id_test` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `interacciones_ia`
--
ALTER TABLE `interacciones_ia`
  ADD CONSTRAINT `interacciones_ia_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `interacciones_ia_ibfk_2` FOREIGN KEY (`id_resultado`) REFERENCES `resultados_test` (`id_resultado`) ON DELETE SET NULL;

--
-- Filtros para la tabla `planificador_tareas`
--
ALTER TABLE `planificador_tareas`
  ADD CONSTRAINT `planificador_tareas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `planificador_tareas_ibfk_2` FOREIGN KEY (`id_metodo`) REFERENCES `metodos_estudio` (`id_metodo`) ON DELETE SET NULL;

--
-- Filtros para la tabla `preguntas_test`
--
ALTER TABLE `preguntas_test`
  ADD CONSTRAINT `preguntas_test_ibfk_1` FOREIGN KEY (`id_test`) REFERENCES `tests_vocacionales` (`id_test`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_integrante_creador`) REFERENCES `integrantes_equipo` (`id_integrante`) ON DELETE SET NULL;

--
-- Filtros para la tabla `productos_usuarios`
--
ALTER TABLE `productos_usuarios`
  ADD CONSTRAINT `productos_usuarios_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `productos_usuarios_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `resultados_test`
--
ALTER TABLE `resultados_test`
  ADD CONSTRAINT `resultados_test_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `resultados_test_ibfk_2` FOREIGN KEY (`id_test`) REFERENCES `tests_vocacionales` (`id_test`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tests_vocacionales`
--
ALTER TABLE `tests_vocacionales`
  ADD CONSTRAINT `tests_vocacionales_ibfk_1` FOREIGN KEY (`id_integrante_creador`) REFERENCES `integrantes_equipo` (`id_integrante`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
