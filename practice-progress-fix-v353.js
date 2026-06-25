/* v354 — QCM progress and skip accounting fix.
   Fixes the premium progress bar reading stale text, without constantly repainting it.
   Also turns "Siguiente" on an unanswered question into a counted "No sé" before advancing. */
(function(){
  'use strict';

  var VERSION = 'v354';
  var autoAdvancing = false;
  var lastAutoAdvanceAt = 0;
  var pendingProgressTimer = 0;
  var lastSignature = '';

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
    var nodes = [];
    ['.single-question-card .quiz-head .badge', '.question-count-stat strong', '.single-question-card [class*="badge"]'].forEach(function(sel){
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
  function ensureProgressStructure(bar){
    var head = bar.querySelector('.premium-progress-head');
    var strong = head && head.querySelector('strong');
    var span = head && head.querySelector('span');
    var track = bar.querySelector('.premium-progress-track');
    var fill = track && track.querySelector('i');
    if(strong && span && fill) return {strong:strong, span:span, fill:fill};

    bar.innerHTML = '<div class="premium-progress-head"><strong></strong><span></span></div><div class="premium-progress-track"><i></i></div>';
    return {
      strong: bar.querySelector('.premium-progress-head strong'),
      span: bar.querySelector('.premium-progress-head span'),
      fill: bar.querySelector('.premium-progress-track i')
    };
  }
  function updatePremiumProgress(){
    pendingProgressTimer = 0;
    if(!isQcmPage()) return;
    var bar = document.querySelector('.premium-progress');
    if(!bar) return;
    var p = realProgress();
    if(!p) return;

    var signature = p.current + '/' + p.total + '/' + p.pct;
    if(bar.dataset.progressSignature === signature && lastSignature === signature) return;

    var parts = ensureProgressStructure(bar);
    var label = 'Pregunta ' + p.current + '/' + p.total;
    var pctText = p.pct + '%';
    var width = p.pct + '%';

    if(parts.strong && parts.strong.textContent !== label) parts.strong.textContent = label;
    if(parts.span && parts.span.textContent !== pctText) parts.span.textContent = pctText;
    if(parts.fill && parts.fill.style.width !== width) parts.fill.style.width = width;

    bar.dataset.progressFixed = VERSION;
    bar.dataset.progressSignature = signature;
    lastSignature = signature;
  }
  function scheduleProgressUpdate(delay){
    if(pendingProgressTimer) clearTimeout(pendingProgressTimer);
    pendingProgressTimer = setTimeout(updatePremiumProgress, delay == null ? 60 : delay);
  }
  function scheduleAfterRender(){
    [40, 140, 320].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
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
      try{
        next.disabled = false;
        next.removeAttribute('disabled');
        next.setAttribute('aria-disabled','false');
        next.click();
      } finally {
        setTimeout(function(){ autoAdvancing = false; }, 120);
      }
    }else{
      autoAdvancing = false;
    }
    scheduleAfterRender();
  }

  document.addEventListener('click', function(e){
    if(!isQcmPage()) return;
    var btn = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    if(!btn) return;

    scheduleAfterRender();
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
    setTimeout(advanceAfterUnknown, 140);
    setTimeout(function(){ if(autoAdvancing) advanceAfterUnknown(); }, 360);
  }, true);

  function run(){
    if(!isQcmPage()) return;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    scheduleAfterRender();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  document.addEventListener('click', function(){ scheduleProgressUpdate(120); }, true);
  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){ scheduleProgressUpdate(90); }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}
})();
