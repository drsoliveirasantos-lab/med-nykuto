/* v391 — targeted QCM-only master-render flicker guard.
   app.bundle.js remains the owner of question rendering/currentIndex.
   This file prevents only QCM from briefly emptying #practiceList and neutralizes smooth scroll during QCM transitions. */
(function(){
  'use strict';
  var VERSION = 'v391-qcm-only-master-render-flicker-guard';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isQcmPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page') && document.body.classList.contains('qcm-page'));
  }
  function isPracticeList(el){ return !!(isQcmPractice() && el && el.id === 'practiceList'); }

  function patchEmptyPracticeListRender(){
    if(Element.prototype.__medNykutoSkipEmptyQcmRenderV391) return;
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set) return;
    Object.defineProperty(Element.prototype, 'innerHTML', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function(){ return desc.get.call(this); },
      set: function(value){
        if(isPracticeList(this) && String(value || '') === '' && this.querySelector && this.querySelector('.single-question-card')){
          this.dataset.skippedEmptyMasterRender = String(Date.now());
          window.__MED_NYKUTO_SKIPPED_EMPTY_QCM_MASTER_RENDER__ = Date.now();
          return;
        }
        return desc.set.call(this, value);
      }
    });
    Object.defineProperty(Element.prototype, '__medNykutoSkipEmptyQcmRenderV391', {value:true});
  }

  function patchSmoothScroll(){
    if(Element.prototype.__medNykutoQcmAutoScrollV391) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isQcmPractice() && this && this.closest && this.closest('#practiceList')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        opts.block = 'nearest';
        opts.inline = 'nearest';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };
    Object.defineProperty(Element.prototype, '__medNykutoQcmAutoScrollV391', {value:true});
  }

  function inject(){
    if(!isQcmPractice()) return;
    if(document.getElementById('nextVisibilityV391Style')) return;
    [
      'nextVisibilityV390Style','nextVisibilityV389Style','nextVisibilityV388Style','nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style',
      'practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV391Style';
    style.textContent = [
      'body.qcm-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.qcm-page .single-question-card [data-action="next-question"]:disabled{display:none!important}',
      'body.qcm-page .single-question-card .option{touch-action:pan-y!important;-webkit-tap-highlight-color:rgba(216,180,91,.14)}',
      'body.qcm-page #practiceList{overflow-anchor:none!important}',
      'html:has(body.qcm-page),body.qcm-page{scroll-behavior:auto!important}',
      'body.qcm-page.practice-focus .practice-quick-header,body.qcm-page.practice-focus .page-hero,body.qcm-page.practice-has-scope .practice-quick-header,body.qcm-page.practice-has-scope .page-hero{display:none!important;visibility:hidden!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    if(!isQcmPractice()) return;
    patchEmptyPracticeListRender();
    patchSmoothScroll();
    inject();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('pageshow', run);
})();
