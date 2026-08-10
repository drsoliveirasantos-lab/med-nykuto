/* v314 — Practice inert-zone guard plus instant Casos clínicos renderer.
   Casos clínicos now reveal answers and move Next in-place, without app.bundle.js repainting #practiceList.
   V/F keeps the existing inert-zone protection only. */
(function(){
  'use strict';

  window.__MED_NYKUTO_CASE_INSTANT_RENDER__ = 'v314-answer-next-details-in-place';

  var moved = false;
  var sx = 0;
  var sy = 0;
  var suppress = 0;
  var nextLock = 0;

  function isPractice(){ return !!(document.body && document.body.dataset.page === 'practice' && !document.body.classList.contains('qcm-page')); }
  function isCasePage(){ return !!(isPractice() && document.body.dataset.practiceType === 'case'); }
  function params(){ return new URLSearchParams(location.search || ''); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clean(s){ return String(s || '').replace(/\b(Selon|D'après|Dans) le cours[^?.!]*[?.!]\s*/gi,'').replace(/\bSelon le module[^?.!]*[?.!]\s*/gi,'').replace(/\bSegún el curso[^?.!]*[?.!]\s*/gi,'').replace(/\bSegún el módulo[^?.!]*[?.!]\s*/gi,'').replace(/\bA partir del caso,?\s*/gi,'').replace(/\s+/g,' ').trim(); }
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
  function optionText(opt){ return esc(clean(opt)); }
  function clinicalClue(item){
    var s = clean(item && (item.stem || item.case || item.clinicalCase || ''));
    if(!s || /^(caso clínico|se analiza|un caso clínico)/i.test(s)) s = clean(item && item.question || '');
    if(!s || /opción|respuesta|mecanismo/i.test(s)) s = 'Tema clínico: ' + clean(item && item.moduleTitle || 'este módulo') + '. Identifica el dato clave, el mecanismo y la consecuencia clínica.';
    if(s.length > 260) s = s.slice(0,260).replace(/\s+\S*$/,'') + '…';
    return s;
  }
  function topic(item){
    var candidates = [item && item.heading, item && item.moduleTitle, item && item.question, item && item.stem].map(clean).filter(Boolean);
    var t = candidates.find(function(x){ return !/(caso clínico|pregunta|marca la opción|identifica la opción|respuesta|mecanismo)/i.test(x); }) || clean(item && item.moduleTitle || 'este caso');
    t = t.replace(/^Módulo\s+\d+\s*-\s*/i,'').trim();
    if(t.length > 70) t = t.slice(0,70).replace(/\s+\S*$/,'') + '…';
    return t || 'este caso';
  }
  function caseQuestion(item){
    var q = clean(item && item.question || '');
    if(q && !/caso clínico aplicado|A partir del caso|marca la opción|respuesta/i.test(q)) return q;
    return 'A partir del caso clínico, ¿cuál es la opción más correcta?';
  }
  function firstText(item, keys){
    for(var i=0;i<keys.length;i+=1){ var v = item && item[keys[i]]; if(typeof v === 'string' && clean(v)) return clean(v); }
    return '';
  }
  function sourceText(source, idx){
    if(!source) return '';
    var key = letter(idx), n = String(idx);
    if(typeof source === 'string') return clean(source);
    if(Array.isArray(source)) return clean(source[idx] || '');
    if(typeof source === 'object') return clean(source[key] || source[key.toLowerCase()] || source[n] || source['option' + key] || source['option' + n] || '');
    return '';
  }
  function optionReason(item, idx){
    var sources = [item && item.whyWrong, item && item.optionExplanations, item && item.optionRationales, item && item.rationales, item && item.distractorExplanations, item && item.porQueLasOtrasSonFalsas];
    for(var i=0;i<sources.length;i+=1){ var txt = sourceText(sources[i], idx); if(txt) return txt; }
    if(idx === Number(item && item.answerIndex || 0)) return firstText(item, ['correctRationale','correctExplanation','explanationShort','explanation']) || 'Esta opción integra mejor los datos clínicos con el mecanismo evaluado.';
    return 'No es la mejor opción porque no conecta de forma completa el dato clínico principal con el mecanismo y la consecuencia esperada.';
  }
  function shortExplanation(item, record){
    var s = firstText(item, ['explanationShort','shortExplanation','briefExplanation','rationaleShort','explanation']);
    if(s && s.length > 220) s = s.slice(0,220).replace(/\s+\S*$/,'') + '…';
    if(s) return s;
    return record && record.correct ? 'La opción elegida corresponde al razonamiento clínico central del caso.' : 'La clave es relacionar el dato clínico con el mecanismo fisiopatológico principal.';
  }
  function longExplanation(item){ return firstText(item, ['explanationLong','longExplanation','detailedExplanation','rationale','explanation']) || 'Para resolver el caso, primero identifica el dato clínico dominante, luego relaciónalo con el mecanismo del módulo y finalmente descarta las opciones que cambian la secuencia causal.'; }
  function takeaway(item){ return firstText(item, ['takeaway','keyPoint','memoryTip']) || 'En un caso clínico, la mejor respuesta suele ser la que une dato clave → mecanismo → consecuencia, sin saltar pasos.'; }

  function bankInfo(){
    var q = params(), course = q.get('course') || 'all', moduleId = q.get('module') || '', level = q.get('difficulty') || q.get('level') || 'all';
    if(!/^(all|normal|difficile|extreme|examen)$/.test(level)) level = 'all';
    var byCourse = (window.MED_PRACTICE_BANK && window.MED_PRACTICE_BANK.byCourse) || {};
    var items = [];
    Object.keys(byCourse).forEach(function(cid){
      if(course !== 'all' && cid !== course) return;
      items = items.concat((byCourse[cid] && byCourse[cid].cases) || []);
    });
    if(moduleId) items = items.filter(function(x){ return String(x.moduleId) === String(moduleId); });
    items = items.slice().sort(function(a,b){ return difficultyOrder(a) - difficultyOrder(b) || Number(a.moduleNumber || 0) - Number(b.moduleNumber || 0) || String(a.id).localeCompare(String(b.id)); });
    if(level === 'all') items = items.slice().sort(function(a,b){ return hash('case|' + course + '|' + moduleId + '|' + a.id) - hash('case|' + course + '|' + moduleId + '|' + b.id); });
    else items = items.filter(function(x){ return difficultyKey(x) === level; });
    return {items:items, course:course, moduleId:moduleId, level:level};
  }
  function scopeKey(info){ return 'medPractice:v35-bugfix:study:case:' + (info.moduleId || info.course || 'all') + ':' + (info.level || 'all'); }
  function unique(ids){ var out=[], seen={}; (ids || []).forEach(function(id){ if(id && !seen[id]){ seen[id]=1; out.push(id); } }); return out; }
  function initialState(info, cardId){
    var ids = info.items.map(function(x){ return x.id; });
    var batch = unique([cardId].concat(ids.filter(function(id){ return id !== cardId; }))).slice(0,20);
    var used = {}; batch.forEach(function(id){ used[id]=1; });
    return {order:ids, unseenIds:ids.filter(function(id){ return !used[id]; }), currentBatch:batch, currentIndex:Math.max(0,batch.indexOf(cardId)), seriesNumber:1, currentAnswers:{}, currentMissedIds:[], history:{}, correct:0, answered:0, streak:0, missStreak:0, unknown:0, unknownStreak:0, lastAction:'start', bestStreak:0, batchFinished:false, createdAt:Date.now(), signature:ids.join('|')};
  }
  function stateFor(cardId){
    var info = bankInfo(), key = scopeKey(info), signature = info.items.map(function(x){ return x.id; }).join('|'), state = null;
    try{ state = JSON.parse(localStorage.getItem(key) || 'null'); }catch(e){ state = null; }
    if(!state || state.signature !== signature || !Array.isArray(state.currentBatch)) state = initialState(info, cardId);
    state.currentAnswers = state.currentAnswers || {}; state.history = state.history || {}; state.seriesNumber = state.seriesNumber || 1;
    var idx = (state.currentBatch || []).indexOf(cardId); if(idx >= 0) state.currentIndex = idx;
    return {key:key, state:state, info:info};
  }
  function saveState(key,state){ try{ localStorage.setItem(key, JSON.stringify(state)); }catch(e){} }
  function currentItems(info,state){ var map={}; info.items.forEach(function(x){ map[x.id]=x; }); return (state.currentBatch || []).map(function(id){ return map[id]; }).filter(Boolean); }
  function answeredCount(state){ return Object.keys(state.currentAnswers || {}).length; }
  function batchCorrect(state){ return Object.values(state.currentAnswers || {}).filter(function(r){ return r && r.correct; }).length; }

  function progressHtml(current,total){
    var safeTotal = Math.max(1, Number(total || 1));
    var safeCurrent = Math.max(1, Math.min(safeTotal, Number(current || 1)));
    var pct = Math.round((safeCurrent / safeTotal) * 100);
    return '<div class="case-progress-block"><div class="case-progress-head"><span>Cas ' + safeCurrent + '/' + safeTotal + '</span><strong>' + pct + '%</strong></div><div class="case-progress-track"><i style="width:' + pct + '%"></i></div></div>';
  }
  function updateDashboard(state,total){
    var answered = answeredCount(state), correct = batchCorrect(state), globalPct = state.answered ? Math.round((state.correct / state.answered) * 100) : 0, batchPct = answered ? Math.round((correct / answered) * 100) : 0, qPct = total ? Math.round((((state.currentIndex || 0) + 1) / total) * 100) : 0;
    var stats = document.querySelectorAll('.session-dashboard .session-stat');
    if(stats[0]){ var q = stats[0].querySelector('strong'); if(q) q.textContent = Math.min(total,(state.currentIndex || 0) + 1) + '/' + total; }
    if(stats[2]){ var g = stats[2].querySelector('strong'), gs = stats[2].querySelector('small'); if(g) g.textContent = (state.correct || 0) + '/' + (state.answered || 0); if(gs) gs.textContent = globalPct + '%'; }
    if(stats[3]){ var b = stats[3].querySelector('strong'), bs = stats[3].querySelector('small'); if(b) b.textContent = correct + '/' + answered; if(bs) bs.textContent = batchPct + '%'; }
    if(stats[4]){ var u = stats[4].querySelector('strong'); if(u) u.textContent = state.unknown || 0; }
    var fills = document.querySelectorAll('.session-bars .progress-track i'); if(fills[0]) fills[0].style.width = qPct + '%'; if(fills[1]) fills[1].style.width = globalPct + '%';
  }
  function optionHtml(opt, idx, item, record){
    var answer = Number(item.answerIndex || 0), chosen = record ? Number(record.chosen) : -99, cls = '', badge = '';
    if(record){
      if(idx === answer){ cls = ' correct'; badge = '<i class="option-state ok">Correcta</i>'; }
      else if(idx === chosen && idx !== answer){ cls = ' wrong'; badge = '<i class="option-state ko">Elegida</i>'; }
    }
    return '<button type="button" class="option' + cls + '" data-option="' + idx + '" ' + (record ? 'disabled' : '') + '><span>' + letter(idx) + '</span><em>' + optionText(opt) + badge + '</em></button>';
  }
  function feedbackHtml(item, record){
    var answer = Number(item.answerIndex || 0), selected = record && !record.unknown && Number(record.chosen) >= 0 ? letter(record.chosen) : 'No sé', cls = record && record.correct ? 'is-correct' : (record && record.unknown ? 'is-unknown' : 'is-wrong'), label = record && record.correct ? 'Correcta' : (record && record.unknown ? 'Respuesta revelada' : 'Incorrecta');
    var distractors = (item.options || []).map(function(opt,idx){ var ok = idx === answer; return '<div class="case-reason-item ' + (ok ? 'is-answer' : '') + '"><span>' + letter(idx) + '</span><div><strong>' + (ok ? 'Correcta' : 'Falsa') + '</strong><p>' + esc(optionReason(item, idx)) + '</p></div></div>'; }).join('');
    return '<section class="case-feedback-card ' + cls + '">' +
      '<div class="case-feedback-top"><span class="case-feedback-pill">' + label + '</span><p>Tu respuesta: <strong>' + esc(selected) + '</strong> · Buena respuesta: <strong>' + letter(answer) + '</strong></p></div>' +
      '<div class="case-feedback-short"><strong>Justification rapide</strong><p>' + esc(shortExplanation(item, record)) + '</p></div>' +
      '<details class="case-feedback-details" open><summary>Voir explication complète</summary><p>' + esc(longExplanation(item)) + '</p></details>' +
      '<section class="case-feedback-reasons"><h4>Pourquoi les autres réponses sont fausses</h4>' + distractors + '</section>' +
      '<section class="case-feedback-takeaway"><h4>À retenir</h4><p>' + esc(takeaway(item)) + '</p></section>' +
      '</section>';
  }
  function renderCard(item,state,total){
    var record = state.currentAnswers && state.currentAnswers[item.id], answered = !!record, current = Math.min(total,(state.currentIndex || 0) + 1);
    return '<article class="practice-card quiz-card single-question-card v32-question-card" id="' + esc(item.id) + '">' +
      progressHtml(current,total) +
      '<div class="quiz-head"><span class="badge">Pregunta ' + current + '/' + total + '</span><span class="badge question-level-badge">Nivel : ' + esc(difficultyKey(item)) + '</span><span class="badge">Módulo ' + esc(item.moduleNumber || '') + ' · ' + esc(item.moduleTitle || '') + '</span></div>' +
      '<div class="question-study-strip"><span><b>1</b>Dato clínico</span><span><b>2</b>Mecanismo</span><span><b>3</b>Consecuencia</span><span><b>4</b>Eliminar</span></div>' +
      '<div class="case-stem clinical-clue-card"><span>Caso clínico</span><p>' + esc(clinicalClue(item)) + '</p></div>' +
      '<div class="question-prompt"><h3>' + esc(caseQuestion(item)) + '</h3></div>' +
      '<div class="options ' + (answered ? 'answered' : '') + '" data-answer="' + Number(item.answerIndex || 0) + '" ' + (answered ? 'data-locked="1"' : '') + '>' + (item.options || []).map(function(o,i){ return optionHtml(o,i,item,record); }).join('') + '</div>' +
      '<div class="preanswer-tools" ' + (answered ? 'hidden' : '') + '><button type="button" class="tool-btn" data-action="show-hint">Pista</button><button type="button" class="tool-btn" data-action="eliminate-two">Eliminar 2</button><button type="button" class="tool-btn" data-action="mark-review">Marcar</button></div>' +
      '<div class="hint-panel" hidden><strong>Pista dirigida</strong><p>Busca el dato clínico que conecta con ' + esc(topic(item)) + '.</p></div>' +
      '<div class="unknown-action-wrap" ' + (answered ? 'hidden' : '') + '><button type="button" class="btn unknown-btn" data-action="dont-know">No sé / Ver respuesta</button></div>' +
      '<div class="answer-panel ' + (record && record.unknown ? 'unknown-panel' : '') + '" ' + (answered ? '' : 'hidden') + '>' + (answered ? feedbackHtml(item,record) : '') + '</div>' +
      '<div class="single-nav-actions"><button class="btn ghost" data-action="previous-question" ' + ((state.currentIndex || 0) <= 0 ? 'disabled' : '') + '>Anterior</button><button class="btn secondary" data-action="next-question" ' + (answered ? '' : 'disabled') + '>' + ((state.currentIndex || 0) >= total - 1 ? 'Balance' : 'Siguiente pregunta') + '</button></div>' +
      '<div class="module-actions slim"><a class="btn ghost" href="module.html?id=' + encodeURIComponent(item.moduleId || '') + '">Revisar curso</a><button class="btn ghost report-btn" data-action="open-feedback">Señalar error</button><button class="btn ghost" data-action="restart-session">Reiniciar</button></div>' +
      '</article>';
  }
  function addBadge(btn,text,cls){ var em = btn && btn.querySelector('em'); if(!em || em.querySelector('.option-state')) return; var b = document.createElement('i'); b.className = 'option-state ' + cls; b.textContent = text; em.appendChild(b); }
  function reveal(card,item,record,total,state){
    var box = card && card.querySelector('.options'); if(!box) return;
    var answer = Number(box.dataset.answer || 0), chosen = Number(record.chosen);
    box.dataset.locked = '1'; box.classList.add('answered');
    Array.prototype.slice.call(box.querySelectorAll('.option')).forEach(function(btn){ var idx = Number(btn.dataset.option || 0); btn.disabled = true; if(idx === answer){ btn.classList.add('correct'); addBadge(btn,'Correcta','ok'); } if(!record.unknown && idx === chosen && idx !== answer){ btn.classList.add('wrong'); addBadge(btn,'Elegida','ko'); } });
    var tools = card.querySelector('.preanswer-tools'); if(tools) tools.hidden = true;
    var unk = card.querySelector('.unknown-action-wrap'); if(unk) unk.hidden = true;
    var panel = card.querySelector('.answer-panel'); if(panel){ panel.hidden = false; panel.innerHTML = feedbackHtml(item,record); if(record.unknown) panel.classList.add('unknown-panel'); }
    var next = card.querySelector('[data-action="next-question"]'); if(next){ next.disabled = false; next.removeAttribute('disabled'); }
    updateDashboard(state,total);
  }
  function renderDone(list,state,total){ var answered = answeredCount(state), correct = batchCorrect(state), pct = answered ? Math.round((correct / answered) * 100) : 0; list.innerHTML = '<article class="practice-card completion-card"><p class="eyebrow">Fin de série</p><h2>' + correct + '/' + answered + ' respuestas correctas · ' + pct + '%</h2><p>Serie terminada. Puedes reiniciar o volver a los módulos.</p><div class="completion-score"><div class="progress-track success"><i style="width:' + pct + '%"></i></div></div><div class="module-actions"><button class="btn secondary" data-action="restart-session">Rehacer sesión</button><a class="btn ghost" href="matieres.html">Volver a materias</a></div></article>'; }

  function handleDetails(e){
    if(!isCasePage() || !e.target || !e.target.closest) return false;
    var summary = e.target.closest('#practiceList .answer-panel details summary');
    if(!summary) return false;
    var details = summary.closest('details'); if(!details) return false;
    details.open = !details.open;
    window.__MED_NYKUTO_CASE_DETAILS_TOGGLED__ = Date.now();
    swallow(e); return true;
  }
  function handleTools(e){
    if(!isCasePage() || !e.target || !e.target.closest) return false;
    var card = e.target.closest('.single-question-card'); if(!card) return false;
    var btn = e.target.closest('[data-action="show-hint"],[data-action="eliminate-two"],[data-action="mark-review"]'); if(!btn) return false;
    var action = btn.dataset.action;
    if(action === 'show-hint'){ var panel = card.querySelector('.hint-panel'); if(panel) panel.hidden = !panel.hidden; btn.classList.toggle('active', panel && !panel.hidden); swallow(e); return true; }
    if(action === 'eliminate-two'){ var box = card.querySelector('.options'); if(box && !box.dataset.locked){ var answer = Number(box.dataset.answer || 0); Array.prototype.slice.call(box.querySelectorAll('.option')).filter(function(x){ return Number(x.dataset.option) !== answer && !x.disabled; }).slice(0,2).forEach(function(x){ x.classList.add('eliminated'); x.disabled = true; }); btn.disabled = true; } swallow(e); return true; }
    if(action === 'mark-review'){ btn.textContent = 'Marcado'; btn.disabled = true; swallow(e); return true; }
    return false;
  }
  function handleAnswer(e){
    if(!isCasePage() || !e.target || !e.target.closest) return false;
    var card = e.target.closest('.single-question-card'); if(!card || !card.id) return false;
    var option = e.target.closest('.options .option'), dontKnow = e.target.closest('[data-action="dont-know"]');
    if(!option && !dontKnow) return false;
    var box = card.querySelector('.options'); if(!box || box.dataset.locked) return false;
    var loaded = stateFor(card.id), state = loaded.state, items = currentItems(loaded.info,state), total = items.length || 20, item = items.find(function(x){ return x.id === card.id; }) || loaded.info.items.find(function(x){ return x.id === card.id; });
    if(!item) return false;
    var chosen = dontKnow ? -1 : Number(option.dataset.option || 0), correct = chosen === Number(item.answerIndex || 0);
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
    reveal(card,item,state.currentAnswers[card.id],total,state);
    window.__MED_NYKUTO_CASE_INSTANT_ANSWER__ = Date.now();
    swallow(e); return true;
  }
  function handleNext(e){
    if(!isCasePage() || !e.target || !e.target.closest) return false;
    var btn = e.target.closest('#practiceList [data-action="next-question"]'); if(!btn) return false;
    var now = Date.now(); if(now < nextLock){ swallow(e); return true; } nextLock = now + 650;
    var card = btn.closest('.single-question-card'), list = document.querySelector('#practiceList'); if(!card || !list || !card.id) return false;
    var loaded = stateFor(card.id), state = loaded.state, items = currentItems(loaded.info,state), total = items.length; if(!total) return false;
    var idx = (state.currentBatch || []).indexOf(card.id); if(idx < 0) idx = state.currentIndex || 0;
    if(idx >= total - 1){ state.batchFinished = true; saveState(loaded.key,state); renderDone(list,state,total); swallow(e); return true; }
    state.currentIndex = idx + 1;
    saveState(loaded.key,state);
    var nextId = state.currentBatch[state.currentIndex], nextItem = items.find(function(x){ return x.id === nextId; }); if(!nextItem) return false;
    card.outerHTML = renderCard(nextItem,state,total);
    updateDashboard(state,total);
    window.__MED_NYKUTO_CASE_INSTANT_NEXT__ = Date.now();
    swallow(e); return true;
  }
  function handlePrevious(e){
    if(!isCasePage() || !e.target || !e.target.closest) return false;
    var btn = e.target.closest('#practiceList [data-action="previous-question"]'); if(!btn) return false;
    var card = btn.closest('.single-question-card'); if(!card || !card.id) return false;
    var loaded = stateFor(card.id), state = loaded.state, items = currentItems(loaded.info,state), total = items.length; if(!total) return false;
    var idx = (state.currentBatch || []).indexOf(card.id); if(idx < 0) idx = state.currentIndex || 0;
    state.currentIndex = Math.max(0, idx - 1); saveState(loaded.key,state);
    var prevItem = items.find(function(x){ return x.id === state.currentBatch[state.currentIndex]; }); if(!prevItem) return false;
    card.outerHTML = renderCard(prevItem,state,total); updateDashboard(state,total); swallow(e); return true;
  }

  function interactive(t){return !!(t&&t.closest&&t.closest('a,button,input,select,textarea,label,summary,[role="button"],[data-action],.option,.btn,.practice-force-picker-shell,#practiceForcePickerModal,.ppc-card'))}
  function inert(t){return isPractice()&&t&&t.closest&&!interactive(t)&&!!t.closest('.single-question-card,.question-prompt,.structured-prompt,.practice-list,.case-stem')}
  function swallow(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
  function onClick(e){ if(handleDetails(e)) return; if(handleTools(e)) return; if(handleAnswer(e)) return; if(handleNext(e)) return; if(handlePrevious(e)) return; if(!inert(e.target))return; if(Date.now()<suppress||e.type==='click')swallow(e); }
  document.addEventListener('touchstart',function(e){if(!inert(e.target))return;var t=e.changedTouches&&e.changedTouches[0];if(!t)return;sx=t.clientX;sy=t.clientY;moved=false},{capture:true,passive:true});
  document.addEventListener('touchmove',function(e){if(!inert(e.target))return;var t=e.changedTouches&&e.changedTouches[0];if(!t)return;if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8)moved=true},{capture:true,passive:true});
  document.addEventListener('touchend',function(e){if(!inert(e.target))return;if(moved)return;suppress=Date.now()+500;swallow(e)},{capture:true,passive:false});
  document.addEventListener('click',onClick,true);
  function style(){
    if(document.getElementById('practiceTapGuardStyle'))return;
    var st=document.createElement('style');st.id='practiceTapGuardStyle';st.textContent=[
      'body.practice-page .single-question-card,body.practice-page .question-prompt,body.practice-page .structured-prompt,body.practice-page .case-stem{touch-action:pan-y}',
      'body.cas-cliniques-page #practiceList,body.cas-cliniques-page #practiceList *{animation:none!important;transition:none!important}',
      'body.cas-cliniques-page .case-progress-block{margin:0 0 16px;padding:14px 16px;border-radius:20px;border:1px solid rgba(245,211,124,.28);background:linear-gradient(180deg,rgba(245,211,124,.09),rgba(11,22,43,.78))}',
      'body.cas-cliniques-page .case-progress-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;color:#ffe7a0;font-weight:900}',
      'body.cas-cliniques-page .case-progress-track{height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}',
      'body.cas-cliniques-page .case-progress-track i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#b89442,#ffe7a0)}',
      'body.cas-cliniques-page .answer-panel{margin-top:18px!important;padding:0!important;border:0!important;background:transparent!important}',
      'body.cas-cliniques-page .case-feedback-card{padding:18px;border-radius:24px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(180deg,rgba(12,24,48,.96),rgba(8,15,31,.96))}',
      'body.cas-cliniques-page .case-feedback-card.is-correct{border-color:rgba(77,208,139,.62);background:linear-gradient(180deg,rgba(17,78,58,.58),rgba(8,24,37,.96))}',
      'body.cas-cliniques-page .case-feedback-card.is-wrong{border-color:rgba(255,128,128,.56);background:linear-gradient(180deg,rgba(84,35,35,.52),rgba(23,20,33,.96))}',
      'body.cas-cliniques-page .case-feedback-card.is-unknown{border-color:rgba(245,211,124,.42)}',
      'body.cas-cliniques-page .case-feedback-pill{display:inline-flex;width:max-content;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.1);color:#fff;font-weight:900;text-transform:uppercase;font-size:.78rem}',
      'body.cas-cliniques-page .case-feedback-top{display:grid;gap:8px;margin-bottom:14px;color:#e8eefc}',
      'body.cas-cliniques-page .case-feedback-short,body.cas-cliniques-page .case-feedback-details,body.cas-cliniques-page .case-feedback-takeaway{padding:14px;border-radius:18px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);margin-top:12px}',
      'body.cas-cliniques-page .case-feedback-short strong,body.cas-cliniques-page .case-feedback-reasons h4,body.cas-cliniques-page .case-feedback-takeaway h4{display:block;margin:0 0 8px;color:#ffe7a0;font-size:.98rem}',
      'body.cas-cliniques-page .case-feedback-short p,body.cas-cliniques-page .case-feedback-details p,body.cas-cliniques-page .case-feedback-takeaway p{margin:0;color:#f4f7ff;line-height:1.58}',
      'body.cas-cliniques-page .case-feedback-details summary{cursor:pointer;color:#ffe7a0;font-weight:900;list-style:none}',
      'body.cas-cliniques-page .case-feedback-details summary::-webkit-details-marker{display:none}',
      'body.cas-cliniques-page .case-feedback-details summary:after{content:"▾";float:right;opacity:.7}',
      'body.cas-cliniques-page .case-feedback-reasons{display:grid;gap:10px;margin-top:14px}',
      'body.cas-cliniques-page .case-reason-item{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start;padding:12px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}',
      'body.cas-cliniques-page .case-reason-item.is-answer{background:rgba(34,197,94,.10);border-color:rgba(74,222,128,.28)}',
      'body.cas-cliniques-page .case-reason-item>span{width:34px;height:34px;border-radius:999px;display:grid;place-items:center;background:rgba(245,211,124,.14);color:#ffe7a0;font-weight:900}',
      'body.cas-cliniques-page .case-reason-item.is-answer>span{background:#22a765;color:#fff}',
      'body.cas-cliniques-page .case-reason-item p{margin:4px 0 0;color:#dfe6f6;line-height:1.48}'
    ].join('\n');document.head.appendChild(st)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',style);else style();
})();
