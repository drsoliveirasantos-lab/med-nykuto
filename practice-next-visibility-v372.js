/* v385 — native visible next + locked transition with no late repaint.
   Keeps the native Siguiente handler as the only owner of currentIndex.
   The remaining visible bug was a second repaint after the question had already changed.
   This version locks scroll during the transition, hides non-practice hero blocks whenever
   a scoped QCM session is active, and disables practice-card transition/animation during
   rerender so mobile Safari cannot flash an intermediate layout. No overlay, no duplicate
   progress layer, no synthetic No sé + Next sequence.
*/
(function(){
  'use strict';
  var VERSION = 'v385-native-next-no-late-repaint';
  var transitionUntil = 0;
  var lockedScrollY = null;
  var restoreTimer = null;
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

  function restoreLockedScroll(){
    if(!inTransition() || lockedScrollY == null) return;
    if(Math.abs(window.scrollY - lockedScrollY) > 1) window.scrollTo(0, lockedScrollY);
  }

  function clearTransitionIfDone(){
    if(Date.now() < transitionUntil) return;
    if(restoreTimer) clearInterval(restoreTimer);
    restoreTimer = null;
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
    }, 16);
    setTimeout(clearTransitionIfDone, ms || 1800);
  }

  function markTransition(ms){
    var duration = ms || 1800;
    transitionUntil = Math.max(transitionUntil, Date.now() + duration);
    if(lockedScrollY == null) lockedScrollY = window.scrollY;
    if(document.body) document.body.classList.add('practice-rerendering');
    scheduleScrollLock(duration + 120);
  }

  function answered(c){
    return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
  }

  function patchEmptyPracticeListRender(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoNextStableRenderV385) return;

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

    Object.defineProperty(Element.prototype, '__medNykutoNextStableRenderV385', {value:true});
  }

  function patchReplaceChildren(){
    if(Element.prototype.__medNykutoNextStableReplaceChildrenV385) return;
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
    Object.defineProperty(Element.prototype, '__medNykutoNextStableReplaceChildrenV385', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoNextStableScrollV385) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isPractice() && this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel')){
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
    Object.defineProperty(Element.prototype, '__medNykutoNextStableScrollV385', {value:true});
  }

  function patchWindowScroll(){
    if(window.__medNykutoNextStableWindowScrollV385) return;
    var nativeScrollTo = window.scrollTo;
    var nativeScrollBy = window.scrollBy;
    if(typeof nativeScrollTo === 'function'){
      window.scrollTo = function(){
        if(inTransition()) return restoreLockedScroll();
        return nativeScrollTo.apply(window, arguments);
      };
    }
    if(typeof nativeScrollBy === 'function'){
      window.scrollBy = function(){
        if(inTransition()) return restoreLockedScroll();
        return nativeScrollBy.apply(window, arguments);
      };
    }
    Object.defineProperty(window, '__medNykutoNextStableWindowScrollV385', {value:true});
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
    if(document.getElementById('nextVisibilityV385Style')) return;
    ['nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style','practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV385Style';
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
    patchWindowScroll();
    inject();
    sync();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  document.addEventListener('click', function(e){
    var target = e.target;
    var inPractice = target && target.closest && target.closest('#practiceList');
    if(inPractice && target.closest('.option, [data-action="next-question"], [data-action="previous-question"], [data-action="dont-know"], [data-action="restart-session"], [data-action="start-next-batch"]')) markTransition(1800);
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
