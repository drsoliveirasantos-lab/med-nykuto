#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const paths = {
  model: path.join(root, 's4-learning-model-v178.js'),
  runtime: path.join(root, 's4-learning-experience-v178.js'),
  styles: path.join(root, 's4-learning-experience-v178.css'),
  html: path.join(root, 'clase.html'),
  package: path.join(root, 'package.json')
};

const expectedLessonsBySubject = {
  nutricion: ['nutricion-2026-08-13', 'nutricion-2026-08-27'],
  fisiologia: [
    'fisiologia-2026-08-10',
    'fisiologia-2026-08-13',
    'fisiologia-2026-08-17',
    'fisiologia-2026-08-20',
    'fisiologia-2026-08-24',
    'fisiologia-2026-08-27'
  ],
  bioquimica: [
    'bioquimica-2026-08-14',
    'bioquimica-2026-08-19',
    'bioquimica-2026-08-21',
    'bioquimica-2026-08-26',
    'bioquimica-2026-08-28'
  ],
  epidemiologia: [
    'epidemiologia-bloque-anterior',
    'epidemiologia-2026-08-19',
    'epidemiologia-2026-08-26',
    'epidemiologia-2026-08-28'
  ],
  'microbiologia-teorica': [
    'microbiologia-teorica-2026-08-10',
    'microbiologia-teorica-2026-08-17',
    'microbiologia-teorica-2026-08-24'
  ],
  'microbiologia-practica': [
    'microbiologia-practica-anterior',
    'microbiologia-practica-2026-08-20',
    'microbiologia-practica-2026-08-27'
  ]
};

const expectedLessonIds = Object.values(expectedLessonsBySubject).flat();
const expectedModes = [
  ['curso', 'Comprender'],
  ['rapida', 'Repasar'],
  ['ultra', 'Recordar'],
  ['training', 'Entrenar']
];
const expectedSourceLabels = [
  'PROFESORA · CONFIRMADO',
  'REFORMULACIÓN NYKUTO',
  'AMPLIACIÓN CLÍNICA',
  'PRECISIÓN MÉDICA',
  'POR CONFIRMAR'
];
const expectedThemes = [
  ['soft', 'Claro suave'],
  ['sepia', 'Sepia lectura'],
  ['focus', 'Oscuro concentración']
];
const expectedEstimatedLessons = [
  'nutricion-2026-08-13',
  'fisiologia-2026-08-10',
  'microbiologia-teorica-2026-08-10'
];
const errors = [];

function fail(location, message) {
  errors.push(`${location}: ${message}`);
}

function expect(condition, location, message) {
  if (!condition) fail(location, message);
}

function plain(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function same(actual, expected, location, message) {
  if (JSON.stringify(plain(actual)) !== JSON.stringify(expected)) {
    fail(location, `${message} Expected ${JSON.stringify(expected)}, received ${JSON.stringify(plain(actual))}.`);
  }
}

function sorted(values) {
  return Array.from(values || []).slice().sort();
}

function readRequired(filePath, location) {
  if (!fs.existsSync(filePath)) {
    fail(location, `missing ${path.relative(root, filePath)}.`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function fold(value) {
  return JSON.stringify(value === undefined ? '' : value)
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (digit) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)])
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)])
    .replace(/⁺/g, '+')
    .replace(/⁻/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[×✕]/g, 'x')
    .replace(/[–—−]/g, '-')
    .replace(/[→⟶]/g, '->')
    .toLowerCase();
}

function labelEs(item) {
  return item && (
    item.labelEs
    || (item.label && item.label.es)
    || (item.labels && item.labels.es)
    || (typeof item.label === 'string' ? item.label : '')
  );
}

function localizedValue(value, language = 'es') {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value.map((item) => localizedValue(item, language)).filter(Boolean).join(' · ');
  }
  if (!value || typeof value !== 'object') return '';
  const aliases = language === 'pt' ? ['pt', 'br', 'es'] : ['es', 'pt', 'br'];
  const selected = aliases.map((key) => value[key]).find((candidate) => (
    typeof candidate === 'string'
      ? candidate.trim()
      : Array.isArray(candidate) && candidate.length
  ));
  return selected ? localizedValue(selected, language) : '';
}

function hasBilingualText(value, minimum = 4) {
  return localizedValue(value, 'es').length >= minimum && localizedValue(value, 'pt').length >= minimum;
}

function hasLocalizedList(value) {
  if (Array.isArray(value)) return value.every((item) => typeof item === 'string' && item.trim());
  if (!value || typeof value !== 'object') return false;
  const spanish = value.es;
  const portuguese = value.pt || value.br;
  return Array.isArray(spanish)
    && Array.isArray(portuguese)
    && spanish.every((item) => typeof item === 'string' && item.trim())
    && portuguese.every((item) => typeof item === 'string' && item.trim());
}

function hasDataMarker(text, marker) {
  const camel = marker
    .replace(/^data-/, '')
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return text.includes(marker) || text.includes(camel);
}

function atpCumulative(step) {
  if (!step) return undefined;
  if (typeof step.atpCumulative === 'number') return step.atpCumulative;
  return step.cumulative && step.cumulative.atp;
}

function nadhCumulative(step) {
  if (!step) return undefined;
  if (typeof step.nadhCumulative === 'number') return step.nadhCumulative;
  return step.cumulative && step.cumulative.nadh;
}

const modelText = readRequired(paths.model, 'model');
const runtimeText = readRequired(paths.runtime, 'runtime');
const styleText = readRequired(paths.styles, 'styles');
const classHtml = readRequired(paths.html, 'clase.html');
const packageText = readRequired(paths.package, 'package.json');

let model = null;
if (modelText) {
  const browserWindow = {};
  const sandbox = {
    window: browserWindow,
    self: browserWindow,
    globalThis: browserWindow,
    console
  };
  try {
    vm.runInNewContext(modelText, sandbox, {
      filename: path.basename(paths.model),
      timeout: 2_000
    });
    model = browserWindow.MedNykutoS4LearningModel;
  } catch (error) {
    fail('model', `cannot execute in an isolated browser-like VM: ${error.message}`);
  }
  expect(Boolean(model), 'model', 'window.MedNykutoS4LearningModel was not exported.');
}

if (model) {
  expect(model.version === 'v178', 'model/version', 'version must remain v178.');

  const subjects = model.subjects || model.subjectMeta || {};
  const subjectIds = Object.keys(subjects);
  same(sorted(subjectIds), sorted(Object.keys(expectedLessonsBySubject)), 'subjects', 'the six S4 subjects must be covered exactly.');
  Object.entries(expectedLessonsBySubject).forEach(([subjectId, lessonIds]) => {
    const subject = subjects[subjectId] || {};
    const location = `subjects/${subjectId}`;
    expect(subject.id === subjectId, location, 'stable subject id is missing.');
    expect(subject.label && typeof subject.label.es === 'string' && subject.label.es.trim().length >= 4, location, 'Spanish subject label is missing.');
    expect(subject.label && typeof subject.label.pt === 'string' && subject.label.pt.trim().length >= 4, location, 'Portuguese subject label is missing.');
    expect(Array.isArray(subject.learningPath) && subject.learningPath.length >= 4, location, 'subject-specific reasoning path is missing.');
    expect(hasBilingualText(subject.centralQuestionTemplate, 12), location, 'the central question template must be available in Spanish and Portuguese.');
    expect(Array.isArray(subject.objectives) && subject.objectives.length >= 3 && subject.objectives.every((objective) => hasBilingualText(objective, 12)), location, 'objectives must be available in Spanish and Portuguese.');
    expect(Array.isArray(subject.prerequisites) && subject.prerequisites.length >= 2 && subject.prerequisites.every((prerequisite) => hasBilingualText(prerequisite, 12)), location, 'prerequisites must be available in Spanish and Portuguese.');
    expect(hasBilingualText(subject.frequentError, 12), location, 'the frequent-error warning must be available in Spanish and Portuguese.');
    same(subject.lessonIds, lessonIds, location, 'subject lesson inventory changed.');
  });

  expect(Array.isArray(model.lessonIds), 'lessons', 'lessonIds must be an explicit array.');
  expect(model.lessonIds.length === 23, 'lessons', 'exactly 23 S4 lessons are required.');
  expect(new Set(model.lessonIds).size === 23, 'lessons', 'lesson ids must be unique.');
  same(sorted(model.lessonIds), sorted(expectedLessonIds), 'lessons', 'the semester lesson inventory is incomplete or out of scope.');
  expectedLessonIds.forEach((lessonId) => {
    const expectedSubjectId = Object.keys(expectedLessonsBySubject).find((subjectId) => expectedLessonsBySubject[subjectId].includes(lessonId));
    expect(model.lessonSubjectById && model.lessonSubjectById[lessonId] === expectedSubjectId, `lessonSubjectById/${lessonId}`, `expected ${expectedSubjectId}.`);
    if (typeof model.getSubjectForLesson === 'function') {
      const resolved = model.getSubjectForLesson(lessonId);
      const resolvedId = typeof resolved === 'string' ? resolved : resolved && resolved.id;
      expect(resolvedId === expectedSubjectId, `getSubjectForLesson/${lessonId}`, 'subject resolver returned the wrong subject.');
    }
  });

  const modes = model.modes || [];
  expect(Array.isArray(modes) && modes.length === 4, 'modes', 'exactly four primary learning intentions are required.');
  same(modes.map((mode) => [mode.panelId || mode.id, labelEs(mode)]), expectedModes, 'modes', 'primary labels or historical panel ids changed.');

  same(model.sourceLabels, expectedSourceLabels, 'sourceLabels', 'the five provenance statuses must remain exact and ordered.');
  const sourceStatuses = model.sourceStatuses || [];
  expect(Array.isArray(sourceStatuses) && sourceStatuses.length === 5, 'sourceStatuses', 'exactly five structured provenance statuses are required.');
  same(sourceStatuses.map((status) => typeof status === 'string' ? status : status && status.label), expectedSourceLabels, 'sourceStatuses', 'structured provenance labels changed.');
  same(sorted(model.estimatedLessonIds), sorted(expectedEstimatedLessons), 'estimatedLessonIds', 'the three estimated source dates changed.');
  expectedLessonIds.forEach((lessonId) => {
    const expectedStatus = expectedEstimatedLessons.includes(lessonId) ? 'POR CONFIRMAR' : null;
    expect((model.dateStatusByLesson || {})[lessonId] === expectedStatus, `dateStatusByLesson/${lessonId}`, `date provenance must be ${expectedStatus || 'null'}.`);
  });

  const themes = model.themes || model.readingThemes || [];
  expect(Array.isArray(themes) && themes.length === 3, 'themes', 'exactly three reading themes are required.');
  same(themes.map((theme) => [theme.id, labelEs(theme)]), expectedThemes, 'themes', 'reading theme ids or Spanish labels changed.');

  const specializationsByLesson = model.specializationsByLesson || {};
  same(sorted(Object.keys(specializationsByLesson)), sorted(expectedLessonIds), 'specializationsByLesson', 'every S4 lesson, and only an S4 lesson, needs a specialization.');
  const specializationTypes = new Set();
  const specializationKeys = new Set();
  const typesBySubject = {};
  let specializationNodeTotal = 0;
  expectedLessonIds.forEach((lessonId) => {
    const specialization = specializationsByLesson[lessonId] || {};
    const subjectId = model.lessonSubjectById && model.lessonSubjectById[lessonId];
    const location = `specializationsByLesson/${lessonId}`;
    expect(specialization.lessonId === lessonId, location, 'lessonId must match its registry key.');
    expect(specialization.subjectId === subjectId, location, `subjectId must remain ${subjectId}.`);
    expect(typeof specialization.type === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(specialization.type), location, 'type must be a stable kebab-case family.');
    expect(typeof specialization.key === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(specialization.key), location, 'a specific specialization key is required.');
    expect(specialization.rendererKind === specialization.type, location, 'rendererKind must identify the reusable specialization family.');
    expect(specialization.allSections === true, location, 'allSections must be true so no major topic is skipped.');
    expect(specialization.guardrail === 'derive-only', location, 'visual detail must remain derived from verified course sections.');
    expect(specialization.sourceStatus === 'REFORMULACIÓN NYKUTO', location, 'the interactive specialization is a Nykuto reformulation, not professor-authored source material.');
    expect(specialization.title && typeof specialization.title.es === 'string' && specialization.title.es.trim().length >= 4, location, 'Spanish specialization title is missing.');
    expect(specialization.title && typeof specialization.title.pt === 'string' && specialization.title.pt.trim().length >= 4, location, 'Portuguese specialization title is missing.');

    const mapping = specialization.dataMapping || {};
    const indices = mapping.sectionIndices || [];
    const titleHints = mapping.titleHints || [];
    const nodes = specialization.nodes || [];
    expect(mapping.allSections === true, `${location}/dataMapping`, 'mapping must include all sections.');
    expect(mapping.strategy === 'all-sections-in-order', `${location}/dataMapping`, 'mapping must preserve source order.');
    expect(/academic-model\.sections|rendered-course/.test(String(mapping.source || '')), `${location}/dataMapping`, 'mapping must cite the academic sections or rendered course.');
    expect(Array.isArray(indices) && indices.length >= 2, `${location}/dataMapping`, 'at least two major-topic indices are required.');
    same(indices, indices.map((_, index) => index), `${location}/dataMapping`, 'section indices must be complete and sequential from zero.');
    expect(Array.isArray(titleHints) && titleHints.length === indices.length, `${location}/dataMapping`, 'every section needs a title hint.');
    expect(Array.isArray(nodes) && nodes.length === indices.length, `${location}/nodes`, 'every mapped major topic needs exactly one node.');
    nodes.forEach((node, index) => {
      const nodeLocation = `${location}/nodes/${index}`;
      expect(node && node.id === `notion-${index + 1}`, nodeLocation, 'node id must follow notion-N.');
      expect(node && node.sectionIndex === index, nodeLocation, 'node section index must preserve course order.');
      expect(node && node.target === `section:${index}`, nodeLocation, 'node must target its exact source section.');
      expect(node && typeof node.label === 'string' && node.label.trim().length >= 2, nodeLocation, 'node label is missing.');
      expect(node && node.label === titleHints[index], nodeLocation, 'node label and source title hint diverged.');
    });
    specializationNodeTotal += nodes.length;
    if (specialization.type) specializationTypes.add(specialization.type);
    if (specialization.key) specializationKeys.add(specialization.key);
    if (!typesBySubject[subjectId]) typesBySubject[subjectId] = new Set();
    if (specialization.type) typesBySubject[subjectId].add(specialization.type);
    if (typeof model.getSpecializationForLesson === 'function') {
      expect(model.getSpecializationForLesson(lessonId) === specialization, `getSpecializationForLesson/${lessonId}`, 'resolver must return the canonical specialization.');
    }
  });
  expect(specializationTypes.size >= 8, 'specializationsByLesson/types', 'at least eight relevant specialization families are required.');
  expect(specializationKeys.size >= 16, 'specializationsByLesson/keys', 'specializations must be meaningfully tailored rather than one generic widget.');
  expect(specializationNodeTotal === 185, 'specializationsByLesson/nodes', 'all 185 established S4 notion blocks must be represented exactly once.');
  Object.keys(expectedLessonsBySubject).forEach((subjectId) => {
    expect(typesBySubject[subjectId] && typesBySubject[subjectId].size >= 1, `specializationsByLesson/subjects/${subjectId}`, 'each subject needs at least one relevant specialization family.');
  });

  const glycolysis = model.glycolysis || {};
  expect(glycolysis.lessonId === 'bioquimica-2026-08-14', 'glycolysis', 'the simulator must stay attached to the canonical glycolysis lesson.');
  expect(/citosol/.test(fold(glycolysis.location)), 'glycolysis/location', 'glycolysis must be located in the cytosol.');
  expect(/no consume o2.{0,30}direct/.test(fold(glycolysis.oxygen)), 'glycolysis/oxygen', 'glycolysis must state that it does not directly consume oxygen.');

  const steps = glycolysis.steps || [];
  expect(Array.isArray(steps) && steps.length === 10, 'glycolysis/steps', 'ten ordered reactions are required.');
  same(steps.map((step) => step.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'glycolysis/steps', 'reaction order changed.');
  const byStep = new Map(steps.map((step) => [step.number, step]));
  if (steps.length === 10) {
    same(steps.filter((step) => step.reversible === false).map((step) => step.number), [1, 3, 10], 'glycolysis/irreversible', 'only reactions 1, 3 and 10 may be irreversible.');
    same(steps.map((step) => step.multiplier), [1, 1, 1, 1, 1, 2, 2, 2, 2, 2], 'glycolysis/multipliers', 'steps 6–10 must run twice per glucose.');
    same(steps.map((step) => step.moleculesAfter), [1, 1, 1, 2, 2, 2, 2, 2, 2, 2], 'glycolysis/molecules-after', 'the pathway must show one molecule before cleavage and two three-carbon molecules from step 4 onward.');
    same(steps.map((step) => step.courseSectionIndex), [1, 1, 1, 2, 2, 3, 4, 4, 4, 4], 'glycolysis/source-sections', 'each reaction must return to its exact established course block.');
    steps.forEach((step) => {
      const location = `glycolysis/step-${step.number}`;
      expect(hasBilingualText(step.reactionType, 4), location, 'reaction type must be available in Spanish and Portuguese.');
      expect(hasBilingualText(step.whatChanges, 8), location, 'the changed molecular feature must be available in Spanish and Portuguese.');
      expect(hasBilingualText(step.whatStays, 8), location, 'the conserved molecular feature must be available in Spanish and Portuguese.');
      expect(hasBilingualText(step.whyItMatters, 8), location, 'the pedagogical reason must be available in Spanish and Portuguese.');
      expect(hasBilingualText(step.carbonMapText, 12), `${location}/carbon-map`, 'the carbon-map explanation must be available in Spanish and Portuguese.');
      expect(hasBilingualText(step.recallQuestion, 8) && hasBilingualText(step.recallAnswer, 4), `${location}/recall`, 'the step recall prompt and answer must be available in Spanish and Portuguese.');
      expect(hasLocalizedList(step.inputs) && hasLocalizedList(step.outputs), location, 'reaction inputs and outputs must be arrays or bilingual arrays.');
      expect(step.sourceStatus === 'PRECISIÓN MÉDICA', location, 'the enriched molecular explanation must keep precision provenance.');
      expect(typeof step.boardId === 'string' && step.boardId.length >= 4, location, 'the related pedagogical board is missing.');
      expect(typeof step.substrateStructureId === 'string' && step.substrateStructureId.length >= 4, location, 'the before structure is missing.');
      const productStructureIds = Array.isArray(step.productStructureIds) ? step.productStructureIds : [step.productStructureId].filter(Boolean);
      expect(productStructureIds.length >= 1, location, 'at least one after structure is required.');
      expect(Array.isArray(step.modifiedCarbons) && step.modifiedCarbons.length >= 1, location, 'modified carbon highlights are missing.');
      expect(step.modifiedCarbons.every((carbon) => Number.isInteger(carbon) && carbon >= 1 && carbon <= 6), location, 'modified carbon highlights must stay within C1–C6.');
      expect(step.carbonMap && typeof step.carbonMap === 'object' && !Array.isArray(step.carbonMap), location, 'a structured C1–C6 carbon map is required.');
      same(sorted(Object.keys(step.carbonMap || {})), ['1', '2', '3', '4', '5', '6'], `${location}/carbon-map`, 'all six original glucose carbons must remain traceable.');
      expect(Object.values(step.carbonMap || {}).every((destination) => hasBilingualText(destination, 3)), `${location}/carbon-map`, 'every carbon needs a readable destination in the localized schema.');
    });

    const step2Text = fold(byStep.get(2));
    expect(/aldosa/.test(step2Text) && /cetosa/.test(step2Text), 'glycolysis/step-2', 'step 2 must be an aldose–ketose isomerization.');
    expect(!/epimer/.test(step2Text) || /no es (?:una )?epimer/.test(step2Text), 'glycolysis/step-2', 'step 2 must not be described as epimerization.');

    const step4Text = fold(byStep.get(4));
    expect(/dhap/.test(step4Text) && /g3p/.test(step4Text), 'glycolysis/step-4', 'cleavage must yield DHAP + G3P.');
    expect(/ruptura|escision|corte|clivaje/.test(step4Text) && /c3/.test(step4Text) && /c4/.test(step4Text), 'glycolysis/step-4', 'cleavage between C3 and C4 must be explicit.');
    same(plain(byStep.get(4).carbonMap), {
      1: 'DHAP C3', 2: 'DHAP C2', 3: 'DHAP C1',
      4: 'G3P C1', 5: 'G3P C2', 6: 'G3P C3'
    }, 'glycolysis/step-4/carbon-map', 'the exact aldolase carbon split changed.');

    const step5Text = fold(byStep.get(5));
    expect(/dhap/.test(step5Text) && /g3p/.test(step5Text), 'glycolysis/step-5', 'DHAP must become G3P.');
    expect(/2 g3p|dos veces|x2/.test(step5Text), 'glycolysis/step-5', 'the two-copy consequence must be explicit.');
    same(plain(byStep.get(5).carbonMap), {
      1: 'G3P rama A C3', 2: 'G3P rama A C2', 3: 'G3P rama A C1',
      4: 'G3P rama B C1', 5: 'G3P rama B C2', 6: 'G3P rama B C3'
    }, 'glycolysis/step-5/carbon-map', 'the two G3P branches must preserve exact carbon numbering.');
    expect(hasBilingualText(byStep.get(5).transitionBadge, 4) && /x2/.test(fold(byStep.get(5).transitionBadge)), 'glycolysis/step-5', 'the bilingual “from here ×2” transition badge is missing.');

    const step6 = byStep.get(6);
    const step6Text = fold(step6);
    expect(/pi libre|fosfato inorganico libre/.test(step6Text), 'glycolysis/step-6', 'free inorganic phosphate must be explicit.');
    expect(/nad\+/.test(step6Text) && /nadh/.test(step6Text), 'glycolysis/step-6', 'NAD+ → NADH must be explicit.');
    expect(step6.atpDelta === 0, 'glycolysis/step-6', 'step 6 must not consume ATP.');
    expect(step6.nadhDelta === 2 && nadhCumulative(step6) === 2, 'glycolysis/step-6', 'step 6 must form two NADH per glucose.');

    [7, 10].forEach((number) => {
      expect(/fosforilacion.{0,40}nivel.{0,25}sustrato/.test(fold(byStep.get(number))), `glycolysis/step-${number}`, 'substrate-level phosphorylation must be explicit.');
    });
    expect(/fosfat/.test(fold(byStep.get(8))) && /c3/.test(fold(byStep.get(8))) && /c2/.test(fold(byStep.get(8))), 'glycolysis/step-8', 'phosphate shift from C3 to C2 must be explicit.');
    expect(/deshidrat/.test(fold(byStep.get(9))) && /2 h2o/.test(fold(byStep.get(9))), 'glycolysis/step-9', 'dehydration and two waters per glucose must be explicit.');
    expect(/transfiere.{0,40}fosfat|transferencia.{0,40}fosfat/.test(fold(byStep.get(10))), 'glycolysis/step-10', 'phosphate transfer from PEP to ADP must be explicit.');
    expect(/tautomer/.test(fold(byStep.get(10))), 'glycolysis/step-10', 'enol–keto tautomerization must be explicit.');
    same(plain(byStep.get(10).carbonMap), {
      1: 'Piruvato rama A C3', 2: 'Piruvato rama A C2', 3: 'Piruvato rama A C1',
      4: 'Piruvato rama B C1', 5: 'Piruvato rama B C2', 6: 'Piruvato rama B C3'
    }, 'glycolysis/step-10/carbon-map', 'the six original glucose carbons must reach their exact pyruvate positions.');

    [[1, -1], [3, -2], [7, 0], [10, 2]].forEach(([number, expectedAtp]) => {
      expect(atpCumulative(byStep.get(number)) === expectedAtp, `glycolysis/step-${number}/cumulative`, `cumulative ATP must be ${expectedAtp}.`);
    });
  }

  const invariants = glycolysis.invariants || {};
  same(invariants.irreversibleSteps, [1, 3, 10], 'glycolysis/invariants', 'declared irreversible reactions changed.');
  same(invariants.multiplierTwoSteps, [6, 7, 8, 9, 10], 'glycolysis/invariants', 'declared doubled reactions changed.');
  same(invariants.cumulativeATP, { 1: -1, 3: -2, 7: 0, 10: 2 }, 'glycolysis/invariants', 'declared cumulative ATP checkpoints changed.');
  same(invariants.substrateLevelPhosphorylationSteps, [7, 10], 'glycolysis/invariants', 'substrate-level phosphorylation checkpoints changed.');
  expect(invariants.split && invariants.split.step === 4 && /c3-c4/.test(fold(invariants.split.bond)), 'glycolysis/invariants', 'C3/C4 split declaration is missing.');

  const balance = glycolysis.balance || {};
  expect(balance.atpNet === 2, 'glycolysis/balance', 'net direct ATP must be +2.');
  expect(balance.nadhNet === 2, 'glycolysis/balance', 'direct NADH production must be +2.');
  expect(balance.pyruvateNet === 2, 'glycolysis/balance', 'one glucose must yield two pyruvates.');
  expect(/no asigna.{0,35}(?:rendimiento )?fijo.{0,20}atp/.test(fold(balance.nadhYieldCaveat)), 'glycolysis/balance', 'the main balance must not assign a fixed ATP yield to cytosolic NADH.');

  const comparisons = model.comparisons || glycolysis.comparisons || [];
  const comparisonText = fold(comparisons);
  expect(/d-glucosa/.test(comparisonText) && /l-glucosa/.test(comparisonText) && /enantiomer/.test(comparisonText), 'comparisons', 'D/L glucose enantiomers are missing.');
  expect(/manosa/.test(comparisonText) && /c2/.test(comparisonText) && /epimer/.test(comparisonText), 'comparisons', 'glucose/mannose C2 epimers are missing.');
  expect(/galactosa/.test(comparisonText) && /c4/.test(comparisonText) && /epimer/.test(comparisonText), 'comparisons', 'glucose/galactose C4 epimers are missing.');
  expect(/(?:alfa|alpha)/.test(comparisonText) && /beta/.test(comparisonText) && /c1/.test(comparisonText) && /anomer/.test(comparisonText), 'comparisons', 'alpha/beta C1 anomers are missing.');
  expect(/glucosa-6-fosfato/.test(comparisonText) && /fructosa-6-fosfato/.test(comparisonText) && /aldosa/.test(comparisonText) && /cetosa/.test(comparisonText), 'comparisons', 'G6P/F6P functional isomers are missing.');
  expect(/3-fosfoglicerato/.test(comparisonText) && /2-fosfoglicerato/.test(comparisonText) && /posicion/.test(comparisonText), 'comparisons', '3PG/2PG positional isomers are missing.');
  ['conformacion', 'configuracion', 'tautomerizacion'].forEach((term) => {
    expect(comparisonText.includes(term), 'comparisons', `${term} must be distinguished explicitly.`);
  });
  expect(!/conformacion rota enlaces/.test(comparisonText), 'comparisons', 'conformation must be described as bond rotation without breaking connectivity.');
  expect(Array.isArray(comparisons) && comparisons.length >= 7, 'comparisons', 'six molecular comparisons and one terminology distinction are required.');
  comparisons.slice(0, 6).forEach((comparison, index) => {
    const location = `comparisons/${comparison.id || index + 1}`;
    expect(typeof comparison.leftStructureId === 'string' && typeof comparison.rightStructureId === 'string', location, 'both reproducible comparison structures are required.');
    expect(typeof comparison.representation === 'string' && comparison.representation.length >= 4, location, 'the molecular representation is missing.');
    expect(Array.isArray(comparison.highlightCarbons) && comparison.highlightCarbons.length >= 1, location, 'the discriminating carbon highlight is missing.');
    ['discriminant', 'whatChanges', 'whatStays', 'recallQuestion', 'recallAnswer'].forEach((field) => {
      expect(hasBilingualText(comparison[field], 4), `${location}/${field}`, 'required comparison explanation must be available in Spanish and Portuguese.');
    });
  });

  const structures = model.structures || glycolysis.structures || [];
  expect(Array.isArray(structures) && structures.length >= 12, 'structures', 'at least twelve reproducible molecular structures are required.');
  const structureIds = structures.map((structure) => structure.id);
  expect(new Set(structureIds).size === structures.length, 'structures', 'structure ids must be unique.');
  [
    'd-glucose',
    'l-glucose',
    'd-mannose',
    'd-galactose',
    'alpha-d-glucopyranose',
    'beta-d-glucopyranose',
    'glucose-6-phosphate',
    'fructose-6-phosphate',
    'fructose-1-6-bisphosphate',
    'dihydroxyacetone-phosphate',
    'glyceraldehyde-3-phosphate',
    '1-3-bisphosphoglycerate',
    '3-phosphoglycerate',
    '2-phosphoglycerate',
    'phosphoenolpyruvate',
    'pyruvate',
    'l-lactate'
  ].forEach((structureId) => {
    const structure = structures.find((candidate) => candidate.id === structureId);
    expect(Boolean(structure), `structures/${structureId}`, 'required molecular structure is missing.');
    expect(structure && typeof structure.linearNotation === 'string' && structure.linearNotation.length >= 5, `structures/${structureId}`, 'reproducible structural notation is missing.');
    expect(structure && Array.isArray(structure.carbonGroups) && structure.carbonGroups.length >= 3, `structures/${structureId}`, 'carbon-group map is missing.');
  });
  steps.forEach((step) => {
    const referencedIds = [step.substrateStructureId]
      .concat(Array.isArray(step.substrateStructureIds) ? step.substrateStructureIds : [])
      .concat([step.productStructureId])
      .concat(Array.isArray(step.productStructureIds) ? step.productStructureIds : [])
      .filter(Boolean);
    referencedIds.forEach((structureId) => {
      expect(structureIds.includes(structureId), `glycolysis/step-${step.number}/structures`, `unknown structure reference ${structureId}.`);
    });
  });
  comparisons.slice(0, 6).forEach((comparison) => {
    [comparison.leftStructureId, comparison.rightStructureId].forEach((structureId) => {
      expect(structureIds.includes(structureId), `comparisons/${comparison.id}/structures`, `unknown structure reference ${structureId}.`);
    });
  });

  const boards = model.boards || glycolysis.boards || {};
  expect(Array.isArray(boards.core) && boards.core.length === 4, 'boards/core', 'exactly four core boards are required.');
  expect(Array.isArray(boards.archive) && boards.archive.length === 7, 'boards/archive', 'all seven faithful boards must remain archived.');
  ['core', 'archive'].forEach((collection) => {
    const entries = boards[collection] || [];
    expect(new Set(entries.map((board) => board.id)).size === entries.length, `boards/${collection}`, 'board ids must be unique.');
    entries.forEach((board, index) => {
      const source = board.path || board.src;
      const location = `boards/${collection}/${index + 1}`;
      expect(typeof source === 'string' && source.length >= 5, location, 'board source is missing.');
      expect(board.sourceStatus === 'PROFESORA · CONFIRMADO', location, 'faithful professor boards must keep professor-confirmed provenance.');
      if (source && !/^(?:https?:|data:)/.test(source)) {
        expect(fs.existsSync(path.join(root, source.replace(/^\.\//, ''))), location, `missing local board asset ${source}.`);
      }
    });
  });
  const archivePaths = new Set((boards.archive || []).map((board) => board.path || board.src));
  (boards.core || []).forEach((board) => {
    expect(archivePaths.has(board.path || board.src), `boards/core/${board.id}`, 'each core board must remain in the seven-board archive.');
  });
}

if (classHtml) {
  const modelIndex = classHtml.indexOf('s4-learning-model-v178.js');
  const notebookIndex = classHtml.indexOf('src="class-notebook-v445.js');
  const runtimeIndex = classHtml.indexOf('s4-learning-experience-v178.js');
  const styleIndex = classHtml.indexOf('s4-learning-experience-v178.css');
  expect(modelIndex >= 0, 'clase.html', 'learning model script is not referenced.');
  expect(runtimeIndex >= 0, 'clase.html', 'learning experience runtime is not referenced.');
  expect(styleIndex >= 0, 'clase.html', 'learning experience stylesheet is not referenced.');
  expect(notebookIndex >= 0, 'clase.html', 'class notebook runtime is missing.');
  expect(modelIndex >= 0 && notebookIndex >= 0 && modelIndex < notebookIndex, 'clase.html/load-order', 'learning model must load before the notebook adapter.');
  expect(notebookIndex >= 0 && runtimeIndex >= 0 && notebookIndex < runtimeIndex, 'clase.html/load-order', 'learning experience runtime must load after the notebook adapter.');
  expect(/s4-learning-model-v178\.js\?v=178/.test(classHtml), 'clase.html/cache', 'model reference must carry cache key v178.');
  expect(/s4-learning-experience-v178\.css\?v=178/.test(classHtml), 'clase.html/cache', 'stylesheet reference must carry cache key v178.');
  expect(/s4-learning-experience-v178\.js\?v=178/.test(classHtml), 'clase.html/cache', 'runtime reference must carry cache key v178.');
}

let packageJson = null;
try {
  if (packageText) packageJson = JSON.parse(packageText);
} catch (error) {
  fail('package.json', `invalid JSON: ${error.message}`);
}
if (packageJson) {
  const validateCommand = packageJson.scripts && packageJson.scripts.validate;
  expect(typeof validateCommand === 'string' && validateCommand.includes('node scripts/validate-s4-learning-experience.js'), 'package.json/validate', 'npm run validate must execute this validator.');
}

if (styleText) {
  [
    ['data-s4-course-hero', '.s4-course-hero'],
    ['data-s4-notion', '.s4-notion-card'],
    ['data-s4-specialization', '.s4-specialization'],
    ['data-s4-specialization-key', '.s4-specialization'],
    ['data-s4-specialization-node', '.s4-specialization-node'],
    ['data-s4-specialization-detail', '.s4-specialization-detail'],
    ['data-s4-recall-card', '.s4-recall-card'],
    ['data-s4-glycolysis-lab', '.s4-glycolysis-lab'],
    ['data-s4-carbon-selection', '.s4-carbon-selection-note'],
    ['data-s4-step-recall', '.s4-glycolysis-recall'],
    ['data-s4-step-source-return', '.s4-glycolysis-step-actions'],
    ['data-s4-step-board-return', '.s4-glycolysis-step-actions'],
    ['data-s4-reading-theme', '.s4-theme-switcher']
  ].forEach(([marker, classSelector]) => {
    expect(styleText.includes(marker) || styleText.includes(classSelector), `styles/${marker}`, 'scoped learning-experience selector is missing.');
  });
  expect(/@media\s*\([^)]*max-width\s*:\s*(?:6\d\d|7\d\d|8\d\d|900)px/i.test(styleText), 'styles/responsive', 'a phone/tablet breakpoint is required.');
  expect(/grid-template-columns\s*:\s*(?:minmax\(0,\s*)?1fr/i.test(styleText), 'styles/responsive', 'mobile one-column layout marker is missing.');
  expect(/prefers-reduced-motion\s*:\s*reduce/i.test(styleText), 'styles/accessibility', 'reduced-motion support is missing.');
  expect(/:focus-visible/.test(styleText), 'styles/accessibility', 'visible keyboard focus is missing.');
  expect(/--s4-touch\s*:\s*44px/i.test(styleText) && /(?:min-height|min-block-size)\s*:\s*var\(--s4-touch\)/i.test(styleText), 'styles/accessibility', '44px touch targets are not enforced.');
  expect(/overflow-(?:x|inline)\s*:\s*(?:auto|clip|hidden)/i.test(styleText), 'styles/responsive', 'horizontal overflow containment is missing.');
}

if (runtimeText) {
  [
    'data-s4-course-hero',
    'data-s4-course-question',
    'data-s4-objective',
    'data-s4-course-map',
    'data-s4-notion',
    'data-s4-source-status',
    'data-s4-specialization',
    'data-s4-specialization-key',
    'data-s4-specialization-node',
    'data-s4-specialization-detail',
    'data-s4-reading-theme',
    'data-s4-review-checklist',
    'data-s4-recall-card',
    'data-s4-recall-reveal',
    'data-s4-recall-answer',
    'data-s4-mastery',
    'data-s4-recall-return',
    'data-s4-glycolysis-lab',
    'data-s4-glycolysis-step',
    'data-s4-carbon',
    'data-s4-carbon-selection',
    'data-s4-transition',
    'data-s4-step-recall',
    'data-s4-step-source-return',
    'data-s4-step-board-return',
    'data-s4-counter',
    'data-s4-glycolysis-view',
    'data-s4-filter',
    'data-s4-mask-names',
    'data-s4-board',
    'data-s4-comparison'
  ].forEach((marker) => {
    expect(hasDataMarker(runtimeText, marker), `runtime/${marker}`, 'required stable DOM marker is missing.');
  });
  expect(runtimeText.includes('MedNykutoS4LearningExperience'), 'runtime/export', 'public runtime state is missing.');
  expect(runtimeText.includes('s4-learning-experience-ready'), 'runtime/ready', 'readiness marker is missing.');
  expect(/querySelector\(['"]:scope > \.managed-markdown['"]\)\s*\|\|\s*markdown/.test(runtimeText), 'runtime/managed-content', 'managed Markdown must be sectionized inside its real nested container.');
  expect(/\^H\[1-5\]\$/.test(runtimeText), 'runtime/managed-content', 'managed H1–H5 topics must remain distinct specialized notions.');
  expect(/courseSectionIndex[\s\S]{0,240}outline\[sourceIndex\]/.test(runtimeText), 'runtime/glycolysis-source-return', 'glycolysis steps must use the deliberate zero-based source-block mapping.');
  expect(/drawFischer/.test(runtimeText) && /drawHaworth/.test(runtimeText) && /drawOpenChain/.test(runtimeText), 'runtime/molecular-svg', 'the reproducible Fischer, Haworth and open-chain SVG renderers are missing.');
  expect(!/MedNykutoClassPractice|data-practice-root|data-practice-slot|\.practice-module/.test(runtimeText), 'runtime/practice-isolation', 'the learning adapter must not read, replace or rebuild certified practice banks.');
  expect(!/\[data-lesson-tab-panel=["']training["']\][\s\S]{0,180}(?:innerHTML|replaceChildren|remove\s*\()/i.test(runtimeText), 'runtime/practice-isolation', 'training panel content must not be replaced.');
}

const forbiddenFileName = ['reference_comparateur_google', 'NE_PAS_PUBLIER.png'].join('_');
const forbiddenPublishedPath = ['prototype/assets/references', forbiddenFileName].join('/');
[
  ['model', modelText],
  ['runtime', runtimeText],
  ['styles', styleText],
  ['clase.html', classHtml],
  ['package.json', packageText]
].forEach(([location, text]) => {
  expect(!String(text || '').toLowerCase().includes(forbiddenPublishedPath.toLowerCase()), location, 'the prohibited comparator reference must never be published.');
});

function scanForbiddenNames(directory) {
  const skipped = new Set(['.git', 'node_modules', 'reports']);
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (skipped.has(entry.name)) return;
    const absolute = path.join(directory, entry.name);
    expect(!entry.name.toLowerCase().includes('ne_pas_publier'), path.relative(root, absolute), 'a prohibited reference asset is present in the publishable tree.');
    if (entry.isDirectory()) scanForbiddenNames(absolute);
  });
}
scanForbiddenNames(root);

if (errors.length) {
  console.error(`S4 learning-experience validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('S4 learning-experience validation passed: 6 subjects, 23 specialized lessons, 4 intentions, 3 themes, 10 glycolysis steps and intact training banks.');
