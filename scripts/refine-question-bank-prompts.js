#!/usr/bin/env node
/*
 * Rewrites duplicated or boilerplate practice prompts without changing answers,
 * options or explanations. Fisiologia is updated through its split sources;
 * the other restored legacy banks are updated in their authoritative JS files.
 *
 * Usage:
 *   node scripts/refine-question-bank-prompts.js          # dry run
 *   node scripts/refine-question-bank-prompts.js --write  # persist changes
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const write = process.argv.includes('--write');
const verbose = process.argv.includes('--verbose');
const formats = ['qcm', 'cases', 'vf'];
const runtimeBankFiles = {
  microbiologia: 'data/practice-bank-microbiologia.js',
  genetica: 'data/practice-bank-genetica.js',
  bioquimica: 'data/practice-bank-bioquimica.js',
  inmunologia: 'data/practice-bank-inmunologia.js'
};

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}
function norm(value) {
  return clean(value).toLowerCase();
}
function lowerFirst(value) {
  const text = clean(value);
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}
function optionText(option) {
  if (option == null) return '';
  if (typeof option === 'object') return clean(option.text || option.label || option.value || option.content || JSON.stringify(option));
  return clean(option);
}
function answerIndexOf(item) {
  const keys = ['answerIndex', 'correctIndex', 'correctOptionIndex', 'correctAnswerIndex'];
  for (const key of keys) if (Number.isInteger(item[key])) return item[key];
  const raw = item.answer ?? item.correct ?? item.correctAnswer ?? item.correctOption ?? item.answerKey ?? item.correctKey;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'boolean') return raw ? 0 : 1;
  if (typeof raw === 'string' && /^[A-D]$/i.test(raw.trim())) return raw.trim().toUpperCase().charCodeAt(0) - 65;
  return 0;
}
function itemSignature(item) {
  return norm([
    item.stem,
    item.case,
    item.context,
    item.question,
    ...(Array.isArray(item.options) ? item.options.map(optionText) : [])
  ].join(' '));
}
function hash(value) {
  let out = 2166136261;
  for (const char of String(value || '')) {
    out ^= char.charCodeAt(0);
    out = Math.imul(out, 16777619);
  }
  return out >>> 0;
}
function stripQuestionMarks(value) {
  return clean(value).replace(/^[¿?]+|[¿?]+$/g, '').replace(/[.:;]+$/g, '').trim();
}
function conceptFromCorrectOption(item) {
  const options = Array.isArray(item.options) ? item.options.map(optionText) : [];
  const answer = options[answerIndexOf(item)] || '';
  const parts = answer.split(';').map(clean).filter(Boolean);
  if (parts.length < 2) return '';
  const label = parts[0].replace(/^\d+[.)-]?\s*/, '').replace(/^[A-D][.)-]\s*/i, '').trim();
  if (label.length < 3 || label.length > 90) return '';
  return stripQuestionMarks(label);
}
function optionScope(item) {
  const labels = (Array.isArray(item.options) ? item.options : [])
    .map(optionText)
    .map((text) => text.split(';').map(clean).filter(Boolean))
    .filter((parts) => parts.length > 1)
    .map((parts) => stripQuestionMarks(parts[0].replace(/^\d+[.)-]?\s*/, '').replace(/^[A-D][.)-]\s*/i, '')))
    .filter((label) => label.length >= 3 && label.length <= 60)
    .filter((label, index, labels) => labels.findIndex((other) => norm(other) === norm(label)) === index);
  return labels.length >= 2 ? labels.slice(0, 4).join(', ') : '';
}
function usefulHeading(item) {
  const heading = stripQuestionMarks(item.heading || item.tags?.sourceHeading || '');
  if (!heading) return '';
  if (/^(caso(?: cl[ií]nico)?|m[oó]dulo)\s*\d*/i.test(heading)) return '';
  if (/^(correlaci[oó]n cl[ií]nica|en examen|trampa de examen|integraci[oó]n|caso directo|tipo examen)$/i.test(heading)) return '';
  return heading;
}
function focusOf(item) {
  const optionConcept = conceptFromCorrectOption(item);
  if (optionConcept) return optionConcept;
  const heading = usefulHeading(item);
  if (heading) return heading;
  const moduleTitle = stripQuestionMarks(item.moduleTitle || '');
  if (moduleTitle) return moduleTitle;
  const tagged = stripQuestionMarks(item.tags?.topic || item.teachingFocus || '');
  if (tagged && tagged.length >= 3 && tagged.length <= 90 && !/^caso cl[ií]nico/i.test(tagged)) return tagged;
  return stripQuestionMarks(item.heading || 'el tema evaluado');
}
function caseTextField(item) {
  if (clean(item.stem)) return 'stem';
  if (clean(item.case)) return 'case';
  if (clean(item.context)) return 'context';
  return 'stem';
}
function cueOf(item) {
  const text = clean(item.stem || item.case || item.context || '');
  if (!text) return '';
  const firstSentence = clean((text.match(/^.*?(?:[.!?](?:\s|$)|$)/) || [text])[0]).replace(/[.!?]+$/g, '');
  if (firstSentence.length <= 112) return firstSentence;
  const cut = firstSentence.slice(0, 109).replace(/\s+\S*$/, '').trim();
  return cut + '…';
}
function embeddedPreamble(question) {
  const text = clean(question);
  const position = text.lastIndexOf('¿');
  if (position <= 8) return '';
  const preamble = clean(text.slice(0, position)).replace(/[.:;]+$/g, '').trim();
  if (preamble.length < 8 || preamble.length > 180) return '';
  if (/^(en una evaluaci[oó]n parcial|en formato de examen|en una pregunta de interpretaci[oó]n sobre|un estudiante debe explicar .*durante una revisi[oó]n|sobre |con respecto a |para reconocer correctamente |para responder una pregunta sobre )/i.test(preamble)) return '';
  return preamble + '.';
}
function isNegativePrompt(question) {
  return /\b(excepto|opci[oó]n incorrecta|afirmaci[oó]n incorrecta|enunciado incorrecto|afirmaci[oó]n falsa|no corresponde|no es correcta)\b/i.test(question);
}
function isCombinationPrompt(question) {
  return /(combinaci[oó]n correcta|clasifi(?:que|ca).*verdader|enunciados.*verdader|seg[uú]n sean verdaderos)/i.test(question);
}
function isDiagnosisPrompt(item, question) {
  return item.courseId === 'microbiologia' && /(diagn[oó]stic|microbiol[oó]gic|microorganismo|agente causal)/i.test(question);
}
function isProbabilityPrompt(question) {
  return /(probabilidad|cuadro de punnett|riesgo de recurrencia)/i.test(question);
}

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
  /marque la alternativa que evita el error conceptual m[aá]s frecuente/i
];
const genericSourcePatterns = [
  /^¿(?:cu[aá]l|qu[eé]) (?:es )?(?:la )?interpretaci[oó]n (?:es )?(?:m[aá]s )?(?:correcta|adecuada|precisa|probable|prudente|razonable)\?$/i,
  /^¿qu[eé] (?:conclusi[oó]n|afirmaci[oó]n) es correcta\?$/i,
  /^¿qu[eé] patr[oó]n funcional sugiere\?$/i,
  /^¿qu[eé] explica la disminuci[oó]n\?$/i,
  /^¿qu[eé] mecanismo es m[aá]s probable\?$/i,
  /^¿qu[eé] microorganismo explica mejor el cuadro\?$/i,
  /^¿qu[eé] mecanismo (?:fisiol[oó]gico )?explica mejor (?:este|el) (?:caso|cuadro|resultado|hallazgo)(?: descrito)?\?$/i,
  /^¿qu[eé] (?:conclusi[oó]n|respuesta) (?:es|ser[ií]a) (?:la )?m[aá]s (?:correcta|adecuada|precisa|[uú]til)\?$/i,
  /qu[eé] principio diagn[oó]stico se aplica/i,
  /qu[eé] diagn[oó]stico o interpretaci[oó]n microbiol[oó]gica es m[aá]s probable/i,
  /qu[eé] probabilidad debe comunicarse/i,
  /cu[aá]l lectura del cuadro de punnett es correcta/i,
  /qu[eé] opci[oó]n integra mejor/i,
  /^sobre .*(?:marque|todos los enunciados)/i,
  /^con respecto a .*cu[aá]l afirmaci[oó]n es correcta/i,
  /^todos los siguientes datos pueden relacionarse con/i,
  /^para responder una pregunta sobre/i
];
function isBoilerplate(question) {
  return boilerplatePatterns.some((pattern) => pattern.test(question));
}
function isGenericSourcePrompt(question) {
  return genericSourcePatterns.some((pattern) => pattern.test(question));
}

const qcmPositive = [
  (f) => `En relación con «${f}», ¿qué afirmación es correcta?`,
  (f) => `¿Cuál enunciado describe con precisión «${f}»?`,
  (f) => `¿Qué relación conceptual sobre «${f}» se mantiene correcta?`,
  (f) => `Respecto de «${f}», ¿qué opción conserva el mecanismo adecuado?`,
  (f) => `¿Cuál alternativa aplica correctamente los principios de «${f}»?`,
  (f) => `Al analizar «${f}», ¿qué afirmación evita invertir causa y consecuencia?`,
  (f) => `¿Qué opción vincula de forma correcta los elementos de «${f}»?`,
  (f) => `¿Cuál afirmación caracteriza correctamente «${f}»?`,
  (f) => `¿Qué enunciado interpreta de manera correcta «${f}»?`,
  (f) => `¿Cuál opción diferencia con exactitud «${f}»?`,
  (f) => `¿Qué proposición acerca de «${f}» es válida?`,
  (f) => `¿Cuál relación sobre «${f}» está formulada correctamente?`,
  (f) => `¿Qué opción expresa con exactitud el concepto de «${f}»?`,
  (f) => `En «${f}», ¿qué secuencia causal es correcta?`,
  (f) => `¿Qué afirmación permite reconocer correctamente «${f}»?`,
  (f) => `¿Cuál alternativa mantiene la función propia de «${f}»?`
];
const qcmNegative = [
  (f) => `Respecto de «${f}», ¿qué afirmación es incorrecta?`,
  (f) => `Todas las afirmaciones sobre «${f}» son correctas, EXCEPTO:`,
  (f) => `¿Qué alternativa contradice el mecanismo de «${f}»?`,
  (f) => `¿Cuál enunciado es incompatible con «${f}»?`,
  (f) => `En relación con «${f}», señale la opción falsa.`,
  (f) => `¿Qué proposición invierte de forma incorrecta la relación propia de «${f}»?`,
  (f) => `¿Cuál alternativa no corresponde a «${f}»?`,
  (f) => `Al revisar «${f}», ¿qué afirmación debe descartarse?`
];
const combinationPrompts = [
  (f) => `¿Qué alternativa clasifica correctamente los enunciados sobre «${f}»?`,
  (f) => `Tras valorar cada enunciado de «${f}», ¿qué combinación es correcta?`,
  (f) => `¿Cuál combinación refleja de forma exacta las afirmaciones válidas sobre «${f}»?`,
  (f) => `En «${f}», ¿qué secuencia de verdadero y falso es correcta?`,
  (f) => `¿Qué opción integra correctamente la validez de los enunciados sobre «${f}»?`,
  (f) => `¿Cuál alternativa asigna correctamente verdadero o falso en «${f}»?`
];
const casePrompts = {
  fisiologia: [
    (f) => `¿Qué mecanismo fisiológico relacionado con «${f}» explica los hallazgos?`,
    (f) => `¿Cuál interpretación fisiológica de «${f}» concuerda con el caso?`,
    (f) => `¿Qué relación funcional de «${f}» permite explicar el dato central?`,
    (f) => `¿Cuál opción integra correctamente el cambio observado con «${f}»?`
  ],
  microbiologia: [
    (f) => `¿Qué interpretación microbiológica de «${f}» integra los hallazgos?`,
    (f) => `¿Cuál opción relaciona correctamente el cuadro con «${f}»?`,
    (f) => `¿Qué conclusión microbiológica sobre «${f}» está respaldada por el caso?`,
    (f) => `¿Cuál alternativa explica mejor los datos desde «${f}»?`
  ],
  genetica: [
    (f) => `¿Qué interpretación genética de «${f}» se deduce de los datos?`,
    (f) => `¿Cuál opción aplica correctamente «${f}» al escenario presentado?`,
    (f) => `¿Qué conclusión sobre «${f}» está respaldada por el caso?`,
    (f) => `¿Cuál razonamiento genético vincula el hallazgo con «${f}»?`
  ],
  bioquimica: [
    (f) => `¿Qué relación bioquímica vinculada a «${f}» permite interpretar el dato central?`,
    (f) => `¿Cuál alternativa aplica correctamente «${f}» al escenario?`,
    (f) => `¿Qué mecanismo de «${f}» concuerda con los datos presentados?`,
    (f) => `¿Cuál opción conserva la relación bioquímica correcta en «${f}»?`
  ],
  inmunologia: [
    (f) => `¿Qué mecanismo inmunológico de «${f}» concuerda con el escenario?`,
    (f) => `¿Cuál interpretación de «${f}» explica el hallazgo central?`,
    (f) => `¿Qué opción relaciona correctamente el caso con «${f}»?`,
    (f) => `¿Cuál alternativa conserva la secuencia inmunológica de «${f}»?`
  ]
};
const commonCasePrompts = [
  (f) => `¿Cuál de las opciones vincula correctamente los datos del caso con «${f}»?`,
  (f) => `En el contexto de «${f}», ¿qué conclusión está respaldada por los hallazgos?`,
  (f) => `¿Qué afirmación permite resolver el caso sin contradecir «${f}»?`,
  (f) => `¿Cuál es la interpretación más consistente del escenario en relación con «${f}»?`,
  (f) => `¿Qué opción explica de forma coherente el hallazgo central desde «${f}»?`,
  (f) => `A la luz de «${f}», ¿cuál alternativa integra correctamente el dato clave y su consecuencia?`,
  (f) => `¿Qué razonamiento sobre «${f}» se ajusta al escenario descrito?`,
  (f) => `¿Cuál opción relaciona correctamente el hallazgo principal con «${f}»?`,
  (f) => `¿Qué alternativa conserva la relación causal evaluada en «${f}»?`,
  (f) => `¿Cuál interpretación convierte los datos en una conclusión válida sobre «${f}»?`,
  (f) => `¿Qué opción aplica sin contradicciones el principio central de «${f}»?`,
  (f) => `¿Cuál conclusión explica el escenario de acuerdo con «${f}»?`,
  (f) => `¿Qué relación entre hallazgo y mecanismo es válida en «${f}»?`,
  (f) => `¿Cuál alternativa interpreta el dato principal dentro de «${f}»?`,
  (f) => `¿Qué opción mantiene la dirección causal correcta al analizar «${f}»?`,
  (f) => `¿Cuál razonamiento integra mejor el contexto con «${f}»?`,
  (f) => `¿Qué interpretación es compatible con los principios de «${f}»?`,
  (f) => `¿Cuál opción permite pasar del dato observado al mecanismo de «${f}»?`,
  (f) => `¿Qué alternativa responde al problema planteado desde «${f}»?`,
  (f) => `¿Cuál conclusión sobre «${f}» se sostiene con la información disponible?`,
  (f) => `¿Qué opción conserva la coherencia entre el escenario y «${f}»?`,
  (f) => `¿Cuál interpretación de «${f}» resuelve de forma consistente el caso?`
];
const negativeCasePrompts = [
  (f) => `En el caso relacionado con «${f}», ¿qué razonamiento es incompatible con los datos?`,
  (f) => `Todas las interpretaciones de «${f}» concuerdan con el caso, EXCEPTO:`,
  (f) => `¿Qué alternativa contradice los hallazgos al analizar «${f}»?`,
  (f) => `¿Cuál opción debe descartarse al interpretar el caso desde «${f}»?`,
  (f) => `Respecto de «${f}», ¿qué conclusión no está respaldada por el escenario?`,
  (f) => `¿Qué razonamiento invierte de forma incorrecta la relación observada en «${f}»?`,
  (f) => `Al integrar el caso con «${f}», ¿qué alternativa resulta falsa?`,
  (f) => `¿Cuál interpretación no conserva la relación causal de «${f}»?`,
  (f) => `¿Qué opción es incompatible con el mecanismo esperado en «${f}»?`,
  (f) => `En «${f}», ¿qué conclusión no puede sostenerse con los datos?`,
  (f) => `¿Cuál razonamiento debe excluirse al resolver el escenario de «${f}»?`,
  (f) => `¿Qué alternativa contradice el dato central relacionado con «${f}»?`,
  (f) => `¿Cuál opción formula de manera errónea la relación evaluada en «${f}»?`,
  (f) => `Al analizar «${f}», ¿qué interpretación no se ajusta al escenario?`,
  (f) => `¿Qué conclusión sobre «${f}» queda refutada por los hallazgos?`,
  (f) => `¿Cuál alternativa rompe la coherencia entre el caso y «${f}»?`,
  (f) => `¿Qué opción atribuye de forma incorrecta el hallazgo a «${f}»?`,
  (f) => `¿Cuál afirmación no permite explicar el caso desde «${f}»?`,
  (f) => `En la interpretación de «${f}», ¿qué razonamiento debe rechazarse?`,
  (f) => `¿Qué alternativa no respeta la secuencia causal de «${f}»?`,
  (f) => `¿Cuál opción se opone a la explicación esperada en «${f}»?`,
  (f) => `¿Qué interpretación sobre «${f}» es incongruente con el escenario?`,
  (f) => `¿Cuál conclusión no deriva de los datos al aplicar «${f}»?`,
  (f) => `¿Qué razonamiento altera de manera errónea el mecanismo de «${f}»?`,
  (f) => `¿Cuál alternativa debe eliminarse por contradecir «${f}»?`,
  (f) => `¿Qué opción no mantiene la relación esperada entre el hallazgo y «${f}»?`
];

function uniqueQuestion(item, format, originalQuestion, seenQuestions) {
  const focus = focusOf(item);
  const preamble = embeddedPreamble(originalQuestion);
  const cue = cueOf(item) || preamble.replace(/[.!?]+$/g, '');
  let templates;
  if (format === 'qcm' && isCombinationPrompt(originalQuestion)) templates = combinationPrompts;
  else if (format === 'qcm') templates = isNegativePrompt(originalQuestion) ? qcmNegative : qcmPositive;
  else templates = isNegativePrompt(originalQuestion)
    ? negativeCasePrompts
    : [...(casePrompts[item.courseId] || []), ...commonCasePrompts];

  if (format === 'cases' && isDiagnosisPrompt(item, originalQuestion)) {
    templates = [
      () => '¿Cuál es el diagnóstico microbiológico que mejor integra la presentación y el dato discriminante?',
      () => '¿Qué diagnóstico explica de manera más coherente el conjunto de hallazgos?',
      () => '¿Cuál interpretación diagnóstica concuerda con la clínica y los datos microbiológicos?',
      () => '¿Qué entidad microbiológica reúne mejor los hallazgos del caso?',
      ...templates
    ];
  } else if (format === 'cases' && isProbabilityPrompt(originalQuestion)) {
    templates = [
      (f) => `¿Qué probabilidad genética se obtiene al aplicar correctamente «${f}»?`,
      (f) => `¿Cuál riesgo debe comunicarse según los datos de «${f}»?`,
      (f) => `¿Qué resultado probabilístico corresponde al cruce descrito en «${f}»?`,
      ...templates
    ];
  }

  const start = hash(item.id) % templates.length;
  const candidates = [];
  for (let step = 0; step < templates.length; step += 1) {
    const prompt = clean(templates[(start + step) % templates.length](focus));
    candidates.push(clean(`${preamble} ${prompt}`));
  }
  const scope = optionScope(item);
  if (scope && !norm(focus).includes(norm(scope))) {
    const detailedFocus = `${focus}: ${scope}`;
    for (let step = 0; step < templates.length; step += 1) {
      const prompt = clean(templates[(start + step) % templates.length](detailedFocus));
      candidates.push(clean(`${preamble} ${prompt}`));
    }
  }
  if (cue) {
    const lead = `A partir del dato «${cue}»`;
    candidates.push(`${lead}, ¿qué opción permite interpretar correctamente «${focus}»?`);
    candidates.push(`${lead}, ¿cuál conclusión es compatible con «${focus}»?`);
    candidates.push(`${lead}, ¿qué relación causal debe conservarse al responder?`);
  }
  const expandedFocus = [focus, usefulHeading(item), stripQuestionMarks(item.moduleTitle || '')]
    .filter(Boolean)
    .filter((value, index, values) => values.findIndex((other) => norm(other) === norm(value)) === index)
    .join(' · ');
  if (expandedFocus && norm(expandedFocus) !== norm(focus)) {
    candidates.push(`¿Qué afirmación integra correctamente «${expandedFocus}»?`);
    candidates.push(`En «${expandedFocus}», ¿cuál alternativa se ajusta a los datos?`);
  }

  const candidate = candidates.find((value) => value && (seenQuestions.get(norm(value)) || 0) < 2);
  if (!candidate) throw new Error(`Could not create a unique prompt for ${item.id}`);
  seenQuestions.set(norm(candidate), (seenQuestions.get(norm(candidate)) || 0) + 1);
  return candidate;
}

function splitEmbeddedCase(item) {
  if (clean(item.stem || item.case || item.context)) return;
  const original = clean(item.question);
  const position = original.lastIndexOf('¿');
  if (position <= 12) return;
  const scenario = clean(original.slice(0, position));
  if (scenario.length >= 12) item.stem = scenario;
}
function rephraseRepeatedStem(item, ordinal) {
  const field = caseTextField(item);
  const original = clean(item[field]);
  if (!original) return false;
  const leads = [
    'En una evaluación dirigida, ',
    'Durante una nueva valoración, ',
    'Al integrar los datos disponibles, ',
    'En una revisión clínica o de laboratorio, '
  ];
  item[field] = leads[(ordinal - 1) % leads.length] + lowerFirst(original);
  return true;
}
function contextualizeVf(item) {
  const original = clean(item.question).replace(/^¿?verdadero o falso\??\s*/i, '').trim();
  const topic = stripQuestionMarks(item.moduleTitle || usefulHeading(item) || 'el tema evaluado');
  item.question = `Al revisar «${topic}», se plantea la siguiente afirmación: ${original}`;
}

function loadRuntimeBank(courseId, relativeFile) {
  const context = vm.createContext({ window: {}, console: { log() {}, warn() {}, error() {} } });
  const code = fs.readFileSync(path.join(root, relativeFile), 'utf8');
  vm.runInContext(code, context, { filename: relativeFile, timeout: 20000 });
  const bank = context.window.MED_PRACTICE_BANK?.byCourse?.[courseId];
  if (!bank) throw new Error(`Unable to load ${courseId} from ${relativeFile}`);
  return bank;
}
function loadFisiologiaSources() {
  const sourceRoot = path.join(root, 'content', 'practice', 'fisiologia');
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'manifest.json'), 'utf8'));
  const bank = { qcm: [], cases: [], vf: [] };
  const sourceArrays = [];
  for (const mod of manifest.modules || []) {
    const dir = path.join(sourceRoot, 'modules', mod.directory);
    for (const format of formats) {
      const file = path.join(dir, (mod.files && mod.files[format]) || `${format}.json`);
      const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(rows)) throw new Error(`${file} must contain an array`);
      bank[format].push(...rows);
      sourceArrays.push({ file, rows, before: JSON.stringify(rows) });
    }
  }
  return { bank, sourceArrays };
}
function serializeRuntimeBank(courseId, bank) {
  return [
    'window.MED_PRACTICE_BANK=window.MED_PRACTICE_BANK||{};',
    'window.MED_PRACTICE_BANK.byCourse=window.MED_PRACTICE_BANK.byCourse||{};',
    `window.MED_PRACTICE_BANK.byCourse[${JSON.stringify(courseId)}]=${JSON.stringify(bank)};`,
    ''
  ].join('\n');
}

const fisiologia = loadFisiologiaSources();
const banks = { fisiologia: fisiologia.bank };
for (const [courseId, file] of Object.entries(runtimeBankFiles)) banks[courseId] = loadRuntimeBank(courseId, file);

const entries = [];
for (const [courseId, bank] of Object.entries(banks)) {
  for (const format of formats) {
    for (const [index, item] of (bank[format] || []).entries()) {
      item.courseId = item.courseId || courseId;
      entries.push({ courseId, format, index, item });
    }
  }
}

const byQuestion = new Map();
const bySignature = new Map();
const byCaseStem = new Map();
for (const entry of entries) {
  const question = norm(entry.item.question || entry.item.prompt || '');
  if (question) byQuestion.set(question, [...(byQuestion.get(question) || []), entry]);
  const signature = itemSignature(entry.item);
  if (signature.length > 40) bySignature.set(signature, [...(bySignature.get(signature) || []), entry]);
  if (entry.format === 'cases') {
    const stem = norm(entry.item.stem || entry.item.case || entry.item.context || '');
    if (stem) byCaseStem.set(stem, [...(byCaseStem.get(stem) || []), entry]);
  }
}

const duplicateSignatures = [...bySignature.values()].filter((group) => group.length > 1);
const repeatedStems = [...byCaseStem.values()].filter((group) => group.length > 1);
const duplicateOrdinal = new Map();
duplicateSignatures.forEach((group) => group.forEach((entry, index) => duplicateOrdinal.set(entry, index)));
const stemOrdinal = new Map();
repeatedStems.forEach((group) => group.forEach((entry, index) => stemOrdinal.set(entry, index)));

const targets = new Set();
for (const entry of entries) {
  const question = clean(entry.item.question || entry.item.prompt || '');
  const repeats = (byQuestion.get(norm(question)) || []).length;
  if (repeats >= 5 || isBoilerplate(question) || isGenericSourcePrompt(question) || duplicateOrdinal.has(entry)) targets.add(entry);
}

const seenQuestions = new Map();
for (const entry of entries) {
  if (targets.has(entry)) continue;
  const question = norm(entry.item.question || entry.item.prompt || '');
  if (question) seenQuestions.set(question, (seenQuestions.get(question) || 0) + 1);
}

const changes = { prompts: 0, vf: 0, stems: 0, byCourse: {} };
const samples = [];
const sampleCounts = new Map();
function addChange(courseId, format) {
  const key = `${courseId}/${format}`;
  changes.byCourse[key] = (changes.byCourse[key] || 0) + 1;
}
function addSample(courseId, format, id, before, after) {
  if (!verbose) return;
  const key = `${courseId}/${format}`;
  const count = sampleCounts.get(key) || 0;
  if (count >= 2) return;
  sampleCounts.set(key, count + 1);
  samples.push({ courseId, format, id, before, after });
}

for (const entry of entries) {
  const { item, format, courseId } = entry;
  const stemPosition = stemOrdinal.get(entry) || 0;
  if (stemPosition > 0 && rephraseRepeatedStem(item, stemPosition)) {
    changes.stems += 1;
    addChange(courseId, format);
  }

  if (!targets.has(entry)) continue;
  const originalQuestion = clean(item.question || item.prompt || '');
  if (format === 'vf') {
    contextualizeVf(item);
    const normalized = norm(item.question);
    if ((seenQuestions.get(normalized) || 0) >= 2) throw new Error(`V/F rewrite is still overused: ${item.id}`);
    seenQuestions.set(normalized, (seenQuestions.get(normalized) || 0) + 1);
    changes.vf += 1;
    addChange(courseId, format);
    addSample(courseId, format, item.id, originalQuestion, item.question);
    continue;
  }

  if (format === 'cases') splitEmbeddedCase(item);
  item.question = uniqueQuestion(item, format, originalQuestion, seenQuestions);
  changes.prompts += 1;
  addChange(courseId, format);
  addSample(courseId, format, item.id, originalQuestion, item.question);
}

const finalSignatures = new Map();
const finalQuestions = new Map();
for (const entry of entries) {
  const signature = itemSignature(entry.item);
  if (signature.length > 40) finalSignatures.set(signature, (finalSignatures.get(signature) || 0) + 1);
  const question = norm(entry.item.question || entry.item.prompt || '');
  if (question) finalQuestions.set(question, (finalQuestions.get(question) || 0) + 1);
}
const duplicateSignatureCount = [...finalSignatures.values()].filter((count) => count > 1).length;
const overusedQuestionCount = [...finalQuestions.values()].filter((count) => count > 2).length;
const remainingBoilerplate = entries.filter((entry) => isBoilerplate(clean(entry.item.question || entry.item.prompt || '')));
if (duplicateSignatureCount) throw new Error(`Refinement left ${duplicateSignatureCount} duplicated signatures`);
if (overusedQuestionCount) throw new Error(`Refinement left ${overusedQuestionCount} question texts used more than twice`);
if (remainingBoilerplate.length) throw new Error(`Refinement left ${remainingBoilerplate.length} boilerplate prompts`);

if (write) {
  for (const source of fisiologia.sourceArrays) {
    if (JSON.stringify(source.rows) !== source.before) fs.writeFileSync(source.file, JSON.stringify(source.rows, null, 2) + '\n', 'utf8');
  }
  for (const [courseId, relativeFile] of Object.entries(runtimeBankFiles)) {
    fs.writeFileSync(path.join(root, relativeFile), serializeRuntimeBank(courseId, banks[courseId]), 'utf8');
  }
}

console.log(`Question-bank prompt refinement ${write ? 'written' : 'dry run'} across ${entries.length} source items.`);
console.log(`Rewritten prompts: ${changes.prompts}; contextualized V/F: ${changes.vf}; repeated stems reformulated: ${changes.stems}.`);
console.log(`Duplicate signatures after refinement: ${duplicateSignatureCount}; question texts used more than twice: ${overusedQuestionCount}; boilerplate prompts: ${remainingBoilerplate.length}.`);
Object.entries(changes.byCourse).sort().forEach(([key, count]) => console.log(`- ${key}: ${count} changes`));
samples.forEach((sample) => console.log(JSON.stringify(sample)));
