(function(){
  'use strict';

  if(window.__medNykutoClassPracticalExamsP1V500)return;
  window.__medNykutoClassPracticalExamsP1V500=true;

  var TASK_ID='class-practical-exams-2026-p1';
  var TASK_DOM_ID='task-'+TASK_ID;
  var LEGACY_TASK_ID='bio-practical-2026-09-02';
  var LEGACY_TASK_DOM_ID='task-'+LEGACY_TASK_ID;
  var EXPIRES_AT=Date.parse('2026-09-05T00:00:00-03:00');
  var renderAttempts=0;
  var observerTimer=0;
  var revealedHash='';

  function make(tag,className,text){
    var node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }

  function isPortuguese(){
    return /^pt(?:-|$)/i.test(document.documentElement.lang||'');
  }

  function toggleLabel(isOpen){
    if(isPortuguese())return isOpen?'Fechar':'Abrir';
    return isOpen?'Cerrar':'Abrir';
  }

  function isActive(){
    return Date.now()<EXPIRES_AT;
  }

  function removeLegacyCards(){
    var legacy=document.getElementById(LEGACY_TASK_DOM_ID);
    if(legacy)legacy.remove();
    document.querySelectorAll('[href="#'+LEGACY_TASK_DOM_ID+'"],[data-task-id="'+LEGACY_TASK_ID+'"]').forEach(function(card){card.remove();});
  }

  function removeCurrentCards(){
    var task=document.getElementById(TASK_DOM_ID);
    if(task)task.remove();
    document.querySelectorAll('[data-practical-exams-p1]').forEach(function(card){card.remove();});
  }

  function appendFact(host,value,label){
    var item=make('div');
    item.appendChild(make('strong','',value+' '));
    item.appendChild(make('small','',label));
    host.appendChild(item);
  }

  function appendStep(host,day,dateTime,title,description){
    var item=make('li');
    var badge=make('span');
    var time=make('time','',day);
    time.dateTime=dateTime;
    badge.appendChild(time);
    var copy=make('div');
    copy.appendChild(make('strong','',title));
    copy.appendChild(make('small','',description));
    item.appendChild(badge);
    item.appendChild(copy);
    host.appendChild(item);
  }

  function buildTaskCard(){
    var card=make('details','live-task live-task-details');
    card.id=TASK_DOM_ID;
    card.dataset.liveTaskId=TASK_ID;
    card.open=location.hash==='#'+TASK_DOM_ID;

    var titleId=TASK_DOM_ID+'-title';
    var summary=make('summary','live-task-summary');
    var copy=make('div','live-task-summary-copy');
    copy.appendChild(make('span','live-task-meta','P1 PRÁCTICO · 31 AGO.–04 SEP. · OFICIAL'));
    var title=make('strong','','Semana de pruebas prácticas · cinco materias');
    title.id=titleId;
    copy.appendChild(title);
    summary.appendChild(copy);
    var action=make('b','live-task-action',toggleLabel(card.open));
    action.dataset.taskToggleLabel='true';
    summary.appendChild(action);
    card.appendChild(summary);
    card.setAttribute('aria-labelledby',titleId);

    var body=make('div','live-task-body');
    body.appendChild(make('p','live-task-intro','Estas son las pruebas prácticas oficiales de la semana. No son los exámenes teóricos de P1. Lleva el uniforme; la chompa es obligatoria.'));

    var facts=make('div','live-task-facts');
    facts.setAttribute('aria-label','Datos esenciales de las pruebas prácticas');
    appendFact(facts,'5','pruebas prácticas oficiales');
    appendFact(facts,'31/08–04/09','una materia por día');
    appendFact(facts,'UNIFORME','chompa obligatoria');
    appendFact(facts,'≈30 MIN','prueba de Epidemiología');
    body.appendChild(facts);

    var scheduleTitle=make('h4','','Calendario oficial');
    scheduleTitle.id=TASK_DOM_ID+'-schedule';
    body.appendChild(scheduleTitle);
    var schedule=make('ol','live-task-steps');
    schedule.setAttribute('aria-labelledby',scheduleTitle.id);
    appendStep(schedule,'31','2026-08-31','LUN. 31/08 · Fisiología II','Prueba práctica. Chompa obligatoria.');
    appendStep(schedule,'01','2026-09-01','MAR. 01/09 · Bioética','Prueba práctica. Chompa obligatoria.');
    appendStep(schedule,'02','2026-09-02','MIÉ. 02/09 · Epidemiología','Prueba práctica individual de clasificación de pacientes; consulta las reglas específicas abajo.');
    appendStep(schedule,'03','2026-09-03','JUE. 03/09 · Nutrición','Prueba práctica. Chompa obligatoria.');
    appendStep(schedule,'04','2026-09-04','VIE. 04/09 · Bioquímica II','Caso clínico; lleva los trabajos firmados. La presencia es obligatoria para validarlos.');
    body.appendChild(schedule);

    var epiTitle=make('h4','','Epidemiología · reglas del 02/09');
    epiTitle.id=TASK_DOM_ID+'-epidemiology';
    body.appendChild(epiTitle);
    var epiSteps=make('ol','live-task-steps');
    epiSteps.setAttribute('aria-labelledby',epiTitle.id);
    appendStep(epiSteps,'01','2026-09-02','Repasar Manchester, START y SHORT','Debes reconocer y aplicar los tres sistemas de clasificación indicados por la profesora.');
    appendStep(epiSteps,'02','2026-09-02','Resolver un caso individual en papel','Cada estudiante recibirá una hoja con un caso clínico y clasificará al paciente asignado.');
    appendStep(epiSteps,'03','2026-09-02','Sin celular ni tablet','La clasificación se realiza de forma individual, sin dispositivos electrónicos.');
    appendStep(epiSteps,'04','2026-09-02','Tiempo aproximado: 30 minutos','Organiza la respuesta para completar la clasificación dentro del tiempo previsto.');
    body.appendChild(epiSteps);

    body.appendChild(make('p','live-task-note','Corrección de fecha: Bioquímica II no corresponde al 02/09; su prueba práctica es el viernes 04/09. Microbiología II · Práctica mantiene su clase del jueves por la tarde.'));
    var actions=make('div','live-task-actions');
    var groups=make('a','live-task-download','Ver grupos y trabajos de Bioquímica →');
    groups.href='/bioquimica-ii-grupos';
    actions.appendChild(groups);
    body.appendChild(actions);
    card.appendChild(body);
    card.addEventListener('toggle',function(){action.textContent=toggleLabel(card.open);});
    return card;
  }

  function renderTask(){
    if(!/(?:^|\/)clase\.html$/i.test(location.pathname||''))return false;
    if(!isActive()){removeCurrentCards();return true;}
    var section=document.getElementById('pendientes');
    if(!section)return false;
    var host=document.getElementById('classHubLiveTasks');
    if(!host){
      var heading=section.querySelector('.task-block-heading');
      host=make('div','class-hub-live');
      host.id='classHubLiveTasks';
      if(heading)heading.insertAdjacentElement('afterend',host);
      else section.prepend(host);
    }
    removeLegacyCards();
    if(!document.getElementById(TASK_DOM_ID)){
      var empty=Array.from(host.querySelectorAll('.notice-empty')).find(function(node){return /No hay tareas activas/i.test(node.textContent||'');});
      if(empty)empty.remove();
      host.prepend(buildTaskCard());
      if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh)window.MedNykutoClassI18n.refresh(document.getElementById(TASK_DOM_ID));
      if(location.hash==='#'+TASK_DOM_ID)window.dispatchEvent(new Event('hashchange'));
    }
    return true;
  }

  function buildHomeCard(){
    var card=make('a','priority-card priority-main');
    card.href='#'+TASK_DOM_ID;
    card.dataset.practicalExamsP1='true';
    card.dataset.homework='';
    var head=make('div','priority-card-head');
    head.appendChild(make('span','','P1 · PRÁCTICAS OFICIALES'));
    var time=make('time','','31 AGO.–04 SEP.');
    time.dateTime='2026-08-31';
    head.appendChild(time);
    card.appendChild(head);
    card.appendChild(make('strong','','Cinco pruebas prácticas · uniforme obligatorio'));
    card.appendChild(make('small','','Fisiología, Bioética, Epidemiología, Nutrición y Bioquímica. No son los teóricos de P1.'));
    card.appendChild(make('b','','Ver calendario y reglas →'));
    card.setAttribute('aria-label','Abrir el calendario y las reglas de las pruebas prácticas oficiales del 31 de agosto al 4 de septiembre');
    return card;
  }

  function renderHome(){
    var host=document.querySelector('.dashboard-priorities');
    if(!host)return false;
    if(!isActive()){removeCurrentCards();return true;}
    removeLegacyCards();
    host.querySelectorAll('.dashboard-task-empty').forEach(function(empty){empty.remove();});
    if(!host.querySelector('[data-practical-exams-p1]')){
      var currentMain=host.querySelector('.priority-main');
      if(currentMain)currentMain.classList.remove('priority-main');
      host.prepend(buildHomeCard());
      if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh)window.MedNykutoClassI18n.refresh(host.querySelector('[data-practical-exams-p1]'));
    }
    var panel=host.closest('.dashboard-week-tasks');
    if(panel)panel.classList.remove('is-empty');
    return true;
  }

  function updateCount(){
    var host=document.getElementById('classHubLiveTasks');
    var count=document.getElementById('homeHomeworkCount');
    if(!host||!count)return;
    var total=host.querySelectorAll('.live-task').length;
    var label=isPortuguese()?(total===1?' tarefa ativa':' tarefas ativas'):(total===1?' tarea activa':' tareas activas');
    var value=String(total)+label;
    if(count.textContent!==value)count.textContent=value;
  }

  function revealFromHash(){
    var card=document.getElementById(TASK_DOM_ID);
    if(!card)return;
    var targetHash='#'+TASK_DOM_ID,isTarget=location.hash===targetHash;
    if(isTarget)card.open=true;
    var action=card.querySelector('[data-task-toggle-label]');
    var next=toggleLabel(card.open);
    if(action&&action.textContent!==next)action.textContent=next;
    if(!isTarget){revealedHash='';return;}
    if(revealedHash===targetHash)return;
    revealedHash=targetHash;
    window.requestAnimationFrame(function(){
      var summary=card.querySelector('summary');
      if(!summary)return;
      summary.focus({preventScroll:true});
      var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
    });
  }

  function reconcile(){
    var taskReady=renderTask();
    var homeReady=renderHome();
    updateCount();
    revealFromHash();
    return taskReady&&homeReady;
  }

  function startRender(){
    if(reconcile())return;
    if(renderAttempts<60){
      renderAttempts+=1;
      setTimeout(startRender,50);
    }
  }

  function scheduleReconcile(){
    clearTimeout(observerTimer);
    observerTimer=setTimeout(reconcile,0);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRender,{once:true});
  else startRender();
  window.addEventListener('mednykuto:class-public-data',scheduleReconcile);
  window.addEventListener('hashchange',function(){reconcile();});

  if(window.MutationObserver){
    var observer=new MutationObserver(scheduleReconcile);
    var observed=document.querySelector('.class-app')||document.body;
    if(observed)observer.observe(observed,{childList:true,subtree:true});
  }
})();
