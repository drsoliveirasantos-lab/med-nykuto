/* v378 — keep QCM next button enabled and let app.bundle handle the click. */
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v378-native-next-no-reload';

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function answered(card){
    return !!(card && card.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function sync(){
    if(!isPractice()) return;
    document.querySelectorAll('.single-question-card').forEach(function(card){
      card.classList.toggle('answer-ready', answered(card));
      card.querySelectorAll('[data-action="next-question"]').forEach(function(btn){
        btn.hidden = false;
        btn.disabled = false;
        btn.removeAttribute('disabled');
        btn.removeAttribute('aria-hidden');
        btn.style.pointerEvents = 'auto';
        btn.style.touchAction = 'manipulation';
      });
    });
  }

  function inject(){
    if(document.getElementById('nextVisibilityV378Style')) return;
    ['nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV378Style';
    style.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}body.practice-page .single-question-card [data-action="next-question"]:disabled{opacity:1!important}';
    document.head.appendChild(style);
  }

  function run(){ inject(); sync(); }

  document.addEventListener('click', function(){
    setTimeout(run, 20);
    setTimeout(run, 120);
  }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 30); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
