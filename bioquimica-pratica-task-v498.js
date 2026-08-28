(function(){
  'use strict';
  var TASK_ID='bio-practical-2026-09-02';
  function make(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function render(){
    if(!/(?:^|\/)clase\.html$/i.test(location.pathname||''))return;
    var section=document.getElementById('pendientes');if(!section)return;
    var host=document.getElementById('classHubLiveTasks');
    if(!host){var heading=section.querySelector('.task-block-heading');host=make('div','class-hub-live');host.id='classHubLiveTasks';if(heading)heading.insertAdjacentElement('afterend',host);else section.prepend(host);}
    if(document.getElementById('task-'+TASK_ID))return;
    var empty=Array.from(host.querySelectorAll('.notice-empty')).find(function(n){return /No hay tareas activas/i.test(n.textContent||'');});if(empty)empty.remove();
    var card=make('details','live-task live-task-details');card.id='task-'+TASK_ID;card.dataset.liveTaskId=TASK_ID;card.open=location.hash==='#task-'+TASK_ID;
    var summary=make('summary','live-task-summary'),copy=make('div','live-task-summary-copy');copy.appendChild(make('span','live-task-meta','BIOQUÍMICA II · MIÉ. 02 SEP. · CONFIRMADA'));copy.appendChild(make('strong','','Prueba práctica · caso clínico, trabajos firmados y grupos'));summary.appendChild(copy);summary.appendChild(make('b','live-task-action',card.open?'Cerrar':'Abrir'));card.appendChild(summary);
    var body=make('div','live-task-body');body.appendChild(make('p','live-task-intro','La prueba práctica será el 02/09. La nota se suma entre el caso clínico y los trabajos realizados. La presencia es obligatoria para validar los trabajos.'));
    var facts=make('div','live-task-facts');[['10','integrantes máximo por grupo'],['1 PUNTO','caso clínico con preguntas'],['4','trabajos ya pasados'],['OBLIGATORIA','asistencia el día de la prueba']].forEach(function(f){var x=make('div');x.appendChild(make('strong','',f[0]+' '));x.appendChild(make('small','',f[1]));facts.appendChild(x);});body.appendChild(facts);
    var title=make('h4','','Qué tienes que hacer');body.appendChild(title);var steps=make('ol','live-task-steps');[
      ['Llevar todos los trabajos firmados','Si no se llevan ese día, la nota correspondiente es cero porque el acta será firmada.'],
      ['Asistir personalmente','La profesora no aceptará que terceros entreguen trabajos de otros alumnos.'],
      ['Resolver el caso clínico','Habrá preguntas sobre un caso clínico y esta parte vale 1 punto.'],
      ['Verificar tu grupo','Los grupos admiten como máximo 10 integrantes. Usa la página interactiva para consultar la lista y las plazas.']
    ].forEach(function(s,i){var li=make('li');li.appendChild(make('span','',String(i+1).padStart(2,'0')));var c=make('div');c.appendChild(make('strong','',s[0]));c.appendChild(make('small','',s[1]));li.appendChild(c);steps.appendChild(li);});body.appendChild(steps);
    var actions=make('div','live-task-actions');var link=make('a','live-task-download','Ver y organizar los grupos →');link.href='/bioquimica-ii-grupos';actions.appendChild(link);body.appendChild(actions);
    var note=make('p','live-task-note','La profesora dará una última oportunidad para revisar los trabajos. El viernes verificará los cuatro trabajos ya realizados.');body.appendChild(note);card.appendChild(body);
    card.addEventListener('toggle',function(){var b=card.querySelector('.live-task-action');if(b)b.textContent=card.open?'Cerrar':'Abrir';});host.prepend(card);
    var count=document.getElementById('homeHomeworkCount');if(count){var total=host.querySelectorAll('.live-task').length;var pt=/^pt\b/i.test(document.documentElement.lang||'');count.textContent=total+' '+(pt?(total===1?'tarefa ativa':'tarefas ativas'):(total===1?'tarea activa':'tareas activas'));}
  }
  var renderAttempts=0;
  function startRender(){var host=document.getElementById('classHubLiveTasks');if(host&&host.querySelectorAll('.live-task').length>=2){render();return;}if(renderAttempts<40){renderAttempts+=1;setTimeout(startRender,50);return;}render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRender,{once:true});else startRender();
  window.addEventListener('hashchange',function(){startRender();var card=document.getElementById('task-'+TASK_ID);if(card)card.open=location.hash==='#task-'+TASK_ID;});
})();