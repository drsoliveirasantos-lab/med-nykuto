/* v389 — passive QCM visibility CSS.
   app.bundle.js is the only owner of question rendering/currentIndex.
   This file must not patch innerHTML, replaceChildren, scrollIntoView, focus, clicks, or DOM mutations. */
(function(){
  'use strict';
  var VERSION = 'v388-broad-qcm-viewport-lock';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function inject(){
    if(document.getElementById('nextVisibilityV389Style')) return;
    [
      'nextVisibilityV388Style','nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style',
      'practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV389Style';
    style.textContent = [
      'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent}',
      'body.practice-page .single-question-card [data-action="next-question"]:disabled{display:none!important}',
      'body.practice-page .single-question-card .option{touch-action:pan-y!important;-webkit-tap-highlight-color:rgba(216,180,91,.14)}',
      'body.practice-page #practiceList{overflow-anchor:none!important}',
      'html:has(body.practice-page){scroll-behavior:auto!important}',
      'body.practice-page.practice-focus .practice-quick-header,body.practice-page.practice-focus .page-hero,body.practice-page.practice-has-scope .practice-quick-header,body.practice-page.practice-has-scope .page-hero{display:none!important;visibility:hidden!important}'
    ].join('');
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  window.addEventListener('pageshow', inject);
})();
