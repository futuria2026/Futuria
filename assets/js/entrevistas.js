/**
 *
 * la página de entrevistas: pide a api/entrevistas.php la lista de
 * profesionales y arma un acordeón con un área por fila. Al abrir un área se
 * ven la foto, los dos consejos y el reproductor con el audio de la entrevista
 *
 * si el servidor no responde usa la lista de respaldo escrita aquí, que tiene
 * las entrevistas reales del equipo (Jacobo, Ñe y Santiago). Solo puede haber
 * un área abierta y un audio sonando a la vez
 *
 */

/**
 *
 * las entrevistas de respaldo: área, nombre, profesión, imagen, audio y los
 * dos consejos de cada persona
 *
 */
var ENTREVISTAS_RESPALDO = [
  {area:'Transporte - Piloto',nombre:'Jacobo Román',profesion:'Aviación',imagen:'../assets/img/piloto.jpg',audio:'../assets/audio/jacobo.mp3',orientacion:'Le diría que primero estudie algo que le guste; a mí me parece que estudiar algo que a uno no le guste es un infierno  y me he dado cuenta de que en cualquier área o cualquier campo que uno escoja, uno mismo se hace su destino',carrera:'SIIII.'},

  {area:'Entretenimiento - Streamer',nombre:'Juan Felipe Restrepo (Ñe)',profesion:'Streamer - Estudiante',imagen:'../assets/img/stremer.jpg',audio:'../assets/audio/ñe.mp3',orientacion:'.',carrera:'La verdad es muy complejo, pero también trato de asimilarlo mucho con las personas que trabajan y estudian al mismo tiempo ya que la creación de contenido es como un trabajo y se le tiene que dedicar mucho tiempo para que pueda ser rentable.'},

  {area:'Social y Humanidades - Abogado',nombre:'Santiago Mejía',profesion:'Abogado',imagen:'../assets/img/abogado.jpg',audio:'../assets/audio/sebastian.mp3',orientacion:'SIIIII.',carrera:'Si vas a estudiar derecho, dedícate completamente, lee más de lo que te dan en clases, estudia muchos libros, busca prácticas adicionales, no te quedes con lo mínimo'},

];

/**
 *
 * cuando la página termina de cargar se piden las entrevistas y se pintan
 *
 */
document.addEventListener('DOMContentLoaded', function(){

  /**
   *
   * la caja del acordeón y el audio que está sonando ahora (para pausarlo si
   * se reproduce otro)
   *
   */
  var lista=document.getElementById('entrevistas-lista');var audioActual=null;

  /**
   *
   * convierte segundos en el texto mm:ss, por ejemplo 124 → "02:04". Si el
   * dato no sirve devuelve "00:00"
   *
   */
  function formatoTiempo(segundos) {
    if (isNaN(segundos) || segundos < 0) return '00:00';
    var m = Math.floor(segundos / 60);
    var s = Math.floor(segundos % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  /**
   *
   * arma todo el acordeón, con una fila por entrevista
   *
   * la primera fila empieza abierta. Cada fila tiene un botón con el número
   * y el nombre del área, y un panel con la entrevista y su reproductor
   *
   */
  function pintar(datos){
    if(!lista)return;lista.innerHTML='';
    datos.forEach(function(dato,indice){
      var item=document.createElement('article');item.className='area'+(indice===0?' abierta':'');
      var boton=document.createElement('button');boton.type='button';boton.className='area__boton';boton.setAttribute('aria-expanded',indice===0?'true':'false');
      var panelId='area-panel-'+indice;boton.setAttribute('aria-controls',panelId);
      boton.innerHTML='<span class="area__numero">'+String(indice+1).padStart(2,'0')+'</span><span class="area__nombre"></span><span class="area__icono" aria-hidden="true">+</span>';
      boton.querySelector('.area__nombre').textContent=dato.area;
      
      /**
       *
       * el panel de la entrevista: la imagen, el nombre, la profesión, los
       * dos consejos y el reproductor (botón, tiempo actual, barra y
       * duración total)
       *
       */
      var panel=document.createElement('div');panel.className='area__panel';panel.id=panelId;
      panel.innerHTML='<div class="area__interior"><div class="entrevista"><figure class="entrevista__imagen"><img loading="lazy" width="900" height="700"></figure><div class="entrevista__contenido"><h3 class="entrevista__nombre"></h3><p class="entrevista__profesion"></p><div class="consejos"><section class="consejo"><h4>Si aún no sabes qué estudiar</h4><p class="consejo__orientacion"></p></section><section class="consejo"><h4>Si contemplas esta carrera</h4><p class="consejo__carrera"></p></section></div><div class="audio"><button class="audio__boton" type="button"><span class="audio__icono" aria-hidden="true">▶</span><span class="audio__texto">Reproducir entrevista</span></button><div class="audio__progreso-wrapper" style="display:flex; align-items:center; gap:8px; width:100%; margin-top:8px;"><span class="audio__tiempo-actual" style="font-size:0.8rem; color:rgba(252,252,251,0.8);">00:00</span><input type="range" class="audio__barra" value="0" min="0" max="100" style="flex:1; cursor:pointer;"><span class="audio__tiempo-total" style="font-size:0.8rem; color:rgba(252,252,251,0.8);">00:00</span></div><audio preload="metadata"></audio></div></div></div></div>';
      
      var img=panel.querySelector('img');img.src=dato.imagen;img.alt='Ilustración del área de '+dato.area;
      panel.querySelector('.entrevista__nombre').textContent=dato.nombre;panel.querySelector('.entrevista__profesion').textContent=dato.profesion;
      panel.querySelector('.consejo__orientacion').textContent=dato.orientacion;panel.querySelector('.consejo__carrera').textContent=dato.carrera;
      
      /**
       *
       * el audio de la entrevista y las partes del reproductor
       *
       */
      var audio=panel.querySelector('audio');audio.src=dato.audio;
      var play=panel.querySelector('.audio__boton');
      var texto=panel.querySelector('.audio__texto');
      var icono=panel.querySelector('.audio__icono');
      var barra=panel.querySelector('.audio__barra');
      var tiempoActual=panel.querySelector('.audio__tiempo-actual');
      var tiempoTotal=panel.querySelector('.audio__tiempo-total');

      /**
       *
       * cambian el botón entre "Pausar entrevista" (Ⅱ) y "Reproducir
       * entrevista" (▶)
       *
       */
      function mostrarPausa(){texto.textContent='Pausar entrevista';icono.textContent='Ⅱ';}
      function mostrarPlay(){texto.textContent='Reproducir entrevista';icono.textContent='▶';}

      /**
       *
       * el botón reproduce o pausa. Antes de reproducir pausa cualquier otra
       * entrevista que esté sonando. Si el audio no se puede reproducir (por
       * ejemplo porque el archivo no existe) el botón dice "Reemplaza el audio"
       *
       */
      play.addEventListener('click',function(){
        if(audio.paused){
          if(audioActual&&audioActual!==audio){
            audioActual.pause();
          }
          audio.play().then(function(){
            audioActual=audio;
            mostrarPausa();
          }).catch(function(){
            texto.textContent='Reemplaza el audio';
          });
        }else{
          audio.pause();
          mostrarPlay();
        }
      });

      /**
       *
       * cuando se conoce la duración del audio se muestra a la derecha de la
       * barra
       *
       */
      audio.addEventListener('loadedmetadata', function(){
        tiempoTotal.textContent = formatoTiempo(audio.duration);
      });

      /**
       *
       * mientras suena, mueve la barra (de 0 a 100) y actualiza el tiempo
       * actual
       *
       */
      audio.addEventListener('timeupdate', function(){
        if(audio.duration){
          var porcentaje = (audio.currentTime / audio.duration) * 100;
          barra.value = porcentaje;
          tiempoActual.textContent = formatoTiempo(audio.currentTime);
        }
      });

      /**
       *
       * al arrastrar la barra, el audio salta a ese punto
       *
       */
      barra.addEventListener('input', function(){
        if(audio.duration){
          var nuevoTiempo = (barra.value / 100) * audio.duration;
          audio.currentTime = nuevoTiempo;
        }
      });

      /**
       *
       * al pausar vuelve el botón de reproducir; al terminar, además, la
       * barra y el tiempo vuelven a cero
       *
       */
      audio.addEventListener('pause',mostrarPlay);
      audio.addEventListener('ended',function(){
        mostrarPlay();
        barra.value = 0;
        tiempoActual.textContent = '00:00';
      });

      /**
       *
       * al hacer clic en un área se abre (o se cierra si ya estaba abierta)
       * y se cierran todas las demás
       *
       */
      boton.addEventListener('click',function(){
        var abrir=!item.classList.contains('abierta');
        document.querySelectorAll('.area.abierta').forEach(function(otro){
          if(otro!==item){
            otro.classList.remove('abierta');
            otro.querySelector('.area__boton').setAttribute('aria-expanded','false');
          }
        });
        item.classList.toggle('abierta',abrir);
        boton.setAttribute('aria-expanded',String(abrir));
      });

      item.appendChild(boton);item.appendChild(panel);lista.appendChild(item);
    });
  }

  /**
   *
   * pide las entrevistas al servidor; si no llegan, usa las de respaldo
   *
   */
  fetch('../api/entrevistas.php')
    .then(function(r){if(!r.ok)throw new Error('No disponible');return r.json();})
    .then(function(data){pintar(data&&data.ok&&data.entrevistas?data.entrevistas:ENTREVISTAS_RESPALDO);})
    .catch(function(){pintar(ENTREVISTAS_RESPALDO);});
});
