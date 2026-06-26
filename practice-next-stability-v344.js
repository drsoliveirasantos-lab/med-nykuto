/* v372 — Native sticky next without delayed repaint.
   The real app.bundle.js handler owns the practice state. This file only provides
   stable CSS for the native Next area; it must not re-style the card after each click. */
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
      '  body.practice-page{padding-bottom:calc(92px + env(safe-area-inset-bottom,0px))!important}',
      '  body.practice-page .single-question-card .single-nav-actions{',
      '    position:sticky!important; bottom:calc(76px + env(safe-area-inset-bottom,0px))!important; z-index:500!important;',
      '    display:grid!important; grid-template-columns:1fr!important; gap:8px!important; padding:10px!important; margin:14px 0 4px!important;',
      '    border-radius:18px!important; background:rgba(11,18,32,.94)!important; border:1px solid rgba(148,163,184,.26)!important;',
      '    box-shadow:0 16px 38px rgba(0,0,0,.34)!important; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); pointer-events:auto!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions [data-action="previous-question"]{display:none!important}',
      '  body.practice-page .single-question-card .single-nav-actions [data-action="next-question"]{',
      '    display:flex!important; align-items:center!important; justify-content:center!important; width:100%!important; min-height:50px!important;',
      '    border-radius:15px!important; font-size:1rem!important; font-weight:950!important; pointer-events:auto!important; touch-action:manipulation!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions [data-action="next-question"]:disabled{display:none!important}',
      '}',
      '@media (min-width:761px){body.practice-page .single-question-card .single-nav-actions{position:static!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function run(){
    if(!isPractice()) return;
    injectCss();
    removeFakeBars();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
})();
