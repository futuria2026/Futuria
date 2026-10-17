<?php
/**
 *
 * el modelo de los datos para conectarse a la base de datos MySQL y de la
 * clave de la IA
 *
 * se copia como config.php en esta misma carpeta y se llenan los datos que
 * da Hostinger en hPanel → Bases de datos MySQL. config.php no se sube a git
 *
 */
return [

    /**
     *
     * el servidor de la base de datos; en Hostinger casi siempre es localhost
     *
     */
    'host' => 'localhost',

    /**
     *
     * el puerto de MySQL; 3306 es el de siempre
     *
     */
    'puerto' => 3306,

    /**
     *
     * el nombre de la base de datos, el usuario y su contraseña. En Hostinger
     * el nombre y el usuario empiezan con un prefijo, por ejemplo
     * u123456789_futuria
     *
     */
    'base' => 'u123456789_futuria',
    'usuario' => 'u123456789_futuria',
    'contrasena' => 'cambia-esta-contraseña',

    /**
     *
     * la clave de la API de inteligencia artificial para el chat de la página
     * IA. Vacía, el chat responde en modo básico con textos ya escritos
     *
     */
    'ia_api_key' => '',
];
