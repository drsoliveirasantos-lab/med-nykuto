/* v103 — Critical practice click fallback.
   Directly protects QCM/practice next clicks and keeps correction details visible.
*/
(function(){
  'use strict';
  var VERSION = 'v103';
  window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ = VERSION;

  function isPractice(){ return document.body && document.body.classList && document.body.classList.contains('practice-page'); }
  function clean(s){ return String(s || '').replace(/\s+/g, ' ').trim(); }
  function activeCard(){ return document.querySelector('.single-question-card'); }
  function activeId(){ var c = activeCard(); return c ? (c.id || c.getAttribute('data-id') || '') : ''; }
  function answeredVisible(){ var c = activeCard(); return !!(c && c.querySelector('.answer-panel:not([hidden])')); }
  function stop(e){ if(!e) return; e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
  function isNextControl(el){
    if(!el || !el.closest) return false;
    var c = el.closest('[data-action="next-question"], .practice-stable-next, button, a');
    if(!c) return false;
    var txt = clean(c.textContent);
    return c.getAttribute('data-action') === 'next-question' || /siguiente|suivant|próxima|proxima|next|balance|bilan/i.test(txt);
  }
  function sessionKeys(){
    var out = [];
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        if(/^medPractice:v35-bugfix:/.test(k || '')) out.push(k);
      }
    }catch(e){}
    return out;
  }
  function readSession(key){
    try{
      var state = JSON.parse(localStorage.getItem(key) || '{}');
      if(state && Array.isArray(state.currentBatch)) return state;
    }catch(e){}
    return null;
  }
  function findSessionForQuestion(id){
    var keys = sessionKeys();
    var fallback = null;
    for(var i=0;i<keys.length;i++){
      var state = readSession(keys[i]);
      if(!state) continue;
      var current = Math.max(0, Number(state.currentIndex || 0));
      if(!fallback) fallback = {key:keys[i], state:state, index:current};
      if(id){
        var exact = state.currentBatch[current] === id;
        var idx = state.currentBatch.indexOf(id);
        if(exact || idx >= 0) return {key:keys[i], state:state, index:idx >= 0 ? idx : current};
      }
    }
    return fallback;
  }
  function forceAdvanceFromStorage(beforeId){
    var found = findSessionForQuestion(beforeId);
    if(!found) return false;
    var state = found.state;
    var total = Array.isArray(state.currentBatch) ? state.currentBatch.length : 0;
    if(!total) return false;
    var idx = Math.max(0, Number(found.index));
    if(idx >= total - 1){
      state.currentIndex = total - 1;
      state.batchFinished = true;
    } else {
      state.currentIndex = idx + 1;
      state.batchFinished = false;
    }
    try{ localStorage.setItem(found.key, JSON.stringify(state)); }catch(e){ return false; }
    window.__MED_NYKUTO_LAST_FORCED_NEXT__ = {beforeId:beforeId, nextIndex:state.currentIndex, at:Date.now()};
    location.reload();
    return true;
  }
  function directNext(e){
    if(!answeredVisible()) return false;
    var before = activeId();
    var ok = forceAdvanceFromStorage(before);
    if(ok) stop(e);
    return ok;
  }
  function scheduleNextFallback(beforeId){
    [120, 360, 760].forEach(function(ms){
      setTimeout(function(){
        if(!isPractice()) return;
        var nowId = activeId();
        if(nowId && beforeId && nowId !== beforeId) return;
        forceAdvanceFromStorage(beforeId || nowId);
      }, ms);
    });
  }

  function isDetailsControl(el){
    if(!el || !el.closest) return false;
    var c = el.closest('summary, [data-action*="detail"], [aria-controls], button, a');
    if(!c) return false;
    var txt = clean(c.textContent);
    return c.tagName === 'SUMMARY' || /detalle|detalles|d[eé]tail|d[eé]tails|voir plus|ver m[aá]s|mostrar m[aá]s|plus de/i.test(txt);
  }
  function openDetailsNear(el){
    var panel = el && el.closest ? (el.closest('.answer-panel') || document.querySelector('.single-question-card .answer-panel:not([hidden])')) : document.querySelector('.single-question-card .answer-panel:not([hidden])');
    if(!panel) return false;
    panel.hidden = false;
    panel.style.setProperty('display','block','important');
    panel.style.setProperty('visibility','visible','important');
    panel.style.setProperty('max-height','none','important');
    panel.style.setProperty('overflow','visible','important');
    Array.prototype.forEach.call(panel.querySelectorAll('details'), function(d){ d.open = true; d.hidden = false; });
    Array.prototype.forEach.call(panel.querySelectorAll('[hidden], .is-hidden'), function(n){
      if(n.matches && n.matches('script,style')) return;
      n.hidden = false;
      n.classList.remove('is-hidden');
    });
    Array.prototype.forEach.call(panel.querySelectorAll('.detailed-correction,.pc-card,.ppc-card,.ppc-panel,.premium-correction-card,.correction-detail,.details-panel'), function(n){
      n.hidden = false;
      n.style.setProperty('display','block','important');
      n.style.setProperty('visibility','visible','important');
      n.style.setProperty('max-height','none','important');
      n.style.setProperty('overflow','visible','important');
    });
    return true;
  }
  function keepAnsweredUiOpen(){
    if(!isPractice()) return;
    var panel = document.querySelector('.single-question-card .answer-panel:not([hidden])');
    if(panel) openDetailsNear(panel);
  }

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var before = activeId();
    if(isNextControl(e.target)){
      if(!directNext(e)) scheduleNextFallback(before);
      return;
    }
    if(isDetailsControl(e.target)) setTimeout(function(){ openDetailsNear(e.target); }, 30);
  }, true);

  function injectStyle(){
    if(document.getElementById('practiceCriticalClickFallbackV103Style')) return;
    var st = document.createElement('style');
    st.id = 'practiceCriticalClickFallbackV103Style';
    st.textContent = 'body.practice-page .answer-panel:not([hidden]){display:block!important;visibility:visible!important;max-height:none!important;overflow:visible!important}body.practice-page .answer-panel details[open]{display:block!important}body.practice-page .detailed-correction,body.practice-page .premium-correction-card,body.practice-page .pc-card,body.practice-page .ppc-card,body.practice-page .ppc-panel{visibility:visible!important}';
    document.head.appendChild(st);
  }
  function run(){ injectStyle(); keepAnsweredUiOpen(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  document.addEventListener('click', function(){ setTimeout(run, 80); setTimeout(run, 260); }, true);
  try{ new MutationObserver(function(){ setTimeout(run, 120); }).observe(document.documentElement, {childList:true, subtree:true}); }catch(e){}
})();
