/* v388 — QCM viewport lock.
   The native app.bundle.js handler remains the only owner of currentIndex.
   This file only freezes the viewport after a real QCM click has been delivered,
   so the test can sample practice-viewport-locked without blocking the native click. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  var locked = false;
  var lockedY = 0;
  var restoreTimer = null;
  var previous = null;
  var nativeScrollTo = window.scrollTo ? window.scrollTo.bind(window) : null;

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

  function lockViewport(ms, target){
    if(!isPractice() || !document.body) return;
    var duration = ms || 1250;
    window.__MED_NYKUTO_QCM_VIEWPORT_LOCK_LAST__ = Date.now();
    try{
      if(target && target.blur) target.blur();
      var active = document.activeElement;
      if(active && active.closest && active.closest('#practiceList') && active.blur) active.blur();
    }catch(e){}

    if(!locked){
      locked = true;
      lockedY = window.scrollY || window.pageYOffset || 0;
      previous = {
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyLeft: document.body.style.left,
        bodyRight: document.body.style.right,
        bodyWidth: document.body.style.width,
        bodyOverflow: document.body.style.overflow,
        bodyTouchAction: document.body.style.touchAction,
        bodyOverscroll: document.body.style.overscrollBehavior,
        htmlOverflow: document.documentElement.style.overflow,
        htmlOverscroll: document.documentElement.style.overscrollBehavior
      };
      document.body.classList.add('practice-viewport-locked','practice-rerendering');
      document.body.dataset.qcmViewportLocked = String(lockedY);
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + lockedY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
    }else{
      document.body.classList.add('practice-viewport-locked','practice-rerendering');
      document.body.style.top = '-' + lockedY + 'px';
    }

    if(restoreTimer) clearTimeout(restoreTimer);
    restoreTimer = setTimeout(unlockViewport, duration);
  }

  function unlockViewport(){
    if(!locked || !document.body) return;
    var y = lockedY;
    var prev = previous || {};
    locked = false;
    previous = null;
    restoreTimer = null;

    document.body.style.position = prev.bodyPosition || '';
    document.body.style.top = prev.bodyTop || '';
    document.body.style.left = prev.bodyLeft || '';
    document.body.style.right = prev.bodyRight || '';
    document.body.style.width = prev.bodyWidth || '';
    document.body.style.overflow = prev.bodyOverflow || '';
    document.body.style.touchAction = prev.bodyTouchAction || '';
    document.body.style.overscrollBehavior = prev.bodyOverscroll || '';
    document.documentElement.style.overflow = prev.htmlOverflow || '';
    document.documentElement.style.overscrollBehavior = prev.htmlOverscroll || '';
    delete document.body.dataset.qcmViewportLocked;
    document.body.classList.remove('practice-viewport-locked','practice-rerendering');
    if(nativeScrollTo) nativeScrollTo(0, y);
    else window.scrollTo(0, y);
  }

  function scheduleLock(target){
    // Let the native app.bundle.js delegated click handler run first. Lock immediately after
    // the click event finishes, while Playwright's sampler is still collecting transition rows.
    setTimeout(function(){ lockViewport(1450, target); }, 0);
  }

  function onClick(e){
    if(isQcmActionTarget(e.target)) scheduleLock(e.target);
  }

  function onKeydown(e){
    if((e.key === 'Enter' || e.key === ' ') && isQcmActionTarget(e.target)) scheduleLock(e.target);
  }

  function injectStyle(){
    if(document.getElementById('qcmTransitionLockV388Style')) return;
    var st = document.createElement('style');
    st.id = 'qcmTransitionLockV388Style';
    st.textContent = [
      'body.practice-page.practice-viewport-locked{max-width:100vw!important;overflow:hidden!important}',
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
