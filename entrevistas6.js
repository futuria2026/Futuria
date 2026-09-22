var ENTREVISTAS_RESPALDO = [
  {area:'Salud - Dra. Valentina',nombre:'Dra. Valentina Ríos',profesion:'Médica general',imagen:'img/salud.jpg',audio:'audio/salud.mp3',orientacion:'Conoce qué problemas disfrutas resolver y busca experiencias reales antes de elegir. Una conversación o un voluntariado puede aclararte mucho más que una lista de carreras.',carrera:'La medicina exige constancia y empatía. Aprende a pedir ayuda, cuida tu descanso y recuerda que detrás de cada caso hay una persona.'},
  {area:'Salud - Dra. CARLA',nombre:'Dra. Valentina Ríos',profesion:'Médica general',imagen:'img/salud.jpg',audio:'audio/salud.mp3',orientacion:'Conoce qué problemas disfrutas resolver y busca experiencias reales antes de elegir. Una conversación o un voluntariado puede aclararte mucho más que una lista de carreras.',carrera:'La medicina exige constancia y empatía. Aprende a pedir ayuda, cuida tu descanso y recuerda que detrás de cada caso hay una persona.'},
  {area:'Humanidades - Santiago',nombre:'Santiago Mejía',profesion:'Abogado y mediador',imagen:'img/humanidades.jpg',audio:'audio/humanidades.mp3',orientacion:'Pregúntate qué conversaciones despiertan tu curiosidad. Si disfrutas comprender a las personas, argumentar y transformar conflictos, explora las humanidades.',carrera:'Lee más allá de las materias obligatorias y practica explicar ideas complejas con claridad. La escucha es tan importante como una buena argumentación.'},
  {area:'Ciencias - Laura',nombre:'Laura Fernández',profesion:'Bióloga investigadora',imagen:'img/ciencias.jpg',audio:'audio/ciencias.mp3',orientacion:'No busques una carrera perfecta: identifica las preguntas que te emocionaría investigar durante años y prueba talleres o semilleros relacionados.',carrera:'Acepta que equivocarse es parte del método. Documenta tus procesos, fortalece las matemáticas y conserva siempre la curiosidad.'},
  {area:'Tecnología - Daniel',nombre:'Daniel Torres',profesion:'Ingeniero de software',imagen:'img/tecnologia.jpg',audio:'audio/tecnologia.mp3',orientacion:'Construye un proyecto pequeño antes de decidir. La tecnología tiene muchos caminos y experimentar te mostrará si disfrutas crear soluciones digitales.',carrera:'Practica con proyectos propios, aprende a trabajar en equipo y no memorices herramientas: comprende los fundamentos y mantente aprendiendo.'},
  {area:'Arte y Diseño - Camila',nombre:'Camila Ortiz',profesion:'Diseñadora visual',imagen:'img/arte-diseno.jpg',audio:'audio/arte-diseno.mp3',orientacion:'Observa qué haces incluso cuando nadie te lo pide. Si dibujar, imaginar o comunicar visualmente te absorbe, convierte esa curiosidad en un portafolio.',carrera:'Guarda cada proceso, no solo el resultado. Aprende a recibir críticas sin perder tu voz y diseña pensando en las personas que usarán tu trabajo.'},
  {area:'Entretenimiento - Mateo',nombre:'Mateo Salazar',profesion:'Productor audiovisual',imagen:'img/entretenimiento.jpg',audio:'audio/entretenimiento.mp3',orientacion:'Explora teatro, música, cine o producción con proyectos cortos. El entretenimiento reúne perfiles creativos, técnicos y de gestión.',carrera:'Sé puntual, crea una red de colaboradores y termina lo que empiezas. Un proyecto completo enseña más que muchas ideas guardadas.'}
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