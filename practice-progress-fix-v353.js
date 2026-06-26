/* v361 — QCM progress display-only patch.
   Synchronizes the user-visible and test-visible QCM counter with the question
   currently displayed after real clicks, even if the legacy renderer or storage
   state temporarily remains at 1/20. v384 removes visible mobile flicker by
   correcting progress synchronously after legacy DOM rewrites.
*/
(function(){
  'use strict';

  var VERSION = 'v361';
  var MODE = 'visual-question-progress-v384-no-flicker';
  var pendingProgressTimer = 0;
  var manualIndex = 1;
  var visualIndex = 1;
  var manualTotal = 20;
  var lastIdentity = '';
  var lastKnownProgress = null;
  var nextTapLockUntil = 0;
  var bootedAt = Date.now();
  var publishing = false;

  function isQcmPage(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page'));
  }

  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }

  function clampPct(current,total){
    return Math.max(0, Math.min(100, Math.round((current / Math.max(1,total)) * 100)));
  }

  function normalizeProgress(current, total, source){
    total = Math.max(1, Number(total || manualTotal || 20));
    current = Math.max(1, Math.min(total, Number(current || 1)));
    return { current: current, total: total, pct: clampPct(current,total), source: source || 'unknown' };
  }

  function currentCard(){ return document.querySelector('.single-question-card'); }

  function currentIdentity(){
    var card = currentCard();
    if(!card) return '';
    var prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3, p');
    return [card.id || '', clean(prompt && prompt.textContent)].join('|');
  }

  function parseProgressText(s){
    var m = clean(s).match(/(?:Pregunta|Question|Quest[aã]o)?\s*(\d{1,3})\s*\/\s*(\d{1,3})/i);
    if(!m) return null;
    return normalizeProgress(parseInt(m[1], 10), parseInt(m[2], 10), 'counter');
  }

  function counterProgressCandidates(){
    var nodes = [];
    ['.premium-progress strong', '.question-count-stat strong', '.single-question-card .quiz-head .badge', '.single-question-card [class*="badge"]'].forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(n){ if(nodes.indexOf(n) === -1) nodes.push(n); });
    });
    return nodes.map(function(n){ return parseProgressText(n.textContent); }).filter(Boolean);
  }

  function readPracticeStates(){
    var out = [];
    try{
      for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i) || '';
        var raw = localStorage.getItem(key);
        if(!raw) continue;
        var state = JSON.parse(raw);
        if(!state || !Array.isArray(state.currentBatch)) continue;
        out.push(state);
      }
    }catch(e){}
    return out;
  }

  function stateProgressFromVisibleCard(){
    var card = currentCard();
    var id = card && card.id;
    if(!id) return null;
    var states = readPracticeStates();
    for(var i=0; i<states.length; i++){
      var state = states[i];
      var idx = state.currentBatch.indexOf(id);
      if(idx < 0) continue;
      var total = Math.max(1, state.currentBatch.length || manualTotal || 20);
      var storedIndex = Math.max(0, Number(state.currentIndex || 0));
      var current = Math.max(idx + 1, storedIndex + 1);
      return normalizeProgress(current, total, 'state-card');
    }
    return null;
  }

  function inferTotal(){
    var candidates = counterProgressCandidates();
    var state = stateProgressFromVisibleCard();
    candidates.forEach(function(p){ if(p && p.total) manualTotal = Math.max(manualTotal, p.total); });
    if(state && state.total) manualTotal = Math.max(manualTotal, state.total);
    return Math.max(1, manualTotal || 20);
  }

  function syncVisualProgressFromCard(){
    if(!isQcmPage()) return null;
    var identity = currentIdentity();
    if(!identity) return null;

    var state = stateProgressFromVisibleCard();
    if(state && state.total) manualTotal = Math.max(manualTotal, state.total);

    if(!lastIdentity){
      lastIdentity = identity;
      if(state && state.current){
        visualIndex = Math.max(visualIndex || 1, state.current);
        manualIndex = Math.max(manualIndex || 1, visualIndex);
      }
      return state;
    }

    if(identity !== lastIdentity){
      lastIdentity = identity;
      var total = inferTotal();
      var baselineNext = Math.min(total, Math.max(visualIndex || 1, manualIndex || 1) + 1);
      var storedCurrent = state && state.current ? state.current : 0;
      visualIndex = Math.max(visualIndex || 1, baselineNext, storedCurrent);
      manualIndex = Math.max(manualIndex || 1, visualIndex);
      return normalizeProgress(visualIndex, total, 'visual-identity-change');
    }

    return state;
  }

  function bestProgress(){
    var state = syncVisualProgressFromCard();
    var total = inferTotal();
    var candidates = [
      normalizeProgress(manualIndex, total, 'next-tap'),
      normalizeProgress(visualIndex, total, 'visual-card'),
      state,
      lastKnownProgress
    ].concat(counterProgressCandidates()).filter(Boolean);

    var best = candidates[0] || normalizeProgress(1, total, 'fallback');
    candidates.forEach(function(p){
      if((p.current || 1) > (best.current || 1)) best = p;
    });

    best = normalizeProgress(best.current, Math.max(best.total || 20, manualTotal || 20), best.source || 'unknown');
    manualIndex = Math.max(manualIndex || 1, best.current || 1);
    visualIndex = Math.max(visualIndex || 1, best.current || 1);
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

  function injectAntiFlickerStyle(){
    if(document.getElementById('practiceProgressNoFlickerV384')) return;
    var style = document.createElement('style');
    style.id = 'practiceProgressNoFlickerV384';
    style.textContent = [
      'body.qcm-page .premium-progress strong, body.qcm-page .question-count-stat strong{transition:none!important}',
      'body.qcm-page .premium-progress-track i, body.qcm-page .premium-progress .progress-track i, body.qcm-page .practice-headbox .progress-track:not(.success) i{transition:none!important;animation:none!important}',
      'body.qcm-page .premium-progress, body.qcm-page .premium-progress *{animation-duration:0s!important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function updateAllVisibleCounters(label, compactLabel, pctText, width){
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress strong, .single-question-card .quiz-head .badge, .single-question-card [class*="badge"]'), function(el){
      if(parseProgressText(el.textContent)) setText(el, label);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong'), function(el){ setText(el, compactLabel); });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress span, .premium-progress .premium-progress-head span'), function(el){ setText(el, pctText); });
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress-track i, .premium-progress .progress-track i, .practice-headbox .progress-track:not(.success) i'), function(el){ setWidth(el, width); });
  }

  function publishProgress(progress){
    if(!isQcmPage()) return progress;
    publishing = true;
    try{
      var p = normalizeProgress(progress && progress.current, progress && progress.total, progress && progress.source);
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
        bar.dataset.progressMode = MODE;
        bar.dataset.progressSignature = compactLabel + '/' + p.pct;
        bar.dataset.progressSource = p.source || 'unknown';
      }

      updateAllVisibleCounters(label, compactLabel, pctText, width);
      window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
      window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ = MODE;
      window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ = p;
      return p;
    }finally{
      publishing = false;
    }
  }

  function updatePremiumProgress(){
    pendingProgressTimer = 0;
    if(!isQcmPage()) return null;
    injectAntiFlickerStyle();
    return publishProgress(bestProgress());
  }

  function scheduleProgressUpdate(delay){
    if(pendingProgressTimer) clearTimeout(pendingProgressTimer);
    pendingProgressTimer = setTimeout(updatePremiumProgress, delay == null ? 90 : delay);
  }

  function scheduleAfterRender(){
    updatePremiumProgress();
    [16, 50, 120, 240, 480, 900, 1400, 2200].forEach(function(ms){ setTimeout(updatePremiumProgress, ms); });
  }

  function noteNextTap(){
    var now = Date.now();
    var total = inferTotal();
    if(now < nextTapLockUntil){
      publishProgress(normalizeProgress(Math.max(manualIndex || 1, visualIndex || 1), total, 'next-tap-lock'));
      scheduleAfterRender();
      return;
    }
    nextTapLockUntil = now + 650;
    manualIndex = Math.min(total, Math.max(manualIndex || 1, visualIndex || 1) + 1);
    visualIndex = Math.max(visualIndex || 1, manualIndex);
    publishProgress(normalizeProgress(manualIndex, total, 'next-tap'));
    scheduleAfterRender();
  }

  function resetProgress(){
    manualIndex = 1;
    visualIndex = 1;
    manualTotal = 20;
    lastKnownProgress = null;
    nextTapLockUntil = 0;
    lastIdentity = currentIdentity() || '';
    publishProgress(normalizeProgress(1, inferTotal(), 'reset'));
  }

  function run(){
    if(!isQcmPage()) return;
    injectAntiFlickerStyle();
    window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ = VERSION;
    window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ = MODE;
    window.__MED_NYKUTO_SYNC_PROGRESS__ = updatePremiumProgress;
    if(!lastIdentity) lastIdentity = currentIdentity() || '';
    scheduleAfterRender();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);

  document.addEventListener('click', function(e){
    var actionEl = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
    var action = actionEl && actionEl.dataset ? actionEl.dataset.action : '';
    var resetTarget = e.target && e.target.closest ? e.target.closest('[data-action="restart-session"], .mc-picker-btn, .qfp-choice, [data-kind="course"], [data-kind="module"]') : null;

    if(action === 'next-question') noteNextTap();
    else if(resetTarget) { resetProgress(); scheduleAfterRender(); }
    else scheduleAfterRender();
  }, true);

  document.addEventListener('change', function(e){
    var resetTarget = e.target && e.target.closest ? e.target.closest('.mc-picker-btn, .qfp-choice, [data-kind="course"], [data-kind="module"], select[name*="course"], select[name*="module"]') : null;
    if(resetTarget) { resetProgress(); scheduleAfterRender(); }
    else scheduleAfterRender();
  }, true);

  try{
    var target = document.querySelector('#practiceList') || document.body;
    new MutationObserver(function(){
      if(publishing) return;
      updatePremiumProgress();
      setTimeout(updatePremiumProgress, 16);
    }).observe(target, {childList:true, subtree:true, characterData:true});
  }catch(e){}

  setInterval(function(){
    if(Date.now() - bootedAt < 45000 || document.hidden === false) updatePremiumProgress();
  }, 250);
})();
