/* v360 — QCM progress display-only patch.
   Synchronizes the visible premium progress/counter from the displayed card.
   If legacy session counters remain stale while the visible card changes,
   this patch advances the displayed counter from observed question changes.
*/
(function(){
  'use strict';

  var VERSION = 'v360';
  var pendingProgressTimer = 0;
  var lastKnownProgress = null;
  var observedIdentity = '';
  var observedIndex = 1;
  var observedTotal = 20;
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
  function currentCard(){ return document.querySelector('.single-question-card'); }
  function cardIdentity(){
    var card = currentCard();
    if(!card) return '';
    var prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3, p');
    return [card.id || '', clean(prompt ? prompt.textContent : card.textContent).slice(0, 260)].join('|');
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
  function stateProgressFromCard(){
    var card = currentCard();
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
        var currentIndex = Math.max(0, Number(state.currentIndex || 0));
        var current = Math.max(idx + 1, currentIndex + 1);
        return {current: current, total: total, pct: clampPct(current,total), source:'state-card', key:key};
      }
    }catch(e){}
    return null;
  }
  function observedProgress(){
    var id = cardIdentity();
    if(!id) return null;
    var base = lastKnownProgress || counterProgress() || {current:1,total:20,pct:5};
    observedTotal = Math.max(1, base.total || observedTotal || 20);
    if(!observedIdentity){
      observedIdentity = id;
      observedIndex = Math.max(1, Math.min(observedTotal, base.current || 1));
    }else if(id !== observedIdentity){
      observedIdentity = id;
      observedIndex = Math.max(1, Math.min(observedTotal, observedIndex + 1));
    }
    return {current: observedIndex, total: observedTotal, pct: clampPct(observedIndex, observedTotal), source:'observed-card-change'};
  }
  function realProgress(){
    var observed = observedProgress();
    var state = stateProgressFromCard();
    if(state && observed){
      var current = Math.max(state.current || 1, observed.current || 1);
      var total = Math.max(state.total || 20, observed.total || 20);
      return {current: current, total: total, pct: clampPct(current,total), source: current === observed.current ? observed.source : state.source};
    }
    return observed || state || counterProgress() || lastKnownProgress;
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
    window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = {current:p.current,total:p.total,pct:p.pct,source:p.source || 'unknown',identity:observedIdentity};
  }
  function scheduleProgressUpdate(delay){
    if(pendingProgressTimer) clearTimeout(pendingProgressTimer);
    pendingProgressTimer = setTimeout(updatePremiumProgress, delay == null ? 90 : delay);
  }
  function scheduleAfterRender(){
    [20, 60, 120, 240, 480, 900, 1400].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
  }
  function resetObservedOnFilterChange(){
    observedIdentity = '';
    observedIndex = 1;
    lastKnownProgress = null;
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
    if(e.target && e.target.closest && e.target.closest('.mc-picker-btn,.qfp-choice,[data-kind="course"],[data-kind="module"]')) resetObservedOnFilterChange();
    scheduleAfterRender();
  }, true);
  document.addEventListener('change', function(){ resetObservedOnFilterChange(); scheduleAfterRender(); }, true);
  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){ scheduleProgressUpdate(35); }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}
  setInterval(function(){
    if(Date.now() - bootedAt < 30000 || document.hidden === false) updatePremiumProgress();
  }, 250);
})();
