/* v358 — QCM progress display-only patch.
   Synchronizes the visible premium progress/counter from the displayed card id.
   It does not intercept clicks or change answers; it only fixes the UI counter/bar when
   the card changes but hidden legacy counters remain stale.
*/
(function(){
  'use strict';

  var VERSION = 'v358';
  var pendingProgressTimer = 0;
  var lastSignature = '';
  var lastKnownProgress = null;

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
  function progressFromDisplayedCard(){
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
        return {current: idx + 1, total: total, pct: clampPct(idx + 1, total), source:'card-batch', key:key};
      }
    }catch(e){}
    return null;
  }
  function progressFromCounters(){
    var nodes = [];
    ['.single-question-card .quiz-head .badge', '.question-count-stat strong', '.premium-progress strong', '.single-question-card [class*="badge"]'].forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(n){
        if(nodes.indexOf(n) === -1) nodes.push(n);
      });
    });
    for(var i = 0; i < nodes.length; i++){
      var p = parseProgressText(nodes[i].textContent);
      if(p){ p.source = 'counter'; return p; }
    }
    return null;
  }
  function realProgress(){
    return progressFromDisplayedCard() || progressFromCounters() || lastKnownProgress;
  }
  function ensureProgressStructure(bar){
    var head = bar.querySelector('.premium-progress-head');
    var strong = head && head.querySelector('strong');
    var span = head && head.querySelector('span');
    var track = bar.querySelector('.premium-progress-track');
    var fill = track && track.querySelector('i');
    if(strong && span && fill) return {strong:strong, span:span, fill:fill};
    bar.innerHTML = '<div class="premium-progress-head"><strong></strong><span></span></div><div class="premium-progress-track"><i></i></div>';
    return {
      strong: bar.querySelector('.premium-progress-head strong'),
      span: bar.querySelector('.premium-progress-head span'),
      fill: bar.querySelector('.premium-progress-track i')
    };
  }
  function setTextIfDifferent(el, value){ if(el && clean(el.textContent) !== value) el.textContent = value; }
  function setWidth(el, value){ if(el && el.style.width !== value) el.style.width = value; }
  function updateLegacyCounters(label, pctText, width){
    Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong, .single-question-card .quiz-head .badge, .premium-progress strong'), function(el){
      if(parseProgressText(el.textContent)) setTextIfDifferent(el, label);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress span, .premium-progress .premium-progress-head span'), function(el){
      if(/^\d{1,3}%$/.test(clean(el.textContent)) || el.closest('.premium-progress')) setTextIfDifferent(el, pctText);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress-track i, .premium-progress .progress-track i, .practice-headbox .progress-track:not(.success) i'), function(el){
      setWidth(el, width);
    });
  }
  function updatePremiumProgress(){
    pendingProgressTimer = 0;
    if(!isQcmPage()) return;
    var p = realProgress();
    if(!p) return;
    lastKnownProgress = p;

    var signature = p.current + '/' + p.total + '/' + p.pct;
    var label = 'Pregunta ' + p.current + '/' + p.total;
    var compactLabel = p.current + '/' + p.total;
    var pctText = p.pct + '%';
    var width = p.pct + '%';

    var bar = document.querySelector('.premium-progress');
    if(bar){
      var parts = ensureProgressStructure(bar);
      setTextIfDifferent(parts.strong, label);
      setTextIfDifferent(parts.span, pctText);
      setWidth(parts.fill, width);
      bar.dataset.progressFixed = VERSION;
      bar.dataset.progressSignature = signature;
      bar.dataset.progressSource = p.source || 'unknown';
    }

    updateLegacyCounters(label, pctText, width);
    Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong'), function(el){
      setTextIfDifferent(el, compactLabel);
    });

    lastSignature = signature;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = {current:p.current,total:p.total,pct:p.pct,source:p.source || 'unknown'};
  }
  function scheduleProgressUpdate(delay){
    if(pendingProgressTimer) clearTimeout(pendingProgressTimer);
    pendingProgressTimer = setTimeout(updatePremiumProgress, delay == null ? 90 : delay);
  }
  function scheduleAfterRender(){
    [40, 100, 220, 420, 820].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
  }
  function run(){
    if(!isQcmPage()) return;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    scheduleAfterRender();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ scheduleAfterRender(); }, true);
  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){ scheduleProgressUpdate(80); }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}
})();
