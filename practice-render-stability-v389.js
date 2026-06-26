/* v389 — QCM render stability.
   Clean visual fix for the flicker seen between two questions: app.bundle.js
   clears #practiceList before writing the next card. On mobile Safari this empty
   intermediate frame can be painted, briefly showing the page hero/header.
   This guard prevents that empty frame and disables smooth scroll during
   question transitions.
*/
(function(){
  'use strict';

  var VERSION = 'v389-no-empty-practice-list-frame';
  window.__MED_NYKUTO_RENDER_STABILITY__ = VERSION;

  function isPracticePage(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page'));
  }

  function hasActiveQuestionList(el){
    return !!(el && el.id === 'practiceList' && el.querySelector('.single-question-card, .practice-headbox, .practice-card'));
  }

  function patchInnerHTML(){
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if(!desc || !desc.get || !desc.set || Element.prototype.__medNykutoInnerHTMLStableV389) return;

    Object.defineProperty(Element.prototype, 'innerHTML', {
      configurable: true,
      enumerable: desc.enumerable,
      get: function(){ return desc.get.call(this); },
      set: function(value){
        if(isPracticePage() && this && this.id === 'practiceList' && value === '' && hasActiveQuestionList(this)){
          this.dataset.renderStableSkippedEmpty = String(Date.now());
          window.__MED_NYKUTO_RENDER_STABILITY_LAST_SKIP__ = Date.now();
          return;
        }
        return desc.set.call(this, value);
      }
    });

    Object.defineProperty(Element.prototype, '__medNykutoInnerHTMLStableV389', {value:true});
  }

  function patchScrollIntoView(){
    if(Element.prototype.__medNykutoScrollStableV389) return;
    var nativeScrollIntoView = Element.prototype.scrollIntoView;
    if(typeof nativeScrollIntoView !== 'function') return;

    Element.prototype.scrollIntoView = function(options){
      if(isPracticePage() && this && this.matches && this.matches('#practiceList, .single-question-card, .question-difficulty-panel')){
        var opts = typeof options === 'object' && options ? Object.assign({}, options) : {};
        opts.behavior = 'auto';
        if(!opts.block) opts.block = 'start';
        return nativeScrollIntoView.call(this, opts);
      }
      return nativeScrollIntoView.apply(this, arguments);
    };

    Object.defineProperty(Element.prototype, '__medNykutoScrollStableV389', {value:true});
  }

  function injectCss(){
    if(document.getElementById('practiceRenderStabilityV389Css')) return;
    var style = document.createElement('style');
    style.id = 'practiceRenderStabilityV389Css';
    style.textContent = [
      'body.practice-page #practiceList{min-height:70vh}',
      'body.practice-page .single-question-card{scroll-margin-top:92px}',
      'body.practice-page .practice-headbox{scroll-margin-top:92px}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function run(){
    patchInnerHTML();
    patchScrollIntoView();
    injectCss();
    window.__MED_NYKUTO_RENDER_STABILITY__ = VERSION;
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('pageshow', run);
})();
