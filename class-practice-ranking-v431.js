(function(){
  'use strict';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var PLAYER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  var ACCESS_TOKEN = /^[0-9a-f]{64}$/i;

  var copy = {
    es:{kicker:'DESAFÍO 4.º E · 50 R$ PIX',title:'{score}/{total} respuestas correctas',intro:'Publica con tu perfil del 4.º E. La clasificación es provisional hasta la verificación manual.',identity:'Perfil público del desafío',missing:'Guarda primero tu nombre completo, catraca completa y confirmación del 4.º E.',publish:'Sumar mis puntos',publishing:'Publicando…',success:'Resultado publicado. Tus puntos ya cuentan provisionalmente esta semana.',kept:'Tu mejor resultado de este bloque ya era igual o mejor.',error:'No se pudo publicar ahora. El ejercicio sigue guardado en este teléfono.',ranking:'Abrir desafío y clasificación',register:'Guardar identidad'},
    br:{kicker:'DESAFIO 4.º E · R$ 50 PIX',title:'{score}/{total} respostas corretas',intro:'Publique com seu perfil do 4.º E. A classificação é provisória até a verificação manual.',identity:'Perfil público do desafio',missing:'Primeiro salve seu nome completo, catraca completa e confirmação do 4.º E.',publish:'Somar meus pontos',publishing:'Publicando…',success:'Resultado publicado. Seus pontos já contam provisoriamente nesta semana.',kept:'Seu melhor resultado deste bloco já era igual ou melhor.',error:'Não foi possível publicar agora. O exercício continua salvo neste telefone.',ranking:'Abrir desafio e classificação',register:'Salvar identidade'}
  };

  function language(){var service=window.MedNykutoClassI18n;return service&&typeof service.getLang==='function'&&service.getLang()==='br'?'br':'es';}
  function text(key,values){var value=copy[language()][key]||copy.es[key]||key;Object.keys(values||{}).forEach(function(name){value=value.replace('{'+name+'}',String(values[name]));});return value;}
  function node(tag,className,value){var element=document.createElement(tag);if(className)element.className=className;if(value!==undefined)element.textContent=value;return element;}
  function createPlayerId(){if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();var bytes=new Uint8Array(16);if(window.crypto&&typeof window.crypto.getRandomValues==='function')window.crypto.getRandomValues(bytes);else for(var index=0;index<16;index+=1)bytes[index]=Math.floor(Math.random()*256);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;var hex=Array.prototype.map.call(bytes,function(value){return value.toString(16).padStart(2,'0');}).join('');return[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');}
  function canonicalCatraca(value){return String(value||'').normalize('NFKC').toUpperCase().replace(/[\s._-]+/g,'').slice(0,24);}
  function validFullName(value){var name=String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();var parts=name.split(' ');return name.length>=5&&name.length<=60&&parts.length>=2&&parts.every(function(part){return /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u.test(part);});}
  function readProfile(){var profile={};try{profile=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')||{};}catch(error){}if(!PLAYER_ID.test(String(profile.playerId||'')))profile.playerId=createPlayerId();profile.fullName=String(profile.fullName||profile.displayName||profile.nickname||'').normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,60);profile.displayName=profile.fullName;profile.catraca=canonicalCatraca(profile.catraca||profile.studentId||'');profile.studentIdMasked=String(profile.studentIdMasked||'').slice(0,20);profile.accessToken=ACCESS_TOKEN.test(String(profile.accessToken||''))?profile.accessToken:'';profile.classConfirmed=profile.classConfirmed===true&&Boolean(profile.catraca);delete profile.nickname;delete profile.studentId;saveProfile(profile);return profile;}
  function saveProfile(profile){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch(error){}}
  function profileReady(profile){return Boolean(validFullName(profile.fullName)&&/^[A-Z0-9]{4,24}$/.test(profile.catraca)&&profile.classConfirmed===true&&ACCESS_TOKEN.test(profile.accessToken));}
  function setStatus(status,state,message){status.dataset.state=state||'';status.textContent=message||'';}

  function buildPanel(result){
    var summary=result.summaryElement;if(!summary||!summary.isConnected)summary=document.querySelector('.practice-dialog[open] .practice-summary');if(!summary)return;
    var previous=summary.querySelector('.class-practice-publish');if(previous)previous.remove();
    var profile=readProfile();var ready=profileReady(profile);var panel=node('section','class-practice-publish');panel.appendChild(node('span','practice-eyebrow',text('kicker')));panel.appendChild(node('h5','',text('title',{score:result.correct,total:result.total})));panel.appendChild(node('p','',text('intro')));
    var form=node('form','class-practice-publish-form');var field=node('div','class-practice-publish-field');field.appendChild(node('span','',text('identity')));field.appendChild(node('strong','',ready?(profile.fullName+' · '+profile.catraca):text('missing')));var submit=node('button','class-practice-publish-button',ready?text('publish'):text('register'));submit.type=ready?'submit':'button';form.appendChild(field);form.appendChild(submit);panel.appendChild(form);
    var footer=node('div','class-practice-publish-footer');var status=node('p','class-practice-publish-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');var ranking=node('a','',text('ranking'));ranking.href='comunidade.html#ranking';footer.appendChild(status);footer.appendChild(ranking);panel.appendChild(footer);summary.appendChild(panel);
    if(!ready){submit.addEventListener('click',function(){window.location.href='comunidade.html#profileTitle';});return;}
    form.addEventListener('submit',function(event){
      event.preventDefault();submit.disabled=true;submit.textContent=text('publishing');setStatus(status,'','');
      fetch(API_URL,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action:'score',class:'s4-e',playerId:profile.playerId,accessToken:profile.accessToken,courseId:result.courseId,moduleId:result.moduleId,correct:result.correct,total:result.total})})
        .then(function(response){return response.json().catch(function(){return{};}).then(function(data){if(!response.ok){var error=new Error(data.code||'request_failed');error.code=data.code||'';throw error;}return data;});})
        .then(function(data){setStatus(status,'success',text(data.saved?'success':'kept'));})
        .catch(function(error){setStatus(status,'error',text(/^(?:identity_required|identity_ineligible)$/.test(error.code||'')?'missing':'error'));})
        .finally(function(){submit.disabled=false;submit.textContent=text('publish');});
    });
  }

  document.addEventListener('mednykuto:practice-complete',function(event){if(!event.detail)return;buildPanel(event.detail);});

  function preparePixSupport(){
    var host=document.querySelector('.home-quick-links');
    if(!host||document.querySelector('[data-pix-open]'))return;
    var key='drs.oliveirasantos@gmail.com';
    var style=document.createElement('style');
    style.textContent='.home-quick-links{grid-template-columns:repeat(3,minmax(0,1fr))}.home-quick-link-icon.brand-icon{overflow:hidden;padding:5px;background:#fff;border-color:rgba(255,255,255,.18)}.home-quick-link-icon.brand-icon svg{display:block;width:100%;height:100%}.home-support-link{appearance:none;width:100%;color:inherit;text-align:left;font:inherit;border-color:rgba(114,224,171,.2);background:linear-gradient(135deg,rgba(114,224,171,.055),rgba(4,13,23,.44))}.home-support-link:hover{border-color:rgba(114,224,171,.42);background:rgba(114,224,171,.065)}.home-support-link .home-quick-link-icon{border-color:rgba(114,224,171,.25);background:#fff}.home-support-link>b{color:var(--green)}.pix-support-dialog{width:min(420px,calc(100% - 28px));padding:0;border:1px solid var(--line-strong);border-radius:22px;color:var(--ink);background:#0d1b2c;box-shadow:var(--shadow)}.pix-support-dialog::backdrop{background:rgba(2,7,13,.72);backdrop-filter:blur(5px)}.pix-support-shell{position:relative;padding:26px;display:grid;gap:12px}.pix-support-shell>span{color:var(--green);font-size:.62rem;font-weight:950;letter-spacing:.12em}.pix-support-shell h2{margin:0;padding-right:42px;font-size:1.35rem;line-height:1.1}.pix-support-shell p{margin:0;color:var(--muted-strong);font-size:.88rem}.pix-support-close{position:absolute;right:14px;top:14px;width:42px;height:42px;border:1px solid var(--line);border-radius:50%;color:var(--ink);background:rgba(255,255,255,.04);font-size:1.4rem}.pix-support-key{min-width:0;margin-top:4px;padding:14px;border:1px solid rgba(114,224,171,.18);border-radius:14px;background:rgba(114,224,171,.045);display:grid;gap:4px}.pix-support-key small{color:var(--muted);font-size:.6rem;font-weight:900;letter-spacing:.08em}.pix-support-key strong{overflow-wrap:anywhere;font-size:.88rem}.pix-support-copy{min-height:46px;border:0;border-radius:13px;color:#07111f;background:var(--green);font-weight:900}.pix-support-note{color:var(--muted);font-size:.68rem;text-align:center}@media(max-width:760px){.home-quick-links{grid-template-columns:repeat(2,minmax(0,1fr))}.home-support-link{grid-column:1/-1;min-height:42px}.home-support-link .home-quick-link-icon{width:26px;height:26px}.home-support-link .home-quick-link-copy small,.home-support-link .home-quick-link-copy em,.home-support-link>b{display:none}.pix-support-shell{padding:22px 18px}}';
    document.head.appendChild(style);

    var ucpMark='<svg viewBox="0 0 64 64" role="img" aria-label="UCP"><rect width="64" height="64" rx="12" fill="#fff"/><circle cx="32" cy="32" r="27" fill="#102d63"/><path d="M18 27h28L32 17 18 27Zm3 4h4v14h-4V31Zm9 0h4v14h-4V31Zm9 0h4v14h-4V31ZM17 48h30v4H17v-4Z" fill="#f3c64f"/><text x="32" y="60" text-anchor="middle" font-size="7" font-weight="800" fill="#102d63">UCP</text></svg>';
    var driveMark='<svg viewBox="0 0 64 64" role="img" aria-label="Google Drive"><rect width="64" height="64" rx="12" fill="#fff"/><path d="M25 12h14l13 23H38L25 12Z" fill="#0F9D58"/><path d="M25 12 12 35l7 12 13-23-7-12Z" fill="#F4B400"/><path d="M19 47h26l7-12H26l-7 12Z" fill="#4285F4"/></svg>';
    var pixMark='<svg viewBox="0 0 64 64" role="img" aria-label="Pix"><rect width="64" height="64" rx="12" fill="#fff"/><g fill="none" stroke="#32BCAD" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 32 11-11c2-2 5-2 7 0l10 10"/><path d="m46 32-11 11c-2 2-5 2-7 0L18 33"/></g><path d="M27 27h10v10H27z" transform="rotate(45 32 32)" fill="#32BCAD"/></svg>';
    var portal=host.querySelector('.home-quick-link-portal .home-quick-link-icon');
    if(portal){portal.classList.add('brand-icon');portal.innerHTML=ucpMark;}
    var drive=host.querySelector('[data-class-drive-link] .home-quick-link-icon');
    if(drive){drive.classList.add('brand-icon');drive.innerHTML=driveMark;}

    var button=document.createElement('button');button.type='button';button.className='home-quick-link home-support-link';button.dataset.pixOpen='';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','pixSupportDialog');button.innerHTML='<span class="home-quick-link-icon brand-icon" aria-hidden="true">'+pixMark+'</span><span class="home-quick-link-copy"><small>DONACIÓN VOLUNTARIA</small><strong>Apoyar el proyecto</strong><em>Ayuda a mantener Med Nykuto y financiar las próximas mejoras.</em></span><b>Donar por Pix →</b>';
    host.appendChild(button);

    var dialog=document.createElement('dialog');dialog.className='pix-support-dialog';dialog.id='pixSupportDialog';dialog.setAttribute('aria-labelledby','pixSupportTitle');dialog.innerHTML='<div class="pix-support-shell"><button type="button" class="pix-support-close" data-pix-close aria-label="Cerrar">×</button><span>DONACIÓN VOLUNTARIA</span><h2 id="pixSupportTitle">Apoyar el proyecto Med Nykuto</h2><p>Tu donación ayuda a mantener el sitio y continuar mejorando los cursos.</p><div class="pix-support-key"><small>CLAVE PIX · E-MAIL</small><strong>'+key+'</strong></div><button type="button" class="pix-support-copy" data-pix-copy>Copiar clave Pix</button><small class="pix-support-note">Donación voluntaria, sin contenido bloqueado.</small></div>';
    document.body.appendChild(dialog);
    var close=dialog.querySelector('[data-pix-close]');var copyButton=dialog.querySelector('[data-pix-copy]');
    function closeDialog(){if(typeof dialog.close==='function'&&dialog.open)dialog.close();else dialog.removeAttribute('open');}
    button.addEventListener('click',function(){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');});
    close.addEventListener('click',closeDialog);dialog.addEventListener('click',function(event){if(event.target===dialog)closeDialog();});dialog.addEventListener('close',function(){button.focus();});
    copyButton.addEventListener('click',function(){var done=function(){copyButton.textContent='Clave copiada';setTimeout(function(){copyButton.textContent='Copiar clave Pix';},1800);};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(key).then(done).catch(function(){});else{var area=document.createElement('textarea');area.value=key;document.body.appendChild(area);area.select();try{document.execCommand('copy');done();}catch(error){}area.remove();}});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',preparePixSupport,{once:true});else preparePixSupport();
})();
