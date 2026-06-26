/* v107 — safe mobile Next retry only.
   app.bundle.js stays native first. This file must not open panels, observe DOM mutations,
   or repaint the QCM card after an answer. */
(function(){
  'use strict';
  var VERSION = 'v107-safe-next-retry-only';
  var nextPending = null;
  window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ = VERSION;

  function isPractice(){ return document.body && document.body.classList && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }

  function questionIdentity(){
    var card = document.querySelector('.single-question-card');
    if(!card) return '';
    if(card.id) return 'id:' + card.id;
    var prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return 'text:' + clean(prompt && prompt.textContent);
  }

  function questionCounter(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.question-count-stat strong, .single-question-card .quiz-head .badge, .premium-progress strong'));
    for(var i=0;i<nodes.length;i+=1){
      var match = String(nodes[i].textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if(match) return match[1] + '/' + match[2];
    }
    return '';
  }

  function nextButton(el){
    if(!el || !el.closest) return null;
    return el.closest('[data-action="next-question"]');
  }

  function isUsableNext(btn){
    if(!btn || !btn.isConnected) return false;
    if(btn.disabled || btn.getAttribute('disabled') != null || btn.getAttribute('aria-disabled') === 'true') return false;
    var st = getComputedStyle(btn);
    if(st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
    var r = btn.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  }

  function scheduleNextRetry(btn){
    if(!isPractice() || !isUsableNext(btn)) return;
    var beforeId = questionIdentity();
    var beforeCounter = questionCounter();
    if(!beforeId) return;
    if(nextPending && nextPending.beforeId === beforeId && Date.now() - nextPending.startedAt < 900) return;
    nextPending = {beforeId: beforeId, beforeCounter: beforeCounter, startedAt: Date.now()};
    setTimeout(function(){
      var pending = nextPending;
      if(!pending || pending.beforeId !== beforeId) return;
      var currentId = questionIdentity();
      var currentCounter = questionCounter();
      if(currentId && (currentId !== beforeId || currentCounter !== beforeCounter)){
        nextPending = null;
        return;
      }
      if(!isUsableNext(btn)){
        nextPending = null;
        return;
      }
      window.__MED_NYKUTO_NEXT_TOUCH_RETRY_LAST__ = Date.now();
      try{ btn.click(); }
      catch(e){
        try{ btn.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window})); }catch(_){}
      }
      setTimeout(function(){ nextPending = null; }, 250);
    }, 320);
  }

  function injectStyle(){
    if(document.getElementById('practiceCriticalClickFallbackV107Style')) return;
    ['practiceCriticalClickFallbackV106Style','practiceCriticalClickFallbackV105Style','practiceCriticalClickFallbackV104Style'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var st = document.createElement('style');
    st.id = 'practiceCriticalClickFallbackV107Style';
    st.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{touch-action:manipulation!important;pointer-events:auto!important}';
    document.head.appendChild(st);
  }

  document.addEventListener('touchend', function(e){
    if(!isPractice()) return;
    var btn = nextButton(e.target);
    if(btn) scheduleNextRetry(btn);
  }, {capture:true, passive:true});

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var btn = nextButton(e.target);
    if(btn) scheduleNextRetry(btn);
  }, true);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyle); else injectStyle();
  window.addEventListener('pageshow', injectStyle);
})();
