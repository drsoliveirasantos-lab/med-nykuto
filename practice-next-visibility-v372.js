/* v372 — show next only after an answer is recorded. */
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v372-answer-gated-next';

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }
  function answered(card){
    if(!card) return false;
    return !!card.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen, .option.selected');
  }
  function sync(){
    if(!isPractice()) return;
    document.querySelectorAll('.single-question-card').forEach(function(card){
      var ok = answered(card);
      card.classList.toggle('answer-ready', ok);
      card.querySelectorAll('[data-action="next-question"]').forEach(function(btn){
        if(ok){
          btn.hidden = false;
          btn.disabled = false;
          btn.removeAttribute('disabled');
          btn.style.pointerEvents = 'auto';
        }else{
          btn.hidden = true;
          btn.disabled = true;
          btn.setAttribute('disabled','');
          btn.style.pointerEvents = 'none';
        }
      });
    });
  }
  function inject(){
    if(document.getElementById('nextVisibilityV372Style')) return;
    var s = document.createElement('style');
    s.id = 'nextVisibilityV372Style';
    s.textContent = 'body.practice-page .single-question-card:not(.answer-ready) [data-action="next-question"]{display:none!important;visibility:hidden!important;pointer-events:none!important}body.practice-page .single-question-card.answer-ready [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important}';
    document.head.appendChild(s);
  }
  function run(){ inject(); sync(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 20); setTimeout(run, 120); setTimeout(run, 320); }, true);
  try{ new MutationObserver(function(){ setTimeout(run, 40); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
