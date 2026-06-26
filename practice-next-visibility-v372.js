/* v375 — next button skips unanswered questions through the native No sé flow. */
(function(){
  'use strict';
  window.__MED_NYKUTO_NEXT_VISIBILITY__ = 'v375-native-skip-next';
  var lockUntil = 0;

  function isPractice(){ return !!(document.body && document.body.classList && document.body.classList.contains('practice-page')); }
  function card(){ return document.querySelector('.single-question-card'); }
  function cardId(){ var c = card(); return c ? (c.id || '') : ''; }
  function answered(c){ return !!(c && c.querySelector('.answer-panel:not([hidden]), .options.answered, .option.correct, .option.wrong, .option.chosen')); }
  function read(k){ try{ var s = JSON.parse(localStorage.getItem(k) || 'null'); return s && Array.isArray(s.currentBatch) ? s : null; }catch(e){ return null; } }
  function save(k,s){ try{ localStorage.setItem(k, JSON.stringify(s)); return true; }catch(e){ return false; } }
  function exactKey(){
    var p = new URLSearchParams(location.search);
    var type = document.body.dataset.practiceType || 'qcm';
    var mode = p.get('exam') ? 'exam' : 'study';
    var scope = p.get('module') || p.get('course') || 'all';
    var level = mode === 'exam' ? 'examen' : (p.get('difficulty') || p.get('level') || 'all');
    return 'medPractice:v35-bugfix:' + mode + ':' + type + ':' + scope + ':' + level;
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
  function convertNativeUnknownToSkipped(id){
    var list = keys(id);
    for(var i=0;i<list.length;i++){
      var k = list[i], s = read(k);
      if(!s || !s.currentAnswers) continue;
      var qid = id;
      if(!s.currentAnswers[qid] && id && s.currentBatch){
        var found = s.currentBatch.indexOf(id);
        if(found >= 0) qid = s.currentBatch[found];
      }
      var rec = s.currentAnswers[qid];
      if(!rec) continue;
      rec.skipped = true;
      rec.unknown = false;
      rec.correct = false;
      rec.chosen = -1;
      s.currentAnswers[qid] = rec;
      if(Array.isArray(s.history && s.history[qid])){
        s.history[qid] = s.history[qid].map(function(h){ return Object.assign({}, h, {skipped:true, unknown:false, correct:false, chosen:-1}); });
      }
      s.lastAction = 'wrong';
      if(save(k,s)){
        try{ sessionStorage.setItem('__MED_NYKUTO_SKIP_NEXT_LAST__', JSON.stringify({key:k,id:qid,index:s.currentIndex,at:Date.now()})); }catch(e){}
        return true;
      }
    }
    return false;
  }
  function clickNativeDontKnowThenNext(id){
    var c = card();
    var unknown = c && c.querySelector('[data-action="dont-know"]');
    if(!unknown) return false;
    unknown.click();
    setTimeout(function(){
      convertNativeUnknownToSkipped(id);
      var next = document.querySelector('.single-question-card [data-action="next-question"]');
      if(next){ next.disabled = false; next.removeAttribute('disabled'); next.click(); }
    }, 80);
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
    if(document.getElementById('nextVisibilityV375Style')) return;
    ['nextVisibilityV374Style','nextVisibilityV373Style','nextVisibilityV372Style'].forEach(function(id){ var old = document.getElementById(id); if(old) old.remove(); });
    var s = document.createElement('style');
    s.id = 'nextVisibilityV375Style';
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
        var id = cardId();
        if(clickNativeDontKnowThenNext(id)) stop(e);
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
