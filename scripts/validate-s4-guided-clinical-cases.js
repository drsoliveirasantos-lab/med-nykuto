#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'content', 'class', 's4-guided-respiratory-cases.json');
const generatedPath = path.join(root, 'data', 's4-guided-clinical-cases-v177.js');
const runtimePath = path.join(root, 's4-guided-clinical-cases-v177.js');
const stylePath = path.join(root, 's4-guided-clinical-cases-v177.css');
const htmlPath = path.join(root, 'clase.html');
const driveRegistryPath = path.join(root, 'data', 'drive-files.json');
const errors = [];

const expectedLevels = ['reconocimiento', 'interpretación', 'mecanismo', 'integración'];
const expectedLessons = ['fisiologia-2026-08-10', 'fisiologia-2026-08-13'];
const expectedCaseIds = [
  's4-fisio-resp-diafragma-01',
  's4-fisio-resp-neumotorax-02',
  's4-fisio-resp-neonatal-03',
  's4-fisio-resp-asma-04',
  's4-fisio-resp-fibrosis-05',
  's4-fisio-resp-edema-06',
  's4-fisio-resp-epoc-07'
];
const fixationSourceId = 's4-resp-fixation';
const expectedDriveSources = new Map([
  ['1Rd3P52HVoLK4J4iKL8Wve-FY7ML1ytXh', {
    id: fixationSourceId,
    title: '1. Ejercicio de fijacion Ventilacion y circulacion pulmonar cont..pdf',
    modifiedAt: '2026-08-31T10:30:54.503Z',
    sizeBytes: 838992,
    sha256: 'af8868f53be98372d0817e71656f71680620fc8bbd9d94d8c16203a9db6cff48'
  }],
  ['1HPC8zwttUIQagpzyJRYBv0CyrWNXKugU', {
    id: 's4-resp-ventilation',
    title: 'Unidad I Respiratorio_Ventilación y Circulación.pdf',
    modifiedAt: '2026-08-06T23:14:39.628Z',
    sizeBytes: 1960509,
    sha256: '88a8f7c98b2593f00ea2681d63d66e5ac60e8234265bbfe24f9c932d738ea4ce'
  }],
  ['1JroULL116ctsT95fkZlRD6Epw3L5LcIh', {
    id: 's4-resp-gas-exchange',
    title: '2. Unidad I Respiratorio Intercambio y Transporte de Gases.pdf',
    modifiedAt: '2026-08-10T10:39:47.670Z',
    sizeBytes: 1352205,
    sha256: '01a8dd595f6749aa4ea65b9fc8514ce4f6d8072d12f2a4445cd846103fb1d991'
  }],
  ['1RkHRfI5NyLELx9wN_vKD92j8k10E7B-g', {
    id: 's4-resp-regulation',
    title: '3. Unidad I Regulación de la respiración.pdf',
    modifiedAt: '2026-08-31T10:33:54.286Z',
    sizeBytes: 1568077,
    sha256: 'dcba03f7f2de2fc7ddc0836604f4a4736021357ad900e2b333fdeee04b54dd84'
  }]
]);
const expectedLocalSources = new Map([
  ['s4-class-gas-exchange', {
    title: 'Difusión y transporte de gases',
    lessonId: 'fisiologia-2026-08-10',
    containerId: 'fisio-detail-2026-08-10',
    derivedFromSourceIds: ['s4-resp-gas-exchange']
  }],
  ['s4-class-regulation', {
    title: 'Control nervioso y químico de la respiración',
    lessonId: 'fisiologia-2026-08-13',
    containerId: 'fisio-detail',
    derivedFromSourceIds: ['s4-resp-regulation']
  }]
]);
const forbiddenEarlyReveal = new Map([
  ['s4-fisio-resp-diafragma-01', /paralisis|hemidiafragma/],
  ['s4-fisio-resp-neumotorax-02', /neumotorax|aire pleural/],
  ['s4-fisio-resp-neonatal-03', /surfactante/],
  ['s4-fisio-resp-asma-04', /asma|obstructiv/],
  ['s4-fisio-resp-fibrosis-05', /fibrosis|restrictiv/],
  ['s4-fisio-resp-edema-06', /edema|cardiogenic/],
  ['s4-fisio-resp-epoc-07', /epoc|obstructiv/]
]);
const expectedGuidedInferenceIds = new Set([
  's4-fisio-resp-neumotorax-02-q3',
  's4-fisio-resp-neumotorax-02-q4',
  's4-fisio-resp-neonatal-03-q3',
  's4-fisio-resp-edema-06-q3'
]);
const expectedGroundingNote = 'Deducción guiada: este paso combina datos y consignas del soporte docente; la secuencia resultante no es una cita textual.';

function fail(location, message) {
  errors.push(`${location}: ${message}`);
}

function expect(condition, location, message) {
  if (!condition) fail(location, message);
}

function visibleText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalized(value) {
  return visibleText(value)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)])
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[«»“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function hasMojibake(value) {
  return /(?:Ã.|Â.|â(?:€|†|‰|ˆ)|�)/.test(String(value || ''));
}

function hasObviousDistractorCue(value) {
  const folded = normalized(value).replace(/\bsobre todo\b/g, 'principalmente');
  return /\b(?:siempre|nunca|unicamente|solamente|exclusivamente|obligatoriamente|todos|todas|ningun|ninguna|ninguno|nada)\b|por si sol[oa]s?|sin (?:ninguna )?excepcion/.test(folded);
}

function compactNumericValue(value) {
  return String(value).replace(/,/g, '.').replace(/\s+/g, '').replace(/(?:->|–|—)/g, '→').trim();
}

function containsNumericData(caseItem, labelPattern, value, unitPattern) {
  return (caseItem.data || []).some((item) => {
    if (!labelPattern.test(normalized(item.label))) return false;
    const actualValue = compactNumericValue(item.value);
    const expectedValue = Array.isArray(value)
      ? value.map(compactNumericValue).join('→')
      : compactNumericValue(value);
    if (actualValue !== expectedValue) return false;
    return !unitPattern || unitPattern.test(normalized(item.unit));
  });
}

function checkClinicalDataset(caseItem, key, expected) {
  expected.forEach(({ label, value, unit }) => {
    expect(
      containsNumericData(caseItem, label, value, unit),
      `cases/${key}/data`,
      `missing verified value ${label} = ${value}${unit ? ' with its unit' : ''}.`
    );
  });
}

function readRequired(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(label, `missing ${path.relative(root, filePath)}.`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function extractHtmlContainer(html, id) {
  const startPattern = new RegExp(`<[^>]+\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
  const startMatch = startPattern.exec(html);
  if (!startMatch) return '';
  const rest = html.slice(startMatch.index);
  const endIndex = rest.search(/<\/section\s*>/i);
  return endIndex >= 0 ? rest.slice(0, endIndex) : rest;
}

const sourceText = readRequired(sourcePath, 'source');
const generatedText = readRequired(generatedPath, 'generated');
const runtimeText = readRequired(runtimePath, 'runtime');
const styleText = readRequired(stylePath, 'styles');
const classHtml = readRequired(htmlPath, 'clase.html');
const driveRegistryText = readRequired(driveRegistryPath, 'drive registry');

let data = null;
let driveRegistry = null;
try {
  if (sourceText) data = JSON.parse(sourceText);
} catch (error) {
  fail('source', `invalid JSON: ${error.message}`);
}
try {
  if (driveRegistryText) driveRegistry = JSON.parse(driveRegistryText);
} catch (error) {
  fail('drive registry', `invalid JSON: ${error.message}`);
}

if (data) {
  expect(data.version === 's4-v177-2026-08-31', 'metadata', 'unexpected version.');
  expect(data.semester === 4, 'metadata', 'semester must be 4.');
  expect(data.classId === 's4-e', 'metadata', 'classId must be s4-e.');
  expect(data.language === 'es', 'metadata', 'student language must be Spanish.');
  expect(data.policy === 'teacher-support-only', 'metadata', 'grounding policy must be teacher-support-only.');
  expect(visibleText(data.title).length >= 12, 'metadata', 'title is missing or too short.');
  expect(visibleText(data.description).length >= 40, 'metadata', 'description is missing or too short.');
  expect(
    JSON.stringify(data.targetLessonIds) === JSON.stringify(expectedLessons),
    'metadata',
    'targetLessonIds must remain the two existing S4 respiratory lessons.'
  );

  const driveFiles = new Map(((driveRegistry && driveRegistry.files) || []).map((item) => [item.id, item]));
  const sourceIds = new Set();
  const sourceDriveIds = new Set();
  const localSourceIds = new Set();
  expect(Array.isArray(data.sources) && data.sources.length === 6, 'sources', 'expected four teacher PDFs and two existing local S4 lessons.');
  (data.sources || []).forEach((source, index) => {
    const location = `sources/${index + 1}`;
    expect(typeof source.id === 'string' && source.id.length >= 3, location, 'stable source id is missing.');
    expect(!sourceIds.has(source.id), location, 'duplicate source id.');
    sourceIds.add(source.id);

    if (source.kind === 'teacher-pdf') {
      const expected = expectedDriveSources.get(source.driveFileId);
      expect(Boolean(expected), location, 'unexpected or non-S4 Drive file id.');
      expect(!sourceDriveIds.has(source.driveFileId), location, 'duplicate Drive file id.');
      sourceDriveIds.add(source.driveFileId);
      if (expected) {
        expect(source.id === expected.id, location, 'stable source id does not match the reviewed PDF.');
        expect(source.title === expected.title, location, 'source title does not match the reviewed PDF.');
        expect(source.modifiedAt === expected.modifiedAt, location, 'source modifiedAt does not match the reviewed PDF.');
        expect(source.sizeBytes === expected.sizeBytes, location, 'source size does not match the reviewed PDF.');
        expect(source.sha256 === expected.sha256, location, 'source SHA-256 does not match the reviewed PDF bytes.');
      }
      expect(source.mimeType === 'application/pdf', location, 'teacher source must be a PDF.');
      expect(source.visibilityStatus === 'verified_anonymous', location, 'teacher source must be anonymously verified.');
      expect(/^[a-f0-9]{64}$/.test(String(source.sha256 || '')), location, 'source SHA-256 must be 64 lowercase hexadecimal characters.');
      expect(String(source.url || '').includes(source.driveFileId), location, 'source URL does not contain its Drive id.');
      expect(Array.isArray(source.anchors) && source.anchors.length >= 3, location, 'reviewed PDF anchors are missing.');

      const registryItem = driveFiles.get(source.driveFileId);
      expect(Boolean(registryItem), location, 'Drive source is absent from data/drive-files.json.');
      if (registryItem) {
        expect(registryItem.course === 'Fisiología II', location, 'Drive source belongs to the wrong course.');
        expect(registryItem.mimeType === source.mimeType, location, 'source MIME type differs from the Drive registry.');
        expect(registryItem.visibility === source.visibilityStatus, location, 'source visibility differs from the Drive registry.');
        expect(!registryItem.missingSince, location, 'Drive source is currently marked missing.');
        ['title', 'modifiedAt', 'sizeBytes', 'url'].forEach((field) => {
          expect(source[field] === registryItem[field], location, `source ${field} differs from the Drive registry.`);
        });
      }
      return;
    }

    if (source.kind === 'class-lesson') {
      const expected = expectedLocalSources.get(source.id);
      expect(Boolean(expected), location, 'unexpected local class source.');
      localSourceIds.add(source.id);
      if (expected) {
        expect(source.title === expected.title, location, 'local lesson title changed unexpectedly.');
        expect(source.lessonId === expected.lessonId, location, 'local lesson id changed unexpectedly.');
        expect(source.containerId === expected.containerId, location, 'local lesson container changed unexpectedly.');
        expect(source.url === `clase.html#${expected.lessonId}`, location, 'local lesson URL must point to its existing lesson anchor.');
        expect(
          JSON.stringify(source.derivedFromSourceIds) === JSON.stringify(expected.derivedFromSourceIds),
          location,
          'local lesson must name the reviewed teacher PDF from which it derives.'
        );
        expect(classHtml.includes(`id="${expected.lessonId}"`), location, 'local lesson anchor is missing from clase.html.');
        expect(Boolean(extractHtmlContainer(classHtml, expected.containerId)), location, 'local lesson evidence container is missing from clase.html.');
      }
      return;
    }

    fail(location, `unsupported source kind ${source.kind || '(missing)'}.`);
  });
  expect(
    expectedDriveSources.size === sourceDriveIds.size && [...expectedDriveSources.keys()].every((id) => sourceDriveIds.has(id)),
    'sources',
    'the exact exercise and three S4 respiratory decks must all be registered.'
  );
  expect(
    expectedLocalSources.size === localSourceIds.size && [...expectedLocalSources.keys()].every((id) => localSourceIds.has(id)),
    'sources',
    'the exact two existing S4 respiratory lessons must be registered.'
  );

  const evidenceById = new Map();
  expect(Array.isArray(data.evidence) && data.evidence.length >= 20, 'evidence', 'the local evidence ledger is incomplete.');
  (data.evidence || []).forEach((evidence, index) => {
    const location = `evidence/${index + 1}`;
    expect(typeof evidence.id === 'string' && evidence.id.length >= 4, location, 'evidence id is missing.');
    expect(!evidenceById.has(evidence.id), location, 'duplicate evidence id.');
    evidenceById.set(evidence.id, evidence);
    expect(sourceIds.has(evidence.sourceId), location, 'evidence points to an unknown source.');
    expect(visibleText(evidence.locator).length >= 3, location, 'source locator is missing.');
    expect(visibleText(evidence.text).length >= 12, location, 'evidence text is missing or too short.');
    expect(!hasMojibake(evidence.text), location, 'evidence contains mojibake.');
    const localSource = expectedLocalSources.get(evidence.sourceId);
    if (localSource) {
      const containerText = normalized(extractHtmlContainer(classHtml, localSource.containerId));
      expect(containerText.includes(normalized(evidence.text)), location, 'local evidence is not present verbatim in its declared clase.html container.');
    }
  });

  const caseIds = new Set();
  const questionIds = new Set();
  const prompts = new Set();
  const qcmAnswerPositions = [0, 0, 0, 0];
  const vfAnswerPositions = [0, 0];
  const formatCounts = { qcm: 0, vf: 0 };
  const evidenceUseCounts = new Map();
  const guidedInferenceIds = new Set();
  expect(Array.isArray(data.cases) && data.cases.length === 7, 'cases', 'expected exactly the seven teacher cases.');
  (data.cases || []).forEach((caseItem, caseIndex) => {
    const location = `cases/${caseIndex + 1}`;
    expect(caseItem.id === expectedCaseIds[caseIndex], location, 'case id/order must match the seven reviewed teacher cases.');
    expect(!caseIds.has(caseItem.id), location, 'duplicate case id.');
    caseIds.add(caseItem.id);
    expect(caseItem.order === caseIndex + 1, location, 'case order must follow the teacher support.');
    expect(['caso-clinico', 'ejercicio-fijacion'].includes(caseItem.kind), location, 'invalid case kind.');
    expect(visibleText(caseItem.title).length >= 5, location, 'title is missing.');
    expect(visibleText(caseItem.objective).length >= 30, location, 'objective is missing or too short.');
    const revealPattern = forbiddenEarlyReveal.get(caseItem.id);
    expect(!revealPattern || !revealPattern.test(normalized(`${caseItem.title} ${caseItem.objective}`)), location, 'title/objective reveals the diagnosis or target answer before question 1.');
    expect(visibleText(caseItem.vignette).length >= 80, location, 'clinical vignette is missing or too short.');
    expect(!hasMojibake(JSON.stringify(caseItem)), location, 'content contains mojibake.');
    expect(Array.isArray(caseItem.sourceIds) && caseItem.sourceIds.length >= 2, location, 'case needs the exercise and at least one teaching support.');
    expect(new Set(caseItem.sourceIds || []).size === (caseItem.sourceIds || []).length, location, 'case source ids must be unique.');
    expect((caseItem.sourceIds || []).includes(fixationSourceId), location, 'every case must cite the reviewed fixation exercise.');
    (caseItem.sourceIds || []).forEach((id) => expect(sourceIds.has(id), location, `unknown source id ${id}.`));
    expect(Array.isArray(caseItem.data), location, 'case data must be an array.');
    (caseItem.data || []).forEach((item, dataIndex) => {
      const dataLocation = `${location}/data/${dataIndex + 1}`;
      expect(visibleText(item.label).length >= 2, dataLocation, 'data label is missing.');
      expect(item.value !== undefined && item.value !== null && String(item.value).trim() !== '', dataLocation, 'data value is missing.');
      const label = normalized(item.label);
      if (/\d/.test(String(item.value)) && !/^(?:ph|vef1\/?cvf)$/.test(label)) {
        expect(visibleText(item.unit).length > 0, dataLocation, 'numeric clinical data needs an explicit unit.');
      }
      if (/pao2|paco2/.test(label)) expect(/mmhg/.test(normalized(item.unit)), dataLocation, 'arterial gas pressure must use mmHg.');
      if (/hco3/.test(label)) expect(/meq\/l/.test(normalized(item.unit)), dataLocation, 'bicarbonate must use mEq/L.');
    });

    expect(Array.isArray(caseItem.questions) && caseItem.questions.length === 4, location, 'each flow must contain exactly four sequential questions.');
    expect(
      JSON.stringify((caseItem.questions || []).map((item) => item.level)) === JSON.stringify(expectedLevels),
      location,
      'reasoning levels must progress reconocimiento → interpretación → mecanismo → integración.'
    );
    (caseItem.questions || []).forEach((question, questionIndex) => {
      const questionLocation = `${location}/questions/${questionIndex + 1}`;
      expect(question.id === `${caseItem.id}-q${questionIndex + 1}`, questionLocation, 'question id must use the stable case id and sequential q-number.');
      expect(!questionIds.has(question.id), questionLocation, 'duplicate question id.');
      questionIds.add(question.id);
      const prompt = visibleText(question.prompt);
      expect(prompt.includes('¿') && prompt.endsWith('?') && prompt.length >= 20, questionLocation, 'prompt must contain one complete Spanish question.');
      const promptKey = normalized(prompt);
      expect(!prompts.has(promptKey), questionLocation, 'duplicate prompt.');
      prompts.add(promptKey);
      if (question.groundingMode) {
        expect(question.groundingMode === 'guided-inference', questionLocation, 'unsupported grounding mode.');
        expect(question.groundingNote === expectedGroundingNote, questionLocation, 'guided inference disclosure changed or may leak the target answer.');
        guidedInferenceIds.add(question.id);
      } else {
        expect(!question.groundingNote, questionLocation, 'groundingNote requires an explicit groundingMode.');
      }
      const format = question.format || 'qcm';
      const optionCount = format === 'vf' ? 2 : 4;
      expect(format === 'qcm' || format === 'vf', questionLocation, 'format must be qcm or vf.');
      if (formatCounts[format] !== undefined) formatCounts[format] += 1;
      expect(Array.isArray(question.options) && question.options.length === optionCount, questionLocation, `${format} requires exactly ${optionCount} answer options.`);
      const optionKeys = (question.options || []).map(normalized);
      expect(new Set(optionKeys).size === optionCount, questionLocation, 'answer options must be distinct.');
      if (format === 'vf') {
        expect(JSON.stringify(optionKeys) === JSON.stringify(['verdadero', 'falso']), questionLocation, 'vf options must be Verdadero then Falso.');
      }
      expect(Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < optionCount, questionLocation, 'answerIndex is invalid.');
      if (Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < optionCount) {
        (format === 'vf' ? vfAnswerPositions : qcmAnswerPositions)[question.answerIndex] += 1;
      }
      if (format === 'qcm' && Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < optionCount) {
        const correctLength = visibleText(question.options[question.answerIndex]).length;
        const distractorLengths = question.options.filter((_, index) => index !== question.answerIndex).map((option) => visibleText(option).length);
        const averageDistractorLength = distractorLengths.reduce((total, length) => total + length, 0) / distractorLengths.length;
        expect(correctLength >= averageDistractorLength * 0.4 && correctLength <= averageDistractorLength * 1.6, questionLocation, 'correct option length creates an avoidable answer cue.');
      }
      (question.options || []).forEach((option, optionIndex) => {
        expect(visibleText(option).length >= 3, questionLocation, `option ${optionIndex + 1} is too short.`);
        if (optionIndex !== question.answerIndex) {
          expect(!hasObviousDistractorCue(option), questionLocation, `distractor ${optionIndex + 1} contains an obvious absolute-word cue.`);
        }
      });
      expect(Array.isArray(question.whyWrong) && question.whyWrong.length === optionCount, questionLocation, 'whyWrong must align with every option.');
      (question.whyWrong || []).forEach((reason, optionIndex) => {
        if (optionIndex === question.answerIndex) {
          expect(reason === null || visibleText(reason) === '', questionLocation, 'the correct option must have a null/empty whyWrong slot.');
        } else {
          expect(visibleText(reason).length >= 15, questionLocation, `distractor ${optionIndex + 1} needs an explanation.`);
        }
      });
      expect(question.correction && typeof question.correction === 'object', questionLocation, 'structured correction is missing.');
      ['answer', 'mechanism', 'application', 'conclusion'].forEach((field) => {
        expect(visibleText(question.correction && question.correction[field]).length >= 20, questionLocation, `correction.${field} is missing or too short.`);
      });
      expect(Array.isArray(question.evidenceIds) && question.evidenceIds.length >= 1, questionLocation, 'at least one source evidence id is required.');
      expect(new Set(question.evidenceIds || []).size === (question.evidenceIds || []).length, questionLocation, 'question evidence ids must be unique.');
      (question.evidenceIds || []).forEach((id) => {
        evidenceUseCounts.set(id, (evidenceUseCounts.get(id) || 0) + 1);
        const evidence = evidenceById.get(id);
        expect(Boolean(evidence), questionLocation, `unknown evidence id ${id}.`);
        if (evidence) expect(caseItem.sourceIds.includes(evidence.sourceId), questionLocation, `evidence ${id} comes from a source not declared by the case.`);
      });
    });
  });

  expect(JSON.stringify([...caseIds]) === JSON.stringify(expectedCaseIds), 'cases', 'the exact seven reviewed cases must remain present and ordered.');

  expect(formatCounts.qcm === 24 && formatCounts.vf === 4, 'formats', `expected 24 contextual QCM and 4 contextual V/F, found ${formatCounts.qcm}/${formatCounts.vf}.`);
  expect(
    guidedInferenceIds.size === expectedGuidedInferenceIds.size && [...expectedGuidedInferenceIds].every((id) => guidedInferenceIds.has(id)),
    'grounding',
    'the exact four source-derived mechanisms must remain explicitly disclosed as guided inferences.'
  );
  qcmAnswerPositions.forEach((count, index) => {
    expect(count === 6, 'answers', `QCM answer position ${index} is not balanced (${count}/24).`);
  });
  vfAnswerPositions.forEach((count, index) => {
    expect(count === 2, 'answers', `V/F answer position ${index} is not balanced (${count}/4).`);
  });
  (data.evidence || []).filter((item) => expectedLocalSources.has(item.sourceId)).forEach((item) => {
    expect((evidenceUseCounts.get(item.id) || 0) > 0, `evidence/${item.id}`, 'local lesson evidence is orphaned.');
  });

  const caseById = new Map((data.cases || []).map((item) => [item.id, item]));
  const diaphragm = caseById.get('s4-fisio-resp-diafragma-01');
  const pneumothorax = caseById.get('s4-fisio-resp-neumotorax-02');
  const neonatal = caseById.get('s4-fisio-resp-neonatal-03');
  const asthma = caseById.get('s4-fisio-resp-asma-04');
  const fibrosis = caseById.get('s4-fisio-resp-fibrosis-05');
  const edema = caseById.get('s4-fisio-resp-edema-06');
  const copd = caseById.get('s4-fisio-resp-epoc-07');
  expect(Boolean(diaphragm && pneumothorax && neonatal && asthma && fibrosis && edema && copd), 'datasets', 'one or more reviewed respiratory cases are missing.');
  if (diaphragm) {
    expect((diaphragm.data || []).some((item) => /cvf disminuida/.test(normalized(item.value))), 'cases/diafragma/data', 'verified decreased-CVF trend is missing.');
  }
  if (pneumothorax) checkClinicalDataset(pneumothorax, 'neumotorax', [
    { label: /^fr$/, value: '28', unit: /respiraciones\/min/ },
    { label: /sato2|saturacion/, value: '90', unit: /%/ },
    { label: /^ph$/, value: '7.46' },
    { label: /paco2/, value: '32', unit: /mmhg/ },
    { label: /hco3/, value: '23', unit: /meq\/l/ },
    { label: /pao2/, value: '64', unit: /mmhg/ }
  ]);
  if (neonatal) checkClinicalDataset(neonatal, 'neonatal', [
    { label: /edad gestacional/, value: '29', unit: /semanas/ }
  ]);
  if (asthma) checkClinicalDataset(asthma, 'asma', [
    { label: /^cvf.*antes.*despues/, value: ['88', '91'], unit: /%/ },
    { label: /^vef1.*antes.*despues/, value: ['60', '73'], unit: /%/ },
    { label: /vef1\/?cvf.*antes.*despues/, value: ['60', '70'], unit: /%/ },
    { label: /^ph$/, value: '7.47' },
    { label: /paco2/, value: '31', unit: /mmhg/ },
    { label: /hco3/, value: '23', unit: /meq\/l/ },
    { label: /pao2/, value: '68', unit: /mmhg/ }
  ]);
  if (fibrosis) checkClinicalDataset(fibrosis, 'fibrosis', [
    { label: /^cvf/, value: '62', unit: /%/ },
    { label: /^vef1$/, value: '68', unit: /%/ },
    { label: /vef1\/?cvf/, value: '88', unit: /%/ },
    { label: /^cpt/, value: '65', unit: /%/ },
    { label: /^ph$/, value: '7.40' },
    { label: /paco2/, value: '40', unit: /mmhg/ },
    { label: /hco3/, value: '24', unit: /meq\/l/ },
    { label: /pao2/, value: '68', unit: /mmhg/ },
    { label: /sato2|saturacion/, value: '92', unit: /%/ }
  ]);
  if (edema) checkClinicalDataset(edema, 'edema', [
    { label: /fraccion de eyeccion|fevi/, value: '35', unit: /%/ },
    { label: /^ph$/, value: '7.46' },
    { label: /paco2/, value: '32', unit: /mmhg/ },
    { label: /hco3/, value: '23', unit: /meq\/l/ },
    { label: /pao2/, value: '58', unit: /mmhg/ },
    { label: /sato2|saturacion/, value: '88', unit: /%/ }
  ]);
  if (copd) checkClinicalDataset(copd, 'epoc', [
    { label: /^fr$/, value: '28', unit: /respiraciones\/min/ },
    { label: /sato2|saturacion/, value: '86', unit: /%/ },
    { label: /^vef1$/, value: '45', unit: /%/ },
    { label: /^cvf$/, value: '75', unit: /%/ },
    { label: /vef1\/?cvf/, value: '0.48' },
    { label: /pao2/, value: '54', unit: /mmhg/ },
    { label: /paco2/, value: '55', unit: /mmhg/ },
    { label: /^ph$/, value: '7.31' },
    { label: /hco3/, value: '27', unit: /meq\/l/ }
  ]);
}

if (data && generatedText) {
  const banner = [
    '/* AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.',
    '   Source: content/class/s4-guided-respiratory-cases.json',
    '   Build command: npm run build:s4-guided-cases',
    '*/'
  ].join('\n');
  const expectedGeneratedText = `${banner}\nwindow.MedNykutoS4GuidedCaseData=${JSON.stringify(data)};\n`;
  expect(generatedText === expectedGeneratedText, 'generated', 'generated runtime is stale or differs from the deterministic builder output.');
  try {
    const context = { window: {} };
    vm.runInNewContext(generatedText, context, { filename: generatedPath, timeout: 1000 });
    const generatedData = JSON.parse(JSON.stringify(context.window.MedNykutoS4GuidedCaseData));
    assert.deepStrictEqual(generatedData, data);
  } catch (error) {
    fail('generated', `generated runtime does not match its canonical JSON: ${error.message}`);
  }
  expect(generatedText.includes('AUTO-GENERATED FILE'), 'generated', 'generated-file warning is missing.');
  expect(!/MedNykutoClassPractice|MED_PRACTICE_BANK/.test(generatedText), 'generated', 'guided data must not mutate or reference existing practice banks.');
}

if (classHtml) {
  const styleMatch = /<link\b[^>]*\bhref=["']s4-guided-clinical-cases-v177\.css\?v=177["'][^>]*>/i.exec(classHtml);
  const dataMatch = /<script\b[^>]*\bsrc=["']data\/s4-guided-clinical-cases-v177\.js\?v=177["'][^>]*><\/script>/i.exec(classHtml);
  const runtimeMatch = /<script\b[^>]*\bsrc=["']s4-guided-clinical-cases-v177\.js\?v=177["'][^>]*><\/script>/i.exec(classHtml);
  const notebookMatch = /<script\b[^>]*\bsrc=["']class-notebook-v445\.js(?:\?v=[^"']+)?["'][^>]*><\/script>/i.exec(classHtml);
  expect(Boolean(styleMatch), 'clase.html', 'cache-busted guided stylesheet tag is missing.');
  expect(Boolean(dataMatch), 'clase.html', 'cache-busted generated guided-data script tag is missing.');
  expect(Boolean(runtimeMatch), 'clase.html', 'cache-busted guided-runtime script tag is missing.');
  expect(Boolean(notebookMatch), 'clase.html', 'class notebook runtime tag is missing.');
  if (dataMatch && runtimeMatch) expect(dataMatch.index < runtimeMatch.index, 'clase.html', 'guided data must load before its runtime.');
  if (notebookMatch && runtimeMatch) expect(notebookMatch.index < runtimeMatch.index, 'clase.html', 'guided runtime must initialize after notebook normalization.');
}

if (runtimeText) {
  expect(runtimeText.includes('MedNykutoS4GuidedCases'), 'runtime', 'separate S4 guided API is missing.');
  expect(runtimeText.includes('med-nykuto-s4-guided-cases-v177'), 'runtime', 'separate S4 storage namespace is missing.');
  expect(!/med-nykuto-class-practice-v431|mednykuto:practice-(?:progress|complete)/.test(runtimeText), 'runtime', 'guided mode touches ordinary practice progress or ranking.');
  expect(!/\.banks\b|MedNykutoClassPractice/.test(runtimeText), 'runtime', 'guided runtime must not read or mutate certified class banks.');
  expect(!runtimeText.includes('fisiologia-2026-08-31'), 'runtime', 'Drive upload time must not become an invented lesson date.');
  expect(!/selected\.objective/.test(runtimeText), 'runtime', 'case objective must not be rendered before question 1.');
  expect(runtimeText.includes('question.options.length === 2'), 'runtime', 'contextual V/F questions are not accepted by the runtime.');
  expect(runtimeText.includes('interactionLocked'), 'runtime', 'touch-transition lock is missing.');
  expect(runtimeText.includes('data-guided-grounding-note'), 'runtime', 'guided-inference disclosure is not rendered.');
  ['caseMode', 'guidedScope', 'data-guided-cases-dialog', 'data-guided-question', 'data-guided-next'].forEach((marker) => {
    expect(runtimeText.includes(marker), 'runtime', `required marker ${marker} is missing.`);
  });
}

expect(styleText.length >= 1000, 'styles', 'guided mobile/desktop styles appear incomplete.');
expect(!/fisiologia-2026-08-31/.test([sourceText, generatedText, runtimeText, classHtml].join('\n')), 'scope', 'an upload timestamp was turned into a fictitious lesson id.');

if (errors.length) {
  console.error(`S4 guided clinical-case validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('S4 guided clinical cases valid: 7 teacher-grounded respiratory flows, 24 contextual QCM + 4 V/F, certified banks untouched.');
