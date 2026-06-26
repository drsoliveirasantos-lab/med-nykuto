/* v394 — QCM render/no-scroll stability guard.
   app.bundle.js still owns question rendering, currentIndex and navigation.
   This file only neutralizes visible transition artefacts from the master QCM render:
   1) the temporary empty #practiceList clear;
   2) the automatic scrollIntoView after answer/Next, which looks like a loading jump on iPhone. */
(function(){
  'use strict';
  var VERSION = 'v394-qcm-empty-clear-and-no-scroll-guard';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isQcmPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page') && document.body.classList.contains('qcm-page'));
  }

  function isPracticeList(el){
    return !!(isQcmPractice() && el && el.id === 'practiceList');
  }

  function shouldSkipTemporaryEmptySet(el, value){
    if(!isPracticeList(el)) return false;
    if(String(value || '') !== '') return false;
    return !!(el.querySelector && el.querySelector('.single-question-card'));
  }

  function patchInnerHTMLOn(proto, flag){
    if(!proto || proto[flag]) return;
    var desc = Object.getOwnPropertyDescriptor(proto, 'innerHTML');
    if(!desc || !desc.get || !desc.set) return;
    Object.defineProperty(proto, 'innerHTML', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function(){ return desc.get.call(this); },
      set: function(value){
        if(shouldSkipTemporaryEmptySet(this, value)){
          this.dataset.skippedEmptyMasterRender = String(Date.now());
          window.__MED_NYKUTO_SKIPPED_EMPTY_QCM_MASTER_RENDER__ = Date.now();
          return;
        }
        return desc.set.call(this, value);
      }
    });
    try{ Object.defineProperty(proto, flag, {value:true}); }catch(e){ proto[flag] = true; }
  }

  function patchTemporaryEmptyClear(){
    patchInnerHTMLOn(Element && Element.prototype, '__medNykutoSkipEmptyQcmRenderV394');
    patchInnerHTMLOn(window.HTMLElement && HTMLElement.prototype, '__medNykutoSkipEmptyQcmRenderV394');
  }

  function shouldBlockAutoScroll(el){
    if(!isQcmPractice() || !el || !el.matches) return false;
    return !!(
      el.matches('#practiceList,.single-question-card,.question-difficulty-panel') ||
      (el.closest && el.closest('#practiceList'))
    );
  }

  function patchQcmAutoScroll(){
    if(Element.prototype.__medNykutoQcmNoAutoScrollV394) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(){
      if(shouldBlockAutoScroll(this)){
        window.__MED_NYKUTO_QCM_AUTO_SCROLL_BLOCKED__ = Date.now();
        return;
      }
      return nativeScrollIntoView.apply(this, arguments);
    };
    try{ Object.defineProperty(Element.prototype, '__medNykutoQcmNoAutoScrollV394', {value:true}); }catch(e){ Element.prototype.__medNykutoQcmNoAutoScrollV394 = true; }
  }

  function inject(){
    if(!isQcmPractice()) return;
    if(document.getElementById('nextVisibilityV394Style')) return;
    [
      'nextVisibilityV393Style','nextVisibilityV392Style','nextVisibilityV391Style','nextVisibilityV390Style','nextVisibilityV389Style','nextVisibilityV388Style','nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style',
      'practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV394Style';
    style.textContent = [
      'body.qcm-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.qcm-page .single-question-card [data-action="next-question"]:disabled{display:none!important}',
      'body.qcm-page .single-question-card .option{touch-action:pan-y!important;-webkit-tap-highlight-color:rgba(216,180,91,.14)}',
      'body.qcm-page #practiceList{overflow-anchor:none!important;min-height:260px!important}',
      'html:has(body.qcm-page),body.qcm-page{scroll-behavior:auto!important}',
      'body.qcm-page.practice-focus .practice-quick-header,body.qcm-page.practice-focus .page-hero,body.qcm-page.practice-has-scope .practice-quick-header,body.qcm-page.practice-has-scope .page-hero{display:none!important;visibility:hidden!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    if(!isQcmPractice()) return;
    patchTemporaryEmptyClear();
    patchQcmAutoScroll();
    inject();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('pageshow', run);
})();
