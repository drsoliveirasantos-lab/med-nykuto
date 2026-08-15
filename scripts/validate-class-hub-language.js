const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'grupo-3-v401.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'grupo-3-v401.js'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'grupo-3-i18n-v421.js'), 'utf8');

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
expect(i18n.includes("'Horario del 4.º E':'Horário do 4.º E'"), 'The Portuguese schedule heading translation is missing.');
expect(css.includes('.class-language-switcher'), 'The compact language selector styling is missing.');
expect(css.includes('.schedule-task-badge'), 'The schedule task badge styling is missing.');

if (failures.length) {
  console.error('Class hub language/schedule validation failed:');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('Class hub language/schedule validation OK: ES/PT-BR, dated week, task shortcuts and Microbiology labels.');
