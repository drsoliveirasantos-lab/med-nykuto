/* v313 — QCM inert-zone, no-submit, duplicate-Next and instant-answer guard.
   Root fix for the visible double-render after choosing an answer / "Ver respuesta":
   answer reveal is handled in-place, then the native app.bundle.js full render is skipped for that click.
   Next remains native so app.bundle.js still owns navigation and batch logic. */
(function(){
  'use strict';

  var moved = false;
  var sx = 0;
  var sy = 0;
  var suppressClickUntil = 0;
  var nextLockedUntil = 0;

  function isQcm(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page'));
  }

  function params(){ return new URLSearchParams(location.search || ''); }
  function stableHash(str){
    var h = 0, s = String(str || '');
    for(var i=0;i<s.length;i+=1){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }
  function difficultyKey(item){
    var raw = String(item && item.difficulty || '').toLowerCase();
    if(/normal|base|básico|basico/.test(raw)) return 'normal';
    if(/difficile|difícil|dificil|moyen|medio/.test(raw)) return 'difficile';
    if(/extr/.test(raw)) return 'extreme';
    if(/exam/.test(raw)) return stableHash(item && (item.id || item.question) || '') % 2 === 0 ? 'examen' : 'extreme';
    return 'normal';
  }
  function difficultyOrder(x){
    var key = typeof x === 'string' ? x : difficultyKey(x);
    return key === 'normal' ? 0 : key === 'difficile' ? 1 : key === 'extreme' ? 2 : key === 'examen' ? 3 : 4;
  }
  function bankItems(){
    var p = params();
    var course = p.get('course') || 'all';
    var moduleId = p.get('module') || '';
    var level = p.get('difficulty') || p.get('level') || 'all';
    if(!/^(all|normal|difficile|extreme|examen)$/.test(level)) level = 'all';
    var byCourse = (window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse) || {};
    var items = [];
    Object.keys(byCourse).forEach(function(cid){
      if(course !== 'all' && cid !== course) return;
      items = items.concat((byCourse[cid] && byCourse[cid].qcm) || []);
    });
    if(moduleId) items = items.filter(function(x){ return String(x.moduleId) === String(moduleId); });
    items = items.slice().sort(function(a,b){ return difficultyOrder(a) - difficultyOrder(b) || Number(a.moduleNumber || 0) - Number(b.moduleNumber || 0) || String(a.id).localeCompare(String(b.id)); });
    if(level !== 'all') items = items.filter(function(x){ return difficultyKey(x) === level; });
    else items = items.slice().sort(function(a,b){ return stableHash('qcm|' + course + '|' + moduleId + '|' + a.id) - stableHash('qcm|' + course + '|' + moduleId + '|' + b.id); });
    return {items:items, course:course, moduleId:moduleId, level:level};
  }
  function scopeKey(info){
    var p = params();
    return 'medPractice:v35-bugfix:' + (p.get('exam') ? 'exam' : 'study') + ':qcm:' + (info.moduleId || info.course || 'all') + ':' + (info.level || 'all');
  }
  function unique(ids){
    var out = [], seen = {};
    (ids || []).forEach(function(id){ if(id && !seen[id]){ seen[id]=1; out.push(id); } });
    return out;
  }
  function loadStateForCard(cardId){
    var info = bankItems();
    var key = scopeKey(info);
    var signature = info.items.map(function(x){ return x.id; }).join('|');
    var state = null;
    try{ state = JSON.parse(localStorage.getItem(key) || 'null'); }catch(e){ state = null; }
    if(!state || state.signature !== signature || !Array.isArray(state.currentBatch)){
      var ids = info.items.map(function(x){ return x.id; });
      var batch = unique([cardId].concat(ids.filter(function(id){ return id !== cardId; }))).slice(0,20);
      var used = {};
      batch.forEach(function(id){ used[id]=1; });
      state = {
        order: ids,
        unseenIds: ids.filter(function(id){ return !used[id]; }),
        currentBatch: batch,
        currentIndex: Math.max(0, batch.indexOf(cardId)),
        seriesNumber: 1,
        currentAnswers: {},
        currentMissedIds: [],
        history: {},
        correct: 0,
        answered: 0,
        streak: 0,
        missStreak: 0,
        unknown: 0,
        unknownStreak: 0,
        lastAction: 'start',
        bestStreak: 0,
        batchFinished: false,
        createdAt: Date.now(),
        signature: signature
      };
    }
    state.currentAnswers = state.currentAnswers || {};
    state.history = state.history || {};
    state.seriesNumber = state.seriesNumber || 1;
    return {key:key, state:state, info:info};
  }
  function saveState(key,state){ try{ localStorage.setItem(key, JSON.stringify(state)); }catch(e){} }

  function isInteractive(target){
    if(!target || !target.closest) return false;
    return !!target.closest([
      'a','button','input','select','textarea','label','summary','[role="button"]','[data-action]',
      '.option','.btn','.mc-picker-btn','.practice-compact-pill','.pc-card','.premium-correction-card',
      '#qcmForcePickerModal','#qcmChoiceModal','#v210ModulePicker'
    ].join(','));
  }

  function isInertQcmZone(target){
    if(!target || !target.closest) return false;
    if(!isQcm()) return false;
    if(isInteractive(target)) return false;
    return !!target.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list');
  }

  function swallow(e){
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation) e.stopImmediatePropagation();
  }

  function neutraliseButton(btn){
    if(!btn || !btn.matches || !btn.matches('#practiceList button')) return;
    if(btn.getAttribute('type') !== 'button') btn.setAttribute('type','button');
  }

  function neutraliseExistingButtons(){
    if(!isQcm()) return;
    document.querySelectorAll('#practiceList button').forEach(neutraliseButton);
  }

  function markPracticeButton(e){
    if(!isQcm()) return;
    var btn = e.target && e.target.closest && e.target.closest('#practiceList button');
    if(!btn) return;
    neutraliseButton(btn);
  }

  function nextButton(target){
    if(!target || !target.closest) return null;
    return target.closest('#practiceList [data-action="next-question"]');
  }

  function guardDuplicateNext(e){
    if(!isQcm()) return;
    var btn = nextButton(e.target);
    if(!btn) return;
    neutraliseButton(btn);
    var now = Date.now();
    if(now < nextLockedUntil){
      swallow(e);
      window.__MED_NYKUTO_QCM_DUPLICATE_NEXT_BLOCKED__ = now;
      return true;
    }
    nextLockedUntil = now + 650;
    return false;
  }

  function setOptionBadge(btn, text, cls){
    var em = btn && btn.querySelector('em');
    if(!em || em.querySelector('.option-state')) return;
    var badge = document.createElement('i');
    badge.className = 'option-state ' + cls;
    badge.textContent = text;
    em.appendChild(badge);
  }

  function revealAnswer(card, chosen, unknown){
    var box = card && card.querySelector('.options');
    if(!box) return;
    var answer = Number(box.dataset.answer || 0);
    box.dataset.locked = '1';
    box.classList.add('answered');
    Array.prototype.slice.call(box.querySelectorAll('.option')).forEach(function(btn){
      var idx = Number(btn.dataset.option || 0);
      btn.disabled = true;
      if(idx === answer){ btn.classList.add('correct'); setOptionBadge(btn, 'Correcta', 'ok'); }
      if(!unknown && idx === chosen && idx !== answer){ btn.classList.add('wrong'); setOptionBadge(btn, 'Elegida', 'ko'); }
    });
    var tools = card.querySelector('.preanswer-tools');
    if(tools) tools.hidden = true;
    var unk = card.querySelector('.unknown-action-wrap');
    if(unk) unk.hidden = true;
    var panel = card.querySelector('.answer-panel');
    if(panel){
      panel.hidden = false;
      if(unknown) panel.classList.add('unknown-panel');
    }
    var next = card.querySelector('[data-action="next-question"]');
    if(next){ next.disabled = false; next.removeAttribute('disabled'); }
  }

  function handleInstantAnswer(e){
    if(!isQcm() || !e.target || !e.target.closest) return false;
    var card = e.target.closest('.single-question-card');
    if(!card || !card.id) return false;
    var option = e.target.closest('.options .option');
    var dontKnow = e.target.closest('[data-action="dont-know"]');
    if(!option && !dontKnow) return false;
    var box = card.querySelector('.options');
    if(!box || box.dataset.locked) return false;

    var answer = Number(box.dataset.answer || 0);
    var chosen = dontKnow ? -1 : Number(option.dataset.option || 0);
    var isCorrect = chosen === answer;
    var loaded = loadStateForCard(card.id);
    var state = loaded.state;
    if(!state.currentAnswers[card.id]){
      state.currentAnswers[card.id] = {chosen:chosen, correct:isCorrect, unknown:!!dontKnow, answeredAt:Date.now(), series:state.seriesNumber || 1};
      if(!state.history[card.id]) state.history[card.id] = [];
      state.history[card.id].push(state.currentAnswers[card.id]);
      state.answered = (state.answered || 0) + 1;
      if(dontKnow){
        state.unknown = (state.unknown || 0) + 1;
        state.unknownStreak = (state.unknownStreak || 0) + 1;
        state.streak = 0;
        state.missStreak = (state.missStreak || 0) + 1;
        state.lastAction = 'unknown';
      }else if(isCorrect){
        state.correct = (state.correct || 0) + 1;
        state.streak = (state.streak || 0) + 1;
        state.missStreak = 0;
        state.unknownStreak = 0;
        state.lastAction = 'correct';
        state.bestStreak = Math.max(state.bestStreak || 0, state.streak || 0);
      }else{
        state.streak = 0;
        state.unknownStreak = 0;
        state.missStreak = (state.missStreak || 0) + 1;
        state.lastAction = 'wrong';
      }
      saveState(loaded.key, state);
    }
    revealAnswer(card, chosen, !!dontKnow);
    window.__MED_NYKUTO_QCM_INSTANT_ANSWER__ = Date.now();
    swallow(e);
    return true;
  }

  function guardSubmit(e){
    if(!isQcm()) return;
    if(e.target && e.target.closest && e.target.closest('#practiceList')){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }

  function onTouchStart(e){
    markPracticeButton(e);
    if(!isInertQcmZone(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    sx = t.clientX;
    sy = t.clientY;
    moved = false;
  }

  function onTouchMove(e){
    if(!isInertQcmZone(e.target)) return;
    var t = e.changedTouches && e.changedTouches[0];
    if(!t) return;
    if(Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) moved = true;
  }

  function onTouchEnd(e){
    if(!isInertQcmZone(e.target)) return;
    if(moved) return;
    suppressClickUntil = Date.now() + 500;
    swallow(e);
  }

  function onClick(e){
    if(handleInstantAnswer(e)) return;
    if(guardDuplicateNext(e)) return;
    if(e.cancelBubble) return;
    markPracticeButton(e);
    if(!isInertQcmZone(e.target)) return;
    if(Date.now() < suppressClickUntil || e.type === 'click') swallow(e);
  }

  function injectStyle(){
    if(document.getElementById('qcmTapGuardStyle')) return;
    var st = document.createElement('style');
    st.id = 'qcmTapGuardStyle';
    st.textContent = [
      'body.qcm-page .single-question-card,body.qcm-page .question-prompt,body.qcm-page .structured-prompt{touch-action:pan-y}',
      'body.qcm-page .question-prompt,body.qcm-page .structured-prompt{cursor:default}',
      'body.qcm-page .practice-quick-header,body.qcm-page .page-hero{display:none!important;visibility:hidden!important}',
      'body.qcm-page #practiceList,body.qcm-page #practiceList *{animation:none!important;transition:none!important}'
    ].join(';');
    document.head.appendChild(st);
  }

  document.addEventListener('touchstart', onTouchStart, {capture:true, passive:true});
  document.addEventListener('touchmove', onTouchMove, {capture:true, passive:true});
  document.addEventListener('touchend', onTouchEnd, {capture:true, passive:false});
  document.addEventListener('pointerdown', markPracticeButton, {capture:true, passive:true});
  document.addEventListener('click', onClick, true);
  document.addEventListener('submit', guardSubmit, true);

  injectStyle();
  neutraliseExistingButtons();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ injectStyle(); neutraliseExistingButtons(); });
  window.addEventListener('pageshow', neutraliseExistingButtons);
})();
