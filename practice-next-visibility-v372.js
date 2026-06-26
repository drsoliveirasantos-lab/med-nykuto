/* v381 — native visible next + stable render.
   Keeps the native Siguiente handler as the only owner of currentIndex.
   Also prevents the mobile Safari blank-frame flicker by refusing empty
   #practiceList renders during question transitions. No overlay, no duplicate
   progress layer, no synthetic No sé + Next sequence.
*/
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v381-native-next-stable-render';

  function isPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function answered(c){
    return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
  }

  function patchEmptyPracticeListRender(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoNextStableRenderV381) return;

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

    Object.defineProperty(Element.prototype, '__medNykutoNextStableRenderV381', {value:true});
  }

  function patchReplaceChildren(){
    if(Element.prototype.__medNykutoNextStableReplaceChildrenV381) return;
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
    Object.defineProperty(Element.prototype, '__medNykutoNextStableReplaceChildrenV381', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoNextStableScrollV381) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;
    Element.prototype.scrollIntoView = function(options){
      if(isPractice() && this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        if(!opts.block) opts.block = 'start';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };
    Object.defineProperty(Element.prototype, '__medNykutoNextStableScrollV381', {value:true});
  }

  function sync(){
    if(!isPractice()) return;
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
    if(document.getElementById('nextVisibilityV381Style')) return;
    ['nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style','practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV381Style';
    style.textContent = [
      'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.practice-page .single-question-card [data-action="next-question"]:disabled{opacity:1!important}',
      'body.practice-page #practiceList{min-height:70vh}',
      'body.practice-page .single-question-card,body.practice-page .practice-headbox{scroll-margin-top:92px}'
    ].join('');
    document.head.appendChild(style);
  }

  function run(){
    patchEmptyPracticeListRender();
    patchReplaceChildren();
    patchScrollIntoView();
    inject();
    sync();
    window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v381-native-next-stable-render';
  }

  document.addEventListener('click', function(){
    setTimeout(run, 20);
    setTimeout(run, 120);
    setTimeout(run, 320);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 30); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
