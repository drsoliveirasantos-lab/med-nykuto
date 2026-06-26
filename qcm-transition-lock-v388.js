/* v388 — QCM transition marker.
   The native app.bundle.js handler remains the only owner of currentIndex.
   This file must not freeze touch/scroll. It only marks a very short rerender window
   so the QCM transition does not animate or flash while preserving native mobile scroll. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  var markTimer = null;

  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function isQcmActionTarget(target){
    if(!isPractice() || !target || !target.closest) return false;
    return !!target.closest([
      '#practiceList [data-action="next-question"]',
      '#practiceList [data-action="previous-question"]',
      '#practiceList [data-action="dont-know"]',
      '#practiceList [data-action="restart-session"]',
      '#practiceList [data-action="start-next-batch"]',
      '#practiceList .option',
      '#practiceList button.option',
      '.single-question-card [data-action="next-question"]',
      '.single-question-card [data-action="previous-question"]',
      '.single-question-card .option'
    ].join(','));
  }

  function blurInsidePractice(target){
    try{
      if(target && target.blur) target.blur();
      var active = document.activeElement;
      if(active && active.closest && active.closest('#practiceList') && active.blur) active.blur();
    }catch(e){}
  }

  function markTransition(ms, target){
    if(!isPractice() || !document.body) return;
    var duration = ms || 220;
    window.__MED_NYKUTO_QCM_VIEWPORT_LOCK_LAST__ = Date.now();
    blurInsidePractice(target);

    document.body.classList.add('practice-viewport-locked','practice-rerendering');
    document.body.dataset.qcmViewportLocked = String(Date.now());

    if(markTimer) clearTimeout(markTimer);
    markTimer = setTimeout(function(){
      markTimer = null;
      if(!document.body) return;
      delete document.body.dataset.qcmViewportLocked;
      document.body.classList.remove('practice-viewport-locked','practice-rerendering');
    }, duration);
  }

  function scheduleMark(target){
    // Let the native delegated click handler update the question first, then mark only
    // the short repaint window. Never set body position:fixed, overflow:hidden or touch-action:none.
    setTimeout(function(){ markTransition(220, target); }, 0);
  }

  function onClick(e){
    if(isQcmActionTarget(e.target)) scheduleMark(e.target);
  }

  function onKeydown(e){
    if((e.key === 'Enter' || e.key === ' ') && isQcmActionTarget(e.target)) scheduleMark(e.target);
  }

  function injectStyle(){
    if(document.getElementById('qcmTransitionLockV388Style')) return;
    var st = document.createElement('style');
    st.id = 'qcmTransitionLockV388Style';
    st.textContent = [
      'body.practice-page.practice-viewport-locked{max-width:100vw!important}',
      'body.practice-page.practice-rerendering *,body.practice-page.practice-rerendering .single-question-card,body.practice-page.practice-rerendering .option,body.practice-page.practice-rerendering .btn{transition:none!important;animation:none!important;scroll-behavior:auto!important}',
      'body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero,body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero{display:none!important;visibility:hidden!important}',
      'body.practice-page #practiceList{overflow-anchor:none!important}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function run(){
    injectStyle();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeydown, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
})();
