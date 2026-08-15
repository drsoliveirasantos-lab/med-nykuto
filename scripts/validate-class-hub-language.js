const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'grupo-3-v401.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'grupo-3-v401.js'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'grupo-3-i18n-v421.js'), 'utf8');
const semesterSwitcher = fs.readFileSync(path.join(root, 'semester-switcher-v402.js'), 'utf8');
const seminarDocuments = fs.readFileSync(path.join(root, 'documentos-seminario.html'), 'utf8');
const seminarDocumentsRuntime = fs.readFileSync(path.join(root, 'documentos-seminario.js'), 'utf8');

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

[
  'Tu semana',
  'PARA ESTA SEMANA',
  '3 cosas importantes',
  'Ver todas las tareas',
  'TAREAS ACTUALES',
  'TAREAS ANTERIORES',
  'Ver las instrucciones',
  'Ver ejemplo de la primera página',
  'Cómo se califica · 5 puntos',
  'ARCHIVOS PARA EMPEZAR',
  'Documento firmado',
  '¿Qué quieres preguntar?'
].forEach((label) => {
  expect(html.includes(label), `The simplified class label “${label}” is missing.`);
});

[
  'Tu semana, de un vistazo.',
  'EN PORTADA',
  'Panel de estudio',
  'Por hacer + archivo',
  'Ver la consigna completa',
  'HISTORIAL POR MATERIA',
  'Canal de la clase',
  'Seleccionar subgrupo',
  'Ver instructivo',
  'Vista previa · Portada',
  'Rúbrica de calificación',
  'Descarga la base oficial',
  'Constancia firmada',
  'nueva transcripción · una sola clase',
  'transcripción acumulada'
].forEach((label) => {
  expect(!html.includes(label), `The confusing class label “${label}” is still visible.`);
});

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
expect(i18n.includes("'Horario del 4.º E':'Horário do 4.º E'"), 'The Portuguese schedule heading translation is missing.');
expect(i18n.includes("'Tu semana':'Sua semana'"), 'The simplified Portuguese dashboard heading is missing.');
expect(i18n.includes("'Ver todas las tareas':'Ver todas as tarefas'"), 'The simplified Portuguese task link is missing.');
expect(i18n.includes("'TAREAS ANTERIORES':'TAREFAS ANTERIORES'"), 'The simplified Portuguese previous-task label is missing.');
expect(i18n.includes("'Ver las instrucciones':'Ver as instruções'"), 'The simplified Portuguese instructions link is missing.');
expect(i18n.includes("'Ver ejemplo de la primera página':'Ver exemplo da primeira página'"), 'The simplified Portuguese first-page example link is missing.');
expect(i18n.includes("'Cómo se califica · 5 puntos':'Como será avaliado · 5 pontos'"), 'The simplified Portuguese grading label is missing.');
expect(i18n.includes("'Guías Alimentarias · Regiones y platos · Documento firmado':'Guias Alimentares · Regiões e pratos · Documento assinado'"), 'The Portuguese seminar summary is incomplete.');
expect(i18n.includes("'Este paso se completa automáticamente al seleccionar un grupo.':'Esta etapa é concluída automaticamente ao selecionar um grupo.'"), 'The Portuguese seminar checklist is incomplete.');
expect(seminarDocuments.includes('Instrucciones para la presentación oral'), 'The seminar instructions page still uses an unclear heading.');
expect(seminarDocuments.includes('Ejemplo de la primera página y del desarrollo'), 'The seminar first-page example is not labeled plainly.');
expect(!/Instructivo oficial|Modelo de portada y desarrollo|rúbrica/.test(seminarDocuments), 'The seminar documents page still contains unexplained formal terms.');
expect(seminarDocumentsRuntime.includes("'Ejemplo de la primera página' : 'Instrucciones'"), 'The seminar document title is not plain language.');
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

expect((html.match(/class="assignment-card assignment-compact/g) || []).length === 4, 'The four regular current tasks are not rendered as compact rows.');
expect((html.match(/class="assignment-pictogram"/g) || []).length === 4, 'The compact current tasks do not all have pictograms.');
expect(html.includes('Estudiar las tiñas y tres micosis subcutáneas'), 'The Microbiology study task title is not action-oriented.');
expect(!html.includes('Preparar tiñas y tres micosis subcutáneas'), 'The misleading Microbiology preparation title is still present.');
expect(!html.includes('id="studyAnswerModal"'), 'The obsolete full-page review answer modal is still present.');
expect(runtime.includes("disclosure.className = 'preview-answer-disclosure'"), 'Inline review answer disclosures are missing from the runtime.');
expect(runtime.includes("answerNode.className = 'preview-answer-inline'"), 'Inline review answer panels are missing from the runtime.');
expect(!runtime.includes('openStudyAnswer'), 'The obsolete modal answer opener is still present.');
expect(css.includes('.preview-answer-inline'), 'Inline review answer styling is missing.');
expect(!css.includes('.study-answer-modal'), 'Obsolete full-page review answer modal styling is still present.');

if (failures.length) {
  console.error('Class hub language/schedule validation failed:');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('Class hub validation OK: ES/PT-BR, dated week, compact tasks, inline answers and Microbiology labels.');
