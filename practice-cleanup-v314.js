/* v314 — Final visible cleanup for practice pages.
   Fixes old brand text, hides non-priority adaptive/error dashboard, and cleans mixed FR/ES labels. */
(function(){
  'use strict';
  var OLD = /Med Cursos/g;
  var NEW = 'Med Nykuto';

  function isPractice(){ return document.body && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }

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
    all('meta[content]').forEach(function(m){ m.setAttribute('content', m.getAttribute('content').replace(OLD, NEW)); });
    all('a.brand,a.brand-official').forEach(function(a){
      a.href = 'index.html';
      a.setAttribute('aria-label','Inicio');
      a.style.pointerEvents = 'auto';
    });
  }

  function hideElement(el){
    if(!el || el === document.body || el === document.documentElement) return;
    el.hidden = true;
    el.setAttribute('aria-hidden','true');
    el.style.display = 'none';
  }

  function hideBySelectors(){
    if(!isPractice()) return;
    var selectors = [
      '.session-dashboard',
      '.compact-dashboard',
      '.ultra-compact-dashboard',
      '.coach-banner',
      '.adaptive-dashboard',
      '.adaptive-card',
      '.local-adaptive',
      '.weakness-card',
      '.weakness-dashboard',
      '.practice-live-summary',
      '.question-difficulty-panel'
    ];
    selectors.forEach(function(sel){ all(sel).forEach(hideElement); });
  }

  function hideNonPriorityCards(){
    if(!isPractice()) return;
    all('section,article,div').forEach(function(el){
      if(el.hidden || el.offsetParent === null) return;
      var txt = clean(el.textContent || '');
      if(!txt || txt.length > 900) return;
      if(/ADAPTATIF LOCAL|ADAPTATIVO LOCAL|Mes points faibles|Puntos débiles|point détecté|réussite|je ne sais pas/i.test(txt)){
        var target = el.closest('.practice-card,.adaptive-card,.local-adaptive,.session-dashboard,.compact-dashboard,section,article,div') || el;
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
      'body.practice-page .adaptive-dashboard,body.practice-page .adaptive-card,body.practice-page .local-adaptive,body.practice-page .weakness-card,body.practice-page .weakness-dashboard{display:none!important}',
      'body.practice-page .practice-live-summary,body.practice-page .question-difficulty-panel{display:none!important}',
      'body.practice-page .practice-force-picker-shell,body.qcm-page .mc-picker-shell{margin-top:.45rem!important;margin-bottom:.72rem!important}',
      'body.practice-page .practice-list{margin-top:.2rem!important}',
      '.site-header .brand-context small{white-space:nowrap}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function run(){
    fixBrand();
    replaceTextNodes(document.body);
    injectStyle();
    hideBySelectors();
    hideNonPriorityCards();
    window.__MED_NYKUTO_PRACTICE_CLEANUP__ = 'v314';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 80); }, true);
  document.addEventListener('change', function(){ setTimeout(run, 80); }, true);
  setTimeout(run, 350);
  setTimeout(run, 1000);
  setInterval(run, 1800);
})();
