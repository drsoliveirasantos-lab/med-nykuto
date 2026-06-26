/* v368 — Stable next-button guard for practice pages.
   Fixes mobile floating next action: higher safe position + direct storage fallback if synthetic click fails.
*/
(function(){
  'use strict';
  window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ = 'v368-mobile-safe-next';
  var lockedUntil = 0;
  var forwarding = false;
  var BAR_ID = 'practiceMobileNextBar';

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }
  function isNextText(el){
    return /siguiente|suivant|próxima|proxima|next|question suivante|pregunta siguiente|balance|bilan/i.test(String(el && el.textContent || ''));
  }
  function nextCandidate(target){
    if(!target || !target.closest) return null;
    return target.closest('[data-action="next-question"], .compact-next-bar button, .compact-next-bar a, button, a');
  }
  function isNextButton(btn){
    if(!btn) return false;
    if(btn.getAttribute && btn.getAttribute('data-action') === 'next-question') return true;
    if(btn.closest && btn.closest('.compact-next-bar') && (isNextText(btn) || btn.classList.contains('practice-stable-next'))) return true;
    if(isNextText(btn) && btn.closest && btn.closest('.single-question-card')) return true;
    return false;
  }
  function activeQuestionId(){
    var card = document.querySelector('.single-question-card');
    return card ? (card.id || card.getAttribute('data-id') || '') : '';
  }
  function answeredVisible(){
    var card = document.querySelector('.single-question-card');
    if(!card) return false;
    var panel = card.querySelector('.answer-panel:not([hidden])');
    return !!panel;
  }
  function realNextButton(){
    return document.querySelector('.single-question-card .single-nav-actions [data-action="next-question"], #practiceList [data-action="next-question"], [data-action="next-question"]');
  }
  function stop(e){
    if(!e) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function sessionKeys(){
    var out = [];
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i) || '';
        if(/^medPractice:v35-bugfix:/.test(k)) out.push(k);
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
  function writeSession(key,state){
    try{ localStorage.setItem(key, JSON.stringify(state)); return true; }catch(e){ return false; }
  }
  function findSessionForQuestion(id){
    var keys = sessionKeys();
    var fallback = null;
    for(var i=0;i<keys.length;i++){
      var state = readSession(keys[i]);
      if(!state) continue;
      var idx = Math.max(0, Number(state.currentIndex || 0));
      if(!fallback) fallback = {key:keys[i], state:state, index:idx};
      if(id){
        var exact = state.currentBatch[idx] === id;
        var foundIndex = state.currentBatch.indexOf(id);
        if(exact || foundIndex >= 0) return {key:keys[i], state:state, index:foundIndex >= 0 ? foundIndex : idx};
      }
    }
    return fallback;
  }
  function forceAdvanceFromStorage(beforeId, reloadDelay){
    if(!answeredVisible()) return false;
    var found = findSessionForQuestion(beforeId || activeQuestionId());
    if(!found) return false;
    var state = found.state;
    var total = Array.isArray(state.currentBatch) ? state.currentBatch.length : 0;
    if(!total) return false;
    var idx = Math.max(0, Number(found.index || state.currentIndex || 0));
    if(idx >= total - 1){
      state.currentIndex = total - 1;
      state.batchFinished = true;
    } else {
      state.currentIndex = idx + 1;
      state.batchFinished = false;
    }
    if(!writeSession(found.key, state)) return false;
    window.__MED_NYKUTO_LAST_NEXT_FALLBACK__ = {question:beforeId || '', index:state.currentIndex, at:Date.now()};
    setTimeout(function(){ location.reload(); }, typeof reloadDelay === 'number' ? reloadDelay : 25);
    return true;
  }

  function injectMobileNextCss(){
    if(document.getElementById('practice-mobile-next-css-v368')) return;
    var old = document.getElementById('practice-mobile-next-css-v367');
    if(old) old.remove();
    var style = document.createElement('style');
    style.id = 'practice-mobile-next-css-v368';
    style.textContent = [
      '@media (max-width: 760px){',
      '  body.practice-page.has-mobile-next-bar{ padding-bottom: calc(156px + env(safe-area-inset-bottom, 0px)); }',
      '  .compact-next-bar.practice-mobile-next-bar{',
      '    position: fixed; left: 12px; right: 12px; bottom: calc(78px + env(safe-area-inset-bottom, 0px));',
      '    z-index: 2147483000; display: flex; gap: 10px; align-items: center; justify-content: center;',
      '    padding: 9px; border-radius: 18px; background: rgba(11, 18, 32, .94);',
      '    border: 1px solid rgba(148, 163, 184, .28); box-shadow: 0 18px 44px rgba(0,0,0,.42); backdrop-filter: blur(12px);',
      '    pointer-events: auto; touch-action: manipulation;',
      '  }',
      '  .compact-next-bar.practice-mobile-next-bar[hidden]{ display:none !important; }',
      '  .compact-next-bar.practice-mobile-next-bar .practice-stable-next{',
      '    width: 100%; min-height: 50px; border-radius: 15px; font-weight: 900; font-size: 1rem; pointer-events:auto; touch-action:manipulation;',
      '  }',
      '}',
      '@media (min-width: 761px){ .compact-next-bar.practice-mobile-next-bar{ display:none !important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function stabilizeCompactButtons(root){
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll ? root.querySelectorAll('.compact-next-bar [data-action="next-question"], .compact-next-bar button, .compact-next-bar a') : [], function(btn){
      if(btn.dataset && btn.dataset.stableNext === '1') return;
      var clean = btn.cloneNode(true);
      clean.removeAttribute('data-action');
      clean.setAttribute('type','button');
      clean.classList.add('practice-stable-next');
      clean.dataset.stableNext = '1';
      if(!isNextText(clean)) clean.textContent = 'Siguiente pregunta →';
      btn.replaceWith(clean);
    });
  }

  function setHidden(el, value){
    if(!el) return;
    if(!!el.hidden !== !!value) el.hidden = !!value;
  }
  function setBodyClass(name, value){
    if(!document.body) return;
    var has = document.body.classList.contains(name);
    if(value && !has) document.body.classList.add(name);
    if(!value && has) document.body.classList.remove(name);
  }
  function setTextIfChanged(el, value){
    if(!el) return;
    value = String(value || 'Siguiente pregunta →');
    if(String(el.textContent || '') !== value) el.textContent = value;
  }

  function ensureMobileNextBar(){
    if(!isPractice() || !document.body) return;
    injectMobileNextCss();
    var real = realNextButton();
    var bar = document.getElementById(BAR_ID);
    if(!bar){
      bar = document.createElement('div');
      bar.id = BAR_ID;
      bar.className = 'compact-next-bar practice-mobile-next-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Navegación de pregunta');
      bar.hidden = true;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn secondary practice-stable-next';
      btn.dataset.stableNext = '1';
      btn.textContent = 'Siguiente pregunta →';
      bar.appendChild(btn);
      document.body.appendChild(bar);
    }
    var shouldShow = !!(real && answeredVisible());
    if(shouldShow){
      var label = String(real.textContent || '').trim() || 'Siguiente pregunta →';
      setTextIfChanged(bar.querySelector('.practice-stable-next'), label);
      setHidden(bar, false);
      setBodyClass('has-mobile-next-bar', true);
    }else{
      setHidden(bar, true);
      setBodyClass('has-mobile-next-bar', false);
    }
  }

  function dispatchRealNext(){
    var beforeId = activeQuestionId();
    var real = realNextButton();
    if(!real) return forceAdvanceFromStorage(beforeId, 25);
    if(real.disabled || real.hasAttribute('disabled')){
      if(!answeredVisible()) return false;
      real.disabled = false;
      real.removeAttribute('disabled');
    }
    forwarding = true;
    try{
      real.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    } finally {
      forwarding = false;
    }
    lockedUntil = Date.now() + 500;
    setTimeout(function(){
      if(activeQuestionId() === beforeId) forceAdvanceFromStorage(beforeId, 25);
    }, 120);
    setTimeout(function(){
      if(activeQuestionId() === beforeId) forceAdvanceFromStorage(beforeId, 25);
    }, 360);
    setTimeout(ensureMobileNextBar, 30);
    setTimeout(ensureMobileNextBar, 160);
    return true;
  }

  function fallbackIfStillSame(beforeId){
    setTimeout(function(){
      if(!isPractice()) return;
      if(activeQuestionId() !== beforeId) return;
      if(!dispatchRealNext()) forceAdvanceFromStorage(beforeId, 25);
    }, 140);
    setTimeout(function(){
      if(!isPractice()) return;
      if(activeQuestionId() !== beforeId) return;
      forceAdvanceFromStorage(beforeId, 25);
    }, 520);
  }

  document.addEventListener('click', function(e){
    if(!isPractice()) return;
    var btn = nextCandidate(e.target);
    if(!isNextButton(btn)) return;
    var beforeId = activeQuestionId();

    var now = Date.now();
    if(!forwarding && now < lockedUntil){
      stop(e);
      fallbackIfStillSame(beforeId);
      return;
    }

    if(btn.closest && btn.closest('.compact-next-bar')){
      stop(e);
      if(!dispatchRealNext()) forceAdvanceFromStorage(beforeId, 25);
      fallbackIfStillSame(beforeId);
      return;
    }

    if(!forwarding){
      lockedUntil = now + 500;
      fallbackIfStillSame(beforeId);
      setTimeout(ensureMobileNextBar, 30);
      setTimeout(ensureMobileNextBar, 160);
    }
  }, true);

  function run(){ stabilizeCompactButtons(document); ensureMobileNextBar(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  window.addEventListener('resize', run);
  document.addEventListener('click', function(){ setTimeout(run, 30); setTimeout(run, 140); setTimeout(run, 420); }, true);
  try{
    var scheduled = false;
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes || [], function(n){
          if(n && n.nodeType === 1) stabilizeCompactButtons(n);
        });
      });
      if(!scheduled){
        scheduled = true;
        setTimeout(function(){ scheduled = false; ensureMobileNextBar(); }, 50);
      }
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
})();
