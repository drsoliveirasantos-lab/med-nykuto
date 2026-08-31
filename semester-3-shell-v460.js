/* v460 — Shared Semester 3 navigation shell and homepage translations. */
(function(){
  'use strict';

  if(window.__MED_NYKUTO_S3_SHELL__) return;
  window.__MED_NYKUTO_S3_SHELL__ = 'v460';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var semesterPages = /^(index|matieres|matiere|modules|module|qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(page);
  if(!semesterPages) return;

  var storedSemester = '';
  try{ storedSemester = localStorage.getItem('medNykuto:studentSemester') || ''; }catch(error){}
  if(page !== 'index.html' && storedSemester && storedSemester !== 's3') return;

  var COPY = {
    es:{
      semesterScope:'3.º semestre', studyNav:'Estudiar', available:'Contenido disponible', journey:'Tu recorrido', changeSemester:'Cambiar', kicker:'MED NYKUTO · 3.º SEMESTRE', title:'Todo tu tercer semestre, en un solo lugar.', lead:'Abre una materia, retoma el último módulo y entrena exactamente el formato que necesitas.', chooseSubject:'Elegir una materia', trainNow:'Entrenar ahora', subjects:'materias activas', modules:'módulos completos', progress:'progreso guardado', activeStudy:'ESTUDIO ACTIVO', focusTitle:'Revisa y comprueba lo que realmente dominas.', focusText:'Cada módulo reúne curso completo, ficha rápida, ultra-resumen y entrenamiento.', quickQcm:'QCM rápido', quickQcmDetail:'Preguntas por materia o módulo', clinicalCases:'Casos clínicos', clinicalDetail:'Aplicación y razonamiento', reviewErrors:'Revisar errores', errorsDetail:'Volver a lo que todavía bloquea', subjectsKicker:'BIBLIOTECA DEL SEMESTRE', subjectsTitle:'Cinco materias, 59 módulos completos.', subjectsLead:'Elige una materia para ver sus capítulos y continuar desde tu avance.', reset:'Reiniciar progreso', studyKicker:'ESTUDIAR', studyTitle:'Elige cómo quieres entrenar.', studyLead:'Entra directamente al formato útil para tu objetivo de hoy.', qcmTitle:'Preguntas de opción múltiple', qcmText:'Entrenamiento rápido con corrección inmediata.', vfTitle:'Verdadero o falso', vfText:'Detecta formulaciones incorrectas y trampas frecuentes.', casesTitle:'Casos clínicos', casesText:'Aplica el mecanismo a una situación de examen.', mistakesTitle:'Mis errores', mistakesText:'Repasa prioritariamente lo que todavía no dominas.', examTitle:'Examen blanco', examText:'Simula una sesión mixta de 40 preguntas.', planKicker:'TU PLAN', planTitle:'Continúa exactamente donde lo dejaste.', sheetKicker:'CENTRO DE ENTRENAMIENTO', sheetTitle:'¿Cómo quieres estudiar?', sheetQcm:'QCM', sheetQcmText:'Opción múltiple', sheetVf:'Verdadero/Falso', sheetVfText:'Enunciados y trampas', sheetCases:'Casos clínicos', sheetCasesText:'Aplicación médica', sheetErrors:'Mis errores', sheetErrorsText:'Revisión prioritaria', sheetExam:'Examen blanco', sheetExamText:'40 preguntas mixtas', close:'Cerrar', home:'Inicio', subjectsNav:'Materias', errorsNav:'Errores', examNav:'Examen'
    },
    fr:{
      semesterScope:'3e semestre', studyNav:'Étudier', available:'Contenu disponible', journey:'Ton parcours', changeSemester:'Changer', kicker:'MED NYKUTO · 3E SEMESTRE', title:'Tout ton troisième semestre, au même endroit.', lead:'Ouvre une matière, reprends le dernier module et entraîne exactement le format dont tu as besoin.', chooseSubject:'Choisir une matière', trainNow:'S’entraîner', subjects:'matières actives', modules:'modules complets', progress:'progression enregistrée', activeStudy:'ÉTUDE ACTIVE', focusTitle:'Révise et vérifie ce que tu maîtrises vraiment.', focusText:'Chaque module réunit cours complet, fiche rapide, ultra-résumé et entraînement.', quickQcm:'QCM rapide', quickQcmDetail:'Questions par matière ou module', clinicalCases:'Cas cliniques', clinicalDetail:'Application et raisonnement', reviewErrors:'Revoir les erreurs', errorsDetail:'Reprendre ce qui bloque encore', subjectsKicker:'BIBLIOTHÈQUE DU SEMESTRE', subjectsTitle:'Cinq matières, 59 modules complets.', subjectsLead:'Choisis une matière pour voir ses chapitres et poursuivre ta progression.', reset:'Réinitialiser', studyKicker:'ÉTUDIER', studyTitle:'Choisis comment tu veux t’entraîner.', studyLead:'Accède directement au format utile pour ton objectif du jour.', qcmTitle:'Questions à choix multiple', qcmText:'Entraînement rapide avec correction immédiate.', vfTitle:'Vrai ou faux', vfText:'Repère les formulations fausses et les pièges fréquents.', casesTitle:'Cas cliniques', casesText:'Applique le mécanisme à une situation d’examen.', mistakesTitle:'Mes erreurs', mistakesText:'Révise en priorité ce que tu ne maîtrises pas encore.', examTitle:'Examen blanc', examText:'Simule une session mixte de 40 questions.', planKicker:'TON PLAN', planTitle:'Reprends exactement où tu t’es arrêté.', sheetKicker:'CENTRE D’ENTRAÎNEMENT', sheetTitle:'Comment veux-tu étudier ?', sheetQcm:'QCM', sheetQcmText:'Choix multiple', sheetVf:'Vrai/Faux', sheetVfText:'Énoncés et pièges', sheetCases:'Cas cliniques', sheetCasesText:'Application médicale', sheetErrors:'Mes erreurs', sheetErrorsText:'Révision prioritaire', sheetExam:'Examen blanc', sheetExamText:'40 questions mixtes', close:'Fermer', home:'Accueil', subjectsNav:'Matières', errorsNav:'Erreurs', examNav:'Examen'
    },
    br:{
      semesterScope:'3.º semestre', studyNav:'Estudar', available:'Conteúdo disponível', journey:'Seu percurso', changeSemester:'Mudar', kicker:'MED NYKUTO · 3.º SEMESTRE', title:'Todo o terceiro semestre em um só lugar.', lead:'Abra uma matéria, retome o último módulo e treine exatamente o formato de que precisa.', chooseSubject:'Escolher uma matéria', trainNow:'Treinar agora', subjects:'matérias ativas', modules:'módulos completos', progress:'progresso salvo', activeStudy:'ESTUDO ATIVO', focusTitle:'Revise e comprove o que você realmente domina.', focusText:'Cada módulo reúne curso completo, ficha rápida, ultra-resumo e treinamento.', quickQcm:'QCM rápido', quickQcmDetail:'Perguntas por matéria ou módulo', clinicalCases:'Casos clínicos', clinicalDetail:'Aplicação e raciocínio', reviewErrors:'Revisar erros', errorsDetail:'Voltar ao que ainda trava', subjectsKicker:'BIBLIOTECA DO SEMESTRE', subjectsTitle:'Cinco matérias, 59 módulos completos.', subjectsLead:'Escolha uma matéria para ver os capítulos e continuar do seu progresso.', reset:'Reiniciar progresso', studyKicker:'ESTUDAR', studyTitle:'Escolha como quer treinar.', studyLead:'Entre diretamente no formato útil para o objetivo de hoje.', qcmTitle:'Questões de múltipla escolha', qcmText:'Treino rápido com correção imediata.', vfTitle:'Verdadeiro ou falso', vfText:'Identifique formulações erradas e pegadinhas frequentes.', casesTitle:'Casos clínicos', casesText:'Aplique o mecanismo a uma situação de prova.', mistakesTitle:'Meus erros', mistakesText:'Revise primeiro o que você ainda não domina.', examTitle:'Simulado', examText:'Simule uma sessão mista de 40 perguntas.', planKicker:'SEU PLANO', planTitle:'Continue exatamente de onde parou.', sheetKicker:'CENTRO DE TREINAMENTO', sheetTitle:'Como você quer estudar?', sheetQcm:'QCM', sheetQcmText:'Múltipla escolha', sheetVf:'Verdadeiro/Falso', sheetVfText:'Enunciados e pegadinhas', sheetCases:'Casos clínicos', sheetCasesText:'Aplicação médica', sheetErrors:'Meus erros', sheetErrorsText:'Revisão prioritária', sheetExam:'Simulado', sheetExamText:'40 questões mistas', close:'Fechar', home:'Início', subjectsNav:'Matérias', errorsNav:'Erros', examNav:'Simulado'
    }
  };

  var SEMESTER_COPY = {
    es:{
      personalize:'Personaliza tu inicio', question:'¿Cuál es tu semestre?', lead:'Elige tu nivel actual. Podrás cambiarlo en cualquier momento.', semester3:'Semestre 3', semester4:'Semestre 4', semester5:'Semestre 5', periodS3:'Disponible ahora', periodS4:'Agosto–diciembre de 2026', periodS5:'A partir de febrero de 2027', statusAvailable:'Disponible', statusBuilding:'En curso', statusPlanned:'Próximamente', note:'Med Nykuto evoluciona al ritmo del curso de medicina. El contenido del semestre actual se publica progresivamente según las clases y las evaluaciones.', s5Note:'El semestre 5 estará disponible a partir de febrero de 2027. Puedes seguir usando el semestre 3 o abrir el espacio activo del semestre 4.', selected3:'Semestre 3 seleccionado', detail3:'Contenido disponible ahora · puedes conservarlo para revisar los prerrequisitos.', cardLabel:'Semestre de estudio', close:'Cerrar'
    },
    fr:{
      personalize:'Personnalise ton accueil', question:'Quel est ton semestre ?', lead:'Choisis ton niveau actuel. Tu pourras le modifier à tout moment.', semester3:'3e semestre', semester4:'4e semestre', semester5:'5e semestre', periodS3:'Disponible maintenant', periodS4:'Août–décembre 2026', periodS5:'À partir de février 2027', statusAvailable:'Disponible', statusBuilding:'En cours', statusPlanned:'Bientôt', note:'Med Nykuto évolue au rythme des études de médecine. Le contenu du semestre en cours est publié progressivement selon les cours et les évaluations.', s5Note:'Le 5e semestre sera disponible à partir de février 2027. Tu peux continuer à utiliser le 3e semestre ou ouvrir l’espace actif du 4e.', selected3:'3e semestre sélectionné', detail3:'Contenu disponible maintenant · conserve-le pour revoir les prérequis.', cardLabel:'Semestre d’étude', close:'Fermer'
    },
    br:{
      personalize:'Personalize seu início', question:'Qual é o seu semestre?', lead:'Escolha seu nível atual. Você poderá alterá-lo a qualquer momento.', semester3:'3.º semestre', semester4:'4.º semestre', semester5:'5.º semestre', periodS3:'Disponível agora', periodS4:'Agosto–dezembro de 2026', periodS5:'A partir de fevereiro de 2027', statusAvailable:'Disponível', statusBuilding:'Em andamento', statusPlanned:'Em breve', note:'O Med Nykuto evolui no ritmo do curso de medicina. O conteúdo do semestre atual é publicado progressivamente conforme as aulas e avaliações.', s5Note:'O 5.º semestre estará disponível a partir de fevereiro de 2027. Você pode continuar usando o 3.º semestre ou abrir o espaço ativo do 4.º.', selected3:'3.º semestre selecionado', detail3:'Conteúdo disponível agora · você pode mantê-lo para revisar os pré-requisitos.', cardLabel:'Semestre de estudo', close:'Fechar'
    }
  };

  function language(){
    var raw = (document.body && document.body.dataset.lang) || '';
    try{ raw = raw || localStorage.getItem('medLang') || ''; }catch(error){}
    raw = String(raw || document.documentElement.lang || 'es').toLowerCase();
    if(raw.indexOf('fr') === 0) return 'fr';
    if(raw.indexOf('br') === 0 || raw.indexOf('pt') === 0) return 'br';
    return 'es';
  }

  function copy(){ return COPY[language()] || COPY.es; }

  function createHeaderScope(){
    var nav = document.querySelector('.nav-shell');
    if(!nav || document.getElementById('s3HeaderScope')) return;
    var scope = document.createElement('a');
    scope.id = 's3HeaderScope';
    scope.className = 's3-header-scope';
    scope.href = 'index.html?cambiar-semestre=1';
    scope.dataset.s3Copy = 'semesterScope';
    scope.setAttribute('aria-label', 'Cambiar semestre');
    var toggle = nav.querySelector('.menu-toggle');
    nav.insertBefore(scope, toggle || nav.querySelector('#navLinks') || null);
  }

  function simplifyHeaderNavigation(){
    var nav = document.getElementById('navLinks') || document.querySelector('.nav-links');
    if(!nav) return;
    ['qcm.html','cas-cliniques.html','vrai-faux.html','erreurs.html','examen.html'].forEach(function(href){
      nav.querySelectorAll('a[href="' + href + '"]').forEach(function(link){
        link.dataset.s3HeaderHidden = '1';
        link.setAttribute('aria-hidden','true');
        link.setAttribute('tabindex','-1');
        link.style.setProperty('display','none','important');
      });
    });
    if(!nav.querySelector('[data-s3-study-open]')){
      var study = document.createElement('button');
      study.type = 'button';
      study.className = 's3-nav-study';
      study.dataset.s3StudyOpen = '1';
      study.dataset.s3Copy = 'studyNav';
      var contact = nav.querySelector('a[href="contact.html"]');
      nav.insertBefore(study, contact || null);
    }
  }

  function activeSection(){
    if(/^(matieres|matiere|modules|module)\.html$/.test(page)) return 'subjects';
    if(/^(qcm|cas-cliniques|vrai-faux)\.html$/.test(page)) return 'study';
    if(page === 'erreurs.html') return 'errors';
    if(page === 'examen.html') return 'exam';
    return 'home';
  }

  function createBottomNavigation(){
    if(document.getElementById('s3BottomNav')) return;
    var current = activeSection();
    var nav = document.createElement('nav');
    nav.id = 's3BottomNav';
    nav.className = 's3-bottom-nav';
    nav.setAttribute('aria-label','Navegación del tercer semestre');
    nav.innerHTML = [
      '<a href="index.html" data-s3-nav="home"' + (current === 'home' ? ' aria-current="page"' : '') + '><span class="s3-bottom-icon">INI</span><span data-s3-copy="home">Inicio</span></a>',
      '<a href="matieres.html" data-s3-nav="subjects"' + (current === 'subjects' ? ' aria-current="page"' : '') + '><span class="s3-bottom-icon">MAT</span><span data-s3-copy="subjectsNav">Materias</span></a>',
      '<button class="s3-bottom-study" type="button" data-s3-study-open="1"' + (current === 'study' ? ' aria-current="page"' : '') + '><span class="s3-bottom-icon">+</span><span data-s3-copy="studyNav">Estudiar</span></button>',
      '<a href="erreurs.html" data-s3-nav="errors"' + (current === 'errors' ? ' aria-current="page"' : '') + '><span class="s3-bottom-icon">ERR</span><span data-s3-copy="errorsNav">Errores</span></a>',
      '<a href="examen.html" data-s3-nav="exam"' + (current === 'exam' ? ' aria-current="page"' : '') + '><span class="s3-bottom-icon">EXA</span><span data-s3-copy="examNav">Examen</span></a>'
    ].join('');
    document.body.appendChild(nav);
  }

  function createStudySheet(){
    if(document.getElementById('s3StudySheet')) return;
    var sheet = document.createElement('div');
    sheet.id = 's3StudySheet';
    sheet.className = 's3-study-sheet';
    sheet.setAttribute('aria-hidden','true');
    sheet.innerHTML = '<section class="s3-study-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="s3StudySheetTitle">' +
      '<div class="s3-study-sheet-head"><div><small data-s3-copy="sheetKicker">CENTRO DE ENTRENAMIENTO</small><h2 id="s3StudySheetTitle" data-s3-copy="sheetTitle">¿Cómo quieres estudiar?</h2></div><button class="s3-study-sheet-close" type="button" data-s3-study-close aria-label="Cerrar">×</button></div>' +
      '<div class="s3-study-sheet-grid">' +
      '<a href="qcm.html"><span class="s3-mode-code">QCM</span><span><strong data-s3-copy="sheetQcm">QCM</strong><small data-s3-copy="sheetQcmText">Opción múltiple</small></span></a>' +
      '<a href="vrai-faux.html"><span class="s3-mode-code">V/F</span><span><strong data-s3-copy="sheetVf">Verdadero/Falso</strong><small data-s3-copy="sheetVfText">Enunciados y trampas</small></span></a>' +
      '<a href="cas-cliniques.html"><span class="s3-mode-code">CAS</span><span><strong data-s3-copy="sheetCases">Casos clínicos</strong><small data-s3-copy="sheetCasesText">Aplicación médica</small></span></a>' +
      '<a href="erreurs.html"><span class="s3-mode-code">ERR</span><span><strong data-s3-copy="sheetErrors">Mis errores</strong><small data-s3-copy="sheetErrorsText">Revisión prioritaria</small></span></a>' +
      '<a href="examen.html"><span class="s3-mode-code">EXA</span><span><strong data-s3-copy="sheetExam">Examen blanco</strong><small data-s3-copy="sheetExamText">40 preguntas mixtas</small></span></a>' +
      '</div></section>';
    document.body.appendChild(sheet);
  }

  var focusBeforeSheet = null;
  function openStudySheet(trigger){
    var sheet = document.getElementById('s3StudySheet');
    if(!sheet) return;
    var menu = document.getElementById('navLinks') || document.querySelector('.nav-links');
    var toggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
    if(menu) menu.classList.remove('open');
    if(toggle){
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Abrir menú');
    }
    document.body.classList.remove('med-menu-open');
    focusBeforeSheet = trigger || document.activeElement;
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('s3-study-sheet-open');
    window.setTimeout(function(){ var close = sheet.querySelector('[data-s3-study-close]'); if(close) close.focus(); },20);
  }

  function closeStudySheet(){
    var sheet = document.getElementById('s3StudySheet');
    if(!sheet) return;
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('s3-study-sheet-open');
    if(focusBeforeSheet && focusBeforeSheet.focus) focusBeforeSheet.focus();
    focusBeforeSheet = null;
  }

  function bindStudySheet(){
    document.addEventListener('click',function(event){
      var trigger = event.target.closest && event.target.closest('[data-s3-study-open]');
      if(trigger){ event.preventDefault(); openStudySheet(trigger); return; }
      if(event.target.closest && event.target.closest('[data-s3-study-close]')){ event.preventDefault(); closeStudySheet(); return; }
      var sheet = document.getElementById('s3StudySheet');
      if(sheet && event.target === sheet) closeStudySheet();
    });
    document.addEventListener('keydown',function(event){
      var sheet = document.getElementById('s3StudySheet');
      if(!sheet || !sheet.classList.contains('open')) return;
      if(event.key === 'Escape'){ event.preventDefault(); closeStudySheet(); return; }
      if(event.key !== 'Tab') return;
      var focusable = Array.from(sheet.querySelectorAll('a[href],button:not([disabled])'));
      if(!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
      else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
    });
  }

  function applyTranslations(){
    var c = copy();
    var semesterCopy = SEMESTER_COPY[language()] || SEMESTER_COPY.es;
    document.querySelectorAll('[data-s3-copy]').forEach(function(element){
      var value = c[element.dataset.s3Copy];
      if(value) element.textContent = value;
    });
    document.querySelectorAll('[data-s3-semester-copy]').forEach(function(element){
      var value = semesterCopy[element.dataset.s3SemesterCopy];
      if(value) element.textContent = value;
    });
    var semesterCard = document.getElementById('homeSemesterCard');
    if(semesterCard){
      semesterCard.setAttribute('aria-label',semesterCopy.cardLabel);
      var semesterTitle = semesterCard.querySelector('[data-semester-title]');
      var semesterDetail = semesterCard.querySelector('[data-semester-detail]');
      var isSelected = false;
      try{ isSelected = localStorage.getItem('medNykuto:studentSemester') === 's3'; }catch(error){}
      if(semesterTitle) semesterTitle.textContent = isSelected ? semesterCopy.selected3 : semesterCopy.semester3;
      if(semesterDetail) semesterDetail.textContent = semesterCopy.detail3;
    }
    var scope = document.getElementById('s3HeaderScope');
    if(scope) scope.setAttribute('aria-label', c.changeSemester + ' — ' + c.semesterScope);
    var nav = document.getElementById('s3BottomNav');
    if(nav) nav.setAttribute('aria-label', c.semesterScope);
    var close = document.querySelector('[data-s3-study-close]');
    if(close) close.setAttribute('aria-label',c.close);
    var semesterClose = document.querySelector('[data-semester-close]');
    if(semesterClose) semesterClose.setAttribute('aria-label',semesterCopy.close);
  }

  function watchLanguage(){
    if(!document.body || !window.MutationObserver) return;
    new MutationObserver(function(mutations){
      if(mutations.some(function(item){ return item.attributeName === 'data-lang'; })) applyTranslations();
    }).observe(document.body,{attributes:true,attributeFilter:['data-lang']});
  }

  function registerServiceWorker(){
    if(!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('service-worker.js').catch(function(){});
  }

  function run(){
    if(!document.body || document.body.classList.contains('semester-three-shell')) return;
    document.body.classList.add('semester-three-shell');
    document.body.dataset.semesterShell = 's3';
    createHeaderScope();
    simplifyHeaderNavigation();
    createBottomNavigation();
    createStudySheet();
    bindStudySheet();
    document.addEventListener('medNykuto:s3copyrefresh',applyTranslations);
    applyTranslations();
    watchLanguage();
    registerServiceWorker();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
