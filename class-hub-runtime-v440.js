(function(){
  'use strict';
  var API='/api/class-hub';
  var progressKey='med-nykuto-course-progress-v440';
  var studentKey='med-nykuto-student-device-v440';
  var publicData={notices:[],tasks:[],activities:[],groups:[],files:[],dates:[]};

  function el(tag,className,text){var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(error){return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(error){}}
  function deviceId(){var value=localStorage.getItem(studentKey);if(value)return value;value=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);try{localStorage.setItem(studentKey,value);}catch(error){}return value;}
  function fileName(href){var clean=href.split('#')[0].split('?')[0];try{return decodeURIComponent(clean.slice(clean.lastIndexOf('/')+1));}catch(error){return clean.slice(clean.lastIndexOf('/')+1);}}
  function extensionLabel(href){var match=href.split('?')[0].match(/\.([a-z0-9]+)$/i);return match?match[1].toUpperCase():'ARCHIVO';}

  function initLessonTabs(){
    document.querySelectorAll('[data-lesson-tabs]').forEach(function(nav){
      var lesson=nav.closest('[data-lesson-panel]');
      if(!lesson)return;
      var buttons=Array.prototype.slice.call(nav.querySelectorAll('[data-lesson-tab]'));
      var panels=Array.prototype.slice.call(lesson.querySelectorAll(':scope > [data-lesson-tab-panel]'));
      function show(id,focus){
        buttons.forEach(function(button){var active=button.dataset.lessonTab===id;button.setAttribute('aria-selected',active?'true':'false');button.tabIndex=active?0:-1;});
        panels.forEach(function(panel){panel.hidden=panel.dataset.lessonTabPanel!==id;});
        if(focus){var selected=nav.querySelector('[data-lesson-tab="'+id+'"]');if(selected)selected.focus();}
      }
      buttons.forEach(function(button,index){
        button.addEventListener('click',function(){show(button.dataset.lessonTab,false);});
        button.addEventListener('keydown',function(event){if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;event.preventDefault();var next=(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;show(buttons[next].dataset.lessonTab,true);});
      });
      show('curso',false);
    });
  }

  function collectFiles(subject){
    var seen={};
    var files=Array.prototype.slice.call(subject.querySelectorAll('a[href]')).map(function(link){
      var href=link.getAttribute('href')||'';
      if(!/\.(?:pdf|pptx|docx|svg)(?:$|[?#])/i.test(href)||seen[href])return null;
      seen[href]=true;
      return {href:href,name:fileName(href),type:extensionLabel(href)};
    }).filter(Boolean);
    var aliases={nutricion:['nutrición','nutricion'],fisiologia:['fisiología','fisiologia'],bioquimica:['bioquímica','bioquimica'],epidemiologia:['epidemiología','epidemiologia','salud pública'],'microbiologia-teorica':['microbiología','microbiologia'],'microbiologia-practica':['microbiología','microbiologia']};
    (publicData.files||[]).forEach(function(file){var course=String(file.course||'').toLowerCase(),matches=(aliases[subject.id]||[subject.id]).some(function(alias){return course.indexOf(alias)>=0;});if(!matches||seen[file.url])return;seen[file.url]=true;files.push({href:file.url,name:file.title,type:String(file.fileType||extensionLabel(file.url)).toUpperCase()});});
    return files;
  }
  function renderTopics(subject,panel,activate){
    panel.replaceChildren();
    var heading=el('h3','','Temas y clases');panel.appendChild(heading);
    var list=el('div','workspace-topic-list');
    var links=subject.querySelectorAll('[data-lesson-target]');
    if(!links.length){var current=el('div','workspace-progress-row');var copy=el('span');copy.appendChild(el('strong','',subject.querySelector('h2')?subject.querySelector('h2').textContent:'Cuaderno'));copy.appendChild(el('small','','Última clase disponible'));current.appendChild(copy);list.appendChild(current);}
    links.forEach(function(link){
      var item=el('a');item.href='#'+link.dataset.lessonTarget;
      var copy=el('div');copy.appendChild(el('strong','',link.querySelector('strong')?link.querySelector('strong').textContent:link.dataset.lessonTarget));copy.appendChild(el('small','',link.querySelector('time, :scope > span')?link.querySelector('time, :scope > span').textContent:'Clase'));item.appendChild(copy);item.appendChild(el('span','','→'));
      item.addEventListener('click',function(event){event.preventDefault();activate('cuaderno');link.click();history.replaceState(null,'','#'+link.dataset.lessonTarget);document.getElementById(link.dataset.lessonTarget).scrollIntoView({block:'start'});});
      list.appendChild(item);
    });
    panel.appendChild(list);
  }
  function renderFiles(subject,panel){
    panel.replaceChildren();
    panel.appendChild(el('h3','','Archivos de la materia'));
    var files=collectFiles(subject),actions=el('div','workspace-file-actions'),list=el('div','workspace-file-list');
    var selectAll=el('button','','Seleccionar todo'),download=el('button','','Descargar selección');selectAll.type=download.type='button';actions.appendChild(selectAll);actions.appendChild(download);panel.appendChild(actions);
    if(!files.length){panel.appendChild(el('p','workspace-progress-summary','No hay archivos descargables en esta materia.'));return;}
    files.forEach(function(file,index){var row=el('label','workspace-file-row');var check=el('input');check.type='checkbox';check.value=file.href;check.setAttribute('aria-label','Seleccionar '+file.name);var copy=el('div');copy.appendChild(el('strong','',file.name));copy.appendChild(el('small','',file.type));var open=el('a','','Abrir');open.href=file.href;open.target='_blank';open.rel='noopener';row.appendChild(check);row.appendChild(copy);row.appendChild(open);list.appendChild(row);});panel.appendChild(list);
    selectAll.addEventListener('click',function(){var checks=list.querySelectorAll('input');var all=Array.prototype.every.call(checks,function(check){return check.checked;});checks.forEach(function(check){check.checked=!all;});selectAll.textContent=all?'Seleccionar todo':'Quitar selección';});
    download.addEventListener('click',function(){var selected=Array.prototype.slice.call(list.querySelectorAll('input:checked'));if(!selected.length){download.textContent='Selecciona al menos uno';setTimeout(function(){download.textContent='Descargar selección';},1800);return;}selected.forEach(function(check,index){setTimeout(function(){var link=el('a');link.href=check.value;link.download=fileName(check.value);document.body.appendChild(link);link.click();link.remove();},index*250);});});
  }
  function renderProgress(subject,panel){
    panel.replaceChildren();panel.appendChild(el('h3','','Progreso del cuaderno'));
    var state=readJson(progressKey,{}),courseState=state[subject.id]||{},targets=subject.querySelectorAll('[data-lesson-target]'),rows=el('div','workspace-progress-list'),summary=el('p','workspace-progress-summary'),meter=el('div','workspace-progress-meter');meter.appendChild(el('i'));
    var lessons=[];targets.forEach(function(target){if(lessons.indexOf(target.dataset.lessonTarget)===-1)lessons.push(target.dataset.lessonTarget);});if(!lessons.length)lessons=[subject.id];
    function refresh(){var done=lessons.filter(function(id){return Boolean(courseState[id]);}).length;summary.textContent=done+' de '+lessons.length+' clases marcadas como revisadas.';meter.firstChild.style.width=Math.round(done/lessons.length*100)+'%';state[subject.id]=courseState;writeJson(progressKey,state);}
    lessons.forEach(function(id){var target=subject.querySelector('[data-lesson-target="'+id+'"]');var row=el('label','workspace-progress-row'),check=el('input');check.type='checkbox';check.checked=Boolean(courseState[id]);var copy=el('span');copy.appendChild(el('strong','',target&&target.querySelector('strong')?target.querySelector('strong').textContent:(subject.querySelector('h2')||{}).textContent||id));copy.appendChild(el('small','',check.checked?'Revisada':'Pendiente'));check.addEventListener('change',function(){courseState[id]=check.checked;copy.querySelector('small').textContent=check.checked?'Revisada':'Pendiente';refresh();});row.appendChild(check);row.appendChild(copy);rows.appendChild(row);});
    panel.appendChild(summary);panel.appendChild(meter);panel.appendChild(rows);refresh();
  }
  function initCourseWorkspaces(){
    document.querySelectorAll('.subject-section[data-view="cursos"]').forEach(function(subject){
      var heading=subject.querySelector('.subject-heading');if(!heading)return;
      var nav=el('nav','course-workspace');nav.setAttribute('aria-label','Vistas de la materia');var panel=el('section','course-workspace-panel');panel.hidden=true;var snapshot=null;
      var modes=[['cuaderno','Cuaderno'],['temas','Temas'],['archivos','Archivos'],['progreso','Progreso']];
      function activate(mode){
        nav.querySelectorAll('button').forEach(function(button){button.setAttribute('aria-selected',button.dataset.workspaceMode===mode?'true':'false');});
        var content=Array.prototype.slice.call(subject.children).filter(function(child){return child!==heading&&child!==nav&&child!==panel;});
        if(mode==='cuaderno'){
          if(snapshot){content.forEach(function(child){child.hidden=Boolean(snapshot.get(child));});snapshot=null;}
          panel.hidden=true;return;
        }
        if(!snapshot){snapshot=new Map();content.forEach(function(child){snapshot.set(child,child.hidden);child.hidden=true;});}
        panel.hidden=false;
        if(mode==='temas')renderTopics(subject,panel,activate);else if(mode==='archivos')renderFiles(subject,panel);else renderProgress(subject,panel);
      }
      modes.forEach(function(mode){var button=el('button','',mode[1]);button.type='button';button.dataset.workspaceMode=mode[0];button.setAttribute('aria-selected',mode[0]==='cuaderno'?'true':'false');button.addEventListener('click',function(){activate(mode[0]);});nav.appendChild(button);});
      heading.insertAdjacentElement('afterend',nav);nav.insertAdjacentElement('afterend',panel);
    });
  }

  var galleries={
    epi19:{title:'Organización de urgencias y emergencias',count:57,path:function(index){return 'assets/class-hub/epidemiology/2026-08-19/slides/'+String(index).padStart(2,'0')+'.webp';}},
    fisio20:{title:'Ejercicios de fijación del sistema nervioso',count:13,path:function(index){return 'assets/class-hub/physiology/2026-08-20/pages/'+String(index).padStart(2,'0')+'.webp';}},
    bioTask:{title:'Actividades 3 y 4 de Bioquímica',count:4,path:function(index){return 'assets/class-hub/biochemistry/2026-08-21/task-pages/'+String(index).padStart(2,'0')+'.webp';}},
    epiTask:{title:'Trabajo práctico de Epidemiología',count:1,path:function(){return 'assets/class-hub/epidemiology/2026-08-19/task-pages/01.webp';}}
  };
  function initGallery(){
    var dialog=el('dialog','image-lightbox'),image=el('img'),close=el('button','','×'),footer=el('div','board-archive-controls'),previous=el('button','','← Anterior'),counter=el('span'),next=el('button','','Siguiente →');close.type=previous.type=next.type='button';close.setAttribute('aria-label','Cerrar');footer.appendChild(previous);footer.appendChild(counter);footer.appendChild(next);dialog.appendChild(close);dialog.appendChild(image);dialog.appendChild(footer);document.body.appendChild(dialog);var active=null,index=1,returnFocus=null;
    function show(){if(!active)return;image.src=active.path(index);image.alt=active.title+' · '+index+' de '+active.count;counter.textContent=index+' / '+active.count;previous.disabled=index<=1;next.disabled=index>=active.count;}
    function open(definition,button){active=definition;index=1;returnFocus=button;show();dialog.showModal();}
    document.querySelectorAll('[data-hub-gallery]').forEach(function(button){button.addEventListener('click',function(){open(galleries[button.dataset.hubGallery],button);});});
    document.querySelectorAll('[data-image-lightbox]').forEach(function(button){button.addEventListener('click',function(){open({title:(button.querySelector('img')||{}).alt||'Pizarra reconstruida',count:1,path:function(){return button.dataset.imageLightbox;}},button);});});
    previous.addEventListener('click',function(){if(index>1){index-=1;show();}});next.addEventListener('click',function(){if(index<active.count){index+=1;show();}});close.addEventListener('click',function(){dialog.close();});dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});dialog.addEventListener('close',function(){image.removeAttribute('src');if(returnFocus)returnFocus.focus();});
  }

  function fallbackPublic(){return {notices:[{id:'week-2026-08-21',priority:'normal',title:'Cursos del 19 al 21 de agosto disponibles',body:'Bioquímica, Epidemiología, Fisiología y Microbiología práctica ya están organizadas.'},{id:'tasks-2026-08-21',priority:'important',title:'Dos trabajos activos',body:'Epidemiología: exposición grupal. Bioquímica: imprimir y completar a mano las actividades 3 y 4.'}],tasks:[{id:'epi-presentation',course:'Epidemiología',title:'Exposición grupal de enfermedad sorteada',status:'published',dueLabel:'Semana siguiente'},{id:'bio-activities',course:'Bioquímica II',title:'Actividades 3 y 4 impresas y manuscritas',status:'published',dueLabel:'Práctico · presencia obligatoria'}],activities:[{id:'epi-2026-08-19',title:'Exposición de Epidemiología',capacity:10,status:'published'}],groups:[],files:[],dates:[]};}
  function vapidBytes(value){var padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64),output=new Uint8Array(raw.length);for(var index=0;index<raw.length;index+=1)output[index]=raw.charCodeAt(index);return output;}
  function enablePush(button){
    if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){button.textContent='Push no disponible en este navegador';button.disabled=true;return;}
    button.disabled=true;button.textContent='Activando…';
    Promise.all([navigator.serviceWorker.ready,fetch(API+'?resource=push-key').then(function(response){return response.json();})]).then(function(results){var registration=results[0],key=results[1].publicKey;if(!key)throw new Error('El servicio push todavía no tiene una clave pública configurada.');return Notification.requestPermission().then(function(permission){if(permission!=='granted')throw new Error('Permiso de notificaciones no concedido.');return registration.pushManager.getSubscription().then(function(existing){return existing||registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:vapidBytes(key)});});});}).then(function(subscription){return fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'push.subscribe',subscription:subscription.toJSON()})});}).then(function(response){if(!response.ok)throw new Error('No se pudo guardar la suscripción.');button.textContent='Alertas importantes activadas';}).catch(function(error){button.textContent=error.message;button.disabled=false;});
  }
  function renderNotices(){
    var bell=document.getElementById('noticeBell');if(!bell)return;var drawer=document.getElementById('noticeDrawer');if(!drawer){drawer=el('dialog','notice-drawer');drawer.id='noticeDrawer';var head=el('header');head.appendChild(el('strong','','Alertas de la clase'));var close=el('button','','×');close.type='button';close.setAttribute('aria-label','Cerrar alertas');head.appendChild(close);drawer.appendChild(head);drawer.appendChild(el('div','notice-list'));document.body.appendChild(drawer);close.addEventListener('click',function(){drawer.close();});}
    var list=drawer.querySelector('.notice-list');list.replaceChildren();if(!publicData.notices.length)list.appendChild(el('p','notice-empty','No hay alertas publicadas.'));
    publicData.notices.forEach(function(notice){var item=el('article','notice-item');item.dataset.priority=notice.priority||'normal';item.appendChild(el('span','',(notice.priority||'normal').toUpperCase()));item.appendChild(el('strong','',notice.title));item.appendChild(el('p','',notice.body||''));list.appendChild(item);});
    var pushButton=el('button','class-header-action','Activar alertas importantes');pushButton.type='button';pushButton.style.width='100%';pushButton.addEventListener('click',function(){enablePush(pushButton);});list.appendChild(pushButton);
    var important=publicData.notices.filter(function(notice){return notice.priority==='important'||notice.priority==='urgent';}).length;if(important)bell.dataset.count=String(important);else bell.removeAttribute('data-count');
    var urgent=publicData.notices.find(function(notice){return notice.priority==='urgent';});var banner=document.getElementById('urgentNoticeBanner');if(urgent&&!sessionStorage.getItem('dismissed-urgent-'+urgent.id)){if(!banner){banner=el('div','urgent-notice-banner');banner.id='urgentNoticeBanner';var copy=el('span');var dismiss=el('button','','×');dismiss.type='button';banner.appendChild(copy);banner.appendChild(dismiss);document.body.insertBefore(banner,document.body.firstChild);dismiss.addEventListener('click',function(){banner.hidden=true;sessionStorage.setItem('dismissed-urgent-'+urgent.id,'1');});}banner.firstChild.textContent=urgent.title+(urgent.body?' · '+urgent.body:'');banner.hidden=false;}
    bell.addEventListener('click',function(){drawer.showModal();});
  }
  function renderLiveTasks(){
    var activeTasks=publicData.tasks.filter(function(task){return task.status==='published'||!task.status;});
    document.querySelectorAll('[data-task-id]').forEach(function(card){
      var id=card.dataset.taskId,task=activeTasks.find(function(item){return item.id===id;});
      card.hidden=!task;
      if(!task)return;
      var course=card.querySelector('.priority-card-head span'),due=card.querySelector('.priority-card-head time'),title=card.querySelector(':scope > strong'),description=card.querySelector(':scope > small');
      if(course)course.textContent=task.course||'CLASE';
      if(due)due.textContent=task.dueLabel||'POR CONFIRMAR';
      if(title)title.textContent=task.title;
      if(description)description.textContent=task.description||'';
    });
    var host=document.getElementById('classHubLiveTasks');
    if(!host){
      var section=document.getElementById('pendientes');
      var heading=section&&section.querySelector('.task-block-heading');
      if(!section)return;
      host=el('div','class-hub-live');host.id='classHubLiveTasks';
      if(heading)heading.insertAdjacentElement('afterend',host);else section.prepend(host);
    }
    host.replaceChildren();
    var targets={'epi-presentation':'#epi19-tarea','bio-activities':'#bioquimica-2026-08-21'};
    activeTasks.forEach(function(task){
      var card=el('a','live-task');
      card.href=task.url||targets[task.id]||'#pendientes';
      card.appendChild(el('span','',(task.course||'CLASE')+' · '+(task.dueLabel||'FECHA POR CONFIRMAR')));
      card.appendChild(el('strong','',task.title));
      if(task.description)card.appendChild(el('p','',task.description));
      card.appendChild(el('b','live-task-action','Abrir →'));
      host.appendChild(card);
    });
    if(!activeTasks.length)host.appendChild(el('p','notice-empty','No hay tareas activas. Las tareas terminadas ya no aparecen aquí.'));
    var count=document.getElementById('homeHomeworkCount');
    if(count){var total=activeTasks.length,isPortuguese=/^pt(?:-|$)/i.test(document.documentElement.lang),noun=isPortuguese?(total===1?'tarefa':'tarefas'):(total===1?'tarea':'tareas');count.textContent=String(total)+' '+noun+(isPortuguese?' ativas':' activas');}
  }
  function renderDynamicResources(){var section=document.getElementById('pendientes');if(!section)return;var host=document.getElementById('classHubDynamicResources');if(!host){host=el('div','class-hub-live');host.id='classHubDynamicResources';var tasks=document.getElementById('classHubLiveTasks');if(tasks)tasks.insertAdjacentElement('afterend',host);else section.appendChild(host);}host.replaceChildren();(publicData.dates||[]).forEach(function(date){var card=el('article','live-task');card.appendChild(el('span','','FECHA PUBLICADA'));card.appendChild(el('strong','',date.label));card.appendChild(el('p','',date.startsAt));host.appendChild(card);});(publicData.files||[]).forEach(function(file){var card=el('a','live-task');card.href=file.url;card.target='_blank';card.rel='noopener';card.appendChild(el('span','',(file.course||'ARCHIVO')+(file.lessonDate?' · '+file.lessonDate:'')));card.appendChild(el('strong','',file.title));card.appendChild(el('p','',(file.fileType||'Archivo').toUpperCase()+' · Abrir →'));host.appendChild(card);});}
  function activityGroups(activityId){return (publicData.groups||[]).filter(function(group){return group.activityId===activityId;});}
  function renderGroups(){
    document.querySelectorAll('[data-group-activity]').forEach(function(card){
      var host=card.querySelector('[data-group-runtime]');
      if(!host)return;
      var activity=(publicData.activities||[]).find(function(item){return item.id===card.dataset.groupActivity;});
      if(!activity){host.replaceChildren(el('p','','La actividad está publicada; la inscripción en grupos estará disponible cuando se active la base compartida.'));return;}
      var groups=activityGroups(activity.id),membership=readJson('med-nykuto-membership-v440',null);
      if(!membership||membership.activityId!==activity.id)membership=null;
      host.replaceChildren();
      var name=el('input');name.type='text';name.maxLength=40;name.placeholder='Nombre o alias de clase';name.autocomplete='nickname';name.setAttribute('aria-label','Nombre o alias de clase');
      var select=el('select');select.setAttribute('aria-label','Elegir grupo');var initial=el('option','','Elegir un grupo');initial.value='';select.appendChild(initial);
      groups.forEach(function(group){var option=el('option','',group.name+' · '+(group.memberCount||0)+'/'+Math.min(group.capacity||10,activity.capacity||10));option.value=group.id;option.disabled=Boolean(activity.frozen||group.frozen)||(group.memberCount||0)>=Math.min(group.capacity||10,activity.capacity||10);select.appendChild(option);});
      var join=el('button','','Unirme'),leave=el('button','group-leave-button','Salir de mi grupo'),status=el('p','');join.type=leave.type='button';leave.hidden=true;
      host.appendChild(name);host.appendChild(select);host.appendChild(join);host.appendChild(leave);host.appendChild(status);
      function applyMembership(){var active=Boolean(membership);name.disabled=select.disabled=join.disabled=active||Boolean(activity.frozen)||!groups.length;leave.hidden=!active;leave.disabled=Boolean(activity.frozen);if(active){name.value=membership.displayName||'';status.textContent='Inscripción confirmada en '+(membership.groupName||'el grupo')+'. Para cambiar, sal primero de este grupo.';}else if(activity.frozen){status.textContent='La composición de los grupos ya es final.';}else if(!groups.length){status.textContent='No hay grupos abiertos. Un editor puede crearlos sin volver a desplegar el sitio.';}else status.textContent='';}
      applyMembership();
      join.addEventListener('click',function(){if(!name.value.trim()||!select.value){status.textContent='Escribe un nombre o alias y elige un grupo.';return;}join.disabled=true;status.textContent='Guardando…';fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'group.join',activityId:activity.id,groupId:select.value,displayName:name.value.trim(),studentKey:deviceId()})}).then(function(response){return response.json().then(function(body){if(!response.ok)throw new Error(body.error||'No se pudo unir.');return body;});}).then(function(body){membership=body;writeJson('med-nykuto-membership-v440',body);applyMembership();}).catch(function(error){status.textContent=error.message;join.disabled=false;});});
      leave.addEventListener('click',function(){leave.disabled=true;status.textContent='Actualizando…';fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'group.leave',activityId:activity.id,studentKey:deviceId()})}).then(function(response){return response.json().then(function(body){if(!response.ok)throw new Error(body.error||'No se pudo salir del grupo.');return body;});}).then(function(){localStorage.removeItem('med-nykuto-membership-v440');membership=null;return loadPublic();}).catch(function(error){status.textContent=error.message;leave.disabled=false;});});
    });
  }
  function loadPublic(){return fetch(API+'?resource=public',{headers:{accept:'application/json'}}).then(function(response){if(!response.ok)throw new Error('offline');return response.json();}).catch(function(){return fallbackPublic();}).then(function(data){var fallback=fallbackPublic();publicData={notices:Array.isArray(data.notices)?data.notices:fallback.notices,tasks:Array.isArray(data.tasks)?data.tasks:fallback.tasks,activities:Array.isArray(data.activities)?data.activities:fallback.activities,groups:Array.isArray(data.groups)?data.groups:[],files:Array.isArray(data.files)?data.files:[],dates:Array.isArray(data.dates)?data.dates:[]};renderNotices();renderLiveTasks();renderDynamicResources();renderGroups();});}

  function initPwa(){
    var button=document.getElementById('installAppButton'),deferred=null,isIos=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(function(){});
    window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();deferred=event;if(button)button.hidden=false;});
    if(button&&!standalone){button.hidden=false;button.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;button.hidden=true;});return;}if(isIos){var guide=el('aside','ios-install-guide');guide.appendChild(el('strong','','Instalar en iPhone'));guide.appendChild(el('p','','En Safari, toca Compartir y luego “Añadir a pantalla de inicio”.'));var close=el('button','','×');close.type='button';close.addEventListener('click',function(){guide.remove();});guide.appendChild(close);document.body.appendChild(guide);}else{button.title='Usa el menú del navegador y elige Instalar aplicación.';}});}
  }
  function initPrint(){document.querySelectorAll('[data-print-lesson]').forEach(function(button){button.addEventListener('click',function(){window.print();});});}
  function updateStamp(){var stamp=document.getElementById('lastUpdated');if(stamp){stamp.dateTime='2026-08-21';stamp.textContent='Actualizado 21 ago. · contenido 19–21 ago.';}}
  function init(){initLessonTabs();initCourseWorkspaces();initGallery();initPrint();initPwa();updateStamp();loadPublic();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
