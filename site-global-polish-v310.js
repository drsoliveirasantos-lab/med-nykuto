/* v380 — Global Med Nykuto polish layer with coherent ES/FR/BR rendering.
   Applies identity, language, cache-visible UI text, logo/home behavior, optional public-first auth, course image zoom and practice-page safety.
   Quiet-page rule: module/practice/exam/mistakes pages must not load forced global repair/debug layers or delayed global refresh passes while the user is reading or answering.
   Quiet pages expose lightweight runtime/health markers, local feedback fallback, and brand text cleanup without forced runtime repaint layers. */
(function(){
  'use strict';

  var SITE_NAME = 'Med Nykuto';
  var HOST = 'https://med.nykuto.com/';
  var CACHE_VERSION = '460';

  function enforceSemesterScope(){
    var semester = '';
    try{ semester = localStorage.getItem('medNykuto:studentSemester') || ''; }catch(e){}
    if(semester !== 's4' && semester !== 's5') return false;
    var protectedPage = /^(matieres|matiere|modules|module|qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(location.pathname.split('/').pop() || '');
    if(!protectedPage) return false;
    location.replace(semester === 's4'
      ? 'clase.html'
      : 'index.html?semestre=s5&contenido=proximamente');
    return true;
  }

  if(enforceSemesterScope()) return;

  function text(el,v){ if(el && v != null) el.textContent = v; }
  function all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function pageName(){ return location.pathname.split('/').pop() || 'index.html'; }
  function bodyPage(){ return (document.body && document.body.dataset && document.body.dataset.page) || ''; }
  function isModuleReaderPage(){ return pageName() === 'module.html' || bodyPage() === 'module'; }
  function isPracticeLikePage(){ return /^(qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(pageName()) || /^(practice|exam|mistakes)$/.test(bodyPage()); }
  function isQuietPage(){ return isModuleReaderPage() || isPracticeLikePage(); }
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); }

  function currentLanguage(){
    var stored = '';
    try{ stored = localStorage.getItem('medLang') || ''; }catch(e){}
    var raw = String(stored || document.documentElement.lang || 'es').toLowerCase();
    if(raw.indexOf('fr') === 0) return 'fr';
    if(raw.indexOf('br') === 0 || raw.indexOf('pt') === 0) return 'br';
    return 'es';
  }

  var COPY = {
    es:{
      home:'Inicio', subjects:'Materias', modules:'Módulos', clinical:'Casos clínicos', vf:'V/F', mistakes:'Errores', exam:'Examen blanco', contact:'Contacto', account:'Cuenta', about:'Acerca de', legal:'Aviso legal',
      brandSubtitle:'Biblioteca médica organizada', menu:'Abrir menú', languageSwitcher:'Cambiar idioma', navigation:'Navegación principal', footer:'Biblioteca médica organizada para revisar más rápido.', back:'← Volver', backSubjects:'← Materias',
      quickEyebrow:'REVISIÓN INMEDIATA', quickTitle:'¿Qué quieres revisar ahora?', quickSubtitle:'Elige una entrada y empieza directo: materia, QCM, casos clínicos o errores.',
      quickCards:[['Elegir materia','Ver cursos y módulos'],['QCM rápido','Entrenar ahora'],['Casos clínicos','Razonar como examen'],['Revisar errores','Corregir lo que bloquea']],
      heroEyebrow:'Medicina · revisión estructurada', scopeBadge:'Biblioteca en evolución', scopeText:'59 módulos publicados · nuevos contenidos en preparación',
      heroTitle:'Estudia medicina con un plan claro, activo y rápido.', heroText:'Elige una materia, revisa el curso, entrena con QCM y corrige tus errores sin perder tiempo.',
      proof:['módulos','materias activas','funcional','+ casos'], heroActions:['Empezar a revisar','Ver módulos','Revisar errores'],
      donateEyebrow:'Proyecto gratuito · apoyo libre', donateTitle:'Apoyar el proyecto', donateText:'El sitio seguirá gratuito y abierto. Una pequeña contribución ayuda a pagar el alojamiento, mejorar los cursos y mantener los entrenamientos.', copyPix:'Copiar código Pix', donateBubble:'Un pequeño Pix y los QCM continúan funcionando.', donateThanks:'Gracias por apoyar el proyecto.',
      steps:[['Elige una materia','Abre Fisiología, Bioquímica, Microbiología, Genética o Inmunología.'],['Lee el curso o la ficha','Pasa del curso completo a la ficha rápida o al ultra-resumen.'],['Entrena activamente','Haz QCM, casos clínicos y verdadero/falso, luego revisa tus errores.']],
      stats:['Materias','Módulos','Progreso total'], progressTitle:'Materias presentes', reset:'Reiniciar', openProject:'Proyecto abierto', communityTitle:'Gratuito para estudiar, apoyado por la comunidad.', communityText:'El objetivo es simple: hacer cursos, fichas y entrenamientos accesibles sin barrera.', comingSoon:'Próximamente',
      reportSaved:'Reporte guardado localmente', reportSavedText:'El reporte fue registrado en este navegador y podrá revisarse después.',
      projectLabel:'Proyecto', supportLabel:'Apoyar el proyecto', howToLabel:'Cómo usar el sitio', progressLabel:'Tabla de progreso', statsLabel:'Estadísticas del sitio', pixAlt:'QR Pix de apoyo',
      metaDescription:'Med Nykuto: cursos médicos, módulos, QCM, casos clínicos, verdadero/falso y revisión de errores.'
    },
    fr:{
      home:'Accueil', subjects:'Matières', modules:'Modules', clinical:'Cas cliniques', vf:'V/F', mistakes:'Erreurs', exam:'Examen blanc', contact:'Contact', account:'Compte', about:'À propos', legal:'Mentions légales',
      brandSubtitle:'Bibliothèque médicale organisée', menu:'Ouvrir le menu', languageSwitcher:'Changer la langue', navigation:'Navigation principale', footer:'Bibliothèque médicale organisée pour réviser plus vite.', back:'← Retour', backSubjects:'← Matières',
      quickEyebrow:'RÉVISION IMMÉDIATE', quickTitle:'Que veux-tu réviser maintenant ?', quickSubtitle:'Choisis une entrée et commence directement : matière, QCM, cas cliniques ou erreurs.',
      quickCards:[['Choisir une matière','Voir les cours et modules'],['QCM rapide','S’entraîner maintenant'],['Cas cliniques','Raisonner comme à l’examen'],['Revoir les erreurs','Corriger ce qui bloque']],
      heroEyebrow:'Médecine · révision structurée', scopeBadge:'Bibliothèque en évolution', scopeText:'59 modules publiés · nouveaux contenus en préparation',
      heroTitle:'Étudie la médecine avec un plan clair, actif et rapide.', heroText:'Choisis une matière, révise le cours, entraîne-toi avec les QCM et corrige tes erreurs sans perdre de temps.',
      proof:['modules','matières actives','fonctionnel','+ cas'], heroActions:['Commencer à réviser','Voir les modules','Revoir les erreurs'],
      donateEyebrow:'Projet gratuit · soutien libre', donateTitle:'Soutenir le projet', donateText:'Le site restera gratuit et ouvert. Une petite contribution aide à payer l’hébergement, améliorer les cours et maintenir les entraînements.', copyPix:'Copier le code Pix', donateBubble:'Un petit Pix et les QCM continuent de fonctionner.', donateThanks:'Merci de soutenir le projet.',
      steps:[['Choisis une matière','Ouvre Physiologie, Biochimie, Microbiologie, Génétique ou Immunologie.'],['Lis le cours ou la fiche','Passe du cours complet à la fiche rapide ou à l’ultra-résumé.'],['Entraîne-toi activement','Fais des QCM, des cas cliniques et du vrai/faux, puis revois tes erreurs.']],
      stats:['Matières','Modules','Progression totale'], progressTitle:'Matières présentes', reset:'Réinitialiser', openProject:'Projet ouvert', communityTitle:'Gratuit pour étudier, soutenu par la communauté.', communityText:'L’objectif est simple : rendre les cours, fiches et entraînements accessibles sans barrière.', comingSoon:'Bientôt disponible',
      reportSaved:'Signalement enregistré localement', reportSavedText:'Le signalement a été enregistré dans ce navigateur et pourra être revu plus tard.',
      projectLabel:'Projet', supportLabel:'Soutenir le projet', howToLabel:'Comment utiliser le site', progressLabel:'Tableau de progression', statsLabel:'Statistiques du site', pixAlt:'QR Pix de soutien',
      metaDescription:'Med Nykuto : cours de médecine, modules, QCM, cas cliniques, vrai/faux et révision des erreurs.'
    },
    br:{
      home:'Início', subjects:'Matérias', modules:'Módulos', clinical:'Casos clínicos', vf:'V/F', mistakes:'Erros', exam:'Simulado', contact:'Contato', account:'Conta', about:'Sobre', legal:'Aviso legal',
      brandSubtitle:'Biblioteca médica organizada', menu:'Abrir menu', languageSwitcher:'Mudar idioma', navigation:'Navegação principal', footer:'Biblioteca médica organizada para revisar mais rápido.', back:'← Voltar', backSubjects:'← Matérias',
      quickEyebrow:'REVISÃO IMEDIATA', quickTitle:'O que você quer revisar agora?', quickSubtitle:'Escolha uma entrada e comece direto: matéria, QCM, casos clínicos ou erros.',
      quickCards:[['Escolher matéria','Ver cursos e módulos'],['QCM rápido','Treinar agora'],['Casos clínicos','Raciocinar como prova'],['Revisar erros','Corrigir o que trava']],
      heroEyebrow:'Medicina · revisão estruturada', scopeBadge:'Biblioteca em evolução', scopeText:'59 módulos publicados · novos conteúdos em preparação',
      heroTitle:'Estude medicina com um plano claro, ativo e rápido.', heroText:'Escolha uma matéria, revise o curso, treine com QCM e corrija seus erros sem perder tempo.',
      proof:['módulos','matérias ativas','funcional','+ casos'], heroActions:['Começar a revisar','Ver módulos','Revisar erros'],
      donateEyebrow:'Projeto gratuito · apoio livre', donateTitle:'Apoiar o projeto', donateText:'O site continuará gratuito e aberto. Uma pequena contribuição ajuda a pagar a hospedagem, melhorar os cursos e manter os treinamentos.', copyPix:'Copiar código Pix', donateBubble:'Um pequeno Pix e os QCM continuam funcionando.', donateThanks:'Obrigado por apoiar o projeto.',
      steps:[['Escolha uma matéria','Abra Fisiologia, Bioquímica, Microbiologia, Genética ou Imunologia.'],['Leia o curso ou a ficha','Passe do curso completo para a ficha rápida ou o ultra-resumo.'],['Treine ativamente','Faça QCM, casos clínicos e verdadeiro/falso, depois revise seus erros.']],
      stats:['Matérias','Módulos','Progresso total'], progressTitle:'Matérias presentes', reset:'Reiniciar', openProject:'Projeto aberto', communityTitle:'Gratuito para estudar, apoiado pela comunidade.', communityText:'O objetivo é simples: tornar cursos, fichas e treinamentos acessíveis sem barreira.', comingSoon:'Em breve',
      reportSaved:'Relato salvo localmente', reportSavedText:'O relato foi registrado neste navegador e poderá ser revisado depois.',
      projectLabel:'Projeto', supportLabel:'Apoiar o projeto', howToLabel:'Como usar o site', progressLabel:'Tabela de progresso', statsLabel:'Estatísticas do site', pixAlt:'QR Pix de apoio',
      metaDescription:'Med Nykuto: cursos médicos, módulos, QCM, casos clínicos, verdadeiro/falso e revisão de erros.'
    }
  };

  function copy(){ return COPY[currentLanguage()] || COPY.es; }

  function setLang(){
    var language = currentLanguage();
    document.documentElement.lang = language === 'br' ? 'pt-BR' : language;
    if(document.body) document.body.dataset.lang = language;
    try{ if(!localStorage.getItem('medLang')) localStorage.setItem('medLang','es'); }catch(e){}
  }

  function setMeta(){
    var path = pageName();
    var c = copy();
    var pageTitle = {
      'index.html':c.home + ' | Med Nykuto',
      'matieres.html':c.subjects + ' | Med Nykuto',
      'matiere.html':c.subjects + ' | Med Nykuto',
      'modules.html':c.modules + ' | Med Nykuto',
      'module.html':c.modules + ' | Med Nykuto',
      'qcm.html':'QCM | Med Nykuto',
      'cas-cliniques.html':c.clinical + ' | Med Nykuto',
      'vrai-faux.html':c.vf + ' | Med Nykuto',
      'erreurs.html':c.mistakes + ' | Med Nykuto',
      'examen.html':c.exam + ' | Med Nykuto',
      'contact.html':c.contact + ' | Med Nykuto',
      'contact-success.html':c.contact + ' | Med Nykuto',
      'a-propos.html':c.about + ' | Med Nykuto',
      'mentions.html':c.legal + ' | Med Nykuto',
      'login.html':c.account + ' | Med Nykuto',
      'compte.html':c.account + ' | Med Nykuto'
    }[path] || (document.title || '').replace(/Med Cursos/g,SITE_NAME).replace(/^Accueil\b/,c.home);
    document.title = pageTitle;

    var desc = c.metaDescription;
    var metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute('content', desc);
    all('meta[property="og:site_name"]').forEach(function(m){m.setAttribute('content', SITE_NAME);});
    all('meta[property="og:title"]').forEach(function(m){m.setAttribute('content', pageTitle);});
    all('meta[property="og:description"]').forEach(function(m){m.setAttribute('content', desc);});
    all('link[rel="canonical"]').forEach(function(l){l.setAttribute('href', HOST + path);});
    all('meta[property="og:url"]').forEach(function(m){m.setAttribute('content', HOST + path);});
  }

  function polishHeader(){
    var c = copy();
    all('.nav-shell').forEach(function(nav){ nav.setAttribute('aria-label',c.navigation); });
    all('.lang-switch,.language-switcher').forEach(function(el){ el.setAttribute('aria-label',c.languageSwitcher); });
    all('img[alt="Med Cursos"], img[alt="MedCursos"], img[alt="Med Nykuto"]').forEach(function(img){ img.alt = SITE_NAME; });
    all('a.brand,a.brand-official').forEach(function(a){
      a.href = '/index.html';
      a.setAttribute('aria-label',c.home);
      a.style.pointerEvents = 'auto';
      a.style.cursor = 'pointer';
      var small = a.querySelector('.brand-context small');
      if(small) small.textContent = c.brandSubtitle;
    });
    var map = [
      ['#navLinks a[href="index.html"],.nav-links a[href="index.html"]',c.home],
      ['#navLinks a[href="matieres.html"],.nav-links a[href="matieres.html"]',c.subjects],
      ['#navLinks a[href="modules.html"],.nav-links a[href="modules.html"]',c.modules],
      ['#navLinks a[href="cas-cliniques.html"],.nav-links a[href="cas-cliniques.html"]',c.clinical],
      ['#navLinks a[href="vrai-faux.html"],.nav-links a[href="vrai-faux.html"]',c.vf],
      ['#navLinks a[href="erreurs.html"],.nav-links a[href="erreurs.html"]',c.mistakes],
      ['#navLinks a[href="examen.html"],.nav-links a[href="examen.html"]',c.exam],
      ['#navLinks a[href="contact.html"],.nav-links a[href="contact.html"]',c.contact],
      ['#navLinks a[href="compte.html"],.nav-links a[href="compte.html"]',c.account]
    ];
    map.forEach(function(x){ all(x[0]).forEach(function(el){el.textContent = x[1];}); });
    all('.menu-toggle').forEach(function(b){ b.setAttribute('aria-label',c.menu); });
  }

  function polishGenericText(){
    var c = copy();
    all('strong').forEach(function(el){ if(clean(el.textContent)==='Med Cursos') el.textContent = SITE_NAME; });
    all('.footer strong').forEach(function(el){ el.textContent = SITE_NAME; });
    all('[data-i18n="footerText"],.footer strong + p').forEach(function(el){ el.textContent = c.footer; });
    all('[data-i18n="backHome"]').forEach(function(el){ el.textContent = c.home + ' /'; });
    all('[data-i18n="backSubjects"]').forEach(function(el){ el.textContent = c.backSubjects; });
    all('[data-i18n="back"]').forEach(function(el){ el.textContent = c.back; });
    var footerLinks = [["index.html",c.home],["matieres.html",c.subjects],["modules.html",c.modules],["contact.html",c.contact],["a-propos.html",c.about],["mentions.html",c.legal]];
    footerLinks.forEach(function(pair){ all('.footer a[href="' + pair[0] + '"]').forEach(function(el){ text(el,pair[1]); }); });
  }

  function normalizeVisibleBrandText(){
    if(!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var parent = node && node.parentElement;
        if(!parent) return NodeFilter.FILTER_REJECT;
        if(/^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT)$/.test(parent.tagName || '')) return NodeFilter.FILTER_REJECT;
        return /Med\s+Cursos|MedCursos/i.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var n;
    while((n = walker.nextNode())){
      n.nodeValue = String(n.nodeValue || '').replace(/Med\s+Cursos/g, SITE_NAME).replace(/MedCursos/g, SITE_NAME);
    }
  }

  function polishHome(){
    if(!document.body || document.body.dataset.page !== 'home') return;
    var c = copy();
    text(document.querySelector('.home-quick-eyebrow'), c.quickEyebrow);
    text(document.querySelector('#quick-actions-title'), c.quickTitle);
    text(document.querySelector('.home-quick-subtitle'), c.quickSubtitle);
    all('.home-action-grid .home-action-card').forEach(function(card,index){
      var pair = c.quickCards[index];
      if(!pair) return;
      text(card.querySelector('strong'), pair[0]);
      text(card.querySelector('small'), pair[1]);
    });
    text(document.querySelector('.home-v41-copy > .eyebrow'), c.heroEyebrow);
    text(document.querySelector('.current-scope-v58 span'), c.scopeBadge);
    text(document.querySelector('.current-scope-v58 strong'), c.scopeText);
    text(document.querySelector('.home-v41-copy > h1'), c.heroTitle);
    text(document.querySelector('.home-v41-copy > .hero-text'), c.heroText);
    all('.home-v41-proof em').forEach(function(el,index){ text(el,c.proof[index]); });
    all('.home-v41-actions a').forEach(function(el,index){ text(el,c.heroActions[index]); });
    text(document.querySelector('.home-v42-donate-card .donate-text .eyebrow'), c.donateEyebrow);
    text(document.querySelector('.home-v42-donate-card .donate-text h2'), c.donateTitle);
    text(document.querySelector('.home-v42-donate-card .donate-text > p:not(.eyebrow)'), c.donateText);
    text(document.querySelector('#copyPixBtn'), c.copyPix);
    text(document.querySelector('.donate-fun-bubble strong'), c.donateBubble);
    text(document.querySelector('.donate-fun-bubble span'), c.donateThanks);
    var hero = document.querySelector('.home-v41-hero'); if(hero) hero.setAttribute('aria-label',c.home);
    var donate = document.querySelector('.home-v42-donate-card'); if(donate) donate.setAttribute('aria-label',c.supportLabel);
    var steps = document.querySelector('.home-v41-steps'); if(steps) steps.setAttribute('aria-label',c.howToLabel);
    var dashboard = document.querySelector('.home-v41-dashboard'); if(dashboard) dashboard.setAttribute('aria-label',c.progressLabel);
    var stats = document.querySelector('.home-v41-study-map'); if(stats) stats.setAttribute('aria-label',c.statsLabel);
    var bottom = document.querySelector('.home-v41-bottom'); if(bottom) bottom.setAttribute('aria-label',c.projectLabel);
    var pix = document.querySelector('.donate-visual img'); if(pix) pix.alt = c.pixAlt;
    var pixButton = document.querySelector('#copyPixQr'); if(pixButton) pixButton.setAttribute('aria-label',c.copyPix);
    all('.home-v41-steps article').forEach(function(article,index){
      var step = c.steps[index];
      if(!step) return;
      text(article.querySelector('h3'),step[0]);
      text(article.querySelector('p'),step[1]);
    });
    all('.home-v41-stat-row .stat-card small').forEach(function(el,index){ text(el,c.stats[index]); });
    text(document.querySelector('.home-progress-head strong'),c.progressTitle);
    text(document.querySelector('#clearProgress'),c.reset);
    text(document.querySelector('.home-v41-bottom .eyebrow'),c.openProject);
    text(document.querySelector('.home-v41-bottom h2'),c.communityTitle);
    text(document.querySelector('.home-v41-bottom p:not(.eyebrow)'),c.communityText);
  }

  function polishComingSoon(){
    all('.subject-progress-card').forEach(function(card){
      if(/Biof[ií]sica/i.test(clean(card.textContent))){
        card.classList.add('is-coming-soon');
        card.setAttribute('aria-disabled','true');
        if(card.tagName === 'A') card.setAttribute('href','#');
        var span = card.querySelector('span'); if(span) span.textContent = copy().comingSoon;
        var pct = card.querySelector('.subject-progress-pct'); if(pct) pct.textContent = '—';
      }
    });
  }

  function computeCompactHealth(){
    var data = window.MED_COURSES_DATA || {};
    if(data && data.siteName !== SITE_NAME) data.siteName = SITE_NAME;
    var courses = Array.isArray(data.courses) ? data.courses : [];
    var modules = [];
    courses.forEach(function(course){ (course.modules || []).forEach(function(module){ modules.push(module); }); });
    var bank = window.MED_PRACTICE_BANK || {};
    var byCourse = bank.byCourse || {};
    var bankCourseIds = Object.keys(byCourse);
    var summary = {courses:0, qcm:0, vf:0, cases:0};
    bankCourseIds.forEach(function(cid){
      var b = byCourse[cid] || {};
      summary.courses += 1;
      summary.qcm += (b.qcm || []).length;
      summary.vf += (b.vf || []).length;
      summary.cases += (b.cases || []).length;
    });
    var casesBlockedByPolicy = bankCourseIds.length > 0 && bankCourseIds.every(function(cid){
      var certification = (byCourse[cid] || {}).certification || {};
      return Array.isArray(certification.blockedFormats) && certification.blockedFormats.indexOf('cases') >= 0;
    });
    var requiresBank = isPracticeLikePage();
    var warnings = [];
    if(courses.length < 5) warnings.push('too_few_courses');
    if(modules.length < 40) warnings.push('too_few_modules');
    if(requiresBank && !summary.qcm) warnings.push('no_qcm');
    if(requiresBank && !summary.vf) warnings.push('no_vf');
    if(requiresBank && !summary.cases && !casesBlockedByPolicy) warnings.push('no_cases');
    return {
      version:'v362-quiet-compact',
      ok:warnings.length === 0,
      warnings:warnings,
      bankRequired:requiresBank,
      courseCount:courses.length,
      activeCourseCount:courses.filter(function(c){ return (c.modules || []).length > 0; }).length,
      moduleCount:modules.length,
      bankCourseCount:summary.courses,
      qcmCount:summary.qcm,
      vfCount:summary.vf,
      caseCount:summary.cases,
      casesBlockedByPolicy:casesBlockedByPolicy,
      fallbackActive:!!(bank && String(bank.version || '').indexOf('fallback') >= 0),
      dataSiteName:data.siteName || SITE_NAME
    };
  }

  function exposeQuietRuntime(){
    if(!isQuietPage()) return;
    var health = computeCompactHealth();
    window.MED_NYKUTO_HEALTH = health;
    window.__MED_NYKUTO_RUNTIME_GUARD__ = 'v362';
    window.__MED_NYKUTO_RUNTIME_GUARD_LIGHT__ = 'v377-quiet-no-forced-runtime';
    if(document.documentElement) document.documentElement.dataset.medRuntime = 'v362';
    if(document.body){
      document.body.dataset.medRuntime = 'v362';
      document.body.dataset.medHealth = health.ok ? 'ok' : 'warning';
      document.body.dataset.medBankRequired = health.bankRequired ? '1' : '0';
      document.body.dataset.medModules = String(health.moduleCount || 0);
      document.body.dataset.medQcm = String(health.qcmCount || 0);
      document.body.classList.add('med-runtime-ready');
    }
  }

  function showQuestionFeedbackFallback(form){
    var c = copy();
    var old = document.getElementById('questionFeedbackFallbackV360');
    if(old) old.remove();
    var box = document.createElement('div');
    box.id = 'questionFeedbackFallbackV360';
    box.className = 'notice question-feedback-fallback';
    box.innerHTML = '<strong>' + escapeHtml(c.reportSaved) + '</strong><p>' + escapeHtml(c.reportSavedText) + '</p>';
    (form && form.parentNode ? form.parentNode : (document.querySelector('main') || document.body)).appendChild(box);
  }

  function installQuietQuestionFeedbackFallback(){
    if(!isPracticeLikePage() || window.__MED_NYKUTO_QUIET_FEEDBACK_FALLBACK__) return;
    window.__MED_NYKUTO_QUIET_FEEDBACK_FALLBACK__ = 'v377-local-submit-guard';
    document.addEventListener('submit', function(e){
      var form = e.target;
      if(!form || !form.matches || !form.matches('form[name="question-feedback"]')) return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      try{
        var data = new FormData(form);
        var reports = JSON.parse(localStorage.getItem('medQuestionReports:v1') || '[]');
        reports.push({
          question_id: data.get('question_id') || '',
          comment: data.get('comment') || '',
          page: location.href,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('medQuestionReports:v1', JSON.stringify(reports.slice(-50)));
      }catch(err){}
      showQuestionFeedbackFallback(form);
    }, true);
    all('form[name="question-feedback"]').forEach(function(form){
      form.removeAttribute('action');
      form.removeAttribute('data-netlify');
      form.removeAttribute('netlify');
      form.removeAttribute('netlify-honeypot');
    });
  }

  function injectGlobalStyle(){
    if(document.getElementById('siteGlobalPolishV310Style')) return;
    var st = document.createElement('style');
    st.id = 'siteGlobalPolishV310Style';
    st.textContent = [
      '.site-header,.nav-shell,#navLinks,.nav-links{pointer-events:auto!important}',
      '.site-header{position:relative!important;z-index:300!important}',
      '.nav-shell{position:relative!important;z-index:310!important;display:flex!important;align-items:center!important;gap:12px!important;flex-wrap:wrap!important;overflow:visible!important}',
      '.brand,.brand-official{position:relative!important;z-index:340!important;pointer-events:auto!important;cursor:pointer!important;flex:0 0 auto!important}',
      '.brand-logo,.brand-logo-official{pointer-events:auto!important}',
      '#navLinks,.nav-links{position:relative!important;z-index:320!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex:1 1 auto!important;min-width:0!important;flex-wrap:wrap!important;overflow:visible!important}',
      '#navLinks a,.nav-links a{position:relative!important;z-index:330!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:34px!important;padding:7px 9px!important;border-radius:999px!important;pointer-events:auto!important;touch-action:manipulation!important;white-space:nowrap!important}',
      '#navLinks a[href="index.html"],#navLinks a[href="matieres.html"],.nav-links a[href="index.html"],.nav-links a[href="matieres.html"]{background:rgba(255,255,255,.035)!important}',
      '.site-header a,.site-header button,.site-header [role="button"]{pointer-events:auto!important;touch-action:manipulation!important}',
      '.site-header .global-tools,.site-header #globalSearchInput{display:none!important;visibility:hidden!important;pointer-events:none!important;width:0!important;max-width:0!important;min-width:0!important;overflow:hidden!important}',
      '.is-coming-soon{opacity:.78}',
      '.is-coming-soon .mini-progress i{width:0!important}',
      '.home-action-card,.subject-progress-card,.module-card,.course-card{touch-action:pan-y;}',
      '.practice-page button.weak-reset{pointer-events:auto!important}',
      '.runtime-health-panel{margin:16px auto;max-width:1080px}',
      '.question-feedback-fallback{margin:14px 0;padding:12px;border:1px solid rgba(74,222,128,.35);border-radius:14px;background:rgba(74,222,128,.08)}',
      '@media(min-width:921px) and (max-width:1350px){.nav-shell{display:grid!important;grid-template-columns:auto auto!important;grid-template-areas:"brand lang" "links links"!important}.brand,.brand-official{grid-area:brand!important}.lang-switch,.language-switcher{grid-area:lang!important;justify-self:end!important}#navLinks,.nav-links{grid-area:links!important;width:100%!important;justify-content:center!important}}',
      '@media(max-width:920px){#navLinks,.nav-links{display:none!important;position:absolute!important;right:22px!important;top:70px!important;background:#0b111d!important;border:1px solid var(--line)!important;border-radius:18px!important;padding:14px!important;box-shadow:var(--shadow)!important;min-width:220px!important}.nav-links.open,#navLinks.open{display:grid!important}.menu-toggle{display:block!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function appendScript(id, src, marker){
    if((marker && window[marker]) || document.getElementById(id)) return;
    if(marker) window[marker] = src;
    var s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.defer = true;
    (document.body || document.head || document.documentElement).appendChild(s);
  }

  function withCache(path){ return path + '?v=' + CACHE_VERSION; }
  function loadInterfaceFix(){ appendScript('interfaceClickFixV352', withCache('interface-click-fix-v352.js'), '__MED_NYKUTO_INTERFACE_FIX_LOADER__'); }
  function loadGlobalRepair(){ appendScript('medNykutoGlobalFixV358', withCache('med-nykuto-global-fix-v358.js'), '__MED_NYKUTO_GLOBAL_FIX_LOADER__'); }
  function loadRuntimeGuard(){ appendScript('medNykutoRuntimeGuardV361', withCache('med-nykuto-runtime-guard-v361.js'), '__MED_NYKUTO_RUNTIME_GUARD_LOADER__'); }
  function loadHomeLinkFix(){ appendScript('homeLinkFixV303', 'home-link-fix-v303.js?v=365', '__MED_NYKUTO_HOME_LINK_FIX_LOADER__'); }
  function loadOptionalAuth(){ appendScript('authOptionalV101', 'auth-optional-v101.js?v=101', '__MED_NYKUTO_AUTH_OPTIONAL_LOADER__'); }
  function loadCourseImageZoom(){ appendScript('courseImageZoomV101', 'course-image-zoom-v101.js?v=102', '__MED_NYKUTO_COURSE_IMAGE_ZOOM_LOADER__'); }
  function loadSemesterThreeShell(){ appendScript('semesterThreeShellV460', 'semester-3-shell-v460.js?v=460', '__MED_NYKUTO_S3_SHELL_LOADER__'); }

  function loadGlobalRepairLayers(){
    loadSemesterThreeShell();
    if(isQuietPage()){
      window.__MED_NYKUTO_GLOBAL_POLISH_LIGHT_MODE__ = 'v377-skip-forced-repair-layers';
      if(isModuleReaderPage()) loadCourseImageZoom();
      return;
    }
    loadInterfaceFix();
    loadGlobalRepair();
    loadRuntimeGuard();
    loadHomeLinkFix();
    loadOptionalAuth();
    loadCourseImageZoom();
  }

  function run(){
    setLang();
    setMeta();
    polishHeader();
    polishGenericText();
    normalizeVisibleBrandText();
    polishHome();
    polishComingSoon();
    exposeQuietRuntime();
    installQuietQuestionFeedbackFallback();
    injectGlobalStyle();
    loadGlobalRepairLayers();
    window.__MED_NYKUTO_GLOBAL_POLISH__ = 'v380-multilingual-loader';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  if(isQuietPage()){
    setTimeout(normalizeVisibleBrandText, 120);
  }else{
    setTimeout(run, 250);
    setTimeout(run, 900);
  }
})();
