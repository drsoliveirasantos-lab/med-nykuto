/* v294 — robust module picker + QCM clean skip mode */
(function(){
  'use strict';
  const DATA = window.MED_COURSES_DATA || {courses:[]};
  const courses = DATA.courses || [];

  const labels = {
    fr:{show:'Voir modules', close:'Fermer', title:'Choisir un module', empty:'Modules bientôt disponibles'},
    es:{show:'Ver módulos', close:'Cerrar', title:'Elegir un módulo', empty:'Módulos disponibles pronto'},
    br:{show:'Ver módulos', close:'Fechar', title:'Escolher um módulo', empty:'Módulos em breve'}
  };

  function lang(){
    try { return localStorage.getItem('medLang') || document.body.dataset.lang || 'fr'; }
    catch(e){ return document.body.dataset.lang || 'fr'; }
  }
  function L(k){ return (labels[lang()] && labels[lang()][k]) || labels.fr[k] || k; }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function txt(v){
    if(v && typeof v === 'object') return v[lang()] || v.es || v.fr || v.br || Object.values(v)[0] || '';
    return String(v || '');
  }
  function compactText(el){ return String((el && el.textContent) || '').replace(/\s+/g,' ').trim(); }
  function moduleUrl(m){ return 'module.html?id=' + encodeURIComponent(m.id); }

  function ensureOverlay(){
    let root = document.querySelector('#v210ModulePicker');
    if(root) return root;
    root = document.createElement('div');
    root.id = 'v210ModulePicker';
    root.className = 'v210-picker';
    root.hidden = true;
    root.innerHTML = `
      <div class="v210-picker-backdrop" data-v210-close="1"></div>
      <section class="v210-picker-panel" role="dialog" aria-modal="true" aria-labelledby="v210PickerTitle">
        <div class="v210-picker-head">
          <div><small id="v210PickerCourseCode"></small><h2 id="v210PickerTitle">${L('title')}</h2></div>
          <button class="v210-picker-close" type="button" data-v210-close="1" aria-label="${L('close')}">×</button>
        </div>
        <div class="v210-picker-list"></div>
      </section>`;
    document.body.appendChild(root);
    root.addEventListener('click', e => { if(e.target && e.target.getAttribute('data-v210-close') === '1') closeOverlay(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeOverlay(); });
    return root;
  }
  function closeOverlay(){
    const root = document.querySelector('#v210ModulePicker');
    if(!root) return;
    root.hidden = true;
    document.body.classList.remove('v210-picker-open');
  }
  function openOverlay(course){
    const root = ensureOverlay();
    const courseTitle = txt(course.title);
    const mods = Array.isArray(course.modules) ? course.modules : [];
    root.querySelector('#v210PickerCourseCode').textContent = course.code || course.id || '';
    root.querySelector('#v210PickerTitle').textContent = courseTitle + ' — ' + L('title');
    const list = root.querySelector('.v210-picker-list');
    list.innerHTML = mods.length ? mods.map(m => `
      <a class="v210-picker-link" href="${moduleUrl(m)}">
        <span>Mód. ${esc(m.number || '')}</span>
        <strong>${esc(txt(m.title))}</strong>
      </a>`).join('') : `<div class="v210-picker-empty">${L('empty')}</div>`;
    root.hidden = false;
    document.body.classList.add('v210-picker-open');
    setTimeout(() => { const first = root.querySelector('.v210-picker-link,.v210-picker-close'); if(first) first.focus({preventScroll:true}); }, 30);
  }

  function enhanceCatalog(){
    if(document.body.dataset.page !== 'catalog') return;
    const grid = document.querySelector('#courseGrid');
    if(!grid) return;
    document.querySelectorAll('.course-module-drawer,.v209-module-menu').forEach(el => el.remove());
    document.querySelectorAll('.course-card').forEach(card => card.classList.remove('expanded','v209-open'));
    Array.from(grid.querySelectorAll('.course-card')).forEach((card, index) => {
      const course = courses[index];
      if(!course || card.dataset.v210Enhanced === '1') return;
      const mainButton = card.querySelector('.card-actions .btn.primary');
      if(!mainButton) return;
      mainButton.href = '#';
      mainButton.setAttribute('role','button');
      mainButton.setAttribute('data-v210-toggle','1');
      mainButton.textContent = L('show') + ' ▾';
      mainButton.classList.remove('v209-toggle','v208-module-toggle');
      mainButton.classList.add('v210-toggle');
      mainButton.addEventListener('click', e => { e.preventDefault(); openOverlay(course); });
      card.dataset.v210Enhanced = '1';
    });
  }

  function enhanceReader(){
    if(document.body.dataset.page !== 'module') return;
    document.body.classList.add('v208-reader-comfort');
    const active = document.querySelector('.reader-tab.active');
    if(active) active.setAttribute('aria-current','page');
    const content = document.querySelector('#moduleContent');
    if(content && !content.dataset.v210Enhanced){
      content.querySelectorAll('p').forEach(p => {
        const t = p.textContent || '';
        if(t.length > 500) p.classList.add('reader-long-paragraph');
        if(t.includes(' | ') && t.length > 180) p.classList.add('reader-soft-block');
      });
      content.dataset.v210Enhanced = '1';
    }
  }

  function compactFocusButton(){
    const btn = document.querySelector('.practice-focus-open');
    if(btn && btn.textContent.trim() !== '⛶ Focus') btn.textContent = '⛶ Focus';
  }
  function upgradePickerLabels(){
    document.querySelectorAll('.mc-picker-btn').forEach(btn => {
      if(btn.dataset.premiumLabel === '1') return;
      const raw = compactText(btn);
      const isModule = btn.classList.contains('module') || /^Mod\./i.test(raw);
      const label = isModule ? 'Module' : 'Matière';
      const value = raw.replace(/^Mat\.:?\s*/i,'').replace(/^Mod\.:?\s*/i,'').trim();
      btn.innerHTML = `<span class="premium-filter-label">${label}</span><strong>${esc(value || (isModule ? 'Toute la banque' : 'Toutes'))}</strong><span class="premium-filter-change">Changer ▾</span>`;
      btn.dataset.premiumLabel = '1';
    });
  }
  function getProgressNumbers(){
    const section = document.querySelector('.practice-focus-section') || document.body;
    const text = compactText(section);
    const match = text.match(/\b(\d{1,2})\s*\/\s*(20)\b/);
    const current = match ? Math.max(1, Math.min(20, parseInt(match[1],10))) : 1;
    const total = match ? parseInt(match[2],10) : 20;
    return {current,total,percent:Math.round((current/total)*100)};
  }
  function ensureProgress(){
    const picker = document.querySelector('.mc-picker-shell');
    if(!picker) return;
    let bar = document.querySelector('.premium-progress');
    if(!bar){
      bar = document.createElement('div');
      bar.className = 'premium-progress';
      picker.insertAdjacentElement('afterend', bar);
    }
    const p = getProgressNumbers();
    bar.innerHTML = `<div class="premium-progress-head"><strong>Question ${p.current}/${p.total}</strong><span>${p.percent}%</span></div><div class="premium-progress-track"><i style="width:${p.percent}%"></i></div>`;
  }

  function findWeaknessBlock(){
    const section = document.querySelector('.practice-focus-section') || document.body;
    const nodes = Array.from(section.querySelectorAll('section,article,div'));
    const candidates = nodes.filter(el => {
      if(el.closest('.single-question-card,.premium-progress,.mc-picker-shell,.premium-weak-summary,.premium-bottom-actions')) return false;
      const t = compactText(el);
      if(t.length < 45 || t.length > 1700) return false;
      const hasTitle = /Mes points faibles|Puntos débiles|Pontos fracos|ADAPTATIF LOCAL|ADAPTATIVO LOCAL/i.test(t);
      const hasStats = /réponses|respuestas|respostas|erreurs|errores|je ne sais pas|no sé|não sei/i.test(t);
      return hasTitle && hasStats;
    }).sort((a,b) => compactText(a).length - compactText(b).length);
    if(!candidates.length) return null;
    let block = candidates[0];
    while(block.parentElement && block.parentElement !== section && block.parentElement !== document.body){
      const parentText = compactText(block.parentElement);
      const blockText = compactText(block);
      if(parentText.includes(blockText) && parentText.length <= blockText.length + 120 && /Mes points faibles|Puntos débiles|Pontos fracos|ADAPTATIF LOCAL|ADAPTATIVO LOCAL/i.test(parentText)) block = block.parentElement;
      else break;
    }
    return block;
  }
  function collapseWeaknessPanel(){
    const block = findWeaknessBlock();
    if(!block) return;
    block.dataset.premiumWeak = '1';
    block.classList.add('premium-weak-hidden','premium-weak-removed');
    block.setAttribute('aria-hidden','true');
    block.style.display = 'none';
    document.querySelectorAll('.premium-weak-summary,.premium-weak-summary-v2').forEach(el => el.remove());
  }

  function cleanQuestionText(){
    const root = document.querySelector('#practiceList') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let s = n.nodeValue;
      const old = s;
      s = s.replace(/,?\s*¿qué afirmación es correcta, célula, fase ni localización\?/gi, ', ¿cuál afirmación es correcta?');
      s = s.replace(/¿qué afirmación es correcta, célula, fase ni localización\?/gi, '¿cuál afirmación es correcta?');
      s = s.replace(/,?\s*célula, fase ni localización\?/gi, '?');
      s = s.replace(/¿qué proposición mantiene la relación correcta entre causa, mecanismo y consecuencia\?/gi, '¿cuál proposición es correcta?');
      if(s !== old) n.nodeValue = s;
    });
  }

  function injectQcmCleanStyle(){
    if(document.querySelector('#qcmCleanSkipStyle')) return;
    const style = document.createElement('style');
    style.id = 'qcmCleanSkipStyle';
    style.textContent = `
      body.qcm-page.qcm-skip-enabled .preanswer-tools,
      body.qcm-page.qcm-skip-enabled .hint-panel,
      body.qcm-page.qcm-skip-enabled .unknown-action-wrap,
      body.qcm-page.qcm-skip-enabled .confidence-panel,
      body.qcm-page.qcm-skip-enabled .confidence-btn,
      body.qcm-page.qcm-skip-enabled [data-action="confidence"]{
        display:none!important;visibility:hidden!important;opacity:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important;
      }
      body.qcm-page.qcm-skip-enabled .single-nav-actions,
      body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"]),
      body.qcm-page.qcm-skip-enabled .single-nav-actions:has(.btn[data-action="next-question"][disabled]){
        display:grid!important;grid-template-columns:1fr!important;gap:.45rem!important;margin:.75rem 0 0!important;padding:.75rem 0 0!important;border-top:1px solid rgba(255,255,255,.10)!important;
      }
      body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{
        display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;order:1!important;min-height:50px!important;border-color:rgba(245,211,124,.60)!important;background:linear-gradient(135deg,rgba(245,211,124,.36),rgba(245,211,124,.13))!important;color:#ffe7a0!important;
      }
      body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"][disabled]{filter:none!important;}
      body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="previous-question"]{order:2!important;min-height:34px!important;opacity:.62!important;}
      body.qcm-page.qcm-skip-enabled .options{margin-bottom:.65rem!important;}
      body.qcm-page.qcm-skip-enabled .question-shortcuts{display:none!important;}
      @media(max-width:760px){
        body.qcm-page.qcm-skip-enabled .single-nav-actions{margin-top:.65rem!important;padding-top:.65rem!important;}
        body.qcm-page.qcm-skip-enabled .single-nav-actions .btn[data-action="next-question"]{min-height:48px!important;font-size:.96rem!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function enableSkipNext(){
    if(!document.body.classList.contains('qcm-page')) return;
    document.body.classList.add('qcm-skip-enabled');
    document.querySelectorAll('.single-nav-actions .btn[data-action="next-question"]').forEach(btn => {
      btn.disabled = false;
      btn.removeAttribute('disabled');
      btn.setAttribute('aria-disabled','false');
      btn.classList.add('skip-enabled-next');
    });
    document.querySelectorAll('.preanswer-tools,.hint-panel,.unknown-action-wrap').forEach(el => {
      el.hidden = true;
      el.setAttribute('aria-hidden','true');
    });
  }

  function buildStickyActions(){
    const bar = document.querySelector('.premium-bottom-actions');
    if(bar) bar.remove();
  }

  function enhanceQcm(){
    if(!document.body.classList.contains('qcm-page')) return;
    document.body.classList.add('premium-qcm');
    injectQcmCleanStyle();
    compactFocusButton();
    upgradePickerLabels();
    ensureProgress();
    collapseWeaknessPanel();
    cleanQuestionText();
    enableSkipNext();
    buildStickyActions();
  }
  function applyQcmLoop(){
    enhanceQcm();
    if(document.body.classList.contains('qcm-page') && !document.body.dataset.premiumQcmObserver && window.MutationObserver){
      document.body.dataset.premiumQcmObserver = '1';
      const root = document.querySelector('.practice-focus-section') || document.body;
      new MutationObserver(() => {
        window.clearTimeout(window.__premiumQcmTimer);
        window.__premiumQcmTimer = window.setTimeout(enhanceQcm, 50);
      }).observe(root,{childList:true,subtree:true,characterData:true,attributes:true});
    }
  }
  function apply(){ enhanceCatalog(); enhanceReader(); applyQcmLoop(); }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { [0,120,350,900,1800,3200].forEach(ms => setTimeout(apply,ms)); });
  } else {
    [0,120,350,900,1800,3200].forEach(ms => setTimeout(apply,ms));
  }
  window.addEventListener('load', () => { [0,250,800,1600,3200].forEach(ms => setTimeout(apply,ms)); });
})();
