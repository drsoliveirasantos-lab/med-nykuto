/* v379 — smooth one-tap skip for unanswered QCM next.
   If the current card is unanswered, a tap on Siguiente first uses the native No sé action,
   then advances with the native next button. No page reload.
*/
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v379-smooth-skip-next-no-reload';
  var skipLockUntil = 0;

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function card(){ return document.querySelector('.single-question-card'); }

  function answered(c){
    return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function visibleNext(){
    var c = card();
    return c && c.querySelector('[data-action="next-question"]');
  }

  function sync(){
    if(!isPractice()) return;
    document.querySelectorAll('.single-question-card').forEach(function(c){
      c.classList.toggle('answer-ready', answered(c));
      c.querySelectorAll('[data-action="next-question"]').forEach(function(btn){
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
    if(document.getElementById('nextVisibilityV379Style')) return;
    ['nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV379Style';
    style.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}body.practice-page .single-question-card [data-action="next-question"]:disabled{opacity:1!important}';
    document.head.appendChild(style);
  }

  function clickElement(el){
    if(!el) return false;
    try{ el.disabled = false; el.removeAttribute('disabled'); }catch(e){}
    try{ el.click(); return true; }catch(e){}
    try{
      el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
      return true;
    }catch(e){ return false; }
  }

  function advanceAfterSkip(beforeId){
    sync();
    var c = card();
    if(!c) return false;
    if(beforeId && c.id && c.id !== beforeId) return true;
    if(!answered(c)) return false;
    var next = visibleNext();
    return clickElement(next);
  }

  function smoothSkipThenNext(beforeId){
    var c = card();
    if(!c) return false;
    var dontKnow = c.querySelector('[data-action="dont-know"]');
    if(!dontKnow) return false;
    clickElement(dontKnow);
    setTimeout(function(){ advanceAfterSkip(beforeId); }, 60);
    setTimeout(function(){ advanceAfterSkip(beforeId); }, 160);
    setTimeout(function(){ advanceAfterSkip(beforeId); }, 360);
    return true;
  }

  function stop(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function run(){ inject(); sync(); }

  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    if(btn && isPractice()){
      var c = card();
      if(c && !answered(c)){
        if(Date.now() < skipLockUntil){ stop(e); return; }
        skipLockUntil = Date.now() + 900;
        var beforeId = c.id || '';
        if(smoothSkipThenNext(beforeId)){
          stop(e);
          return;
        }
      }
    }
    setTimeout(run, 20);
    setTimeout(run, 120);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 30); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
