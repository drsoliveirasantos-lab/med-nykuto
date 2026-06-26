/* v374 — next button can skip unanswered questions as wrong. */
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v374-skip-unanswered-next';
  var lockUntil = 0;

  function isPractice(){ return !!(document.body && document.body.classList && document.body.classList.contains('practice-page')); }
  function card(){ return document.querySelector('.single-question-card'); }
  function cardId(){ var c = card(); return c ? (c.id || '') : ''; }
  function answered(c){ return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen')); }
  function read(k){ try{ var s = JSON.parse(localStorage.getItem(k) || 'null'); return s && Array.isArray(s.currentBatch) ? s : null; }catch(e){ return null; } }
  function save(k,s){ try{ localStorage.setItem(k, JSON.stringify(s)); return true; }catch(e){ return false; } }
  function level(){ var p = new URLSearchParams(location.search); var v = p.get('difficulty') || p.get('level') || 'all'; return ['all','normal','difficile','extreme','examen'].indexOf(v) >= 0 ? v : 'all'; }
  function exactKey(){
    var p = new URLSearchParams(location.search);
    var type = document.body.dataset.practiceType || 'qcm';
    var mode = p.get('exam') ? 'exam' : 'study';
    var scope = p.get('module') || p.get('course') || 'all';
    var lvl = mode === 'exam' ? 'examen' : level();
    return 'medPractice:v35-bugfix:' + mode + ':' + type + ':' + scope + ':' + lvl;
  }
  function keys(id){
    var out = [exactKey()];
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i) || '';
        if(k.indexOf('medPractice:v35-bugfix:') === 0 && out.indexOf(k) < 0) out.push(k);
      }
    }catch(e){}
    return out.sort(function(a,b){
      var sa = read(a), sb = read(b);
      var ia = sa && id ? sa.currentBatch.indexOf(id) : -1;
      var ib = sb && id ? sb.currentBatch.indexOf(id) : -1;
      return (ib >= 0 ? 1 : 0) - (ia >= 0 ? 1 : 0);
    });
  }
  function recordSkip(payload){
    window.__MED_NYKUTO_SKIP_NEXT_LAST__ = payload;
    try{ sessionStorage.setItem('__MED_NYKUTO_SKIP_NEXT_LAST__', JSON.stringify(payload)); }catch(e){}
  }
  function skipAndNext(){
    if(!isPractice()) return false;
    var c = card();
    if(!c || answered(c)) return false;
    if(Date.now() < lockUntil) return true;
    lockUntil = Date.now() + 700;
    var id = cardId();
    var list = keys(id);
    for(var i=0;i<list.length;i++){
      var k = list[i], s = read(k);
      if(!s || !s.currentBatch.length) continue;
      var idx = Number(s.currentIndex || 0);
      var found = id ? s.currentBatch.indexOf(id) : -1;
      if(found >= 0) idx = found;
      var qid = id || s.currentBatch[idx];
      s.currentAnswers = s.currentAnswers || {};
      s.history = s.history || {};
      if(!s.currentAnswers[qid]){
        var rec = {chosen:-1, correct:false, skipped:true, answeredAt:Date.now(), series:s.seriesNumber || 1};
        s.currentAnswers[qid] = rec;
        if(!s.history[qid]) s.history[qid] = [];
        s.history[qid].push(rec);
        s.answered = Number(s.answered || 0) + 1;
        s.streak = 0;
        s.missStreak = Number(s.missStreak || 0) + 1;
        s.lastAction = 'wrong';
      }
      if(idx >= s.currentBatch.length - 1){ s.currentIndex = s.currentBatch.length - 1; s.batchFinished = true; }
      else { s.currentIndex = idx + 1; s.batchFinished = false; }
      if(save(k,s)){
        recordSkip({key:k, id:qid, index:s.currentIndex, at:Date.now()});
        setTimeout(function(){ location.reload(); }, 20);
        return true;
      }
    }
    return false;
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
    if(document.getElementById('nextVisibilityV374Style')) return;
    var old = document.getElementById('nextVisibilityV373Style') || document.getElementById('nextVisibilityV372Style');
    if(old) old.remove();
    var s = document.createElement('style');
    s.id = 'nextVisibilityV374Style';
    s.textContent = 'body.practice-page .single-question-card [data-action="next-question"]{display:flex!important;visibility:visible!important;pointer-events:auto!important;opacity:1!important}';
    document.head.appendChild(s);
  }
  function run(){ inject(); sync(); }
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-action="next-question"]');
    if(btn && skipAndNext()) stop(e);
    setTimeout(run, 40);
  }, true);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run);
  window.addEventListener('pageshow', run);
  try{ new MutationObserver(function(){ setTimeout(run, 40); }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled','class']}); }catch(e){}
})();
