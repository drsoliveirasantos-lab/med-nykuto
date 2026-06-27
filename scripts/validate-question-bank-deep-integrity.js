#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const problems = [];
const warnings = [];
const bankFiles = {
  fisiologia: 'data/practice-bank-fisiologia.js',
  microbiologia: 'data/practice-bank-microbiologia.js',
  genetica: 'data/practice-bank-genetica.js',
  bioquimica: 'data/practice-bank-bioquimica.js',
  inmunologia: 'data/practice-bank-inmunologia.js'
};

function fail(message) { problems.push(message); }
function warn(message) { warnings.push(message); }
function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    fail(`${file}: missing`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}
function run(label, code, context) {
  try { vm.runInContext(code, context, { filename: label, timeout: 20000 }); }
  catch (error) { fail(`${label}: execution failed: ${error.message}`); }
}
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function norm(value) { return clean(value).toLowerCase(); }
function answerIndexOf(item) {
  if (Number.isInteger(item.answerIndex)) return item.answerIndex;
  if (Number.isInteger(item.correctIndex)) return item.correctIndex;
  if (typeof item.answer === 'number') return item.answer;
  if (typeof item.correct === 'number') return item.correct;
  if (typeof item.answer === 'string' && /^[A-D]$/i.test(item.answer.trim())) return item.answer.trim().toUpperCase().charCodeAt(0) - 65;
  return null;
}
function itemText(item) {
  return clean([item.stem, item.question, ...(Array.isArray(item.options) ? item.options : [])].join(' '));
}

const context = vm.createContext({
  window: {},
  console: { log() {}, warn() {}, error() {} },
  document: { write() {}, body: { dataset: {} } },
  localStorage: {}
});
run('data/med-courses-data.js', read('data/med-courses-data.js'), context);
run('data/med-practice-bank-init.js', read('data/med-practice-bank-init.js'), context);
Object.entries(bankFiles).forEach(([course, file]) => run(file, read(file), context));
context.window.MED_PRACTICE_BANK_LAZY_WANTED = Object.keys(bankFiles);
run('data/practice-bank-functional-fallback-v360.js', read('data/practice-bank-functional-fallback-v360.js'), context);

const bankRoot = context.window.MED_PRACTICE_BANK || {};
const byCourse = bankRoot.byCourse || {};
const globalIds = new Set();
const exactTexts = new Map();

for (const [courseId, bank] of Object.entries(byCourse)) {
  if (!bank || typeof bank !== 'object') continue;
  for (const [format, items] of Object.entries({ qcm: bank.qcm || [], vf: bank.vf || [], cases: bank.cases || [] })) {
    if (!Array.isArray(items) || !items.length) {
      fail(`${courseId}.${format}: missing or empty array`);
      continue;
    }
    const answerDistribution = [0, 0, 0, 0];
    items.forEach((item, index) => {
      const where = `${courseId}.${format}[${index}]`;
      if (!item || typeof item !== 'object') { fail(`${where}: invalid item`); return; }
      const id = clean(item.id || `${courseId}-${format}-${index}`);
      const globalId = `${courseId}:${format}:${id}`;
      if (!id) fail(`${where}: missing id`);
      if (globalIds.has(globalId)) fail(`${where}: duplicate id ${id}`);
      globalIds.add(globalId);

      const question = clean(item.question || item.prompt || '');
      const stem = clean(item.stem || item.case || item.context || '');
      const options = Array.isArray(item.options) ? item.options.map(clean) : [];
      const explanation = clean(item.explanation || item.feedback || item.rationale || item.justification || '');
      const answerIndex = answerIndexOf(item);

      if (format === 'qcm') {
        if (question.length < 15) fail(`${where}: QCM question too short`);
        if (options.length !== 4) fail(`${where}: QCM must have exactly 4 options`);
        if (answerIndex === null || answerIndex < 0 || answerIndex > 3) fail(`${where}: invalid QCM answerIndex`);
        else answerDistribution[answerIndex] += 1;
      }

      if (format === 'vf') {
        if (question.length < 10) fail(`${where}: V/F question too short`);
        if (answerIndex === null || answerIndex < 0 || answerIndex > 1) fail(`${where}: invalid V/F answerIndex`);
      }

      if (format === 'cases') {
        if ((stem + ' ' + question).trim().length < 80) fail(`${where}: clinical case is too short`);
        if (!/(paciente|estudiante|mujer|hombre|niño|niña|adolescente|consulta|presenta|refiere|examen|laboratorio)/i.test(stem + ' ' + question)) {
          warn(`${where}: case may lack clinical narrative markers`);
        }
        if (options.length !== 4) fail(`${where}: clinical case must have exactly 4 options`);
        if (answerIndex === null || answerIndex < 0 || answerIndex > 3) fail(`${where}: invalid case answerIndex`);
      }

      if ((format === 'qcm' || format === 'cases') && options.length) {
        const empty = options.findIndex((option) => !option);
        if (empty !== -1) fail(`${where}: option ${empty + 1} is empty`);
        const uniqueOptions = new Set(options.map(norm));
        if (uniqueOptions.size !== options.length) fail(`${where}: duplicate options`);
      }
      if (explanation.length < 20) fail(`${where}: explanation too short or missing`);

      const signature = norm(itemText(item));
      if (signature.length > 40) exactTexts.set(signature, (exactTexts.get(signature) || 0) + 1);
    });
    if ((format === 'qcm' || format === 'cases') && items.length >= 40) {
      const max = Math.max(...answerDistribution);
      const min = Math.min(...answerDistribution);
      if (max > min * 3 + 10) warn(`${courseId}.${format}: answer distribution is imbalanced ${answerDistribution.join('/')}`);
    }
  }
}

const repeated = [...exactTexts.entries()].filter(([, count]) => count > 1);
if (repeated.length > 25) fail(`Too many exact duplicate question signatures: ${repeated.length}`);

if (warnings.length) {
  console.warn('Question bank deep integrity warnings:');
  warnings.slice(0, 50).forEach((message) => console.warn(`- ${message}`));
}
if (problems.length) {
  console.error('Question bank deep integrity failed:');
  problems.slice(0, 100).forEach((message) => console.error(`- ${message}`));
  if (problems.length > 100) console.error(`...and ${problems.length - 100} more`);
  process.exit(1);
}
console.log(`Question bank deep integrity OK across ${globalIds.size} items.`);
