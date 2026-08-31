(function(){
  'use strict';

  var API_URL='/api/help-desk';
  var SUPPORT_EMAIL='contact@nykuto.com';
  var DRAFT_PREFIX='medNykutoHelpDeskDraft:v479:';
  var CLASS_REF=/^[a-z0-9][a-z0-9-]{0,30}$/;
  var E164=/^\+[1-9]\d{7,14}$/;
  var DRAFT_FIELDS=['role','category','location','subject','name','replyContact','message'];

  var roleOptions=[
    ['student','Estudiante'],
    ['delegate','Delegado/a'],
    ['future-delegate','Futuro/a delegado/a']
  ];
  var categoryOptions=[
    ['','Selecciona una categoría'],
    ['subject-help','Duda sobre una materia'],
    ['task-group','Tarea, fecha o grupo'],
    ['question-error','Error en una pregunta'],
    ['course-error','Error en un curso'],
    ['file','Archivo que no abre'],
    ['bug','Problema técnico'],
    ['improvement','Idea de mejora'],
    ['delegate-access','Acceso de delegado'],
    ['other','Otro']
  ];
  var locationOptions=[
    ['class-home','Inicio de la clase'],
    ['schedule','Horario o calendario'],
    ['tasks','Tareas o grupos'],
    ['subjects','Materias o cursos'],
    ['study','Preguntas o entrenamiento'],
    ['groups-files','Grupos o archivos'],
    ['delegate-panel','Panel del delegado'],
    ['general','Página general'],
    ['other','Otro lugar']
  ];

  function optionMarkup(options){
    return options.map(function(option){
      return '<option value="'+option[0]+'">'+option[1]+'</option>';
    }).join('');
  }

  function cleanClassRef(value){
    var ref=String(value||'').trim().toLowerCase();
    return CLASS_REF.test(ref)?ref:'';
  }

  function queryClass(){
    var params=new URLSearchParams(window.location.search||'');
    var keys=['class','classSlug','classId','slug'];
    for(var index=0;index<keys.length;index+=1){
      var value=cleanClassRef(params.get(keys[index]));
      if(value)return value;
    }
    return '';
  }

  function pathClass(){
    var match=window.location.pathname.match(/\/(?:turma|gestion)\/([^/?#]+)/i);
    if(!match)return '';
    try{return cleanClassRef(decodeURIComponent(match[1]));}catch(error){return '';}
  }

  function resolveClass(form){
    var page=window.location.pathname.toLowerCase();
    if(/\/(?:clase|comunidade)\.html$/.test(page))return 's4-e';
    return cleanClassRef(form&&form.dataset.helpdeskClass)
      ||cleanClassRef(document.body&&document.body.dataset.helpdeskClass)
      ||cleanClassRef(document.documentElement.dataset.classSlug)
      ||pathClass()
      ||queryClass()
      ||'s4-e';
  }

  function currentPagePath(){
    var params=new URLSearchParams(window.location.search||'');
    Array.from(params.keys()).forEach(function(key){
      if(/(?:token|password|secret|access|invite|auth|key|code)/i.test(key))params.delete(key);
    });
    var search=params.toString();
    var hash=String(window.location.hash||'');
    if(/(?:token|password|secret|access|invite|auth|key|code)/i.test(hash))hash='';
    return String(window.location.pathname+(search?'?'+search:'')+hash).slice(0,500);
  }

  function isManagementPage(){return /\/(?:gestion|gestion-shell)(?:\/|$)/i.test(window.location.pathname);}

  function isClassPage(){return /\/(?:turma|turma-shell)(?:\/|$)/i.test(window.location.pathname)||/\/clase\.html$/i.test(window.location.pathname);}

  function inferredRole(){
    var params=new URLSearchParams(window.location.search||'');
    var requested=params.get('role');
    if(roleOptions.some(function(option){return option[0]===requested;}))return requested;
    return isManagementPage()?'delegate':'student';
  }

  function inferredLocation(){
    var page=window.location.pathname.toLowerCase();
    var hash=(window.location.hash||'').toLowerCase();
    var active=document.querySelector('[data-view]:not([hidden]),[data-manage-panel]:not([hidden])');
    var activeName=active?(active.dataset.view||active.dataset.managePanel||''):'';
    var context=hash+' '+activeName;
    if(isManagementPage())return 'delegate-panel';
    if(/horario|calendar|calendario/.test(context))return 'schedule';
    if(/pendiente|tarea|task|group|grupo/.test(context))return 'tasks';
    if(/materia|curso|subject/.test(context)||/(?:materia|matieres|module|modules)\.html$/.test(page))return 'subjects';
    if(/estudi|entren|practice|ranking/.test(context)||/(?:comunidade|qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(page))return 'study';
    if(/archivo|file/.test(context))return 'groups-files';
    if(isClassPage())return 'class-home';
    return 'general';
  }

  function createRequestId(){
    if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
    var bytes=new Uint8Array(16);
    if(window.crypto&&typeof window.crypto.getRandomValues==='function')window.crypto.getRandomValues(bytes);
    else for(var index=0;index<bytes.length;index+=1)bytes[index]=Math.floor(Math.random()*256);
    bytes[6]=(bytes[6]&15)|64;
    bytes[8]=(bytes[8]&63)|128;
    var hex=Array.prototype.map.call(bytes,function(value){return value.toString(16).padStart(2,'0');}).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }

  function formMarkup(prefix){
    return ''+
      '<div class="helpdesk-form-fields" data-helpdesk-fields>'+
        '<div class="helpdesk-field-grid">'+
          '<label class="helpdesk-field" for="'+prefix+'Role"><span>¿Quién eres? <b>Obligatorio</b></span><select id="'+prefix+'Role" name="role" aria-label="Quién solicita ayuda" required>'+optionMarkup(roleOptions)+'</select></label>'+
          '<label class="helpdesk-field" for="'+prefix+'Category"><span>Tipo de consulta <b>Obligatorio</b></span><select id="'+prefix+'Category" name="category" aria-label="Tipo de consulta" required>'+optionMarkup(categoryOptions)+'</select></label>'+
          '<label class="helpdesk-field" for="'+prefix+'Location"><span>¿Dónde ocurre? <b>Obligatorio</b></span><select id="'+prefix+'Location" name="location" aria-label="Lugar del problema" required>'+optionMarkup(locationOptions)+'</select></label>'+
          '<label class="helpdesk-field" for="'+prefix+'Subject"><span>Materia <em>Opcional</em></span><input id="'+prefix+'Subject" name="subject" type="text" maxlength="100" autocomplete="off" aria-label="Materia relacionada" placeholder="Ej.: Fisiología" /></label>'+
          '<label class="helpdesk-field" for="'+prefix+'Name"><span>Tu nombre <em data-helpdesk-name-requirement>Opcional</em></span><input id="'+prefix+'Name" name="name" type="text" maxlength="100" autocomplete="name" aria-label="Tu nombre" placeholder="Para saber cómo llamarte" /></label>'+
          '<label class="helpdesk-field" for="'+prefix+'ReplyContact"><span>Correo o WhatsApp <em data-helpdesk-contact-requirement>Opcional</em></span><input id="'+prefix+'ReplyContact" name="replyContact" type="text" maxlength="120" autocomplete="off" aria-label="Correo o WhatsApp para responder" aria-describedby="'+prefix+'ReplyHelp" placeholder="Si quieres recibir una respuesta" /><small id="'+prefix+'ReplyHelp" data-helpdesk-reply-help>Escribe un correo o un número de WhatsApp válido.</small></label>'+
          '<label class="helpdesk-field helpdesk-field-wide" for="'+prefix+'Message"><span>Describe lo que necesitas <b>Obligatorio</b></span><textarea id="'+prefix+'Message" name="message" minlength="10" maxlength="3000" rows="5" required aria-label="Descripción de la solicitud" aria-describedby="'+prefix+'MessageHelp '+prefix+'Safety" placeholder="Explica qué ocurre, qué esperabas ver y cualquier detalle útil."></textarea><small id="'+prefix+'MessageHelp">Entre 10 y 3.000 caracteres.</small></label>'+
        '</div>'+
        '<label class="helpdesk-honeypot" aria-hidden="true" for="'+prefix+'Website">No completar<input id="'+prefix+'Website" name="website" type="text" tabindex="-1" autocomplete="off" aria-label="No completar" /></label>'+
        '<p class="helpdesk-safety" id="'+prefix+'Safety">No envíes contraseñas, datos bancarios ni información que identifique a un paciente. Comparte una captura solo si soporte te indica un canal habilitado.</p>'+
        '<div class="helpdesk-actions"><button type="submit" class="helpdesk-submit" data-helpdesk-submit>Enviar solicitud</button><small>Recibirás una referencia para seguir tu solicitud.</small></div>'+
        '<p class="helpdesk-status" data-helpdesk-status role="status" aria-live="polite"></p>'+
      '</div>'+
      '<section class="helpdesk-result" data-helpdesk-result aria-live="polite" hidden>'+
        '<span data-helpdesk-result-kicker></span><h3 data-helpdesk-result-title></h3><p data-helpdesk-result-copy></p><strong data-helpdesk-reference></strong>'+
        '<a class="helpdesk-result-action" data-helpdesk-whatsapp target="_blank" rel="noopener noreferrer" hidden>Abrir borrador en WhatsApp</a>'+
        '<a class="helpdesk-result-action" data-helpdesk-email hidden>Abrir borrador de correo</a>'+
        '<button class="helpdesk-result-action" data-helpdesk-copy type="button" hidden>Copiar la referencia</button>'+
        '<button class="helpdesk-new" data-helpdesk-new type="button">Enviar otra solicitud</button>'+
        '<p class="helpdesk-result-status" data-helpdesk-result-status role="status" aria-live="polite"></p>'+
      '</section>';
  }

  function field(form,name){return form.elements.namedItem(name);}

  function value(form,name){
    var control=field(form,name);
    return control?String(control.value||'').trim():'';
  }

  function setValue(form,name,next){
    var control=field(form,name);
    if(control&&next!==undefined&&next!==null)control.value=String(next);
  }

  function validReplyContact(next){
    var reply=String(next||'').trim();
    if(!reply)return true;
    if(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(reply))return true;
    var withoutLabel=reply.replace(/^(?:whats?app|wa|tel(?:ephone|éfono)?)\s*:\s*/iu,'');
    if(!/^\+?(?:\(\d{1,4}\)|\d)[\d\s().-]*$/u.test(withoutLabel))return false;
    var digits=withoutLabel.replace(/\D/g,'');
    return digits.length>=7&&digits.length<=15&&!/^0+$/.test(digits);
  }

  function isDelegateRequest(form){
    return value(form,'role')==='future-delegate'||value(form,'category')==='delegate-access';
  }

  function updateDelegateRequirements(form){
    var required=isDelegateRequest(form);
    var name=field(form,'name');
    var reply=field(form,'replyContact');
    var nameRequirement=form.querySelector('[data-helpdesk-name-requirement]');
    var contactRequirement=form.querySelector('[data-helpdesk-contact-requirement]');
    var replyHelp=form.querySelector('[data-helpdesk-reply-help]');
    if(name){
      name.required=required;
      name.setAttribute('aria-required',required?'true':'false');
      name.setCustomValidity(required&&!String(name.value||'').trim()?'Escribe tu nombre para que podamos verificar la solicitud de acceso de delegado.':'');
    }
    if(reply){
      reply.required=required;
      reply.setAttribute('aria-required',required?'true':'false');
      var replyValue=String(reply.value||'').trim();
      var replyError='';
      if(required&&!replyValue)replyError='Escribe un correo o WhatsApp válido para que podamos responder sobre el acceso de delegado.';
      else if(replyValue&&!validReplyContact(replyValue))replyError='Escribe un correo como nombre@dominio.com o un WhatsApp con 7 a 15 dígitos.';
      reply.setCustomValidity(replyError);
    }
    if(nameRequirement)nameRequirement.textContent=required?'Obligatorio para delegado':'Opcional';
    if(contactRequirement)contactRequirement.textContent=required?'Obligatorio para delegado':'Opcional';
    if(replyHelp)replyHelp.textContent=required
      ?'Para el acceso de delegado, indica un correo o WhatsApp válido donde podamos responderte.'
      :'Escribe un correo o un número de WhatsApp válido.';
  }

  function optionLabel(options,next){
    var found=options.find(function(option){return option[0]===next;});
    return found?found[1]:next;
  }

  function supportSummary(form,reference){
    var detail=value(form,'message');
    if(detail.length>1500)detail=detail.slice(0,1500)+'…';
    var lines=[
      'Solicitud Med Nykuto',
      'Referencia: '+reference,
      'Clase: '+resolveClass(form),
      'Solicitante: '+optionLabel(roleOptions,value(form,'role')),
      'Categoría: '+optionLabel(categoryOptions,value(form,'category')),
      'Ubicación: '+optionLabel(locationOptions,value(form,'location')),
      value(form,'subject')?'Materia: '+value(form,'subject'):'',
      value(form,'name')?'Nombre: '+value(form,'name'):'',
      value(form,'replyContact')?'Contacto: '+value(form,'replyContact'):'',
      'Página: '+currentPagePath(),
      '',
      'Detalle:',
      detail
    ];
    return lines.filter(function(line,index){return line||index>8;}).join('\n');
  }

  function emailDraftHref(form,reference){
    var subject='Solicitud Med Nykuto · '+reference;
    return 'mailto:'+SUPPORT_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(supportSummary(form,reference));
  }

  function draftKey(form){return DRAFT_PREFIX+resolveClass(form);}

  function readDraft(form){
    try{
      var saved=JSON.parse(localStorage.getItem(draftKey(form))||'null');
      return saved&&typeof saved==='object'?saved:null;
    }catch(error){return null;}
  }

  function saveDraft(form){
    if(form.dataset.helpdeskComplete==='true')return true;
    var draft={requestId:form.dataset.requestId||createRequestId(),updatedAt:new Date().toISOString()};
    DRAFT_FIELDS.forEach(function(name){draft[name]=value(form,name);});
    form.dataset.requestId=draft.requestId;
    try{localStorage.setItem(draftKey(form),JSON.stringify(draft));return true;}catch(error){return false;}
  }

  function removeDraft(form){
    try{localStorage.removeItem(draftKey(form));}catch(error){}
  }

  function restoreDraft(form){
    var saved=readDraft(form);
    if(saved){
      DRAFT_FIELDS.forEach(function(name){setValue(form,name,saved[name]);});
      form.dataset.requestId=String(saved.requestId||createRequestId());
    }else{
      form.dataset.requestId=createRequestId();
      setValue(form,'role',inferredRole());
      setValue(form,'location',inferredLocation());
      var params=new URLSearchParams(window.location.search||'');
      setValue(form,'subject',params.get('subject')||params.get('course')||'');
      var category=params.get('category');
      if(category&&categoryOptions.some(function(option){return option[0]===category;}))setValue(form,'category',category);
    }
    saveDraft(form);
  }

  function setBusy(form,busy){
    var submit=form.querySelector('[data-helpdesk-submit]');
    form.setAttribute('aria-busy',busy?'true':'false');
    if(!submit)return;
    if(!submit.dataset.defaultLabel)submit.dataset.defaultLabel=submit.textContent;
    submit.disabled=Boolean(busy);
    submit.textContent=busy?'Enviando…':submit.dataset.defaultLabel;
  }

  function setStatus(form,message,error){
    var status=form.querySelector('[data-helpdesk-status]');
    if(!status)return;
    status.textContent=message||'';
    status.dataset.state=error?'error':message?'info':'';
  }

  function clipboardText(text){
    if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function')return navigator.clipboard.writeText(text);
    return new Promise(function(resolve,reject){
      var area=document.createElement('textarea');
      area.value=text;
      area.readOnly=true;
      area.style.position='fixed';
      area.style.opacity='0';
      document.body.appendChild(area);
      area.select();
      try{document.execCommand('copy')?resolve():reject(new Error('copy_failed'));}catch(error){reject(error);}
      area.remove();
    });
  }

  function showSuccess(form,data){
    var fields=form.querySelector('[data-helpdesk-fields]');
    var result=form.querySelector('[data-helpdesk-result]');
    var reference=form.querySelector('[data-helpdesk-reference]');
    var kicker=form.querySelector('[data-helpdesk-result-kicker]');
    var title=form.querySelector('[data-helpdesk-result-title]');
    var copyTextNode=form.querySelector('[data-helpdesk-result-copy]');
    var whatsapp=form.querySelector('[data-helpdesk-whatsapp]');
    var email=form.querySelector('[data-helpdesk-email]');
    var copy=form.querySelector('[data-helpdesk-copy]');
    var resultStatus=form.querySelector('[data-helpdesk-result-status]');
    var support=String(data.supportWhatsapp||'').trim();
    var referenceText=String(data.reference||'').trim();
    form.dataset.helpdeskComplete='true';
    fields.hidden=true;
    result.hidden=false;
    kicker.textContent='SOLICITUD REGISTRADA';
    title.textContent='El Centro de ayuda guardó tu solicitud.';
    reference.textContent=referenceText;
    resultStatus.textContent='';
    if(E164.test(support)){
      whatsapp.hidden=false;
      whatsapp.href='https://wa.me/'+support.slice(1)+'?text='+encodeURIComponent('Hola, mi solicitud Med Nykuto es '+referenceText+'.');
      email.hidden=true;
      email.removeAttribute('href');
      copyTextNode.textContent='Tu ticket quedó registrado. WhatsApp abrirá un mensaje preparado; deberás revisarlo y enviarlo tú. Guarda esta referencia:';
    }else{
      whatsapp.hidden=true;
      whatsapp.removeAttribute('href');
      email.hidden=false;
      email.href=emailDraftHref(form,referenceText);
      copyTextNode.textContent='Tu ticket quedó registrado. El enlace prepara un correo; deberás revisarlo y enviarlo tú. Guarda esta referencia:';
    }
    copy.hidden=false;
    removeDraft(form);
    result.scrollIntoView({behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    var nextAction=E164.test(support)?whatsapp:email;
    if(nextAction)nextAction.focus({preventScroll:true});
  }

  function resetRequest(form){
    form.reset();
    form.dataset.helpdeskComplete='false';
    form.dataset.submissionAttempted='false';
    form.dataset.requestId=createRequestId();
    var fields=form.querySelector('[data-helpdesk-fields]');
    var result=form.querySelector('[data-helpdesk-result]');
    var whatsapp=form.querySelector('[data-helpdesk-whatsapp]');
    var email=form.querySelector('[data-helpdesk-email]');
    var copy=form.querySelector('[data-helpdesk-copy]');
    var kicker=form.querySelector('[data-helpdesk-result-kicker]');
    var title=form.querySelector('[data-helpdesk-result-title]');
    var copyTextNode=form.querySelector('[data-helpdesk-result-copy]');
    var reference=form.querySelector('[data-helpdesk-reference]');
    fields.hidden=false;
    result.hidden=true;
    whatsapp.hidden=true;
    whatsapp.removeAttribute('href');
    email.hidden=true;
    email.removeAttribute('href');
    copy.hidden=true;
    kicker.textContent='';
    title.textContent='';
    copyTextNode.textContent='';
    reference.textContent='';
    setValue(form,'role',inferredRole());
    setValue(form,'location',inferredLocation());
    updateDelegateRequirements(form);
    setStatus(form,'',false);
    saveDraft(form);
    var first=field(form,'role');
    if(first)first.focus({preventScroll:true});
  }

  function payload(form){
    return {
      class:resolveClass(form),
      requestId:form.dataset.requestId||createRequestId(),
      role:value(form,'role'),
      category:value(form,'category'),
      subject:value(form,'subject'),
      location:value(form,'location'),
      pagePath:currentPagePath(),
      name:value(form,'name'),
      replyContact:value(form,'replyContact'),
      message:value(form,'message'),
      website:value(form,'website')
    };
  }

  function bindForm(form,index){
    if(form.dataset.helpdeskReady==='true')return;
    form.dataset.helpdeskReady='true';
    if(form.hasAttribute('data-helpdesk-build')||!form.querySelector('[name="message"]')){
      form.innerHTML=formMarkup(form.id||('helpDeskForm'+index));
    }
    form.noValidate=false;
    restoreDraft(form);
    updateDelegateRequirements(form);
    function draftChanged(){
      if(form.dataset.submissionAttempted==='true'){
        form.dataset.requestId=createRequestId();
        form.dataset.submissionAttempted='false';
      }
      updateDelegateRequirements(form);
      saveDraft(form);
    }
    form.addEventListener('input',draftChanged);
    form.addEventListener('change',draftChanged);
    form.querySelector('[data-helpdesk-new]').addEventListener('click',function(){resetRequest(form);});
    form.querySelector('[data-helpdesk-copy]').addEventListener('click',function(){
      var reference=form.querySelector('[data-helpdesk-reference]').textContent.trim();
      var resultStatus=form.querySelector('[data-helpdesk-result-status]');
      clipboardText('Solicitud Med Nykuto · '+reference).then(function(){resultStatus.textContent='Referencia copiada.';}).catch(function(){resultStatus.textContent='No se pudo copiar automáticamente. Mantén pulsada la referencia para copiarla.';});
    });
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(form.getAttribute('aria-busy')==='true'||form.dataset.helpdeskComplete==='true')return;
      updateDelegateRequirements(form);
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }
      form.dataset.submissionAttempted='true';
      saveDraft(form);
      var body=payload(form);
      form.dataset.requestId=body.requestId;
      setBusy(form,true);
      setStatus(form,'Enviando tu solicitud…',false);
      fetch(API_URL,{
        method:'POST',
        credentials:'same-origin',
        headers:{'content-type':'application/json','accept':'application/json'},
        body:JSON.stringify(body)
      }).then(function(response){
        return response.json().catch(function(){return {};}).then(function(data){
          if(!response.ok||data.ok!==true||!String(data.reference||'').trim()){
            var error=new Error(data.message||data.error||'No se pudo enviar la solicitud.');
            error.code=data.code||'';
            throw error;
          }
          return data;
        });
      }).then(function(data){
        setStatus(form,'',false);
        showSuccess(form,data);
      }).catch(function(error){
        var preserved=saveDraft(form);
        var message=error&&error.message?error.message:'No se pudo enviar ahora.';
        message+=preserved?' Tu borrador local sigue disponible en este navegador.':' No se pudo conservar el borrador; copia tu texto antes de salir.';
        setStatus(form,message,true);
      }).finally(function(){setBusy(form,false);});
    });
  }

  function closeDialog(dialog){
    if(typeof dialog.close==='function'&&dialog.open)dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('helpdesk-dialog-open');
  }

  function createFloatingHelpDesk(){
    if(document.body.hasAttribute('data-helpdesk-no-floating')||document.querySelector('[data-helpdesk-form]'))return;
    if(document.querySelector('.mobile-bottom-nav,.bottom-nav'))document.body.classList.add('helpdesk-has-bottom-nav');
    var button=document.createElement('button');
    button.id='helpDeskOpen';
    button.className='helpdesk-fab';
    button.type='button';
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','helpDeskDialog');
    button.innerHTML='<span aria-hidden="true">?</span><strong>Ayuda</strong>';

    var dialog=document.createElement('dialog');
    dialog.id='helpDeskDialog';
    dialog.className='helpdesk-dialog';
    dialog.setAttribute('aria-labelledby','helpDeskDialogTitle');
    dialog.setAttribute('aria-describedby','helpDeskDialogIntro');
    dialog.innerHTML='<div class="helpdesk-dialog-shell"><header class="helpdesk-heading"><div><span>CENTRO DE AYUDA</span><h2 id="helpDeskDialogTitle">¿En qué podemos ayudarte?</h2><p id="helpDeskDialogIntro">Describe tu consulta y recibirás una referencia para poder seguirla.</p></div><button class="helpdesk-close" type="button" data-helpdesk-close aria-label="Cerrar el centro de ayuda">×</button></header><form id="helpDeskDialogForm" class="helpdesk-form" data-helpdesk-form data-helpdesk-build="dialog"></form></div>';
    document.body.appendChild(button);
    document.body.appendChild(dialog);
    bindForm(dialog.querySelector('[data-helpdesk-form]'),0);

    function openDialog(){
      var form=dialog.querySelector('[data-helpdesk-form]');
      if(!readDraft(form)&&form.dataset.helpdeskComplete!=='true')setValue(form,'location',inferredLocation());
      if(typeof dialog.showModal==='function')dialog.showModal();
      else{dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');document.body.classList.add('helpdesk-dialog-open');}
      var target=form.dataset.helpdeskComplete==='true'?form.querySelector('[data-helpdesk-new]'):field(form,'role');
      if(target)window.setTimeout(function(){target.focus({preventScroll:true});},0);
    }
    button.addEventListener('click',openDialog);
    dialog.querySelector('[data-helpdesk-close]').addEventListener('click',function(){closeDialog(dialog);});
    dialog.addEventListener('click',function(event){if(event.target===dialog)closeDialog(dialog);});
    dialog.addEventListener('cancel',function(){document.body.classList.remove('helpdesk-dialog-open');});
    dialog.addEventListener('close',function(){document.body.classList.remove('helpdesk-dialog-open');button.focus({preventScroll:true});});
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&dialog.hasAttribute('open')&&typeof dialog.close!=='function'){
        event.preventDefault();
        closeDialog(dialog);
        button.focus({preventScroll:true});
      }
    });
  }

  function init(){
    document.querySelectorAll('[data-helpdesk-form]').forEach(bindForm);
    createFloatingHelpDesk();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
