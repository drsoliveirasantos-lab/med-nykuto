#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const reportDir = path.join(root, 'reports');
const reportJsonPath = path.join(reportDir, 'question-bank-quality-report.json');
const reportTxtPath = path.join(reportDir, 'question-bank-quality-report.txt');

const problems = [];
const warnings = [];
const stats = {
  checkedItems: 0,
  byCourse: {},
  byType: { qcm: 0, vf: 0, cases: 0 },
  generatedAt: new Date().toISOString(),
  qualitySignals: {
    qcm: { eligible: 0, correctStrictlyLongest: 0, correctStrictlyShortest: 0, correctLongerThanDistractorMean: 0, obviousLengthCue: 0, obviousShortCue: 0 },
    cases: { eligible: 0, correctStrictlyLongest: 0, correctStrictlyShortest: 0, correctLongerThanDistractorMean: 0, obviousLengthCue: 0, obviousShortCue: 0 }
  }
};
function record(list, severity, message, meta = {}) {
  list.push({ severity, message, ...meta });
}
function fail(message, meta) { record(problems, 'failure', message, meta); }
function warn(message, meta) { record(warnings, 'warning', message, meta); }
function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    fail(`${file}: missing`, { file });
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}
function run(label, code, context) {
  try { vm.runInContext(code, context, { filename: label, timeout: 20000 }); }
  catch (error) { fail(`${label}: execution failed: ${error.message}`, { file: label, error: error.message }); }
}
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function norm(value) { return clean(value).toLowerCase(); }
function optionText(option) {
  if (option == null) return '';
  if (typeof option === 'object') return clean(option.text || option.label || option.value || option.content || JSON.stringify(option));
  return clean(option);
}
function answerIndexOf(item, options) {
  const numericKeys = ['answerIndex', 'correctIndex', 'correctOptionIndex', 'correctAnswerIndex'];
  for (const key of numericKeys) {
    if (Number.isInteger(item[key])) return item[key];
  }
  const raw = item.answer ?? item.correct ?? item.correctAnswer ?? item.correctOption ?? item.answerKey ?? item.correctKey;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'boolean') return raw ? 0 : 1;
  if (typeof raw === 'string') {
    const value = raw.trim();
    if (/^[A-D]$/i.test(value)) return value.toUpperCase().charCodeAt(0) - 65;
    if (/^(true|verdadero|vrai)$/i.test(value)) return 0;
    if (/^(false|falso|faux)$/i.test(value)) return 1;
    const normalized = norm(value);
    const index = options.map(norm).indexOf(normalized);
    if (index !== -1) return index;
  }
  return null;
}
function itemText(item) {
  return clean([item.stem, item.case, item.context, item.question, ...(Array.isArray(item.options) ? item.options.map(optionText) : [])].join(' '));
}
function explanationText(item) {
  return clean(item.explanation || item.feedback || item.rationale || item.justification || item.correction || item.correctionIfFalse || '');
}
function hasExplanation(item) {
  return explanationText(item).length >= 10;
}
function addStat(courseId, format) {
  stats.checkedItems += 1;
  stats.byType[format] = (stats.byType[format] || 0) + 1;
  stats.byCourse[courseId] = stats.byCourse[courseId] || { total: 0, qcm: 0, vf: 0, cases: 0 };
  stats.byCourse[courseId].total += 1;
  stats.byCourse[courseId][format] += 1;
}
function addLengthSignals(format, options, answerIndex) {
  if (!['qcm', 'cases'].includes(format) || options.length !== 4 || answerIndex == null) return;
  const lengths = options.map((option) => clean(option).length);
  const correctLength = lengths[answerIndex];
  const distractors = lengths.filter((_, index) => index !== answerIndex);
  const secondLongest = distractors.slice().sort((a, b) => b - a)[0] || 0;
  const shortestDistractor = distractors.slice().sort((a, b) => a - b)[0] || 0;
  const signal = stats.qualitySignals[format];
  signal.eligible += 1;
  if (lengths.filter((length) => length === Math.max(...lengths)).length === 1 && correctLength === Math.max(...lengths)) signal.correctStrictlyLongest += 1;
  if (lengths.filter((length) => length === Math.min(...lengths)).length === 1 && correctLength === Math.min(...lengths)) signal.correctStrictlyShortest += 1;
  if (correctLength > distractors.reduce((sum, length) => sum + length, 0) / distractors.length) signal.correctLongerThanDistractorMean += 1;
  if (correctLength >= secondLongest * 1.2 && correctLength - secondLongest >= 12) signal.obviousLengthCue += 1;
  if (shortestDistractor >= correctLength * 1.2 && shortestDistractor - correctLength >= 12) signal.obviousShortCue += 1;
}
function ensureReportDir() {
  fs.mkdirSync(reportDir, { recursive: true });
}
function writeReports() {
  ensureReportDir();
  const groupedWarnings = warnings.reduce((acc, item) => {
    const key = item.type || item.code || 'general-warning';
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  const groupedFailures = problems.reduce((acc, item) => {
    const key = item.type || item.code || 'general-failure';
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
  const report = {
    generatedAt: stats.generatedAt,
    summary: {
      checkedItems: stats.checkedItems,
      failureCount: problems.length,
      warningCount: warnings.length,
      courses: Object.keys(stats.byCourse).length,
      byType: stats.byType,
      byCourse: stats.byCourse,
      qualitySignals: stats.qualitySignals,
      runtimeScripts: stats.runtimeScripts
    },
    failures: problems,
    warnings,
    groupedFailures,
    groupedWarnings
  };
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));

  const lines = [];
  lines.push('Med Nykuto — Question bank quality report');
  lines.push(`Generated at: ${stats.generatedAt}`);
  lines.push(`Checked items: ${stats.checkedItems}`);
  lines.push(`Failures: ${problems.length}`);
  lines.push(`Warnings: ${warnings.length}`);
  lines.push('');
  lines.push('Counts by course:');
  Object.entries(stats.byCourse).forEach(([course, value]) => {
    lines.push(`- ${course}: total=${value.total}, qcm=${value.qcm}, vf=${value.vf}, cases=${value.cases}`);
  });
  lines.push('');
  lines.push('Length-cue signals (content debt, measured on the final runtime bank):');
  Object.entries(stats.qualitySignals).forEach(([format, value]) => {
    const pct = (count) => value.eligible ? `${(count * 100 / value.eligible).toFixed(1)}%` : '0.0%';
    lines.push(`- ${format}: eligible=${value.eligible}, strictly-longest=${value.correctStrictlyLongest} (${pct(value.correctStrictlyLongest)}), strictly-shortest=${value.correctStrictlyShortest} (${pct(value.correctStrictlyShortest)}), longer-than-distractor-mean=${value.correctLongerThanDistractorMean} (${pct(value.correctLongerThanDistractorMean)}), obvious-long-cue=${value.obviousLengthCue} (${pct(value.obviousLengthCue)}), obvious-short-cue=${value.obviousShortCue} (${pct(value.obviousShortCue)})`);
  });
  lines.push('');
  lines.push('Failures:');
  if (!problems.length) lines.push('- none');
  problems.forEach((item, index) => lines.push(`${index + 1}. ${item.message}`));
  lines.push('');
  lines.push('Warnings grouped by type:');
  const groups = Object.entries(groupedWarnings).sort((a, b) => b[1].length - a[1].length);
  if (!groups.length) lines.push('- none');
  groups.forEach(([type, items]) => {
    lines.push(`\n[${type}] ${items.length}`);
    items.slice(0, 120).forEach((item, index) => lines.push(`  ${index + 1}. ${item.message}`));
    if (items.length > 120) lines.push(`  ...and ${items.length - 120} more`);
  });
  fs.writeFileSync(reportTxtPath, lines.join('\n') + '\n');
}

const runtimeScripts = [];
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
  localStorage: {},
  location: { search: '' },
  URLSearchParams
});
run('data/med-courses-data.js', read('data/med-courses-data.js'), context);
run('data/med-practice-bank-init.js', read('data/med-practice-bank-init.js'), context);
run('data/med-practice-bank-loader.js', read('data/med-practice-bank-loader.js'), context);
runtimeScripts.forEach((file) => run(file, read(file), context));
if (!runtimeScripts.length) fail('Runtime loader did not request any practice-bank scripts', { type: 'runtime-loader-empty' });
stats.runtimeScripts = runtimeScripts.slice();

const bankRoot = context.window.MED_PRACTICE_BANK || {};
const byCourse = bankRoot.byCourse || {};
const globalIds = new Set();
const exactTexts = new Map();
const exactQuestions = new Map();
const boilerplatePrompts = [];
const boilerplatePatterns = [
  /cu[aá]l opci[oó]n identifica el mecanismo principal del caso/i,
  /qu[eé] interpretaci[oó]n relaciona mejor el dato cl[ií]nico con el mecanismo estudiado/i,
  /en formato de examen,.*evita el distractor principal/i,
  /en este caso, todos los razonamientos siguientes son compatibles/i,
  /cu[aá]l es la interpretaci[oó]n m[aá]s directa/i,
  /qu[eé] mecanismo fisiol[oó]gico explica mejor este (?:caso|cuadro)/i,
  /qu[eé] mecanismo de transporte explica mejor esta situaci[oó]n/i,
  /cu[aá]l afirmaci[oó]n responde mejor al dato descrito/i,
  /marque la respuesta correcta/i,
  /marque la opci[oó]n correcta/i,
  /para reconocer correctamente .*marque/i,
  /en una evaluaci[oó]n parcial, aparece una pregunta sobre/i,
  /el examinador busca diferenciar mecanismo verdadero y distractor/i,
  /un estudiante debe explicar .*durante una revisi[oó]n.*opci[oó]n integra mejor/i,
  /en una pregunta de interpretaci[oó]n sobre .*respuesta relaciona mejor definici[oó]n y funci[oó]n/i,
  /marque la alternativa que evita el error conceptual m[aá]s frecuente/i,
  /^¿(?:cu[aá]l|qu[eé]) (?:es )?(?:la )?interpretaci[oó]n (?:es )?(?:m[aá]s )?(?:correcta|adecuada|precisa|probable|prudente|razonable)\?$/i,
  /^¿qu[eé] (?:conclusi[oó]n|afirmaci[oó]n) es correcta\?$/i,
  /^¿qu[eé] patr[oó]n funcional sugiere\?$/i,
  /^¿qu[eé] explica la disminuci[oó]n\?$/i,
  /^¿qu[eé] mecanismo es m[aá]s probable\?$/i,
  /^¿qu[eé] microorganismo explica mejor el cuadro\?$/i
];

for (const [courseId, bank] of Object.entries(byCourse)) {
  if (!bank || typeof bank !== 'object') continue;
  for (const [format, items] of Object.entries({ qcm: bank.qcm || [], vf: bank.vf || [], cases: bank.cases || [] })) {
    if (!Array.isArray(items) || !items.length) {
      const blocked = Array.isArray(bank.certification?.blockedFormats) && bank.certification.blockedFormats.includes(format);
      if (blocked) warn(`${courseId}.${format}: intentionally blocked until course-grounded reconstruction`, { courseId, format, type: 'certification-blocked-format' });
      else fail(`${courseId}.${format}: missing or empty array`, { courseId, format, type: 'missing-array' });
      continue;
    }
    const answerDistribution = [0, 0, 0, 0];
    items.forEach((item, index) => {
      const where = `${courseId}.${format}[${index}]`;
      if (!item || typeof item !== 'object') {
        fail(`${where}: invalid item`, { courseId, format, index, type: 'invalid-item' });
        return;
      }
      addStat(courseId, format);
      const id = clean(item.id || `${courseId}-${format}-${index}`);
      const globalId = `${courseId}:${format}:${id}`;
      const baseMeta = { courseId, format, index, id, where };
      if (bank.certification?.version === 'v461-course-certified') {
        if (item.qualityStatus !== 'certified') fail(`${where}: item bypassed Semester 3 certification`, { ...baseMeta, type: 'uncertified-runtime-item' });
        if (clean(item.sourceEvidence).length < 12) fail(`${where}: certified item has no usable course evidence`, { ...baseMeta, type: 'missing-course-evidence' });
      }
      if (!id) fail(`${where}: missing id`, { ...baseMeta, type: 'missing-id' });
      if (globalIds.has(globalId)) fail(`${where}: duplicate id ${id}`, { ...baseMeta, type: 'duplicate-id' });
      globalIds.add(globalId);

      const question = clean(item.question || item.prompt || '');
      const stem = clean(item.stem || item.case || item.context || '');
      const options = Array.isArray(item.options) ? item.options.map(optionText) : [];
      if (/validation-only|\b(?:qcm|vf|case)s?-\d{2,3}-v\d+\b/i.test(question)) {
        fail(`${where}: technical identifier leaked into visible question`, { ...baseMeta, type: 'technical-id-in-question', question });
      }
      const answerIndex = answerIndexOf(item, options);
      addLengthSignals(format, options, answerIndex);

      if (format === 'qcm') {
        if (question.length < 8) warn(`${where}: QCM question is very short`, { ...baseMeta, type: 'short-question' });
        if (options.length !== 4) fail(`${where}: QCM must have exactly 4 options`, { ...baseMeta, type: 'invalid-option-count', optionCount: options.length });
        if (answerIndex === null || answerIndex < 0 || answerIndex > 3) fail(`${where}: invalid QCM answer index`, { ...baseMeta, type: 'invalid-answer-index', answerIndex });
        else answerDistribution[answerIndex] += 1;
      }

      if (format === 'vf') {
        if (question.length < 8) warn(`${where}: V/F question is very short`, { ...baseMeta, type: 'short-question' });
        if (answerIndex === null || answerIndex < 0 || answerIndex > 1) fail(`${where}: invalid V/F answer index`, { ...baseMeta, type: 'invalid-answer-index', answerIndex });
      }

      if (format === 'cases') {
        if ((stem + ' ' + question).trim().length < 50) warn(`${where}: clinical case is short`, { ...baseMeta, type: 'short-clinical-case' });
        if (options.length !== 4) fail(`${where}: clinical case must have exactly 4 options`, { ...baseMeta, type: 'invalid-option-count', optionCount: options.length });
        if (answerIndex === null || answerIndex < 0 || answerIndex > 3) fail(`${where}: invalid case answer index`, { ...baseMeta, type: 'invalid-answer-index', answerIndex });
      }

      if ((format === 'qcm' || format === 'cases') && options.length) {
        const empty = options.findIndex((option) => !option);
        if (empty !== -1) fail(`${where}: option ${empty + 1} is empty`, { ...baseMeta, type: 'empty-option', optionIndex: empty });
        const uniqueOptions = new Set(options.map(norm));
        if (uniqueOptions.size !== options.length) fail(`${where}: duplicate options`, { ...baseMeta, type: 'duplicate-options' });
      }
      if (!hasExplanation(item)) warn(`${where}: explanation appears short or missing`, { ...baseMeta, type: 'short-or-missing-explanation', explanationLength: explanationText(item).length });

      const normalizedQuestion = norm(question);
      if (normalizedQuestion) exactQuestions.set(normalizedQuestion, [...(exactQuestions.get(normalizedQuestion) || []), baseMeta]);
      if (question && boilerplatePatterns.some((pattern) => pattern.test(question))) {
        boilerplatePrompts.push({ ...baseMeta, question });
      }

      const signature = norm(itemText(item));
      if (signature.length > 40) {
        exactTexts.set(signature, [...(exactTexts.get(signature) || []), { ...baseMeta, signaturePreview: signature.slice(0, 160) }]);
      }
    });
    if ((format === 'qcm' || format === 'cases') && items.length >= 40) {
      const max = Math.max(...answerDistribution);
      const min = Math.min(...answerDistribution);
      if (max > min * 4 + 20) warn(`${courseId}.${format}: answer distribution is imbalanced ${answerDistribution.join('/')}`, { courseId, format, type: 'answer-distribution-imbalance', distribution: answerDistribution });
    }
  }
}

const repeated = [...exactTexts.entries()].filter(([, occurrences]) => occurrences.length > 1);
if (repeated.length) {
  fail(`Exact duplicate question signatures detected: ${repeated.length}`, {
    type: 'duplicate-question-signatures',
    duplicateSignatureCount: repeated.length,
    samples: repeated.slice(0, 50).map(([signature, occurrences]) => ({ signaturePreview: signature.slice(0, 160), occurrences }))
  });
}

const overusedQuestions = [...exactQuestions.entries()].filter(([, occurrences]) => occurrences.length > 2);
if (overusedQuestions.length) {
  fail(`Question texts repeated more than twice: ${overusedQuestions.length}`, {
    type: 'overused-question-prompts',
    overusedPromptCount: overusedQuestions.length,
    samples: overusedQuestions.slice(0, 50).map(([question, occurrences]) => ({ question: question.slice(0, 220), count: occurrences.length, occurrences }))
  });
}

if (boilerplatePrompts.length) {
  fail(`Generic boilerplate prompts detected: ${boilerplatePrompts.length}`, {
    type: 'generic-boilerplate-prompts',
    boilerplatePromptCount: boilerplatePrompts.length,
    samples: boilerplatePrompts.slice(0, 100)
  });
}

Object.entries(stats.qualitySignals).forEach(([format, signal]) => {
  if (!signal.eligible) return;
  const longestRate = signal.correctStrictlyLongest / signal.eligible;
  const obviousRate = signal.obviousLengthCue / signal.eligible;
  const obviousShortRate = signal.obviousShortCue / signal.eligible;
  if (longestRate > 0.35 || obviousRate > 0.01 || obviousShortRate > 0.01) {
    warn(`${format}: answer-length cue remains elevated (${(longestRate * 100).toFixed(1)}% strictly longest; ${(obviousRate * 100).toFixed(1)}% obvious long; ${(obviousShortRate * 100).toFixed(1)}% obvious short)`, {
      format,
      type: 'answer-length-cue-debt',
      eligible: signal.eligible,
      correctStrictlyLongest: signal.correctStrictlyLongest,
      obviousLengthCue: signal.obviousLengthCue,
      obviousShortCue: signal.obviousShortCue
    });
  }
});

if (stats.checkedItems < 1000) fail(`Expected to check at least 1000 bank items, got ${stats.checkedItems}`, { type: 'too-few-items', checkedItems: stats.checkedItems });

writeReports();

if (warnings.length) {
  console.warn('Question bank deep integrity warnings:');
  warnings.slice(0, 80).forEach((item) => console.warn(`- ${item.message}`));
  if (warnings.length > 80) console.warn(`...and ${warnings.length - 80} more warnings`);
  console.warn(`Full report written to ${path.relative(root, reportTxtPath)} and ${path.relative(root, reportJsonPath)}`);
}
if (problems.length) {
  console.error('Question bank deep integrity failed:');
  problems.slice(0, 100).forEach((item) => console.error(`- ${item.message}`));
  if (problems.length > 100) console.error(`...and ${problems.length - 100} more`);
  console.error(`Full report written to ${path.relative(root, reportTxtPath)} and ${path.relative(root, reportJsonPath)}`);
  process.exit(1);
}
console.log(`Question bank deep integrity OK across ${stats.checkedItems} items. Warnings: ${warnings.length}.`);
console.log(`Quality report written to ${path.relative(root, reportTxtPath)} and ${path.relative(root, reportJsonPath)}.`);
