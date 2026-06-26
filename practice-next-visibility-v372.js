/* v377 — deterministic skip with generic practice-storage detection. */
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v377-deterministic-skip-next-storage-scan';
  var lockUntil = 0;

  function isPractice(){ return !!(document.body && document.body.classList && document.body.classList.contains('practice-page')); }
  function card(){ return document.querySelector('.single-question-card'); }
  function cardId(){ var c = card(); return c ? (c.id || '') : ''; }
  function answered(c){ return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen')); }
  function read(k){
    try{
      var s = JSON.parse(localStorage.getItem(k) || 'null');
      return s && Array.isArray(s.currentBatch) ? s : null;
    }catch(e){ return null; }
  }
  function save(k,s){ try{ localStorage.setItem(k, JSON.stringify(s)); return true; }catch(e){ return false; } }
  function exactKey(){
    var p = new URLSearchParams(location.search);
    var type = document.body.dataset.practiceType || 'qcm';
    var mode = p.get('exam') ? 'exam' : 'study';
    var scope = p.get('module') || p.get('course') || 'all';
    var level = mode === 'exam' ? 'examen' : (p.get('difficulty') || p.get('level') || 'all');
    return 'medPractice:v35-bugfix:' + mode + ':' + type + ':' + scope + ':' + level;
  }
  function pushUnique(list, value){ if(value && list.indexOf(value) < 0) list.push(value); }
  function keys(id){
    var out = [];
    pushUnique(out, exactKey());
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i) || '';
        var state = read(k);
        if(!state) continue;
        if(k.indexOf('medPractice:') === 0 || state.currentAnswers || state.history || state.currentBatch.indexOf(id) >= 0){
          pushUnique(out, k);
        }
      }
    }catch(e){}
    return out.sort(function(a,b){
      var sa = read(a), sb = read(b);
      var ia = sa && id ? sa.currentBatch.indexOf(id) : -1;
      var ib = sb && id ? sb.currentBatch.indexOf(id) : -1;
      return (ib >= 0 ? 1 : 0) - (ia >= 0 ? 1 : 0);
    });
  }
  function markSkippedAndAdvance(id){
    var list = keys(id);
    for(var i=0;i<list.length;i++){
      var k = list[i], s = read(k);
      if(!s || !s.currentBatch || !s.currentBatch.length) continue;
      var idx = Math.max(0, Number(s.currentIndex || 0));
      var found = id ? s.currentBatch.indexOf(id) : -1;
      if(found >= 0) idx = found;
      var qid = id || s.currentBatch[idx];
      if(!qid) continue;
      s.currentAnswers = s.currentAnswers || {};
      s.history = s.history || {};
      var rec = Object.assign({}, s.currentAnswers[qid] || {answeredAt:Date.now(), series:s.seriesNumber || 1});
      rec.skipped = true;
      rec.unknown = false;
      rec.correct = false;
      rec.chosen = -1;
      rec.answeredAt = rec.answeredAt || Date.now();
      s.currentAnswers[qid] = rec;
      if(!Array.isArray(s.history[qid])) s.history[qid] = [];
      if(!s.history[qid].length) s.history[qid].push(rec);
      else s.history[qid] = s.history[qid].map(function(h){ return Object.assign({}, h, {skipped:true, unknown:false, correct:false, chosen:-1}); });
      if(!rec.__countedBySkip){
        rec.__countedBySkip = true;
        s.currentAnswers[qid] = rec;
        s.answered = Math.max(Number(s.answered || 0), Object.keys(s.currentAnswers).length);
      }
      s.streak = 0;
      s.missStreak = Math.max(1, Number(s.missStreak || 0));
      s.lastAction = 'wrong';
      if(idx >= s.currentBatch.length - 1){ s.currentIndex = s.currentBatch.length - 1; s.batchFinished = true; }
      else { s.currentIndex = idx + 1; s.batchFinished = false; }
      if(save(k,s)){
        try{ sessionStorage.setItem('__MED_NYKUTO_SKIP_NEXT_LAST__', JSON.stringify({key:k,id:qid,index:s.currentIndex,at:Date.now()})); }catch(e){}
        setTimeout(function(){ location.reload(); }, 20);
        return true;
      }
    }
    return false;
  }
  function nativeNoSeThenAdvance(id){
    var c = card();
    var unknown = c && c.querySelector('[data-action="dont-know"]');
    if(unknown) unknown.click();
    setTimeout(function(){ markSkippedAndAdvance(id); }, 80);
    setTimeout(function(){ markSkippedAndAdvance(id); }, 180);
    setTimeout(function(){ markSkippedAndAdvance(id); }, 360);
    return true;
  }
  function stop(e){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
  function sync(){
    if(!isPractice()) return;
    document.querySelectorAll('.single-question-card').forEach(function(c){
      c.classList.toggle('answer-ready', answered(c));
      c.querySelectorAll('[data-action="next-question"]').forEach(function(btn){
        btn.hidden = false;
        btn.disabled = false;
        btn.removeAttribute('disabled');
        btn.style.pointerEvents = 'auto';
      });
    });
  }
  function inject(){
    if(document.getElementById('nextVisibilityV377Style')) return;
    ['nextVisibilityV376Style','nextVisibilityV375Style','nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style'].forEach(function(id){ var old = document.getElementById(id); if(old) old.remove(); });
    var s = document.createElement('style');
    s.id = 'nextVisibilityV377Style';
    s.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important}';
    document.head.appendChild(s);
  }
  function run(){ inject(); sync(); }
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    if(btn && isPractice()){
      var c = card();
      if(c && !answered(c)){
        if(Date.now() < lockUntil){ stop(e); return; }
        lockUntil = Date.now() + 900;
        nativeNoSeThenAdvance(cardId());
        stop(e);
        return;
      }
    }
    setTimeout(run, 40);
  }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 40); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
