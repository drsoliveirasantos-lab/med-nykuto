const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'grupo-3-v401.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'grupo-3-v401.js'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'grupo-3-i18n-v421.js'), 'utf8');
const semesterSwitcher = fs.readFileSync(path.join(root, 'semester-switcher-v402.js'), 'utf8');

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(!/\bTarefa\b/.test(html), 'Spanish class page still contains the Portuguese label “Tarefa”.');
expect(!/KM\s*8/i.test(html), 'The obsolete KM 8 location is still visible.');
expect(!/PRÓXIMA AULA/.test(html), 'Spanish content still contains the Portuguese word “aula”.');
expect(html.includes('id="classLanguageSelect"'), 'The ES/PT-BR language selector is missing.');
expect(html.includes('<option value="es">ES · Español</option>'), 'The Spanish language option is missing.');
expect(html.includes('<option value="br">PT-BR · Português</option>'), 'The Brazilian Portuguese language option is missing.');

['1', '3', '4', '5'].forEach((day) => {
  expect(html.includes(`data-week-date="${day}"`), `The visible date for schedule day ${day} is missing.`);
});

[
  '#microTheoryPrepCard',
  '#bioPrepCard',
  '#epiPrepCard',
  '#nutritionPrepCard',
  '#microPrepCard'
].forEach((target) => {
  expect(html.includes(`class="schedule-task-badge`) && html.includes(`href="${target}"`), `The schedule task shortcut ${target} is missing.`);
});

expect((html.match(/course-type-badge/g) || []).length >= 4, 'Theory/practice badges are not present in both schedule and course selector.');
expect(html.includes('Microbiología II · Teórica'), 'Microbiología teórica is not labeled explicitly.');
expect(html.includes('Microbiología II · Práctica'), 'Microbiología práctica is not labeled explicitly.');
expect(runtime.includes("subject:'Microbiología II · Teórica'"), 'Runtime schedule does not distinguish theoretical Microbiology.');
expect(runtime.includes("subject:'Microbiología II · Práctica'"), 'Runtime schedule does not distinguish practical Microbiology.');

const i18nIndex = html.indexOf('grupo-3-i18n-v421.js');
const practiceIndex = html.indexOf('grupo-3-practice-v413.js');
const runtimeIndex = html.indexOf('grupo-3-v401.js');
expect(i18nIndex >= 0 && i18nIndex < practiceIndex && practiceIndex < runtimeIndex, 'The class i18n runtime must load before practice and class behavior.');
expect(i18n.includes("htmlLangByLang = {es:'es',br:'pt-BR'}"), 'The Portuguese document language is not configured as pt-BR.');
expect(i18n.includes("'Tareas':'Tarefas'"), 'The Portuguese task navigation translation is missing.');
expect(i18n.includes("'Materias':'Matérias'"), 'The Materias/Matérias navigation translation is missing.');
expect(i18n.includes("'Horario del 4.º E':'Horário do 4.º E'"), 'The Portuguese schedule heading translation is missing.');
expect(css.includes('.class-language-switcher'), 'The compact language selector styling is missing.');
expect(css.includes('.schedule-task-badge'), 'The schedule task badge styling is missing.');
expect((html.match(/class="schedule-slot/g) || []).length === 10, 'The weekly schedule no longer exposes all ten class slots.');
expect((html.match(/data-subject="/g) || []).length === 10, 'The class slots are missing their subject color markers.');
expect(html.includes('class="schedule-day-strip"'), 'The compact four-day strip is missing from the schedule summary.');
expect(css.includes('grid-template-columns:54px minmax(0,1fr)'), 'The compact mobile schedule timeline is missing.');
expect(css.includes('.schedule-slot[data-subject="physiology"]'), 'The schedule subject color system is missing.');
expect(runtime.includes('function mondayOfWeek(date)'), 'The schedule week does not align its dates with the upcoming class.');
expect(runtime.includes('renderScheduleWeekDates(next && next.date)'), 'The upcoming class is not used to choose the visible schedule week.');
expect(semesterSwitcher.includes("classScope.replaceWith(wrapper)"), 'The semester selector is not embedded in the class header.');
expect(semesterSwitcher.includes('is-class-header-v402'), 'The embedded semester selector styling hook is missing.');

expect((html.match(/data-current-assignment/g) || []).length === 5, 'The five current tasks are not rendered as expandable rows.');
expect((html.match(/class="current-assignment-summary"/g) || []).length === 5, 'Every current task must expose a compact summary row.');
expect((html.match(/class="assignment-pictogram"/g) || []).length === 5, 'The current tasks do not all have pictograms.');
expect((html.match(/class="current-assignment-date/g) || []).length === 5, 'Every current task must show its date before expansion.');
expect(runtime.includes("target.matches('[data-current-assignment]')"), 'Direct links do not automatically expand the selected current task.');
expect(runtime.includes("document.querySelectorAll('[data-current-assignment]')"), 'The exclusive current-task accordion behavior is missing.');
expect(html.includes('Estudiar las tiñas y tres micosis subcutáneas'), 'The Microbiology study task title is not action-oriented.');
expect(!html.includes('Preparar tiñas y tres micosis subcutáneas'), 'The misleading Microbiology preparation title is still present.');
expect(!html.includes('id="studyAnswerModal"'), 'The obsolete full-page review answer modal is still present.');
expect(runtime.includes("disclosure.className = 'preview-answer-disclosure'"), 'Inline review answer disclosures are missing from the runtime.');
expect(runtime.includes("answerNode.className = 'preview-answer-inline'"), 'Inline review answer panels are missing from the runtime.');
expect(!runtime.includes('openStudyAnswer'), 'The obsolete modal answer opener is still present.');
expect(css.includes('.preview-answer-inline'), 'Inline review answer styling is missing.');
expect(!css.includes('.study-answer-modal'), 'Obsolete full-page review answer modal styling is still present.');
expect((html.match(/data-document-preview="/g) || []).length === 6, 'Every seminar document shortcut must open the same-page preview.');
expect(html.includes('id="seminarDocumentPreview"'), 'The seminar document dialog is missing.');
expect((html.match(/data-document-preview-panel=/g) || []).length === 2, 'The dialog must expose the instructivo and portada panels.');
expect((html.match(/assets\/class-hub\/previews\/instructivo\/page-/g) || []).length === 3, 'The three instructivo preview pages are missing from the dialog.');
expect((html.match(/assets\/class-hub\/previews\/modelo-portada\/page-/g) || []).length === 2, 'The two portada preview pages are missing from the dialog.');
expect(runtime.includes('function prepareSeminarDocumentPreview()'), 'The same-page document preview runtime is missing.');
expect(runtime.includes("dialog.showModal()"), 'The seminar preview is not opened as a native dialog.');
expect(css.includes('.seminar-document-dialog'), 'The document dialog styling is missing.');
expect(html.includes('<strong>Materias</strong>'), 'The visible class navigation is not labeled Materias.');
expect(!html.includes('<strong>Cursos</strong>'), 'The obsolete visible Cursos navigation label remains.');
expect(css.includes('.course-selector{grid-template-columns:1fr 1fr;gap:6px}'), 'The two-column iPhone subject library is missing.');
expect(css.includes('.practice-counts{grid-template-columns:repeat(3,1fr);gap:4px'), 'The compact three-column iPhone training summary is missing.');
expect(css.includes('.resource-grid{grid-template-columns:1fr 1fr;gap:6px'), 'The two-column iPhone review library is missing.');
expect(css.includes('.study-map .preview-answer-disclosure>summary{min-height:60px;display:grid'), 'The compact iPhone study-map rows are missing.');
expect(css.includes('.study-map .preview-answer-hint{grid-column:2;grid-row:2'), 'The compact study-map answer hint alignment is missing.');
expect(css.includes('.mobile-bottom-nav a{min-height:58px'), 'The enlarged iPhone bottom navigation touch targets are missing.');
expect(css.includes('.mobile-bottom-nav .nav-icon svg{width:20px;height:20px}'), 'The enlarged iPhone bottom navigation icons are missing.');

if (failures.length) {
  console.error('Class hub language/schedule validation failed:');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('Class hub validation OK: ES/PT-BR, compact mobile views, same-page document preview and Microbiology labels.');
