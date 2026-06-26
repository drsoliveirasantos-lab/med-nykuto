/* v371 — Native sticky next with generic practice-storage fallback.
   Keeps the real [data-action="next-question"] button so the official app.bundle.js handler can run.
   If the native click stalls, this script advances the stored practice session that actually contains the visible card id.
*/
(function(){
  'use strict';
  window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ = 'v371-native-storage-scan-next';
  var FORCE_LOCK_UNTIL = 0;

  function isPractice(){
    return document.body && document.body.classList && document.body.classList.contains('practice-page');
  }

  function removeFakeBars(){
    Array.prototype.forEach.call(document.querySelectorAll('#practiceMobileNextBar, .practice-mobile-next-bar'), function(el){
      try{ el.remove(); }catch(e){}
    });
  }

  function currentCard(){ return document.querySelector('.single-question-card'); }
  function currentCardId(){ var c = currentCard(); return c ? (c.id || '') : ''; }

  function hasAnsweredCurrentQuestion(){
    var card = currentCard();
    return !!(card && card.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen'));
  }

  function activeDifficulty(){
    var p = new URLSearchParams(location.search);
    var raw = p.get('difficulty') || p.get('level') || 'all';
    return ['all','normal','difficile','extreme','examen'].indexOf(raw) >= 0 ? raw : 'all';
  }

  function exactPracticeKey(){
    var p = new URLSearchParams(location.search);
    var type = (document.body && document.body.dataset.practiceType) || 'qcm';
    var mode = p.get('exam') ? 'exam' : 'study';
    var course = p.get('course') || 'all';
    var moduleId = p.get('module') || '';
    var scope = moduleId || course || 'all';
    var level = mode === 'exam' ? 'examen' : activeDifficulty();
    return 'medPractice:v35-bugfix:' + mode + ':' + type + ':' + scope + ':' + level;
  }

  function readState(key){
    try{
      var raw = localStorage.getItem(key);
      if(!raw) return null;
      var state = JSON.parse(raw);
      return state && Array.isArray(state.currentBatch) ? state : null;
    }catch(e){ return null; }
  }

  function writeState(key,state){
    try{ localStorage.setItem(key, JSON.stringify(state)); return true; }catch(e){ return false; }
  }

  function pushUnique(list, key){
    if(key && list.indexOf(key) < 0) list.push(key);
  }

  function candidateKeys(cardId){
    var out = [];
    pushUnique(out, exactPracticeKey());
    try{
      for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i) || '';
        var state = readState(key);
        if(!state) continue;
        if(key.indexOf('medPractice:') === 0 || state.currentAnswers || state.history || (cardId && state.currentBatch.indexOf(cardId) >= 0)){
          pushUnique(out, key);
        }
      }
    }catch(e){}
    return out.sort(function(a,b){
      var sa = readState(a), sb = readState(b);
      var ia = sa && cardId ? sa.currentBatch.indexOf(cardId) : -1;
      var ib = sb && cardId ? sb.currentBatch.indexOf(cardId) : -1;
      return (ib >= 0 ? 1 : 0) - (ia >= 0 ? 1 : 0);
    });
  }

  function forceStoredNext(reason){
    if(!isPractice() || !hasAnsweredCurrentQuestion()) return false;
    var now = Date.now();
    if(now < FORCE_LOCK_UNTIL) return false;
    FORCE_LOCK_UNTIL = now + 700;

    var cardId = currentCardId();
    var keys = candidateKeys(cardId);
    for(var i=0; i<keys.length; i++){
      var key = keys[i];
      var state = readState(key);
      if(!state || !state.currentBatch || !state.currentBatch.length) continue;
      var total = state.currentBatch.length;
      var foundIndex = cardId ? state.currentBatch.indexOf(cardId) : -1;
      var idx = foundIndex >= 0 ? foundIndex : Math.max(0, Number(state.currentIndex || 0));
      if(idx >= total - 1){
        state.currentIndex = total - 1;
        state.batchFinished = true;
      }else{
        state.currentIndex = idx + 1;
        state.batchFinished = false;
      }
      if(!writeState(key,state)) continue;
      window.__MED_NYKUTO_LAST_FORCED_NEXT__ = {
        key:key,
        reason:reason || 'fallback',
        index:state.currentIndex,
        total:total,
        cardId:cardId,
        at:Date.now()
      };
      try{ sessionStorage.setItem('__MED_NYKUTO_LAST_FORCED_NEXT__', JSON.stringify(window.__MED_NYKUTO_LAST_FORCED_NEXT__)); }catch(e){}
      setTimeout(function(){ location.reload(); }, 20);
      return true;
    }
    return false;
  }

  function normalizeNativeNext(){
    if(!isPractice()) return;
    removeFakeBars();
    var card = currentCard();
    var nav = card && card.querySelector('.single-nav-actions');
    var next = nav && nav.querySelector('[data-action="next-question"]');
    if(!nav || !next){
      document.body.classList.remove('has-native-sticky-next');
      return;
    }

    nav.classList.add('native-sticky-next-actions');
    next.classList.add('native-sticky-next-button');
    next.removeAttribute('aria-hidden');
    next.style.pointerEvents = 'auto';
    next.style.touchAction = 'manipulation';

    if(!next.dataset.storageScanNextBound){
      next.dataset.storageScanNextBound = '1';
      next.addEventListener('click', function(){
        var before = currentCardId();
        setTimeout(function(){
          if(before && currentCardId() === before) forceStoredNext('native-click-stalled-120ms');
        }, 120);
        setTimeout(function(){
          if(before && currentCardId() === before) forceStoredNext('native-click-stalled-420ms');
        }, 420);
        setTimeout(function(){
          if(before && currentCardId() === before) forceStoredNext('native-click-stalled-900ms');
        }, 900);
      }, false);
    }

    if(hasAnsweredCurrentQuestion()){
      next.disabled = false;
      next.removeAttribute('disabled');
      document.body.classList.add('has-native-sticky-next');
    }else{
      document.body.classList.remove('has-native-sticky-next');
    }
  }

  function injectCss(){
    if(document.getElementById('practice-native-next-v371-css')) return;
    ['practice-native-next-v370-css','practice-native-next-v369-css','practice-mobile-next-css-v368','practice-mobile-next-css-v367'].forEach(function(id){
      var old = document.getElementById(id);
      if(old) old.remove();
    });
    var style = document.createElement('style');
    style.id = 'practice-native-next-v371-css';
    style.textContent = [
      '#practiceMobileNextBar,.practice-mobile-next-bar{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      '@media (max-width:760px){',
      '  body.practice-page.has-native-sticky-next{padding-bottom:calc(140px + env(safe-area-inset-bottom,0px))!important}',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions{',
      '    position:sticky; bottom:calc(76px + env(safe-area-inset-bottom,0px)); z-index:500;',
      '    display:grid!important; grid-template-columns:1fr; gap:8px; padding:10px!important; margin:14px 0 4px!important;',
      '    border-radius:18px; background:rgba(11,18,32,.94); border:1px solid rgba(148,163,184,.26);',
      '    box-shadow:0 16px 38px rgba(0,0,0,.34); backdrop-filter:blur(10px); pointer-events:auto!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="previous-question"]{display:none!important}',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="next-question"]{',
      '    display:flex!important; align-items:center; justify-content:center; width:100%!important; min-height:50px!important;',
      '    border-radius:15px!important; font-size:1rem!important; font-weight:950!important; pointer-events:auto!important; touch-action:manipulation!important;',
      '  }',
      '  body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions [data-action="next-question"]:disabled{opacity:.45!important}',
      '}',
      '@media (min-width:761px){body.practice-page .single-question-card .single-nav-actions.native-sticky-next-actions{position:static!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function run(){
    if(!isPractice()) return;
    injectCss();
    normalizeNativeNext();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  window.addEventListener('resize', run);
  document.addEventListener('click', function(e){
    var next = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    var before = next ? currentCardId() : '';
    setTimeout(run, 40);
    setTimeout(function(){ run(); if(next && before && currentCardId() === before) forceStoredNext('document-click-stalled-180ms'); }, 180);
    setTimeout(function(){ run(); if(next && before && currentCardId() === before) forceStoredNext('document-click-stalled-520ms'); }, 520);
    setTimeout(function(){ run(); if(next && before && currentCardId() === before) forceStoredNext('document-click-stalled-1000ms'); }, 1000);
  }, true);
  try{
    var queued = false;
    new MutationObserver(function(){
      if(queued) return;
      queued = true;
      setTimeout(function(){ queued = false; run(); }, 50);
    }).observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['hidden','disabled','class']});
  }catch(e){}
})();
