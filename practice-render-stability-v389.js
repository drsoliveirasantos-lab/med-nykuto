/* v390 — QCM render stability.
   Clean visual fix for the flicker seen between two questions: app.bundle.js
   clears #practiceList before writing the next card. On mobile Safari this empty
   intermediate frame is painted, briefly showing the page hero/header.

   This patch is intentionally loaded BEFORE app.bundle.js. It prevents the
   empty #practiceList frame from ever being committed, while still allowing the
   next non-empty render to replace the previous question normally.
*/
(function(){
  'use strict';

  var VERSION = 'v390-block-empty-practice-list-frame';
  window.__MED_NYKUTO_RENDER_STABILITY__ = VERSION;

  function isPracticeList(el){
    return !!(el && el.id === 'practiceList');
  }

  function patchInnerHTML(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoInnerHTMLStableV390) return;

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

    Object.defineProperty(Element.prototype, '__medNykutoInnerHTMLStableV390', {value:true});
  }

  function patchReplaceChildren(){
    if(Element.prototype.__medNykutoReplaceChildrenStableV390) return;
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
    Object.defineProperty(Element.prototype, '__medNykutoReplaceChildrenStableV390', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoScrollStableV390) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;

    Element.prototype.scrollIntoView = function(options){
      if(this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        if(!opts.block) opts.block = 'start';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };

    Object.defineProperty(Element.prototype, '__medNykutoScrollStableV390', {value:true});
  }

  function injectCss(){
    if(document.getElementById('practiceRenderStabilityV390Css')) return;
    var old = document.getElementById('practiceRenderStabilityV389Css');
    if(old) old.remove();
    var style = document.createElement('style');
    style.id = 'practiceRenderStabilityV390Css';
    style.textContent = [
      'body.practice-page #practiceList{min-height:70vh}',
      'body.practice-page .single-question-card{scroll-margin-top:92px}',
      'body.practice-page .practice-headbox{scroll-margin-top:92px}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function run(){
    patchInnerHTML();
    patchReplaceChildren();
    patchScrollIntoView();
    injectCss();
    window.__MED_NYKUTO_RENDER_STABILITY__ = VERSION;
  }

  run();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('pageshow', run);
})();
