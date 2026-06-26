/* v388 — native visible Next + broad QCM viewport lock.
   This file keeps the native Siguiente handler as the only owner of currentIndex.
   It also contains the transition viewport lock directly in the already-loaded controller,
   so tests and production pages cannot stay stuck on the old v387 flag when the extra file
   is delayed, cached, or not loaded by the test server. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  var transitionUntil = 0;
  var lockedScrollY = null;
  var restoreTimer = null;
  var nativeScrollToRef = null;
  var nativeScrollByRef = null;
  var bodyLock = null;
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function hasScope(){
    try{
      var p = new URLSearchParams(location.search || '');
      return !!(p.get('course') || p.get('module'));
    }catch(e){ return false; }
  }

  function inTransition(){
    return isPractice() && Date.now() < transitionUntil;
  }

  function nativeScrollTo(x, y){
    var fn = nativeScrollToRef || window.scrollTo;
    if(typeof fn === 'function') return fn.call(window, x, y);
  }

  function readCurrentScrollY(){
    return Math.round(window.scrollY || window.pageYOffset || 0);
  }

  function blurPracticeFocus(target){
    try{
      if(target && target.blur) target.blur();
      var active = document.activeElement;
      if(active && active.closest && active.closest('#practiceList') && active.blur) active.blur();
    }catch(e){}
  }

  function lockBodyViewport(){
    if(!isPractice() || !document.body) return;
    var y = lockedScrollY == null ? readCurrentScrollY() : lockedScrollY;
    if(bodyLock){
      document.body.style.top = '-' + y + 'px';
      document.body.classList.add('practice-rerendering','practice-viewport-locked');
      return;
    }
    bodyLock = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      touchAction: document.body.style.touchAction,
      overscrollBehavior: document.body.style.overscrollBehavior,
      htmlOverflow: document.documentElement.style.overflow,
      htmlOverscrollBehavior: document.documentElement.style.overscrollBehavior
    };
    document.body.classList.add('practice-rerendering','practice-viewport-locked');
    document.body.dataset.qcmViewportLocked = String(y);
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + y + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    window.__MED_NYKUTO_QCM_VIEWPORT_LOCK_LAST__ = Date.now();
  }

  function unlockBodyViewport(){
    if(!bodyLock || !document.body) return;
    var y = lockedScrollY == null ? parseInt(document.body.dataset.qcmViewportLocked || '0', 10) || 0 : lockedScrollY;
    var saved = bodyLock;
    bodyLock = null;
    document.body.style.position = saved.position || '';
    document.body.style.top = saved.top || '';
    document.body.style.left = saved.left || '';
    document.body.style.right = saved.right || '';
    document.body.style.width = saved.width || '';
    document.body.style.overflow = saved.overflow || '';
    document.body.style.touchAction = saved.touchAction || '';
    document.body.style.overscrollBehavior = saved.overscrollBehavior || '';
    document.documentElement.style.overflow = saved.htmlOverflow || '';
    document.documentElement.style.overscrollBehavior = saved.htmlOverscrollBehavior || '';
    delete document.body.dataset.qcmViewportLocked;
    document.body.classList.remove('practice-rerendering','practice-viewport-locked');
    nativeScrollTo(0, y);
  }

  function restoreLockedScroll(){
    if(!inTransition() || lockedScrollY == null) return;
    if(bodyLock && document.body){
      document.body.style.top = '-' + lockedScrollY + 'px';
      return;
    }
    if(Math.abs(readCurrentScrollY() - lockedScrollY) > 1) nativeScrollTo(0, lockedScrollY);
  }

  function clearTransitionIfDone(){
    if(Date.now() < transitionUntil) return;
    if(restoreTimer) clearInterval(restoreTimer);
    restoreTimer = null;
    unlockBodyViewport();
    if(lockedScrollY != null) nativeScrollTo(0, lockedScrollY);
    lockedScrollY = null;
  }

  function scheduleScrollLock(ms){
    if(restoreTimer) clearInterval(restoreTimer);
    restoreTimer = setInterval(function(){
      if(!inTransition()){
        clearTransitionIfDone();
        return;
      }
      restoreLockedScroll();
    }, 8);
    setTimeout(clearTransitionIfDone, ms || 1150);
  }

  function markTransition(ms, target){
    if(!isPractice()) return;
    var duration = ms || 1150;
    if(lockedScrollY == null) lockedScrollY = readCurrentScrollY();
    transitionUntil = Math.max(transitionUntil, Date.now() + duration);
    blurPracticeFocus(target);
    lockBodyViewport();
    scheduleScrollLock(duration + 120);
  }

  function answered(c){
    return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
  }

  function isPracticeActionTarget(target){
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

  function patchEmptyPracticeListRender(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoNextStableRenderV388) return;
    Object.defineProperty(Element.prototype, 'innerHTML', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function(){ return desc.get.call(this); },
      set: function(value){
        if(isPracticeList(this) && String(value || '') === ''){
          this.dataset.renderStableSkippedEmpty = String(Date.now());
          window.__MED_NYKUTO_RENDER_STABILITY_LAST_SKIP__ = Date.now();
          return;
        }
        return desc.set.call(this, value);
      }
    });
    Object.defineProperty(Element.prototype, '__medNykutoNextStableRenderV388', {value:true});
  }

  function patchReplaceChildren(){
    if(Element.prototype.__medNykutoNextStableReplaceChildrenV388) return;
    var nativeReplaceChildren = Element.prototype.replaceChildren;
    if(typeof nativeReplaceChildren !== 'function') return;
    Element.prototype.replaceChildren = function(){
      if(isPracticeList(this) && arguments.length === 0){
        this.dataset.renderStableSkippedEmpty = String(Date.now());
        window.__MED_NYKUTO_RENDER_STABILITY_LAST_SKIP__ = Date.now();
        return;
      }
      return nativeReplaceChildren.apply(this, arguments);
    };
    Object.defineProperty(Element.prototype, '__medNykutoNextStableReplaceChildrenV388', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoNextStableScrollV388) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isPractice() && this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel, [data-action="next-question"], [data-action="previous-question"], .option')){
        if(inTransition()){
          restoreLockedScroll();
          return;
        }
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        if(!opts.block) opts.block = 'nearest';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };
    Object.defineProperty(Element.prototype, '__medNykutoNextStableScrollV388', {value:true});
  }

  function patchFocus(){
    if(HTMLElement.prototype.__medNykutoNextStableFocusV388) return;
    var nativeFocus = HTMLElement.prototype.focus;
    if(typeof nativeFocus !== 'function') return;
    HTMLElement.prototype.focus = function(options){
      if(isPractice() && this && this.closest && this.closest('#practiceList')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.preventScroll = true;
        try{ return nativeFocus.call(this, opts); }
        catch(e){ return nativeFocus.call(this); }
      }
      return nativeFocus.apply(this, arguments);
    };
    Object.defineProperty(HTMLElement.prototype, '__medNykutoNextStableFocusV388', {value:true});
  }

  function patchWindowScroll(){
    if(window.__medNykutoNextStableWindowScrollV388) return;
    var nativeScrollToFn = window.scrollTo;
    var nativeScrollByFn = window.scrollBy;
    if(typeof nativeScrollToFn === 'function' && !nativeScrollToRef) nativeScrollToRef = nativeScrollToFn;
    if(typeof nativeScrollByFn === 'function' && !nativeScrollByRef) nativeScrollByRef = nativeScrollByFn;
    if(typeof nativeScrollToFn === 'function'){
      window.scrollTo = function(){
        if(inTransition()){
          if(lockedScrollY == null) lockedScrollY = readCurrentScrollY();
          return restoreLockedScroll();
        }
        return nativeScrollToFn.apply(window, arguments);
      };
    }
    if(typeof nativeScrollByFn === 'function'){
      window.scrollBy = function(){
        if(inTransition()){
          if(lockedScrollY == null) lockedScrollY = readCurrentScrollY();
          return restoreLockedScroll();
        }
        return nativeScrollByFn.apply(window, arguments);
      };
    }
    Object.defineProperty(window, '__medNykutoNextStableWindowScrollV388', {value:true});
  }

  function sync(){
    if(!isPractice()) return;
    var scoped = hasScope();
    document.body.classList.toggle('practice-has-scope', scoped);
    if(scoped) document.body.classList.add('practice-focus');
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

  function bindDirectButtons(){
    if(!isPractice()) return;
    document.querySelectorAll('#practiceList [data-action="next-question"], #practiceList [data-action="previous-question"], #practiceList .option').forEach(function(el){
      if(el.dataset.qcmViewportLockBound === 'v388') return;
      el.dataset.qcmViewportLockBound = 'v388';
      ['pointerdown','touchstart','mousedown'].forEach(function(type){
        el.addEventListener(type, function(ev){ markTransition(950, ev.currentTarget); }, true);
      });
      el.addEventListener('click', function(ev){ markTransition(1150, ev.currentTarget); }, true);
    });
  }

  function inject(){
    if(document.getElementById('nextVisibilityV388Style')) return;
    ['nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style','practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV388Style';
    style.textContent = [
      'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.practice-page .single-question-card [data-action="next-question"]:disabled{opacity:1!important}',
      'body.practice-page #practiceList{min-height:70vh;overflow-anchor:none!important}',
      'body.practice-page .single-question-card,body.practice-page .practice-headbox{scroll-margin-top:92px}',
      'body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero,body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero{display:none!important;visibility:hidden!important}',
      'html:has(body.practice-page){scroll-behavior:auto!important}',
      'html:has(body.practice-rerendering),body.practice-page.practice-rerendering{scroll-behavior:auto!important;overflow-anchor:none!important}',
      'body.practice-page.practice-rerendering *,body.practice-page.practice-rerendering .single-question-card,body.practice-page.practice-rerendering .option,body.practice-page.practice-rerendering .btn{scroll-behavior:auto!important;transition:none!important;animation:none!important}',
      'body.practice-page.practice-rerendering #practiceList{contain:layout paint;will-change:auto;overflow-anchor:none!important}',
      'body.practice-page.practice-viewport-locked{max-width:100vw!important;overflow:hidden!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    patchEmptyPracticeListRender();
    patchReplaceChildren();
    patchScrollIntoView();
    patchFocus();
    patchWindowScroll();
    inject();
    sync();
    bindDirectButtons();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  function onPreAction(e){
    if(isPracticeActionTarget(e.target)) markTransition(950, e.target);
  }

  function onClick(e){
    if(isPracticeActionTarget(e.target)) markTransition(1150, e.target);
    setTimeout(run, 0);
    setTimeout(run, 20);
    setTimeout(run, 120);
    setTimeout(run, 360);
  }

  document.addEventListener('pointerdown', onPreAction, true);
  document.addEventListener('touchstart', onPreAction, true);
  document.addEventListener('mousedown', onPreAction, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && isPracticeActionTarget(e.target)) markTransition(1150, e.target);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 0); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class','style']}); }catch(e){}
})();
