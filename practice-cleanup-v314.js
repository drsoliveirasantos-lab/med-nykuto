/* v361 — Practice visible cleanup without interval flicker.
   Keeps correction/explanation panels visible while preserving essential actions such as Reportar error.
   The previous 350ms interval could mutate the QCM card after the new question had already rendered,
   producing a visible second repaint on mobile. This version runs on load, click/change, and throttled DOM mutations only. */
(function(){
  'use strict';
  var OLD = /Med Cursos/g;
  var NEW = 'Med Nykuto';
  var pending = false;

  function isPractice(){ return document.body && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }
  function isCorrectionZone(el){ return !!(el && el.closest && el.closest('.answer-panel,.detailed-correction,.pc-card,.ppc-card,.ppc-panel,.confidence-panel,.correction-actions,.module-actions.slim')); }

  function isRawStatsText(v){
    v = clean(v);
    return /\d+\s*\/\s*\d+\s*Total\s*\d+/i.test(v)
      || /Serie\s*\d+\s*0?%?\s*Correctas\s*\d+/i.test(v)
      || /Correctas\s*\d+\s*Errores\s*\d+/i.test(v)
      || /No\s*s[eé]\s*\d+\s*Acierto\s*\d+%/i.test(v)
      || /Total\s*2900/i.test(v)
      || /Ver estad[ií]sticas/i.test(v)
      || /Inicio de sesi[oó]n/i.test(v)
      || /^1\s*\/\s*20\s*2900/i.test(v);
  }

  function replaceTextNodes(root){
    root = root || document.body;
    if(!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        var p = node.parentElement;
        if(!p || /SCRIPT|STYLE|TEXTAREA|INPUT|SELECT/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(n){
      var v = n.nodeValue || '';
      if(isPractice() && isRawStatsText(v) && !isCorrectionZone(n.parentElement)){ n.nodeValue = ''; return; }
      var nv = v.replace(OLD, NEW)
        .replace(/\bToutes\b/g,'Todas')
        .replace(/Toute la banque/g,'Toda la banca')
        .replace(/Mes points faibles/g,'Puntos débiles')
        .replace(/réussite/g,'acierto')
        .replace(/réponses/g,'respuestas')
        .replace(/erreurs/g,'errores')
        .replace(/je ne sais pas/g,'no sé')
        .replace(/Afficher/g,'Mostrar')
        .replace(/Mat\.\s*:\s*Toutes/g,'Mat.: Todas')
        .replace(/Mod\.\s*:\s*Toute la banque/g,'Mod.: Toda la banca');
      if(nv !== v) n.nodeValue = nv;
    });
  }

  function fixBrand(){
    document.title = document.title.replace(OLD, NEW);
    all('img[alt]').forEach(function(img){ img.alt = img.alt.replace(OLD, NEW); });
    all('meta[content]').forEach(function(m){ m.setAttribute('content', String(m.getAttribute('content')||'').replace(OLD, NEW)); });
    all('a.brand,a.brand-official').forEach(function(a){
      a.href = 'index.html';
      a.setAttribute('aria-label','Inicio');
      a.style.pointerEvents = 'auto';
      all('.brand-context small, small, span', a).forEach(function(el){
        if(/Med Cursos|QCM|Casos|Verdadero|V\/F/i.test(el.textContent||'')) el.textContent = NEW;
      });
    });
    all('.site-header,.nav-shell,header').forEach(function(h){
      all('strong,b,span,small,a,div,p,h1,h2', h).forEach(function(el){
        if(clean(el.textContent) === 'Med Cursos') el.textContent = NEW;
      });
    });
  }

  function forceHeaderBrand(){
    if(!isPractice()) return;
    all('.site-header .brand-context small, .site-header .brand-title, .site-header .site-title, .site-header .brand-name').forEach(function(el){ el.textContent = NEW; });
  }

  function hideElement(el){
    if(!el || el === document.body || el === document.documentElement || isCorrectionZone(el)) return;
    el.hidden = true;
    el.setAttribute('aria-hidden','true');
    el.style.setProperty('display','none','important');
  }

  function hideBySelectors(){
    if(!isPractice()) return;
    var selectors = [
      '.preanswer-tools', '.hint-panel', '.question-shortcuts',
      '[data-action="show-hint"]', '[data-action="eliminate-two"]', '[data-action="mark-review"]',
      '.session-dashboard', '.compact-dashboard', '.ultra-compact-dashboard', '.coach-banner',
      '.adaptive-dashboard', '.adaptive-card', '.local-adaptive', '.weakness-card', '.weakness-dashboard',
      '.practice-live-summary', '.question-difficulty-panel', '.session-stat', '.session-bars', '.compact-bars',
      '.difficulty-select-wrap:not(.inline-difficulty-control)', '.practice-mini-difficulty-wrap'
    ];
    selectors.forEach(function(sel){ all(sel).forEach(hideElement); });
  }

  function hideRawStatsElements(){
    if(!isPractice()) return;
    all('section,article,div,p,span,details,summary').forEach(function(el){
      if(el.hidden || isCorrectionZone(el)) return;
      var txt = clean(el.textContent || '');
      if(!txt || txt.length > 1200) return;
      if(isRawStatsText(txt)){
        var target = el.closest('.practice-card,.session-dashboard,.compact-dashboard,.ultra-compact-dashboard,details,section,article,div') || el;
        if(target !== document.body) hideElement(target);
      }
    });
  }

  function hideNonPriorityCards(){
    if(!isPractice()) return;
    all('section,article,div').forEach(function(el){
      if(el.hidden || isCorrectionZone(el)) return;
      var txt = clean(el.textContent || '');
      if(!txt || txt.length > 1200) return;
      if(/ADAPTATIF LOCAL|ADAPTATIVO LOCAL|Mes points faibles|Puntos débiles|point détecté|Ver estad[ií]sticas|Inicio de sesi[oó]n/i.test(txt)){
        var target = el.closest('.adaptive-card,.local-adaptive,.session-dashboard,.compact-dashboard,.weakness-card,.weakness-dashboard,details,section,article,div') || el;
        if(target && target !== document.body) hideElement(target);
      }
    });
  }

  function normaliseNextButton(){
    if(!isPractice()) return;
    all('[data-action="next-question"]').forEach(function(btn){
      btn.style.pointerEvents = 'auto';
      if(/Balance|Bilan|Resultado/i.test(btn.textContent||'')) return;
      if(btn.textContent !== 'Siguiente pregunta →') btn.textContent = 'Siguiente pregunta →';
    });
    all('[data-action="previous-question"]').forEach(function(btn){
      if(btn.disabled){ btn.style.opacity = '.45'; }
    });
  }

  function injectStyle(){
    if(document.getElementById('practiceCleanupV314Style')) return;
    var st = document.createElement('style');
    st.id = 'practiceCleanupV314Style';
    st.textContent = [
      'body.practice-page .preanswer-tools,body.practice-page .hint-panel,body.practice-page .question-shortcuts{display:none!important}',
      'body.practice-page .module-actions.slim{display:flex!important;visibility:visible!important}',
      'body.practice-page .module-actions.slim .report-btn{display:inline-flex!important;visibility:visible!important}',
      'body.practice-page [data-action="show-hint"],body.practice-page [data-action="eliminate-two"],body.practice-page [data-action="mark-review"]{display:none!important}',
      'body.practice-page .answer-panel{display:block!important;visibility:visible!important;max-height:none!important;overflow:visible!important}',
      'body.practice-page .answer-panel[hidden]{display:none!important}',
      'body.practice-page .unknown-action-wrap{display:flex!important;visibility:visible!important}',
      'body.practice-page .unknown-action-wrap[hidden]{display:none!important}',
      'body.practice-page [data-action="dont-know"]{display:inline-flex!important;visibility:visible!important}',
      'body.practice-page .session-dashboard,body.practice-page .compact-dashboard,body.practice-page .ultra-compact-dashboard,body.practice-page .coach-banner{display:none!important}',
      'body.practice-page .session-stat,body.practice-page .session-bars,body.practice-page .compact-bars{display:none!important}',
      'body.practice-page .adaptive-dashboard,body.practice-page .adaptive-card,body.practice-page .local-adaptive,body.practice-page .weakness-card,body.practice-page .weakness-dashboard{display:none!important}',
      'body.practice-page .practice-live-summary,body.practice-page .question-difficulty-panel,body.practice-page .practice-mini-difficulty-wrap{display:none!important}',
      'body.practice-page .practice-force-picker-shell,body.qcm-page .mc-picker-shell{margin-top:.45rem!important;margin-bottom:.72rem!important}',
      'body.practice-page .practice-list{margin-top:.2rem!important}',
      '.site-header .brand-context small{white-space:nowrap}',
      'body.practice-page .site-header .brand-context small{font-size:0!important}',
      'body.practice-page .site-header .brand-context small::after{content:"Med Nykuto";font-size:1rem!important;font-weight:900!important;color:#f8fafc!important}',
      'body.practice-page .site-header img[alt="Med Nykuto"]{max-width:34px!important;height:auto!important}',
      'body.practice-page [data-action="next-question"]{opacity:1!important;filter:none!important}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function run(){
    pending = false;
    fixBrand();
    forceHeaderBrand();
    replaceTextNodes(document.body);
    injectStyle();
    hideBySelectors();
    hideRawStatsElements();
    hideNonPriorityCards();
    normaliseNextButton();
    window.__MED_NYKUTO_PRACTICE_CLEANUP__ = 'v361-no-interval';
  }

  function scheduleRun(delay){
    if(pending) return;
    pending = true;
    setTimeout(run, typeof delay === 'number' ? delay : 60);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ scheduleRun(30); setTimeout(run, 160); }, true);
  document.addEventListener('change', function(){ scheduleRun(30); setTimeout(run, 160); }, true);
  try{ new MutationObserver(function(){ scheduleRun(70); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class','style']}); }catch(e){}
  setTimeout(run, 80);
  setTimeout(run, 240);
  setTimeout(run, 700);
})();
