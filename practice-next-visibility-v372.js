/* v392 — QCM next visibility CSS only.
   app.bundle.js owns question rendering, currentIndex, scrolling and #practiceList.
   This file must not monkey-patch innerHTML, scrollIntoView, clicks, or QCM rendering. */
(function(){
  'use strict';
  var VERSION = 'v392-qcm-next-css-only';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = VERSION;

  function isQcmPractice(){
    return !!(document.body && document.body.classList && document.body.classList.contains('practice-page') && document.body.classList.contains('qcm-page'));
  }

  function inject(){
    if(!isQcmPractice()) return;
    if(document.getElementById('nextVisibilityV392Style')) return;
    [
      'nextVisibilityV391Style','nextVisibilityV390Style','nextVisibilityV389Style','nextVisibilityV388Style','nextVisibilityV387Style','nextVisibilityV386Style','nextVisibilityV385Style','nextVisibilityV384Style','nextVisibilityV383Style','nextVisibilityV382Style','nextVisibilityV381Style','nextVisibilityV380Style','nextVisibilityV379Style','nextVisibilityV378Style','nextVisibilityV377Style','nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style',
      'practiceRenderStabilityV390Css','practiceRenderStabilityV389Css'
    ].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'nextVisibilityV392Style';
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

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  window.addEventListener('pageshow', inject);
})();
