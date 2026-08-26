const SUBJECT_ALIASES = Object.freeze({
  'bioquimica-ii': 'bioquimica',
  'epidemiologia-salud-publica': 'epidemiologia',
  'fisiologia-ii': 'fisiologia',
  'microbiologia-ii-teorica': 'microbiologia-teorica',
  'microbiologia-ii-practica': 'microbiologia-practica',
  nutricion: 'nutricion'
});

const SUBJECT_ICONS = Object.freeze({
  bioquimica: 'class-icon-biochemistry',
  epidemiologia: 'class-icon-epidemiology',
  fisiologia: 'class-icon-physiology',
  'microbiologia-teorica': 'class-icon-microbiology',
  'microbiologia-practica': 'class-icon-lab',
  nutricion: 'class-icon-nutrition'
});

const MONTHS = Object.freeze({
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12
});

const SHORT_MONTHS = Object.freeze([
  '', 'ENE.', 'FEB.', 'MAR.', 'ABR.', 'MAY.', 'JUN.',
  'JUL.', 'AGO.', 'SEP.', 'OCT.', 'NOV.', 'DIC.'
]);

const EXPECTED_PRACTICE_COUNTS = Object.freeze({ qcm: 20, vf: 10, cases: 10 });

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function cleanString(value, maximum = 0) {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/\u0000/g, '').trim();
  return maximum > 0 ? cleaned.slice(0, maximum) : cleaned;
}

function cleanMarkdown(value) {
  return typeof value === 'string'
    ? value.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim()
    : '';
}

function safeToken(value, maximum = 48) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    .slice(0, maximum);
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function dateParts(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return { year, month, day };
}

function shortDate(isoDate) {
  const parts = dateParts(isoDate);
  return `${String(parts.day).padStart(2, '0')} ${SHORT_MONTHS[parts.month]}`;
}

function longDate(isoDate) {
  const parts = dateParts(isoDate);
  const month = Object.keys(MONTHS).find((name) => MONTHS[name] === parts.month) || '';
  return `${parts.day} de ${month} de ${parts.year}`;
}

function lessonIsoDate(lesson) {
  if (validIsoDate(lesson && lesson.lessonDate)) return lesson.lessonDate;
  const idMatch = String(lesson && lesson.id || '').match(/(20\d{2}-\d{2}-\d{2})/);
  if (idMatch && validIsoDate(idMatch[1])) return idMatch[1];
  const longMatch = String(lesson && lesson.dateLong || '').toLowerCase()
    .match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(20\d{2})/);
  if (!longMatch) return '';
  const foldedMonth = longMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const month = MONTHS[foldedMonth];
  if (!month) return '';
  const isoDate = `${longMatch[3]}-${String(month).padStart(2, '0')}-${String(Number(longMatch[1])).padStart(2, '0')}`;
  return validIsoDate(isoDate) ? isoDate : '';
}

function safeHref(value) {
  const href = cleanString(value, 1200);
  if (!href) return '';
  try {
    const parsed = new URL(href, document.baseURI);
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return '';
    return href;
  } catch (error) {
    return '';
  }
}

function appendInline(parent, value) {
  const source = String(value || '');
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^\)\n]+\))/g;
  let cursor = 0;
  let match;
  while ((match = pattern.exec(source))) {
    if (match.index > cursor) parent.appendChild(document.createTextNode(source.slice(cursor, match.index)));
    const token = match[0];
    if (token.startsWith('`')) {
      parent.appendChild(node('code', '', token.slice(1, -1)));
    } else if (token.startsWith('**')) {
      parent.appendChild(node('strong', '', token.slice(2, -2)));
    } else if (token.startsWith('*')) {
      parent.appendChild(node('em', '', token.slice(1, -1)));
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = linkMatch && safeHref(linkMatch[2]);
      if (linkMatch && href) {
        const link = node('a', '', linkMatch[1]);
        link.href = href;
        if (/^https?:/i.test(href)) {
          link.target = '_blank';
          link.rel = 'noopener';
        }
        parent.appendChild(link);
      } else {
        parent.appendChild(document.createTextNode(token));
      }
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < source.length) parent.appendChild(document.createTextNode(source.slice(cursor)));
}

function tableCells(line) {
  let value = line.trim();
  if (value.startsWith('|')) value = value.slice(1);
  if (value.endsWith('|')) value = value.slice(0, -1);
  return value.split('|').map((cell) => cell.trim());
}

function isTableSeparator(line) {
  const cells = tableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockStart(lines, index) {
  const line = lines[index] || '';
  const next = lines[index + 1] || '';
  return /^\s*(?:#{1,6}\s+|```|~~~|[-*+]\s+|\d+[.)]\s+|>\s?|(?:-{3,}|\*{3,}|_{3,})\s*$)/.test(line)
    || (line.includes('|') && isTableSeparator(next));
}

function markdownFragment(markdown) {
  const root = node('div', 'managed-markdown');
  const lines = cleanMarkdown(markdown).split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^\s*(```|~~~)(.*)$/);
    if (fence) {
      const marker = fence[1];
      const language = safeToken(fence[2], 30);
      const body = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${marker}`).test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      const pre = node('pre');
      const code = node('code', language ? `language-${language}` : '', body.join('\n'));
      pre.appendChild(code);
      root.appendChild(pre);
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 2);
      const title = node(`h${level}`);
      appendInline(title, heading[2]);
      root.appendChild(title);
      index += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      root.appendChild(node('hr'));
      index += 1;
      continue;
    }

    if (line.includes('|') && isTableSeparator(lines[index + 1] || '')) {
      const table = node('table');
      const head = node('thead');
      const headRow = node('tr');
      tableCells(line).forEach((cell) => {
        const headingCell = node('th');
        appendInline(headingCell, cell);
        headRow.appendChild(headingCell);
      });
      head.appendChild(headRow);
      table.appendChild(head);
      const body = node('tbody');
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
        const row = node('tr');
        tableCells(lines[index]).forEach((cell) => {
          const dataCell = node('td');
          appendInline(dataCell, cell);
          row.appendChild(dataCell);
        });
        body.appendChild(row);
        index += 1;
      }
      table.appendChild(body);
      const scroll = node('div', 'managed-markdown-table');
      scroll.appendChild(table);
      root.appendChild(scroll);
      continue;
    }

    const listMatch = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const list = node(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
        if (!itemMatch || /^\d/.test(itemMatch[1]) !== ordered) break;
        const item = node('li');
        appendInline(item, itemMatch[2]);
        list.appendChild(item);
        index += 1;
      }
      root.appendChild(list);
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      const quote = node('blockquote');
      appendInline(quote, quoteLines.join(' '));
      root.appendChild(quote);
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    const paragraph = node('p');
    appendInline(paragraph, paragraphLines.join(' '));
    root.appendChild(paragraph);
  }

  return root;
}

function answerIndex(question, type, optionCount) {
  const candidates = [question.answer, question.answerIndex, question.correctIndex];
  const integer = candidates.find((value) => Number.isInteger(value));
  if (Number.isInteger(integer) && integer >= 0 && integer < optionCount) return integer;
  if (type === 'vf' && typeof question.correct === 'boolean') return question.correct ? 0 : 1;
  if (type === 'vf' && /^(true|verdadero)$/i.test(String(question.correct || ''))) return 0;
  if (type === 'vf' && /^(false|falso)$/i.test(String(question.correct || ''))) return 1;
  const letter = String(question.correct || '').trim().toUpperCase();
  if (/^[A-D]$/.test(letter)) {
    const converted = letter.charCodeAt(0) - 65;
    return converted < optionCount ? converted : -1;
  }
  return -1;
}

function normalizeQuestion(raw, type, lessonId, position) {
  if (!raw || typeof raw !== 'object') return null;
  const prompt = cleanString(raw.prompt || raw.question || raw.statement, 4000);
  const explanation = cleanString(raw.explanation, 10000);
  const scenario = type === 'cases' ? cleanString(raw.scenario || raw.stem, 8000) : '';
  const options = type === 'vf'
    ? ['Verdadero', 'Falso']
    : (Array.isArray(raw.options) ? raw.options.map((option) => cleanString(option, 3000)) : []);
  const expectedOptions = type === 'vf' ? 2 : 4;
  const correct = answerIndex(raw, type, options.length);
  if (!prompt || !explanation || (type === 'cases' && !scenario)) return null;
  if (options.length !== expectedOptions || options.some((option) => !option)) return null;
  if (new Set(options).size !== options.length || correct < 0) return null;
  const question = {
    id: cleanString(raw.id, 160) || `${lessonId}:${type}:${String(position + 1).padStart(2, '0')}`,
    prompt,
    options,
    answer: correct,
    explanation,
    grounding: 'course-only-managed-v483',
    sourceAnchor: `#${lessonId}`,
    academicLessonId: lessonId
  };
  if (scenario) question.scenario = scenario;
  if (type === 'qcm') question.questionKind = cleanString(raw.questionKind, 30) || 'direct';
  question.learningAngle = cleanString(raw.learningAngle, 60)
    || (type === 'vf' ? 'verification' : (type === 'cases' ? 'clinical-integration' : question.questionKind));
  return question;
}

function normalizePractice(raw, lessonId) {
  if (!raw || typeof raw !== 'object') return null;
  const sourceArrays = {
    qcm: raw.qcm,
    vf: raw.trueFalse,
    cases: raw.clinicalCases
  };
  const result = {};
  for (const type of Object.keys(sourceArrays)) {
    const rows = sourceArrays[type];
    if (!Array.isArray(rows) || rows.length !== EXPECTED_PRACTICE_COUNTS[type]) return null;
    result[type] = rows.map((question, index) => normalizeQuestion(question, type, lessonId, index));
    if (result[type].some((question) => !question)) return null;
  }
  return result;
}

function normalizeLesson(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.status && raw.status !== 'published') return null;
  const uiSubjectId = SUBJECT_ALIASES[cleanString(raw.subjectId, 80)];
  const lessonDate = cleanString(raw.lessonDate, 10);
  const title = cleanString(raw.title, 240);
  const description = cleanString(raw.description, 1200);
  const fullMarkdown = cleanMarkdown(raw.fullMarkdown || raw.full);
  const quickMarkdown = cleanMarkdown(raw.quickMarkdown || raw.quick);
  const ultraMarkdown = cleanMarkdown(raw.ultraMarkdown || raw.ultra);
  if (!uiSubjectId || !validIsoDate(lessonDate) || !title) return null;
  if (!fullMarkdown || !quickMarkdown || !ultraMarkdown) return null;
  if (raw.practiceRevision === undefined || raw.practiceRevision === null) return null;
  return {
    apiId: cleanString(raw.id, 160),
    uiSubjectId,
    lessonDate,
    title,
    description,
    fullMarkdown,
    quickMarkdown,
    ultraMarkdown,
    practiceRevision: String(raw.practiceRevision),
    practice: raw.practice
  };
}

function findLessonByDate(subjectModel, lessonDate) {
  for (const chapter of subjectModel.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      if (lessonIsoDate(lesson) === lessonDate) return { chapter, lesson };
    }
  }
  return null;
}

function uniqueDomId(preferred) {
  const base = safeToken(preferred, 72) || 'managed-lesson';
  if (!document.getElementById(base)) return base;
  let suffix = 2;
  while (document.getElementById(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function managedContent(markdown, className) {
  const wrap = node('div', className);
  wrap.dataset.managedMarkdown = 'true';
  wrap.appendChild(markdownFragment(markdown));
  return wrap;
}

function wireManagedLessonTabs(panel, nav) {
  const buttons = Array.from(nav.querySelectorAll('[data-lesson-tab]'));
  const panels = Array.from(panel.querySelectorAll(':scope > [data-lesson-tab-panel]'));
  const panelById = new Map(panels.map((tabPanel) => [tabPanel.dataset.lessonTabPanel, tabPanel]));

  nav.setAttribute('role', 'tablist');

  function show(id, focus) {
    if (!panelById.has(id)) return;
    buttons.forEach((button) => {
      const active = button.dataset.lessonTab === id;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach((tabPanel) => {
      tabPanel.hidden = tabPanel.dataset.lessonTabPanel !== id;
    });
    if (focus) {
      const selected = buttons.find((button) => button.dataset.lessonTab === id);
      if (selected) selected.focus({ preventScroll: true });
    }
  }

  buttons.forEach((button, index) => {
    const id = button.dataset.lessonTab;
    const tabPanel = panelById.get(id);
    if (!id || !tabPanel) return;
    const tabId = `${panel.id}-tab-${id}`;
    const tabPanelId = `${panel.id}-panel-${id}`;
    button.id = tabId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', tabPanelId);
    tabPanel.id = tabPanelId;
    tabPanel.setAttribute('role', 'tabpanel');
    tabPanel.setAttribute('aria-labelledby', tabId);
    button.addEventListener('click', () => show(id, false));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      show(buttons[next].dataset.lessonTab, true);
    });
  });

  const selected = buttons.find((button) => button.getAttribute('aria-selected') === 'true');
  show(selected ? selected.dataset.lessonTab : buttons[0] && buttons[0].dataset.lessonTab, false);
}

function createManagedPanel(lesson, lessonId, practiceId, subjectLabel) {
  const panel = node('div', 'dated-lesson-panel lesson-notebook-generated');
  panel.id = lessonId;
  panel.dataset.lessonPanel = lessonId;
  panel.dataset.lessonTitle = lesson.title;
  panel.dataset.lessonDate = lesson.lessonDate;
  panel.dataset.managedLesson = 'true';
  panel.dataset.managedSourceId = lesson.apiId || lessonId;

  const nav = node('nav', 'lesson-section-tabs notebook-lesson-tabs');
  nav.dataset.lessonTabs = '';
  nav.setAttribute('aria-label', 'Formatos de la clase');
  [
    ['curso', 'Curso completo'],
    ['rapida', 'Ficha rápida'],
    ['ultra', 'Ficha ultra rápida'],
    ['training', 'Entrenamiento'],
    ['ia', 'Recursos IA']
  ].forEach(([id, label], index) => {
    const button = node('button', '', label);
    button.type = 'button';
    button.dataset.lessonTab = id;
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    nav.appendChild(button);
  });
  panel.appendChild(nav);

  const coursePanel = node('section', 'lesson-tab-panel course-chapter-2026');
  coursePanel.dataset.lessonTabPanel = 'curso';
  const course = node('article', 'notebook-course-flow notebook-managed-course');
  const courseHeader = node('header', 'notebook-course-intro');
  courseHeader.appendChild(node('span', '', `${subjectLabel} · ${longDate(lesson.lessonDate)}`));
  courseHeader.appendChild(node('h3', '', lesson.title));
  if (lesson.description) courseHeader.appendChild(node('p', '', lesson.description));
  course.appendChild(courseHeader);
  course.appendChild(managedContent(lesson.fullMarkdown, 'course-chapter-body notebook-managed-markdown'));
  coursePanel.appendChild(course);
  panel.appendChild(coursePanel);

  const quickPanel = node('section', 'lesson-tab-panel');
  quickPanel.dataset.lessonTabPanel = 'rapida';
  quickPanel.hidden = true;
  quickPanel.appendChild(managedContent(lesson.quickMarkdown, 'notebook-summary notebook-managed-markdown'));
  panel.appendChild(quickPanel);

  const ultraPanel = node('section', 'lesson-tab-panel');
  ultraPanel.dataset.lessonTabPanel = 'ultra';
  ultraPanel.hidden = true;
  ultraPanel.appendChild(managedContent(lesson.ultraMarkdown, 'notebook-ultra notebook-managed-markdown'));
  panel.appendChild(ultraPanel);

  const trainingPanel = node('section', 'lesson-tab-panel');
  trainingPanel.dataset.lessonTabPanel = 'training';
  trainingPanel.hidden = true;
  const trainingHeader = node('header');
  trainingHeader.appendChild(node('span', '', 'ENTRENAMIENTO'));
  trainingHeader.appendChild(node('h3', '', '40 preguntas de esta clase'));
  trainingPanel.appendChild(trainingHeader);
  const practiceSlot = node('div');
  practiceSlot.dataset.practiceSlot = practiceId;
  trainingPanel.appendChild(practiceSlot);
  panel.appendChild(trainingPanel);

  const aiPanel = node('section', 'lesson-tab-panel');
  aiPanel.dataset.lessonTabPanel = 'ia';
  aiPanel.hidden = true;
  aiPanel.appendChild(node('p', 'notebook-empty', 'Los recursos de estudio se adaptan a esta clase publicada.'));
  panel.appendChild(aiPanel);

  const practiceAnchor = node('button');
  practiceAnchor.type = 'button';
  practiceAnchor.hidden = true;
  practiceAnchor.dataset.detailToggle = '';
  practiceAnchor.dataset.managedPracticeAnchor = '';
  practiceAnchor.setAttribute('aria-controls', `${lessonId}-managed-practice-anchor`);
  practiceAnchor.setAttribute('aria-expanded', 'false');
  panel.appendChild(practiceAnchor);
  wireManagedLessonTabs(panel, nav);
  return panel;
}

function preserveStaticPanel(existingPanel, managedPanel, lessonId) {
  if (!existingPanel) return false;
  if (existingPanel.dataset.managedLesson === 'true') {
    existingPanel.replaceWith(managedPanel);
    return true;
  }
  existingPanel.id = uniqueDomId(`${lessonId}-static-source-v483`);
  existingPanel.removeAttribute('data-lesson-panel');
  existingPanel.dataset.managedStaticSourceFor = lessonId;
  existingPanel.dataset.notebookPersistent = '';
  existingPanel.hidden = true;
  existingPanel.setAttribute('aria-hidden', 'true');
  existingPanel.before(managedPanel);
  return true;
}

function currentChapter(subjectModel) {
  if (!Array.isArray(subjectModel.chapters)) subjectModel.chapters = [];
  let chapter = subjectModel.chapters.find((candidate) => candidate.status === 'current');
  if (!chapter) chapter = subjectModel.chapters[subjectModel.chapters.length - 1];
  if (!chapter) {
    chapter = { id: 'clases-publicadas', number: 1, title: 'Clases publicadas', status: 'current', lessons: [] };
    subjectModel.chapters.push(chapter);
  }
  if (!Array.isArray(chapter.lessons)) chapter.lessons = [];
  return chapter;
}

function sortChapterLessons(chapter) {
  chapter.lessons.sort((left, right) => {
    const leftDate = lessonIsoDate(left);
    const rightDate = lessonIsoDate(right);
    if (!leftDate || !rightDate) return 0;
    return leftDate.localeCompare(rightDate) || String(left.id).localeCompare(String(right.id));
  });
}

function buildPracticeBank(lesson, lessonId, practiceId, previousBank) {
  const questions = normalizePractice(lesson.practice, lessonId);
  if (!questions) return null;
  return {
    courseId: practiceId,
    sectionId: lesson.uiSubjectId,
    academicLessonId: lessonId,
    practiceRevision: lesson.practiceRevision,
    lessonDateLabel: shortDate(lesson.lessonDate),
    title: lesson.title,
    icon: previousBank && previousBank.icon || SUBJECT_ICONS[lesson.uiSubjectId],
    description: lesson.description || 'Preguntas basadas únicamente en el curso de esta fecha.',
    grounding: 'course-only-managed-v483',
    sources: [{ label: 'Curso de esta fecha', url: `#${lessonId}` }],
    qcm: questions.qcm,
    vf: questions.vf,
    cases: questions.cases
  };
}

function applyManagedLesson(lesson, model, practiceRuntime) {
  const subjectModel = model.subjects && model.subjects[lesson.uiSubjectId];
  const subject = document.getElementById(lesson.uiSubjectId);
  if (!subjectModel || !subject || !Array.isArray(subjectModel.chapters)) return;

  const existing = findLessonByDate(subjectModel, lesson.lessonDate);
  const lessonId = existing
    ? existing.lesson.id
    : uniqueDomId(lesson.apiId || `${lesson.uiSubjectId}-${lesson.lessonDate}`);
  const revision = safeToken(lesson.practiceRevision, 40) || '0';
  const practiceId = `${lessonId}-practice-r${revision}`;
  const previousPracticeId = existing && existing.lesson.practiceId;
  const previousBank = previousPracticeId && practiceRuntime.banks[previousPracticeId];
  const bank = buildPracticeBank(lesson, lessonId, practiceId, previousBank);
  if (!bank) return;

  const panel = createManagedPanel(lesson, lessonId, practiceId, subjectModel.label);
  const existingPanel = document.getElementById(lessonId);
  if (!preserveStaticPanel(existingPanel, panel, lessonId)) subject.appendChild(panel);

  let modelLesson;
  let chapter;
  if (existing) {
    modelLesson = existing.lesson;
    chapter = existing.chapter;
  } else {
    chapter = currentChapter(subjectModel);
    modelLesson = { id: lessonId };
    chapter.lessons.push(modelLesson);
  }
  Object.assign(modelLesson, {
    id: lessonId,
    practiceId,
    lessonDate: lesson.lessonDate,
    date: shortDate(lesson.lessonDate),
    dateLong: longDate(lesson.lessonDate),
    title: lesson.title,
    status: 'confirmed',
    managedContent: true,
    managedSourceId: lesson.apiId || lessonId,
    practiceRevision: lesson.practiceRevision
  });
  sortChapterLessons(chapter);

  if (previousPracticeId && previousPracticeId !== practiceId) delete practiceRuntime.banks[previousPracticeId];
  practiceRuntime.banks[practiceId] = bank;
  const livePracticeRuntime = window.MedNykutoClassPractice;
  const mountRuntime = livePracticeRuntime && livePracticeRuntime.banks === practiceRuntime.banks
    ? livePracticeRuntime
    : practiceRuntime;
  if (previousPracticeId && previousPracticeId !== practiceId && mountRuntime.controllers) {
    delete mountRuntime.controllers[previousPracticeId];
  }
  if (typeof mountRuntime.mountStandalone === 'function') {
    const controller = mountRuntime.mountStandalone(panel.querySelector('[data-practice-slot]'), practiceId);
    if (controller && mountRuntime.controllers) mountRuntime.controllers[practiceId] = controller;
  }
}

async function publishedLessons() {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeout = window.setTimeout(() => {
    if (controller) controller.abort();
  }, 3500);
  try {
    const response = await fetch('/api/class-hub?class=s4-e&resource=public', {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload && payload.lessons) ? payload.lessons : [];
  } catch (error) {
    return [];
  } finally {
    window.clearTimeout(timeout);
  }
}

const academicModel = window.MedNykutoAcademicModel;
const classPractice = window.MedNykutoClassPractice;

if (academicModel && academicModel.subjects && classPractice && classPractice.banks) {
  const seenTargets = new Set();
  const lessons = (await publishedLessons())
    .map(normalizeLesson)
    .filter(Boolean)
    .sort((left, right) => left.lessonDate.localeCompare(right.lessonDate) || left.apiId.localeCompare(right.apiId));
  lessons.forEach((lesson) => {
    const target = `${lesson.uiSubjectId}|${lesson.lessonDate}`;
    if (seenTargets.has(target)) return;
    seenTargets.add(target);
    try {
      applyManagedLesson(lesson, academicModel, classPractice);
    } catch (error) {
      // Keep the static lesson untouched when one managed payload cannot be applied.
    }
  });
}
