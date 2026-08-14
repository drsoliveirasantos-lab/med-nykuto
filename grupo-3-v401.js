(function(){
  'use strict';

  var previews = {
    completo: {
      eyebrow: 'CURSO COMPLETO · VISTA PREVIA',
      title: 'El recorrido que debes comprender',
      duration: '12 min',
      html: '<ol class="study-map"><li><span>01 · BASE</span><strong>Metabolismo</strong><small>Precursor, intermediarios, productos y regulación enzimática.</small></li><li><span>02 · ENTRADA</span><strong>Transportadores</strong><small>GLUT, SGLT y señal de insulina para movilizar GLUT4.</small></li><li><span>03 · CRUCE</span><strong>Glucosa-6-P</strong><small>Glucólisis, pentosas fosfato o almacenamiento como glucógeno.</small></li><li><span>04 · CLÍNICA</span><strong>Glicación y G6PD</strong><small>HbA1c, AGE y protección antioxidante del eritrocito.</small></li></ol>'
    },
    rapido: {
      eyebrow: 'FICHA RÁPIDA · 7 IDEAS',
      title: 'El mapa central en cinco minutos',
      duration: '5 min',
      html: '<ul class="preview-list"><li>Metabolismo = conjunto de reacciones químicas celulares.</li><li>La glucosa necesita transportadores porque es una molécula polar.</li><li>GLUT realiza difusión facilitada; SGLT usa el gradiente de sodio.</li><li>GLUT4 responde a insulina y también a la contracción muscular.</li><li>Glucosa-6-P puede entrar en glucólisis, pentosas o glucogénesis.</li><li>La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.</li><li>G6PD produce NADPH para proteger al eritrocito del estrés oxidativo.</li></ul>'
    },
    ultra: {
      eyebrow: 'ULTRA RÁPIDA · OBLIGATORIO',
      title: 'Lo que no puedes olvidar',
      duration: '2 min',
      html: '<ul class="preview-list"><li><strong>GLUT4:</strong> músculo y tejido adiposo; insulina y ejercicio.</li><li><strong>GLUT5:</strong> transporta principalmente fructosa.</li><li><strong>G6P:</strong> punto de cruce entre tres vías principales.</li><li><strong>Glucólisis:</strong> ocurre en el citosol y no consume O₂ directamente.</li><li><strong>Lactato:</strong> permite regenerar NAD⁺ para mantener la glucólisis.</li></ul>'
    },
    oral: {
      eyebrow: 'REPASO ORAL · ESTILO DE CLASE',
      title: 'Responde sin mirar la explicación',
      duration: '18 preguntas',
      html: '<ol class="oral-list"><li>¿Qué diferencia existe entre precursor, intermediario y producto?</li><li>¿Por qué la glucosa necesita un transportador?</li><li>¿Cuál es la diferencia entre GLUT y SGLT?</li><li>¿Qué características distinguen GLUT2, GLUT3, GLUT4 y GLUT5?</li><li>¿Cuáles son los tres destinos principales de la glucosa-6-fosfato?</li><li>¿Por qué la deficiencia de G6PD produce anemia hemolítica?</li></ol>'
    }
  };

  var storageKey = 'med-nykuto-grupo3-plan-v401';
  var labStorageKey = 'med-nykuto-lab-group-v403';
  var bioPrepStorageKey = 'med-nykuto-bio-prep-v403';
  var toastTimer;

  var classSchedule = [
    {day:1,start:'07:00',end:'10:10',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:1,start:'10:10',end:'12:20',subject:'Microbiología II',teacher:'Dr. Alexander Acuña'},
    {day:1,start:'15:00',end:'17:00',subject:'Bioética · plataforma',teacher:'Lic. Silvia Nuarte'},
    {day:3,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'},
    {day:3,start:'11:20',end:'13:20',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:4,start:'07:00',end:'09:40',subject:'Nutrición',teacher:'Lic. Johana Leguizamón'},
    {day:4,start:'09:40',end:'12:20',subject:'Fisiología II',teacher:'Dra. Giselle Vert'},
    {day:5,start:'07:00',end:'09:00',subject:'Epidemiología y Salud Pública',teacher:'Dra. Andrea Isasi'},
    {day:5,start:'09:10',end:'11:10',subject:'Bioquímica II',teacher:'Dra. Andrea López'}
  ];

  var labSlots = {
    '1':{day:4,start:'14:00',end:'16:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 1'},
    '2':{day:4,start:'16:00',end:'18:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 2'},
    '3':{day:4,start:'18:00',end:'20:00',subject:'Laboratorio de Microbiología II',teacher:'Dra. Ruth Castillo',group:'Grupo 3'}
  };

  function renderPreview(mode){
    var data = previews[mode] || previews.completo;
    document.getElementById('studyPreviewEyebrow').textContent = data.eyebrow;
    document.getElementById('study-preview-title').textContent = data.title;
    document.getElementById('studyPreviewDuration').textContent = data.duration;
    document.getElementById('studyPreviewBody').innerHTML = data.html;
    document.querySelectorAll('[data-study-mode]').forEach(function(button){
      var active = button.dataset.studyMode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function showToast(message){
    var toast = document.getElementById('classToast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function(){ toast.classList.remove('is-visible'); }, 2600);
  }

  function readPlan(){
    try{return JSON.parse(localStorage.getItem(storageKey) || '[]');}catch(error){return [];}
  }

  function savePlan(){
    var checked = Array.from(document.querySelectorAll('#studyChecklist input:checked')).map(function(input){return input.value;});
    try{localStorage.setItem(storageKey, JSON.stringify(checked));}catch(error){}
    updatePlanProgress();
  }

  function updatePlanProgress(){
    var all = document.querySelectorAll('#studyChecklist input');
    var done = document.querySelectorAll('#studyChecklist input:checked').length;
    document.getElementById('planCount').textContent = done + '/' + all.length;
    document.getElementById('planProgressBar').style.width = (all.length ? done / all.length * 100 : 0) + '%';
  }

  function restorePlan(){
    var saved = readPlan();
    document.querySelectorAll('#studyChecklist input').forEach(function(input){input.checked = saved.indexOf(input.value) !== -1;});
    updatePlanProgress();
  }

  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){return navigator.clipboard.writeText(text);}
    return new Promise(function(resolve, reject){
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly','');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try{document.execCommand('copy');resolve();}catch(error){reject(error);}
      area.remove();
    });
  }

  function setUpdatedDate(){
    var node = document.getElementById('lastUpdated');
    try{
      var label = new Intl.DateTimeFormat('es-PY',{day:'numeric',month:'short',timeZone:'America/Asuncion'}).format(new Date());
      node.textContent = 'Actualizado ' + label;
    }catch(error){node.textContent = 'Actualizado hoy';}
  }

  function getParaguayWallClock(){
    try{
      var parts = new Intl.DateTimeFormat('en-US',{
        timeZone:'America/Asuncion',year:'numeric',month:'numeric',day:'numeric',
        hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'
      }).formatToParts(new Date());
      var values = {};
      parts.forEach(function(part){if(part.type !== 'literal') values[part.type] = Number(part.value);});
      return new Date(Date.UTC(values.year,values.month-1,values.day,values.hour,values.minute,values.second));
    }catch(error){return new Date();}
  }

  function candidateFor(day,start,offset,now){
    var date = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+offset));
    if(date.getUTCDay() !== day) return null;
    var time = start.split(':').map(Number);
    date.setUTCHours(time[0],time[1],0,0);
    return date;
  }

  function nextOccurrence(items,filter){
    var now = getParaguayWallClock();
    var candidates = [];
    for(var offset=0;offset<15;offset+=1){
      items.forEach(function(item){
        if(filter && !filter(item)) return;
        var date = candidateFor(item.day,item.start,offset,now);
        if(date && date.getTime() > now.getTime()) candidates.push({item:item,date:date});
      });
    }
    candidates.sort(function(a,b){return a.date-b.date;});
    return candidates[0] || null;
  }

  function formatOccurrence(occurrence){
    if(!occurrence) return 'Sin próxima fecha disponible';
    var dateLabel = new Intl.DateTimeFormat('es-PY',{
      weekday:'long',day:'numeric',month:'short',timeZone:'UTC'
    }).format(occurrence.date);
    dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
    return dateLabel + ' · ' + occurrence.item.start + '–' + occurrence.item.end;
  }

  function readLabGroup(){
    try{return localStorage.getItem(labStorageKey) || '';}catch(error){return '';}
  }

  function renderSchedule(){
    var select = document.getElementById('labGroupSelect');
    var group = select.value;
    var items = classSchedule.slice();
    if(group && labSlots[group]) items.push(labSlots[group]);

    var next = nextOccurrence(items);
    if(next){
      document.getElementById('nextScheduleSubject').textContent = next.item.subject;
      document.getElementById('nextScheduleWhen').textContent = formatOccurrence(next);
      document.getElementById('nextScheduleTeacher').textContent = (next.item.group ? next.item.group + ' · ' : '') + next.item.teacher;
    }

    document.querySelectorAll('[data-schedule-day]').forEach(function(card){
      card.classList.toggle('is-next-day',!!next && Number(card.dataset.scheduleDay) === next.item.day);
    });

    var timeNode = document.getElementById('labScheduleTime');
    var groupNode = document.getElementById('labScheduleGroup');
    var nextLabNode = document.getElementById('nextLabWhen');
    if(group && labSlots[group]){
      var lab = labSlots[group];
      timeNode.textContent = lab.start + '–' + lab.end;
      groupNode.textContent = lab.group + ' · ' + lab.teacher;
      nextLabNode.textContent = formatOccurrence(nextOccurrence([lab]));
    }else{
      timeNode.textContent = 'G1 14:00 · G2 16:00 · G3 18:00';
      groupNode.textContent = 'Selecciona tu subgrupo';
      nextLabNode.textContent = 'Selecciona tu subgrupo';
    }

    var nextBio = nextOccurrence(classSchedule,function(item){return item.subject === 'Bioquímica II';});
    document.getElementById('bioEstimatedDate').textContent = formatOccurrence(nextBio) + ' · por confirmar';
  }

  function restorePersonalSchedule(){
    var select = document.getElementById('labGroupSelect');
    var saved = readLabGroup();
    if(labSlots[saved]) select.value = saved;
    select.addEventListener('change',function(){
      try{
        if(select.value) localStorage.setItem(labStorageKey,select.value);
        else localStorage.removeItem(labStorageKey);
      }catch(error){}
      renderSchedule();
      if(select.value) showToast('Subgrupo guardado solo en este dispositivo.');
    });

    var prep = document.getElementById('bioPrepDone');
    try{prep.checked = localStorage.getItem(bioPrepStorageKey) === '1';}catch(error){}
    document.getElementById('bioPrepCard').classList.toggle('is-complete',prep.checked);
    prep.addEventListener('change',function(){
      try{localStorage.setItem(bioPrepStorageKey,prep.checked ? '1' : '0');}catch(error){}
      document.getElementById('bioPrepCard').classList.toggle('is-complete',prep.checked);
    });
    renderSchedule();
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderPreview('completo');
    restorePlan();
    restorePersonalSchedule();
    setUpdatedDate();

    document.querySelectorAll('[data-study-mode]').forEach(function(button){
      button.addEventListener('click', function(){
        renderPreview(button.dataset.studyMode);
        document.getElementById('repaso').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    document.getElementById('studyChecklist').addEventListener('change', savePlan);

    document.getElementById('delegateQuestionForm').addEventListener('submit', function(event){
      event.preventDefault();
      var subject = document.getElementById('questionSubject').value.trim();
      var question = document.getElementById('questionText').value.trim();
      if(!question) return;
      var message = 'Materia: ' + subject + '\nDuda para transmitir: ' + question;
      copyText(message).then(function(){showToast('Mensaje copiado. Ya puedes compartirlo.');}).catch(function(){showToast('No se pudo copiar automáticamente.');});
    });
  });

  window.MED_NYKUTO_CLASS_SCHEDULE = classSchedule.slice();
})();
