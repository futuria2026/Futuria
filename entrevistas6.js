var ENTREVISTAS_RESPALDO = [
  {area:'Transporte - Piloto',nombre:'Jacobo Román',profesion:'Aviacion',imagen:'img/piloto.jpg',audio:'audio/jacobo.mp3',orientacion:'Le diría que primero estudie algo que le guste; a mí me parece que estudiar algo que a uno no le guste es un infierno  y me he dado cuenta de que en cualquier área o cualquier campo que uno escoja, uno mismo se hace su destino',carrera:'SIIII.'},

  {area:'Entretenimiento - Stremer',nombre:'Juan Felipe Restrepo (Ñe)',profesion:'Stremer - Estudiante',imagen:'img/stremer.jpg',audio:'audio/ñe.mp3',orientacion:'.',carrera:'La verdad es muy complejo, pero también trato de asimilarlo mucho con las personas que trabajan y estudian al mismo tiempo ya que la creación de contenido es como un trabajo y se le tiene que dedicar mucho tiempo para que pueda ser rentable.'},

  {area:'Social y humanidades - Abogado',nombre:'Santiago Mejía',profesion:'Abogado',imagen:'img/abogado.jpeg',audio:'audio/sebastian.mp3',orientacion:'SIIIII.',carrera:'Si vas a estudiar derecho, dedícate completamente, lee más de lo que te dan en clases, estudia muchos libros, busca prácticas adicionales, no te quedes con lo mínimo'},

];

document.addEventListener('DOMContentLoaded', function(){
  var colores=['#dbb6e8','#FCFCFB','#83AEE3','#FE6A00'];
  document.querySelectorAll('.estrellas').forEach(function(capa){
    var claras=capa.classList.contains('estrellas--claras');
    for(var i=0;i<(claras?9:15);i++){
      var e=document.createElement('span');var t=Math.random()*7+4;
      e.className='estrella';e.style.top=Math.random()*100+'%';e.style.left=Math.random()*100+'%';
      e.style.width=t+'px';e.style.height=t+'px';e.style.background=claras?colores[(i+2)%colores.length]:colores[i%colores.length];
      e.style.animationDelay=(Math.random()*3).toFixed(2)+'s';capa.appendChild(e);
    }
  });

  var toggle=document.querySelector('.nav__toggle');var menu=document.querySelector('.nav__lista');
  if(toggle&&menu){
    toggle.addEventListener('click',function(){
      var abierto=menu.classList.toggle('abierto');
      toggle.setAttribute('aria-expanded',String(abierto));
      toggle.setAttribute('aria-label',abierto?'Cerrar menú':'Abrir menú');
    });
  }
  var anio=document.getElementById('anio');if(anio)anio.textContent=String(new Date().getFullYear());

  var lista=document.getElementById('entrevistas-lista');var audioActual=null;

  function formatoTiempo(segundos) {
    if (isNaN(segundos) || segundos < 0) return '00:00';
    var m = Math.floor(segundos / 60);
    var s = Math.floor(segundos % 60);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function pintar(datos){
    if(!lista)return;lista.innerHTML='';
    datos.forEach(function(dato,indice){
      var item=document.createElement('article');item.className='area'+(indice===0?' abierta':'');
      var boton=document.createElement('button');boton.type='button';boton.className='area__boton';boton.setAttribute('aria-expanded',indice===0?'true':'false');
      var panelId='area-panel-'+indice;boton.setAttribute('aria-controls',panelId);
      boton.innerHTML='<span class="area__numero">'+String(indice+1).padStart(2,'0')+'</span><span class="area__nombre"></span><span class="area__icono" aria-hidden="true">+</span>';
      boton.querySelector('.area__nombre').textContent=dato.area;
      
      var panel=document.createElement('div');panel.className='area__panel';panel.id=panelId;
      panel.innerHTML='<div class="area__interior"><div class="entrevista"><figure class="entrevista__imagen"><img loading="lazy" width="900" height="700"></figure><div class="entrevista__contenido"><h3 class="entrevista__nombre"></h3><p class="entrevista__profesion"></p><div class="consejos"><section class="consejo"><h4>Si aún no sabes qué estudiar</h4><p class="consejo__orientacion"></p></section><section class="consejo"><h4>Si contemplas esta carrera</h4><p class="consejo__carrera"></p></section></div><div class="audio"><button class="audio__boton" type="button"><span class="audio__icono" aria-hidden="true">▶</span><span class="audio__texto">Reproducir entrevista</span></button><div class="audio__progreso-wrapper" style="display:flex; align-items:center; gap:8px; width:100%; margin-top:8px;"><span class="audio__tiempo-actual" style="font-size:0.8rem; color:rgba(252,252,251,0.8);">00:00</span><input type="range" class="audio__barra" value="0" min="0" max="100" style="flex:1; cursor:pointer;"><span class="audio__tiempo-total" style="font-size:0.8rem; color:rgba(252,252,251,0.8);">00:00</span></div><audio preload="metadata"></audio></div></div></div></div>';
      
      var img=panel.querySelector('img');img.src=dato.imagen;img.alt='Ilustración del área de '+dato.area;
      panel.querySelector('.entrevista__nombre').textContent=dato.nombre;panel.querySelector('.entrevista__profesion').textContent=dato.profesion;
      panel.querySelector('.consejo__orientacion').textContent=dato.orientacion;panel.querySelector('.consejo__carrera').textContent=dato.carrera;
      
      var audio=panel.querySelector('audio');audio.src=dato.audio;
      var play=panel.querySelector('.audio__boton');
      var texto=panel.querySelector('.audio__texto');
      var icono=panel.querySelector('.audio__icono');
      var barra=panel.querySelector('.audio__barra');
      var tiempoActual=panel.querySelector('.audio__tiempo-actual');
      var tiempoTotal=panel.querySelector('.audio__tiempo-total');

      function mostrarPausa(){texto.textContent='Pausar entrevista';icono.textContent='Ⅱ';}
      function mostrarPlay(){texto.textContent='Reproducir entrevista';icono.textContent='▶';}

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

      audio.addEventListener('loadedmetadata', function(){
        tiempoTotal.textContent = formatoTiempo(audio.duration);
      });

      audio.addEventListener('timeupdate', function(){
        if(audio.duration){
          var porcentaje = (audio.currentTime / audio.duration) * 100;
          barra.value = porcentaje;
          tiempoActual.textContent = formatoTiempo(audio.currentTime);
        }
      });

      barra.addEventListener('input', function(){
        if(audio.duration){
          var nuevoTiempo = (barra.value / 100) * audio.duration;
          audio.currentTime = nuevoTiempo;
        }
      });

      audio.addEventListener('pause',mostrarPlay);
      audio.addEventListener('ended',function(){
        mostrarPlay();
        barra.value = 0;
        tiempoActual.textContent = '00:00';
      });

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

  fetch('entrevistas6.php')
    .then(function(r){if(!r.ok)throw new Error('No disponible');return r.json();})
    .then(function(data){pintar(data&&data.ok&&data.entrevistas?data.entrevistas:ENTREVISTAS_RESPALDO);})
    .catch(function(){pintar(ENTREVISTAS_RESPALDO);});
});
