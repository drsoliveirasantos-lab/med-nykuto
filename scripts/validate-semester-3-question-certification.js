#!/usr/bin/env node
/* Validates the final Semester 3 bank after every runtime patch has executed. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const failures = [];
const warnings = [];
const runtimeScripts = [];
const reportDir = path.join(root, 'reports');

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function fail(message, meta = {}) { failures.push({ message, ...meta }); }
function warn(message, meta = {}) { warnings.push({ message, ...meta }); }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function optionText(option) {
  if (option && typeof option === 'object') return clean(option.text || option.label || option.value || option.content || '');
  return clean(option);
}
function answerIndex(item) {
  for (const key of ['answerIndex', 'correctIndex', 'correctOptionIndex', 'correctAnswerIndex']) {
    if (Number.isInteger(item?.[key])) return item[key];
  }
  return null;
}
function isStrictLongest(options, index) {
  const lengths = options.map((option) => clean(option).length);
  const maximum = Math.max(...lengths);
  return lengths[index] === maximum && lengths.filter((length) => length === maximum).length === 1;
}
function hasObviousLengthCue(options, index) {
  const lengths = options.map((option) => clean(option).length);
  const correct = lengths[index];
  const secondLongest = Math.max(...lengths.filter((_, optionIndex) => optionIndex !== index));
  return correct >= secondLongest * 1.2 && correct - secondLongest >= 12;
}

const context = vm.createContext({
  window: {},
  console: { log() {}, warn() {}, error() {} },
  document: {
    write(html) {
      const match = String(html || '').match(/src=["']data\/([^?"']+)/i);
      if (match) runtimeScripts.push(`data/${match[1]}`);
    },
    body: { dataset: { page: 'practice' } }
  },
  location: { search: '' },
  URLSearchParams
});

for (const file of ['data/med-courses-data.js', 'data/med-practice-bank-init.js', 'data/med-practice-bank-loader.js']) {
  vm.runInContext(read(file), context, { filename: file, timeout: 20000 });
}
for (const file of runtimeScripts) {
  if (!fs.existsSync(path.join(root, file))) fail(`Runtime loader requested a missing file: ${file}`, { file });
  else vm.runInContext(read(file), context, { filename: file, timeout: 30000 });
}

const data = context.window.MED_COURSES_DATA || { courses: [] };
const bankRoot = context.window.MED_PRACTICE_BANK || {};
const byCourse = bankRoot.byCourse || {};
const moduleIds = new Set(data.courses.flatMap((course) => (course.modules || []).map((module) => module.id)));
const expected = {
  fisiologia: { qcm: 170, vf: 90, cases: 70, qcmModules: 9 },
  microbiologia: { qcm: 190, vf: 130, cases: 45, qcmModules: 13 },
  genetica: { qcm: 180, vf: 120, cases: 10, qcmModules: 12 },
  bioquimica: { qcm: 15, vf: 6, cases: 0, qcmModules: 9, blockedCases: true },
  inmunologia: { qcm: 25, vf: 10, cases: 0, qcmModules: 12, blockedCases: true }
};
const genericOptionPattern = /(?:ocurre siempre igual|sin depender de tejido|sin enzimas, sin sustratos|no tienen relaci[oó]n con regulaci[oó]n|todas las .* misma funci[oó]n|sin ant[ií]genos, sin c[eé]lulas|no dependen de memoria ni reconocimiento|volumen sist[oó]lico|grupo sangu[ií]neo|contexto funcional de|\bde el\b)/i;
const genericQuestionPattern = /(?:el laboratorio informa un resultado relacionado con|durante el estudio de .{0,140}el punto central del caso es|en la urgencia, un paciente.{0,160}obliga a interpretar|un estudiante confunde .{0,140} con otr[oa]|¿qu[eé] opci[oó]n expresa con exactitud el concepto|la situaci[oó]n obliga a integrar|a la luz de «|el caso exige distinguir|cu[aá]l de las opciones vincula correctamente los datos del caso con|en una revisi[oó]n cl[ií]nica o de laboratorio)/i;
const genericCasePattern = /(?:un resultado de laboratorio sugiere alteraci[oó]n metab[oó]lica|un paciente presenta inflamaci[oó]n, infecci[oó]n recurrente o respuesta posterior a vacunaci[oó]n|el dato clave del caso se relaciona con|un paciente consulta por un problema relacionado|en una evaluaci[oó]n parcial|un estudiante debe explicar|la situaci[oó]n obliga a integrar|a la luz de «|el caso exige distinguir|cu[aá]l de las opciones vincula correctamente los datos del caso con|en una revisi[oó]n cl[ií]nica o de laboratorio)/i;
const clinicalPattern = /(?:paciente|niñ[oa]|mujer|hombre|lactante|reci[eé]n nacido|adolescente|adulto|consulta|presenta|hospital|laboratorio|muestra|sangre|orina|fiebre|dolor|diarrea|v[oó]mit|disnea|hipotensi[oó]n|hipertensi[oó]n|biopsia|cultivo|prueba|resultado|lesi[oó]n|infecci[oó]n|tratamiento|f[aá]rmaco|embaraz|familia)/i;
const artifactStatementPattern = /(?:\benunciado\s+(?:i|ii|iii|iv)\b|\b(?:afirmaciones?|opciones?)\s+(?:i|ii|iii|iv)\b|\b(?:solo|solamente)\s+(?:i|ii|iii|iv)\b|\btodas las anteriores\b|\bninguna de las anteriores\b)/i;
const rebuiltMetaPattern = /(?:\bdebe estudiarse\b|\bpara (?:preguntas|el examen)\b|\bverdadero\s*\/\s*falso\b|\brespuesta clave\b|\ben la l[oó]gica del curso\b|\bidea inicial del curso\b|\bel objetivo es que\b|\bejemplo pr[aá]ctico\b|\bla forma de escribir la respuesta\b)/i;
const ids = new Set();
const stats = {
  total: 0,
  byCourse: {},
  byType: { qcm: 0, vf: 0, cases: 0 },
  qcmLength: { eligible: 0, strictlyLongest: 0, obvious: 0 },
  caseLength: { eligible: 0, strictlyLongest: 0, obvious: 0 },
  tiers: {}
};

if (context.window.__MED_NYKUTO_PRACTICE_LOADER__ !== 'v461') fail('Practice loader marker is not v461');
if (bankRoot.__S3_CERTIFIED_BANK__ !== 'v461-course-certified') fail('Semester 3 certification patch did not execute');

for (const [courseId, limits] of Object.entries(expected)) {
  const bank = byCourse[courseId];
  if (!bank) { fail(`${courseId}: missing runtime bank`); continue; }
  if (bank.certification?.version !== 'v461-course-certified') fail(`${courseId}: missing certification metadata`);
  const counts = Object.fromEntries(['qcm', 'vf', 'cases'].map((format) => [format, (bank[format] || []).length]));
  stats.byCourse[courseId] = counts;
  for (const format of ['qcm', 'vf', 'cases']) {
    if (counts[format] < limits[format]) fail(`${courseId}.${format}: expected at least ${limits[format]} certified items, got ${counts[format]}`);
    const grouped = new Map();
    for (const item of bank[format] || []) {
      stats.total += 1;
      stats.byType[format] += 1;
      if (!item || typeof item !== 'object') { fail(`${courseId}.${format}: invalid item`); continue; }
      if (!moduleIds.has(item.moduleId)) fail(`${item.id}: unknown module ${item.moduleId}`);
      if (ids.has(item.id)) fail(`${item.id}: duplicate certified ID`);
      ids.add(item.id);
      if (item.qualityStatus !== 'certified' || item.qualityVersion !== 'v461-course-certified') fail(`${item.id}: certification marker missing`);
      if (clean(item.sourceEvidence).length < 12) fail(`${item.id}: missing course evidence`);
      if (!/Referencia del curso:/i.test(clean(item.explanation))) fail(`${item.id}: explanation does not expose course evidence`);
      stats.tiers[item.qualityTier] = (stats.tiers[item.qualityTier] || 0) + 1;
      const moduleRows = grouped.get(item.moduleId) || [];
      moduleRows.push(item);
      grouped.set(item.moduleId, moduleRows);

      if (format === 'vf') {
        if (!Array.isArray(item.options) || item.options.join('|') !== 'Verdadero|Falso') fail(`${item.id}: invalid V/F options`);
        if (![0, 1].includes(answerIndex(item))) fail(`${item.id}: invalid V/F answer`);
        if (artifactStatementPattern.test(clean(item.question))) fail(`${item.id}: inherited exam artifact survived certification`);
        if (item.rebuiltFromCourse && rebuiltMetaPattern.test(clean(item.question))) fail(`${item.id}: meta-learning statement survived reconstruction`);
        if (answerIndex(item) === 1 && clean(item.correctionIfFalse).length < 12) fail(`${item.id}: false statement lacks exact correction`);
        continue;
      }

      const options = (item.options || []).map(optionText);
      const correct = answerIndex(item);
      if (options.length !== 4 || correct == null || correct < 0 || correct > 3) { fail(`${item.id}: invalid four-option structure`); continue; }
      if (new Set(options.map((option) => option.toLowerCase())).size !== 4) fail(`${item.id}: duplicate options`);
      if (genericOptionPattern.test(options.join(' '))) fail(`${item.id}: generic distractor survived certification`);
      if (artifactStatementPattern.test(options.join(' '))) fail(`${item.id}: inherited exam artifact survived certification`);
      if (genericQuestionPattern.test(`${clean(item.stem)} ${clean(item.question)}`)) fail(`${item.id}: generic prompt survived certification`);
      if (/\.{2,}/.test(`${clean(item.stem)} ${clean(item.question)} ${options.join(' ')}`)) fail(`${item.id}: malformed punctuation survived certification`);
      if (item.rebuiltFromCourse && rebuiltMetaPattern.test(options.join(' '))) fail(`${item.id}: meta-learning option survived reconstruction`);
      const signal = format === 'qcm' ? stats.qcmLength : stats.caseLength;
      signal.eligible += 1;
      if (isStrictLongest(options, correct)) signal.strictlyLongest += 1;
      if (hasObviousLengthCue(options, correct)) { signal.obvious += 1; fail(`${item.id}: obvious answer-length cue survived certification`); }
      const distributionReasons = Array.isArray(item.whyWrong) ? item.whyWrong.filter(Boolean).length : 0;
      if (distributionReasons < 3) warn(`${item.id}: distractor rationales are incomplete`);

      if (format === 'cases') {
        const stem = clean(item.stem);
        const sentences = stem.split(/[.!?]+/).filter((sentence) => clean(sentence).length > 10).length;
        if (sentences < 2 || !clinicalPattern.test(stem) || genericCasePattern.test(stem)) fail(`${item.id}: case is not a genuine clinical mini-history`);
      }
    }

    const maximum = { qcm: 20, vf: 10, cases: 10 }[format];
    for (const [moduleId, rows] of grouped) {
      if (rows.length > maximum) fail(`${courseId}.${format}.${moduleId}: ${rows.length} exceeds certified maximum ${maximum}`);
      const distribution = [0, 0, 0, 0];
      rows.forEach((item) => { distribution[answerIndex(item)] += 1; });
      if (format === 'vf') {
        if (Math.abs(distribution[0] - distribution[1]) > 1) fail(`${courseId}.${format}.${moduleId}: V/F answers are imbalanced ${distribution[0]}/${distribution[1]}`);
      } else if (Math.max(...distribution) > Math.ceil(rows.length / 4) + 1) {
        fail(`${courseId}.${format}.${moduleId}: answer positions are imbalanced ${distribution.join('/')}`);
      }
    }
    if (format === 'qcm' && grouped.size < limits.qcmModules) fail(`${courseId}: only ${grouped.size}/${limits.qcmModules} modules have certified QCM`);
  }
  const blocked = bank.certification?.blockedFormats || [];
  if (limits.blockedCases && (!blocked.includes('cases') || counts.cases !== 0)) fail(`${courseId}: inherited clinical cases must remain blocked until reconstruction`);
}

if (stats.total < 1150) fail(`Certified runtime bank is unexpectedly small: ${stats.total}`);
for (const [format, signal] of [['qcm', stats.qcmLength], ['cases', stats.caseLength]]) {
  const longestRate = signal.eligible ? signal.strictlyLongest / signal.eligible : 0;
  if (longestRate > (format === 'qcm' ? 0.27 : 0.35)) fail(`${format}: correct option remains too often the uniquely longest (${(longestRate * 100).toFixed(1)}%)`);
}

fs.mkdirSync(reportDir, { recursive: true });
const report = { generatedAt: new Date().toISOString(), certification: bankRoot.__S3_CERTIFIED_BANK__, stats, failures, warnings };
fs.writeFileSync(path.join(reportDir, 's3-question-certification-report.json'), JSON.stringify(report, null, 2));
const lines = [
  'Med Nykuto — Semester 3 question certification',
  `Certification: ${report.certification}`,
  `Certified items: ${stats.total}`,
  `By type: QCM=${stats.byType.qcm}, V/F=${stats.byType.vf}, cases=${stats.byType.cases}`,
  `QCM uniquely-longest correct: ${stats.qcmLength.strictlyLongest}/${stats.qcmLength.eligible}`,
  `Cases uniquely-longest correct: ${stats.caseLength.strictlyLongest}/${stats.caseLength.eligible}`,
  `Failures: ${failures.length}`,
  `Warnings: ${warnings.length}`,
  '',
  'Counts by course:',
  ...Object.entries(stats.byCourse).map(([course, value]) => `- ${course}: qcm=${value.qcm}, vf=${value.vf}, cases=${value.cases}`),
  '',
  'Failures:',
  ...(failures.length ? failures.map((item) => `- ${item.message}`) : ['- none']),
  '',
  'Warnings:',
  ...(warnings.length ? warnings.slice(0, 120).map((item) => `- ${item.message}`) : ['- none'])
];
fs.writeFileSync(path.join(reportDir, 's3-question-certification-report.txt'), `${lines.join('\n')}\n`);

if (failures.length) {
  console.error('Semester 3 question certification failed:');
  failures.slice(0, 100).forEach((item) => console.error(`- ${item.message}`));
  if (failures.length > 100) console.error(`...and ${failures.length - 100} more`);
  process.exit(1);
}
console.log(`Semester 3 certification OK: ${stats.total} course-grounded items (${stats.byType.qcm} QCM, ${stats.byType.vf} V/F, ${stats.byType.cases} genuine cases).`);
console.log(`Answer-length signal: QCM ${(stats.qcmLength.strictlyLongest * 100 / stats.qcmLength.eligible).toFixed(1)}%, cases ${(stats.caseLength.strictlyLongest * 100 / stats.caseLength.eligible).toFixed(1)}%; obvious cues 0.`);
