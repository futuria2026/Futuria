/**
 *
 * borra las tablas de la versión anterior de la base (usuarios con
 * correo/contrasena, productos con eslogan, carrito y herramientas_datos con
 * usuario_id) para poder crear las del diagrama con futuria.sql
 *
 * ¡CUIDADO!: borra también las cuentas y datos que ya tengas guardados. Se
 * ejecuta una sola vez, ANTES de futuria.sql. El orden importa: primero las
 * que dependen de usuarios y productos
 *
 */
DROP TABLE IF EXISTS `carrito`;
DROP TABLE IF EXISTS `herramientas_datos`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `usuarios`;
