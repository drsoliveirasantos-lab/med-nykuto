/* v361 — Med Nykuto runtime guard.
   Purpose: release-hardening layer for data health, legacy storage migration,
   safe disabled links, dynamic stats, restored legacy-data brand normalization,
   and visible fallback diagnostics.
   Does not generate or modify medical question-bank content. */
(function(){
  'use strict';
  var VERSION = 'v361';
  var BRAND = 'Med Nykuto';

  function $(sel, root){ return (root || document).querySelector(sel); }
  function all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function text(el, value){ if(el && value != null) el.textContent = value; }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function safeGet(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } }
  function safeSet(key, value){ try{ localStorage.setItem(key, value); }catch(e){} }

  function currentPage(){ return (document.body && document.body.dataset && document.body.dataset.page) || ''; }
  function bankRequired(){
    var page = currentPage();
    return /^(practice|exam|mistakes)$/.test(page) || /(?:qcm|cas-cliniques|vrai-faux|erreurs|examen)\.html$/.test(location.pathname || '');
  }

  function normalizeLegacyDataBrand(){
    var data = window.MED_COURSES_DATA;
    if(data && data.siteName !== BRAND) data.siteName = BRAND;
    if(data && typeof data.generatedFrom === 'string') data.generatedFrom = data.generatedFrom.replace(/Med\s+Cursos/g, BRAND);
    if(data && Array.isArray(data.courses)){
      data.courses.forEach(function(course){
        if(course && typeof course.description === 'string') course.description = course.description.replace(/Med\s+Cursos/g, BRAND);
      });
    }
  }

  function courseData(){
    normalizeLegacyDataBrand();
    var data = window.MED_COURSES_DATA || {};
    var courses = Array.isArray(data.courses) ? data.courses : [];
    var modules = [];
    courses.forEach(function(course){
      (course.modules || []).forEach(function(module){ modules.push(Object.assign({}, module, {courseId:course.id, courseTitle:course.title})); });
    });
    return {data:data, courses:courses, modules:modules};
  }

  function bankData(){
    var bank = window.MED_PRACTICE_BANK || {};
    var byCourse = bank.byCourse || {};
    var summary = {courses:0, qcm:0, vf:0, cases:0};
    Object.keys(byCourse).forEach(function(cid){
      var b = byCourse[cid] || {};
      summary.courses += 1;
      summary.qcm += (b.qcm || []).length;
      summary.vf += (b.vf || []).length;
      summary.cases += (b.cases || []).length;
    });
    return {bank:bank, byCourse:byCourse, summary:summary};
  }

  function computeHealth(){
    var c = courseData();
    var b = bankData();
    var activeCourses = c.courses.filter(function(course){ return (course.moduleCount || (course.modules || []).length || 0) > 0; });
    var warnings = [];
    var requiresBank = bankRequired();
    if(c.courses.length < 5) warnings.push('too_few_courses');
    if(c.modules.length < 40) warnings.push('too_few_modules');
    if(requiresBank && !b.summary.qcm) warnings.push('no_qcm');
    if(requiresBank && !b.summary.vf) warnings.push('no_vf');
    if(requiresBank && !b.summary.cases) warnings.push('no_cases');
    return {
      version: VERSION,
      ok: warnings.length === 0,
      warnings: warnings,
      bankRequired: requiresBank,
      courseCount: c.courses.length,
      activeCourseCount: activeCourses.length,
      moduleCount: c.modules.length,
      bankCourseCount: b.summary.courses,
      qcmCount: b.summary.qcm,
      vfCount: b.summary.vf,
      caseCount: b.summary.cases,
      fallbackActive: !!(window.MED_PRACTICE_BANK && String(window.MED_PRACTICE_BANK.version || '').indexOf('fallback') >= 0),
      dataSiteName: c.data.siteName || ''
    };
  }

  function exposeHealth(){
    var health = computeHealth();
    window.MED_NYKUTO_HEALTH = health;
    if(document.body){
      document.body.dataset.medRuntime = VERSION;
      document.body.dataset.medHealth = health.ok ? 'ok' : 'warning';
      document.body.dataset.medBankRequired = health.bankRequired ? '1' : '0';
      document.body.dataset.medModules = String(health.moduleCount || 0);
      document.body.dataset.medQcm = String(health.qcmCount || 0);
    }
    return health;
  }

  function migrateLegacyStorage(){
    var legacyLang = safeGet('medCursosLang');
    var currentLang = safeGet('medLang');
    if(legacyLang && !currentLang) safeSet('medLang', legacyLang);
    var legacyProgress = safeGet('medCursosProgress:v1');
    var currentProgress = safeGet('medProgress:v1');
    if(legacyProgress && !currentProgress) safeSet('medProgress:v1', legacyProgress);
  }

  function hardBrandCleanup(){
    if(document.title) document.title = document.title.replace(/Med\s+Cursos/g, BRAND).replace(/Mensaje enviado/g, 'Mensaje preparado');
    all('meta[content]').forEach(function(meta){
      var content = meta.getAttribute('content') || '';
      var next = content.replace(/Med\s+Cursos/g, BRAND).replace(/med-cursos\.netlify\.app/g, 'preview.med-nykuto-git.pages.dev').replace(/Mensaje enviado/g, 'Mensaje preparado');
      if(next !== content) meta.setAttribute('content', next);
    });
    all('a[href="mentions.html"]').forEach(function(link){ if(clean(link.textContent) === 'Mentions') link.textContent = 'Aviso legal'; });
  }

  function disableUnsafeLinks(){
    all('a[aria-disabled="true"], a.is-coming-soon, .is-coming-soon a, a[href="#"]').forEach(function(a){
      if(a.dataset.medDisabledBound === '1') return;
      a.dataset.medDisabledBound = '1';
      a.addEventListener('click', function(e){
        if(a.getAttribute('href') === '#' || a.getAttribute('aria-disabled') === 'true' || a.closest('.is-coming-soon')){
          e.preventDefault();
          e.stopPropagation();
          if(window.medToast) window.medToast('Próximamente');
        }
      }, true);
    });
  }

  function guardComingSoonSubjects(){
    all('.subject-progress-card,.course-card').forEach(function(card){
      if(!/Biof[ií]sica/i.test(clean(card.textContent))) return;
      card.classList.add('is-coming-soon');
      card.setAttribute('aria-disabled','true');
      if(card.tagName === 'A') card.setAttribute('href','#');
      all('a', card).forEach(function(a){ a.setAttribute('href','#'); a.setAttribute('aria-disabled','true'); });
      var label = card.querySelector('span'); if(label && /0\s*m[óo]dulos|m[óo]dulos/i.test(clean(label.textContent))) label.textContent = 'Próximamente';
      var pct = card.querySelector('.subject-progress-pct'); if(pct) pct.textContent = '—';
    });
  }

  function syncHomeStats(){
    if(!document.body || document.body.dataset.page !== 'home') return;
    var health = window.MED_NYKUTO_HEALTH || exposeHealth();
    text($('#statCursoes'), String(health.courseCount || 0));
    text($('#statModules'), String(health.moduleCount || 0));
    text($('#statModulesHero'), String(health.moduleCount || 0));
    var grid = $('#subjectProgressGrid');
    if(grid && !clean(grid.textContent)){
      var c = courseData();
      grid.innerHTML = c.courses.map(function(course){
        var count = course.moduleCount || (course.modules || []).length || 0;
        var soon = count <= 0;
        return '<a class="subject-progress-card '+(soon?'is-coming-soon':'')+'" href="'+(soon?'#':'matiere.html?course='+encodeURIComponent(course.id))+'" '+(soon?'aria-disabled="true"':'')+'>'+ 
          '<div><strong>'+escapeHtml(course.title || course.id || '')+'</strong><span>'+(soon?'Próximamente':count+' módulos')+'</span></div>'+ 
          '<div class="subject-progress-pct">'+(soon?'—':'0%')+'</div><div class="mini-progress"><i style="width:0%"></i></div></a>';
      }).join('');
    }
    guardComingSoonSubjects();
  }

  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); }

  function addHealthPanel(){
    if(!document.body || document.getElementById('medRuntimeHealthPanel')) return;
    var fatal = $('.fatal-render-error');
    var health = window.MED_NYKUTO_HEALTH || exposeHealth();
    if(!fatal && health.ok) return;
    var main = $('main') || document.body;
    var box = document.createElement('section');
    box.id = 'medRuntimeHealthPanel';
    box.className = 'notice runtime-health-panel';
    box.innerHTML = '<strong>Estado técnico del sitio</strong><p>'+ 
      (fatal ? 'Una sección no pudo renderizarse correctamente. ' : '')+ 
      'Cursos: '+health.courseCount+' · Módulos: '+health.moduleCount+' · QCM: '+health.qcmCount+' · V/F: '+health.vfCount+' · Casos: '+health.caseCount+'.</p>'+ 
      (health.warnings.length ? '<small>Alertas: '+health.warnings.join(', ')+'</small>' : '');
    main.insertBefore(box, main.firstChild);
  }

  function protectQuestionFeedback(){
    all('form[name="question-feedback"]').forEach(function(form){
      form.removeAttribute('data-netlify');
      form.removeAttribute('netlify');
      form.removeAttribute('netlify-honeypot');
      if(form.getAttribute('action') === '/') form.removeAttribute('action');
    });
  }

  function markReady(){
    if(document.documentElement) document.documentElement.dataset.medRuntime = VERSION;
    if(document.body) document.body.classList.add('med-runtime-ready');
  }

  function run(){
    migrateLegacyStorage();
    normalizeLegacyDataBrand();
    exposeHealth();
    hardBrandCleanup();
    syncHomeStats();
    guardComingSoonSubjects();
    disableUnsafeLinks();
    protectQuestionFeedback();
    addHealthPanel();
    markReady();
    window.__MED_NYKUTO_RUNTIME_GUARD__ = VERSION;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 60); }, true);
  if(window.MutationObserver){
    try{
      new MutationObserver(function(){
        clearTimeout(window.__medNykutoRuntimeGuardTimer);
        window.__medNykutoRuntimeGuardTimer = setTimeout(run, 120);
      }).observe(document.documentElement, {childList:true, subtree:true});
    }catch(e){}
  }
})();
