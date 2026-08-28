(function(){
  'use strict';
  var CLASS_SLUG='s4-e';
  var API='/api/class-hub?class='+encodeURIComponent(CLASS_SLUG);
  var progressKey='med-nykuto-course-progress-v440';
  var studentKey='med-nykuto-student-device-v440';
  var publicData={notices:[],tasks:[],activities:[],groups:[],members:[],files:[],dates:[]};
  var noticeFilters={category:'all',priority:'all',subject:'all',query:''};

  function el(tag,className,text){var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch(error){return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(error){}}
  function deviceId(){var value=localStorage.getItem(studentKey);if(value)return value;value=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'device-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);try{localStorage.setItem(studentKey,value);}catch(error){}return value;}
  function fileName(href){var clean=href.split('#')[0].split('?')[0];try{return decodeURIComponent(clean.slice(clean.lastIndexOf('/')+1));}catch(error){return clean.slice(clean.lastIndexOf('/')+1);}}
  function extensionLabel(href){var match=href.split('?')[0].match(/\.([a-z0-9]+)$/i);return match?match[1].toUpperCase():'ARCHIVO';}
  function normalizedClassFile(file){
    var record=Object.assign({},file||{});record.id=String(record.id||'').trim();record.course=String(record.course||'').trim();record.title=String(record.title||'').trim();record.url=String(record.url||'').trim();record.fileType=String(record.fileType||'').trim();record.createdAt=String(record.createdAt||'').trim();record.modifiedAt=String(record.modifiedAt||'').trim();record.firstSeenAt=String(record.firstSeenAt||'').trim();record.visibility=String(record.visibility||'').trim();return record;
  }
  function canonicalClassFileUrl(value){try{var parsed=new URL(value,location.href),host=parsed.hostname.toLowerCase();if(host==='drive.google.com'||host==='docs.google.com'){var driveId=parsed.searchParams.get('id'),pathMatch=parsed.pathname.match(/\/d\/([^/]+)/);if(!driveId&&pathMatch)driveId=pathMatch[1];if(driveId)return'drive:'+driveId;}parsed.hash='';return parsed.href;}catch(error){return String(value||'').trim();}}
  function mergeClassFiles(catalogFiles,apiFiles){
    var verifiedCatalog=(catalogFiles||[]).filter(function(raw){return raw&&String(raw.visibility||'').trim()==='verified_anonymous';});
    var merged=[],ids={},urls={},removedIds={},removedUrls={},sources=verifiedCatalog.concat(apiFiles||[]);
    sources.forEach(function(raw){if(!raw||raw.removedAt===null||raw.removedAt===undefined||String(raw.removedAt).trim()==='')return;var id=String(raw.id||'').trim(),url=canonicalClassFileUrl(raw.url);if(id)removedIds[id]=true;if(url)removedUrls[url]=true;});
    function add(raw){
      var incoming=normalizedClassFile(raw),urlKey=canonicalClassFileUrl(incoming.url),index=incoming.id&&ids[incoming.id]!==undefined?ids[incoming.id]:urlKey&&urls[urlKey]!==undefined?urls[urlKey]:-1;if(!incoming.url||removedIds[incoming.id]||removedUrls[urlKey])return;
      if(index>=0){var current=merged[index];Object.keys(incoming).forEach(function(key){if(incoming[key]!==''&&incoming[key]!==null&&incoming[key]!==undefined)current[key]=incoming[key];});incoming=normalizedClassFile(current);}else{index=merged.length;merged.push(incoming);}
      if(incoming.id)ids[incoming.id]=index;if(urlKey)urls[urlKey]=index;var mergedUrl=canonicalClassFileUrl(incoming.url);if(mergedUrl)urls[mergedUrl]=index;
    }
    verifiedCatalog.forEach(add);(apiFiles||[]).forEach(add);
    return merged.sort(function(left,right){var leftTime=Date.parse(left.firstSeenAt||left.modifiedAt||left.createdAt||left.lessonDate||'')||0,rightTime=Date.parse(right.firstSeenAt||right.modifiedAt||right.createdAt||right.lessonDate||'')||0;return rightTime-leftTime;});
  }
  function loadDriveCatalog(){return fetch('/data/drive-files.json',{headers:{accept:'application/json'}}).then(function(response){if(!response.ok)throw new Error('catalog-offline');return response.json();}).then(function(data){return Array.isArray(data.files)?data.files:[];}).catch(function(){return[];});}

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
    function show(){if(!active)return;image.src=active.path(index);image.alt=active.title+' · '+index+' de '+active.count;counter.textContent=index+' / '+active.count;previous.disabled=index<=1;next.disabled=index>=active.count;footer.hidden=active.count===1;dialog.classList.remove('is-zoomed');}
    function open(definition,button){active=definition;index=1;returnFocus=button;show();dialog.showModal();}
    document.querySelectorAll('[data-hub-gallery]').forEach(function(button){button.addEventListener('click',function(){open(galleries[button.dataset.hubGallery],button);});});
    document.querySelectorAll('[data-image-lightbox]').forEach(function(button){button.addEventListener('click',function(){open({title:(button.querySelector('img')||{}).alt||'Pizarra reconstruida',count:1,path:function(){return button.dataset.imageLightbox;}},button);});});
    image.addEventListener('click',function(){dialog.classList.toggle('is-zoomed');});
    previous.addEventListener('click',function(){if(index>1){index-=1;show();}});next.addEventListener('click',function(){if(index<active.count){index+=1;show();}});close.addEventListener('click',function(){dialog.close();});dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});dialog.addEventListener('close',function(){dialog.classList.remove('is-zoomed');image.removeAttribute('src');if(returnFocus)returnFocus.focus();});
  }

  function fallbackPublic(){return {notices:[],tasks:[],activities:[],groups:[],members:[],files:[],dates:[]};}
  function vapidBytes(value){var padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64),output=new Uint8Array(raw.length);for(var index=0;index<raw.length;index+=1)output[index]=raw.charCodeAt(index);return output;}
  function enablePush(button){
    if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){button.textContent='Push no disponible en este navegador';button.disabled=true;return;}
    button.disabled=true;button.textContent='Activando…';
    Promise.all([navigator.serviceWorker.ready,fetch(API+'&resource=push-key').then(function(response){return response.json();})]).then(function(results){var registration=results[0],key=results[1].publicKey;if(!key)throw new Error('El servicio push todavía no tiene una clave pública configurada.');return Notification.requestPermission().then(function(permission){if(permission!=='granted')throw new Error('Permiso de notificaciones no concedido.');return registration.pushManager.getSubscription().then(function(existing){return existing||registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:vapidBytes(key)});});});}).then(function(subscription){return fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'push.subscribe',subscription:subscription.toJSON()})});}).then(function(response){if(!response.ok)throw new Error('No se pudo guardar la suscripción.');button.textContent='Alertas importantes activadas';}).catch(function(error){button.textContent=error.message;button.disabled=false;});
  }
  var taskGuides={
    'epi-presentation':{
      summary:'Máximo 10 integrantes, 15 diapositivas, participación de todos y evaluación individual.',
      intro:'Prepara con tu grupo una exposición sobre la enfermedad asignada por sorteo. La consigna completa queda aquí para consultarla mientras trabajas.',
      groupActivity:'epi-2026-08-19',
      facts:[['10','integrantes como máximo'],['15','diapositivas como máximo'],['TODOS','deben hablar'],['1','notebook para toda la sala']],
      steps:[
        ['Organizar el grupo','Confirmen el tema sorteado y repartan las partes para que todos participen.'],
        ['Construir el contenido','Incluyan introducción, epidemiología, clínica, confirmación diagnóstica, prevención, promoción y avances en Paraguay y Brasil.'],
        ['Unificar las diapositivas','Una persona reúne los aportes en un solo archivo, con un máximo de 15 diapositivas.'],
        ['Preparar la exposición','Ensayen la participación de cada integrante y vistan el uniforme azul completo.']
      ],
      note:'Solo se entregan las diapositivas; no hay un trabajo escrito separado. La evaluación es individual.',
      file:{href:'assets/class-hub/epidemiology/2026-08-19/trabajo-practico-salud-publica-epidemiologia.docx',label:'Descargar la consigna en DOCX'}
    },
    'bio-activities':{
      summary:'Imprime las actividades 3 y 4, complétalas a mano y llévalas a la clase práctica.',
      intro:'Las actividades 3 y 4 forman parte de una serie de cinco actividades prácticas. Descarga el documento, imprímelo y responde a mano.',
      facts:[['4','páginas para imprimir'],['2','actividades: 3 y 4'],['A MANO','forma de entrega'],['5','actividades en total']],
      steps:[
        ['Descargar e imprimir','Usa el archivo original de cuatro páginas disponible abajo.'],
        ['Completar las respuestas','Resuelve las actividades 3 y 4 a mano, con letra legible.'],
        ['Conservar la serie','Guarda estas páginas junto con las otras actividades del bloque práctico.'],
        ['Asistir a la práctica','La presencia en la clase práctica es obligatoria.']
      ],
      note:'Lleva las hojas impresas y completadas. No sustituyas el documento por respuestas digitales.',
      file:{href:'assets/class-hub/biochemistry/2026-08-21/actividades-3-y-4-bioquimica-ii.docx',label:'Descargar actividades 3 y 4'}
    }
  };
  function taskDomId(taskId){return 'task-'+String(taskId||'').toLowerCase().replace(/[^a-z0-9-]+/g,'-');}
  function linkedTaskId(notice){return String(notice&&((notice.linkedTaskId!==undefined?notice.linkedTaskId:notice.linked_task_id))||'').trim();}
  function publicTask(taskId){return publicData.tasks.find(function(task){return task.id===taskId&&(!task.status||task.status==='published');})||null;}
  function taskAttachment(task){
    var raw=String(task.attachmentUrl||task.attachment_url||'').trim();if(!raw)return null;
    try{var parsed=new URL(raw);if(parsed.protocol!=='https:')return null;return{url:parsed.href,title:String(task.attachmentTitle||task.attachment_title||'Documento adjunto').trim()||'Documento adjunto'};}catch(error){return null;}
  }
  function setTaskToggleLabel(card){var label=card.querySelector('[data-task-toggle-label]'),isPortuguese=/^pt(?:-|$)/i.test(document.documentElement.lang);if(label)label.textContent=card.open?(isPortuguese?'Fechar':'Cerrar'):'Abrir';}
  function expandLiveTask(taskId){var card=document.getElementById(taskDomId(taskId));if(!card)return;document.querySelectorAll('#classHubLiveTasks [data-live-task-id]').forEach(function(item){if(item===card)return;item.open=false;setTaskToggleLabel(item);});card.open=true;setTaskToggleLabel(card);var summary=card.querySelector('summary');card.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'center'});if(summary)summary.focus({preventScroll:true});}
  function renderTaskBody(task,guide){
    var body=el('div','live-task-body');
    body.appendChild(el('p','live-task-intro',(guide&&guide.intro)||task.description||'Consulta aquí la consigna publicada.'));
    if(guide&&guide.facts){
      var facts=el('div','live-task-facts');facts.setAttribute('aria-label','Datos esenciales');
      guide.facts.forEach(function(fact){var item=el('div');item.appendChild(el('strong','',fact[0]+' '));item.appendChild(el('small','',fact[1]));facts.appendChild(item);});
      body.appendChild(facts);
    }
    if(guide&&guide.groupActivity){
      var groupPanel=el('section','live-task-groups group-activity-card');groupPanel.dataset.groupActivity=guide.groupActivity;
      var groupHeading=el('header','live-task-groups-heading'),groupCopy=el('div'),groupTitle=el('h4','','Tu grupo, tema y plazas');
      groupTitle.id='live-task-groups-'+guide.groupActivity;groupPanel.setAttribute('aria-labelledby',groupTitle.id);
      groupCopy.appendChild(el('span','live-task-groups-kicker','GRUPOS YA ORGANIZADOS'));groupCopy.appendChild(groupTitle);groupHeading.appendChild(groupCopy);
      var groupTotal=activityGroups(guide.groupActivity).length;groupHeading.appendChild(el('strong','live-task-groups-count',groupTotal?groupTotal+' GRUPOS':'GRUPOS'));
      groupPanel.appendChild(groupHeading);groupPanel.appendChild(el('p','live-task-groups-intro','Consulta aquí los temas y la ocupación de cada grupo. Los nombres quedan disponibles únicamente para la administración autorizada.'));
      var groupHost=el('div');groupHost.setAttribute('data-group-runtime','true');groupHost.appendChild(el('p','','Cargando la composición de los grupos…'));groupPanel.appendChild(groupHost);body.appendChild(groupPanel);
    }
    if(guide&&guide.steps){
      body.appendChild(el('h4','','Qué tienes que hacer'));
      var steps=el('ol','live-task-steps');
      guide.steps.forEach(function(step,index){var item=el('li');item.appendChild(el('span','',String(index+1).padStart(2,'0')));var copy=el('div');copy.appendChild(el('strong','',step[0]));copy.appendChild(el('small','',step[1]));item.appendChild(copy);steps.appendChild(item);});
      body.appendChild(steps);
    }
    if(guide&&guide.note){var note=el('p','live-task-note',guide.note);body.appendChild(note);}
    var attachment=taskAttachment(task);
    if((guide&&guide.file)||attachment){
      var actions=el('div','live-task-actions');
      if(guide&&guide.file){var download=el('a','live-task-download',guide.file.label+' ↓');download.href=guide.file.href;download.setAttribute('download','');actions.appendChild(download);}
      if(attachment&&(!guide||!guide.file||attachment.url!==new URL(guide.file.href,location.href).href)){var attachmentLink=el('a','live-task-download',attachment.title+' ↗');attachmentLink.href=attachment.url;attachmentLink.target='_blank';attachmentLink.rel='noopener noreferrer';actions.appendChild(attachmentLink);}
      body.appendChild(actions);
    }
    return body;
  }
  function reducedMotion(){return Boolean(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function isPortuguese(){return /^pt(?:-|$)/i.test(document.documentElement.lang);}
  function noticeText(spanish,portuguese){return isPortuguese()?portuguese:spanish;}
  function noticePriorityLabel(priority){return priority==='urgent'?'URGENTE':priority==='important'?'IMPORTANTE':'AVISO';}
  function noticeValue(notice,camel,snake){return notice&&notice[camel]!==undefined?notice[camel]:notice&&notice[snake]!==undefined?notice[snake]:'';}
  function noticeLifecycleLabel(value){return{active:'ACTIVO',scheduled:'PROGRAMADO',updated:'ACTUALIZADO',extended:'AMPLIADO',corrected:'CORREGIDO',replaced:'REEMPLAZADO',cancelled:'CANCELADO',expired:'VENCIDO'}[value]||'ACTIVO';}
  function noticeCategoryLabel(value){return{general:'GENERAL',academic:'ACADÉMICO',transport:'TRANSPORTE',schedule:'HORARIO',assessment:'EVALUACIÓN',task:'TAREA',resource:'MATERIAL',administrative:'INSTITUCIÓN',emergency:'SEGURIDAD'}[value]||'GENERAL';}
  function noticeAudienceLabel(value){return{all:'TODA LA CLASE',students:'ESTUDIANTES',delegates:'DELEGADOS'}[value]||'TODA LA CLASE';}
  function noticePublishedLabel(value){if(!value)return'';var date=new Date(value);if(Number.isNaN(date.getTime()))return'';var locale=window.MedNykutoClassI18n&&window.MedNykutoClassI18n.getLocale?window.MedNykutoClassI18n.getLocale():'es-PY';return new Intl.DateTimeFormat(locale,{timeZone:'America/Asuncion',day:'2-digit',month:'short',year:'numeric'}).format(date);}
  function noticeDateTimeLabel(value){if(!value)return'';var date=new Date(value);if(Number.isNaN(date.getTime()))return'';var locale=window.MedNykutoClassI18n&&window.MedNykutoClassI18n.getLocale?window.MedNykutoClassI18n.getLocale():'es-PY',allDay=/T00:00(?::00(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(String(value));return new Intl.DateTimeFormat(locale,allDay?{timeZone:'America/Asuncion',day:'2-digit',month:'short',year:'numeric'}:{timeZone:'America/Asuncion',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);}
  function noticeHttpsUrl(value){try{var parsed=new URL(String(value||''));if(parsed.protocol!=='https:'||parsed.username||parsed.password)return'';return parsed.href;}catch(error){return'';}}
  function noticeTargetFile(targetId){var key=String(targetId||'').trim().toLowerCase();if(!key)return null;return(publicData.files||[]).find(function(file){return String(file.id||'').trim().toLowerCase()===key||String(file.url||'').trim().toLowerCase()===key;})||null;}
  function noticeSubjectTarget(targetId,course){var key=String(targetId||'').trim().toLowerCase(),aliases={'bioquimica-ii':'bioquimica','epidemiologia-salud-publica':'epidemiologia','fisiologia-ii':'fisiologia','microbiologia-ii-teorica':'microbiologia-teorica','microbiologia-ii-practica':'microbiologia-practica',nutricion:'nutricion'},candidate=aliases[key]||key||noticeSubjectKey(course);return candidate&&document.getElementById(candidate)&&document.getElementById(candidate).classList.contains('subject-section')?candidate:'materias';}
  function noticeTargetAction(notice){
    var type=String(noticeValue(notice,'targetType','target_type')||'none').toLowerCase(),targetId=String(noticeValue(notice,'targetId','target_id')||'').trim(),taskId=type==='task'?targetId:linkedTaskId(notice);
    if(taskId){var task=publicTask(taskId);if(task)return{type:'task',href:'#'+taskDomId(taskId),label:noticeText('Ver tarea →','Ver tarefa →'),aria:noticeText('Ver tarea: ','Ver tarefa: ')+task.title,taskId:taskId};if(type==='task')return{type:'task',href:'#pendientes',label:noticeText('Ver tareas →','Ver tarefas →'),aria:noticeText('Abrir la página de tareas','Abrir a página de tarefas')};}
    if(type==='file'){var file=noticeTargetFile(targetId),fileUrl=file&&noticeHttpsUrl(file.url);if(file&&fileUrl)return{type:'file',href:fileUrl,label:noticeText('Abrir archivo ↗','Abrir arquivo ↗'),aria:noticeText('Abrir archivo: ','Abrir arquivo: ')+file.title,external:true};return{type:'file',href:'archivos.html',label:noticeText('Ver archivos →','Ver arquivos →'),aria:noticeText('Abrir la página de archivos','Abrir a página de arquivos')};}
    if(type==='date'){var date=(publicData.dates||[]).find(function(item){return String(item.id||'').toLowerCase()===targetId.toLowerCase();});return{type:'date',href:'#horario',label:noticeText('Ver en calendario →','Ver no calendário →'),aria:noticeText('Ver fecha en el calendario','Ver data no calendário')+(date&&date.label?': '+date.label:'')};}
    if(type==='subject'){var subjectId=noticeSubjectTarget(targetId,notice.course),subject=document.getElementById(subjectId),heading=subject&&subject.querySelector('h2'),subjectLabels={'bioquimica-ii':'Bioquímica II','epidemiologia-salud-publica':'Epidemiología y Salud Pública','fisiologia-ii':'Fisiología II','microbiologia-ii-teorica':'Microbiología II · Teórica','microbiologia-ii-practica':'Microbiología II · Práctica',nutricion:'Nutrición'},subjectName=subjectLabels[targetId.toLowerCase()]||String(notice.course||'').trim()||(heading&&heading.textContent)||'';return{type:'subject',href:'#'+subjectId,label:noticeText('Ver materia →','Ver matéria →'),aria:noticeText('Abrir materia','Abrir matéria')+(subjectName?': '+subjectName:'')};}
    return null;
  }
  function noticeIsCurrent(notice){
    if(notice.status&&String(notice.status).toLowerCase()!=='published')return false;
    if(['week-2026-08-21','tasks-2026-08-21'].indexOf(String(notice.id||''))>=0)return false;
    var lifecycle=String(noticeValue(notice,'lifecycle','lifecycle')||'active').toLowerCase();
    if(lifecycle==='replaced'||lifecycle==='cancelled'||lifecycle==='expired')return false;
    var expires=Date.parse(noticeValue(notice,'expiresAt','expires_at'));
    return !Number.isFinite(expires)||expires>Date.now();
  }
  function noticePriorityOrder(notice){return notice.priority==='urgent'?0:notice.priority==='important'?1:2;}
  function noticeRelevantTime(notice){var current=Date.now(),effective=Date.parse(noticeValue(notice,'effectiveAt','effective_at')),expires=Date.parse(noticeValue(notice,'expiresAt','expires_at'));if(Number.isFinite(effective)&&effective>current)return effective;if(Number.isFinite(expires))return expires;var published=Date.parse(notice.publishedAt||notice.published_at);return Number.isFinite(published)?published:Number.MAX_SAFE_INTEGER;}
  function noticeSort(left,right){var priority=noticePriorityOrder(left)-noticePriorityOrder(right);if(priority)return priority;var relevant=noticeRelevantTime(left)-noticeRelevantTime(right);if(relevant)return relevant;return Date.parse(right.publishedAt||right.published_at||0)-Date.parse(left.publishedAt||left.published_at||0);}
  function noticeIsFeaturedActive(notice){return noticeIsCurrent(notice)&&(notice.priority==='important'||notice.priority==='urgent');}
  function noticeAttachment(notice){
    var raw=String(notice.attachmentUrl||notice.attachment_url||'').trim(),mime=String(notice.attachmentMimeType||notice.attachment_mime_type||'').toLowerCase();if(!raw)return null;
    try{var parsed=new URL(raw,location.href);if(parsed.origin!==location.origin||parsed.pathname!=='/api/class-hub'||parsed.searchParams.get('resource')!=='notice-attachment'||!parsed.searchParams.get('upload'))return null;var bytes=Number(notice.attachmentSizeBytes||notice.attachment_size_bytes||0),title=String(notice.attachmentTitle||notice.attachment_title||noticeText('Documento del aviso','Documento do aviso')).trim()||noticeText('Documento del aviso','Documento do aviso');return{url:parsed.href,title:title,mime:mime,sizeBytes:Number.isFinite(bytes)&&bytes>0?bytes:0,isImage:mime.indexOf('image/')===0};}catch(error){return null;}
  }
  function noticeAttachmentSize(bytes){if(!bytes)return'';if(bytes<1024*1024)return Math.max(1,Math.round(bytes/1024))+' KB';return(bytes/(1024*1024)).toFixed(bytes<10*1024*1024?1:0)+' MB';}
  function noticeImageData(notice){
    var attachment=noticeAttachment(notice),raw=String(notice.imageUrl||notice.image_url||(attachment&&attachment.isImage?attachment.url:'')).trim();if(!raw)return null;
    try{
      var parsed=new URL(raw,location.href),managed=parsed.origin===location.origin&&parsed.pathname==='/api/class-hub';if((!managed&&parsed.protocol!=='https:')||parsed.username||parsed.password)return null;return{url:parsed.href,description:String(notice.imageAlt||notice.image_alt||(attachment&&attachment.title)||notice.title||noticeText('Imagen del aviso','Imagem do aviso')).trim()};
    }catch(error){return null;}
  }
  function noticeImage(notice){
    var data=noticeImageData(notice);if(!data)return null;
    var frame=el('figure','notice-media'),link=el('a','notice-media-link'),image=el('img');link.href=data.url;link.target='_blank';link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';link.setAttribute('aria-label',noticeText('Abrir imagen: ','Abrir imagem: ')+data.description);image.src=data.url;image.alt=data.description;image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';image.addEventListener('error',function(){if(frame.parentElement)frame.parentElement.classList.remove('has-image');frame.remove();});link.appendChild(image);frame.appendChild(link);return frame;
  }
  function noticeCaption(body,content){
    var details=el('details','notice-caption'),summary=el('summary','notice-caption-summary'),preview=el('span','notice-caption-preview',body||noticeText('Consulta la información completa y sus enlaces.','Consulte as informações completas e os links.')),toggle=el('span','notice-caption-toggle'),more=el('span','notice-caption-more',noticeText('Ver más','Ver mais')),less=el('span','notice-caption-less',noticeText('Ver menos','Ver menos'));toggle.appendChild(more);toggle.appendChild(less);summary.appendChild(preview);summary.appendChild(toggle);details.appendChild(summary);details.appendChild(content);return details;
  }
  function noticeCard(notice,featured){
    var attachment=noticeAttachment(notice),lifecycle=String(noticeValue(notice,'lifecycle','lifecycle')||'active').toLowerCase(),category=String(noticeValue(notice,'category','category')||'general').toLowerCase(),audience=String(noticeValue(notice,'audience','audience')||'all').toLowerCase(),item=el('article','notice-item'+(featured?' notice-preview-item':''));item.dataset.priority=notice.priority||'normal';item.dataset.subject=noticeSubjectKey(notice.course)||'general';item.dataset.lifecycle=lifecycle;item.dataset.category=category;
    item.id=noticeDomId(notice);
    var media=featured?null:noticeImage(notice);if(media){item.classList.add('has-image');item.appendChild(media);}
    var copy=el('div','notice-copy'),meta=el('div','notice-meta'),publishedAt=notice.publishedAt||notice.published_at;meta.appendChild(el('span','notice-priority',noticePriorityLabel(notice.priority)));var published=noticePublishedLabel(publishedAt);if(published){var publishedTime=el('time','',published);publishedTime.dateTime=String(publishedAt);meta.appendChild(publishedTime);}copy.appendChild(meta);
    var badges=el('div','notice-badges');badges.appendChild(el('span','notice-badge notice-lifecycle notice-lifecycle-'+lifecycle,noticeLifecycleLabel(lifecycle)));badges.appendChild(el('span','notice-badge notice-category',noticeCategoryLabel(category)));badges.appendChild(el('span','notice-badge notice-audience',noticeAudienceLabel(audience)));var revision=Math.max(1,Number(noticeValue(notice,'revision','revision'))||1);if(revision>1)badges.appendChild(el('span','notice-badge notice-revision','VERSIÓN '+revision));copy.appendChild(badges);
    copy.appendChild(el('strong','',notice.title||noticeText('Actualización','Atualização')));
    if(featured){if(notice.body)copy.appendChild(el('p','',notice.body));}
    var content=el('div','notice-caption-content');if(!featured&&notice.body)content.appendChild(el('p','notice-body',notice.body));var detailHost=featured?copy:content;
    var effectiveAt=noticeValue(notice,'effectiveAt','effective_at'),expiresAt=noticeValue(notice,'expiresAt','expires_at'),effectiveLabel=noticeDateTimeLabel(effectiveAt),expiresLabel=noticeDateTimeLabel(expiresAt);if(effectiveLabel||expiresLabel){var validity=el('div','notice-validity');if(effectiveLabel){var effectiveRow=el('span','notice-validity-row'),effectiveTime=el('time','',effectiveLabel);effectiveTime.dateTime=String(effectiveAt);effectiveRow.appendChild(el('b','',noticeText('Vigente desde','Vigente desde')));effectiveRow.appendChild(effectiveTime);validity.appendChild(effectiveRow);}if(expiresLabel){var expiresRow=el('span','notice-validity-row'),expiresTime=el('time','',expiresLabel);expiresTime.dateTime=String(expiresAt);expiresRow.appendChild(el('b','',noticeText('Vence','Vence')));expiresRow.appendChild(expiresTime);validity.appendChild(expiresRow);}detailHost.appendChild(validity);}
    var changeSummary=String(noticeValue(notice,'changeSummary','change_summary')||'').trim();if(changeSummary){var change=el('p','notice-change-summary');change.appendChild(el('b','',noticeText('Cambio: ','Alteração: ')));change.appendChild(document.createTextNode(changeSummary));detailHost.appendChild(change);}
    var sourceLabel=String(noticeValue(notice,'sourceLabel','source_label')||'').trim(),sourceUrl=noticeHttpsUrl(noticeValue(notice,'sourceUrl','source_url'));if(sourceLabel||sourceUrl){var sourceText=noticeText('Fuente: ','Fonte: ')+(sourceLabel||(new URL(sourceUrl)).hostname);if(sourceUrl){var sourceLink=el('a','notice-source',sourceText+' ↗');sourceLink.href=sourceUrl;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';sourceLink.referrerPolicy='no-referrer';detailHost.appendChild(sourceLink);}else detailHost.appendChild(el('span','notice-source notice-source-label',sourceText));}
    var actions=el('div','notice-actions');if(attachment){var label=attachment.isImage?noticeText('Abrir imagen','Abrir imagem'):noticeText('Abrir documento','Abrir documento'),size=noticeAttachmentSize(attachment.sizeBytes),attachmentLink=el('a','notice-attachment',label+(size?' · '+size:'')+' ↗');attachmentLink.href=attachment.url;attachmentLink.target='_blank';attachmentLink.rel='noopener noreferrer';attachmentLink.title=attachment.title;attachmentLink.setAttribute('aria-label',label+' · '+attachment.title);actions.appendChild(attachmentLink);}var target=noticeTargetAction(notice);if(target){var targetLink=el('a','notice-item-action notice-target-action notice-target-'+target.type,target.label);targetLink.setAttribute('aria-label',target.aria);if(target.taskId){var taskId=target.taskId,taskLink=targetLink;taskLink.href='#'+taskDomId(taskId);taskLink.addEventListener('click',function(){window.setTimeout(function(){expandLiveTask(taskId);},0);});}else targetLink.href=target.href;if(target.external){targetLink.target='_blank';targetLink.rel='noopener noreferrer';targetLink.referrerPolicy='no-referrer';}actions.appendChild(targetLink);}if(actions.children.length)detailHost.appendChild(actions);if(!featured&&content.children.length)copy.appendChild(noticeCaption(notice.body||'',content));item.appendChild(copy);return item;
  }
  function noticeDomId(notice){
    var raw=String(notice&&notice.id||notice&&notice.title||'aviso'),slug=normalizedNoticeText(raw).replace(/\s+/g,'-').slice(0,42)||'aviso',checksum=0,index;for(index=0;index<raw.length;index+=1)checksum=((checksum*31)+raw.charCodeAt(index))>>>0;return'notice-'+slug+'-'+checksum.toString(36);
  }
  function noticePreviewCard(notice){
    var item=el('article','notice-item notice-preview-item notice-preview-tile'),link=el('a','notice-preview-link'),title=String(notice.title||noticeText('Actualización','Atualização')),imageData=noticeImageData(notice),priority=notice.priority||'normal',copy=el('span','notice-preview-copy'),kicker=priority==='urgent'?noticeText('Urgente','Urgente'):(priority==='important'?noticeText('Importante','Importante'):noticeText('Aviso','Aviso'));item.dataset.priority=priority;item.dataset.category=String(noticeValue(notice,'category','category')||'general').toLowerCase();item.setAttribute('role','listitem');link.href='#'+noticeDomId(notice);link.setAttribute('aria-label',noticeText('Abrir aviso: ','Abrir aviso: ')+title);if(imageData){var media=el('span','notice-preview-thumb'),image=el('img');item.classList.add('has-thumbnail');image.src=imageData.url;image.alt='';image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';image.addEventListener('error',function(){item.classList.remove('has-thumbnail');media.remove();});media.appendChild(image);link.appendChild(media);}copy.appendChild(el('span','notice-preview-kicker',kicker));copy.appendChild(el('strong','notice-preview-title',title));link.appendChild(copy);item.appendChild(link);return item;
  }
  function normalizedNoticeText(value){
    var text=String(value||'').toLowerCase();
    if(text.normalize)text=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return text.replace(/[^a-z0-9]+/g,' ').trim();
  }
  function noticeSubjectKey(value){
    var course=normalizedNoticeText(value);
    if(!course)return'';
    if(course.indexOf('microbiologia')>=0){
      if(course.indexOf('pract')>=0)return'microbiologia-practica';
      if(course.indexOf('teor')>=0)return'microbiologia-teorica';
    }
    if(course.indexOf('bioquim')>=0)return'bioquimica';
    if(course.indexOf('epidemi')>=0||course.indexOf('salud publica')>=0)return'epidemiologia';
    if(course.indexOf('fisiolog')>=0)return'fisiologia';
    if(course.indexOf('nutric')>=0)return'nutricion';
    return course.replace(/ /g,'-');
  }
  function noticeMatchesFilters(notice){
    var priority=notice.priority||'normal',category=String(noticeValue(notice,'category','category')||'general').toLowerCase();
    if(noticeFilters.category!=='all'&&category!==noticeFilters.category)return false;
    if(noticeFilters.priority!=='all'&&priority!==noticeFilters.priority)return false;
    if(noticeFilters.subject!=='all'&&noticeSubjectKey(notice.course)!==noticeFilters.subject)return false;
    if(noticeFilters.query){
      var haystack=normalizedNoticeText([notice.title,notice.body,notice.course,noticePriorityLabel(priority),noticeCategoryLabel(noticeValue(notice,'category','category')),noticeLifecycleLabel(noticeValue(notice,'lifecycle','lifecycle')),noticeAudienceLabel(noticeValue(notice,'audience','audience')),noticeValue(notice,'sourceLabel','source_label'),noticeValue(notice,'changeSummary','change_summary')].join(' '));
      if(haystack.indexOf(noticeFilters.query)<0)return false;
    }
    return true;
  }
  function updateNoticeFilterControls(){
    var form=document.getElementById('classNoticeFilters');if(!form)return;
    var available={};publicData.notices.forEach(function(notice){available[String(noticeValue(notice,'category','category')||'general').toLowerCase()]=true;});if(noticeFilters.category!=='all'&&!available[noticeFilters.category])noticeFilters.category='all';
    form.querySelectorAll('[data-notice-category]').forEach(function(button){var category=button.dataset.noticeCategory||'all';button.hidden=category!=='all'&&!available[category];button.setAttribute('aria-pressed',category===noticeFilters.category?'true':'false');});
    form.querySelectorAll('[data-notice-priority]').forEach(function(button){button.setAttribute('aria-pressed',button.dataset.noticePriority===noticeFilters.priority?'true':'false');});
    var subject=document.getElementById('classNoticeSubjectFilter'),search=document.getElementById('classNoticeSearch');if(subject)subject.value=noticeFilters.subject;if(search&&normalizedNoticeText(search.value)!==noticeFilters.query)search.value=noticeFilters.query;
  }
  function renderNoticePageList(){
    var list=document.getElementById('classNoticePageList'),count=document.getElementById('classNoticeResultCount');if(!list)return;
    var notices=publicData.notices.filter(noticeMatchesFilters),total=publicData.notices.length;list.replaceChildren();
    notices.forEach(function(notice){list.appendChild(noticeCard(notice,false));});
    if(!notices.length)list.appendChild(el('p','notice-empty',total?noticeText('No hay avisos vigentes que coincidan con estos filtros.','Não há avisos vigentes que correspondam a estes filtros.'):noticeText('No hay avisos vigentes.','Não há avisos vigentes.')));
    if(count){
      if(!total)count.textContent=noticeText('0 avisos vigentes','0 avisos vigentes');
      else if(notices.length===total)count.textContent=total+(total===1?noticeText(' aviso vigente',' aviso vigente'):noticeText(' avisos vigentes',' avisos vigentes'));
      else count.textContent=notices.length+noticeText(' de ',' de ')+total+(total===1?noticeText(' aviso vigente',' aviso vigente'):noticeText(' avisos vigentes',' avisos vigentes'));
    }
  }
  function bindNoticeFilters(){
    var form=document.getElementById('classNoticeFilters');if(!form||form.dataset.noticeFiltersBound)return;form.dataset.noticeFiltersBound='true';
    form.addEventListener('submit',function(event){event.preventDefault();});
    form.querySelectorAll('[data-notice-category]').forEach(function(button){button.addEventListener('click',function(){noticeFilters.category=button.dataset.noticeCategory||'all';updateNoticeFilterControls();renderNoticePageList();});});
    form.querySelectorAll('[data-notice-priority]').forEach(function(button){button.addEventListener('click',function(){noticeFilters.priority=button.dataset.noticePriority||'all';updateNoticeFilterControls();renderNoticePageList();});});
    var subject=document.getElementById('classNoticeSubjectFilter'),search=document.getElementById('classNoticeSearch');
    if(subject)subject.addEventListener('change',function(){noticeFilters.subject=subject.value||'all';renderNoticePageList();});
    if(search)search.addEventListener('input',function(){noticeFilters.query=normalizedNoticeText(search.value);renderNoticePageList();});
    form.addEventListener('reset',function(){noticeFilters={category:'all',priority:'all',subject:'all',query:''};window.setTimeout(function(){updateNoticeFilterControls();renderNoticePageList();},0);});
    updateNoticeFilterControls();
  }
  function revealNoticeFromHash(){
    var hash='';try{hash=decodeURIComponent(window.location.hash.slice(1));}catch(error){hash=window.location.hash.slice(1);}var card=hash&&document.getElementById(hash);if(!card||!card.matches('#classNoticePageList .notice-item'))return;var caption=card.querySelector('.notice-caption');if(caption)caption.open=true;card.setAttribute('tabindex','-1');window.requestAnimationFrame(function(){card.focus({preventScroll:true});card.scrollIntoView({behavior:'auto',block:'start'});});
  }
  var noticeTickerCleanup=null;
  function setupNoticeTicker(target){
    if(noticeTickerCleanup){noticeTickerCleanup();noticeTickerCleanup=null;}
    var items=Array.from(target.querySelectorAll('.notice-preview-tile')),active=0,timer=0,resumeTimer=0,holdTimer=0,longPress=false,suppressClick=false,reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.classList.toggle('is-ticker',items.length>0);target.setAttribute('aria-roledescription','carrusel');
    if(!items.length){delete target.dataset.tickerPosition;return;}
    function show(index){active=(index+items.length)%items.length;items.forEach(function(item,itemIndex){var visible=itemIndex===active;item.hidden=!visible;item.setAttribute('aria-hidden',visible?'false':'true');});target.dataset.tickerPosition=(active+1)+'/'+items.length;}
    function stop(){if(timer){window.clearInterval(timer);timer=0;}}
    function start(){stop();if(items.length>1&&!reduced&&!document.hidden)timer=window.setInterval(function(){show(active+1);},3200);}
    function resumeSoon(){window.clearTimeout(resumeTimer);resumeTimer=window.setTimeout(start,1800);}
    function release(){window.clearTimeout(holdTimer);target.classList.remove('is-paused');if(longPress){suppressClick=true;longPress=false;window.setTimeout(function(){suppressClick=false;},700);}resumeSoon();}
    function onPointerDown(event){if(event.button!==undefined&&event.button!==0)return;longPress=false;stop();target.classList.add('is-paused');window.clearTimeout(holdTimer);holdTimer=window.setTimeout(function(){longPress=true;},420);}
    function onClick(event){if(!suppressClick)return;event.preventDefault();event.stopPropagation();}
    function onVisibility(){if(document.hidden)stop();else start();}
    target.addEventListener('pointerdown',onPointerDown);target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);target.addEventListener('click',onClick,true);target.addEventListener('focusin',stop);target.addEventListener('focusout',resumeSoon);target.addEventListener('mouseenter',stop);target.addEventListener('mouseleave',resumeSoon);document.addEventListener('visibilitychange',onVisibility);
    show(0);start();
    noticeTickerCleanup=function(){stop();window.clearTimeout(resumeTimer);window.clearTimeout(holdTimer);target.removeEventListener('pointerdown',onPointerDown);target.removeEventListener('pointerup',release);target.removeEventListener('pointercancel',release);target.removeEventListener('click',onClick,true);target.removeEventListener('focusin',stop);target.removeEventListener('focusout',resumeSoon);target.removeEventListener('mouseenter',stop);target.removeEventListener('mouseleave',resumeSoon);document.removeEventListener('visibilitychange',onVisibility);};
  }
  function renderNoticePreview(target,notices){target.replaceChildren();target.setAttribute('role','list');notices.slice(0,4).forEach(function(notice){target.appendChild(noticePreviewCard(notice));});setupNoticeTicker(target);}
  function renderNotices(){
    var bell=document.getElementById('noticeBell'),homeSection=document.getElementById('classHomeNoticeSection'),homeHost=document.getElementById('classHomeNoticePreview'),list=document.getElementById('classNoticePageList'),pushActions=document.getElementById('classNoticePushActions');if(!bell||!homeSection||!homeHost||!list||!pushActions)return;
    var featured=publicData.notices.filter(noticeIsFeaturedActive);homeSection.hidden=!featured.length;renderNoticePreview(homeHost,featured);
    bindNoticeFilters();updateNoticeFilterControls();renderNoticePageList();revealNoticeFromHash();
    pushActions.replaceChildren();var pushButton=el('button','notice-push-button',noticeText('Activar alertas importantes','Ativar alertas importantes'));pushButton.type='button';pushButton.addEventListener('click',function(){enablePush(pushButton);});pushActions.appendChild(pushButton);
    var important=featured.length;bell.setAttribute('aria-label',noticeText('Abrir avisos','Abrir avisos')+(important?' · '+important+(important===1?' importante':' importantes'):''));if(important)bell.dataset.count=String(important);else bell.removeAttribute('data-count');if(!bell.dataset.noticeBound){bell.dataset.noticeBound='true';bell.addEventListener('click',function(){if(location.hash==='#avisos'){document.getElementById('avisos').scrollIntoView({block:'start'});return;}location.hash='avisos';});}
    if(!window.__medNykutoNoticeDeepLinkBound){window.__medNykutoNoticeDeepLinkBound=true;window.addEventListener('hashchange',revealNoticeFromHash);}
    if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh){window.MedNykutoClassI18n.refresh(homeSection);window.MedNykutoClassI18n.refresh(document.getElementById('avisos'));}
  }
  function renderHomeTaskPreview(activeTasks){
    var home=document.querySelector('.dashboard-priorities');if(!home)return;home.replaceChildren();var panel=home.closest('.dashboard-week-tasks');if(panel)panel.classList.toggle('is-empty',!activeTasks.length);
    activeTasks.slice(0,3).forEach(function(task,index){
      var guide=taskGuides[task.id],card=el('a','priority-card'+(index===0?' priority-main':'')),head=el('div','priority-card-head'),due=el('time','',task.dueLabel||'FECHA POR CONFIRMAR');card.dataset.taskId=task.id;card.dataset.homework='';card.href='#'+taskDomId(task.id);head.appendChild(el('span','',task.course||'CLASE'));if(task.dueAt)due.dateTime=task.dueAt;head.appendChild(due);card.appendChild(head);card.appendChild(el('strong','',task.title));card.appendChild(el('small','',task.description||(guide&&guide.summary)||''));card.appendChild(el('b','','Ver tarea →'));home.appendChild(card);
    });
    if(!activeTasks.length)home.appendChild(el('p','dashboard-task-empty',noticeText('Sin tareas esta semana.','Sem tarefas nesta semana.')));
    if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh)window.MedNykutoClassI18n.refresh(home);
  }
  function renderLiveTasks(){
    var activeTasks=publicData.tasks.filter(function(task){return task.status==='published'||!task.status;});
    renderHomeTaskPreview(activeTasks);
    document.querySelectorAll('[data-linked-task-panel]').forEach(function(panel){
      panel.hidden=!activeTasks.some(function(item){return item.id===panel.dataset.linkedTaskPanel;});
    });
    document.querySelectorAll('[data-linked-task]').forEach(function(link){
      var task=activeTasks.find(function(item){return item.id===link.dataset.linkedTask;});
      link.hidden=!task;
      if(task)link.href='#'+taskDomId(task.id);
    });
    document.querySelectorAll('[data-task-id]').forEach(function(card){
      var id=card.dataset.taskId,task=activeTasks.find(function(item){return item.id===id;});
      card.hidden=!task;
      if(!task)return;
      var course=card.querySelector('.priority-card-head span'),due=card.querySelector('.priority-card-head time'),title=card.querySelector(':scope > strong'),description=card.querySelector(':scope > small'),action=card.querySelector(':scope > b'),guide=taskGuides[task.id];
      card.href='#'+taskDomId(task.id);
      if(course)course.textContent=task.course||'CLASE';
      if(due){due.textContent=task.dueLabel||'POR CONFIRMAR';if(task.dueAt)due.dateTime=task.dueAt;}
      if(title)title.textContent=task.title;
      if(description)description.textContent=task.description||(guide&&guide.summary)||'';
      if(action)action.textContent='Ver tarea →';
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
    activeTasks.forEach(function(task){
      var guide=taskGuides[task.id],card=el('details','live-task live-task-details');
      card.id=taskDomId(task.id);card.setAttribute('data-live-task-id',task.id);
      var summary=el('summary','live-task-summary'),copy=el('div','live-task-summary-copy');
      copy.appendChild(el('span','live-task-meta',(task.course||'CLASE')+' · '+(task.dueLabel||'FECHA POR CONFIRMAR')));
      copy.appendChild(el('strong','',task.title));
      summary.appendChild(copy);summary.appendChild(el('b','live-task-action','Abrir'));
      summary.lastChild.dataset.taskToggleLabel='true';
      card.appendChild(summary);card.appendChild(renderTaskBody(task,guide));
      card.addEventListener('toggle',function(){setTaskToggleLabel(card);});
      host.appendChild(card);
    });
    if(!activeTasks.length)host.appendChild(el('p','notice-empty','No hay tareas activas. Las tareas terminadas ya no aparecen aquí.'));
    var count=document.getElementById('homeHomeworkCount');
    if(count){var total=activeTasks.length,isPortuguese=/^pt(?:-|$)/i.test(document.documentElement.lang),noun=isPortuguese?(total===1?'tarefa':'tarefas'):(total===1?'tarea':'tareas');count.textContent=total?String(total)+' '+noun+(isPortuguese?' ativas':' activas'):(isPortuguese?'Tudo em dia':'Todo al día');}
    if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh)window.MedNykutoClassI18n.refresh(host);
    var hash=decodeURIComponent(window.location.hash.slice(1));
    if(hash.indexOf('task-')===0&&document.getElementById(hash)){var linkedCard=document.getElementById(hash),linkedTaskId=linkedCard.getAttribute('data-live-task-id');if(linkedTaskId)expandLiveTask(linkedTaskId);window.dispatchEvent(new Event('hashchange'));}
  }
  function renderDynamicResources(){var section=document.getElementById('pendientes');if(!section)return;var host=document.getElementById('classHubDynamicResources');if(!host){host=el('div','class-hub-live');host.id='classHubDynamicResources';var tasks=document.getElementById('classHubLiveTasks');if(tasks)tasks.insertAdjacentElement('afterend',host);else section.appendChild(host);}host.replaceChildren();(publicData.dates||[]).forEach(function(date){var card=el('article','live-task');card.appendChild(el('span','','FECHA PUBLICADA'));card.appendChild(el('strong','',date.label));card.appendChild(el('p','',date.startsAt));host.appendChild(card);});(publicData.files||[]).forEach(function(file){var card=el('a','live-task');card.href=file.url;card.target='_blank';card.rel='noopener';card.appendChild(el('span','',(file.course||'ARCHIVO')+(file.lessonDate?' · '+file.lessonDate:'')));card.appendChild(el('strong','',file.title));card.appendChild(el('p','',(file.fileType||'Archivo').toUpperCase()+' · Abrir →'));host.appendChild(card);});}
  function activityGroups(activityId){return (publicData.groups||[]).filter(function(group){return group.activityId===activityId;});}
  function activityMembers(activityId){return (publicData.members||[]).filter(function(member){return member.activityId===activityId;});}
  function renderGroups(){
    document.querySelectorAll('[data-group-activity]').forEach(function(card){
      var host=card.querySelector('[data-group-runtime]');
      if(!host)return;
      var activity=(publicData.activities||[]).find(function(item){return item.id===card.dataset.groupActivity;});
      if(!activity){host.replaceChildren(el('p','','La actividad está publicada; la inscripción en grupos estará disponible cuando se active la base compartida.'));return;}
      var groups=activityGroups(activity.id),members=activityMembers(activity.id),membership=readJson('med-nykuto-membership-v440',null);
      if(!membership||membership.activityId!==activity.id)membership=null;
      host.replaceChildren();
      var composer=el('section','group-join-composer'),composerHead=el('div','group-join-heading');
      composerHead.appendChild(el('span','','ELIGE TU GRUPO'));
      composerHead.appendChild(el('strong','','Escribe tu nombre y toca el grupo que quieres integrar.'));
      composerHead.appendChild(el('small','','La plancha se actualiza para toda la clase; cada grupo admite hasta 10 integrantes y el nombre añadido queda visible aquí.'));
      composer.appendChild(composerHead);
      var fields=el('div','group-join-fields'),nameLabel=el('label'),name=el('input');
      nameLabel.appendChild(el('span','','Tu nombre'));
      name.type='text';name.maxLength=40;name.placeholder='Nombre o alias de clase';name.autocomplete='nickname';name.setAttribute('aria-label','Nombre o alias de clase');
      nameLabel.appendChild(name);
      var selectLabel=el('label'),select=el('select');selectLabel.appendChild(el('span','','Grupo elegido'));select.setAttribute('aria-label','Elegir grupo');var initial=el('option','','Elegir grupo');initial.value='';select.appendChild(initial);
      groups.forEach(function(group){var option=el('option','',group.name+' · '+(group.memberCount||0)+'/'+Math.min(group.capacity||10,activity.capacity||10));option.value=group.id;option.disabled=Boolean(activity.frozen||group.frozen)||(group.memberCount||0)>=Math.min(group.capacity||10,activity.capacity||10);select.appendChild(option);});
      selectLabel.appendChild(select);fields.appendChild(nameLabel);fields.appendChild(selectLabel);
      var join=el('button','group-join-button','Añadir mi nombre'),leave=el('button','group-leave-button','Retirar mi nombre'),status=el('p','group-membership-status');join.type=leave.type='button';leave.hidden=true;
      fields.appendChild(join);fields.appendChild(leave);composer.appendChild(fields);composer.appendChild(status);host.appendChild(composer);

      var board=el('div','group-roster-board');board.style.setProperty('--group-count',String(groups.length||1));board.setAttribute('role','list');board.setAttribute('aria-label','Composición de los diez grupos');host.appendChild(board);
      var choiceButtons=[];
      groups.forEach(function(group,index){
        var capacity=Math.min(group.capacity||10,activity.capacity||10),groupMembers=members.filter(function(member){return member.groupId===group.id;}),leaderMember=groupMembers.find(function(member){return Boolean(member.isLeader);}),occupied=Math.min(capacity,Math.max(groupMembers.length,Number(group.memberCount)||0));
        var column=el('article','group-roster-column');column.dataset.groupId=group.id;column.setAttribute('role','listitem');
        var choice=el('button','group-roster-choice');choice.type='button';choice.dataset.groupChoice=group.id;choice.setAttribute('aria-pressed','false');choice.setAttribute('aria-label','Elegir '+group.name+(group.topic?', tema '+group.topic:'')+(leaderMember?', responsable '+leaderMember.displayName:'')+', '+occupied+' de '+capacity+' integrantes');
        choice.appendChild(el('strong','',group.name.replace('Grupo ','G')));choice.appendChild(el('span','',occupied+'/'+capacity));column.appendChild(choice);choiceButtons.push(choice);
        if(group.topic||leaderMember){
          var assignment=el('div','group-roster-assignment');
          if(group.topic){var topic=el('div','group-roster-topic');topic.appendChild(el('span','','TEMA'));topic.appendChild(el('strong','',group.topic));assignment.appendChild(topic);}
          if(leaderMember){var leader=el('div','group-roster-leader');leader.appendChild(el('span','','RESPONSABLE'));leader.appendChild(el('strong','',leaderMember.displayName));assignment.appendChild(leader);}
          column.appendChild(assignment);
        }
        var list=el('ol','group-roster-list');
        for(var slot=0;slot<capacity;slot+=1){var member=groupMembers[slot],filled=Boolean(member)||slot<occupied,isLeader=Boolean(member&&member.isLeader),isOwnMember=Boolean(member&&membership&&membership.groupId===group.id&&membership.displayName===member.displayName),item=el('li',filled?'has-member':'is-open');if(isLeader)item.classList.add('is-group-leader');if(isOwnMember)item.classList.add('is-own-member');item.appendChild(el('span','',String(slot+1).padStart(2,'0')));var label=member?member.displayName:filled?'Ocupado':'Libre',memberName=el('strong','',label);if(member){memberName.title=member.displayName+(isLeader?' · Responsable del grupo':'')+(isOwnMember?' · Tu inscripción':'');item.setAttribute('aria-label',(slot+1)+'. '+member.displayName+(isLeader?', responsable del grupo':'')+(isOwnMember?', tu inscripción':''));}else item.setAttribute('aria-label',(slot+1)+'. '+(filled?'Plaza ocupada':'Plaza libre'));item.appendChild(memberName);list.appendChild(item);}
        column.appendChild(list);board.appendChild(column);
        choice.addEventListener('click',function(){if(choice.disabled)return;select.value=group.id;updateSelectedGroup();name.focus({preventScroll:true});});
      });
      function updateSelectedGroup(){var selected=membership&&membership.groupId?membership.groupId:select.value;choiceButtons.forEach(function(button){var active=button.dataset.groupChoice===selected;button.setAttribute('aria-pressed',active?'true':'false');button.closest('.group-roster-column').classList.toggle('is-selected',active);});}
      select.addEventListener('change',updateSelectedGroup);
      function applyMembership(){var active=Boolean(membership),locked=Boolean(activity.frozen)||!groups.length;name.disabled=select.disabled=join.disabled=active||locked;leave.hidden=!active;leave.disabled=Boolean(activity.frozen);choiceButtons.forEach(function(button){var group=groups.find(function(item){return item.id===button.dataset.groupChoice;})||{},capacity=Math.min(group.capacity||10,activity.capacity||10);button.disabled=active||locked||Boolean(group.frozen)||(group.memberCount||0)>=capacity;});if(active){name.value=membership.displayName||'';select.value=membership.groupId||'';status.textContent='Inscripción confirmada en '+(membership.groupName||'el grupo')+'. Para cambiar, retira primero tu nombre.';}else if(activity.frozen){status.textContent='La composición de los grupos ya es final.';}else if(!groups.length){status.textContent='No hay grupos abiertos. Un editor puede crearlos sin volver a desplegar el sitio.';}else status.textContent='';updateSelectedGroup();}
      applyMembership();
      join.addEventListener('click',function(){if(!name.value.trim()||!select.value){status.textContent='Escribe tu nombre y elige un grupo.';return;}join.disabled=true;status.textContent='Guardando…';fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'group.join',activityId:activity.id,groupId:select.value,displayName:name.value.trim(),studentKey:deviceId()})}).then(function(response){return response.json().then(function(body){if(!response.ok)throw new Error(body.error||'No se pudo unir.');return body;});}).then(function(body){membership=body;writeJson('med-nykuto-membership-v440',body);return loadPublic();}).catch(function(error){status.textContent=error.message;join.disabled=false;});});
      leave.addEventListener('click',function(){leave.disabled=true;status.textContent='Actualizando…';fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'group.leave',activityId:activity.id,studentKey:deviceId()})}).then(function(response){return response.json().then(function(body){if(!response.ok)throw new Error(body.error||'No se pudo salir del grupo.');return body;});}).then(function(){localStorage.removeItem('med-nykuto-membership-v440');membership=null;return loadPublic();}).catch(function(error){status.textContent=error.message;leave.disabled=false;});});
      if(window.MedNykutoClassI18n&&window.MedNykutoClassI18n.refresh)window.MedNykutoClassI18n.refresh(card);
    });
  }
  function loadPublic(){var publicRequest=fetch(API+'&resource=public',{headers:{accept:'application/json'}}).then(function(response){if(!response.ok)throw new Error('offline');return response.json();}).catch(function(){return fallbackPublic();});return Promise.all([publicRequest,loadDriveCatalog()]).then(function(results){var data=results[0],catalogFiles=results[1],fallback=fallbackPublic(),apiFiles=Array.isArray(data.files)?data.files:[];publicData={notices:(Array.isArray(data.notices)?data.notices:fallback.notices).filter(noticeIsCurrent).sort(noticeSort),tasks:Array.isArray(data.tasks)?data.tasks:fallback.tasks,activities:Array.isArray(data.activities)?data.activities:fallback.activities,groups:Array.isArray(data.groups)?data.groups:[],members:Array.isArray(data.members)?data.members:[],files:apiFiles,dates:Array.isArray(data.dates)?data.dates:[]};updateStamp(data.generatedAt);renderNotices();renderLiveTasks();renderDynamicResources();renderGroups();window.dispatchEvent(new CustomEvent('mednykuto:class-public-data',{detail:{files:mergeClassFiles(catalogFiles,apiFiles)}}));});}

  function initPwa(){
    var button=document.getElementById('installAppButton'),deferred=null,isIos=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(function(){});
    window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();deferred=event;if(button)button.hidden=false;});
    if(button&&!standalone){button.hidden=false;button.addEventListener('click',function(){if(deferred){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;button.hidden=true;});return;}if(isIos){var guide=el('aside','ios-install-guide');guide.appendChild(el('strong','','Instalar en iPhone'));guide.appendChild(el('p','','En Safari, toca Compartir y luego “Añadir a pantalla de inicio”.'));var close=el('button','','×');close.type='button';close.addEventListener('click',function(){guide.remove();});guide.appendChild(close);document.body.appendChild(guide);}else{button.title='Usa el menú del navegador y elige Instalar aplicación.';}});}
  }
  function initPrint(){document.querySelectorAll('[data-print-lesson]').forEach(function(button){button.addEventListener('click',function(){window.print();});});}
  function updateStamp(value){var stamp=document.getElementById('lastUpdated');if(!stamp)return;var date=new Date(value||'2026-08-27T12:00:00-03:00');if(Number.isNaN(date.getTime()))date=new Date('2026-08-27T12:00:00-03:00');var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Asuncion',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).reduce(function(result,part){result[part.type]=part.value;return result;},{}),months=['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.'],day=Number(parts.day),month=Number(parts.month),iso=parts.year+'-'+parts.month+'-'+parts.day;stamp.dateTime=iso;stamp.textContent='Actualizado '+day+' '+months[month-1]+' · contenido revisado';}
  function init(){initLessonTabs();initCourseWorkspaces();initGallery();initPrint();initPwa();updateStamp('2026-08-27T12:00:00-03:00');renderNotices();loadPublic();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
