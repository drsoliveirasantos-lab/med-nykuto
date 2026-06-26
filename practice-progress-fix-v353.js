/* v389 — passive QCM progress compatibility flag.
   app.bundle.js is the only source of truth for rendering and progress.
   This file must not rewrite counters, listen to every click, or observe DOM mutations. */
(function(){
  'use strict';
  var VERSION = 'v361';
  var MODE = 'passive-core-progress-only-v389';

  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function readCounterText(s){
    var m = clean(s).match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if(!m) return null;
    var current = Number(m[1]);
    var total = Number(m[2]);
    return {current:current,total:total,pct:Math.max(0, Math.min(100, Math.round((current / Math.max(1,total)) * 100)))};
  }
  function readVisibleProgress(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.single-question-card .quiz-head .badge, .question-count-stat strong, .premium-progress strong'));
    for(var i=0;i<nodes.length;i+=1){
      var parsed = readCounterText(nodes[i].textContent);
      if(parsed) return parsed;
    }
    return {current:1,total:20,pct:5};
  }
  function expose(){
    var state = readVisibleProgress();
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ = MODE;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = state;
    window.__MED_NYKUTO_SYNC_PROGRESS__ = function(){
      var next = readVisibleProgress();
      window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = next;
      return next;
    };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', expose); else expose();
  window.addEventListener('pageshow', expose);
})();
