/* v361 — native QCM progress controller.
   Clean fix: no overlay, no hidden duplicate counter. The existing progress DOM is
   the only visible source. v387 derives progress from the visible card position
   instead of trusting storage.currentIndex, which can already point to the next
   question after answering.
*/
(function(){
  'use strict';
  var VERSION = 'v361';
  var MODE = 'native-progress-controller-v387-visible-card-index';
  var current = 1;
  var total = 20;
  var started = false;
  var lastIdentity = '';
  var pendingNextFrom = '';
  var pendingNextTarget = 0;
  var lockUntil = 0;
  var writing = false;

  function isQcm(){ return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page')); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function pct(){ return Math.max(0, Math.min(100, Math.round((current / Math.max(1,total)) * 100))); }
  function clamp(n){ return Math.max(1, Math.min(Math.max(1,total), Number(n || 1))); }
  function card(){ return document.querySelector('.single-question-card'); }
  function identity(){
    var c = card();
    if(!c) return '';
    var prompt = c.querySelector('.question-prompt, .structured-prompt, h2, h3, p');
    return [c.id || '', clean(prompt && prompt.textContent)].join('|');
  }
  function readCounterText(s){
    var m = clean(s).match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if(!m) return null;
    return {current:Number(m[1]), total:Number(m[2])};
  }
  function readStorageForVisibleCard(){
    var c = card();
    var id = c && c.id;
    if(!id) return null;
    try{
      for(var i=0;i<localStorage.length;i++){
        var raw = localStorage.getItem(localStorage.key(i) || '');
        if(!raw) continue;
        var state = JSON.parse(raw);
        if(!state || !Array.isArray(state.currentBatch)) continue;
        var idx = state.currentBatch.indexOf(id);
        if(idx < 0) continue;
        var t = Math.max(1, state.currentBatch.length || 20);
        return {current:idx + 1, total:t};
      }
    }catch(e){}
    return null;
  }
  function initialize(){
    if(started) return;
    var fromStorage = readStorageForVisibleCard();
    if(fromStorage){
      total = Math.max(1, fromStorage.total || 20);
      current = clamp(fromStorage.current || 1);
    }else{
      var node = document.querySelector('.premium-progress strong, .question-count-stat strong');
      var fromDom = node && readCounterText(node.textContent);
      if(fromDom){ total = Math.max(1, fromDom.total || 20); current = clamp(fromDom.current || 1); }
    }
    lastIdentity = identity() || '';
    started = true;
  }
  function syncIdentity(){
    var id = identity();
    if(!id) return;
    if(!lastIdentity){ lastIdentity = id; return; }
    if(id === lastIdentity) return;
    var previous = lastIdentity;
    lastIdentity = id;
    if(pendingNextFrom && previous === pendingNextFrom){
      current = clamp(pendingNextTarget || current);
      pendingNextFrom = '';
      pendingNextTarget = 0;
      return;
    }
    var fromStorage = readStorageForVisibleCard();
    if(fromStorage){ total = Math.max(1, fromStorage.total || total || 20); current = clamp(fromStorage.current || current); }
    else current = clamp(current + 1);
  }
  function writeProgress(source){
    if(!isQcm()) return null;
    writing = true;
    try{
      initialize();
      syncIdentity();
      current = clamp(current);
      var percent = pct();
      var label = 'Pregunta ' + current + '/' + total;
      var compact = current + '/' + total;
      var percentText = percent + '%';
      Array.prototype.forEach.call(document.querySelectorAll('.premium-progress strong, .single-question-card .quiz-head .badge, .single-question-card [class*="badge"]'), function(el){
        if(readCounterText(el.textContent) && clean(el.textContent) !== label) el.textContent = label;
      });
      Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong'), function(el){ if(clean(el.textContent) !== compact) el.textContent = compact; });
      Array.prototype.forEach.call(document.querySelectorAll('.premium-progress span, .premium-progress .premium-progress-head span'), function(el){ if(clean(el.textContent) !== percentText) el.textContent = percentText; });
      Array.prototype.forEach.call(document.querySelectorAll('.premium-progress-track i, .premium-progress .progress-track i, .practice-headbox .progress-track:not(.success) i'), function(el){ el.style.transition = 'none'; el.style.width = percent + '%'; });
      window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
      window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ = MODE;
      window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = {current:current,total:total,pct:percent,source:source || 'native-controller'};
      return window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__;
    }finally{ writing = false; }
  }
  function afterRender(){
    writeProgress('sync');
    [0,16,60,120,240,500,1000].forEach(function(ms){ setTimeout(function(){ writeProgress('sync'); }, ms); });
  }
  function nextTap(){
    var now = Date.now();
    initialize();
    if(now < lockUntil){ afterRender(); return; }
    lockUntil = now + 650;
    pendingNextFrom = identity() || lastIdentity || '';
    current = clamp(current + 1);
    pendingNextTarget = current;
    writeProgress('next-tap');
    afterRender();
  }
  function reset(){
    started = false;
    current = 1;
    total = 20;
    pendingNextFrom = '';
    pendingNextTarget = 0;
    lockUntil = 0;
    initialize();
    afterRender();
  }
  function run(){
    if(!isQcm()) return;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ = MODE;
    window.__MED_NYKUTO_SYNC_PROGRESS__ = function(){ return writeProgress('manual-sync'); };
    afterRender();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(e){
    var next = e.target && e.target.closest ? e.target.closest('[data-action="next-question"]') : null;
    var resetTarget = e.target && e.target.closest ? e.target.closest('[data-action="restart-session"], .mc-picker-btn, .qfp-choice, [data-kind="course"], [data-kind="module"]') : null;
    if(next) nextTap();
    else if(resetTarget) setTimeout(reset, 0);
    else afterRender();
  }, true);
  document.addEventListener('change', function(){ afterRender(); }, true);
  try{
    new MutationObserver(function(){ if(!writing) writeProgress('mutation'); }).observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  }catch(e){}
})();
