(function(){
  'use strict';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var supported = ['es','br'];
  var state = {data:null,loading:false,error:''};

  var messages = {
    es:{
      pageTitle:'Desafío del 4.º E | Med Nykuto',
      back:'Volver a la clase',
      language:'Idioma',
      eyebrow:'4.º E · Semestre 4',
      title:'Un desafío que suma a toda la clase.',
      intro:'Cada QCM publicado aporta al objetivo común. El ranking es amistoso, semanal y funciona solo con apodos.',
      start:'Hacer un QCM',
      choose:'Elegir materia',
      challengeKicker:'DESAFÍO COLECTIVO',
      challengeTitle:'1.000 respuestas correctas esta semana',
      challengeCopy:'No importa quién queda primero: cada mejor resultado acerca a la clase a la meta.',
      correctAnswers:'respuestas correctas',
      people:'personas',
      records:'resultados',
      weekPending:'Semana actual',
      rankingKicker:'CLASIFICACIÓN SEMANAL',
      rankingTitle:'Así avanza la clase',
      rankingCopy:'Se suma el mejor resultado de cada persona en cada materia o módulo.',
      refresh:'Actualizar',
      refreshing:'Actualizando…',
      empty:'Todavía no hay resultados esta semana. El primero puede ser el tuyo.',
      unavailable:'La clasificación no está disponible por el momento. Los QCM siguen funcionando normalmente.',
      activating:'La base compartida está lista en el sitio y falta terminar su activación en Cloudflare.',
      retry:'Reintentar',
      you:'Tú',
      points:'aciertos',
      oneScope:'1 materia',
      scopes:'{count} materias/módulos',
      accuracy:'{value}% de precisión',
      profileKicker:'TU IDENTIDAD EN EL RETO',
      profileTitle:'Elige un apodo',
      profileCopy:'Será lo único que verá la clase. Puedes cambiarlo antes de publicar otro resultado.',
      nickname:'Apodo público',
      nicknamePlaceholder:'Ej.: Baboune',
      save:'Guardar apodo',
      invalidNickname:'Usa entre 2 y 24 letras, números o espacios.',
      profileSaved:'Apodo guardado en este dispositivo.',
      privacy:'No pedimos email ni nombre real. Participar es opcional.',
      howKicker:'CÓMO PARTICIPAR',
      howTitle:'Tres pasos, sin cuenta',
      step1Title:'1. Haz un QCM',
      step1Copy:'Abre una materia o un módulo y termina la serie.',
      step2Title:'2. Publica el resultado',
      step2Copy:'Al final, escribe tu apodo y toca “Sumar mi resultado”.',
      step3Title:'3. Vuelve la semana siguiente',
      step3Copy:'El desafío se reinicia cada lunes, hora de Paraguay.',
      fairTitle:'Un ranking para motivarnos, no para juzgarnos',
      fairCopy:'Solo se guarda tu mejor resultado semanal por materia o módulo. No mostramos el tiempo y este no es un registro académico oficial.',
      questions:'¿Tienes una idea para el próximo desafío?',
      questionsLink:'Preparar un mensaje para los delegados',
      footer:'Apoyo académico no oficial · 4.º E',
      weekRange:'Del {start} al {end}'
    },
    br:{
      pageTitle:'Desafio do 4.º E | Med Nykuto',
      back:'Voltar para a turma',
      language:'Idioma',
      eyebrow:'4.º E · 4.º semestre',
      title:'Um desafio em que toda a turma ganha.',
      intro:'Cada QCM publicado contribui para a meta coletiva. A classificação é amigável, semanal e usa apenas apelidos.',
      start:'Fazer um QCM',
      choose:'Escolher matéria',
      challengeKicker:'DESAFIO COLETIVO',
      challengeTitle:'1.000 respostas corretas nesta semana',
      challengeCopy:'Não importa quem fica em primeiro: cada melhor resultado aproxima a turma da meta.',
      correctAnswers:'respostas corretas',
      people:'pessoas',
      records:'resultados',
      weekPending:'Semana atual',
      rankingKicker:'CLASSIFICAÇÃO SEMANAL',
      rankingTitle:'Veja como a turma avança',
      rankingCopy:'Somamos o melhor resultado de cada pessoa em cada matéria ou módulo.',
      refresh:'Atualizar',
      refreshing:'Atualizando…',
      empty:'Ainda não há resultados nesta semana. O primeiro pode ser o seu.',
      unavailable:'A classificação está indisponível no momento. Os QCMs continuam funcionando normalmente.',
      activating:'A base compartilhada já está pronta no site; falta concluir a ativação no Cloudflare.',
      retry:'Tentar novamente',
      you:'Você',
      points:'acertos',
      oneScope:'1 matéria',
      scopes:'{count} matérias/módulos',
      accuracy:'{value}% de precisão',
      profileKicker:'SUA IDENTIDADE NO DESAFIO',
      profileTitle:'Escolha um apelido',
      profileCopy:'É a única informação que a turma verá. Você pode alterá-lo antes de publicar outro resultado.',
      nickname:'Apelido público',
      nicknamePlaceholder:'Ex.: Baboune',
      save:'Salvar apelido',
      invalidNickname:'Use entre 2 e 24 letras, números ou espaços.',
      profileSaved:'Apelido salvo neste dispositivo.',
      privacy:'Não pedimos e-mail nem nome real. A participação é opcional.',
      howKicker:'COMO PARTICIPAR',
      howTitle:'Três passos, sem conta',
      step1Title:'1. Faça um QCM',
      step1Copy:'Abra uma matéria ou um módulo e termine a série.',
      step2Title:'2. Publique o resultado',
      step2Copy:'No final, digite seu apelido e toque em “Somar meu resultado”.',
      step3Title:'3. Volte na semana seguinte',
      step3Copy:'O desafio recomeça toda segunda-feira, no horário do Paraguai.',
      fairTitle:'Uma classificação para motivar, não para julgar',
      fairCopy:'Só guardamos seu melhor resultado semanal por matéria ou módulo. Não mostramos o tempo e isto não é um registro acadêmico oficial.',
      questions:'Tem uma ideia para o próximo desafio?',
      questionsLink:'Preparar uma mensagem para os delegados',
      footer:'Apoio acadêmico não oficial · 4.º E',
      weekRange:'De {start} a {end}'
    }
  };

  function createPlayerId(){
    if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    if(window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
    else for(var i=0;i<16;i+=1) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes,function(value){ return value.toString(16).padStart(2,'0'); }).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }

  function readProfile(){
    var profile = {};
    try{ profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }catch(error){}
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profile.playerId || '')) profile.playerId = createPlayerId();
    profile.nickname = String(profile.nickname || '').slice(0,24);
    saveProfile(profile);
    return profile;
  }

  function saveProfile(profile){
    try{ localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); }catch(error){}
  }

  function validNickname(value){
    return /^[\p{L}\p{N}][\p{L}\p{N} ._'-]{0,22}[\p{L}\p{N}]$/u.test(value);
  }

  function readLanguage(){
    try{
      var saved = localStorage.getItem('medLang');
      if(supported.indexOf(saved) !== -1) return saved;
    }catch(error){}
    return 'es';
  }

  var lang = readLanguage();
  var profile = readProfile();

  function t(key,variables){
    var value = messages[lang][key] || messages.es[key] || key;
    Object.keys(variables || {}).forEach(function(name){
      value = value.replace('{' + name + '}',variables[name]);
    });
    return value;
  }

  function applyLanguage(){
    document.documentElement.lang = lang === 'br' ? 'pt-BR' : 'es';
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach(function(node){
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(node){
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    document.getElementById('communityLanguage').value = lang;
    renderData();
  }

  function formatNumber(value){
    return new Intl.NumberFormat(lang === 'br' ? 'pt-BR' : 'es-PY').format(Number(value) || 0);
  }

  function formatDate(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
    return new Intl.DateTimeFormat(lang === 'br' ? 'pt-BR' : 'es-PY',{day:'numeric',month:'short',timeZone:'UTC'})
      .format(new Date(value + 'T12:00:00Z'))
      .replace(/\.$/,'');
  }

  function element(tag,className,text){
    var node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined) node.textContent = text;
    return node;
  }

  function renderRanking(entries){
    var list = document.getElementById('communityRanking');
    var empty = document.getElementById('communityEmpty');
    list.replaceChildren();
    if(!entries || !entries.length){
      empty.hidden = false;
      empty.textContent = t('empty');
      return;
    }
    empty.hidden = true;
    entries.forEach(function(entry){
      var item = element('li','ranking-row' + (entry.isCurrent ? ' is-current' : ''));
      var rank = element('span','ranking-position',String(entry.rank));
      rank.setAttribute('aria-label','#' + entry.rank);
      item.appendChild(rank);
      var identity = element('div','ranking-identity');
      var nameLine = element('div','ranking-name-line');
      nameLine.appendChild(element('strong','ranking-name',entry.nickname));
      if(entry.isCurrent) nameLine.appendChild(element('span','ranking-you',t('you')));
      identity.appendChild(nameLine);
      var scopeText = Number(entry.challenges) === 1 ? t('oneScope') : t('scopes',{count:entry.challenges});
      identity.appendChild(element('small','ranking-meta',scopeText + ' · ' + t('accuracy',{value:entry.accuracy})));
      item.appendChild(identity);
      var score = element('div','ranking-score');
      score.appendChild(element('strong','',formatNumber(entry.points)));
      score.appendChild(element('small','',t('points')));
      item.appendChild(score);
      list.appendChild(item);
    });
  }

  function renderData(){
    var loading = document.getElementById('communityLoading');
    var errorBox = document.getElementById('communityError');
    var refresh = document.getElementById('communityRefresh');
    loading.hidden = !state.loading;
    refresh.disabled = state.loading;
    refresh.textContent = state.loading ? t('refreshing') : t('refresh');
    errorBox.hidden = !state.error;
    if(state.error) errorBox.querySelector('span').textContent = t(state.error);

    if(!state.data){
      if(state.loading || state.error){
        document.getElementById('communityRanking').replaceChildren();
        document.getElementById('communityEmpty').hidden = true;
      }else{
        renderRanking([]);
      }
      return;
    }

    var data = state.data;
    var challenge = data.challenge || {};
    document.getElementById('challengeScore').textContent = formatNumber(challenge.points) + ' / ' + formatNumber(challenge.goal);
    document.getElementById('challengeProgress').style.width = Math.min(100,Number(challenge.progress) || 0) + '%';
    document.getElementById('challengeProgressBar').setAttribute('aria-valuenow',String(Math.min(100,Number(challenge.progress) || 0)));
    document.getElementById('challengeParticipants').textContent = formatNumber(challenge.participants);
    document.getElementById('challengeRecords').textContent = formatNumber(challenge.records);
    if(data.week){
      document.getElementById('challengeWeek').textContent = t('weekRange',{
        start:formatDate(data.week.start),
        end:formatDate(data.week.end)
      });
    }
    renderRanking(data.ranking || []);
  }

  function loadData(){
    if(state.loading) return;
    state.loading = true;
    state.error = '';
    renderData();
    fetch(API_URL + '?player=' + encodeURIComponent(profile.playerId),{credentials:'same-origin'})
      .then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if(!response.ok){
            var error = new Error(data.code || 'request_failed');
            error.code = data.code || '';
            throw error;
          }
          return data;
        });
      })
      .then(function(data){ state.data = data; })
      .catch(function(error){
        state.data = null;
        state.error = error.code === 'not_configured' ? 'activating' : 'unavailable';
      })
      .finally(function(){ state.loading = false; renderData(); });
  }

  function init(){
    var languageSelect = document.getElementById('communityLanguage');
    var nicknameInput = document.getElementById('communityNickname');
    var profileForm = document.getElementById('communityProfileForm');
    var profileStatus = document.getElementById('communityProfileStatus');

    nicknameInput.value = profile.nickname;
    languageSelect.addEventListener('change',function(){
      lang = supported.indexOf(languageSelect.value) !== -1 ? languageSelect.value : 'es';
      try{ localStorage.setItem('medLang',lang); }catch(error){}
      applyLanguage();
    });
    profileForm.addEventListener('submit',function(event){
      event.preventDefault();
      var nickname = nicknameInput.value.normalize('NFKC').replace(/\s+/g,' ').trim();
      if(!validNickname(nickname)){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('invalidNickname');
        nicknameInput.focus();
        return;
      }
      profile.nickname = nickname;
      saveProfile(profile);
      profileStatus.dataset.state = 'success';
      profileStatus.textContent = t('profileSaved');
    });
    document.getElementById('communityRefresh').addEventListener('click',loadData);
    document.getElementById('communityRetry').addEventListener('click',loadData);
    applyLanguage();
    loadData();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
