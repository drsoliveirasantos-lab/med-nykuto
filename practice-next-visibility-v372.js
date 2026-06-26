/* v386 — native visible next + real scroll/focus lock.
   Keeps the native Siguiente handler as the only owner of currentIndex.
   Fixes the remaining mobile flicker caused by a delayed scroll/focus jump: the previous
   lock called the patched window.scrollTo recursively, so the restoration was ineffective.
   This version keeps a native scrollTo reference, marks transitions on pointer/touch start,
   and forces practice focus calls to use preventScroll. No overlay, no duplicate progress
   layer, no synthetic No sé + Next sequence.
*/
(function(){
  'use strict';
  var VERSION = 'v386-native-next-real-scroll-focus-lock';
  var transitionUntil = 0;
  var lockedScrollY = null;
  var restoreTimer = null;
  var nativeScrollToRef = null;
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

  function restoreLockedScroll(){
    if(!inTransition() || lockedScrollY == null) return;
    if(Math.abs(window.scrollY - lockedScrollY) > 1) nativeScrollTo(0, lockedScrollY);
  }

  function clearTransitionIfDone(){
    if(Date.now() < transitionUntil) return;
    if(restoreTimer) clearInterval(restoreTimer);
    restoreTimer = null;
    if(lockedScrollY != null) nativeScrollTo(0, lockedScrollY);
    lockedScrollY = null;
    if(document.body) document.body.classList.remove('practice-rerendering');
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
    setTimeout(clearTransitionIfDone, ms || 1800);
  }

  function blurPracticeFocus(target){
    try{
      if(target && target.blur) target.blur();
      var active = document.activeElement;
      if(active && active.closest && active.closest('#practiceList') && active.blur) active.blur();
    }catch(e){}
  }

  function markTransition(ms, target){
    var duration = ms || 1800;
    if(lockedScrollY == null) lockedScrollY = window.scrollY;
    transitionUntil = Math.max(transitionUntil, Date.now() + duration);
    blurPracticeFocus(target);
    if(document.body) document.body.classList.add('practice-rerendering');
    scheduleScrollLock(duration + 140);
  }

  function answered(c){
    return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
  }

  function isPracticeActionTarget(target){
    return !!(target && target.closest && target.closest('#practiceList') && target.closest('.option, [data-action="next-question"], [data-action="previous-question"], [data-action="dont-know"], [data-action="restart-session"], [data-action="start-next-batch"]'));
  }

  function patchEmptyPracticeListRender(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoNextStableRenderV386) return;

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

    Object.defineProperty(Element.prototype, '__medNykutoNextStableRenderV386', {value:true});
  }

  function patchReplaceChildren(){
    if(Element.prototype.__medNykutoNextStableReplaceChildrenV386) return;
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
    Object.defineProperty(Element.prototype, '__medNykutoNextStableReplaceChildrenV386', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoNextStableScrollV386) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isPractice() && this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel, [data-action="next-question"], [data-action="previous-question"]')){
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
    Object.defineProperty(Element.prototype, '__medNykutoNextStableScrollV386', {value:true});
  }

  function patchFocus(){
    if(HTMLElement.prototype.__medNykutoNextStableFocusV386) return;
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
    Object.defineProperty(HTMLElement.prototype, '__medNykutoNextStableFocusV386', {value:true});
  }

  function patchWindowScroll(){
    if(window.__medNykutoNextStableWindowScrollV386) return;
    var nativeScrollToFn = window.scrollTo;
    var nativeScrollBy = window.scrollBy;
    if(typeof nativeScrollToFn === 'function' && !nativeScrollToRef) nativeScrollToRef = nativeScrollToFn;
    if(typeof nativeScrollToFn === 'function'){
      window.scrollTo = function(){
        if(inTransition()){
          if(lockedScrollY == null) lockedScrollY = window.scrollY;
          return nativeScrollTo(0, lockedScrollY);
        }
        return nativeScrollToFn.apply(window, arguments);
      };
    }
    if(typeof nativeScrollBy === 'function'){
      window.scrollBy = function(){
        if(inTransition()){
          if(lockedScrollY == null) lockedScrollY = window.scrollY;
          return nativeScrollTo(0, lockedScrollY);
        }
        return nativeScrollBy.apply(window, arguments);
      };
    }
    Object.defineProperty(window, '__medNykutoNextStableWindowScrollV386', {value:true});
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

  function inject(){
    if(document.getElementById('nextVisibilityV386Style')) return;
    ['nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style','practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV386Style';
    style.textContent = [
      'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.practice-page .single-question-card [data-action="next-question"]:disabled{opacity:1!important}',
      'body.practice-page #practiceList{min-height:70vh;overflow-anchor:none!important}',
      'body.practice-page .single-question-card,body.practice-page .practice-headbox{scroll-margin-top:92px}',
      'body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero,body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero{display:none!important;visibility:hidden!important}',
      'html:has(body.practice-page){scroll-behavior:auto!important}',
      'html:has(body.practice-rerendering),body.practice-page.practice-rerendering{scroll-behavior:auto!important;overflow-anchor:none!important}',
      'body.practice-page.practice-rerendering *,body.practice-page.practice-rerendering .single-question-card,body.practice-page.practice-rerendering .option,body.practice-page.practice-rerendering .btn{scroll-behavior:auto!important;transition:none!important;animation:none!important}',
      'body.practice-page.practice-rerendering #practiceList{contain:layout paint;will-change:auto;overflow-anchor:none!important}'
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
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  function onPreAction(e){
    var target = e.target;
    if(isPracticeActionTarget(target)) markTransition(1800, target);
  }

  document.addEventListener('pointerdown', onPreAction, true);
  document.addEventListener('touchstart', onPreAction, true);
  document.addEventListener('mousedown', onPreAction, true);
  document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && isPracticeActionTarget(e.target)) markTransition(1800, e.target);
  }, true);

  document.addEventListener('click', function(e){
    var target = e.target;
    if(isPracticeActionTarget(target)) markTransition(1800, target);
    setTimeout(run, 0);
    setTimeout(run, 20);
    setTimeout(run, 120);
    setTimeout(run, 360);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 30); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class','style']}); }catch(e){}
})();
