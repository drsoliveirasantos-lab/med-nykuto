/* v390 — targeted QCM master-render flicker guard.
   app.bundle.js remains the only owner of question rendering/currentIndex.
   This file only prevents the native master render from briefly emptying #practiceList
   and neutralizes smooth scroll during QCM transitions. */
(function(){
  'use strict';
  var VERSION = 'v390-master-render-flicker-guard';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }
  function isPracticeList(el){ return !!(isPractice() && el && el.id === 'practiceList'); }

  function patchEmptyPracticeListRender(){
    if(Element.prototype.__medNykutoSkipEmptyPracticeRenderV390) return;
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set) return;
    Object.defineProperty(Element.prototype, 'innerHTML', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function(){ return desc.get.call(this); },
      set: function(value){
        if(isPracticeList(this) && String(value || '') === '' && this.querySelector && this.querySelector('.single-question-card')){
          this.dataset.skippedEmptyMasterRender = String(Date.now());
          window.__MED_NYKUTO_SKIPPED_EMPTY_MASTER_RENDER__ = Date.now();
          return;
        }
        return desc.set.call(this, value);
      }
    });
    Object.defineProperty(Element.prototype, '__medNykutoSkipEmptyPracticeRenderV390', {value:true});
  }

  function patchSmoothScroll(){
    if(Element.prototype.__medNykutoQcmAutoScrollV390) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isPractice() && this && this.closest && this.closest('#practiceList')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        opts.block = 'nearest';
        opts.inline = 'nearest';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };
    Object.defineProperty(Element.prototype, '__medNykutoQcmAutoScrollV390', {value:true});
  }

  function inject(){
    if(document.getElementById('nextVisibilityV390Style')) return;
    [
      'nextVisibilityV389Style','nextVisibilityV388Style','nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style',
      'practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV390Style';
    style.textContent = [
      'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.practice-page .single-question-card [data-action="next-question"]:disabled{display:none!important}',
      'body.practice-page .single-question-card .option{touch-action:pan-y!important;-webkit-tap-highlight-color:rgba(216,180,91,.14)}',
      'body.practice-page #practiceList{overflow-anchor:none!important}',
      'html:has(body.practice-page),body.practice-page{scroll-behavior:auto!important}',
      'body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero,body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero{display:none!important;visibility:hidden!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    patchEmptyPracticeListRender();
    patchSmoothScroll();
    inject();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('pageshow', run);
})();
