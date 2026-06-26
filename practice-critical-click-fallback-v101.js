/* v108 — disabled QCM Next retry fallback.
   The native app.bundle.js click flow is now stable enough on QCM.
   This helper keeps only the harmless Next button touch-action CSS and does not schedule synthetic clicks,
   because delayed retry clicks can advance to another question after the real click already worked. */
(function(){
  'use strict';
  var VERSION = 'v108-native-clicks-only-no-retry';
  window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ = VERSION;

  function injectStyle(){
    if(document.getElementById('practiceCriticalClickFallbackV108Style')) return;
    ['practiceCriticalClickFallbackV107Style','practiceCriticalClickFallbackV106Style','practiceCriticalClickFallbackV105Style','practiceCriticalClickFallbackV104Style'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var st = document.createElement('style');
    st.id = 'practiceCriticalClickFallbackV108Style';
    st.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{touch-action:manipulation!important;pointer-events:auto!important}';
    document.head.appendChild(st);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyle); else injectStyle();
  window.addEventListener('pageshow', injectStyle);
})();
