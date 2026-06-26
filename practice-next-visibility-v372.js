/* v388 — native visible Next + safe QCM transition marker.
   This file keeps the native app.bundle.js handler as the only owner of currentIndex.
   It must not freeze body scroll or intercept touch scrolling on options. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  var transitionTimer = null;

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

  function markTransition(ms, target){
    if(!isPractice() || !document.body) return;
    window.__MED_NYKUTO_QCM_VIEWPORT_LOCK_LAST__ = Date.now();
    try{
      if(target && target.blur) target.blur();
      var active = document.activeElement;
      if(active && active.closest && active.closest('#practiceList') && active.blur) active.blur();
    }catch(e){}

    document.body.classList.add('practice-rerendering','practice-viewport-locked');
    document.body.dataset.qcmViewportLocked = String(Date.now());
    if(transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(function(){
      transitionTimer = null;
      if(!document.body) return;
      delete document.body.dataset.qcmViewportLocked;
      document.body.classList.remove('practice-rerendering','practice-viewport-locked');
    }, ms || 220);
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
      c.querySelectorAll('.option').forEach(function(option){
        option.style.touchAction = 'pan-y';
      });
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
      'body.practice-page .single-question-card .option{touch-action:pan-y!important;-webkit-tap-highlight-color:rgba(216,180,91,.14)}',
      'body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero,body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero{display:none!important;visibility:hidden!important}',
      'html:has(body.practice-page){scroll-behavior:auto!important}',
      'html:has(body.practice-rerendering),body.practice-page.practice-rerendering{scroll-behavior:auto!important;overflow-anchor:none!important}',
      'body.practice-page.practice-rerendering *,body.practice-page.practice-rerendering .single-question-card,body.practice-page.practice-rerendering .option,body.practice-page.practice-rerendering .btn{scroll-behavior:auto!important;transition:none!important;animation:none!important}',
      'body.practice-page.practice-rerendering #practiceList{contain:layout paint;will-change:auto;overflow-anchor:none!important}',
      'body.practice-page.practice-viewport-locked{max-width:100vw!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    patchEmptyPracticeListRender();
    patchReplaceChildren();
    patchScrollIntoView();
    patchFocus();
    inject();
    sync();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;
  }

  function onClick(e){
    if(isPracticeActionTarget(e.target)) setTimeout(function(){ markTransition(220, e.target); }, 0);
    setTimeout(run, 0);
    setTimeout(run, 20);
    setTimeout(run, 120);
    setTimeout(run, 360);
  }

  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && isPracticeActionTarget(e.target)) setTimeout(function(){ markTransition(220, e.target); }, 0);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 0); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class','style']}); }catch(e){}
})();
