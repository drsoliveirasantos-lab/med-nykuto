#!/usr/bin/env node
/* Validates the final Semester 3 v462 runtime bank and its exact-source contract. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const failures = [];
const warnings = [];
const runtimeScripts = [];
const reportDir = path.join(root, 'reports');
const VERSION = 'v462-exact-course-source';
const LOADER = 'v462';

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function fail(message, meta = {}) { failures.push({ message, ...meta }); }
function warn(message, meta = {}) { warnings.push({ message, ...meta }); }
function clean(value) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim(); }
function normalize(value) {
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9ñ+]+/g, ' ').trim();
}
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
function sourceCorpus(module) {
  return normalize([module?.title, module?.summary, module?.description, module?.fullMarkdown, module?.markdown]
    .filter(Boolean).join('\n'));
}
function sourceExists(statement, module) {
  const needle = normalize(statement);
  return needle.length >= 24 && sourceCorpus(module).includes(needle);
}
function isStrictLongest(options, index) {
  const lengths = options.map((option) => clean(option).length);
  const maximum = Math.max(...lengths);
  return lengths[index] === maximum && lengths.filter((length) => length === maximum).length === 1;
}
function hasObviousLengthCue(options, index) {
  const lengths = options.map((option) => clean(option).length);
  const correct = lengths[index];
  const distractors = lengths.filter((_, optionIndex) => optionIndex !== index);
  const secondLongest = Math.max(...distractors);
  const shortest = Math.min(...distractors);
  return (correct >= secondLongest * 1.2 && correct - secondLongest >= 12)
    || (shortest >= correct * 1.2 && shortest - correct >= 12);
}

const forbiddenSourcePattern = /(?:\b(?:curso|m[oó]dulos?|bloque|profesor|profesora|clase|transcripci[oó]n|estudiar|memorizar|pregunta|examen|distractor|objetivos? de aprendizaje|(?:la\s+)?l[oó]gica|idea (?:central|importante|pedag[oó]gica)|razonamiento|palabras? clave|respuesta correcta|debes dominar|busca qu[eé] dato del enunciado|descarta las opciones|primero identifica el concepto|despu[eé]s pregunta qu[eé] variable|no olvidar|no interpretar|apunte universitario|protocolo aplicado|criterio de elaboraci[oó]n|complemento pedag[oó]gico|relleno artificial|punto central|punto de partida|destino correcto|proteinuria, glucosuria y cetonuria|urocultivo si)\b|\b(?:course|module_?number|modulenumber|language|format|markdown_?site_?ready|markdownsiteready|title)\s*:)/i;
const forbiddenFragmentPattern = /^(?:porque|por eso|adem[aá]s|sin embargo|aunque|cuando|cuanto|si(?: bien)?|mientras|tambi[eé]n|ejemplo|nota|clave|objetivo|respuesta|pregunta|recordar|reconocer|identificar|explicar|comprender|relacionar|diferenciar|creer|pensar|para|primero|luego|se|protege|pierde|su|sus|esto|este|esta|eso|ese|esa|estos|estas|ambas?|entre (?:ellos|ellas)|en (?:ellos|ellas)|el primero|la primera|otro caso|no descarta|compatible|en cambio|como|al inicio|cl[ií]nicamente|despu[eé]s|antes)\b/i;
const forbiddenTechnicalPattern = /(?:course\s*:|module_?number|modulenumber|markdown_?site_?ready|markdownsiteready|validation-only|\.{2,}|…)/i;

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
const activeCourses = (data.courses || []).filter((course) => (course.modules || []).length > 0);
const moduleMap = new Map();
activeCourses.forEach((course) => (course.modules || []).forEach((module) => moduleMap.set(module.id, { course, module })));
const ids = new Set();
const qcmSignatures = new Set();
const stats = {
  total: 0,
  byCourse: {},
  byType: { qcm: 0, vf: 0, cases: 0 },
  representedModules: { qcm: new Set(), vf: new Set() },
  qcmLength: { eligible: 0, strictlyLongest: 0, obvious: 0 },
  crossFormatReuse: 0
};

if (context.window.__MED_NYKUTO_PRACTICE_LOADER__ !== LOADER) fail(`Practice loader marker is not ${LOADER}`);
if (bankRoot.__S3_CERTIFIED_BANK__ !== VERSION) fail('Semester 3 exact-source certification patch did not execute');
if (activeCourses.length !== 5) fail(`Expected 5 active Semester 3 courses, got ${activeCourses.length}`);
if (moduleMap.size !== 59) fail(`Expected 59 Semester 3 modules, got ${moduleMap.size}`);

function validateCommon(item, courseId, format) {
  const where = `${courseId}.${format}.${clean(item?.id) || 'missing-id'}`;
  if (!item || typeof item !== 'object') { fail(`${where}: invalid item`); return null; }
  if (!clean(item.id)) fail(`${where}: missing ID`);
  else if (ids.has(item.id)) fail(`${where}: duplicate runtime ID`);
  else ids.add(item.id);
  const owner = moduleMap.get(item.moduleId);
  if (!owner || owner.course.id !== courseId) fail(`${where}: module does not belong to ${courseId}`);
  if (item.qualityStatus !== 'certified' || item.qualityVersion !== VERSION || item.generatedFromCourse !== VERSION) fail(`${where}: v462 quality markers are incomplete`);
  const source = clean(item.sourceStatement);
  if (source.length < 48 || source !== clean(item.sourceEvidence)) fail(`${where}: source statement/evidence contract is broken`);
  if (owner && !sourceExists(source, owner.module)) fail(`${where}: source statement is not present in the declared course module`);
  if (forbiddenSourcePattern.test(source) || forbiddenFragmentPattern.test(source) || forbiddenTechnicalPattern.test(source)) fail(`${where}: source statement contains editorial, fragmentary or technical content`);
  if (!/[.!]$/.test(source) || !/^[A-ZÁÉÍÓÚÜÑ0-9]/.test(source)) fail(`${where}: source statement is not a complete display sentence`);
  if (!clean(item.explanation).includes(source)) fail(`${where}: explanation does not reproduce the exact source statement`);
  stats.total += 1;
  stats.byType[format] += 1;
  stats.representedModules[format]?.add(item.moduleId);
  return { where, owner, source };
}

for (const course of activeCourses) {
  const courseId = course.id;
  const bank = byCourse[courseId];
  if (!bank) { fail(`${courseId}: missing runtime bank`); continue; }
  const counts = { qcm: (bank.qcm || []).length, vf: (bank.vf || []).length, cases: (bank.cases || []).length };
  stats.byCourse[courseId] = counts;
  if (bank.certification?.version !== VERSION) fail(`${courseId}: missing v462 certification metadata`);
  if (bank.certification?.policy !== 'exact-course-source-only') fail(`${courseId}: wrong certification policy`);
  if (bank.certification?.coverageStatus !== 'all-modules-source-derived') fail(`${courseId}: wrong coverage status`);
  if (!Array.isArray(bank.certification?.blockedFormats) || !bank.certification.blockedFormats.includes('cases')) fail(`${courseId}: inherited cases are not explicitly blocked`);
  if (counts.cases !== 0) fail(`${courseId}: inherited clinical cases must remain unavailable`);
  if (counts.qcm < course.modules.length * 6) fail(`${courseId}: exact-source QCM subset is unexpectedly small (${counts.qcm})`);
  if (counts.vf < course.modules.length * 2) fail(`${courseId}: exact-source V/F subset is unexpectedly small (${counts.vf})`);

  const perModule = new Map(course.modules.map((module) => [module.id, { qcm: [], vf: [] }]));

  for (const item of bank.qcm || []) {
    const common = validateCommon(item, courseId, 'qcm');
    if (!common) continue;
    perModule.get(item.moduleId)?.qcm.push(item);
    const options = (item.options || []).map(optionText);
    const correct = answerIndex(item);
    if (options.length !== 4 || correct == null || correct < 0 || correct > 3) { fail(`${common.where}: invalid QCM structure`); continue; }
    if (new Set(options.map(normalize)).size !== 4) fail(`${common.where}: duplicate QCM options`);
    if (clean(options[correct]) !== common.source) fail(`${common.where}: correct option is not the exact source statement`);
    if (!Array.isArray(item.distractorSources) || item.distractorSources.length !== 3) fail(`${common.where}: missing distractor source contracts`);
    else for (const distractor of item.distractorSources) {
      const target = moduleMap.get(distractor.moduleId);
      if (!target || target.course.id !== courseId) fail(`${common.where}: distractor comes from another course`);
      if (distractor.moduleId === item.moduleId) fail(`${common.where}: distractor comes from the answer module`);
      if (![0, 1, 2, 3].includes(distractor.optionIndex) || distractor.optionIndex === correct) fail(`${common.where}: invalid distractor option index`);
      if (clean(options[distractor.optionIndex]) !== clean(distractor.sourceStatement)) fail(`${common.where}: distractor option/source mismatch`);
      if (target && !sourceExists(distractor.sourceStatement, target.module)) fail(`${common.where}: distractor source is absent from its declared module`);
      if (forbiddenSourcePattern.test(clean(distractor.sourceStatement)) || forbiddenTechnicalPattern.test(clean(distractor.sourceStatement))) fail(`${common.where}: distractor contains editorial or technical content`);
    }
    const rationales = Array.isArray(item.whyWrong) ? item.whyWrong.filter(Boolean).length : 0;
    if (rationales !== 3) fail(`${common.where}: distractor explanations are incomplete`);
    if (hasObviousLengthCue(options, correct)) { stats.qcmLength.obvious += 1; fail(`${common.where}: obvious answer-length cue`); }
    stats.qcmLength.eligible += 1;
    if (isStrictLongest(options, correct)) stats.qcmLength.strictlyLongest += 1;
    const signature = normalize([item.question, ...options].join(' | '));
    if (qcmSignatures.has(signature)) fail(`${common.where}: exact duplicate QCM signature`);
    qcmSignatures.add(signature);
  }

  for (const item of bank.vf || []) {
    const common = validateCommon(item, courseId, 'vf');
    if (!common) continue;
    perModule.get(item.moduleId)?.vf.push(item);
    const options = (item.options || []).map(optionText);
    const correct = answerIndex(item);
    if (options.join('|') !== 'Verdadero|Falso' || ![0, 1].includes(correct)) fail(`${common.where}: invalid V/F structure`);
    const assertion = clean(item.question).replace(/^¿Verdadero o falso\?\s*/i, '');
    if (correct === 0) {
      if (assertion !== common.source || item.sourceVariant !== 'exact') fail(`${common.where}: true item is not the exact source statement`);
    } else {
      const correction = clean(item.correctionIfFalse).replace(/^Correcci[oó]n:\s*/i, '');
      if (assertion === common.source || correction !== common.source || item.sourceVariant !== 'controlled-false') fail(`${common.where}: false item does not preserve the exact correction contract`);
      if (/\bno\s+no\b/i.test(assertion)) fail(`${common.where}: malformed double negation`);
    }
    if (item.crossFormatReuse) stats.crossFormatReuse += 1;
  }

  for (const [moduleId, rows] of perModule) {
    if (rows.qcm.length < 4 || rows.qcm.length > 8) fail(`${courseId}.${moduleId}: QCM coverage must stay between 4 and 8, got ${rows.qcm.length}`);
    if (rows.vf.length < 2 || rows.vf.length > 4) fail(`${courseId}.${moduleId}: V/F coverage must stay between 2 and 4, got ${rows.vf.length}`);
    const qcmDistribution = [0, 0, 0, 0];
    rows.qcm.forEach((item) => { qcmDistribution[answerIndex(item)] += 1; });
    if (Math.max(...qcmDistribution) - Math.min(...qcmDistribution) > 1) fail(`${courseId}.${moduleId}: QCM answer positions are imbalanced ${qcmDistribution.join('/')}`);
    const vfDistribution = [0, 0];
    rows.vf.forEach((item) => { vfDistribution[answerIndex(item)] += 1; });
    if (Math.abs(vfDistribution[0] - vfDistribution[1]) > 1) fail(`${courseId}.${moduleId}: V/F answers are imbalanced ${vfDistribution.join('/')}`);
  }
}

if (stats.total < 650) fail(`Exact-source runtime bank is unexpectedly small: ${stats.total}`);
if (stats.representedModules.qcm.size !== 59) fail(`QCM cover ${stats.representedModules.qcm.size}/59 modules`);
if (stats.representedModules.vf.size !== 59) fail(`V/F cover ${stats.representedModules.vf.size}/59 modules`);
const longestRate = stats.qcmLength.eligible ? stats.qcmLength.strictlyLongest / stats.qcmLength.eligible : 0;
if (longestRate > 0.28) fail(`QCM correct option is uniquely longest too often (${(longestRate * 100).toFixed(1)}%)`);
if (stats.crossFormatReuse > Math.ceil(stats.byType.vf * 0.65)) warn(`Cross-format source reuse is elevated (${stats.crossFormatReuse}/${stats.byType.vf})`);

fs.mkdirSync(reportDir, { recursive: true });
const serializableStats = {
  ...stats,
  representedModules: { qcm: stats.representedModules.qcm.size, vf: stats.representedModules.vf.size },
  qcmUniquelyLongestRate: Number(longestRate.toFixed(4))
};
const report = { generatedAt: new Date().toISOString(), certification: bankRoot.__S3_CERTIFIED_BANK__, stats: serializableStats, failures, warnings };
fs.writeFileSync(path.join(reportDir, 's3-question-certification-report.json'), JSON.stringify(report, null, 2));
const lines = [
  'Med Nykuto — Semester 3 exact-source certification',
  `Certification: ${report.certification}`,
  `Certified items: ${stats.total}`,
  `By type: QCM=${stats.byType.qcm}, V/F=${stats.byType.vf}, cases=${stats.byType.cases}`,
  `Represented modules: QCM=${stats.representedModules.qcm.size}/59, V/F=${stats.representedModules.vf.size}/59`,
  `Cross-format source reuse: ${stats.crossFormatReuse}`,
  `QCM uniquely-longest correct: ${stats.qcmLength.strictlyLongest}/${stats.qcmLength.eligible}`,
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
  ...(warnings.length ? warnings.map((item) => `- ${item.message}`) : ['- none'])
];
fs.writeFileSync(path.join(reportDir, 's3-question-certification-report.txt'), `${lines.join('\n')}\n`);

if (failures.length) {
  console.error('Semester 3 exact-source certification failed:');
  failures.slice(0, 120).forEach((item) => console.error(`- ${item.message}`));
  if (failures.length > 120) console.error(`...and ${failures.length - 120} more`);
  process.exit(1);
}
if (warnings.length) warnings.forEach((item) => console.warn(`Semester 3 certification warning: ${item.message}`));
console.log(`Semester 3 exact-source certification OK: ${stats.total} items (${stats.byType.qcm} QCM, ${stats.byType.vf} V/F), 59/59 modules in both formats, inherited cases blocked.`);
console.log(`Answer-length signal: ${(longestRate * 100).toFixed(1)}% uniquely longest; obvious cues ${stats.qcmLength.obvious}.`);
