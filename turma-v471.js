(function(){
  'use strict';
  var DEFAULT_CLASS='s4-e';
  var state={classInfo:null,subjects:[],tasks:[],notices:[],activities:[],groups:[],files:[],dates:[],generatedAt:null};
  var currentView='inicio',taskFilter='active';

  function classSlug(){
    var path=location.pathname.match(/^\/turma\/([a-z0-9-]+)\/?$/i);
    var query=new URLSearchParams(location.search).get('class');
    var raw=String((path&&path[1])||query||'').trim().toLowerCase();
    if(!raw)return DEFAULT_CLASS;
    return /^[a-z0-9][a-z0-9-]{0,30}$/.test(raw)?raw:'invalid-class';
  }
  var slug=classSlug();
  var API='/api/class-hub?class='+encodeURIComponent(slug);
  var studentKey='med-nykuto-student-device-v471:'+slug;
  function el(tag,className,text){var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(error){return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(error){}}
  function deviceId(){var value=localStorage.getItem(studentKey);if(value)return value;value=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);try{localStorage.setItem(studentKey,value);}catch(error){}return value;}
  function membershipKey(activityId){return 'med-nykuto-membership-v471:'+slug+':'+activityId;}
  function post(data){return fetch(API,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(data)}).then(function(response){return response.json().then(function(body){if(!response.ok)throw new Error(body.error||body.message||'No se pudo guardar la inscripción.');return body;});});}
  function formatDate(value){if(!value)return 'Fecha por confirmar';var date=new Date(value);if(Number.isNaN(date.getTime()))return value;return new Intl.DateTimeFormat('es-PY',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(date);}
  function timeAgo(value){var date=new Date(value),seconds=Math.floor((Date.now()-date.getTime())/1000);if(!Number.isFinite(seconds)||seconds<0)return 'Actualizado ahora';if(seconds<60)return 'Actualizado ahora';if(seconds<3600)return 'Actualizado hace '+Math.floor(seconds/60)+' min';if(seconds<86400)return 'Actualizado hace '+Math.floor(seconds/3600)+' h';return 'Actualizado el '+new Intl.DateTimeFormat('es-PY',{day:'2-digit',month:'short'}).format(date);}
  function empty(target,message){target.replaceChildren(el('p','empty-card',message));}
  function hashColor(value){var palette=['#38bdf8','#a78bfa','#4ade80','#fbbf24','#fb7185','#2dd4bf'];var total=Array.from(String(value||'')).reduce(function(sum,char){return sum+char.charCodeAt(0);},0);return palette[total%palette.length];}
  function activeTask(task){if(task.status&&task.status!=='published')return false;if(!task.dueAt)return true;return new Date(task.dueAt).getTime()>=Date.now()-86400000;}
  function taskCard(task){
    var card=el('details','task-card');card.dataset.taskId=task.id||'';
    var summary=el('summary'),copy=el('div'),meta=el('span','task-meta',(task.course||'TURMA')+' · '+(task.dueLabel||formatDate(task.dueAt)));
    copy.appendChild(meta);copy.appendChild(el('strong','',task.title||'Tarea'));summary.appendChild(copy);summary.appendChild(el('b','','Abrir'));
    var body=el('div','task-body');body.appendChild(el('p','',task.description||'Consulta la instrucción publicada por el delegado.'));
    var facts=el('div','task-facts');facts.appendChild(el('span','','Estado: '+(activeTask(task)?'activa':'archivada')));if(task.dueAt)facts.appendChild(el('span','',formatDate(task.dueAt)));body.appendChild(facts);
    card.appendChild(summary);card.appendChild(body);card.addEventListener('toggle',function(){summary.lastChild.textContent=card.open?'Cerrar':'Abrir';});return card;
  }
  function noticeCard(notice){var card=el('article','notice-card');card.dataset.priority=notice.priority||'normal';card.appendChild(el('span'));var copy=el('div');copy.appendChild(el('strong','',notice.title||'Actualización'));copy.appendChild(el('small','',notice.body||''));card.appendChild(copy);return card;}
  function subjectRecords(){
    var map={};
    (state.subjects||[]).forEach(function(subject){var key=String(subject.slug||subject.id||subject.name||'').toLowerCase();if(!key)return;map[key]={id:key,name:subject.name||subject.title||key,teacher:subject.teacher||'',color:subject.color||hashColor(key),files:[]};});
    function ensure(name){var key=String(name||'General').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'general';if(!map[key])map[key]={id:key,name:name||'General',teacher:'',color:hashColor(key),files:[]};return map[key];}
    state.tasks.forEach(function(task){ensure(task.course);});
    state.files.forEach(function(file){ensure(file.course).files.push(file);});
    return Object.keys(map).map(function(key){return map[key];}).sort(function(a,b){return a.name.localeCompare(b.name,'es');});
  }
  function renderClass(){
    var info=state.classInfo||{slug:slug,name:slug.toUpperCase(),semester:'',group:''};
    document.title='Med Nykuto · '+(info.name||slug.toUpperCase());
    document.documentElement.dataset.classSlug=slug;
    document.getElementById('classManifest').href='/api/class-manifest?class='+encodeURIComponent(slug);
    document.getElementById('manageLink').href='/gestion/'+encodeURIComponent(slug);
    document.getElementById('classEyebrow').textContent=[info.semester?'SEMESTRE '+info.semester:'MEDICINA',info.group?'GRUPO '+info.group:'TURMA'].join(' · ');
    document.getElementById('homeTitle').textContent=info.name||('Turma '+slug.toUpperCase());
    document.getElementById('classSubtitle').textContent=info.description||'Tareas, materias, fechas y materiales en un solo lugar.';
    document.getElementById('lastUpdated').textContent=timeAgo(state.generatedAt||Date.now());
    var drive=document.getElementById('driveLink');if(info.driveUrl){drive.href=info.driveUrl;drive.hidden=false;}else drive.hidden=true;
    var study=document.getElementById('studyLink');if(info.studyUrl)study.href=info.studyUrl;else if(slug==='s4-e')study.href='/clase.html#entrenamiento';else if(String(info.semester)==='3')study.href='/index.html?semestre=s3';else{study.removeAttribute('href');study.textContent='Los módulos aparecerán después de su validación';study.setAttribute('aria-disabled','true');}
  }
  function renderHome(){
    var tasks=document.getElementById('homeTasks'),active=state.tasks.filter(activeTask).slice(0,3);tasks.replaceChildren();active.forEach(function(task){tasks.appendChild(taskCard(task));});if(!active.length)empty(tasks,'No hay tareas activas.');
    var subjects=document.getElementById('homeSubjects');subjects.replaceChildren();subjectRecords().slice(0,8).forEach(function(subject){var button=el('button','subject-chip');button.type='button';button.style.setProperty('--subject-color',subject.color);button.appendChild(el('span'));button.appendChild(el('strong','',subject.name));button.appendChild(el('small','',subject.files.length+' materiales'));button.addEventListener('click',function(){showView('materias');setTimeout(function(){var target=document.querySelector('[data-subject-id="'+subject.id+'"]');if(target)target.scrollIntoView({block:'start'});},20);});subjects.appendChild(button);});if(!subjects.children.length)empty(subjects,'Las materias todavía no fueron configuradas.');
    var notices=document.getElementById('homeNotices');notices.replaceChildren();state.notices.slice(0,3).forEach(function(notice){notices.appendChild(noticeCard(notice));});if(!state.notices.length)empty(notices,'No hay nuevas alertas.');
  }
  function renderTasks(){var target=document.getElementById('taskList'),items=taskFilter==='active'?state.tasks.filter(activeTask):state.tasks;target.replaceChildren();items.forEach(function(task){target.appendChild(taskCard(task));});if(!items.length)empty(target,taskFilter==='active'?'No hay tareas activas.':'No hay tareas publicadas.');}
  function renderSubjects(filter){
    var target=document.getElementById('subjectList'),query=String(filter||'').trim().toLowerCase();target.replaceChildren();subjectRecords().filter(function(subject){return !query||(subject.name+' '+subject.teacher+' '+subject.files.map(function(file){return file.title;}).join(' ')).toLowerCase().includes(query);}).forEach(function(subject){var card=el('article','subject-card');card.dataset.subjectId=subject.id;card.style.setProperty('--subject-color',subject.color);var head=el('header'),copy=el('div');copy.appendChild(el('strong','',subject.name));copy.appendChild(el('small','',subject.teacher||subject.files.length+' materiales publicados'));head.appendChild(copy);head.appendChild(el('span','subject-dot'));card.appendChild(head);subject.files.forEach(function(file){var row=el('div','file-row'),fileCopy=el('div'),link=el('a','','Abrir →');fileCopy.appendChild(el('strong','',file.title||'Material'));fileCopy.appendChild(el('small','',(file.fileType||'LINK').toUpperCase()+(file.lessonDate?' · '+file.lessonDate:'')));link.href=file.url;link.target='_blank';link.rel='noopener';row.appendChild(fileCopy);row.appendChild(link);card.appendChild(row);});if(!subject.files.length){var row=el('div','file-row'),copyEmpty=el('div');copyEmpty.appendChild(el('small','','Sin materiales publicados todavía.'));row.appendChild(copyEmpty);card.appendChild(row);}target.appendChild(card);});if(!target.children.length)empty(target,'No encontramos una materia con ese nombre.');
  }
  function renderGroupActivity(activity){
    var groups=state.groups.filter(function(group){return group.activityId===activity.id;}),membership=readJson(membershipKey(activity.id),null),item=el('article','tool-item group-activity-card'),head=el('div','group-activity-head'),copy=el('div');
    var occupied=groups.reduce(function(total,group){return total+Number(group.memberCount||0);},0);copy.appendChild(el('strong','',activity.title||'Actividad'));copy.appendChild(el('small','',groups.length+' '+(groups.length===1?'grupo':'grupos')+' · '+occupied+' '+(occupied===1?'integrante':'integrantes')));head.appendChild(copy);if(activity.frozen)head.appendChild(el('span','group-lock','CERRADA'));item.appendChild(head);
    if(!groups.length){item.appendChild(el('p','group-help','El delegado todavía no creó los grupos.'));return item;}
    var choices=el('div','class-group-list'),selected=membership&&membership.groupId?membership.groupId:'';
    groups.forEach(function(group){var capacity=Math.min(Number(group.capacity)||Number(activity.capacity)||10,Number(activity.capacity)||50),count=Math.min(capacity,Number(group.memberCount)||0),button=el('button','class-group-choice');button.type='button';button.dataset.groupId=group.id;button.setAttribute('aria-pressed',selected===group.id?'true':'false');button.disabled=Boolean(membership||activity.frozen||group.frozen||count>=capacity);button.appendChild(el('strong','',group.name||'Grupo'));button.appendChild(el('small','',count+'/'+capacity+' plazas'));if(group.topic)button.appendChild(el('em','',group.topic));button.addEventListener('click',function(){selected=group.id;choices.querySelectorAll('button').forEach(function(choice){choice.setAttribute('aria-pressed',choice===button?'true':'false');});});choices.appendChild(button);});item.appendChild(choices);
    var controls=el('div','group-inline-controls'),status=el('p','group-inline-status');status.setAttribute('role','status');
    if(membership){status.textContent='Inscripción guardada en '+(membership.groupName||'tu grupo')+'. Tu nombre solo es visible en Gestión.';controls.appendChild(status);if(!activity.frozen){var leave=el('button','group-leave','Salir del grupo');leave.type='button';leave.addEventListener('click',function(){leave.disabled=true;status.textContent='Actualizando…';post({action:'group.leave',activityId:activity.id,studentKey:deviceId()}).then(function(){localStorage.removeItem(membershipKey(activity.id));return load();}).catch(function(error){status.textContent=error.message;leave.disabled=false;});});controls.appendChild(leave);}}
    else{
      var name=el('input','group-name');name.type='text';name.maxLength=40;name.autocomplete='nickname';name.placeholder='Tu nombre o alias';name.setAttribute('aria-label','Tu nombre o alias para esta actividad');var join=el('button','group-join','Inscribirme');join.type='button';join.disabled=Boolean(activity.frozen);join.addEventListener('click',function(){if(!name.value.trim()){status.textContent='Escribe tu nombre o alias.';name.focus();return;}if(!selected){status.textContent='Elige un grupo con plazas.';return;}join.disabled=true;status.textContent='Guardando…';post({action:'group.join',activityId:activity.id,groupId:selected,displayName:name.value.trim(),studentKey:deviceId()}).then(function(result){writeJson(membershipKey(activity.id),result);return load();}).catch(function(error){status.textContent=error.message;join.disabled=false;});});controls.appendChild(name);controls.appendChild(join);controls.appendChild(status);
    }
    item.appendChild(controls);item.appendChild(el('small','group-privacy','La página pública muestra ocupación, nunca los nombres de la lista.'));return item;
  }
  function renderMore(){
    var dates=state.dates.slice();state.tasks.filter(function(task){return task.dueAt;}).forEach(function(task){dates.push({id:'task-'+task.id,label:task.title,startsAt:task.dueAt,type:'TAREA'});});dates.sort(function(a,b){return String(a.startsAt).localeCompare(String(b.startsAt));});
    var dateList=document.getElementById('dateList');dateList.replaceChildren();dates.forEach(function(date){var item=el('article','tool-item');item.appendChild(el('strong','',date.label||'Fecha'));item.appendChild(el('small','',(date.type||'CALENDARIO')+' · '+formatDate(date.startsAt)));dateList.appendChild(item);});if(!dates.length)empty(dateList,'No hay fechas publicadas.');document.getElementById('dateCount').textContent=dates.length+' '+(dates.length===1?'fecha':'fechas');
    var groupList=document.getElementById('groupList');groupList.replaceChildren();state.activities.forEach(function(activity){groupList.appendChild(renderGroupActivity(activity));});if(!state.activities.length)empty(groupList,'No hay actividades de grupo publicadas.');document.getElementById('groupCount').textContent=state.groups.length+' '+(state.groups.length===1?'grupo':'grupos');
    var fileList=document.getElementById('fileList');fileList.replaceChildren();state.files.forEach(function(file){var item=el('a','tool-item');item.href=file.url;item.target='_blank';item.rel='noopener';item.appendChild(el('strong','',file.title||'Material'));item.appendChild(el('small','',(file.course||'ARCHIVO')+' · Abrir →'));fileList.appendChild(item);});if(!state.files.length)empty(fileList,'No hay archivos dinámicos publicados.');document.getElementById('fileCount').textContent=state.files.length+' '+(state.files.length===1?'archivo':'archivos');
  }
  function renderNotices(){var target=document.getElementById('noticeDialogList');target.replaceChildren();state.notices.forEach(function(notice){target.appendChild(noticeCard(notice));});if(!state.notices.length)empty(target,'No hay alertas nuevas.');var important=state.notices.filter(function(notice){return notice.priority==='important'||notice.priority==='urgent';}).length,count=document.getElementById('noticeCount');count.textContent=String(important);count.hidden=!important;}
  function renderAll(){renderClass();renderHome();renderTasks();renderSubjects(document.getElementById('subjectSearch').value);renderMore();renderNotices();}
  function normalize(data){state.classInfo=data.class||data.classInfo||null;state.subjects=Array.isArray(data.subjects)?data.subjects:[];['tasks','notices','activities','groups','files','dates'].forEach(function(key){state[key]=Array.isArray(data[key])?data[key]:[];});state.generatedAt=data.generatedAt||new Date().toISOString();}
  function load(){
    document.getElementById('connectionBanner').hidden=true;
    return fetch(API+'&resource=public',{headers:{accept:'application/json'}}).then(function(response){return response.json().then(function(body){if(!response.ok){var failure=new Error(body.error||'No se pudo abrir la turma.');failure.httpStatus=response.status;throw failure;}return body;});}).then(function(data){normalize(data);renderAll();try{localStorage.setItem('med-nykuto-class-cache:'+slug,JSON.stringify(data));}catch(error){}}).catch(function(error){var cached=null,cacheKey='med-nykuto-class-cache:'+slug,mayUseCache=!error.httpStatus||error.httpStatus>=500;if(mayUseCache){try{cached=JSON.parse(localStorage.getItem(cacheKey)||'null');}catch(ignore){}}else{try{localStorage.removeItem(cacheKey);}catch(ignore){}}if(cached){normalize(cached);renderAll();var banner=document.getElementById('connectionBanner');banner.textContent='Sin conexión · mostrando la última versión guardada';banner.hidden=false;return;}document.getElementById('homeTitle').textContent='No pudimos abrir esta turma';document.getElementById('classSubtitle').textContent=error.message;empty(document.getElementById('homeTasks'),'Comprueba el enlace o vuelve a intentarlo.');});
  }
  function showView(view){
    if(['inicio','tareas','materias','estudiar','mas'].indexOf(view)<0)view='inicio';currentView=view;
    document.querySelectorAll('[data-view]').forEach(function(section){var active=section.dataset.view===view;section.hidden=!active;section.classList.toggle('is-active',active);});
    document.querySelectorAll('[data-nav-view]').forEach(function(button){button.classList.toggle('is-active',button.dataset.navView===view);button.setAttribute('aria-current',button.dataset.navView===view?'page':'false');});
    history.replaceState(null,'','#'+view);window.scrollTo({top:0,behavior:'smooth'});
  }
  function share(){var info=state.classInfo||{},url=location.origin+'/turma/'+slug,text='Med Nykuto · '+(info.name||slug.toUpperCase());if(navigator.share)return navigator.share({title:text,text:'Espacio académico de la turma',url:url}).catch(function(){});return navigator.clipboard.writeText(url).then(function(){var button=document.getElementById('shareClass'),previous=button.textContent;button.textContent='Enlace copiado';setTimeout(function(){button.textContent=previous;},1600);});}
  function init(){
    document.querySelectorAll('[data-nav-view]').forEach(function(button){button.addEventListener('click',function(){showView(button.dataset.navView);});});
    document.querySelectorAll('[data-open-view]').forEach(function(button){button.addEventListener('click',function(){showView(button.dataset.openView);});});
    document.querySelectorAll('[data-task-filter]').forEach(function(button){button.addEventListener('click',function(){taskFilter=button.dataset.taskFilter;document.querySelectorAll('[data-task-filter]').forEach(function(item){item.classList.toggle('is-active',item===button);});renderTasks();});});
    document.getElementById('subjectSearch').addEventListener('input',function(event){renderSubjects(event.target.value);});
    var dialog=document.getElementById('noticeDialog');document.getElementById('noticeButton').addEventListener('click',function(){dialog.showModal();});document.querySelector('[data-close-dialog]').addEventListener('click',function(){dialog.close();});dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});
    document.getElementById('shareClass').addEventListener('click',share);document.getElementById('reportProblem').addEventListener('click',function(){var subject=encodeURIComponent('Corrección Med Nykuto · '+slug),body=encodeURIComponent('Turma: '+slug+'\nPágina: '+location.href+'\nInformación a corregir:\n');location.href='mailto:?subject='+subject+'&body='+body;});
    window.addEventListener('online',load);window.addEventListener('offline',function(){var banner=document.getElementById('connectionBanner');banner.textContent='Sin conexión · los últimos datos siguen disponibles';banner.hidden=false;});
    if('serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js').catch(function(){});
    var initial='inicio';try{initial=decodeURIComponent(location.hash.slice(1))||'inicio';}catch(error){}showView(initial);load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
