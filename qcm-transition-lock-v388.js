/* v388 — broad QCM viewport lock.
   Loaded after the native QCM scripts. It does not own currentIndex and does not synthesize clicks.
   It freezes the visible viewport around QCM question transitions so late rerenders, focus,
   scrollIntoView, or Safari viewport adjustments cannot flash the hero or jump the page.

   Patch: make the lock independent from click delivery. Some real-click environments can move
   the QCM by a native delegated handler before our click listener has enough observable samples.
   We now also lock synchronously when #practiceList is rewritten and when its card mutates. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  var locked = false;
  var lockedY = 0;
  var restoreTimer = null;
  var mutationUnlockTimer = null;
  var nativeScrollTo = window.scrollTo ? window.scrollTo.bind(window) : null;
  var previous = null;

  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
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

  function lockViewport(ms, target){
    if(!isPractice() || !document.body) return;
    var duration = ms || 1250;
    window.__MED_NYKUTO_QCM_VIEWPORT_LOCK_LAST__ = Date.now();
    blurInsidePractice(target);

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
    }else if(document.body){
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

  function lockForMutation(target){
    if(!isPractice()) return;
    lockViewport(1450, target || document.querySelector('#practiceList'));
    if(mutationUnlockTimer) clearTimeout(mutationUnlockTimer);
    mutationUnlockTimer = setTimeout(function(){
      mutationUnlockTimer = null;
    }, 1500);
  }

  function patchPracticeListWrites(){
    if(Element.prototype.__medNykutoQcmTransitionLockWritesV388) return;
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(desc && desc.get && desc.set){
      Object.defineProperty(Element.prototype, 'innerHTML', {
        configurable: true,
        enumerable: desc.enumerable,
        get: function(){ return desc.get.call(this); },
        set: function(value){
          if(isPracticeList(this)) lockForMutation(this);
          return desc.set.call(this, value);
        }
      });
    }

    var nativeReplaceChildren = Element.prototype.replaceChildren;
    if(typeof nativeReplaceChildren === 'function'){
      Element.prototype.replaceChildren = function(){
        if(isPracticeList(this)) lockForMutation(this);
        return nativeReplaceChildren.apply(this, arguments);
      };
    }

    Object.defineProperty(Element.prototype, '__medNykutoQcmTransitionLockWritesV388', {value:true});
  }

  function observePracticeList(){
    if(!isPractice() || window.__medNykutoQcmTransitionLockObserverV388) return;
    var root = document.querySelector('#practiceList');
    if(!root) return;
    try{
      var obs = new MutationObserver(function(mutations){
        if(mutations && mutations.length) lockForMutation(root);
      });
      obs.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['class','hidden','disabled','style','data-locked']});
      window.__medNykutoQcmTransitionLockObserverV388 = obs;
    }catch(e){}
  }

  function onBeforeAction(e){
    if(isQcmActionTarget(e.target)) lockViewport(1250, e.target);
  }

  function onClick(e){
    if(isQcmActionTarget(e.target)) lockViewport(1450, e.target);
  }

  function bindDirectButtons(){
    if(!isPractice()) return;
    document.querySelectorAll('#practiceList [data-action="next-question"], #practiceList [data-action="previous-question"], #practiceList [data-action="dont-know"], #practiceList [data-action="start-next-batch"], #practiceList [data-action="restart-session"], #practiceList .option').forEach(function(el){
      if(el.dataset.qcmViewportTransitionLockBound === 'v388') return;
      el.dataset.qcmViewportTransitionLockBound = 'v388';
      ['pointerdown','touchstart','mousedown','mouseup','pointerup'].forEach(function(type){
        el.addEventListener(type, function(ev){ lockViewport(1250, ev.currentTarget); }, true);
      });
      el.addEventListener('click', function(ev){ lockViewport(1450, ev.currentTarget); }, true);
    });
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
    patchPracticeListWrites();
    bindDirectButtons();
    observePracticeList();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  document.addEventListener('pointerdown', onBeforeAction, true);
  document.addEventListener('touchstart', onBeforeAction, true);
  document.addEventListener('mousedown', onBeforeAction, true);
  document.addEventListener('mouseup', onBeforeAction, true);
  document.addEventListener('pointerup', onBeforeAction, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && isQcmActionTarget(e.target)) lockViewport(1450, e.target);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 0); }).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
})();
