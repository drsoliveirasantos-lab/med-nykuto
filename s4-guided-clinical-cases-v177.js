/* S4 v177 — guided respiratory cases isolated from ordinary practice and ranking. */
(function () {
  'use strict';

  var STORAGE_KEY = 'med-nykuto-s4-guided-cases-v177';
  var GUIDED_SCOPE = 'fisiologia-respiratorio-p1';
  var LESSON_IDS = ['fisiologia-2026-08-10', 'fisiologia-2026-08-13'];
  var runtimeVersion = 'v177';
  var dialog = null;
  var scrollHost = null;
  var activeLauncher = null;
  var lockedScrollY = 0;
  var contextOpen = true;
  var autoOpenHandled = false;
  var launcherObserver = null;
  var nextTransitioning = false;
  var interactionLocked = false;
  var suppressLockedClickUntil = 0;
  var answerActivationAt = 0;
  var lastAdvanceTap = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function params() {
    return new URLSearchParams(window.location.search || '');
  }

  function currentLessonId() {
    var hash = clean(window.location.hash).replace(/^#/, '');
    return LESSON_IDS.indexOf(hash) >= 0 ? hash : '';
  }

  function safeUrl(value) {
    var raw = clean(value);
    if (!raw) return '';
    try {
      var parsed = new URL(raw, window.location.href);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
      return parsed.href;
    } catch (error) {
      return '';
    }
  }

  function rawData() {
    var value = window.MedNykutoS4GuidedCaseData;
    if (value && value.default && !value.cases) value = value.default;
    return value && typeof value === 'object' ? value : {};
  }

  function validQuestion(question) {
    return Boolean(
      question &&
      clean(question.id) &&
      clean(question.prompt) &&
      Array.isArray(question.options) &&
      (question.options.length === 2 || question.options.length === 4) &&
      Number.isInteger(Number(question.answerIndex)) &&
      Number(question.answerIndex) >= 0 &&
      Number(question.answerIndex) < question.options.length
    );
  }

  function cases() {
    var list = rawData().cases;
    if (!Array.isArray(list)) return [];
    return list.filter(function (item) {
      return item && clean(item.id) && Array.isArray(item.questions) && item.questions.length === 4 && item.questions.every(validQuestion);
    });
  }

  function findCase(caseId) {
    return cases().find(function (item) { return String(item.id) === String(caseId); }) || null;
  }

  function dataVersion() {
    return clean(rawData().version) || runtimeVersion;
  }

  function emptyState() {
    return { dataVersion: dataVersion(), selectedCaseId: '', cases: {} };
  }

  function loadState() {
    var state;
    try {
      state = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (error) {
      state = null;
    }
    if (!state || typeof state !== 'object' || state.dataVersion !== dataVersion()) return emptyState();
    if (!state.cases || typeof state.cases !== 'object') state.cases = {};
    if (typeof state.selectedCaseId !== 'string') state.selectedCaseId = '';
    return state;
  }

  function saveState(state) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function stateForCase(state, item) {
    var saved = state.cases[item.id];
    if (!saved || typeof saved !== 'object') saved = { current: 0, completed: false, answers: {} };
    if (!saved.answers || typeof saved.answers !== 'object') saved.answers = {};
    item.questions.forEach(function (question) {
      var answer = saved.answers[question.id];
      if (!answer || !Number.isInteger(Number(answer.selected)) || Number(answer.selected) < 0 || Number(answer.selected) >= question.options.length) {
        delete saved.answers[question.id];
        return;
      }
      answer.selected = Number(answer.selected);
      answer.correct = answer.selected === Number(question.answerIndex);
    });
    var firstIncomplete = item.questions.findIndex(function (question) { return !saved.answers[question.id]; });
    var maximum = firstIncomplete < 0 ? item.questions.length - 1 : firstIncomplete;
    saved.current = Math.max(0, Math.min(maximum, Number(saved.current) || 0));
    saved.completed = Boolean(saved.completed && firstIncomplete < 0);
    state.cases[item.id] = saved;
    return saved;
  }

  function firstIncompleteCase(state, list) {
    return list.find(function (item) {
      var saved = stateForCase(state, item);
      return !saved.completed || item.questions.some(function (question) { return !saved.answers[question.id]; });
    }) || null;
  }

  function requestedCaseId() {
    return clean(params().get('guidedCase'));
  }

  function chooseInitialCase(state, list) {
    var requested = findCase(requestedCaseId());
    if (requested) return requested;
    var selected = findCase(state.selectedCaseId);
    if (selected) return selected;
    var incomplete = firstIncompleteCase(state, list);
    if (incomplete) return incomplete;
    return list[0] || null;
  }

  function correctionFor(question) {
    var nested = question && question.correction && typeof question.correction === 'object' ? question.correction : {};
    return {
      answer: clean(nested.answer || question.correctAnswer || question.answer),
      mechanism: clean(nested.mechanism || question.mechanism),
      application: clean(nested.application || question.application),
      conclusion: clean(nested.conclusion || question.conclusion)
    };
  }

  function evidenceFor(question) {
    var data = rawData();
    var evidence = Array.isArray(data.evidence) ? data.evidence : [];
    var sources = Array.isArray(data.sources) ? data.sources : [];
    var evidenceIds = Array.isArray(question.evidenceIds) ? question.evidenceIds.map(String) : [];
    return evidenceIds.map(function (id) {
      var entry = evidence.find(function (candidate) { return String(candidate.id) === id; });
      if (!entry) return null;
      var source = sources.find(function (candidate) { return String(candidate.id) === String(entry.sourceId); }) || null;
      return { entry: entry, source: source };
    }).filter(Boolean);
  }

  function levelLabel(value) {
    var raw = clean(value).toLowerCase();
    var labels = {
      reconocimiento: 'Reconocimiento',
      interpretacion: 'Interpretación',
      'interpretación': 'Interpretación',
      mecanismo: 'Mecanismo',
      integracion: 'Integración',
      'integración': 'Integración'
    };
    return labels[raw] || (raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Razonamiento clínico');
  }

  function kindLabel(value) {
    return clean(value) === 'ejercicio-fijacion' ? 'Ejercicio de fijación' : 'Caso clínico guiado';
  }

  function dataRows(item) {
    var rows = Array.isArray(item.data) ? item.data : [];
    if (!rows.length) return '<p class="s4-guided-empty-copy">No hay datos complementarios para este caso.</p>';
    return '<dl class="s4-guided-data-list">' + rows.map(function (row) {
      var unit = clean(row && row.unit);
      return '<div><dt>' + esc(row && row.label) + '</dt><dd><span>' + esc(row && row.value) + '</span>' + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</dd></div>';
    }).join('') + '</dl>';
  }

  function priorConclusions(item, saved, endIndex) {
    var conclusions = item.questions.slice(0, endIndex).map(function (question, index) {
      if (!saved.answers[question.id]) return '';
      var conclusion = correctionFor(question).conclusion;
      if (!conclusion) return '';
      return '<li><span>Paso ' + (index + 1) + '</span><p>' + esc(conclusion) + '</p></li>';
    }).filter(Boolean);
    if (!conclusions.length) return '<p class="s4-guided-empty-copy">Las conclusiones aparecen aquí después de cada paso.</p>';
    return '<ol class="s4-guided-conclusion-list">' + conclusions.join('') + '</ol>';
  }

  function contextHtml(item, saved, endIndex) {
    return '<details class="s4-guided-context" data-guided-case-context ' + (contextOpen ? 'open' : '') + '>' +
      '<summary data-guided-context-toggle><span><small>Contexto siempre disponible</small><strong>Viñeta, datos y conclusiones previas</strong></span><b aria-hidden="true">⌄</b></summary>' +
      '<div class="s4-guided-context-body">' +
        '<section><h3>Viñeta clínica</h3><p>' + esc(item.vignette) + '</p></section>' +
        '<section data-guided-case-data><h3>Datos del caso</h3>' + dataRows(item) + '</section>' +
        '<section data-guided-prior-conclusions><h3>Conclusiones desbloqueadas</h3>' + priorConclusions(item, saved, endIndex) + '</section>' +
      '</div>' +
    '</details>';
  }

  function pickerHtml(list, selected) {
    return '<section class="s4-guided-active-case" data-guided-active-case>' +
      '<label for="s4GuidedCasePicker"><span>Caso activo</span><select id="s4GuidedCasePicker" data-guided-case-picker>' + list.map(function (item, index) {
        var label = (index + 1) + '. ' + (clean(item.title) || 'Caso respiratorio');
        return '<option value="' + esc(item.id) + '" ' + (item.id === selected.id ? 'selected' : '') + '>' + esc(label) + '</option>';
      }).join('') + '</select></label>' +
      '<div><span>' + esc(kindLabel(selected.kind)) + '</span><strong>' + esc(selected.title || 'Caso respiratorio') + '</strong></div>' +
    '</section>';
  }

  function evidenceHtml(question) {
    var resolved = evidenceFor(question);
    var flatEvidence = clean(question.sourceEvidence);
    var flatAnchor = clean(question.sourceAnchor);
    if (!resolved.length && !flatEvidence && !flatAnchor) {
      return '<section class="s4-guided-evidence" data-guided-source-evidence><h4>Base verificada</h4><p>Este paso pertenece al paquete respiratorio revisado de la clase.</p></section>';
    }
    var items = resolved.map(function (resolvedItem) {
      var entry = resolvedItem.entry || {};
      var source = resolvedItem.source || {};
      var url = safeUrl(source.url);
      var sourceTitle = clean(source.title) || 'Fuente del curso';
      var sourceMarkup = url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(sourceTitle) + ' ↗</a>' : '<strong>' + esc(sourceTitle) + '</strong>';
      return '<li><p>' + esc(entry.text) + '</p><div>' + sourceMarkup + (clean(entry.locator) ? '<small>' + esc(entry.locator) + '</small>' : '') + '</div></li>';
    });
    if (flatEvidence) {
      var flatUrl = safeUrl(flatAnchor);
      items.push('<li><p>' + esc(flatEvidence) + '</p>' + (flatAnchor ? '<div>' + (flatUrl ? '<a href="' + esc(flatUrl) + '" target="_blank" rel="noopener noreferrer">Abrir fuente ↗</a>' : '<small>' + esc(flatAnchor) + '</small>') + '</div>' : '') + '</li>');
    }
    return '<section class="s4-guided-evidence" data-guided-source-evidence><h4>Base verificada</h4><ul>' + items.join('') + '</ul></section>';
  }

  function distractorsHtml(question, selected) {
    var reasons = Array.isArray(question.whyWrong) ? question.whyWrong : [];
    var wrong = question.options.map(function (option, index) {
      if (index === Number(question.answerIndex)) return '';
      var reason = clean(reasons[index]) || 'Esta opción no integra correctamente los datos y el mecanismo del caso.';
      return '<li class="' + (index === selected ? 'is-selected' : '') + '"><span>' + String.fromCharCode(65 + index) + '</span><div><strong>' + esc(option) + '</strong><p>' + esc(reason) + '</p></div></li>';
    }).filter(Boolean);
    return '<details class="s4-guided-distractors" data-guided-distractors><summary>Revisar todos los distractores</summary><ul>' + wrong.join('') + '</ul></details>';
  }

  function feedbackHtml(question, answer) {
    var correction = correctionFor(question);
    var correctIndex = Number(question.answerIndex);
    var correctText = clean(correction.answer) || clean(question.options[correctIndex]);
    var selectedReason = !answer.correct ? clean((question.whyWrong || [])[answer.selected]) : '';
    return '<section class="s4-guided-feedback ' + (answer.correct ? 'is-correct' : 'is-incorrect') + '" data-guided-feedback tabindex="-1" aria-labelledby="s4GuidedFeedbackTitle">' +
      '<header><span>' + (answer.correct ? 'Respuesta correcta' : 'Respuesta a revisar') + '</span><h3 id="s4GuidedFeedbackTitle">Corrección razonada</h3></header>' +
      '<ol class="s4-guided-correction-chain">' +
        '<li><b>1</b><div><h4>Respuesta</h4><p>' + esc(correctText) + '</p></div></li>' +
        '<li data-guided-mechanism><b>2</b><div><h4>Mecanismo</h4><p>' + esc(correction.mechanism || 'Relaciona el dato dominante con el mecanismo fisiológico respiratorio antes de decidir.') + '</p></div></li>' +
        '<li data-guided-application><b>3</b><div><h4>Aplicación</h4><p>' + esc(correction.application || 'Aplica el mecanismo al dato clínico y verifica que todas las variables sean coherentes.') + '</p>' + (correction.conclusion ? '<aside><strong>Conclusión desbloqueada</strong><span>' + esc(correction.conclusion) + '</span></aside>' : '') + '</div></li>' +
      '</ol>' +
      (selectedReason ? '<section class="s4-guided-selected-reason"><h4>Por qué la opción elegida no encaja</h4><p>' + esc(selectedReason) + '</p></section>' : '') +
      distractorsHtml(question, answer.selected) +
      evidenceHtml(question) +
    '</section>';
  }

  function optionHtml(question, answer, option, index) {
    var answered = Boolean(answer);
    var classes = ['s4-guided-option'];
    if (answered && index === answer.selected) classes.push('is-selected');
    if (answered && index === Number(question.answerIndex)) classes.push('is-correct');
    if (answered && index === answer.selected && !answer.correct) classes.push('is-incorrect');
    var status = '';
    if (answered && index === Number(question.answerIndex)) status = '<small>Correcta</small>';
    else if (answered && index === answer.selected) status = '<small>Elegida</small>';
    return '<button type="button" class="' + classes.join(' ') + '" data-guided-option-index="' + index + '" ' + (answered || interactionLocked ? 'disabled' : '') + '><span>' + String.fromCharCode(65 + index) + '</span><strong>' + esc(option) + '</strong>' + status + '</button>';
  }

  function questionHtml(item, saved) {
    var index = saved.current;
    var question = item.questions[index];
    var answer = saved.answers[question.id] || null;
    var percent = Math.round(((index + 1) / item.questions.length) * 100);
    return contextHtml(item, saved, index) +
      '<article class="s4-guided-question" data-guided-question>' +
        '<div class="s4-guided-progress"><div><span data-guided-question-index>Paso ' + (index + 1) + ' de ' + item.questions.length + '</span><strong data-guided-reasoning-level>' + esc(levelLabel(question.level || question.reasoningLevel)) + '</strong></div><div role="progressbar" aria-label="Progreso del caso" aria-valuemin="1" aria-valuemax="' + item.questions.length + '" aria-valuenow="' + (index + 1) + '"><i style="width:' + percent + '%"></i></div></div>' +
        '<header><span>Decide antes de abrir la corrección</span><h2 id="s4GuidedQuestionTitle" tabindex="-1">' + esc(question.prompt) + '</h2>' + (clean(question.groundingNote) ? '<p class="s4-guided-grounding-note" data-guided-grounding-note>' + esc(question.groundingNote) + '</p>' : '') + '</header>' +
        '<div class="s4-guided-options' + (interactionLocked ? ' is-transition-locked' : '') + '" data-guided-options role="group" aria-labelledby="s4GuidedQuestionTitle">' + question.options.map(function (option, optionIndex) { return optionHtml(question, answer, option, optionIndex); }).join('') + '</div>' +
        (answer ? feedbackHtml(question, answer) : '') +
        '<nav class="s4-guided-step-actions" aria-label="Navegación entre pasos">' +
          (index > 0 && saved.answers[item.questions[index - 1].id] ? '<button type="button" class="s4-guided-secondary" data-guided-previous>← Paso anterior</button>' : '') +
          (answer ? '<button type="button" class="s4-guided-primary" data-guided-next>' + (index === item.questions.length - 1 ? 'Ver balance' : 'Continuar al paso ' + (index + 2)) + '</button>' : '') +
        '</nav>' +
      '</article>';
  }

  function balanceHtml(item, saved) {
    var correct = item.questions.filter(function (question) { return saved.answers[question.id] && saved.answers[question.id].correct; }).length;
    var rows = item.questions.map(function (question, index) {
      var answer = saved.answers[question.id];
      var conclusion = correctionFor(question).conclusion;
      return '<li><span>' + (answer && answer.correct ? '✓' : '↻') + '</span><div><strong>Paso ' + (index + 1) + ' · ' + esc(levelLabel(question.level || question.reasoningLevel)) + '</strong>' + (conclusion ? '<p>' + esc(conclusion) + '</p>' : '') + '</div></li>';
    }).join('');
    return contextHtml(item, saved, item.questions.length) +
      '<section class="s4-guided-balance" data-guided-balance tabindex="-1" aria-labelledby="s4GuidedBalanceTitle">' +
        '<span>CASO COMPLETADO</span><h2 id="s4GuidedBalanceTitle">Balance de razonamiento</h2>' +
        '<div class="s4-guided-score"><strong>' + correct + '/4</strong><p>respuestas correctas</p></div>' +
        '<p>Lo importante es poder reconstruir la secuencia clínica completa, no solo recordar una letra.</p>' +
        '<ol>' + rows + '</ol>' +
        '<div class="s4-guided-balance-actions"><button type="button" class="s4-guided-secondary" data-guided-review-last>Revisar el último paso</button><button type="button" class="s4-guided-primary" data-guided-restart>Rehacer este caso</button></div>' +
      '</section>';
  }

  function missingHtml() {
    return '<section class="s4-guided-missing" role="status"><span>Casos guiados</span><h2>Contenido no disponible</h2><p>El paquete respiratorio no se cargó o no superó su validación. Recarga la página; el entrenamiento clásico sigue intacto.</p></section>';
  }

  function updateUrl(open, caseId, lessonId) {
    var url = new URL(window.location.href);
    if (open) {
      url.searchParams.set('caseMode', 'guided');
      url.searchParams.set('guidedScope', GUIDED_SCOPE);
      if (caseId) url.searchParams.set('guidedCase', caseId);
      else url.searchParams.delete('guidedCase');
      if (LESSON_IDS.indexOf(lessonId) >= 0) url.hash = lessonId;
    } else {
      url.searchParams.delete('caseMode');
      url.searchParams.delete('guidedScope');
      url.searchParams.delete('guidedCase');
    }
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  }

  function bindRenderedContext() {
    var context = dialog && dialog.querySelector('[data-guided-case-context]');
    if (!context) return;
    context.addEventListener('toggle', function () { contextOpen = context.open; });
  }

  function render(options) {
    if (!dialog || !scrollHost) return;
    var list = cases();
    var state = loadState();
    var selected = findCase(state.selectedCaseId) || chooseInitialCase(state, list);
    if (!selected) {
      scrollHost.innerHTML = missingHtml();
      return;
    }
    state.selectedCaseId = selected.id;
    var saved = stateForCase(state, selected);
    saveState(state);
    scrollHost.innerHTML = pickerHtml(list, selected) + (saved.completed ? balanceHtml(selected, saved) : questionHtml(selected, saved));
    bindRenderedContext();
    if (options && options.resetScroll) scrollHost.scrollTop = 0;
    if (options && options.focus === 'question') {
      window.requestAnimationFrame(function () {
        var heading = dialog.querySelector('#s4GuidedQuestionTitle');
        if (heading) heading.focus();
      });
    }
    if (options && options.focus === 'feedback') {
      window.requestAnimationFrame(function () {
        var feedback = dialog.querySelector('[data-guided-feedback]');
        if (feedback) feedback.focus();
      });
    }
    if (options && options.focus === 'balance') {
      window.requestAnimationFrame(function () {
        var balance = dialog.querySelector('[data-guided-balance]');
        if (balance) balance.focus();
      });
    }
  }

  function isRepeatedAdvanceTap(event) {
    if (!lastAdvanceTap) return false;
    var age = Date.now() - lastAdvanceTap.at;
    if (age < 0 || age > 1500) {
      lastAdvanceTap = null;
      return false;
    }
    var x = Number(event.clientX);
    var y = Number(event.clientY);
    if (!isFinite(x) || !isFinite(y)) return false;
    var dx = x - lastAdvanceTap.x;
    var dy = y - lastAdvanceTap.y;
    if ((dx * dx) + (dy * dy) > 576) return false;
    lastAdvanceTap = null;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    return true;
  }

  function swallowLockedTouch(event) {
    if (!interactionLocked) return;
    suppressLockedClickUntil = Date.now() + 650;
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function createDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 's4GuidedCasesDialogV177';
    dialog.className = 's4-guided-dialog';
    dialog.setAttribute('data-guided-cases-dialog', '');
    dialog.setAttribute('aria-labelledby', 's4GuidedCasesTitle');
    dialog.setAttribute('aria-modal', 'true');
    dialog.innerHTML = '<div class="s4-guided-dialog-shell"><header class="s4-guided-dialog-header"><div><span>FISIOLOGÍA RESPIRATORIA · P1</span><strong id="s4GuidedCasesTitle">Casos clínicos guiados</strong><small>Un caso · cuatro decisiones encadenadas</small></div><button type="button" data-guided-cases-close aria-label="Cerrar casos guiados"><span aria-hidden="true">×</span><b>Cerrar</b></button></header><div class="s4-guided-dialog-scroll" data-guided-dialog-scroll></div><p class="s4-guided-live" aria-live="polite" aria-atomic="true"></p></div>';
    document.body.appendChild(dialog);
    scrollHost = dialog.querySelector('.s4-guided-dialog-scroll');

    dialog.addEventListener('touchend', swallowLockedTouch, { capture: true, passive: false });
    dialog.addEventListener('pointerup', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') swallowLockedTouch(event);
    }, { capture: true });

    dialog.addEventListener('click', function (event) {
      if (Date.now() < suppressLockedClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        return;
      }
      var close = event.target.closest('[data-guided-cases-close]');
      if (close) { closeDialog(); return; }

      var picker = event.target.closest('[data-guided-case-picker]');
      if (picker) return;

      var option = event.target.closest('[data-guided-option-index]');
      if (option && !option.disabled) {
        if (isRepeatedAdvanceTap(event)) return;
        answerCurrent(Number(option.getAttribute('data-guided-option-index')));
        return;
      }

      var next = event.target.closest('[data-guided-next]');
      if (next) {
        lastAdvanceTap = { x: Number(event.clientX), y: Number(event.clientY), at: Date.now() };
        nextStep();
        return;
      }
      if (event.target.closest('[data-guided-previous]')) { previousStep(); return; }
      if (event.target.closest('[data-guided-review-last]')) { reviewLastStep(); return; }
      if (event.target.closest('[data-guided-restart]')) { restartCase(); }
    });

    dialog.addEventListener('change', function (event) {
      var picker = event.target.closest('[data-guided-case-picker]');
      if (!picker) return;
      selectCase(picker.value);
    });

    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener('close', finishClose);
    return dialog;
  }

  function live(message) {
    var region = dialog && dialog.querySelector('.s4-guided-live');
    if (!region) return;
    region.textContent = '';
    window.requestAnimationFrame(function () { region.textContent = message; });
  }

  function answerCurrent(selectedIndex) {
    if (interactionLocked || Date.now() < answerActivationAt) return;
    var state = loadState();
    var item = findCase(state.selectedCaseId);
    if (!item) return;
    var saved = stateForCase(state, item);
    var question = item.questions[saved.current];
    if (!question || saved.answers[question.id] || selectedIndex < 0 || selectedIndex >= question.options.length) return;
    saved.answers[question.id] = {
      selected: selectedIndex,
      correct: selectedIndex === Number(question.answerIndex),
      answeredAt: Date.now()
    };
    saved.completed = false;
    saveState(state);
    render({ focus: 'feedback' });
    live(saved.answers[question.id].correct ? 'Respuesta correcta. Corrección disponible.' : 'Respuesta registrada. Revisa el mecanismo antes de continuar.');
  }

  function nextStep() {
    if (nextTransitioning || interactionLocked) return;
    nextTransitioning = true;
    interactionLocked = true;
    answerActivationAt = Date.now() + 800;
    window.setTimeout(function () {
      nextTransitioning = false;
      interactionLocked = false;
      var currentState = loadState();
      var currentItem = findCase(currentState.selectedCaseId);
      if (!currentItem || !dialog) return;
      var currentSaved = stateForCase(currentState, currentItem);
      var currentQuestion = currentItem.questions[currentSaved.current];
      if (currentQuestion && !currentSaved.answers[currentQuestion.id]) {
        var optionGroup = dialog.querySelector('[data-guided-options]');
        if (optionGroup) optionGroup.classList.remove('is-transition-locked');
        dialog.querySelectorAll('[data-guided-option-index]:disabled').forEach(function (button) {
          button.disabled = false;
        });
      }
    }, 450);
    var state = loadState();
    var item = findCase(state.selectedCaseId);
    if (!item) return;
    var saved = stateForCase(state, item);
    var question = item.questions[saved.current];
    if (!question || !saved.answers[question.id]) return;
    if (saved.current >= item.questions.length - 1) {
      saved.completed = item.questions.every(function (candidate) { return Boolean(saved.answers[candidate.id]); });
      saveState(state);
      render({ resetScroll: true, focus: 'balance' });
      live('Caso completado. Balance disponible.');
      return;
    }
    saved.current += 1;
    saveState(state);
    render({ resetScroll: true, focus: 'question' });
    live('Paso ' + (saved.current + 1) + ' de ' + item.questions.length + '.');
  }

  function previousStep() {
    var state = loadState();
    var item = findCase(state.selectedCaseId);
    if (!item) return;
    var saved = stateForCase(state, item);
    if (saved.current <= 0 || !saved.answers[item.questions[saved.current - 1].id]) return;
    saved.current -= 1;
    saved.completed = false;
    saveState(state);
    render({ resetScroll: true, focus: 'question' });
    live('Revisión del paso ' + (saved.current + 1) + '.');
  }

  function reviewLastStep() {
    var state = loadState();
    var item = findCase(state.selectedCaseId);
    if (!item) return;
    var saved = stateForCase(state, item);
    saved.current = item.questions.length - 1;
    saved.completed = false;
    saveState(state);
    render({ resetScroll: true, focus: 'question' });
  }

  function restartCase() {
    var state = loadState();
    var item = findCase(state.selectedCaseId);
    if (!item) return;
    state.cases[item.id] = { current: 0, completed: false, answers: {} };
    saveState(state);
    render({ resetScroll: true, focus: 'question' });
    live('Caso reiniciado. Paso 1 de 4.');
  }

  function selectCase(caseId) {
    var item = findCase(caseId);
    if (!item) return;
    var state = loadState();
    state.selectedCaseId = item.id;
    var saved = stateForCase(state, item);
    var firstIncomplete = item.questions.findIndex(function (question) { return !saved.answers[question.id]; });
    if (firstIncomplete >= 0) {
      saved.current = firstIncomplete;
      saved.completed = false;
    }
    saveState(state);
    updateUrl(true, item.id, currentLessonId() || 'fisiologia-2026-08-13');
    render({ resetScroll: true, focus: saved.completed ? 'balance' : 'question' });
    live('Caso seleccionado: ' + (item.title || 'caso respiratorio') + '.');
  }

  function lockPage() {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('s4-guided-modal-open');
    document.body.classList.add('s4-guided-modal-open');
    document.body.style.setProperty('--s4-guided-lock-top', '-' + lockedScrollY + 'px');
  }

  function unlockPage() {
    document.documentElement.classList.remove('s4-guided-modal-open');
    document.body.classList.remove('s4-guided-modal-open');
    document.body.style.removeProperty('--s4-guided-lock-top');
    window.scrollTo(0, lockedScrollY);
  }

  function openDialog(launcher, options) {
    createDialog();
    if (dialog.open || dialog.hasAttribute('open')) return;
    activeLauncher = launcher || null;
    contextOpen = true;
    var state = loadState();
    var list = cases();
    var selected = options && options.caseId ? findCase(options.caseId) : chooseInitialCase(state, list);
    if (selected) {
      state.selectedCaseId = selected.id;
      stateForCase(state, selected);
      saveState(state);
    }
    var lessonId = options && options.lessonId;
    if (LESSON_IDS.indexOf(lessonId) < 0) lessonId = currentLessonId() || (launcher && launcher.closest('[data-practice-root]') && launcher.closest('[data-practice-root]').dataset.practiceRoot) || 'fisiologia-2026-08-13';
    updateUrl(true, selected && selected.id, lessonId);
    render({ resetScroll: true });
    lockPage();
    try {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } catch (error) {
      dialog.setAttribute('open', '');
    }
    window.requestAnimationFrame(function () {
      var close = dialog.querySelector('[data-guided-cases-close]');
      if (close) close.focus();
    });
  }

  function finishClose() {
    if (!document.body.classList.contains('s4-guided-modal-open')) return;
    if (dialog && dialog.hasAttribute('open') && !dialog.open) dialog.removeAttribute('open');
    unlockPage();
    updateUrl(false);
    var restore = activeLauncher;
    activeLauncher = null;
    window.requestAnimationFrame(function () { if (restore && document.contains(restore)) restore.focus(); });
  }

  function closeDialog() {
    if (!dialog || (!dialog.open && !dialog.hasAttribute('open'))) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      finishClose();
    }
  }

  function launcherForLesson(lessonId) {
    var root = document.querySelector('[data-practice-root="' + lessonId + '"]');
    return root && root.querySelector('[data-guided-cases-open]');
  }

  function installLaunchers() {
    LESSON_IDS.forEach(function (lessonId) {
      document.querySelectorAll('[data-practice-root="' + lessonId + '"]').forEach(function (root) {
        if (root.querySelector('[data-guided-cases-open]')) return;
        var overview = root.querySelector('.practice-overview');
        if (!overview) return;
        var host = overview.querySelector('.practice-overview-footer') || overview;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 's4-guided-launcher';
        button.setAttribute('data-guided-cases-open', '');
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 's4GuidedCasesDialogV177');
        button.innerHTML = '<span aria-hidden="true">🫁</span><strong>Casos guiados</strong><small>4 decisiones encadenadas</small>';
        button.addEventListener('click', function () { openDialog(button, { lessonId: lessonId }); });
        host.appendChild(button);
      });
    });
  }

  function shouldAutoOpen() {
    var query = params();
    return query.get('caseMode') === 'guided' && query.get('guidedScope') === GUIDED_SCOPE && LESSON_IDS.indexOf(currentLessonId()) >= 0;
  }

  function maybeAutoOpen() {
    if (autoOpenHandled || !shouldAutoOpen()) return;
    autoOpenHandled = true;
    var lessonId = currentLessonId();
    openDialog(launcherForLesson(lessonId), { lessonId: lessonId, caseId: requestedCaseId() });
  }

  function init() {
    createDialog();
    installLaunchers();
    maybeAutoOpen();
    if (document.body && typeof MutationObserver === 'function') {
      launcherObserver = new MutationObserver(function () { installLaunchers(); });
      launcherObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  window.MedNykutoS4GuidedCases = {
    version: runtimeVersion,
    storageKey: STORAGE_KEY,
    scope: GUIDED_SCOPE,
    open: function (options) {
      options = options || {};
      installLaunchers();
      var lessonId = LESSON_IDS.indexOf(options.lessonId) >= 0 ? options.lessonId : currentLessonId() || 'fisiologia-2026-08-13';
      openDialog(options.launcher || launcherForLesson(lessonId), { lessonId: lessonId, caseId: options.caseId });
    },
    close: closeDialog,
    render: render,
    installLaunchers: installLaunchers,
    getState: loadState
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
