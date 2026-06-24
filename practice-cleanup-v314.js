/* v315 — Aggressive visible cleanup for practice pages.
   Fixes old brand text, removes legacy raw stats, and hides non-priority adaptive/error dashboard. */
(function(){
  'use strict';
  var OLD = /Med Cursos/g;
  var NEW = 'Med Nykuto';

  function isPractice(){ return document.body && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }

  function isRawStatsText(v){
    v = clean(v);
    return /\d+\s*\/\s*\d+\s*Total\s*\d+/i.test(v)
      || /Serie\s*\d+\s*0?%?\s*Correctas\s*\d+/i.test(v)
      || /Correctas\s*\d+\s*Errores\s*\d+/i.test(v)
      || /No\s*s[eé]\s*\d+\s*Acierto\s*\d+%/i.test(v)
      || /Total\s*2900/i.test(v);
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
      if(isPractice() && isRawStatsText(v)){ n.nodeValue = ''; return; }
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
        if(/Med Cursos/i.test(el.textContent||'')) el.textContent = NEW;
      });
    });
    all('.site-header,.nav-shell,header').forEach(function(h){
      all('strong,b,span,small,a,div,p', h).forEach(function(el){
        if(clean(el.textContent) === 'Med Cursos') el.textContent = NEW;
      });
    });
  }

  function fixPracticeHeaderTitle(){
    if(!isPractice()) return;
    var mode = 'Med Nykuto';
    if(document.body.classList.contains('qcm-page')) mode = 'Med Nykuto';
    if(document.body.classList.contains('cas-cliniques-page')) mode = 'Med Nykuto';
    if(document.body.classList.contains('vrai-faux-page')) mode = 'Med Nykuto';
    all('.site-header .brand-context small, .site-header .brand-title, .site-header .site-title, .site-header .brand-name').forEach(function(el){
      if(/Med Cursos/i.test(el.textContent||'') || /QCM|Casos|Verdadero|V\/F/i.test(el.textContent||'')) el.textContent = mode;
    });
  }

  function hideElement(el){
    if(!el || el === document.body || el === document.documentElement) return;
    el.hidden = true;
    el.setAttribute('aria-hidden','true');
    el.style.setProperty('display','none','important');
  }

  function hideBySelectors(){
    if(!isPractice()) return;
    var selectors = [
      '.session-dashboard', '.compact-dashboard', '.ultra-compact-dashboard', '.coach-banner',
      '.adaptive-dashboard', '.adaptive-card', '.local-adaptive', '.weakness-card', '.weakness-dashboard',
      '.practice-live-summary', '.question-difficulty-panel', '.session-stat', '.session-bars', '.compact-bars',
      '.difficulty-select-wrap:not(.inline-difficulty-control)', '.practice-mini-difficulty-wrap'
    ];
    selectors.forEach(function(sel){ all(sel).forEach(hideElement); });
  }

  function hideRawStatsElements(){
    if(!isPractice()) return;
    all('section,article,div,p,span').forEach(function(el){
      if(el.hidden) return;
      var txt = clean(el.textContent || '');
      if(!txt || txt.length > 260) return;
      if(isRawStatsText(txt)) hideElement(el);
    });
  }

  function hideNonPriorityCards(){
    if(!isPractice()) return;
    all('section,article,div').forEach(function(el){
      if(el.hidden) return;
      var txt = clean(el.textContent || '');
      if(!txt || txt.length > 900) return;
      if(/ADAPTATIF LOCAL|ADAPTATIVO LOCAL|Mes points faibles|Puntos débiles|point détecté|réussite|je ne sais pas/i.test(txt)){
        var target = el.closest('.practice-card,.adaptive-card,.local-adaptive,.session-dashboard,.compact-dashboard,.weakness-card,.weakness-dashboard') || el;
        if(target && target !== document.body) hideElement(target);
      }
    });
  }

  function injectStyle(){
    if(document.getElementById('practiceCleanupV314Style')) return;
    var st = document.createElement('style');
    st.id = 'practiceCleanupV314Style';
    st.textContent = [
      'body.practice-page .session-dashboard,body.practice-page .compact-dashboard,body.practice-page .ultra-compact-dashboard,body.practice-page .coach-banner{display:none!important}',
      'body.practice-page .session-stat,body.practice-page .session-bars,body.practice-page .compact-bars{display:none!important}',
      'body.practice-page .adaptive-dashboard,body.practice-page .adaptive-card,body.practice-page .local-adaptive,body.practice-page .weakness-card,body.practice-page .weakness-dashboard{display:none!important}',
      'body.practice-page .practice-live-summary,body.practice-page .question-difficulty-panel,body.practice-page .practice-mini-difficulty-wrap{display:none!important}',
      'body.practice-page .practice-force-picker-shell,body.qcm-page .mc-picker-shell{margin-top:.45rem!important;margin-bottom:.72rem!important}',
      'body.practice-page .practice-list{margin-top:.2rem!important}',
      '.site-header .brand-context small{white-space:nowrap}',
      'body.practice-page .site-header .brand-context small{font-size:0!important}',
      'body.practice-page .site-header .brand-context small::after{content:"Med Nykuto";font-size:1rem!important;font-weight:900!important;color:#f8fafc!important}',
      'body.practice-page .site-header img[alt="Med Nykuto"]{max-width:34px!important;height:auto!important}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function run(){
    fixBrand();
    fixPracticeHeaderTitle();
    replaceTextNodes(document.body);
    injectStyle();
    hideBySelectors();
    hideRawStatsElements();
    hideNonPriorityCards();
    window.__MED_NYKUTO_PRACTICE_CLEANUP__ = 'v315';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 40); setTimeout(run, 180); }, true);
  document.addEventListener('change', function(){ setTimeout(run, 40); setTimeout(run, 180); }, true);
  setTimeout(run, 100);
  setTimeout(run, 350);
  setTimeout(run, 900);
  setInterval(run, 550);
})();
