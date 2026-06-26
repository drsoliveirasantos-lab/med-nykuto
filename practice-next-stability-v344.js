/* v372 — Native sticky next only, no reload fallback.
   The real app.bundle.js handler must own the practice state so currentIndex,
   answered count and progress stay synchronized. This file only improves
   mobile visibility/tap behavior for the native next button.
*/
(function(){
  'use strict';
  window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ = 'v372-native-sticky-next-no-reload';

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }

  function removeFakeBars(){
    Array.prototype.forEach.call(document.querySelectorAll('#practiceMobileNextBar, .practice-mobile-next-bar'), function(el){
      try{ el.remove(); }catch(e){}
    });
  }

  function currentCard(){ return document.querySelector('.single-question-card'); }

  function hasAnsweredCurrentQuestion(){
    var card = currentCard();
    return !!(card && card.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function normalizeNativeNext(){
    if(!isPractice()) return;
    removeFakeBars();
    var card = currentCard();
    var nav = card && card.querySelector('.single-nav-actions');
    var next = nav && nav.querySelector('[data-action="next-question"]');
    if(!nav || !next){
      document.body.classList.remove('has-native-sticky-next');
      return;
    }

    nav.classList.add('native-sticky-next-actions');
    next.classList.add('native-sticky-next-button');
    next.removeAttribute('aria-hidden');
    next.style.pointerEvents = 'auto';
    next.style.touchAction = 'manipulation';

    if(hasAnsweredCurrentQuestion()){
      next.disabled = false;
      next.removeAttribute('disabled');
      document.body.classList.add('has-native-sticky-next');
    }else{
      document.body.classList.remove('has-native-sticky-next');
    }
  }

  function injectCss(){
    if(document.getElementById('practice-native-next-v372-css')) return;
    ['practice-native-next-v371-css','practice-native-next-v370-css','practice-native-next-v369-css','practice-mobile-next-css-v368','practice-mobile-next-css-v367'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'practice-native-next-v372-css';
    style.textContent = [
      '#practiceMobileNextBar,.practice-mobile-next-bar{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      '@media (max-width:760px){',
      '  body.practice-page.has-native-sticky-next{padding-bottom:calc(140px + env(safe-area-inset-bottom,0px))!important}',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions{',
      '    position:sticky; bottom:calc(76px + env(safe-area-inset-bottom,0px)); z-index:500;',
      '    display:grid!important; grid-template-columns:1fr; gap:8px; padding:10px!important; margin:14px 0 4px!important;',
      '    border-radius:18px; background:rgba(11,18,32,.94); border:1px solid rgba(148,163,184,.26);',
      '    box-shadow:0 16px 38px rgba(0,0,0,.34); backdrop-filter:blur(10px); pointer-events:auto!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="previous-question"]{display:none!important}',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="next-question"]{',
      '    display:flex!important; align-items:center; justify-content:center; width:100%!important; min-height:50px!important;',
      '    border-radius:15px!important; font-size:1rem!important; font-weight:950!important; pointer-events:auto!important; touch-action:manipulation!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="next-question"]:disabled{opacity:.45!important}',
      '}',
      '@media (min-width:761px){body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions{position:static!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function run(){
    if(!isPractice()) return;
    injectCss();
    normalizeNativeNext();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  window.addEventListener('resize', run);
  document.addEventListener('click', function(){
    setTimeout(run, 40);
    setTimeout(run, 180);
    setTimeout(run, 520);
  }, true);
  try{
    var queued = false;
    new MutationObserver(function(){
      if(queued) return;
      queued = true;
      setTimeout(function(){ queued = false; run(); }, 50);
    }).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['hidden','disabled','class']});
  }catch(e){}
})();
