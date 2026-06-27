/* v316 — QCM inert-zone, instant answer and instant Next guard.
   Root fix: answers and Next are handled in-place on QCM, so app.bundle.js does not repaint the whole practice list after every tap.
   Compatibility: exposes the lightweight runtime marker used by browser regression tests without loading forced runtime repair layers. */
(function(){
  'use strict';

  window.__MED_NYKUTO_RUNTIME_GUARD__ = 'v362';
  window.__MED_NYKUTO_QCM_INSTANT_RENDER__ = 'v316-answer-next-details-in-place';

  var moved = false;
  var sx = 0;
  var sy = 0;
  var suppressClickUntil = 0;
  var nextLockedUntil = 0;

  function isQcm(){
    return !!(document.body && document.body.classList && document.body.classList.contains('qcm-page')) && !(new URLSearchParams(location.search || '')).get('exam');
  }
  function params(){ return new URLSearchParams(location.search || ''); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clean(s){ return String(s || '').replace(/\b(Selon|D'après|Dans) le cours[^?.!]*[?.!]\s*/gi,'').replace(/\bSegún el curso[^?.!]*[?.!]\s*/gi,'').replace(/\bSegún el módulo[^?.!]*[?.!]\s*/gi,'').replace(/\s+/g,' ').trim(); }
  function letter(i){ return String.fromCharCode(65 + Number(i || 0)); }
  function hash(str){ var h = 0, s = String(str || ''); for(var i=0;i<s.length;i+=1){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }
  function difficultyKey(item){
    var raw = String(item && item.difficulty || '').toLowerCase();
    if(/normal|base|básico|basico/.test(raw)) return 'normal';
    if(/difficile|difícil|dificil|moyen|medio/.test(raw)) return 'difficile';
    if(/extr/.test(raw)) return 'extreme';
    if(/exam/.test(raw)) return hash(item && (item.id || item.question) || '') % 2 === 0 ? 'examen' : 'extreme';
    return 'normal';
  }
  function difficultyOrder(x){ var k = typeof x === 'string' ? x : difficultyKey(x); return k === 'normal' ? 0 : k === 'difficile' ? 1 : k === 'extreme' ? 2 : k === 'examen' ? 3 : 4; }
  function topic(item){
    var list = [item && item.heading, item && item.moduleTitle, item && item.question, item && item.stem].map(clean).filter(Boolean);
    var t = list.find(function(x){ return !/(caso clínico|pregunta|marca la opción|identifica la opción|desde el punto de vista)/i.test(x); }) || clean(item && item.moduleTitle || 'este tema');
    t = t.replace(/^Módulo\s+\d+\s*-\s*/i,'').trim();
    if(t.length > 70) t = t.slice(0,70).replace(/\s+\S*$/,'') + '…';
    return t || 'este tema';
  }
  function questionText(item){
    var k = difficultyKey(item), t = topic(item);
    if(k === 'normal') return '¿Qué opción describe correctamente ' + t + '?';
    if(k === 'difficile') return '¿Cuál es la relación fisiológica más correcta sobre ' + t + '?';
    if(k === 'extreme') return '¿Qué opción integra mejor el mecanismo y sus consecuencias en ' + t + '?';
    return clean(item && item.question || 'Marca la opción correcta.');
  }

  function bankInfo(){
    var q = params();
    var course = q.get('course') || 'all';
    var moduleId = q.get('module') || '';
    var level = q.get('difficulty') || q.get('level') || 'all';
    if(!/^(all|normal|difficile|extreme|examen)$/.test(level)) level = 'all';
    var byCourse = (window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse) || {};
    var items = [];
    Object.keys(byCourse).forEach(function(cid){
      if(course !== 'all' && cid !== course) return;
      items = items.concat((byCourse[cid] && byCourse[cid].qcm) || []);
    });
    if(moduleId) items = items.filter(function(x){ return String(x.moduleId) === String(moduleId); });
    items = items.slice().sort(function(a,b){ return difficultyOrder(a) - difficultyOrder(b) || Number(a.moduleNumber || 0) - Number(b.moduleNumber || 0) || String(a.id).localeCompare(String(b.id)); });
    if(level === 'all') items = items.slice().sort(function(a,b){ return hash('qcm|' + course + '|' + moduleId + '|' + a.id) - hash('qcm|' + course + '|' + moduleId + '|' + b.id); });
    else items = items.filter(function(x){ return difficultyKey(x) === level; });
    return {items:items, course:course, moduleId:moduleId, level:level};
  }
  function scopeKey(info){ return 'medPractice:v35-bugfix:study:qcm:' + (info.moduleId || info.course || 'all') + ':' + (info.level || 'all'); }
  function unique(ids){ var out = [], seen = {}; (ids || []).forEach(function(id){ if(id && !seen[id]){ seen[id] = 1; out.push(id); } }); return out; }
  function stateFor(cardId){
    var info = bankInfo();
    var key = scopeKey(info);
    var signature = info.items.map(function(x){ return x.id; }).join('|');
    var state = null;
    try{ state = JSON.parse(localStorage.getItem(key) || 'null'); }catch(e){ state = null; }
    if(!state || state.signature !== signature || !Array.isArray(state.currentBatch)){
      var ids = info.items.map(function(x){ return x.id; });
      var batch = unique([cardId].concat(ids.filter(function(id){ return id !== cardId; }))).slice(0,20);
      var used = {}; batch.forEach(function(id){ used[id] = 1; });
      state = {order:ids, unseenIds:ids.filter(function(id){ return !used[id]; }), currentBatch:batch, currentIndex:Math.max(0, batch.indexOf(cardId)), seriesNumber:1, currentAnswers:{}, currentMissedIds:[], history:{}, correct:0, answered:0, streak:0, missStreak:0, unknown:0, unknownStreak:0, lastAction:'start', bestStreak:0, batchFinished:false, createdAt:Date.now(), signature:signature};
    }
    state.currentAnswers = state.currentAnswers || {};
    state.history = state.history || {};
    state.seriesNumber = state.seriesNumber || 1;
    return {key:key, state:state, info:info};
  }
  function saveState(key,state){ try{ localStorage.setItem(key, JSON.stringify(state)); }catch(e){} }
  function currentItems(info,state){ var map = {}; info.items.forEach(function(x){ map[x.id] = x; }); return (state.currentBatch || []).map(function(id){ return map[id]; }).filter(Boolean); }
  function batchCorrect(state){ return Object.values(state.currentAnswers || {}).filter(function(r){ return r && r.correct; }).length; }
  function answeredCount(state){ return Object.keys(state.currentAnswers || {}).length; }

  function updateDashboard(state,total){
    var answered = answeredCount(state);
    var correct = batchCorrect(state);
    var globalPct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    var batchPct = answered ? Math.round((correct / answered) * 100) : 0;
    var qPct = total ? Math.round((((state.currentIndex || 0) + 1) / total) * 100) : 0;
    var stats = document.querySelectorAll('.session-dashboard .session-stat');
    if(stats[0]){ var q = stats[0].querySelector('strong'); if(q) q.textContent = Math.min(total,(state.currentIndex || 0) + 1) + '/' + total; }
    if(stats[2]){ var g = stats[2].querySelector('strong'), gs = stats[2].querySelector('small'); if(g) g.textContent = (state.correct || 0) + '/' + (state.answered || 0); if(gs) gs.textContent = globalPct + '%'; }
    if(stats[3]){ var b = stats[3].querySelector('strong'), bs = stats[3].querySelector('small'); if(b) b.textContent = correct + '/' + answered; if(bs) bs.textContent = batchPct + '%'; }
    if(stats[4]){ var u = stats[4].querySelector('strong'); if(u) u.textContent = state.unknown || 0; }
    var fills = document.querySelectorAll('.session-bars .progress-track i');
    if(fills[0]) fills[0].style.width = qPct + '%';
    if(fills[1]) fills[1].style.width = globalPct + '%';
    try{ if(typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__(); }catch(e){}
  }

  function optionHtml(opt,idx,item,record){
    var answer = Number(item.answerIndex || 0), chosen = record ? Number(record.chosen) : -99, cls = '', badge = '';
    if(record){
      if(idx === answer){ cls += ' correct'; badge = '<i class="option-state ok">Correcta</i>'; }
      else if(idx === chosen && idx !== answer){ cls += ' wrong'; badge = '<i class="option-state ko">Elegida</i>'; }
    }
    return '<button type="button" class="option' + cls + '" data-option="' + idx + '" ' + (record ? 'disabled' : '') + '><span>' + letter(idx) + '</span><em>' + esc(clean(opt)) + badge + '</em></button>';
  }
  function correctionHtml(item){
    var answer = Number(item.answerIndex || 0);
    var exp = clean(item.explanation || 'Explicación fundada en el curso.');
    return '<strong>Respuesta correcta: ' + letter(answer) + '</strong><p>' + esc(exp) + '</p><details class="qcm-distractor-details"><summary>Ver distractores</summary><div class="detailed-correction"><p>Revisa por qué las otras opciones no corresponden al mecanismo principal evaluado.</p></div></details>';
  }
  function renderCard(item,state,total){
    var record = state.currentAnswers && state.currentAnswers[item.id];
    var answered = !!record;
    var current = Math.min(total, (state.currentIndex || 0) + 1);
    var options = (item.options || []).map(function(o,i){ return optionHtml(o,i,item,record); }).join('');
    return '<article class="practice-card quiz-card single-question-card v32-question-card" id="' + esc(item.id) + '">' +
      '<div class="quiz-head"><span class="badge">Pregunta ' + current + '/' + total + '</span><span class="badge question-level-badge">Nivel : ' + esc(difficultyKey(item)) + '</span><span class="badge">Módulo ' + esc(item.moduleNumber || '') + ' · ' + esc(item.moduleTitle || '') + '</span></div>' +
      '<div class="question-study-strip"><span><b>1</b>Concepto</span><span><b>2</b>Mecanismo</span><span><b>3</b>Consecuencia</span><span><b>4</b>Distractor</span></div>' +
      '<div class="question-prompt"><h3>' + esc(questionText(item)) + '</h3></div>' +
      '<div class="options ' + (answered ? 'answered' : '') + '" data-answer="' + Number(item.answerIndex || 0) + '" ' + (answered ? 'data-locked="1"' : '') + '>' + options + '</div>' +
      '<div class="preanswer-tools" ' + (answered ? 'hidden' : '') + '><button type="button" class="tool-btn" data-action="show-hint">Pista</button><button type="button" class="tool-btn" data-action="eliminate-two">Eliminar 2</button><button type="button" class="tool-btn" data-action="mark-review">Marcar</button></div>' +
      '<div class="hint-panel" hidden><strong>Pista dirigida</strong><p>Piensa en el mecanismo central de ' + esc(topic(item)) + '.</p></div>' +
      '<div class="unknown-action-wrap" ' + (answered ? 'hidden' : '') + '><button type="button" class="btn unknown-btn" data-action="dont-know">No sé / Ver respuesta</button></div>' +
      '<div class="answer-panel ' + (record && record.unknown ? 'unknown-panel' : '') + '" ' + (answered ? '' : 'hidden') + '>' + correctionHtml(item) + '</div>' +
      '<div class="single-nav-actions"><button class="btn ghost" data-action="previous-question" ' + ((state.currentIndex || 0) <= 0 ? 'disabled' : '') + '>Anterior</button><button class="btn secondary" data-action="next-question">' + ((state.currentIndex || 0) >= total - 1 ? 'Balance' : 'Siguiente pregunta') + '</button></div>' +
      '<div class="module-actions slim"><a class="btn ghost" href="module.html?id=' + encodeURIComponent(item.moduleId || '') + '">Revisar curso</a><button class="btn ghost report-btn" data-action="open-feedback">Señalar error</button><button class="btn ghost" data-action="restart-session">Reiniciar</button></div>' +
      '</article>';
  }
  function renderDone(list,state,total){ var answered = answeredCount(state), correct = batchCorrect(state), pct = answered ? Math.round(correct / answered * 100) : 0; list.innerHTML = '<article class="practice-card completion-card"><p class="eyebrow">Fin de serie</p><h2>' + correct + '/' + answered + ' respuestas correctas · ' + pct + '%</h2><p>Serie terminada. Puedes reiniciar o volver a los módulos.</p><div class="completion-score"><div class="progress-track success"><i style="width:' + pct + '%"></i></div></div><div class="module-actions"><button class="btn secondary" data-action="restart-session">Rehacer sesión</button><a class="btn ghost" href="matieres.html">Volver a materias</a></div></article>'; }

  function addBadge(btn,text,cls){ var em = btn && btn.querySelector('em'); if(!em || em.querySelector('.option-state')) return; var badge = document.createElement('i'); badge.className = 'option-state ' + cls; badge.textContent = text; em.appendChild(badge); }
  function ensureDetails(panel){
    if(!panel || panel.querySelector('details')) return;
    var d = document.createElement('details');
    d.className = 'qcm-distractor-details';
    d.innerHTML = '<summary>Ver distractores</summary><div class="detailed-correction"><p>Revisa los distractores y conserva la lógica de la respuesta correcta.</p></div>';
    panel.appendChild(d);
  }
  function revealAnswer(card,chosen,unknown){
    var box = card && card.querySelector('.options'); if(!box) return;
    var answer = Number(box.dataset.answer || 0);
    box.dataset.locked = '1'; box.classList.add('answered');
    Array.prototype.slice.call(box.querySelectorAll('.option')).forEach(function(btn){ var idx = Number(btn.dataset.option || 0); btn.disabled = true; if(idx === answer){ btn.classList.add('correct'); addBadge(btn,'Correcta','ok'); } if(!unknown && idx === chosen && idx !== answer){ btn.classList.add('wrong'); addBadge(btn,'Elegida','ko'); } });
    var tools = card.querySelector('.preanswer-tools'); if(tools) tools.hidden = true;
    var unk = card.querySelector('.unknown-action-wrap'); if(unk) unk.hidden = true;
    var panel = card.querySelector('.answer-panel'); if(panel){ panel.hidden = false; if(unknown) panel.classList.add('unknown-panel'); ensureDetails(panel); }
    enableNextButtons(card);
  }

  function handleDetails(e){
    if(!isQcm() || !e.target || !e.target.closest) return false;
    var summary = e.target.closest('#practiceList .answer-panel details summary');
    if(!summary) return false;
    var details = summary.closest('details');
    if(!details) return false;
    details.open = !details.open;
    window.__MED_NYKUTO_QCM_DETAILS_TOGGLED__ = Date.now();
    swallow(e);
    return true;
  }
  function handleTools(e){
    var target = e.target; if(!isQcm() || !target || !target.closest) return false;
    var card = target.closest('.single-question-card'); if(!card) return false;
    var btn = target.closest('[data-action="show-hint"],[data-action="eliminate-two"],[data-action="mark-review"]'); if(!btn) return false;
    var action = btn.dataset.action;
    if(action === 'show-hint'){ var panel = card.querySelector('.hint-panel'); if(panel) panel.hidden = !panel.hidden; btn.classList.toggle('active', panel && !panel.hidden); swallow(e); return true; }
    if(action === 'eliminate-two'){ var box = card.querySelector('.options'); if(box && !box.dataset.locked){ var answer = Number(box.dataset.answer || 0); var wrong = Array.prototype.slice.call(box.querySelectorAll('.option')).filter(function(x){ return Number(x.dataset.option) !== answer && !x.disabled; }); wrong.slice(0, Math.min(2, Math.max(0, wrong.length - 1))).forEach(function(x){ x.classList.add('eliminated'); x.disabled = true; }); btn.disabled = true; } swallow(e); return true; }
    if(action === 'mark-review'){ btn.textContent = 'Marcado'; btn.disabled = true; swallow(e); return true; }
    return false;
  }
  function handleAnswer(e){
    var target = e.target; if(!isQcm() || !target || !target.closest) return false;
    var card = target.closest('.single-question-card'); if(!card || !card.id) return false;
    var option = target.closest('.options .option'); var dontKnow = target.closest('[data-action="dont-know"]');
    if(!option && !dontKnow) return false;
    var box = card.querySelector('.options'); if(!box || box.dataset.locked) return false;
    var answer = Number(box.dataset.answer || 0); var chosen = dontKnow ? -1 : Number(option.dataset.option || 0); var correct = chosen === answer;
    var loaded = stateFor(card.id); var state = loaded.state; var items = currentItems(loaded.info,state); var total = items.length || 20;
    if(!state.currentAnswers[card.id]){
      state.currentAnswers[card.id] = {chosen:chosen, correct:correct, unknown:!!dontKnow, answeredAt:Date.now(), series:state.seriesNumber || 1};
      if(!state.history[card.id]) state.history[card.id] = [];
      state.history[card.id].push(state.currentAnswers[card.id]);
      state.answered = (state.answered || 0) + 1;
      if(dontKnow){ state.unknown = (state.unknown || 0) + 1; state.unknownStreak = (state.unknownStreak || 0) + 1; state.streak = 0; state.missStreak = (state.missStreak || 0) + 1; state.lastAction = 'unknown'; }
      else if(correct){ state.correct = (state.correct || 0) + 1; state.streak = (state.streak || 0) + 1; state.missStreak = 0; state.unknownStreak = 0; state.lastAction = 'correct'; state.bestStreak = Math.max(state.bestStreak || 0, state.streak || 0); }
      else { state.streak = 0; state.unknownStreak = 0; state.missStreak = (state.missStreak || 0) + 1; state.lastAction = 'wrong'; }
      saveState(loaded.key,state);
    }
    revealAnswer(card,chosen,!!dontKnow);
    updateDashboard(state,total);
    window.__MED_NYKUTO_QCM_INSTANT_ANSWER__ = Date.now();
    swallow(e);
    return true;
  }
  function handleNext(e){
    var target = e.target; if(!isQcm() || !target || !target.closest) return false;
    var btn = target.closest('#practiceList [data-action="next-question"]'); if(!btn) return false;
    var now = Date.now(); if(now < nextLockedUntil){ swallow(e); return true; } nextLockedUntil = now + 650;
    var card = btn.closest('.single-question-card'); var list = document.querySelector('#practiceList'); if(!card || !list || !card.id) return false;
    var loaded = stateFor(card.id); var state = loaded.state; var items = currentItems(loaded.info,state); var total = items.length; if(!total) return false;
    var idx = (state.currentBatch || []).indexOf(card.id); if(idx < 0) idx = state.currentIndex || 0;
    if(idx >= total - 1){ state.batchFinished = true; saveState(loaded.key,state); renderDone(list,state,total); swallow(e); return true; }
    state.currentIndex = idx + 1;
    saveState(loaded.key,state);
    var nextId = state.currentBatch[state.currentIndex]; var nextItem = items.find(function(x){ return x.id === nextId; }); if(!nextItem) return false;
    card.outerHTML = renderCard(nextItem,state,total);
    updateDashboard(state,total);
    neutraliseExistingButtons();
    window.__MED_NYKUTO_QCM_INSTANT_NEXT__ = Date.now();
    swallow(e);
    return true;
  }

  function isInteractive(target){ return !!(target && target.closest && target.closest('a,button,input,select,textarea,label,summary,[role="button"],[data-action],.option,.btn,.mc-picker-btn,.practice-compact-pill,.pc-card,.premium-correction-card,#qcmForcePickerModal,#qcmChoiceModal,#v210ModulePicker')); }
  function isInertQcmZone(target){ return !!(target && target.closest && isQcm() && !isInteractive(target) && target.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list')); }
  function swallow(e){ e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }
  function neutraliseButton(btn){ if(btn && btn.matches && btn.matches('#practiceList button') && btn.getAttribute('type') !== 'button') btn.setAttribute('type','button'); }
  function enableNextButtons(root){ Array.prototype.slice.call((root || document).querySelectorAll('body.qcm-page #practiceList [data-action="next-question"], #practiceList [data-action="next-question"]')).forEach(function(btn){ neutraliseButton(btn); btn.disabled = false; btn.removeAttribute('disabled'); }); }
  function neutraliseExistingButtons(){ if(!isQcm()) return; document.querySelectorAll('#practiceList button').forEach(neutraliseButton); enableNextButtons(document); }
  function markPracticeButton(e){ var btn = e.target && e.target.closest && e.target.closest('#practiceList button'); if(btn) neutraliseButton(btn); }
  function onTouchStart(e){ markPracticeButton(e); if(!isInertQcmZone(e.target)) return; var t = e.changedTouches && e.changedTouches[0]; if(!t) return; sx = t.clientX; sy = t.clientY; moved = false; }
  function onTouchMove(e){ if(!isInertQcmZone(e.target)) return; var t = e.changedTouches && e.changedTouches[0]; if(!t) return; if(Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) moved = true; }
  function onTouchEnd(e){ if(!isInertQcmZone(e.target)) return; if(moved) return; suppressClickUntil = Date.now() + 500; swallow(e); }
  function onClick(e){ if(handleDetails(e)) return; if(handleTools(e)) return; if(handleAnswer(e)) return; if(handleNext(e)) return; markPracticeButton(e); if(!isInertQcmZone(e.target)) return; if(Date.now() < suppressClickUntil || e.type === 'click') swallow(e); }
  function guardSubmit(e){ if(isQcm() && e.target && e.target.closest && e.target.closest('#practiceList')) swallow(e); }
  function injectStyle(){ if(document.getElementById('qcmTapGuardStyle')) return; var st = document.createElement('style'); st.id = 'qcmTapGuardStyle'; st.textContent = ['body.qcm-page .single-question-card,body.qcm-page .question-prompt,body.qcm-page .structured-prompt{touch-action:pan-y}','body.qcm-page .question-prompt,body.qcm-page .structured-prompt{cursor:default}','body.qcm-page .practice-quick-header,body.qcm-page .page-hero{display:none!important;visibility:hidden!important}','body.qcm-page #practiceList,body.qcm-page #practiceList *{animation:none!important;transition:none!important}'].join(';'); document.head.appendChild(st); }

  document.addEventListener('touchstart', onTouchStart, {capture:true, passive:true});
  document.addEventListener('touchmove', onTouchMove, {capture:true, passive:true});
  document.addEventListener('touchend', onTouchEnd, {capture:true, passive:false});
  document.addEventListener('pointerdown', markPracticeButton, {capture:true, passive:true});
  document.addEventListener('click', onClick, true);
  document.addEventListener('submit', guardSubmit, true);
  injectStyle();
  neutraliseExistingButtons();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ injectStyle(); neutraliseExistingButtons(); });
  window.addEventListener('load', neutraliseExistingButtons);
  window.addEventListener('pageshow', neutraliseExistingButtons);
})();
