(function () {
  'use strict';

  var P1_SCOPE = window.MedNykutoP1Scope;
  var P2_SCOPE = window.MedNykutoP2Scope;
  var SCOPES = { p1: P1_SCOPE, p2: P2_SCOPE };
  var activeScopeKey = scopeKeyFromHash();
  var scope = SCOPES[activeScopeKey] || P1_SCOPE;
  var model = window.MedNykutoAcademicModel;
  var practice = window.MedNykutoClassPractice;
  if (!P1_SCOPE || !scope || !model || !practice || !practice.banks) return;

  var STORAGE_KEY = storageKeyFor(scope);
  var TYPES = ['qcm', 'vf', 'cases'];
  var TYPE_LABELS = { qcm: 'QCM', vf: 'Verdadero / Falso', cases: 'Caso clínico' };
  var MODE_LABELS = { training: 'Entrenamiento', exam: 'Examen blanco' };
  var state = { selectedSubject: 'all', activeView: 'exam', session: null, currentIndex: 0 };
  var lessonByPracticeId = {};
  var deduplicationByScopeId = {};

  function scopeKeyFromHash() {
    return String(window.location.hash || '').toLocaleLowerCase('es') === '#p2' && P2_SCOPE ? 'p2' : 'p1';
  }

  function storageKeyFor(targetScope) {
    var key = P2_SCOPE && targetScope && targetScope.id === P2_SCOPE.id ? 'p2' : 'p1';
    return 'medNykuto:' + key + 'Exam:' + targetScope.id;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function icon(symbolId) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + symbolId);
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(use);
    return svg;
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function hash(value) {
    var result = 2166136261;
    var source = String(value || '');
    for (var index = 0; index < source.length; index += 1) {
      result ^= source.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return (result >>> 0).toString(36);
  }

  function seededRandom(seed) {
    var value = (Number(seed) || 1) >>> 0;
    return function () {
      value += 0x6D2B79F5;
      var next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(values, random) {
    var output = values.slice();
    for (var index = output.length - 1; index > 0; index -= 1) {
      var target = Math.floor(random() * (index + 1));
      var temporary = output[index];
      output[index] = output[target];
      output[target] = temporary;
    }
    return output;
  }

  function newSeed() {
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] || 1;
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xFFFFFFFF)) >>> 0;
  }

  function normalizeCorrectionMode(mode, fallback) {
    if (mode === 'training' || mode === 'exam') return mode;
    return fallback === 'training' ? 'training' : 'exam';
  }

  function flattenAcademicModel() {
    Object.keys(model.subjects).forEach(function (subjectId) {
      var subject = model.subjects[subjectId];
      subject.chapters.forEach(function (chapter) {
        chapter.lessons.forEach(function (lesson) {
          lessonByPracticeId[lesson.practiceId] = {
            subjectId: subjectId,
            subject: subject,
            chapter: chapter,
            lesson: lesson,
            teacher: model.teachers[subject.teacherId],
            narrative: model.narratives[lesson.id]
          };
        });
      });
    });
  }

  function subjectIdsOrAll(subjectIds, targetScope) {
    var selectedScope = targetScope || scope;
    var available = Object.keys(selectedScope.subjects);
    if (!Array.isArray(subjectIds) || !subjectIds.length) return available;
    return subjectIds.filter(function (subjectId) { return available.indexOf(subjectId) >= 0; });
  }

  function collectQuestions(subjectIds, shouldDedupe, targetScope) {
    var selectedScope = targetScope || scope;
    var selected = subjectIdsOrAll(subjectIds, selectedScope);
    var questions = [];
    var seenExact = {};
    var seenOptions = {};
    var seenExplanations = {};
    var raw = 0;

    selected.forEach(function (subjectId) {
      var subjectScope = selectedScope.subjects[subjectId];
      subjectScope.practiceIds.forEach(function (practiceId) {
        var bank = practice.banks[practiceId];
        var academic = lessonByPracticeId[practiceId];
        if (!bank || !academic) return;
        TYPES.forEach(function (type) {
          (bank[type] || []).forEach(function (question, questionIndex) {
            raw += 1;
            var normalizedPrompt = normalize((question.scenario || '') + ' ' + (question.prompt || ''));
            var normalizedOptions = (question.options || []).map(normalize).sort().join('|');
            var exactSignature = type + '|' + normalizedPrompt + '|' + normalizedOptions;
            var optionsSignature = type + '|' + normalizedOptions;
            var explanationSignature = type + '|' + normalize(question.explanation);
            var duplicate = Boolean(seenExact[exactSignature]);

            if (shouldDedupe && !duplicate && type !== 'vf' && normalizedOptions.length > 35 && seenOptions[optionsSignature]) {
              duplicate = seenOptions[optionsSignature].practiceId !== practiceId;
            }
            if (shouldDedupe && !duplicate && explanationSignature.length > 65 && seenExplanations[explanationSignature]) {
              duplicate = seenExplanations[explanationSignature].practiceId !== practiceId;
            }
            if (shouldDedupe && duplicate) return;

            seenExact[exactSignature] = { practiceId: practiceId };
            if (type !== 'vf') seenOptions[optionsSignature] = { practiceId: practiceId };
            if (explanationSignature.length > 65) seenExplanations[explanationSignature] = { practiceId: practiceId };

            questions.push({
              id: subjectId + ':' + practiceId + ':' + type + ':' + questionIndex + ':' + hash(exactSignature),
              subjectId: subjectId,
              subjectLabel: subjectScope.label,
              practiceId: practiceId,
              lessonId: academic.lesson.id,
              lessonDate: academic.lesson.date,
              lessonDateLong: academic.lesson.dateLong,
              lessonTitle: academic.lesson.title,
              type: type,
              prompt: question.prompt,
              scenario: question.scenario || '',
              options: (question.options || []).slice(),
              answer: Number(question.answer),
              explanation: question.explanation || '',
              imageSrc: question.imageSrc || '',
              imageAlt: question.imageAlt || '',
              teacherProfileId: question.teacherProfileId || bank.teacherProfileId || academic.teacher.id,
              teacherAngle: question.teacherAngle || '',
              teacherAngleLabel: question.teacherAngleLabel || 'Razonamiento de la clase'
            });
          });
        });
      });
    });

    if (shouldDedupe) {
      var audit = { raw: raw, unique: questions.length, removed: raw - questions.length };
      deduplicationByScopeId[selectedScope.id] = audit;
    }
    return questions;
  }

  function balancedTake(pool, count, random) {
    if (count >= pool.length) return shuffled(pool, random);
    var groups = {};
    pool.forEach(function (item) {
      if (!groups[item.practiceId]) groups[item.practiceId] = [];
      groups[item.practiceId].push(item);
    });
    var keys = shuffled(Object.keys(groups), random);
    keys.forEach(function (key) { groups[key] = shuffled(groups[key], random); });
    var result = [];
    var cursor = 0;
    while (result.length < count && keys.length) {
      var key = keys[cursor % keys.length];
      if (groups[key].length) result.push(groups[key].shift());
      if (!groups[key].length) {
        keys.splice(keys.indexOf(key), 1);
        if (!keys.length) break;
        cursor = cursor % keys.length;
      } else {
        cursor += 1;
      }
    }
    return result;
  }

  function formatQuotas(length, pools, targetScope) {
    var selectedScope = targetScope || scope;
    var quotas = {
      qcm: Math.floor(length * selectedScope.formatRatios.qcm),
      vf: Math.floor(length * selectedScope.formatRatios.vf)
    };
    quotas.cases = length - quotas.qcm - quotas.vf;
    var missing = 0;
    TYPES.forEach(function (type) {
      if (quotas[type] > pools[type].length) {
        missing += quotas[type] - pools[type].length;
        quotas[type] = pools[type].length;
      }
    });
    while (missing > 0) {
      var expanded = false;
      TYPES.forEach(function (type) {
        if (missing > 0 && quotas[type] < pools[type].length) {
          quotas[type] += 1;
          missing -= 1;
          expanded = true;
        }
      });
      if (!expanded) break;
    }
    return quotas;
  }

  function prepareQuestion(item, random) {
    var optionIndexes = item.options.map(function (_, index) { return index; });
    if (item.type !== 'vf') optionIndexes = shuffled(optionIndexes, random);
    var options = optionIndexes.map(function (originalIndex) {
      return { text: item.options[originalIndex], originalIndex: originalIndex };
    });
    var correctIndex = optionIndexes.indexOf(item.answer);
    var copy = {};
    Object.keys(item).forEach(function (key) {
      if (key !== 'options' && key !== 'answer') copy[key] = item[key];
    });
    copy.options = options;
    copy.correctIndex = correctIndex;
    return copy;
  }

  function buildExam(options, targetScope) {
    var examScope = targetScope || scope;
    var selectedSubjects = subjectIdsOrAll(options && options.subjectIds, examScope);
    var seed = Number(options && options.seed) || newSeed();
    var random = seededRandom(seed);
    var unique = collectQuestions(selectedSubjects, true, examScope);
    var requested = options && options.length === 'all' ? unique.length : Number(options && options.length) || examScope.defaultLength;
    var total = Math.max(1, Math.min(requested, unique.length));
    var pools = { qcm: [], vf: [], cases: [] };
    unique.forEach(function (item) { pools[item.type].push(item); });
    var quotas = formatQuotas(total, pools, examScope);
    var selected = [];
    TYPES.forEach(function (type) {
      selected = selected.concat(balancedTake(pools[type], quotas[type], random));
    });
    selected = shuffled(selected, random).map(function (item) { return prepareQuestion(item, random); });
    return {
      version: examScope.id,
      mode: normalizeCorrectionMode(options && options.mode, 'exam'),
      seed: seed,
      subjectIds: selectedSubjects,
      requestedLength: options && options.length ? options.length : examScope.defaultLength,
      items: selected,
      answers: {},
      validated: {},
      currentIndex: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      deduplication: {
        raw: deduplicationByScopeId[examScope.id].raw,
        unique: deduplicationByScopeId[examScope.id].unique,
        removed: deduplicationByScopeId[examScope.id].removed
      }
    };
  }

  function saveSession() {
    if (!state.session) return;
    state.session.currentIndex = state.currentIndex;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session)); } catch (error) {}
  }

  function readSessionFor(targetScope) {
    var selectedScope = targetScope || scope;
    try {
      var saved = JSON.parse(localStorage.getItem(storageKeyFor(selectedScope)));
      if (!saved || saved.version !== selectedScope.id || !Array.isArray(saved.items) || !saved.items.length) return null;
      if (!saved.answers || typeof saved.answers !== 'object') saved.answers = {};
      saved.mode = normalizeCorrectionMode(saved.mode, 'exam');
      if (!saved.validated || typeof saved.validated !== 'object') saved.validated = {};
      return saved;
    } catch (error) {
      return null;
    }
  }

  function readSession() {
    return readSessionFor(scope);
  }

  function removeSession() {
    state.session = null;
    state.currentIndex = 0;
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
  }

  function clearScopeSession(targetScope) {
    if (targetScope.id === scope.id) {
      removeSession();
      return;
    }
    try { localStorage.removeItem(storageKeyFor(targetScope)); } catch (error) {}
  }

  function questionCountForSubject(subjectId) {
    return collectQuestions([subjectId], false).length;
  }

  function lessonCountForScope(targetScope) {
    return Object.keys(targetScope.subjects).reduce(function (total, subjectId) {
      return total + targetScope.subjects[subjectId].practiceIds.length;
    }, 0);
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function centerActiveBottomNavigation() {
    var navigation = document.querySelector('.p1-bottom-nav');
    var active = navigation && navigation.querySelector('[aria-current="page"]');
    if (!navigation || !active || !window.matchMedia('(max-width: 760px)').matches) return;
    navigation.scrollLeft = Math.max(0, active.offsetLeft - ((navigation.clientWidth - active.offsetWidth) / 2));
  }

  function applyScopeLabels() {
    var label = scope.label || activeScopeKey.toLocaleUpperCase('es');
    var lessonCount = lessonCountForScope(scope);
    var questionCount = collectQuestions(Object.keys(scope.subjects), false, scope).length;
    var fallbackDescription = label === 'P1'
      ? 'Todo lo ya estudiado, reunido por materia y mezclado para practicar.'
      : 'Clases reunidas en una sola ruta para repasar y practicar.';

    document.body.dataset.partialScope = activeScopeKey;
    document.title = label + ' · Repaso y simulacro | Med Nykuto';
    var description = document.querySelector('meta[name="description"]');
    if (description) description.content = (scope.description || fallbackDescription) + ' ' + lessonCount + ' clases y ' + questionCount + ' preguntas fuente.';
    setText('p1BrandScope', '4.º E · ' + scope.title);
    setText('p1HeaderPartial', label);
    setText('p1HeroEyebrow', String(scope.title || '').toLocaleUpperCase('es'));
    setText('p1-title', 'Repaso ' + label);
    setText('p1HeroDescription', scope.description || fallbackDescription);
    setText('p1LessonCount', String(lessonCount));
    setText('p1QuestionCount', String(questionCount));
    setText('p1SheetTabLabel', 'Ficha ' + label);
    setText('p1PracticeTabLabel', 'Practicar ' + label);
    setText('p1SheetEyebrow', 'FICHA ACUMULATIVA ' + label);
    setText('p1-sheet-title', 'Todo el ' + label + ' por materia');
    setText('p1ExamEyebrow', 'PRÁCTICA ' + label);

    document.querySelectorAll('[data-partial-scope]').forEach(function (link) {
      if (link.dataset.partialScope === activeScopeKey) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    var notice = document.getElementById('p1ScopeNotice');
    if (notice) {
      notice.hidden = !scope.note;
      notice.textContent = scope.note || '';
    }

    var topicRanking = document.getElementById('p1TopicRankingLink');
    if (topicRanking) topicRanking.hidden = activeScopeKey === 'p2';

    var bottom = document.getElementById('p1BottomPartial');
    if (bottom) {
      bottom.href = activeScopeKey === 'p2' ? '#p2' : 'p1.html';
      bottom.setAttribute('aria-label', 'Repaso ' + label);
      var bottomLabel = bottom.querySelector('strong');
      if (bottomLabel) bottomLabel.textContent = label;
    }
    centerActiveBottomNavigation();
  }

  function activateScope(nextKey) {
    var resolvedKey = nextKey === 'p2' && P2_SCOPE ? 'p2' : 'p1';
    var nextScope = SCOPES[resolvedKey];
    if (!nextScope) return;
    if (scope.id === nextScope.id) {
      activeScopeKey = resolvedKey;
      applyScopeLabels();
      return;
    }

    saveSession();
    activeScopeKey = resolvedKey;
    scope = nextScope;
    STORAGE_KEY = storageKeyFor(scope);
    state.selectedSubject = 'all';
    state.activeView = 'exam';
    state.session = readSession();
    state.currentIndex = state.session ? Number(state.session.currentIndex) || 0 : 0;
    applyScopeLabels();
    renderSubjectRail();
    renderExamFilters();
    renderSheet();
    updateStartButton();
    switchView('exam');
    if (state.session && state.session.completed) renderResults();
    else showSetup();
  }

  function createSubjectButton(subjectId, label, symbol, accent) {
    var button = el('button', 'p1-subject-button');
    button.type = 'button';
    button.dataset.subjectId = subjectId;
    button.style.setProperty('--subject-accent', accent || 'var(--p1-cyan)');
    button.setAttribute('aria-pressed', state.selectedSubject === subjectId ? 'true' : 'false');
    button.appendChild(icon(symbol));
    button.appendChild(el('strong', '', label));
    button.addEventListener('click', function () {
      selectSubject(subjectId);
      if (state.activeView === 'exam' && !state.session) applyExamSubjectPreset(subjectId);
    });
    return button;
  }

  function renderSubjectRail() {
    var rail = document.getElementById('p1SubjectRail');
    if (!rail) return;
    rail.replaceChildren();
    rail.appendChild(createSubjectButton('all', 'Todo ' + scope.label, 'class-icon-p1', '#4cc9f0'));
    Object.keys(scope.subjects).forEach(function (subjectId) {
      var subject = scope.subjects[subjectId];
      rail.appendChild(createSubjectButton(subjectId, subject.shortLabel, subject.icon, subject.accent));
    });
  }

  function selectSubject(subjectId) {
    state.selectedSubject = scope.subjects[subjectId] ? subjectId : 'all';
    document.querySelectorAll('.p1-subject-button').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.subjectId === state.selectedSubject ? 'true' : 'false');
    });
    renderSheet();
  }

  function renderOverview(container) {
    var grid = el('div', 'p1-overview-grid');
    Object.keys(scope.subjects).forEach(function (subjectId) {
      var subject = scope.subjects[subjectId];
      var button = el('button', 'p1-subject-card');
      button.type = 'button';
      button.style.setProperty('--subject-accent', subject.accent);
      var iconBox = el('span', 'p1-subject-card-icon');
      iconBox.appendChild(icon(subject.icon));
      button.appendChild(iconBox);
      button.appendChild(el('strong', '', subject.label));
      button.appendChild(el('small', '', subject.practiceIds.length + ' clase' + (subject.practiceIds.length === 1 ? '' : 's') + ' · ' + questionCountForSubject(subjectId) + ' preguntas'));
      button.appendChild(el('b', '', subject.statusLabel));
      button.addEventListener('click', function () { selectSubject(subjectId); });
      grid.appendChild(button);
    });
    container.appendChild(grid);
  }

  function createTeacherCard(title, items, ordered) {
    var card = el('section', 'p1-teacher-card');
    card.appendChild(el('h4', '', title));
    var list = el(ordered ? 'ol' : 'ul', ordered ? 'p1-step-list' : 'p1-target-list');
    items.forEach(function (item) { list.appendChild(el('li', '', item)); });
    card.appendChild(list);
    return card;
  }

  function renderLesson(subject, practiceId) {
    var academic = lessonByPracticeId[practiceId];
    if (!academic) return null;
    var details = el('details', 'p1-lesson');
    var summary = el('summary');
    summary.appendChild(el('span', 'p1-lesson-date', academic.lesson.date));
    var title = el('span', 'p1-lesson-title');
    title.appendChild(el('strong', '', academic.lesson.title));
    title.appendChild(el('small', '', academic.chapter.title));
    summary.appendChild(title);
    details.appendChild(summary);
    var body = el('div', 'p1-lesson-body');
    var narrative = academic.narrative;
    if (narrative) {
      body.appendChild(el('p', '', narrative.lead));
      var keys = el('ul', 'p1-key-grid');
      narrative.sections.forEach(function (section) {
        var item = el('li');
        item.appendChild(el('strong', '', section[1]));
        item.appendChild(el('small', '', section[0]));
        keys.appendChild(item);
      });
      body.appendChild(keys);
    } else {
      body.appendChild(el('p', '', 'Esta clase está incluida en el banco ' + scope.label + ' y conserva su ficha completa dentro del cuaderno.'));
    }
    var link = el('a', 'p1-lesson-source', 'Abrir la clase completa →');
    link.href = 'clase.html#' + academic.lesson.id;
    body.appendChild(link);
    details.appendChild(body);
    return details;
  }

  function renderSubjectSheet(container, subjectId) {
    var subject = scope.subjects[subjectId];
    var academicSubject = model.subjects[subjectId];
    var teacher = model.teachers[academicSubject.teacherId];
    container.style.setProperty('--subject-accent', subject.accent);
    var header = el('header', 'p1-sheet-header');
    var copy = el('div');
    copy.appendChild(el('span', '', subject.statusLabel.toLocaleUpperCase('es')));
    copy.appendChild(el('h3', '', subject.label + ' · ' + scope.label));
    copy.appendChild(el('p', '', 'Una sola ficha para conectar ' + subject.practiceIds.length + ' clase' + (subject.practiceIds.length === 1 ? '' : 's') + ' antes de practicar.'));
    header.appendChild(copy);
    var numbers = el('div', 'p1-sheet-numbers');
    var lessonNumber = el('b'); lessonNumber.appendChild(el('strong', '', String(subject.practiceIds.length))); lessonNumber.appendChild(document.createTextNode('clases'));
    var questionNumber = el('b'); questionNumber.appendChild(el('strong', '', String(questionCountForSubject(subjectId)))); questionNumber.appendChild(document.createTextNode('preguntas'));
    numbers.appendChild(lessonNumber); numbers.appendChild(questionNumber); header.appendChild(numbers);
    container.appendChild(header);
    if (subject.note) container.appendChild(el('p', 'p1-sheet-status', subject.note));

    var teacherBlock = el('section', 'p1-teacher-block');
    var reasoningPath = Array.isArray(subject.reasoningPath) && subject.reasoningPath.length ? subject.reasoningPath : teacher.reasoningPath;
    var likelyExamTargets = Array.isArray(subject.likelyExamTargets) && subject.likelyExamTargets.length ? subject.likelyExamTargets : teacher.likelyExamTargets;
    var teacherRoute = createTeacherCard('Cómo razona ' + teacher.name, reasoningPath, true);
    teacherRoute.prepend(el('span', '', 'RUTA DEL DOCENTE'));
    var targets = createTeacherCard('Lo más probable para repasar', likelyExamTargets, false);
    targets.prepend(el('span', '', 'OBJETIVOS E HIPÓTESIS'));
    teacherBlock.appendChild(teacherRoute);
    teacherBlock.appendChild(targets);
    container.appendChild(teacherBlock);

    if (Array.isArray(subject.sources) && subject.sources.length) {
      var drive = el('div', 'p1-drive-sources');
      subject.sources.forEach(function (source) {
        var link = el('a', '', source.label + ' ↗');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        drive.appendChild(link);
      });
      container.appendChild(drive);
    }

    var lessons = el('div', 'p1-lessons');
    subject.practiceIds.forEach(function (practiceId) {
      var lesson = renderLesson(subject, practiceId);
      if (lesson) lessons.appendChild(lesson);
    });
    container.appendChild(lessons);
    var action = el('button', 'p1-sheet-action', 'Hacer simulacro de ' + subject.shortLabel);
    action.type = 'button';
    action.addEventListener('click', function () {
      switchView('exam');
      applyExamSubjectPreset(subjectId);
      document.getElementById('p1ExamView').scrollIntoView({ block: 'start' });
    });
    container.appendChild(action);
  }

  function renderSheet() {
    var container = document.getElementById('p1SheetContent');
    var scopeLabel = document.getElementById('p1SheetScope');
    if (!container) return;
    container.replaceChildren();
    container.style.removeProperty('--subject-accent');
    if (state.selectedSubject === 'all') {
      var subjectCount = Object.keys(scope.subjects).length;
      if (scopeLabel) scopeLabel.textContent = subjectCount + ' materia' + (subjectCount === 1 ? '' : 's');
      renderOverview(container);
    } else {
      if (scopeLabel) scopeLabel.textContent = scope.subjects[state.selectedSubject].statusLabel;
      renderSubjectSheet(container, state.selectedSubject);
    }
  }

  function switchView(view) {
    state.activeView = view === 'exam' ? 'exam' : 'sheet';
    document.querySelectorAll('[data-p1-view]').forEach(function (button) {
      button.setAttribute('aria-selected', button.dataset.p1View === state.activeView ? 'true' : 'false');
    });
    document.querySelectorAll('[data-p1-panel]').forEach(function (panel) {
      panel.hidden = panel.dataset.p1Panel !== state.activeView;
    });
    if (state.activeView === 'exam') refreshResume();
  }

  function renderExamFilters() {
    var container = document.getElementById('p1ExamSubjects');
    if (!container) return;
    container.replaceChildren();
    Object.keys(scope.subjects).forEach(function (subjectId) {
      var label = el('label', 'p1-filter-chip');
      var input = el('input');
      input.type = 'checkbox';
      input.value = subjectId;
      input.checked = true;
      label.appendChild(input);
      label.appendChild(el('span', '', scope.subjects[subjectId].shortLabel));
      container.appendChild(label);
    });
  }

  function applyExamSubjectPreset(subjectId) {
    document.querySelectorAll('#p1ExamSubjects input').forEach(function (input) {
      input.checked = subjectId === 'all' || input.value === subjectId;
    });
  }

  function selectedExamSubjects() {
    return Array.prototype.slice.call(document.querySelectorAll('#p1ExamSubjects input:checked')).map(function (input) { return input.value; });
  }

  function selectedExamLength() {
    var selected = document.querySelector('input[name="p1-length"]:checked');
    return selected ? selected.value : String(scope.defaultLength);
  }

  function selectedCorrectionMode() {
    var selected = document.querySelector('input[name="p1-correction-mode"]:checked');
    return normalizeCorrectionMode(selected && selected.value, 'training');
  }

  function startButtonLabel() {
    return selectedCorrectionMode() === 'training' ? 'Empezar entrenamiento' : 'Empezar examen blanco';
  }

  function updateStartButton() {
    var button = document.getElementById('p1StartExam');
    if (button) button.textContent = startButtonLabel();
  }

  function startExam() {
    var subjects = selectedExamSubjects();
    if (!subjects.length) {
      var button = document.getElementById('p1StartExam');
      button.textContent = 'Elige al menos una materia';
      window.setTimeout(updateStartButton, 1800);
      return;
    }
    var lengthValue = selectedExamLength();
    state.session = buildExam({
      subjectIds: subjects,
      length: lengthValue === 'all' ? 'all' : Number(lengthValue),
      mode: selectedCorrectionMode(),
      seed: newSeed()
    });
    state.currentIndex = 0;
    saveSession();
    showSession();
  }

  function isTrainingSession() {
    return Boolean(state.session && state.session.mode === 'training');
  }

  function isQuestionValidated(item) {
    return Boolean(state.session && state.session.validated && state.session.validated[item.id]);
  }

  function isQuestionAnswered(item) {
    if (!state.session || !Number.isInteger(state.session.answers[item.id])) return false;
    return !isTrainingSession() || isQuestionValidated(item);
  }

  function answeredTotal() {
    if (!state.session) return 0;
    return state.session.items.filter(isQuestionAnswered).length;
  }

  function refreshResume() {
    var resume = document.getElementById('p1Resume');
    if (!resume) return;
    if (!state.session) state.session = readSession();
    if (!state.session || state.session.completed) {
      resume.hidden = true;
      return;
    }
    resume.hidden = false;
    document.getElementById('p1ResumeLabel').textContent = MODE_LABELS[state.session.mode] + ' · ' + answeredTotal() + ' de ' + state.session.items.length + ' respondidas';
  }

  function showSetup() {
    document.getElementById('p1ExamSetup').hidden = false;
    document.getElementById('p1ExamSession').hidden = true;
    document.getElementById('p1Results').hidden = true;
    refreshResume();
  }

  function showSession() {
    if (!state.session) return;
    state.currentIndex = Math.max(0, Math.min(Number(state.session.currentIndex) || 0, state.session.items.length - 1));
    document.getElementById('p1ExamSetup').hidden = true;
    document.getElementById('p1Results').hidden = true;
    document.getElementById('p1ExamSession').hidden = false;
    renderQuestion();
  }

  function renderDots() {
    var container = document.getElementById('p1QuestionDots');
    var items = state.session.items;
    var start = 0;
    var end = items.length;
    if (items.length > 100) {
      start = Math.max(0, state.currentIndex - 12);
      end = Math.min(items.length, start + 25);
      start = Math.max(0, end - 25);
    }
    container.replaceChildren();
    for (var index = start; index < end; index += 1) {
      (function (questionIndex) {
        var item = items[questionIndex];
        var button = el('button', 'p1-question-dot', String(questionIndex + 1));
        button.type = 'button';
        button.setAttribute('aria-label', 'Pregunta ' + (questionIndex + 1));
        if (questionIndex === state.currentIndex) button.classList.add('is-current');
        if (isQuestionAnswered(item)) button.classList.add('is-answered');
        button.addEventListener('click', function () {
          state.currentIndex = questionIndex;
          saveSession();
          renderQuestion();
        });
        container.appendChild(button);
      })(index);
    }
    var currentDot = container.querySelector('.is-current');
    if (currentDot) currentDot.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function appendImmediateCorrection(host, item) {
    var selected = state.session.answers[item.id];
    var isCorrect = selected === item.correctIndex;
    var feedback = el('details', 'p1-review-item' + (isCorrect ? ' is-correct' : ''));
    feedback.open = true;
    var summary = el('summary');
    summary.appendChild(el('span', 'p1-review-state', isCorrect ? '✓' : '×'));
    summary.appendChild(el('strong', 'p1-review-title', isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta'));
    summary.appendChild(el('b', '', 'CORRECCIÓN'));
    feedback.appendChild(summary);
    var body = el('div', 'p1-review-body');
    var correctAnswer = el('p');
    correctAnswer.appendChild(el('strong', '', 'Respuesta correcta: '));
    correctAnswer.appendChild(document.createTextNode(item.options[item.correctIndex].text));
    body.appendChild(correctAnswer);
    var explanation = el('p');
    explanation.appendChild(el('strong', '', 'Por qué: '));
    explanation.appendChild(document.createTextNode(item.explanation));
    body.appendChild(explanation);
    feedback.appendChild(body);
    host.appendChild(feedback);
  }

  function updateQuestionNavigation() {
    if (!state.session) return;
    var item = state.session.items[state.currentIndex];
    var previous = document.getElementById('p1PreviousQuestion');
    var next = document.getElementById('p1NextQuestion');
    var total = state.session.items.length;
    previous.disabled = state.currentIndex === 0;
    if (isTrainingSession() && !isQuestionValidated(item)) {
      var hasSelection = Number.isInteger(state.session.answers[item.id]);
      next.disabled = !hasSelection;
      next.textContent = hasSelection ? 'Comprobar respuesta' : 'Elige una respuesta';
      return;
    }
    next.disabled = false;
    next.textContent = state.currentIndex === total - 1 ? 'Ir a pendiente →' : 'Siguiente →';
  }

  function renderQuestion() {
    var item = state.session.items[state.currentIndex];
    var host = document.getElementById('p1Question');
    var answered = answeredTotal();
    var total = state.session.items.length;
    host.replaceChildren();
    var meta = el('div', 'p1-question-meta');
    meta.appendChild(el('span', '', item.subjectLabel + ' · ' + item.lessonDate + ' · ' + TYPE_LABELS[item.type]));
    meta.appendChild(el('b', '', item.teacherAngleLabel));
    host.appendChild(meta);
    if (item.imageSrc) {
      var media = el('figure', 'p1-question-media');
      var mediaLink = el('a');
      var mediaImage = el('img');
      mediaLink.href = item.imageSrc;
      mediaLink.target = '_blank';
      mediaLink.rel = 'noopener';
      mediaLink.setAttribute('aria-label', 'Ampliar imagen de la clase');
      mediaImage.src = item.imageSrc;
      mediaImage.alt = item.imageAlt || ('Material visual de ' + item.lessonTitle);
      mediaImage.decoding = 'async';
      mediaLink.appendChild(mediaImage);
      media.appendChild(mediaLink);
      media.appendChild(el('figcaption', '', 'Imagen de la clase · toca para ampliar'));
      host.appendChild(media);
    }
    if (item.scenario) host.appendChild(el('p', 'p1-scenario', item.scenario));
    host.appendChild(el('h3', '', item.prompt));
    var options = el('div', 'p1-options');
    var answerLocked = isTrainingSession() && isQuestionValidated(item);
    item.options.forEach(function (option, optionIndex) {
      var label = el('label', 'p1-option');
      var input = el('input');
      input.type = 'radio';
      input.name = 'p1-answer';
      input.value = String(optionIndex);
      input.checked = state.session.answers[item.id] === optionIndex;
      input.disabled = answerLocked;
      if (answerLocked && optionIndex === item.correctIndex) label.classList.add('is-correct-answer');
      if (answerLocked && optionIndex === state.session.answers[item.id] && optionIndex !== item.correctIndex) label.classList.add('is-wrong-answer');
      input.addEventListener('change', function () {
        if (answerLocked) return;
        state.session.answers[item.id] = optionIndex;
        saveSession();
        updateSessionProgress();
        updateQuestionNavigation();
        renderDots();
      });
      var copy = el('span');
      copy.appendChild(el('b', '', item.type === 'vf' ? (optionIndex === 0 ? 'V' : 'F') : String.fromCharCode(65 + optionIndex)));
      copy.appendChild(document.createTextNode(option.text));
      label.appendChild(input);
      label.appendChild(copy);
      options.appendChild(label);
    });
    host.appendChild(options);
    if (answerLocked) appendImmediateCorrection(host, item);
    document.getElementById('p1QuestionPosition').textContent = 'Pregunta ' + (state.currentIndex + 1) + ' de ' + total;
    updateSessionProgress();
    updateQuestionNavigation();
    renderDots();
  }

  function updateSessionProgress() {
    var answered = answeredTotal();
    var total = state.session.items.length;
    document.getElementById('p1AnsweredCount').textContent = answered + ' respondida' + (answered === 1 ? '' : 's');
    var progress = document.getElementById('p1Progress');
    progress.max = total;
    progress.value = answered;
    progress.textContent = answered + ' de ' + total;
    var finish = document.getElementById('p1FinishExam');
    finish.disabled = answered !== total;
    finish.textContent = isTrainingSession() ? 'Ver resumen' : 'Ver resultado';
  }

  function nextQuestion() {
    var current = state.session.items[state.currentIndex];
    if (isTrainingSession() && !isQuestionValidated(current)) {
      if (!Number.isInteger(state.session.answers[current.id])) return;
      state.session.validated[current.id] = true;
      saveSession();
      renderQuestion();
      return;
    }
    if (state.currentIndex < state.session.items.length - 1) state.currentIndex += 1;
    else {
      var unanswered = state.session.items.findIndex(function (item) { return !isQuestionAnswered(item); });
      if (unanswered >= 0) state.currentIndex = unanswered;
    }
    saveSession();
    renderQuestion();
  }

  function previousQuestion() {
    if (state.currentIndex > 0) state.currentIndex -= 1;
    saveSession();
    renderQuestion();
  }

  function scoreSession() {
    var correct = 0;
    var bySubject = {};
    var byType = {};
    var byAngle = {};
    state.session.items.forEach(function (item) {
      var isCorrect = state.session.answers[item.id] === item.correctIndex;
      if (isCorrect) correct += 1;
      [
        [bySubject, item.subjectLabel],
        [byType, TYPE_LABELS[item.type]],
        [byAngle, item.teacherAngleLabel]
      ].forEach(function (entry) {
        if (!entry[0][entry[1]]) entry[0][entry[1]] = { correct: 0, total: 0 };
        entry[0][entry[1]].total += 1;
        if (isCorrect) entry[0][entry[1]].correct += 1;
      });
    });
    return { correct: correct, total: state.session.items.length, bySubject: bySubject, byType: byType, byAngle: byAngle };
  }

  function percentage(result) {
    return result.total ? Math.round((result.correct / result.total) * 100) : 0;
  }

  function resultCard(title, values) {
    var card = el('section', 'p1-result-card');
    card.appendChild(el('span', '', title));
    Object.keys(values).sort(function (left, right) { return percentage(values[left]) - percentage(values[right]); }).forEach(function (label) {
      var row = el('div', 'p1-result-row');
      row.appendChild(el('strong', '', label));
      row.appendChild(el('b', '', values[label].correct + '/' + values[label].total + ' · ' + percentage(values[label]) + '%'));
      card.appendChild(row);
    });
    return card;
  }

  function renderResults() {
    if (!state.session) return;
    var results = scoreSession();
    var percent = percentage(results);
    var host = document.getElementById('p1Results');
    host.replaceChildren();
    var hero = el('section', 'p1-results-hero');
    var ring = el('div', 'p1-score-ring', percent + '%');
    ring.style.setProperty('--score-color', percent >= 70 ? 'var(--p1-green)' : percent >= 50 ? 'var(--p1-gold)' : 'var(--p1-red)');
    hero.appendChild(ring);
    var copy = el('div');
    copy.appendChild(el('span', '', isTrainingSession() ? 'RESUMEN DEL ENTRENAMIENTO' : 'RESULTADO DEL EXAMEN BLANCO'));
    copy.appendChild(el('h3', '', results.correct + ' respuestas correctas de ' + results.total));
    copy.appendChild(el('p', '', 'El resultado se separa por materia, formato y ángulo docente para mostrar dónde conviene volver a la ficha.'));
    hero.appendChild(copy);
    host.appendChild(hero);
    var grid = el('div', 'p1-result-grid');
    grid.appendChild(resultCard('POR MATERIA', results.bySubject));
    grid.appendChild(resultCard('POR FORMATO', results.byType));
    grid.appendChild(resultCard('ÁNGULOS A REFORZAR', results.byAngle));
    var audit = el('section', 'p1-result-card');
    audit.appendChild(el('span', '', 'CALIDAD DEL BANCO'));
    audit.appendChild(el('div', 'p1-result-row'));
    audit.lastChild.appendChild(el('strong', '', 'Solapamientos retirados'));
    audit.lastChild.appendChild(el('b', '', String(state.session.deduplication.removed)));
    audit.appendChild(el('div', 'p1-result-row'));
    audit.lastChild.appendChild(el('strong', '', 'Corrección mostrada'));
    audit.lastChild.appendChild(el('b', '', isTrainingSession() ? 'Después de cada respuesta' : 'Solo al finalizar'));
    grid.appendChild(audit);
    host.appendChild(grid);

    var review = el('div', 'p1-review-list');
    state.session.items.forEach(function (item, index) {
      var selected = state.session.answers[item.id];
      var isCorrect = selected === item.correctIndex;
      if (isCorrect) return;
      var details = el('details', 'p1-review-item');
      var summary = el('summary');
      summary.appendChild(el('span', 'p1-review-state', '×'));
      summary.appendChild(el('strong', 'p1-review-title', (index + 1) + '. ' + item.prompt));
      summary.appendChild(el('b', '', item.subjectLabel));
      details.appendChild(summary);
      var body = el('div', 'p1-review-body');
      body.appendChild(el('p', '', 'Tu respuesta: ' + (item.options[selected] ? item.options[selected].text : 'Sin respuesta')));
      var correctAnswer = el('p');
      correctAnswer.appendChild(el('strong', '', 'Respuesta correcta: '));
      correctAnswer.appendChild(document.createTextNode(item.options[item.correctIndex].text));
      body.appendChild(correctAnswer);
      var explanation = el('p');
      explanation.appendChild(el('strong', '', 'Por qué: '));
      explanation.appendChild(document.createTextNode(item.explanation));
      body.appendChild(explanation);
      var source = el('a', 'p1-lesson-source', 'Volver a la clase →');
      source.href = 'clase.html#' + item.lessonId;
      body.appendChild(source);
      details.appendChild(body);
      review.appendChild(details);
    });
    if (!review.children.length) review.appendChild(el('p', 'p1-sheet-status', 'No hay errores en este simulacro.'));
    host.appendChild(review);

    var actions = el('div', 'p1-result-actions');
    var again = el('button', '', isTrainingSession() ? 'Nuevo entrenamiento' : 'Nuevo examen blanco');
    again.type = 'button';
    again.addEventListener('click', function () { removeSession(); showSetup(); });
    var sheet = el('button', '', 'Volver a la ficha ' + scope.label);
    sheet.type = 'button';
    sheet.addEventListener('click', function () { switchView('sheet'); });
    actions.appendChild(again); actions.appendChild(sheet); host.appendChild(actions);
    document.getElementById('p1ExamSetup').hidden = true;
    document.getElementById('p1ExamSession').hidden = true;
    host.hidden = false;
  }

  function finishExam() {
    if (!state.session || answeredTotal() !== state.session.items.length) return;
    state.session.completed = true;
    state.session.completedAt = new Date().toISOString();
    saveSession();
    renderResults();
    document.getElementById('p1ExamView').scrollIntoView({ block: 'start' });
  }

  function bind() {
    document.querySelectorAll('[data-p1-view]').forEach(function (button) {
      button.addEventListener('click', function () { switchView(button.dataset.p1View); });
    });
    document.querySelectorAll('input[name="p1-correction-mode"]').forEach(function (input) {
      input.addEventListener('change', updateStartButton);
    });
    document.getElementById('p1StartExam').addEventListener('click', startExam);
    document.getElementById('p1ResumeButton').addEventListener('click', function () { showSession(); });
    document.getElementById('p1PreviousQuestion').addEventListener('click', previousQuestion);
    document.getElementById('p1NextQuestion').addEventListener('click', nextQuestion);
    document.getElementById('p1FinishExam').addEventListener('click', finishExam);
    document.getElementById('p1ExitExam').addEventListener('click', function () { saveSession(); showSetup(); });
    window.addEventListener('hashchange', function () { activateScope(scopeKeyFromHash()); });
  }

  function init() {
    if (window.MedNykutoTeacherQuestionProfile && typeof window.MedNykutoTeacherQuestionProfile.apply === 'function') {
      window.MedNykutoTeacherQuestionProfile.apply();
    }
    practice = window.MedNykutoClassPractice || practice;
    applyScopeLabels();
    renderSubjectRail();
    renderExamFilters();
    renderSheet();
    updateStartButton();
    state.session = readSession();
    if (state.session && state.session.completed) renderResults();
    else showSetup();
    bind();
    document.documentElement.classList.add('p1-ready');
  }

  function createScopeApi(targetScope) {
    return {
      scope: targetScope,
      collectQuestions: function (subjectIds, shouldDedupe) {
        return collectQuestions(subjectIds, shouldDedupe, targetScope);
      },
      buildExam: function (options) {
        return buildExam(options, targetScope);
      },
      storageKey: storageKeyFor(targetScope),
      getSession: function () {
        return targetScope.id === scope.id ? state.session : readSessionFor(targetScope);
      },
      clearSession: function () { clearScopeSession(targetScope); },
      deduplication: function () {
        return deduplicationByScopeId[targetScope.id] || { raw: 0, unique: 0, removed: 0 };
      }
    };
  }

  flattenAcademicModel();

  var p1Api = createScopeApi(P1_SCOPE);
  var p2Api = P2_SCOPE ? createScopeApi(P2_SCOPE) : null;
  window.MedNykutoP1 = p1Api;
  if (p2Api) window.MedNykutoP2 = p2Api;
  window.MedNykutoPartialReview = {
    scopes: { p1: p1Api, p2: p2Api },
    getActiveScope: function () { return scope; },
    selectScope: function (key) {
      var selectedKey = key === 'p2' && P2_SCOPE ? 'p2' : 'p1';
      var targetHash = '#' + selectedKey;
      if (window.location.hash === targetHash) activateScope(selectedKey);
      else window.location.hash = targetHash;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
