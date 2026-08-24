(function(){
  'use strict';

  var PROFILE_KEY = 'medNykutoCommunityProfile:v1';
  var API_URL = '/api/community';
  var ACCESS_TOKEN_PATTERN = /^[0-9a-f]{64}$/i;
  var supported = ['es','br'];
  var state = {data:null,loading:false,error:'',refreshQueued:false,clockOffsetMs:0,countdownClosed:false,countdownReloaded:false};
  var countdownInterval = 0;

  var messages = {
    es:{
      pageTitle:'Estudiar · 4.º E | Med Nykuto',
      back:'Volver a la clase',
      language:'Idioma',
      navHome:'Inicio',
      navSchedule:'Horario',
      navTasks:'Tareas',
      navSubjects:'Materias',
      navPlan:'Plan',
      navStudy:'Estudiar',
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
      topKicker:'TOP 1 PROVISIONAL ESTA SEMANA',
      noLeader:'Todavía sin líder',
      beFirst:'Sé la primera persona en publicar un resultado.',
      myScore:'Tu score',
      noScore:'Sin resultado publicado',
      rankingLink:'Ver clasificación',
      publishKicker:'TU RESULTADO',
      publishTitle:'{score}/{total} respuestas correctas ya realizadas',
      publishCopy:'Un solo clic sincroniza juntos tus QCM, verdadero/falso y casos ya respondidos.',
      publishButton:'Sumar todo al ranking',
      publishing:'Publicando…',
      publishSuccess:'Todo tu progreso realizado fue sincronizado.',
      publishKept:'Tus mejores resultados ya eran iguales o mejores.',
      nicknameNeeded:'Guarda tu nombre completo y catraca completa antes de publicar.',
      identityExpired:'Vuelve a confirmar tu nombre completo, catraca completa y pertenencia al 4.º E para publicar.',
      publishError:'No se pudo publicar. Tu resultado sigue guardado en este dispositivo.',
      rankingAndChallenge:'CLASIFICACIÓN Y DESAFÍO',
      latestCourses:'NUEVAS TRANSCRIPCIONES',
      latestPhysiology:'Fisiología · Sensibilidades somáticas',
      latestMicrobiology:'Micro teórica · Micosis y casos',
      newTranscript:'Nueva transcripción · 24 ago.',
      updatedTranscript:'Transcripción actualizada · 24 ago.',
      challengeKicker:'DESAFÍO SEMANAL · SOLO 4.º E',
      challengeTitle:'1.000 respuestas correctas esta semana',
      challengeCopy:'Cada mejor resultado suma puntos. El primer lugar provisional recibe 50 R$ por Pix después de verificar identidad y resultado.',
      prizeAmount:'50 R$ vía Pix',
      prizeWinner:'Premio para el 1.er lugar verificado',
      prizeRule:'Exclusivo para estudiantes matriculados en el 4.º E.',
      correctAnswers:'respuestas correctas',
      people:'personas',
      records:'resultados',
      weekPending:'Semana actual',
      countdownKicker:'CIERRE EXACTO',
      countdownPending:'Domingo · 20:00 · hora de Paraguay',
      countdownLabel:'Domingo {date} · 20:00 · hora de Paraguay',
      countdownClosed:'Clasificación cerrada · ganador en verificación',
      countdownDays:'días',
      countdownHours:'horas',
      countdownMinutes:'min',
      countdownSeconds:'seg',
      publishClosed:'El desafío cerró el domingo a las 20:00. Este resultado queda guardado, pero ya no cambia la clasificación.',
      publishClosedButton:'Clasificación cerrada',
      rankingClosedTitle:'Clasificación final provisional',
      rankingClosedCopy:'El tiempo terminó. La clasificación está congelada mientras se verifican identidad y resultado del primer lugar.',
      rankingKicker:'CLASIFICACIÓN SEMANAL',
      rankingTitle:'Clasificación provisional',
      rankingCopy:'Se suma el mejor resultado por materia o módulo. Desempate: más aciertos, mayor precisión y primer registro.',
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
      profileTitle:'Confirma tu identidad del 4.º E',
      profileCopy:'La participación es facultativa. Para competir, confirma tu identidad y acepta la publicación de tus datos.',
      displayName:'Nombre completo',
      displayNamePlaceholder:'Ej.: Ana Oliveira',
      studentId:'Catraca UCP completa',
      studentIdPlaceholder:'Tu número completo de catraca',
      classAttestation:'Declaro que estoy matriculado/a en el 4.º E y que estos datos son míos.',
      identityConsent:'Participar es facultativo. Acepto que mi nombre completo y mi catraca completa sean públicos para cualquier persona que tenga el enlace. El Pix solo se entrega después de una verificación manual.',
      save:'Guardar y participar',
      invalidName:'Escribe tu nombre completo (2 palabras, entre 5 y 60 caracteres).',
      invalidStudentId:'Revisa el formato de tu catraca.',
      classConfirmationRequired:'Confirma que estás matriculado/a en el 4.º E.',
      consentRequired:'Acepta la publicación de tu nombre completo y catraca completa para participar.',
      profileSaving:'Verificando…',
      profileSaved:'Perfil guardado. Tu clasificación es provisional hasta la verificación manual.',
      profileMigration:'Tu nombre está prellenado. Vuelve a escribir la catraca completa y acepta las condiciones para asegurar este perfil.',
      profileError:'No se pudo guardar ahora. Tu perfil anterior no se modificó.',
      identityConflict:'Esta catraca ya está asociada a otro perfil, o este perfil usa otra catraca. Revisa los datos o pide ayuda en el Help Desk.',
      helpDesk:'Abrir Help Desk',
      privacy:'Aviso de datos públicos: si participas, tu nombre completo y tu catraca completa aparecerán en la clasificación compartida.',
      legacyIdentity:'Identificación pendiente · sin premio',
      verificationPending:'Verificación pendiente · clasificación provisional',
      verificationVerified:'Identidad verificada',
      howKicker:'CÓMO PARTICIPAR',
      howTitle:'Tres pasos, sin cuenta',
      step1Title:'1. Haz un QCM',
      step1Copy:'Abre una materia o un módulo y termina la serie.',
      step2Title:'2. Publica el resultado',
      step2Copy:'Confirma tu perfil y toca una sola vez “Sumar todo al ranking”.',
      step3Title:'3. Vuelve la semana siguiente',
      step3Copy:'El desafío se reinicia cada lunes, hora de Paraguay.',
      fairTitle:'Reglas del premio y protección de tus datos',
      fairCopy:'Participar es facultativo y publica el nombre completo y la catraca completa. La clasificación es provisional; el ganador debe confirmar que pertenece al 4.º E y su resultado antes del Pix. Ninguna actualización elimina las participaciones ya guardadas.',
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
      courseOnlyBase:'SOLO CONTENIDO DE LA CLASE',
      courseSource:'Ver la clase usada',
      practiceCourseOnlyDescription:'40 preguntas hechas únicamente con el contenido de esta clase.',
      trainingType:'Tipo de entrenamiento'
    },
    br:{
      pageTitle:'Estudar · 4.º E | Med Nykuto',
      back:'Voltar para a turma',
      language:'Idioma',
      navHome:'Início',
      navSchedule:'Horário',
      navTasks:'Tarefas',
      navSubjects:'Matérias',
      navPlan:'Plano',
      navStudy:'Estudar',
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
      topKicker:'TOP 1 PROVISÓRIO NESTA SEMANA',
      noLeader:'Ainda sem líder',
      beFirst:'Seja a primeira pessoa a publicar um resultado.',
      myScore:'Seu score',
      noScore:'Nenhum resultado publicado',
      rankingLink:'Ver classificação',
      publishKicker:'SEU RESULTADO',
      publishTitle:'{score}/{total} respostas corretas já realizadas',
      publishCopy:'Um único toque sincroniza juntos seus QCMs, verdadeiro/falso e casos já respondidos.',
      publishButton:'Somar tudo à classificação',
      publishing:'Publicando…',
      publishSuccess:'Todo o seu progresso realizado foi sincronizado.',
      publishKept:'Seus melhores resultados já eram iguais ou maiores.',
      nicknameNeeded:'Salve seu nome completo e sua catraca completa antes de publicar.',
      identityExpired:'Confirme novamente seu nome completo, catraca completa e vínculo com o 4.º E para publicar.',
      publishError:'Não foi possível publicar. Seu resultado continua salvo neste dispositivo.',
      rankingAndChallenge:'CLASSIFICAÇÃO E DESAFIO',
      latestCourses:'NOVAS TRANSCRIÇÕES',
      latestPhysiology:'Fisiologia · Sensibilidades somáticas',
      latestMicrobiology:'Micro teórica · Micoses e casos',
      newTranscript:'Nova transcrição · 24 ago.',
      updatedTranscript:'Transcrição atualizada · 24 ago.',
      challengeKicker:'DESAFIO SEMANAL · SÓ 4.º E',
      challengeTitle:'1.000 respostas corretas nesta semana',
      challengeCopy:'Cada melhor resultado soma pontos. O primeiro lugar provisório recebe R$ 50 por Pix após verificar identidade e resultado.',
      prizeAmount:'R$ 50 via Pix',
      prizeWinner:'Prêmio para o 1.º lugar verificado',
      prizeRule:'Exclusivo para estudantes matriculados no 4.º E.',
      correctAnswers:'respostas corretas',
      people:'pessoas',
      records:'resultados',
      weekPending:'Semana atual',
      countdownKicker:'ENCERRAMENTO EXATO',
      countdownPending:'Domingo · 20:00 · horário do Paraguai',
      countdownLabel:'Domingo {date} · 20:00 · horário do Paraguai',
      countdownClosed:'Classificação encerrada · vencedor em verificação',
      countdownDays:'dias',
      countdownHours:'horas',
      countdownMinutes:'min',
      countdownSeconds:'seg',
      publishClosed:'O desafio encerrou domingo às 20:00. Este resultado continua salvo, mas não altera mais a classificação.',
      publishClosedButton:'Classificação encerrada',
      rankingClosedTitle:'Classificação final provisória',
      rankingClosedCopy:'O tempo terminou. A classificação está congelada enquanto verificamos a identidade e o resultado do primeiro lugar.',
      rankingKicker:'CLASSIFICAÇÃO SEMANAL',
      rankingTitle:'Classificação provisória',
      rankingCopy:'Somamos o melhor resultado por matéria ou módulo. Desempate: mais acertos, maior precisão e primeiro registro.',
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
      profileTitle:'Confirme sua identidade do 4.º E',
      profileCopy:'A participação é facultativa. Para competir, confirme sua identidade e aceite a publicação dos seus dados.',
      displayName:'Nome completo',
      displayNamePlaceholder:'Ex.: Ana Oliveira',
      studentId:'Catraca UCP completa',
      studentIdPlaceholder:'Seu número completo de catraca',
      classAttestation:'Declaro que estou matriculado/a no 4.º E e que estes dados são meus.',
      identityConsent:'Participar é facultativo. Aceito que meu nome completo e minha catraca completa sejam públicos para qualquer pessoa que tenha o link. O Pix só é entregue após verificação manual.',
      save:'Salvar e participar',
      invalidName:'Digite seu nome completo (2 palavras, entre 5 e 60 caracteres).',
      invalidStudentId:'Confira o formato da sua catraca.',
      classConfirmationRequired:'Confirme que você está matriculado/a no 4.º E.',
      consentRequired:'Aceite a publicação do seu nome completo e da catraca completa para participar.',
      profileSaving:'Verificando…',
      profileSaved:'Perfil salvo. Sua classificação é provisória até a verificação manual.',
      profileMigration:'Seu nome foi preenchido. Digite novamente a catraca completa e aceite as condições para proteger este perfil.',
      profileError:'Não foi possível salvar agora. Seu perfil anterior não foi alterado.',
      identityConflict:'Esta catraca já está vinculada a outro perfil, ou este perfil usa outra catraca. Confira os dados ou peça ajuda no Help Desk.',
      helpDesk:'Abrir Help Desk',
      privacy:'Aviso de dados públicos: ao participar, seu nome completo e sua catraca completa aparecem na classificação compartilhada.',
      legacyIdentity:'Identificação pendente · sem prêmio',
      verificationPending:'Verificação pendente · classificação provisória',
      verificationVerified:'Identidade verificada',
      howKicker:'COMO PARTICIPAR',
      howTitle:'Três passos, sem conta',
      step1Title:'1. Faça um QCM',
      step1Copy:'Abra uma matéria ou um módulo e termine a série.',
      step2Title:'2. Publique o resultado',
      step2Copy:'Confirme seu perfil e toque uma única vez em “Somar tudo à classificação”.',
      step3Title:'3. Volte na semana seguinte',
      step3Copy:'O desafio recomeça toda segunda-feira, no horário do Paraguai.',
      fairTitle:'Regras do prêmio e proteção dos seus dados',
      fairCopy:'Participar é facultativo e publica o nome completo e a catraca completa. A classificação é provisória; o vencedor confirma que pertence ao 4.º E e o resultado antes do Pix. Nenhuma atualização apaga participações já salvas.',
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
      courseOnlyBase:'SÓ CONTEÚDO DA AULA',
      courseSource:'Ver a aula usada',
      practiceCourseOnlyDescription:'40 perguntas feitas somente com o conteúdo desta aula.',
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

  function createAccessToken(){
    if(!window.crypto || typeof window.crypto.getRandomValues !== 'function') return '';
    var bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes,function(value){ return value.toString(16).padStart(2,'0'); }).join('');
  }

  function readProfile(){
    var profile = {};
    try{ profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; }catch(error){}
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profile.playerId || '')) profile.playerId = createPlayerId();
    profile.fullName = String(profile.fullName || profile.displayName || profile.nickname || '').normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,60);
    profile.displayName = profile.fullName;
    profile.catraca = canonicalCatraca(profile.catraca || profile.studentId || '');
    profile.studentIdMasked = String(profile.studentIdMasked || '').slice(0,20);
    profile.accessToken = ACCESS_TOKEN_PATTERN.test(String(profile.accessToken || '')) ? profile.accessToken : '';
    if(!profile.accessToken && ACCESS_TOKEN_PATTERN.test(String(profile.pendingAccessToken || ''))) profile.pendingAccessToken = String(profile.pendingAccessToken);
    else delete profile.pendingAccessToken;
    profile.classConfirmed = profile.classConfirmed === true && Boolean(profile.catraca);
    delete profile.nickname;
    delete profile.studentId;
    saveProfile(profile);
    return profile;
  }

  function saveProfile(profile){
    try{ localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); return true; }catch(error){ return false; }
  }

  function validDisplayName(value){
    if(value.length < 5 || value.length > 60) return false;
    var parts = value.split(' ');
    return parts.length >= 2 && parts.every(function(part){
      return /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u.test(part);
    });
  }

  function canonicalCatraca(value){
    return String(value || '').normalize('NFKC').toUpperCase().replace(/[\s._-]+/g,'');
  }

  function validStudentId(value){
    return /^[A-Z0-9]{4,24}$/.test(canonicalCatraca(value));
  }

  function profileReady(value){
    return Boolean(value && validDisplayName(value.fullName || value.displayName || '') && validStudentId(value.catraca) && value.classConfirmed === true && value.accessToken);
  }

  function participantName(value){
    return String(value && (value.fullName || value.displayName || value.nickname) || '').trim();
  }

  function participantCatraca(value){
    return String(value && (value.catraca || value.studentId) || '').trim();
  }

  function isLegacyEntry(value){
    return !value || value.verificationStatus === 'legacy' || value.identityComplete === false || !participantCatraca(value);
  }

  function isProvisionalLeaderCandidate(value){
    return !isLegacyEntry(value);
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
    renderCountdown();
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

  function countdownDeadline(){
    var value = state.data && state.data.week && Date.parse(state.data.week.closesAt || '');
    return Number.isFinite(value) ? value : 0;
  }

  function challengeIsClosed(){
    if(state.data && state.data.week && state.data.week.closed === true) return true;
    var deadline = countdownDeadline();
    return Boolean(deadline && Date.now() + state.clockOffsetMs >= deadline);
  }

  function countdownOpenLabel(){
    var end = state.data && state.data.week && state.data.week.end;
    return end ? t('countdownLabel',{date:formatDate(end)}) : t('countdownPending');
  }

  function renderCountdown(){
    var root = document.getElementById('challengeCountdown');
    if(!root) return;
    var deadline = countdownDeadline();
    var values = ['Days','Hours','Minutes','Seconds'];
    if(!deadline){
      root.dataset.state = 'loading';
      values.forEach(function(unit){ document.getElementById('challengeCountdown' + unit).textContent = '--'; });
      document.getElementById('challengeCountdownLabel').textContent = countdownOpenLabel();
      root.setAttribute('aria-label',countdownOpenLabel());
      return;
    }
    var remaining = Math.max(0,deadline - (Date.now() + state.clockOffsetMs));
    var closed = challengeIsClosed();
    var totalSeconds = closed ? 0 : Math.max(0,Math.ceil(remaining / 1000));
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    document.getElementById('challengeCountdownDays').textContent = String(days).padStart(2,'0');
    document.getElementById('challengeCountdownHours').textContent = String(hours).padStart(2,'0');
    document.getElementById('challengeCountdownMinutes').textContent = String(minutes).padStart(2,'0');
    document.getElementById('challengeCountdownSeconds').textContent = String(seconds).padStart(2,'0');
    root.dataset.state = closed ? 'closed' : remaining <= 3600000 ? 'urgent' : 'open';
    document.getElementById('challengeCountdownLabel').textContent = closed ? t('countdownClosed') : countdownOpenLabel();
    root.setAttribute('aria-label',closed
      ? t('countdownClosed')
      : countdownOpenLabel() + ' · ' + days + ' ' + t('countdownDays') + ', ' + hours + ' ' + t('countdownHours') + ', ' + minutes + ' ' + t('countdownMinutes') + ', ' + seconds + ' ' + t('countdownSeconds'));
    if(state.countdownClosed !== closed){
      state.countdownClosed = closed;
      if(window.MedNykutoCommunityStudy && typeof window.MedNykutoCommunityStudy.challengeStateChanged === 'function'){
        window.MedNykutoCommunityStudy.challengeStateChanged();
      }
    }
    if(closed && state.data && state.data.week && state.data.week.closed !== true && !state.countdownReloaded){
      state.countdownReloaded = true;
      loadData();
    }
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
      nameLine.appendChild(element('strong','ranking-name',participantName(entry) || t('legacyIdentity')));
      if(entry.isCurrent) nameLine.appendChild(element('span','ranking-you',t('you')));
      identity.appendChild(nameLine);
      var scopeText = Number(entry.challenges) === 1 ? t('oneScope') : t('scopes',{count:entry.challenges});
      var completeCatraca = participantCatraca(entry);
      var identityText = completeCatraca || '—';
      var identityMeta = element('small','ranking-catraca',identityText);
      if(completeCatraca) identityMeta.setAttribute('aria-label',(lang === 'br' ? 'Catraca completa: ' : 'Catraca completa: ') + completeCatraca);
      identity.appendChild(identityMeta);
      var verificationKey = isLegacyEntry(entry) ? 'legacyIdentity' : entry.verificationStatus === 'verified' ? 'verificationVerified' : 'verificationPending';
      identity.appendChild(element('small','ranking-verification ' + (isLegacyEntry(entry) ? 'is-legacy' : entry.verificationStatus === 'verified' ? 'is-verified' : 'is-pending'),t(verificationKey)));
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
    var leader = ranking.find(isProvisionalLeaderCandidate) || null;
    var current = state.data && state.data.currentUser ? state.data.currentUser : null;

    topName.textContent = leader ? participantName(leader) : t('noLeader');
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
    document.getElementById('rankingTitle').textContent = t(data.week && data.week.closed ? 'rankingClosedTitle' : 'rankingTitle');
    document.querySelector('.ranking-explanation').textContent = t(data.week && data.week.closed ? 'rankingClosedCopy' : 'rankingCopy');
    renderCountdown();
    renderRanking(data.ranking || []);
    renderStudyScores();
  }

  function loadData(){
    if(state.loading){
      state.refreshQueued = true;
      return;
    }
    state.loading = true;
    state.refreshQueued = false;
    state.error = '';
    renderData();
    fetch(
      API_URL + '?class=s4-e&player=' + encodeURIComponent(profile.playerId),
      {credentials:'same-origin'}
    )
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
      .then(function(data){
        state.data = data;
        var serverTimestamp = Date.parse(data.generatedAt || '');
        if(Number.isFinite(serverTimestamp)) state.clockOffsetMs = serverTimestamp - Date.now();
        state.countdownReloaded = Boolean(data.week && data.week.closed);
      })
      .catch(function(error){
        state.data = null;
        state.error = error.code === 'not_configured' ? 'activating' : 'unavailable';
      })
      .finally(function(){
        state.loading = false;
        renderData();
        if(state.refreshQueued){
          state.refreshQueued = false;
          loadData();
        }
      });
  }

  function postScore(result){
    if(!profileReady(profile)){
      var identityError = new Error('identity_required');
      identityError.code = 'identity_required';
      return Promise.reject(identityError);
    }
    if(challengeIsClosed()){
      var closedError = new Error('challenge_closed');
      closedError.code = 'challenge_closed';
      return Promise.reject(closedError);
    }
    return fetch(API_URL,{
      method:'POST',
      credentials:'same-origin',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({
        action:'score',
        class:'s4-e',
        playerId:profile.playerId,
        accessToken:profile.accessToken,
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
        return data;
      });
    });
  }

  function publishScore(result){
    return postScore(result).then(function(data){
      loadData();
      return data;
    });
  }

  function publishScores(results){
    var scores = Array.isArray(results) ? results.filter(function(result){return result && Number(result.total) > 0;}) : [];
    if(!scores.length) return publishScore(results && results[0] ? results[0] : {});
    return Promise.all(scores.map(postScore)).then(function(responses){
      loadData();
      return {
        ok:true,
        saved:responses.some(function(data){return data && data.saved !== false;}),
        results:responses
      };
    }).catch(function(error){
      loadData();
      throw error;
    });
  }

  window.MedNykutoCommunity = {
    getLanguage:function(){ return lang; },
    getProfile:function(){
      return {
        playerId:profile.playerId,
        fullName:profile.fullName,
        displayName:profile.fullName,
        catraca:profile.catraca,
        studentId:profile.catraca,
        studentIdMasked:profile.studentIdMasked,
        classConfirmed:profile.classConfirmed,
        accessToken:profile.accessToken
      };
    },
    isProfileReady:function(value){ return profileReady(value || profile); },
    isChallengeClosed:challengeIsClosed,
    publishScore:publishScore,
    publishScores:publishScores,
    refresh:loadData,
    t:t
  };

  function init(){
    var languageSelect = document.getElementById('communityLanguage');
    var nameInput = document.getElementById('communityDisplayName');
    var studentIdInput = document.getElementById('communityStudentId');
    var classConfirmedInput = document.getElementById('communityClassConfirmed');
    var consentInput = document.getElementById('communityIdentityConsent');
    var profileForm = document.getElementById('communityProfileForm');
    var profileStatus = document.getElementById('communityProfileStatus');
    var profileButton = profileForm.querySelector('button[type="submit"]');

    function renderProfileStatus(){
      if(profileReady(profile)){
        profileStatus.dataset.state = 'success';
        profileStatus.textContent = t('profileSaved') + ' ' + profile.catraca;
      }else if(profile.fullName && (profile.studentIdMasked || profile.accessToken)){
        profileStatus.dataset.state = '';
        profileStatus.textContent = t('profileMigration');
      }
    }

    nameInput.value = profile.fullName;
    studentIdInput.value = profile.catraca;
    classConfirmedInput.checked = profile.classConfirmed;
    if(profile.studentIdMasked && !profile.catraca){
      studentIdInput.placeholder = t('studentIdPlaceholder') + ' (' + profile.studentIdMasked + ')';
    }
    if(profileReady(profile)){
      profileStatus.dataset.state = 'success';
      profileStatus.textContent = t('profileSaved') + ' ' + profile.catraca;
    }else{
      renderProfileStatus();
    }
    languageSelect.addEventListener('change',function(){
      lang = supported.indexOf(languageSelect.value) !== -1 ? languageSelect.value : 'es';
      try{ localStorage.setItem('medLang',lang); }catch(error){}
      applyLanguage();
      renderProfileStatus();
      if(window.MedNykutoCommunityStudy && typeof window.MedNykutoCommunityStudy.refreshLanguage === 'function'){
        window.MedNykutoCommunityStudy.refreshLanguage();
      }
    });
    profileForm.addEventListener('submit',function(event){
      event.preventDefault();
      var displayName = nameInput.value.normalize('NFKC').replace(/\s+/g,' ').trim();
      var studentId = canonicalCatraca(studentIdInput.value);
      if(!validDisplayName(displayName)){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('invalidName');
        nameInput.focus();
        return;
      }
      if(!validStudentId(studentId)){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('invalidStudentId');
        studentIdInput.focus();
        return;
      }
      if(!classConfirmedInput.checked){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('classConfirmationRequired');
        classConfirmedInput.focus();
        return;
      }
      if(!consentInput.checked){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('consentRequired');
        consentInput.focus();
        return;
      }
      var enrollmentToken = profile.accessToken || profile.pendingAccessToken || createAccessToken();
      if(!ACCESS_TOKEN_PATTERN.test(enrollmentToken)){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = t('profileError');
        return;
      }
      if(!profile.accessToken){
        profile.pendingAccessToken = enrollmentToken;
        if(!saveProfile(profile)){
          profileStatus.dataset.state = 'error';
          profileStatus.textContent = t('profileError');
          return;
        }
      }
      profileButton.disabled = true;
      profileButton.textContent = t('profileSaving');
      profileStatus.dataset.state = '';
      profileStatus.textContent = '';
      fetch(API_URL,{
        method:'POST',
        credentials:'same-origin',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          action:'enroll',
          class:'s4-e',
          playerId:profile.playerId,
          accessToken:enrollmentToken,
          fullName:displayName,
          displayName:displayName,
          catraca:studentId,
          studentId:studentId,
          classConfirmed:true,
          consent:true
        })
      }).then(function(response){
        return response.json().catch(function(){ return {}; }).then(function(data){
          if(!response.ok){ var error = new Error(data.code || 'request_failed'); error.code = data.code || ''; throw error; }
          return data;
        });
      }).then(function(data){
        var participant = data.participant || data.profile || {};
        var savedName = String(participant.fullName || participant.displayName || data.fullName || data.displayName || displayName).normalize('NFKC').replace(/\s+/g,' ').trim();
        var savedCatraca = canonicalCatraca(participant.catraca || participant.studentId || data.catraca || data.studentId || studentId);
        var savedToken = String(data.accessToken || participant.accessToken || enrollmentToken || '');
        if(!validDisplayName(savedName) || !validStudentId(savedCatraca) || !ACCESS_TOKEN_PATTERN.test(savedToken)){
          var responseError = new Error('invalid_response');
          responseError.code = 'invalid_response';
          throw responseError;
        }
        profile.fullName = savedName;
        profile.displayName = savedName;
        profile.catraca = savedCatraca;
        profile.studentIdMasked = String(participant.studentIdMasked || data.studentIdMasked || '');
        profile.classConfirmed = participant.classConfirmed !== false;
        profile.accessToken = savedToken;
        delete profile.pendingAccessToken;
        saveProfile(profile);
        nameInput.value = profile.fullName;
        studentIdInput.value = profile.catraca;
        classConfirmedInput.checked = true;
        consentInput.checked = true;
        profileStatus.dataset.state = 'success';
        profileStatus.textContent = t('profileSaved') + ' ' + profile.catraca;
        loadData();
        if(window.MedNykutoCommunityStudy && typeof window.MedNykutoCommunityStudy.profileChanged === 'function') window.MedNykutoCommunityStudy.profileChanged();
      }).catch(function(error){
        profileStatus.dataset.state = 'error';
        profileStatus.textContent = error.code === 'invalid_name'
          ? t('invalidName')
          : error.code === 'invalid_student_id'
          ? t('invalidStudentId')
          : error.code === 'class_confirmation_required'
            ? t('classConfirmationRequired')
            : error.code === 'consent_required'
              ? t('consentRequired')
              : error.code === 'identity_conflict'
                ? t('identityConflict') + ' '
                : t('profileError');
        if(error.code === 'identity_conflict'){
          var helpLink = element('a','community-profile-help-link',t('helpDesk'));
          helpLink.href = 'contact.html?reason=challenge-identity&class=s4-e&from=' + encodeURIComponent(location.pathname + location.hash);
          profileStatus.appendChild(helpLink);
        }
      }).finally(function(){
        profileButton.disabled = false;
        profileButton.textContent = t('save');
      });
    });
    document.getElementById('communityRefresh').addEventListener('click',loadData);
    document.getElementById('communityRetry').addEventListener('click',loadData);
    applyLanguage();
    loadData();
    if(countdownInterval) window.clearInterval(countdownInterval);
    countdownInterval = window.setInterval(renderCountdown,1000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
