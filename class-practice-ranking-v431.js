(function(){
  'use strict';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var PLAYER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  var NICKNAME = /^[\p{L}\p{N}][\p{L}\p{N} ._'-]{0,22}[\p{L}\p{N}]$/u;

  var copy = {
    es:{
      kicker:'CLASIFICACIÓN SEMANAL',
      title:'{score}/{total} respuestas correctas',
      intro:'Suma este resultado al ranking con el mismo apodo que usas en Estudiar.',
      nickname:'Apodo público',
      placeholder:'Ej.: Baboune',
      publish:'Sumar mis puntos',
      publishing:'Publicando…',
      invalid:'Escribe un apodo de 2 a 24 caracteres.',
      success:'Resultado publicado. Tus puntos ya cuentan para esta semana.',
      kept:'Tu mejor resultado de este bloque ya era igual o mejor.',
      error:'No se pudo publicar ahora. El ejercicio sigue guardado en este teléfono.',
      ranking:'Ver la clasificación'
    },
    br:{
      kicker:'CLASSIFICAÇÃO SEMANAL',
      title:'{score}/{total} respostas corretas',
      intro:'Some este resultado à classificação com o mesmo apelido usado em Estudar.',
      nickname:'Apelido público',
      placeholder:'Ex.: Baboune',
      publish:'Somar meus pontos',
      publishing:'Publicando…',
      invalid:'Digite um apelido de 2 a 24 caracteres.',
      success:'Resultado publicado. Seus pontos já contam nesta semana.',
      kept:'Seu melhor resultado deste bloco já era igual ou maior.',
      error:'Não foi possível publicar agora. O exercício continua salvo neste telefone.',
      ranking:'Ver a classificação'
    }
  };

  function language(){
    var service = window.MedNykutoClassI18n;
    return service && typeof service.getLang === 'function' && service.getLang() === 'br' ? 'br' : 'es';
  }

  function text(key,values){
    var value = copy[language()][key] || copy.es[key] || key;
    Object.keys(values || {}).forEach(function(name){
      value = value.replace('{' + name + '}',String(values[name]));
    });
    return value;
  }

  function node(tag,className,value){
    var element = document.createElement(tag);
    if(className) element.className = className;
    if(value !== undefined) element.textContent = value;
    return element;
  }

  function createPlayerId(){
    if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if(window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
    else for(var index=0;index<16;index+=1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes,function(value){ return value.toString(16).padStart(2,'0'); }).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }

  function readProfile(){
    var profile = {};
    try{ profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }catch(error){}
    if(!PLAYER_ID.test(String(profile.playerId || ''))) profile.playerId = createPlayerId();
    profile.nickname = String(profile.nickname || '').slice(0,24);
    saveProfile(profile);
    return profile;
  }

  function saveProfile(profile){
    try{ localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); }catch(error){}
  }

  function cleanNickname(value){
    var nickname = String(value || '').normalize('NFKC').replace(/\s+/g,' ').trim();
    return NICKNAME.test(nickname) ? nickname : '';
  }

  function setStatus(status,state,message){
    status.dataset.state = state || '';
    status.textContent = message || '';
  }

  function buildPanel(result){
    var summary = result.summaryElement;
    if(!summary || !summary.isConnected) summary = document.querySelector('.practice-dialog[open] .practice-summary');
    if(!summary) return;
    var previous = summary.querySelector('.class-practice-publish');
    if(previous) previous.remove();

    var profile = readProfile();
    var panel = node('section','class-practice-publish');
    panel.appendChild(node('span','practice-eyebrow',text('kicker')));
    panel.appendChild(node('h5','',text('title',{score:result.correct,total:result.total})));
    panel.appendChild(node('p','',text('intro')));

    var form = node('form','class-practice-publish-form');
    var field = node('label','class-practice-publish-field');
    field.appendChild(node('span','',text('nickname')));
    var input = node('input');
    input.type = 'text';
    input.name = 'nickname';
    input.autocomplete = 'nickname';
    input.maxLength = 24;
    input.placeholder = text('placeholder');
    input.value = profile.nickname;
    field.appendChild(input);
    var submit = node('button','class-practice-publish-button',text('publish'));
    submit.type = 'submit';
    form.appendChild(field);
    form.appendChild(submit);
    panel.appendChild(form);

    var footer = node('div','class-practice-publish-footer');
    var status = node('p','class-practice-publish-status');
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    var ranking = node('a','',text('ranking'));
    ranking.href = 'comunidade.html#ranking';
    footer.appendChild(status);
    footer.appendChild(ranking);
    panel.appendChild(footer);
    summary.appendChild(panel);

    form.addEventListener('submit',function(event){
      event.preventDefault();
      var nickname = cleanNickname(input.value);
      if(!nickname){
        setStatus(status,'error',text('invalid'));
        input.focus();
        return;
      }
      profile.nickname = nickname;
      saveProfile(profile);
      input.value = nickname;
      submit.disabled = true;
      submit.textContent = text('publishing');
      setStatus(status,'','');
      fetch(API_URL,{
        method:'POST',
        credentials:'same-origin',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          playerId:profile.playerId,
          nickname:profile.nickname,
          courseId:result.courseId,
          moduleId:result.moduleId,
          correct:result.correct,
          total:result.total
        })
      }).then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if(!response.ok) throw new Error(data.code || 'request_failed');
          return data;
        });
      }).then(function(data){
        setStatus(status,'success',text(data.saved ? 'success' : 'kept'));
      }).catch(function(){
        setStatus(status,'error',text('error'));
      }).finally(function(){
        submit.disabled = false;
        submit.textContent = text('publish');
      });
    });
  }

  document.addEventListener('mednykuto:practice-complete',function(event){
    if(!event.detail) return;
    buildPanel(event.detail);
  });
})();
