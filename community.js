(function(){
  'use strict';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var supported = ['es','br'];
  var state = {data:null,loading:false,error:''};

  var messages = {
    es:{
      pageTitle:'Estudiar · 4.º E | Med Nykuto',
      back:'Volver a la clase',
      language:'Idioma',
      eyebrow:'4.º E · Semestre 4',
      title:'Estudia por materia y tema.',
      intro:'Elige lo que viste en clase y entrena con sus QCM, verdadero o falso y casos clínicos.',
      studyKicker:'ENTRENAMIENTO',
      selectSubject:'1 · Elige una materia',
      selectSubjectCopy:'Después verás solamente los temas disponibles de esa materia.',
      selectTopic:'2 · Elige un tema',
      selectTopicCopy:'Las clases del mismo contenido quedan agrupadas en un solo tema.',
      oneTopic:'1 tema',
      topics:'{count} temas',
      questionCount:'{count} preguntas',
      topKicker:'TOP 1 ESTA SEMANA',
      noLeader:'Todavía sin líder',
      beFirst:'Sé la primera persona en publicar un resultado.',
      myScore:'Tu score',
      noScore:'Sin resultado publicado',
      rankingLink:'Ver clasificación',
      publishKicker:'TU RESULTADO',
      publishTitle:'{score}/{total} respuestas correctas',
      publishCopy:'Puedes sumarlo al ranking semanal con tu apodo.',
      publishButton:'Sumar al ranking',
      publishing:'Publicando…',
      publishSuccess:'Resultado publicado.',
      publishKept:'Tu mejor resultado ya era igual o mejor.',
      nicknameNeeded:'Guarda un apodo antes de publicar.',
      publishError:'No se pudo publicar. Tu resultado sigue guardado en este dispositivo.',
      rankingAndChallenge:'CLASIFICACIÓN Y DESAFÍO',
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
      weekRange:'Del {start} al {end}',
      practiceCourse:'ENTRENAMIENTO DEL CURSO',
      practiceLesson:'ENTRENAMIENTO · {date}',
      practiceTitle:'Entrenamiento · {title}',
      qcm:'QCM',
      vf:'Verdadero / Falso',
      cases:'Casos clínicos',
      startPractice:'Comenzar entrenamiento',
      closePractice:'Cerrar entrenamiento',
      resetCourse:'Reiniciar curso',
      questionsDone:'{done}/{total} preguntas completadas',
      questionsTotal:'{total} preguntas para dominar este tema',
      correctAnswer:'Respuesta correcta',
      incorrectAnswer:'Respuesta a corregir',
      yourAnswer:'Tu respuesta: {answer}.',
      correctAnswerLabel:'Respuesta correcta: ',
      activeUnderstanding:'COMPRENSIÓN ACTIVA',
      clinicalApplication:'APLICACIÓN CLÍNICA',
      caseLabel:'CASO',
      answerOptions:'Opciones de respuesta',
      validateAnswer:'Validar mi respuesta',
      nextQuestion:'Pregunta siguiente →',
      blockDone:'{type} · BLOQUE TERMINADO',
      correctCount:'{score}/{total} respuestas correctas',
      goodResult:'Buen dominio. Revisa solo las explicaciones de tus errores.',
      repeatResult:'Repite el bloque después de revisar las explicaciones.',
      chooseFormat:'Elegir otro formato',
      hideFormats:'Ocultar formatos',
      repeatType:'Repetir {type}',
      finished:'terminado',
      continue:'continuar',
      resetConfirm:'¿Reiniciar todo el progreso de este tema?',
      verificationBase:'BASE DE VERIFICACIÓN',
      trainingType:'Tipo de entrenamiento'
    },
    br:{
      pageTitle:'Estudar · 4.º E | Med Nykuto',
      back:'Voltar para a turma',
      language:'Idioma',
      eyebrow:'4.º E · 4.º semestre',
      title:'Estude por matéria e tema.',
      intro:'Escolha o conteúdo visto em aula e treine com QCM, verdadeiro ou falso e casos clínicos.',
      studyKicker:'TREINO',
      selectSubject:'1 · Escolha uma matéria',
      selectSubjectCopy:'Depois você verá somente os temas disponíveis dessa matéria.',
      selectTopic:'2 · Escolha um tema',
      selectTopicCopy:'As aulas do mesmo conteúdo ficam agrupadas em um único tema.',
      oneTopic:'1 tema',
      topics:'{count} temas',
      questionCount:'{count} perguntas',
      topKicker:'TOP 1 NESTA SEMANA',
      noLeader:'Ainda sem líder',
      beFirst:'Seja a primeira pessoa a publicar um resultado.',
      myScore:'Seu score',
      noScore:'Nenhum resultado publicado',
      rankingLink:'Ver classificação',
      publishKicker:'SEU RESULTADO',
      publishTitle:'{score}/{total} respostas corretas',
      publishCopy:'Você pode somá-lo à classificação semanal com seu apelido.',
      publishButton:'Somar à classificação',
      publishing:'Publicando…',
      publishSuccess:'Resultado publicado.',
      publishKept:'Seu melhor resultado já era igual ou maior.',
      nicknameNeeded:'Salve um apelido antes de publicar.',
      publishError:'Não foi possível publicar. Seu resultado continua salvo neste dispositivo.',
      rankingAndChallenge:'CLASSIFICAÇÃO E DESAFIO',
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
      weekRange:'De {start} a {end}',
      practiceCourse:'TREINO DO CURSO',
      practiceLesson:'TREINO · {date}',
      practiceTitle:'Treino · {title}',
      qcm:'QCM',
      vf:'Verdadeiro / Falso',
      cases:'Casos clínicos',
      startPractice:'Começar treino',
      closePractice:'Fechar treino',
      resetCourse:'Reiniciar tema',
      questionsDone:'{done}/{total} perguntas concluídas',
      questionsTotal:'{total} perguntas para dominar este tema',
      correctAnswer:'Resposta correta',
      incorrectAnswer:'Resposta a corrigir',
      yourAnswer:'Sua resposta: {answer}.',
      correctAnswerLabel:'Resposta correta: ',
      activeUnderstanding:'COMPREENSÃO ATIVA',
      clinicalApplication:'APLICAÇÃO CLÍNICA',
      caseLabel:'CASO',
      answerOptions:'Alternativas de resposta',
      validateAnswer:'Validar minha resposta',
      nextQuestion:'Próxima pergunta →',
      blockDone:'{type} · BLOCO CONCLUÍDO',
      correctCount:'{score}/{total} respostas corretas',
      goodResult:'Bom domínio. Revise apenas as explicações dos seus erros.',
      repeatResult:'Repita o bloco depois de revisar as explicações.',
      chooseFormat:'Escolher outro formato',
      hideFormats:'Ocultar formatos',
      repeatType:'Repetir {type}',
      finished:'concluído',
      continue:'continuar',
      resetConfirm:'Reiniciar todo o progresso deste tema?',
      verificationBase:'BASE DE VERIFICAÇÃO',
      trainingType:'Tipo de treino'
    }
  };

  var practiceExact = {
    'Leyes de la alimentación':'Leis da alimentação',
    'Glucólisis y regulación':'Glicólise e regulação',
    'APS, sectorización y triage':'APS, setorização e triagem',
    'Dermatofitosis y tiñas':'Dermatofitoses e tinhas',
    'Hongos y agar Sabouraud':'Fungos e ágar Sabouraud',
    'Control nervioso y químico de la respiración':'Controle nervoso e químico da respiração',
    'Difusión y transporte de gases':'Difusão e transporte de gases',
    'Cantidad, calidad, armonía, adecuación, variedad y aplicación clínica.':'Quantidade, qualidade, harmonia, adequação, variedade e aplicação clínica.',
    'Atención primaria, integralidad, familia, territorio y prioridad asistencial.':'Atenção primária, integralidade, família, território e prioridade assistencial.',
    'Agentes, transmisión, localización, diagnóstico y razonamiento terapéutico.':'Agentes, transmissão, localização, diagnóstico e raciocínio terapêutico.',
    'Muestra, morfología fúngica, cultivo y bioseguridad de laboratorio.':'Amostra, morfologia fúngica, cultura e biossegurança laboratorial.',
    'Diez reacciones, balance energético, control y conexión con GLUT4.':'Dez reações, balanço energético, controle e ligação com GLUT4.',
    'Solo la clase del 13 de agosto: centros, sensores, efectores y respuesta clínica.':'Somente a aula de 13 de agosto: centros, sensores, efetores e resposta clínica.',
    'Solo la clase del 10 de agosto: Fick, barrera, V/Q, O₂, CO₂, Bohr y Haldane.':'Somente a aula de 10 de agosto: Fick, barreira, V/Q, O₂, CO₂, Bohr e Haldane.'
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

  window.MedNykutoClassI18n = {
    getLang:function(){ return lang; },
    getLocale:function(){ return lang === 'br' ? 'pt-BR' : 'es-PY'; },
    t:t,
    exact:practiceExact
  };

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

  function renderStudyScores(){
    var topName = document.getElementById('studyTopName');
    var topMeta = document.getElementById('studyTopMeta');
    var myValue = document.getElementById('studyMyScoreValue');
    var myMeta = document.getElementById('studyMyScoreMeta');
    if(!topName || !topMeta || !myValue || !myMeta) return;

    var ranking = state.data && Array.isArray(state.data.ranking) ? state.data.ranking : [];
    var leader = ranking[0] || null;
    var current = state.data && state.data.currentUser ? state.data.currentUser : null;

    topName.textContent = leader ? leader.nickname : t('noLeader');
    topMeta.textContent = leader
      ? formatNumber(leader.points) + ' ' + t('points') + ' · ' + t('accuracy',{value:leader.accuracy})
      : t('beFirst');
    myValue.textContent = current ? formatNumber(current.points) : '—';
    myMeta.textContent = current
      ? '#' + current.rank + ' · ' + t('accuracy',{value:current.accuracy})
      : t('noScore');
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
      renderStudyScores();
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
    renderStudyScores();
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

  function publishScore(result){
    return fetch(API_URL,{
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
        if(!response.ok){
          var error = new Error(data.code || 'request_failed');
          error.code = data.code || '';
          throw error;
        }
        loadData();
        return data;
      });
    });
  }

  window.MedNykutoCommunity = {
    getLanguage:function(){ return lang; },
    getProfile:function(){ return {playerId:profile.playerId,nickname:profile.nickname}; },
    publishScore:publishScore,
    refresh:loadData,
    t:t
  };

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
      if(window.MedNykutoCommunityStudy && typeof window.MedNykutoCommunityStudy.refreshLanguage === 'function'){
        window.MedNykutoCommunityStudy.refreshLanguage();
      }
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
      if(window.MedNykutoCommunityStudy && typeof window.MedNykutoCommunityStudy.profileChanged === 'function'){
        window.MedNykutoCommunityStudy.profileChanged();
      }
    });
    document.getElementById('communityRefresh').addEventListener('click',loadData);
    document.getElementById('communityRetry').addEventListener('click',loadData);
    applyLanguage();
    loadData();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
