/* v386 — Owned QCM progress overlay.
   Prevents visible flicker from legacy progress rewrites by hiding the native
   progress text/fill and rendering a monotonic owned label/fill instead.
*/
(function(){
  'use strict';

  var VERSION = 'v386-owned-progress-overlay';
  var current = 1;
  var total = 20;
  var initialized = false;
  var lastIdentity = '';
  var nextLockUntil = 0;
  var rendering = false;

  function isQcm(){ return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page')); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function clamp(n){ return Math.max(1, Math.min(Math.max(1,total || 20), Number(n || 1))); }
  function pct(){ return Math.max(0, Math.min(100, Math.round((current / Math.max(1,total || 20)) * 100))); }

  function card(){ return document.querySelector('.single-question-card'); }
  function identity(){
    var c = card();
    if(!c) return '';
    var prompt = c.querySelector('.question-prompt, .structured-prompt, h2, h3, p');
    return [c.id || '', clean(prompt && prompt.textContent)].join('|');
  }

  function parseCounterText(s){
    var m = clean(s).match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    if(!m) return null;
    return {current:Number(m[1]), total:Number(m[2])};
  }

  function externalInitialProgress(){
    var best = null;
    Array.prototype.forEach.call(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge, .single-question-card [class*="badge"]'), function(n){
      var p = parseCounterText(n.textContent);
      if(p && (!best || p.current > best.current)) best = p;
    });
    var state = window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__;
    if(state && state.current && state.total && (!best || Number(state.current) > best.current)) best = {current:Number(state.current), total:Number(state.total)};
    return best;
  }

  function injectStyle(){
    if(document.getElementById('ownedQcmProgressOverlayV386')) return;
    var style = document.createElement('style');
    style.id = 'ownedQcmProgressOverlayV386';
    style.textContent = [
      'body.qcm-page .premium-progress .premium-progress-head{position:relative!important}',
      'body.qcm-page .premium-progress .premium-progress-head strong,body.qcm-page .premium-progress .premium-progress-head span{opacity:0!important;transition:none!important}',
      'body.qcm-page .premium-progress .premium-progress-head::before{content:attr(data-owned-label);position:absolute;left:0;top:0;opacity:1!important;color:inherit;font-weight:950}',
      'body.qcm-page .premium-progress .premium-progress-head::after{content:attr(data-owned-pct);position:absolute;right:0;top:0;opacity:1!important;color:inherit;font-weight:950}',
      'body.qcm-page .premium-progress-track{position:relative!important;overflow:hidden!important}',
      'body.qcm-page .premium-progress-track i{opacity:0!important;transition:none!important;animation:none!important}',
      'body.qcm-page .premium-progress-track::after{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--owned-qcm-progress-width,5%);border-radius:inherit;background:#f8dd8a!important;box-shadow:0 0 12px rgba(248,221,138,.32);transition:none!important;animation:none!important}',
      'body.qcm-page .question-count-stat strong{transition:none!important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function initializeFromExisting(){
    if(initialized) return;
    var p = externalInitialProgress();
    if(p){
      total = Math.max(1, Number(p.total || total || 20));
      current = clamp(p.current || current || 1);
    }
    lastIdentity = identity() || '';
    initialized = true;
  }

  function publish(source){
    if(!isQcm()) return;
    rendering = true;
    try{
      injectStyle();
      initializeFromExisting();
      current = clamp(current);
      var percent = pct();
      var label = 'Pregunta ' + current + '/' + total;
      var compact = current + '/' + total;
      var percentText = percent + '%';

      Array.prototype.forEach.call(document.querySelectorAll('.premium-progress .premium-progress-head'), function(head){
        head.setAttribute('data-owned-label', label);
        head.setAttribute('data-owned-pct', percentText);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.premium-progress, .premium-progress-track'), function(el){
        el.style.setProperty('--owned-qcm-progress-width', percent + '%');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.question-count-stat strong'), function(el){
        if(clean(el.textContent) !== compact) el.textContent = compact;
      });

      window.__MED_NYKUTO_OWNED_QCM_PROGRESS__ = VERSION;
      window.__MED_NYKUTO_OWNED_QCM_PROGRESS_STATE__ = {current:current,total:total,pct:percent,source:source || 'owned'};
    }finally{
      rendering = false;
    }
  }

  function maybeAdvanceByIdentity(){
    var id = identity();
    if(!id) return;
    if(!lastIdentity){ lastIdentity = id; return; }
    if(id !== lastIdentity){
      lastIdentity = id;
      current = clamp(current + 1);
    }
  }

  function onNextTap(){
    var now = Date.now();
    if(now < nextLockUntil){ publish('next-lock'); return; }
    nextLockUntil = now + 650;
    initializeFromExisting();
    current = clamp(current + 1);
    setTimeout(function(){ lastIdentity = identity() || lastIdentity; publish('next-after-render'); }, 80);
    publish('next-tap');
  }

  function resetOwned(){
    current = 1;
    total = 20;
    initialized = true;
    lastIdentity = identity() || '';
    publish('reset');
  }

  function run(){
    if(!isQcm()) return;
    initializeFromExisting();
    maybeAdvanceByIdentity();
    publish('run');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);

  document.addEventListener('click', function(e){
    var next = e.target && e.target.closest ? e.target.closest('[data-action="next-question"]') : null;
    var reset = e.target && e.target.closest ? e.target.closest('[data-action="restart-session"], .mc-picker-btn, .qfp-choice, [data-kind="course"], [data-kind="module"]') : null;
    if(next) onNextTap();
    else if(reset) setTimeout(resetOwned, 0);
    else setTimeout(run, 20);
  }, true);

  try{
    new MutationObserver(function(){
      if(rendering) return;
      publish('mutation');
    }).observe(document.documentElement, {childList:true, subtree:true, characterData:true});
  }catch(e){}

  setInterval(run, 500);
})();
