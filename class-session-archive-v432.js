(function(){
  'use strict';

  var dialog = document.getElementById('sessionArchiveDialog');
  var openButtons = Array.from(document.querySelectorAll('[data-session-archive-open]'));
  if(!dialog || !openButtons.length) return;

  function numberedSlides(folder,titles){
    return titles.map(function(title,index){
      return {
        src:folder + '/' + String(index + 1).padStart(2,'0') + '.webp',
        title:title,
        description:'Diapositiva ' + (index + 1) + ' de ' + titles.length + ' del soporte original.'
      };
    });
  }

  var archives = {
    'fisio-17-slides':{
      eyebrow:'FISIOLOGÍA II · 17 AGO. 2026',
      title:'Organización, sinapsis y receptores',
      description:'35 diapositivas del PDF del profesor, conservadas en su orden.',
      download:'assets/class-hub/physiology/2026-08-17/organizacion-sinapsis-receptores.pdf',
      downloadLabel:'Descargar PDF',
      slides:numberedSlides('assets/class-hub/physiology/2026-08-17/slides',[
        'Unidad II · Sistema nervioso','Objetivos de la clase','Organización del sistema nervioso','División funcional del sistema nervioso','Aferencia, integración y eferencia','Función del sistema nervioso','Neurona y conducción eléctrica','Simulador del potencial de acción','Fases del potencial de acción','Comunicación entre neuronas','Sinapsis química y eléctrica','Liberación del neurotransmisor','Receptores ionotrópicos y metabotrópicos','Excitación e inhibición postsináptica','Mecanismos de excitación e inhibición','Inhibición presináptica','Ejercicio de canales iónicos','Neurotransmisores','Transmisores de molécula pequeña','Neuropéptidos','Fatiga sináptica','Receptores sensitivos','Cinco tipos de receptores','Transducción sensorial','Origen del potencial receptor','Adaptación tónica y fásica','Intensidad y sumación','Clasificación de fibras nerviosas','Facilitación','Circuito inhibidor','Divergencia y convergencia','Circuito reverberante','Posdescarga sináptica','Flujo de la información nerviosa','Referencias'
      ])
    },
    'fisio-17-board':{
      eyebrow:'PIZARRA · FISIOLOGÍA II · 17 AGO.',
      title:'Sinapsis, excitación e inhibición',
      description:'Reproducción limpia y fotografía original de la pizarra.',
      slides:[
        {src:'assets/class-hub/physiology/2026-08-17/board/01-sinapsis-excitacion-inhibicion.webp',title:'Pizarra reconstruida en limpio',description:'Misma organización: terminal presináptica, calcio, receptores, excitación e inhibición.'},
        {src:'assets/class-hub/physiology/2026-08-17/board/00-photo-original.webp',title:'Fotografía original',description:'Referencia original tomada durante la clase.'}
      ]
    },
    'micro-17-cases':{
      eyebrow:'MICROBIOLOGÍA II · TEÓRICA · 17 AGO.',
      title:'Casos clínicos de micosis',
      description:'Ocho imágenes en el orden usado por el profesor.',
      slides:[
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/01-caso-pitiriasis.webp',title:'Caso 1 · Historia y examen',description:'Máculas del tronco después de calor y sudoración.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/02-pista-pitiriasis.webp',title:'Caso 1 · Pista diagnóstica',description:'KOH, distribución, pigmentación y descamación.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/03-respuesta-pitiriasis.webp',title:'Caso 1 · Respuesta y razonamiento',description:'Pitiriasis versicolor por Malassezia spp.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/04-caso-tina-corporis.webp',title:'Caso 2 · Historia y examen',description:'Placa anular después del contacto con un gato con alopecia.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/05-pregunta-microsporum.webp',title:'Caso 2 · Elegir el agente',description:'Pregunta de opción múltiple presentada en clase.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/06-confirmacion-micologica.webp',title:'Caso 2 · Confirmación micológica',description:'Raspado, KOH, cultivo y diferencias entre géneros.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/07-respuesta-microsporum.webp',title:'Caso 2 · Respuesta y razonamiento',description:'Tiña corporal por Microsporum canis.'},
        {src:'assets/class-hub/microbiology-theory/2026-08-17/cases/08-cierre-comparativo.webp',title:'Cierre comparativo',description:'Pitiriasis versicolor frente a tiña corporal por M. canis.'}
      ]
    }
  };

  var image = document.getElementById('sessionArchiveImage');
  var eyebrow = document.getElementById('sessionArchiveEyebrow');
  var title = document.getElementById('sessionArchiveTitle');
  var description = document.getElementById('sessionArchiveDescription');
  var counter = document.getElementById('sessionArchiveCounter');
  var slideTitle = document.getElementById('sessionArchiveSlideTitle');
  var slideDescription = document.getElementById('sessionArchiveSlideDescription');
  var download = document.getElementById('sessionArchiveDownload');
  var thumbnailsHost = document.getElementById('sessionArchiveThumbnails');
  var current = dialog.querySelector('[data-session-archive-current]');
  var total = dialog.querySelector('[data-session-archive-total]');
  var previous = dialog.querySelector('[data-session-archive-previous]');
  var next = dialog.querySelector('[data-session-archive-next]');
  var closeButton = dialog.querySelector('[data-session-archive-close]');
  var imageFrame = dialog.querySelector('.board-archive-image-frame');
  var activeArchive = null;
  var activeIndex = 0;
  var thumbnails = [];
  var returnFocus = null;
  var touchStart = null;

  function selectSlide(index,focusThumbnail){
    if(!activeArchive) return;
    var slides = activeArchive.slides;
    activeIndex = (index + slides.length) % slides.length;
    var slide = slides[activeIndex];
    image.src = slide.src;
    image.alt = slide.title;
    counter.textContent = (activeIndex + 1) + ' / ' + slides.length;
    slideTitle.textContent = slide.title;
    slideDescription.textContent = slide.description;
    current.textContent = String(activeIndex + 1);
    previous.disabled = slides.length < 2;
    next.disabled = slides.length < 2;
    thumbnails.forEach(function(button,buttonIndex){
      var selected = buttonIndex === activeIndex;
      button.setAttribute('aria-pressed',selected ? 'true' : 'false');
      if(selected){
        button.scrollIntoView({block:'nearest',inline:'nearest'});
        if(focusThumbnail) button.focus();
      }
    });
  }

  function renderArchive(key){
    activeArchive = archives[key];
    if(!activeArchive) return false;
    activeIndex = 0;
    eyebrow.textContent = activeArchive.eyebrow;
    title.textContent = activeArchive.title;
    description.textContent = activeArchive.description;
    total.textContent = String(activeArchive.slides.length);
    if(activeArchive.download){
      download.hidden = false;
      download.href = activeArchive.download;
      download.textContent = activeArchive.downloadLabel || 'Descargar';
    }else{
      download.hidden = true;
      download.removeAttribute('href');
    }
    thumbnailsHost.replaceChildren();
    thumbnails = activeArchive.slides.map(function(slide,index){
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-pressed',index === 0 ? 'true' : 'false');
      button.setAttribute('aria-label','Abrir ' + slide.title);
      var thumb = document.createElement('img');
      thumb.src = slide.src;
      thumb.alt = '';
      if(index > 1) thumb.loading = 'lazy';
      var number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2,'0');
      var copy = document.createElement('span');
      var strong = document.createElement('strong');
      strong.textContent = slide.title;
      var small = document.createElement('small');
      small.textContent = slide.description;
      copy.append(strong,small);
      button.append(thumb,number,copy);
      button.addEventListener('click',function(){selectSlide(index,false);});
      thumbnailsHost.appendChild(button);
      return button;
    });
    selectSlide(0,false);
    return true;
  }

  function closeArchive(){
    if(dialog.open && typeof dialog.close === 'function') dialog.close();
    else{
      dialog.removeAttribute('open');
      document.body.classList.remove('is-session-archive-open');
      if(returnFocus) returnFocus.focus();
    }
  }

  openButtons.forEach(function(button){
    button.addEventListener('click',function(){
      if(!renderArchive(button.dataset.sessionArchiveOpen)) return;
      returnFocus = button;
      document.body.classList.add('is-session-archive-open');
      if(typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open','');
      window.requestAnimationFrame(function(){closeButton.focus();});
    });
  });
  previous.addEventListener('click',function(){selectSlide(activeIndex - 1,false);});
  next.addEventListener('click',function(){selectSlide(activeIndex + 1,false);});
  closeButton.addEventListener('click',closeArchive);
  dialog.addEventListener('click',function(event){if(event.target === dialog) closeArchive();});
  dialog.addEventListener('keydown',function(event){
    if(event.key === 'ArrowLeft'){event.preventDefault();selectSlide(activeIndex - 1,true);}
    if(event.key === 'ArrowRight'){event.preventDefault();selectSlide(activeIndex + 1,true);}
    if(event.key === 'Home'){event.preventDefault();selectSlide(0,true);}
    if(event.key === 'End' && activeArchive){event.preventDefault();selectSlide(activeArchive.slides.length - 1,true);}
  });
  if(imageFrame){
    imageFrame.addEventListener('touchstart',function(event){var touch=event.changedTouches&&event.changedTouches[0];touchStart=touch?{x:touch.clientX,y:touch.clientY}:null;},{passive:true});
    imageFrame.addEventListener('touchend',function(event){
      var touch=event.changedTouches&&event.changedTouches[0];
      if(!touchStart||!touch) return;
      var dx=touch.clientX-touchStart.x;
      var dy=touch.clientY-touchStart.y;
      touchStart=null;
      if(Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)) selectSlide(dx<0?activeIndex+1:activeIndex-1,false);
    },{passive:true});
  }
  dialog.addEventListener('close',function(){document.body.classList.remove('is-session-archive-open');if(returnFocus)returnFocus.focus();});
  dialog.addEventListener('cancel',function(){document.body.classList.remove('is-session-archive-open');});
})();
