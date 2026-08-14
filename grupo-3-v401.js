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
  var toastTimer;

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
      var label = new Intl.DateTimeFormat('es-PY',{day:'numeric',month:'short'}).format(new Date());
      node.textContent = 'Actualizado ' + label;
    }catch(error){node.textContent = 'Actualizado hoy';}
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderPreview('completo');
    restorePlan();
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
})();
