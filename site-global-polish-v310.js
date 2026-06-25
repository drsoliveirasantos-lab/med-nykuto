/* v363 — Global Med Nykuto polish layer.
   Applies identity, language, cache-visible UI text, logo/home behavior and practice-page safety across all pages.
   Loads the repair layer and runtime guard with v363 cache-busting after restored legacy data. */
(function(){
  'use strict';

  var SITE_NAME = 'Med Nykuto';
  var HOST = 'https://preview.med-nykuto-git.pages.dev/';
  var CACHE_VERSION = '363';

  function text(el,v){ if(el && v != null) el.textContent = v; }
  function attr(el,k,v){ if(el && v != null) el.setAttribute(k,v); }
  function all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }

  function setLang(){
    document.documentElement.lang = 'es';
    if(document.body) document.body.dataset.lang = 'es';
    try{ if(!localStorage.getItem('medLang')) localStorage.setItem('medLang','es'); }catch(e){}
  }

  function setMeta(){
    var path = location.pathname.split('/').pop() || 'index.html';
    var pageTitle = {
      'index.html':'Inicio | Med Nykuto',
      'matieres.html':'Materias | Med Nykuto',
      'matiere.html':'Materia | Med Nykuto',
      'modules.html':'Módulos | Med Nykuto',
      'qcm.html':'QCM | Med Nykuto',
      'cas-cliniques.html':'Casos clínicos | Med Nykuto',
      'vrai-faux.html':'Verdadero/Falso | Med Nykuto',
      'erreurs.html':'Errores | Med Nykuto',
      'examen.html':'Examen blanco | Med Nykuto',
      'contact.html':'Contacto | Med Nykuto',
      'contact-success.html':'Mensaje preparado | Med Nykuto',
      'a-propos.html':'Acerca de | Med Nykuto',
      'mentions.html':'Aviso legal | Med Nykuto',
      'module.html':'Módulo | Med Nykuto'
    }[path] || (document.title || '').replace(/Med Cursos/g,SITE_NAME).replace('Accueil','Inicio');
    document.title = pageTitle;

    var desc = 'Med Nykuto: cursos médicos, módulos, QCM, casos clínicos, verdadero/falso y revisión de errores.';
    var metaDesc = document.querySelector('meta[name="description"]');
    if(metaDesc) metaDesc.setAttribute('content', desc);
    all('meta[property="og:site_name"]').forEach(function(m){m.setAttribute('content', SITE_NAME);});
    all('meta[property="og:title"]').forEach(function(m){m.setAttribute('content', pageTitle);});
    all('meta[property="og:description"]').forEach(function(m){m.setAttribute('content', desc);});
    all('link[rel="canonical"]').forEach(function(l){l.setAttribute('href', HOST + path);});
    all('meta[property="og:url"]').forEach(function(m){m.setAttribute('content', HOST + path);});
  }

  function polishHeader(){
    all('img[alt="Med Cursos"], img[alt="MedCursos"], img[alt="Med Nykuto"]').forEach(function(img){ img.alt = SITE_NAME; });
    all('a.brand,a.brand-official').forEach(function(a){
      a.href = 'index.html';
      a.setAttribute('aria-label','Inicio');
      a.style.pointerEvents = 'auto';
      var small = a.querySelector('.brand-context small');
      if(small && /Bibliothèque|Biblioteca|organisée|organizada/i.test(clean(small.textContent))) small.textContent = 'Biblioteca médica organizada';
    });
    var map = [
      ['a[href="index.html"][data-i18n="home"]','Inicio'],
      ['a[href="matieres.html"][data-i18n="navSubjects"]','Materias'],
      ['a[href="modules.html"][data-i18n="navModules"]','Módulos'],
      ['a[href="cas-cliniques.html"][data-i18n="navClinical"]','Casos clínicos'],
      ['a[href="vrai-faux.html"][data-i18n="doVf"]','V/F'],
      ['a[href="erreurs.html"][data-i18n="mistakes"]','Errores'],
      ['a[href="examen.html"][data-i18n="examMode"]','Examen blanco'],
      ['a[href="contact.html"][data-i18n="navContact"]','Contacto']
    ];
    map.forEach(function(x){ all(x[0]).forEach(function(el){el.textContent = x[1];}); });
    all('.menu-toggle').forEach(function(b){ b.setAttribute('aria-label','Abrir menú'); });
  }

  function polishGenericText(){
    all('strong').forEach(function(el){ if(clean(el.textContent)==='Med Cursos') el.textContent = SITE_NAME; });
    all('.footer strong').forEach(function(el){ el.textContent = SITE_NAME; });
    all('[data-i18n="footerText"]').forEach(function(el){ el.textContent = 'Biblioteca médica organizada para revisar más rápido.'; });
    all('[data-i18n="backHome"]').forEach(function(el){ el.textContent = 'Inicio /'; });
    all('[data-i18n="backSubjects"]').forEach(function(el){ el.textContent = '← Materias'; });
    all('[data-i18n="back"]').forEach(function(el){ el.textContent = '← Volver'; });

    var replacements = {
      'Entrenar maintenant':'Entrenar ahora',
      'Corriger ce qui bloque':'Corregir lo que bloquea',
      'Commencer à réviser':'Empezar a revisar',
      'Voir tous les modules':'Ver todos los módulos',
      'Revoir mes erreurs':'Revisar errores',
      'Matières':'Materias',
      'Modules':'Módulos',
      'Cas cliniques':'Casos clínicos',
      'Vrai/Faux':'V/F',
      'Mes erreurs':'Errores',
      'Examen blanc':'Examen blanco',
      'Accueil':'Inicio',
      'Mentions':'Aviso legal'
    };
    all('a,button,h1,h2,h3,p,small,span,em,strong,label,option').forEach(function(el){
      var v = clean(el.textContent);
      if(replacements[v]) el.textContent = replacements[v];
    });
  }

  function polishHome(){
    if(!document.body || document.body.dataset.page !== 'home') return;
    text(document.querySelector('#quick-actions-title'), '¿Qué quieres revisar ahora?');
    all('[data-i18n="home.quick.subtitle"]').forEach(function(el){el.textContent='Elige una entrada y empieza directo: materia, QCM, casos clínicos o errores.';});
    all('[data-i18n="home.quick.qcm.text"]').forEach(function(el){el.textContent='Entrenar ahora';});
    all('[data-i18n="home.quick.errors.text"]').forEach(function(el){el.textContent='Corregir lo que bloquea';});
    all('[data-i18n="homeEyebrow"]').forEach(function(el){el.textContent='Medicina · revisión estructurada';});
    all('[data-i18n="currentSemesterBadge"]').forEach(function(el){el.textContent='Semestre 3';});
    all('[data-i18n="currentSemesterText"]').forEach(function(el){el.textContent='Contenido actual: materias del tercer semestre';});
    all('[data-i18n="homeTitle"]').forEach(function(el){el.textContent='Estudia medicina con un plan claro, activo y rápido.';});
    all('[data-i18n="homeText"]').forEach(function(el){el.textContent='Elige una materia, revisa el curso, entrena con QCM y corrige tus errores sin perder tiempo.';});
    all('[data-i18n="startStudying"]').forEach(function(el){el.textContent='Empezar a revisar';});
    all('[data-i18n="openModules"]').forEach(function(el){el.textContent='Ver módulos';});
    all('[data-i18n="reviewMistakes"]').forEach(function(el){el.textContent='Revisar errores';});
    all('[data-i18n="donateEyebrow"]').forEach(function(el){el.textContent='Proyecto gratuito · apoyo libre';});
    all('[data-i18n="donateTitle"]').forEach(function(el){el.textContent='Apoyar el proyecto';});
    all('[data-i18n="donateText"]').forEach(function(el){el.textContent='El sitio seguirá gratuito y abierto. Una pequeña contribución ayuda a pagar el alojamiento y mejorar los entrenamientos.';});
    all('[data-i18n="copyPix"]').forEach(function(el){el.textContent='Copiar código Pix';});
  }

  function polishComingSoon(){
    all('.subject-progress-card').forEach(function(card){
      if(/Biof[ií]sica/i.test(clean(card.textContent))){
        card.classList.add('is-coming-soon');
        var span = card.querySelector('span'); if(span) span.textContent = 'Próximamente';
        var pct = card.querySelector('.subject-progress-pct'); if(pct) pct.textContent = '—';
      }
    });
  }

  function injectGlobalStyle(){
    if(document.getElementById('siteGlobalPolishV310Style')) return;
    var st = document.createElement('style');
    st.id = 'siteGlobalPolishV310Style';
    st.textContent = '.brand,.brand-official{position:relative!important;z-index:120!important;pointer-events:auto!important;cursor:pointer!important}.brand-logo,.brand-logo-official{pointer-events:auto!important}.is-coming-soon{opacity:.78}.is-coming-soon .mini-progress i{width:0!important}.site-header a,.nav-links a{touch-action:manipulation}.home-action-card,.subject-progress-card,.module-card,.course-card{touch-action:pan-y;}.runtime-health-panel{margin:16px auto;max-width:1080px}';
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

  function run(){
    setLang();
    setMeta();
    polishHeader();
    polishGenericText();
    polishHome();
    polishComingSoon();
    injectGlobalStyle();
    loadInterfaceFix();
    loadGlobalRepair();
    loadRuntimeGuard();
    window.__MED_NYKUTO_GLOBAL_POLISH__ = 'v363-loader';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  setTimeout(run, 250);
  setTimeout(run, 900);
})();
