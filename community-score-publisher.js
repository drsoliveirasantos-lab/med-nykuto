(function(){
  'use strict';

  if(window.__MED_NYKUTO_COMMUNITY_PUBLISHER__) return;
  window.__MED_NYKUTO_COMMUNITY_PUBLISHER__ = 'v1';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var params = new URLSearchParams(window.location.search || '');
  var classId = String(params.get('class') || '').toLowerCase();
  if(classId !== 's4-e') return;
  var courseId = params.get('course') || '';
  var moduleId = params.get('module') || '';

  var copy = {
    es:{
      title:'¿Te sumas al desafío del 4.º E?',
      body:'Publica este resultado con el perfil del desafío exclusivo del 4.º E.',
      label:'Perfil del desafío',
      submit:'Sumar mi resultado',
      sending:'Guardando…',
      saved:'Resultado añadido: {score}.',
      kept:'Tu mejor resultado sigue siendo {score}.',
      invalid:'Guarda primero tu nombre y catraca en la página del desafío.',
      offline:'No se pudo conectar ahora. Tu resultado del QCM no se pierde.',
      activating:'El desafío compartido se está activando. Tu resultado del QCM no se pierde.',
      ranking:'Ver el desafío y la clasificación',
      privacy:'Premio: 50 R$ por Pix al primer lugar verificado. La catraca completa nunca es pública.',
      register:'Guardar identidad'
    },
    br:{
      title:'Você entra no desafio do 4.º E?',
      body:'Publique este resultado com o perfil do desafio exclusivo do 4.º E.',
      label:'Perfil do desafio',
      submit:'Somar meu resultado',
      sending:'Salvando…',
      saved:'Resultado adicionado: {score}.',
      kept:'Seu melhor resultado continua sendo {score}.',
      invalid:'Primeiro salve seu nome e catraca na página do desafio.',
      offline:'Não foi possível conectar agora. Seu resultado do QCM não será perdido.',
      activating:'O desafio compartilhado está sendo ativado. Seu resultado do QCM não será perdido.',
      ranking:'Ver o desafio e a classificação',
      privacy:'Prêmio: R$ 50 por Pix para o primeiro lugar verificado. A catraca completa nunca é pública.',
      register:'Salvar identidade'
    }
  };

  function language(){
    var values = [];
    try{
      values.push(localStorage.getItem('medLang'));
      values.push(localStorage.getItem('medCursosLang'));
    }catch(error){}
    values.push(document.documentElement.lang);
    return values.some(function(value){ return /^(br|pt)/i.test(value || ''); }) ? 'br' : 'es';
  }

  function createPlayerId(){
    if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if(window.crypto && typeof window.crypto.getRandomValues === 'function'){
      window.crypto.getRandomValues(bytes);
    }else{
      for(var i=0;i<bytes.length;i+=1) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes,function(value){ return value.toString(16).padStart(2,'0'); }).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }

  function readProfile(){
    var profile = {};
    try{ profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }catch(error){}
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profile.playerId || '')) profile.playerId = createPlayerId();
    profile.displayName = String(profile.displayName || profile.nickname || '').slice(0,60);
    profile.studentIdMasked = String(profile.studentIdMasked || '').slice(0,20);
    profile.accessToken = /^[0-9a-f]{64}$/i.test(String(profile.accessToken || '')) ? profile.accessToken : '';
    delete profile.nickname;
    delete profile.studentId;
    writeProfile(profile);
    return profile;
  }

  function writeProfile(profile){
    try{ localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); }catch(error){}
  }

  function scoreFromCard(card){
    var nodes = card.querySelectorAll('h2,h3,strong');
    for(var i=0;i<nodes.length;i+=1){
      var match = String(nodes[i].textContent || '').match(/(^|\D)(\d{1,2})\s*\/\s*(\d{1,2})(?!\d)/);
      if(!match) continue;
      var correct = Number(match[2]);
      var total = Number(match[3]);
      if(total >= 1 && total <= 50 && correct >= 0 && correct <= total) return {correct:correct,total:total};
    }
    return null;
  }

  function element(tag,className,text){
    var node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined) node.textContent = text;
    return node;
  }

  function setStatus(node,message,state){
    node.textContent = message;
    node.dataset.state = state || '';
  }

  function translated(template,score){
    return template.replace('{score}',score.correct + '/' + score.total);
  }

  function buildPublisher(card,score){
    var lang = language();
    var text = copy[lang];
    var profile = readProfile();
    var panel = element('section','community-publish-card');
    panel.setAttribute('aria-labelledby','community-publish-title-' + Math.random().toString(36).slice(2));

    var heading = element('h3','community-publish-title',text.title);
    heading.id = panel.getAttribute('aria-labelledby');
    panel.appendChild(heading);
    panel.appendChild(element('p','community-publish-copy',text.body));

    var form = element('form','community-publish-form');
    var field = element('div','community-publish-field');
    field.appendChild(element('span','community-publish-label',text.label));
    field.appendChild(element('strong','community-publish-identity',profile.displayName ? profile.displayName + ' · ' + profile.studentIdMasked : text.invalid));
    form.appendChild(field);
    var button = element('button','community-publish-button',profile.accessToken ? text.submit : text.register);
    button.type = profile.accessToken ? 'button' : 'button';
    form.appendChild(button);
    panel.appendChild(form);

    var status = element('p','community-publish-status','');
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    panel.appendChild(status);
    panel.appendChild(element('p','community-publish-privacy',text.privacy));
    var link = element('a','community-publish-link',text.ranking + ' →');
    link.href = 'comunidade.html';
    panel.appendChild(link);

    function publishScore(event){
      event.preventDefault();
      event.stopPropagation();
      if(!profile.displayName || !profile.accessToken){
        setStatus(status,text.invalid,'error');
        window.location.href = 'comunidade.html#profileTitle';
        return;
      }
      button.disabled = true;
      button.textContent = text.sending;
      setStatus(status,'','');

      fetch(API_URL,{
        method:'POST',
        credentials:'same-origin',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          action:'score',
          class:'s4-e',
          playerId:profile.playerId,
          accessToken:profile.accessToken,
          courseId:courseId,
          moduleId:moduleId,
          correct:score.correct,
          total:score.total
        })
      }).then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if(!response.ok) {
            var error = new Error(data.code || 'request_failed');
            error.code = data.code || '';
            throw error;
          }
          return data;
        });
      }).then(function(data){
        var best = data.best || score;
        setStatus(status,translated(data.saved === false ? text.kept : text.saved,best),'success');
      }).catch(function(error){
        setStatus(status,error.code === 'not_configured' ? text.activating : text.offline,'error');
      }).finally(function(){
        button.disabled = false;
        button.textContent = text.submit;
      });
    }

    button.addEventListener('click',publishScore);
    card.appendChild(panel);
  }

  function scan(){
    if(!courseId && !moduleId) return;
    document.querySelectorAll('#practiceList .completion-card').forEach(function(card){
      if(card.dataset.communityPublisher === '1') return;
      var score = scoreFromCard(card);
      if(!score) return;
      card.dataset.communityPublisher = '1';
      buildPublisher(card,score);
    });
  }

  function start(){
    var root = document.getElementById('practiceList');
    if(!root || (!courseId && !moduleId)) return;
    scan();
    new MutationObserver(scan).observe(root,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
