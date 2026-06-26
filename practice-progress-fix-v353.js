/* v361 — QCM progress display-only patch.
   The app has several legacy render helpers that can leave the official counter stuck
   at 1/20 even when the visible question changes. This patch treats a real tap/click
   on Siguiente pregunta as the source of truth for the visible progress UI.
*/
(function(){
  'use strict';

  var VERSION = 'v361';
  var pendingProgressTimer = 0;
  var lastKnownProgress = null;
  var manualIndex = 1;
  var manualTotal = 20;
  var nextTapLockUntil = 0;
  var bootedAt = Date.now();

  function isQcmPage(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page'));
  }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clampPct(current,total){ return Math.max(0, Math.min(100, Math.round((current / Math.max(1,total)) * 100))); }
  function parseProgressText(s){
    var m = clean(s).match(/(?:Pregunta|Question|Quest[aã]o)?\s*(\d{1,3})\s*\/\s*(\d{1,3})/i);
    if(!m) return null;
    var current = Math.max(1, parseInt(m[1], 10) || 1);
    var total = Math.max(current, parseInt(m[2], 10) || 20);
    return {current: current, total: total, pct: clampPct(current,total)};
  }
  function counterProgress(){
    var nodes = [];
    ['.premium-progress strong', '.question-count-stat strong', '.single-question-card .quiz-head .badge', '.single-question-card [class*="badge"]'].forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(n){ if(nodes.indexOf(n) === -1) nodes.push(n); });
    });
    for(var i = 0; i < nodes.length; i++){
      var p = parseProgressText(nodes[i].textContent);
      if(p){ p.source = 'counter'; return p; }
    }
    return null;
  }
  function stateProgressFromVisibleCard(){
    var card = document.querySelector('.single-question-card');
    var id = card && card.id;
    if(!id) return null;
    try{
      for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i) || '';
        var raw = localStorage.getItem(key);
        if(!raw) continue;
        var state = JSON.parse(raw);
        if(!state || !Array.isArray(state.currentBatch)) continue;
        var idx = state.currentBatch.indexOf(id);
        if(idx < 0) continue;
        var total = Math.max(1, state.currentBatch.length || 20);
        var storedIndex = Math.max(0, Number(state.currentIndex || 0));
        var current = Math.max(idx + 1, storedIndex + 1);
        return {current: current, total: total, pct: clampPct(current,total), source:'state-card'};
      }
    }catch(e){}
    return null;
  }
  function manualProgress(){
    manualTotal = Math.max(1, manualTotal || 20);
    manualIndex = Math.max(1, Math.min(manualTotal, manualIndex || 1));
    return {current: manualIndex, total: manualTotal, pct: clampPct(manualIndex, manualTotal), source:'next-tap'};
  }
  function realProgress(){
    var counter = counterProgress();
    var state = stateProgressFromVisibleCard();
    if(counter && counter.total) manualTotal = Math.max(manualTotal, counter.total);
    if(state && state.total) manualTotal = Math.max(manualTotal, state.total);

    var candidates = [manualProgress(), state, lastKnownProgress, counter].filter(Boolean);
    var best = candidates[0];
    candidates.forEach(function(p){ if((p.current || 1) > (best.current || 1)) best = p; });
    best.total = Math.max(best.total || 20, manualTotal || 20);
    best.pct = clampPct(best.current, best.total);
    return best;
  }
  function ensureProgressStructure(bar){
    var head = bar.querySelector('.premium-progress-head');
    var strong = head && head.querySelector('strong');
    var span = head && head.querySelector('span');
    var track = bar.querySelector('.premium-progress-track');
    var fill = track && track.querySelector('i');
    if(strong && span && fill) return {strong:strong, span:span, fill:fill};
    bar.innerHTML = '<div class="premium-progress-head"><strong></strong><span></span></div><div class="premium-progress-track"><i></i></div>';
    return {strong:bar.querySelector('.premium-progress-head strong'), span:bar.querySelector('.premium-progress-head span'), fill:bar.querySelector('.premium-progress-track i')};
  }
  function setText(el, value){ if(el && clean(el.textContent) !== value) el.textContent = value; }
  function setWidth(el, value){ if(el && el.style.width !== value) el.style.width = value; }
  function updateAllVisibleCounters(label, compactLabel, pctText, width){
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress strong, .single-question-card .quiz-head .badge, .single-question-card [class*="badge"]'), function(el){
      if(parseProgressText(el.textContent)) setText(el, label);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong'), function(el){ setText(el, compactLabel); });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress span, .premium-progress .premium-progress-head span'), function(el){ setText(el, pctText); });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress-track i, .premium-progress .progress-track i, .practice-headbox .progress-track:not(.success) i'), function(el){ setWidth(el, width); });
  }
  function updatePremiumProgress(){
    pendingProgressTimer = 0;
    if(!isQcmPage()) return;
    var p = realProgress();
    if(!p) return;
    lastKnownProgress = p;
    var label = 'Pregunta ' + p.current + '/' + p.total;
    var compactLabel = p.current + '/' + p.total;
    var pctText = p.pct + '%';
    var width = p.pct + '%';
    var bar = document.querySelector('.premium-progress');
    if(bar){
      var parts = ensureProgressStructure(bar);
      setText(parts.strong, label);
      setText(parts.span, pctText);
      setWidth(parts.fill, width);
      bar.dataset.progressFixed = VERSION;
      bar.dataset.progressSignature = compactLabel + '/' + p.pct;
      bar.dataset.progressSource = p.source || 'unknown';
    }
    updateAllVisibleCounters(label, compactLabel, pctText, width);
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = {current:p.current,total:p.total,pct:p.pct,source:p.source || 'unknown'};
  }
  function scheduleProgressUpdate(delay){
    if(pendingProgressTimer) clearTimeout(pendingProgressTimer);
    pendingProgressTimer = setTimeout(updatePremiumProgress, delay == null ? 90 : delay);
  }
  function scheduleAfterRender(){
    [20, 60, 120, 240, 480, 900, 1400].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
  }
  function noteNextTap(){
    var now = Date.now();
    if(now < nextTapLockUntil) return;
    nextTapLockUntil = now + 650;
    var p = realProgress();
    manualTotal = Math.max(manualTotal || 20, p && p.total || 20);
    manualIndex = Math.max(manualIndex || 1, p && p.current || 1);
    manualIndex = Math.min(manualTotal, manualIndex + 1);
    updatePremiumProgress();
    scheduleAfterRender();
  }
  function resetProgress(){
    manualIndex = 1;
    lastKnownProgress = null;
    nextTapLockUntil = 0;
  }
  function run(){
    if(!isQcmPage()) return;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    scheduleAfterRender();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(e){
    var target = e.target && e.target.closest ? e.target.closest('[data-action="next-question"], [data-action="restart-session"], .mc-picker-btn, .qfp-choice, [data-kind="course"], [data-kind="module"]') : null;
    if(target && target.dataset && target.dataset.action === 'next-question') noteNextTap();
    else if(target) { resetProgress(); scheduleAfterRender(); }
    else scheduleAfterRender();
  }, true);
  document.addEventListener('change', function(){ resetProgress(); scheduleAfterRender(); }, true);
  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){ scheduleProgressUpdate(35); }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}
  setInterval(function(){
    if(Date.now() - bootedAt < 30000 || document.hidden === false) updatePremiumProgress();
  }, 250);
})();
