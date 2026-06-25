/* v353 — QCM progress and skip accounting fix.
   Fixes the premium progress bar reading its own stale "Pregunta 1/20" text.
   Also turns "Siguiente" on an unanswered question into a counted "No sé" before advancing. */
(function(){
  'use strict';

  var VERSION = 'v353';
  var autoAdvancing = false;
  var lastAutoAdvanceAt = 0;

  function isQcmPage(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page'));
  }
  function stop(e){
    if(!e) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function parseProgressText(s){
    var m = clean(s).match(/(?:Pregunta|Question|Quest[aã]o)?\s*(\d{1,3})\s*\/\s*(\d{1,3})/i);
    if(!m) return null;
    var current = Math.max(1, parseInt(m[1], 10) || 1);
    var total = Math.max(current, parseInt(m[2], 10) || 20);
    return {current: current, total: total, pct: Math.max(0, Math.min(100, Math.round(current / total * 100)))};
  }
  function realProgress(){
    var selectors = [
      '.single-question-card .quiz-head .badge',
      '.question-count-stat strong',
      '.single-question-card [class*="badge"]'
    ];
    var nodes = [];
    selectors.forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(n){
        if(n.closest && n.closest('.premium-progress')) return;
        if(nodes.indexOf(n) === -1) nodes.push(n);
      });
    });
    for(var i = 0; i < nodes.length; i++){
      var p = parseProgressText(nodes[i].textContent);
      if(p) return p;
    }
    return null;
  }
  function updatePremiumProgress(){
    if(!isQcmPage()) return;
    var bar = document.querySelector('.premium-progress');
    if(!bar) return;
    var p = realProgress();
    if(!p) return;
    bar.dataset.progressFixed = VERSION;
    bar.innerHTML = '<div class="premium-progress-head"><strong>Pregunta ' + p.current + '/' + p.total + '</strong><span>' + p.pct + '%</span></div><div class="premium-progress-track"><i style="width:' + p.pct + '%"></i></div>';
  }
  function scheduleProgressUpdate(){
    [0, 40, 100, 180, 320, 520].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
  }
  function questionAnswered(card){
    if(!card) return true;
    if(card.querySelector('.options[data-locked="1"]')) return true;
    if(card.querySelector('.option.correct,.option.wrong,.option.chosen')) return true;
    if(card.querySelector('.answer-panel:not([hidden])')) return true;
    return false;
  }
  function currentNextButton(){
    return document.querySelector('.single-question-card .single-nav-actions [data-action="next-question"]');
  }
  function advanceAfterUnknown(){
    var next = currentNextButton();
    if(next){
      autoAdvancing = true;
      try{ next.disabled = false; next.removeAttribute('disabled'); next.setAttribute('aria-disabled','false'); next.click(); }
      finally{
        setTimeout(function(){ autoAdvancing = false; }, 80);
      }
    }else{
      autoAdvancing = false;
    }
    scheduleProgressUpdate();
  }

  document.addEventListener('click', function(e){
    if(!isQcmPage()) return;
    var btn = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    if(!btn) return;

    scheduleProgressUpdate();
    if(autoAdvancing) return;

    var card = btn.closest('.single-question-card');
    if(!card || questionAnswered(card)) return;

    var now = Date.now();
    if(now - lastAutoAdvanceAt < 450){ stop(e); return; }
    lastAutoAdvanceAt = now;

    var dontKnow = card.querySelector('[data-action="dont-know"]');
    if(!dontKnow) return;

    stop(e);
    autoAdvancing = true;
    try{ dontKnow.click(); }catch(err){ autoAdvancing = false; return; }
    setTimeout(advanceAfterUnknown, 120);
    setTimeout(function(){ if(autoAdvancing) advanceAfterUnknown(); }, 320);
  }, true);

  function run(){
    if(!isQcmPage()) return;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    scheduleProgressUpdate();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  document.addEventListener('click', function(){ scheduleProgressUpdate(); }, true);
  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){ scheduleProgressUpdate(); }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}
})();
