(function () {
  'use strict';

  var model = window.MedNykutoAcademicModel;
  if (!model) return;

  var progressKey = 'med-nykuto-course-progress-v440';
  var activeLessonBySubject = {};
  var activeModeBySubject = {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(progressKey) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeProgress(value) {
    try { localStorage.setItem(progressKey, JSON.stringify(value)); }
    catch (error) {}
  }

  function flattenLessons(subjectModel) {
    var result = [];
    subjectModel.chapters.forEach(function (chapter) {
      chapter.lessons.forEach(function (lesson) {
        result.push({ chapter: chapter, lesson: lesson });
      });
    });
    return result;
  }

  function findLesson(subjectModel, lessonId) {
    return flattenLessons(subjectModel).find(function (entry) { return entry.lesson.id === lessonId; });
  }

  function statusLabel(status) {
    return {
      completed: 'Capítulo terminado',
      current: 'Capítulo en curso',
      confirmed: 'Clase confirmada',
      estimated: 'Fecha estimada',
      undated: 'Fecha por confirmar'
    }[status] || status;
  }

  function teacherAuditContent(teacher, lesson) {
    var wrap = el('div', 'lesson-teacher-audit');
    var intro = el('div', 'lesson-teacher-intro');
    intro.appendChild(el('span', '', teacher.subject));
    intro.appendChild(el('h3', '', 'Cómo estudiar con ' + teacher.name));
    intro.appendChild(el('p', '', teacher.confidenceReason));
    var link = el('a', '', 'Ver auditoría docente completa →');
    link.href = 'profesores.html#' + teacher.id;
    intro.appendChild(link);
    wrap.appendChild(intro);

    var grid = el('div', 'lesson-teacher-grid');
    [
      ['Recorrido esperado', teacher.reasoningPath],
      ['Señales de importancia', teacher.importanceSignals],
      ['Preguntas que conviene preparar', teacher.likelyExamTargets],
      ['Distractores permitidos', teacher.distractorPolicy]
    ].forEach(function (group) {
      var section = el('section');
      section.appendChild(el('h4', '', group[0]));
      var list = el('ul');
      group[1].forEach(function (item) { list.appendChild(el('li', '', item)); });
      section.appendChild(list);
      grid.appendChild(section);
    });
    wrap.appendChild(grid);

    var prompt = el('details', 'lesson-teacher-prompt');
    var summary = el('summary', '', 'Prompt personalizado para esta clase');
    prompt.appendChild(summary);
    prompt.appendChild(el('p', '', teacher.aiPrompt + ' Clase activa: «' + lesson.title + '» (' + lesson.dateLong + ').'));
    var limit = el('small', '', 'Límite: usar únicamente el contenido y las fuentes de esta fecha. Las hipótesis del perfil no se presentan como preguntas reales del docente.');
    prompt.appendChild(limit);
    wrap.appendChild(prompt);
    return wrap;
  }

  function wireLessonTabs(nav, panels) {
    var buttons = Array.prototype.slice.call(nav.querySelectorAll('[data-lesson-tab]'));
    function show(id, focus) {
      buttons.forEach(function (button) {
        var active = button.dataset.lessonTab === id;
        button.setAttribute('aria-selected', active ? 'true' : 'false');
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach(function (panel) { panel.hidden = panel.dataset.lessonTabPanel !== id; });
      if (focus) {
        var selected = nav.querySelector('[data-lesson-tab="' + id + '"]');
        if (selected) selected.focus();
      }
    }
    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () { show(button.dataset.lessonTab, false); });
      button.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        show(buttons[next].dataset.lessonTab, true);
      });
    });
    show('curso', false);
  }

  function narrativeCourse(narrative, entry, subjectModel) {
    var article = el('article', 'course-chapter-2026 notebook-course-flow');
    var header = el('header', 'notebook-course-intro');
    header.appendChild(el('span', '', subjectModel.label + ' · ' + entry.lesson.dateLong));
    header.appendChild(el('h3', '', narrative.title));
    header.appendChild(el('p', '', narrative.lead));
    article.appendChild(header);

    var index = el('nav', 'course-chapter-index notebook-course-index');
    index.setAttribute('aria-label', 'Índice del curso completo');
    var ol = el('ol');
    narrative.sections.forEach(function (section, sectionIndex) {
      var li = el('li');
      var link = el('a', '', section[0]);
      link.href = '#' + entry.lesson.id + '-section-' + (sectionIndex + 1);
      li.appendChild(link);
      ol.appendChild(li);
    });
    index.appendChild(ol);
    article.appendChild(index);

    var body = el('div', 'course-chapter-body');
    narrative.sections.forEach(function (section, sectionIndex) {
      var sectionNode = el('section', 'course-chapter-section');
      sectionNode.id = entry.lesson.id + '-section-' + (sectionIndex + 1);
      sectionNode.appendChild(el('p', 'course-chapter-step', String(sectionIndex + 1).padStart(2, '0') + ' · ' + section[0].toUpperCase()));
      sectionNode.appendChild(el('h4', '', section[1]));
      section.slice(2).forEach(function (paragraph) { sectionNode.appendChild(el('p', '', paragraph)); });
      body.appendChild(sectionNode);
    });
    article.appendChild(body);
    return article;
  }

  function summaryPanel(narrative, ultra) {
    var panel = el('div', ultra ? 'notebook-ultra' : 'notebook-summary');
    panel.appendChild(el('h3', '', ultra ? 'La clase en un vistazo' : 'Hilo lógico de la clase'));
    panel.appendChild(el('p', '', ultra ? 'Para recordar antes de un QCM.' : narrative.lead));
    var list = el(ultra ? 'ul' : 'ol');
    narrative.sections.forEach(function (section) {
      var item = el('li');
      item.appendChild(el('strong', '', section[0] + ' · ' + section[1]));
      if (!ultra) item.appendChild(el('p', '', section[2]));
      list.appendChild(item);
    });
    panel.appendChild(list);
    return panel;
  }

  function buildLegacyLesson(panel, narrative, entry, subjectModel, teacher) {
    var original = el('div', 'notebook-original-material');
    Array.prototype.slice.call(panel.children).forEach(function (child) { original.appendChild(child); });
    var practice = original.querySelector('.practice-module[data-practice-root="' + entry.lesson.practiceId + '"]') || original.querySelector('.practice-module');

    var head = el('header', 'notebook-lesson-head');
    head.appendChild(el('span', '', subjectModel.label + ' · ' + entry.lesson.dateLong));
    head.appendChild(el('h3', '', narrative.title));
    head.appendChild(el('p', '', narrative.lead));

    var nav = el('nav', 'lesson-section-tabs notebook-lesson-tabs');
    nav.dataset.lessonTabs = '';
    nav.setAttribute('aria-label', 'Formatos de la clase');
    var definitions = [
      ['curso', 'Curso completo'],
      ['rapido', 'Resumen'],
      ['ultra', 'Ultra'],
      ['training', 'QCM'],
      ['material', 'Archivos'],
      ['ia', 'Docente + IA']
    ];
    definitions.forEach(function (definition, index) {
      var button = el('button', '', definition[1]);
      button.type = 'button';
      button.dataset.lessonTab = definition[0];
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      nav.appendChild(button);
    });

    var panels = [];
    function tabPanel(id, content) {
      var tab = el('section', id === 'curso' ? 'lesson-tab-panel course-chapter-2026' : 'lesson-tab-panel');
      tab.dataset.lessonTabPanel = id;
      if (id !== 'curso') tab.hidden = true;
      tab.appendChild(content);
      panels.push(tab);
      return tab;
    }

    panel.replaceChildren(head, nav);
    panel.appendChild(tabPanel('curso', narrativeCourse(narrative, entry, subjectModel)));
    panel.appendChild(tabPanel('rapido', summaryPanel(narrative, false)));
    panel.appendChild(tabPanel('ultra', summaryPanel(narrative, true)));

    var training = el('div', 'notebook-training');
    if (practice) training.appendChild(practice);
    else training.appendChild(el('p', 'notebook-empty', 'El entrenamiento de esta clase todavía no está disponible.'));
    panel.appendChild(tabPanel('training', training));

    var material = el('div', 'notebook-material');
    material.appendChild(el('p', 'notebook-material-intro', 'Material original, pizarras, correcciones y referencias conservados sin mezclar fechas.'));
    material.appendChild(original);
    panel.appendChild(tabPanel('material', material));
    panel.appendChild(tabPanel('ia', teacherAuditContent(teacher, entry.lesson)));
    panel.dataset.notebookNarrative = 'true';
    wireLessonTabs(nav, panels);
  }

  function enhanceNarrativeLesson(panel, entry, teacher) {
    var nav = panel.querySelector('[data-lesson-tabs]');
    if (nav) {
      var labels = ['Curso completo', 'Resumen', 'Ultra', 'QCM', 'Archivos', 'Docente + IA'];
      nav.querySelectorAll('[data-lesson-tab]').forEach(function (button, index) {
        if (labels[index]) button.textContent = labels[index];
      });
    }
    var ia = panel.querySelector('[data-lesson-tab-panel="ia"]');
    if (ia) ia.replaceChildren(teacherAuditContent(teacher, entry.lesson));
    panel.dataset.notebookNarrative = 'true';
  }

  function collectFiles(subject) {
    var seen = {};
    return Array.prototype.slice.call(subject.querySelectorAll('a[href]')).map(function (link) {
      var href = link.getAttribute('href') || '';
      if (!/\.(?:pdf|pptx|docx)(?:$|[?#])/i.test(href) || seen[href]) return null;
      seen[href] = true;
      var name = href.split('?')[0].split('#')[0].split('/').pop();
      try { name = decodeURIComponent(name); } catch (error) {}
      var label = (link.textContent || '').trim();
      if (!label || /^(abrir|descargar|ver)/i.test(label)) label = name;
      return { href: href, label: label, type: (name.split('.').pop() || 'archivo').toUpperCase() };
    }).filter(Boolean);
  }

  function renderThemes(panel, subjectModel, selectLesson) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'MAPA DEL CURSO'));
    header.appendChild(el('h3', '', 'Temas por capítulo'));
    panel.appendChild(header);
    var list = el('div', 'notebook-chapter-list');
    subjectModel.chapters.forEach(function (chapter) {
      var group = el('section', 'notebook-chapter-row');
      var heading = el('div');
      heading.appendChild(el('span', '', 'CAP. ' + chapter.number + ' · ' + statusLabel(chapter.status).toUpperCase()));
      heading.appendChild(el('strong', '', chapter.title));
      group.appendChild(heading);
      var lessons = el('div');
      chapter.lessons.forEach(function (lesson) {
        var button = el('button');
        button.type = 'button';
        button.appendChild(el('time', '', lesson.date));
        button.appendChild(el('span', '', lesson.title));
        button.addEventListener('click', function () { selectLesson(lesson.id, true); });
        lessons.appendChild(button);
      });
      group.appendChild(lessons);
      list.appendChild(group);
    });
    panel.appendChild(list);
  }

  function renderFiles(panel, files) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'DOCUMENTOS DE LA MATERIA'));
    header.appendChild(el('h3', '', 'Archivos'));
    panel.appendChild(header);
    var list = el('div', 'notebook-file-list');
    if (!files.length) list.appendChild(el('p', 'notebook-empty', 'No hay archivos descargables en esta materia.'));
    files.forEach(function (file) {
      var row = el('a', 'notebook-file-row');
      row.href = file.href;
      row.target = '_blank';
      row.rel = 'noopener';
      row.appendChild(el('span', '', file.type));
      row.appendChild(el('strong', '', file.label));
      row.appendChild(el('b', '', '↗'));
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  function renderProgress(panel, subjectId, subjectModel) {
    panel.replaceChildren();
    var header = el('header', 'notebook-view-head');
    header.appendChild(el('span', '', 'SEGUIMIENTO PERSONAL'));
    header.appendChild(el('h3', '', 'Progreso del cuaderno'));
    panel.appendChild(header);
    var state = readProgress();
    var subjectState = state[subjectId] || {};
    var flat = flattenLessons(subjectModel);
    var summary = el('p', 'notebook-progress-summary');
    var meter = el('div', 'notebook-progress-meter');
    meter.appendChild(el('i'));
    panel.appendChild(summary);
    panel.appendChild(meter);
    var list = el('div', 'notebook-progress-list');
    function refresh() {
      var done = flat.filter(function (entry) { return Boolean(subjectState[entry.lesson.id]); }).length;
      summary.textContent = done + ' de ' + flat.length + ' clases revisadas';
      meter.firstChild.style.width = Math.round((done / flat.length) * 100) + '%';
      state[subjectId] = subjectState;
      writeProgress(state);
    }
    subjectModel.chapters.forEach(function (chapter) {
      var chapterLabel = el('span', 'notebook-progress-chapter', 'CAP. ' + chapter.number + ' · ' + chapter.title);
      list.appendChild(chapterLabel);
      chapter.lessons.forEach(function (lesson) {
        var row = el('label', 'notebook-progress-row');
        var checkbox = el('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(subjectState[lesson.id]);
        var copy = el('span');
        copy.appendChild(el('strong', '', lesson.date + ' · ' + lesson.title));
        copy.appendChild(el('small', '', checkbox.checked ? 'Revisada' : 'Pendiente'));
        checkbox.addEventListener('change', function () {
          subjectState[lesson.id] = checkbox.checked;
          copy.querySelector('small').textContent = checkbox.checked ? 'Revisada' : 'Pendiente';
          refresh();
        });
        row.appendChild(checkbox);
        row.appendChild(copy);
        list.appendChild(row);
      });
    });
    panel.appendChild(list);
    refresh();
  }

  function prepareNutrition(subject) {
    if (document.getElementById('nutricion-2026-08-13')) return;
    var panel = el('div', 'dated-lesson-panel lesson-notebook-generated');
    panel.id = 'nutricion-2026-08-13';
    panel.dataset.lessonPanel = panel.id;
    panel.dataset.lessonTitle = 'Leyes de la alimentación y evaluación del paciente';
    var excluded = ['subject-heading', 'class-history', 'course-workspace', 'course-workspace-panel'];
    Array.prototype.slice.call(subject.children).forEach(function (child) {
      if (!excluded.some(function (name) { return child.classList.contains(name); })) panel.appendChild(child);
    });
    subject.appendChild(panel);
  }

  function initSubject(subjectId) {
    var subject = document.getElementById(subjectId);
    var subjectModel = model.subjects[subjectId];
    if (!subject || !subjectModel) return;

    subject.querySelectorAll(':scope > .course-workspace, :scope > .course-workspace-panel').forEach(function (node) { node.remove(); });
    if (subjectId === 'nutricion') prepareNutrition(subject);
    var files = collectFiles(subject);
    var flat = flattenLessons(subjectModel);
    var teacher = model.teachers[subjectModel.teacherId];

    flat.forEach(function (entry) {
      var panel = document.getElementById(entry.lesson.id);
      if (!panel) return;
      var narrative = model.narratives[entry.lesson.id];
      if (narrative) buildLegacyLesson(panel, narrative, entry, subjectModel, teacher);
      else enhanceNarrativeLesson(panel, entry, teacher);
    });

    var heading = subject.querySelector(':scope > .subject-heading');
    var historyStrip = subject.querySelector(':scope > .class-history');
    if (historyStrip) historyStrip.hidden = true;

    var shell = el('section', 'notebook-shell');
    shell.setAttribute('aria-label', 'Cuaderno cronológico de ' + subjectModel.label);
    var cover = el('header', 'notebook-cover');
    var coverCopy = el('div');
    coverCopy.appendChild(el('span', 'notebook-kicker', subjectModel.label));
    coverCopy.appendChild(el('h2', '', 'Cuaderno'));
    coverCopy.appendChild(el('p', 'notebook-current-title', ''));
    var chapterStatus = el('div', 'notebook-chapter-current');
    cover.appendChild(coverCopy);
    cover.appendChild(chapterStatus);
    shell.appendChild(cover);

    var modes = el('nav', 'notebook-modes');
    modes.setAttribute('aria-label', 'Vistas de la materia');
    [['cuaderno', 'Cuaderno'], ['temas', 'Temas'], ['archivos', 'Archivos'], ['progreso', 'Progreso']].forEach(function (mode) {
      var button = el('button', '', mode[1]);
      button.type = 'button';
      button.dataset.notebookMode = mode[0];
      button.setAttribute('aria-selected', mode[0] === 'cuaderno' ? 'true' : 'false');
      modes.appendChild(button);
    });
    shell.appendChild(modes);

    var dateControls = el('div', 'notebook-date-controls');
    var previous = el('button', 'notebook-date-arrow', '‹');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Clase anterior');
    var rail = el('div', 'notebook-date-rail');
    var next = el('button', 'notebook-date-arrow', '›');
    next.type = 'button';
    next.setAttribute('aria-label', 'Clase siguiente');
    dateControls.appendChild(previous);
    dateControls.appendChild(rail);
    dateControls.appendChild(next);
    shell.appendChild(dateControls);

    flat.forEach(function (entry) {
      var button = el('button', 'notebook-date');
      button.type = 'button';
      button.dataset.lessonId = entry.lesson.id;
      button.appendChild(el('small', '', 'CAP. ' + entry.chapter.number));
      button.appendChild(el('strong', '', entry.lesson.date));
      button.setAttribute('aria-label', entry.lesson.dateLong + ' · ' + entry.lesson.title);
      rail.appendChild(button);
    });

    var viewPanel = el('section', 'notebook-view-panel');
    viewPanel.hidden = true;
    if (heading) heading.insertAdjacentElement('afterend', shell);
    else subject.prepend(shell);
    shell.insertAdjacentElement('afterend', viewPanel);

    Array.prototype.slice.call(subject.children).forEach(function (child) {
      if (child === heading || child === shell || child === viewPanel || child.hasAttribute('data-lesson-panel')) return;
      child.hidden = true;
      child.dataset.notebookLegacy = 'true';
    });

    function showLesson(lessonId, updateHash) {
      var selected = findLesson(subjectModel, lessonId) || flat[flat.length - 1];
      if (!selected) return;
      activeLessonBySubject[subjectId] = selected.lesson.id;
      subject.querySelectorAll(':scope > [data-lesson-panel]').forEach(function (panel) {
        panel.hidden = panel.id !== selected.lesson.id || activeModeBySubject[subjectId] !== 'cuaderno';
      });
      rail.querySelectorAll('.notebook-date').forEach(function (button) {
        var active = button.dataset.lessonId === selected.lesson.id;
        button.setAttribute('aria-current', active ? 'date' : 'false');
        if (active) button.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
      cover.querySelector('.notebook-current-title').textContent = selected.lesson.dateLong + ' · ' + selected.lesson.title;
      chapterStatus.replaceChildren();
      chapterStatus.appendChild(el('span', '', 'CAPÍTULO ' + selected.chapter.number));
      chapterStatus.appendChild(el('strong', '', selected.chapter.title));
      chapterStatus.appendChild(el('small', 'chapter-state chapter-state-' + selected.chapter.status, statusLabel(selected.chapter.status)));
      var index = flat.findIndex(function (entry) { return entry.lesson.id === selected.lesson.id; });
      previous.disabled = index <= 0;
      next.disabled = index >= flat.length - 1;
      if (updateHash) window.history.replaceState(null, '', '#' + selected.lesson.id);
    }

    function activateMode(mode) {
      activeModeBySubject[subjectId] = mode;
      modes.querySelectorAll('button').forEach(function (button) {
        button.setAttribute('aria-selected', button.dataset.notebookMode === mode ? 'true' : 'false');
      });
      dateControls.hidden = mode !== 'cuaderno';
      viewPanel.hidden = mode === 'cuaderno';
      subject.querySelectorAll(':scope > [data-lesson-panel]').forEach(function (panel) { panel.hidden = true; });
      if (mode === 'cuaderno') showLesson(activeLessonBySubject[subjectId], false);
      if (mode === 'temas') renderThemes(viewPanel, subjectModel, function (lessonId) { activateMode('cuaderno'); showLesson(lessonId, true); });
      if (mode === 'archivos') renderFiles(viewPanel, files);
      if (mode === 'progreso') renderProgress(viewPanel, subjectId, subjectModel);
    }

    rail.querySelectorAll('.notebook-date').forEach(function (button) {
      button.addEventListener('click', function () { activateMode('cuaderno'); showLesson(button.dataset.lessonId, true); });
    });
    previous.addEventListener('click', function () {
      var index = flat.findIndex(function (entry) { return entry.lesson.id === activeLessonBySubject[subjectId]; });
      if (index > 0) showLesson(flat[index - 1].lesson.id, true);
    });
    next.addEventListener('click', function () {
      var index = flat.findIndex(function (entry) { return entry.lesson.id === activeLessonBySubject[subjectId]; });
      if (index < flat.length - 1) showLesson(flat[index + 1].lesson.id, true);
    });
    modes.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('click', function () { activateMode(button.dataset.notebookMode); });
    });

    var hashLesson = findLesson(subjectModel, window.location.hash.slice(1));
    activeModeBySubject[subjectId] = 'cuaderno';
    showLesson(hashLesson ? hashLesson.lesson.id : flat[flat.length - 1].lesson.id, false);
    subject.classList.add('notebook-ready');
    if (window.MedNykutoClassI18n && typeof window.MedNykutoClassI18n.refresh === 'function') window.MedNykutoClassI18n.refresh(subject);
  }

  function syncHash() {
    var lessonId = window.location.hash.slice(1);
    Object.keys(model.subjects).some(function (subjectId) {
      var entry = findLesson(model.subjects[subjectId], lessonId);
      if (!entry) return false;
      var subject = document.getElementById(subjectId);
      if (!subject || !subject.classList.contains('notebook-ready')) return true;
      var date = subject.querySelector('.notebook-date[data-lesson-id="' + lessonId + '"]');
      if (date) date.click();
      return true;
    });
  }

  function revealSubject(subject) {
    document.querySelectorAll('[data-view]').forEach(function (panel) {
      panel.hidden = panel.dataset.view !== 'cursos';
    });
    var hub = document.getElementById('materias');
    if (hub) hub.hidden = false;
    document.querySelectorAll('.subject-section[data-view="cursos"]').forEach(function (section) {
      section.hidden = section !== subject;
    });
    document.querySelectorAll('[data-view-link]').forEach(function (link) {
      if (link.dataset.viewLink === 'cursos') link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-course-target]').forEach(function (link) {
      link.setAttribute('aria-current', link.dataset.courseTarget === subject.id ? 'true' : 'false');
    });
    document.body.dataset.activeView = 'cursos';
  }

  function revealDeepTarget() {
    var hashId = window.location.hash.slice(1);
    if (!hashId) return;
    var target = document.getElementById(hashId);
    if (!target) return;
    var lessonPanel = target.closest('[data-lesson-panel]');
    var subject = target.closest('.subject-section');
    if (!lessonPanel || !subject || !subject.classList.contains('notebook-ready')) return;
    revealSubject(subject);
    var date = subject.querySelector('.notebook-date[data-lesson-id="' + lessonPanel.id + '"]');
    if (date) date.click();
    var tab = 'curso';
    if (target.closest('.notebook-original-material')) tab = 'material';
    if (target.closest('.practice-module')) tab = 'training';
    var tabButton = lessonPanel.querySelector('[data-lesson-tab="' + tab + '"]');
    if (tabButton) tabButton.click();
    var legacyDetail = target.matches('[data-course-detail]') ? target : target.closest('[data-course-detail]');
    if (legacyDetail) {
      legacyDetail.hidden = false;
      var legacyToggle = lessonPanel.querySelector('[data-detail-toggle][aria-controls="' + legacyDetail.id + '"]');
      if (legacyToggle) legacyToggle.setAttribute('aria-expanded', 'true');
    }
    window.history.replaceState(null, '', '#' + hashId);
    window.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start', inline: 'nearest' }); });
  }

  function handleHash() {
    syncHash();
    revealDeepTarget();
  }

  function init() {
    Object.keys(model.subjects).forEach(initSubject);
    window.addEventListener('hashchange', handleHash);
    document.documentElement.classList.add('academic-notebook-ready');
    revealDeepTarget();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
