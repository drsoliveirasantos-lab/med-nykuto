const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const POLICY = 'course-only-v431';
const expectedCourses = [
  'nutricion',
  'fisiologia-2026-08-13',
  'fisiologia-2026-08-10',
  'bioquimica',
  'epidemiologia',
  'microbiologia-teorica',
  'microbiologia-practica'
];
const datedCourses = [
  'fisiologia-2026-08-17',
  'microbiologia-teorica-2026-08-17'
];
const allExpectedCourses = expectedCourses.concat(datedCourses);
const types = ['qcm', 'vf', 'cases'];
const metaQuestionWording = /\b(?:clase|curso|profesor|aula|repaso|repasar|explicad[oa]s?)\b/i;
const leakedCorrectionWording = /^¿Qué opción corrige esta afirmación:/i;
const genericQuestionWording = /¿(?:cuál es la afirmación correcta sobre|a qué concepto corresponde esta descripción)|_{3,}/i;
const patientStoryWording = /\b(?:pacientes?|personas?|familias?|parejas?|niñ[oa]s?|mujeres?|hombres?)\b/i;
const errors = [];
const prompts = new Set();
const classHtml = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
let totalQuestions = 0;
let objectiveQuestions = 0;
let strictlyLongestCorrect = 0;
const answerPositions = [0, 0, 0, 0];

function decodeEntities(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const hexadecimal = entity[1].toLowerCase() === 'x';
      const parsed = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : match;
    }
    return Object.prototype.hasOwnProperty.call(named, entity.toLowerCase()) ? named[entity.toLowerCase()] : match;
  });
}

function normalizeText(value) {
  return decodeEntities(String(value || ''))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[«»“”]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
    .toLocaleLowerCase('es');
}

function hasObviousDistractorCue(value) {
  const folded = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bsobre todo\b/g, 'principalmente')
    .replace(/\bno solo\b/g, 'ademas de');
  return /\b(?:siempre|nunca|unicamente|solamente|exclusivamente|obligatoriamente|exclusiv[oa]s?|obligatori[oa]s?|solo|sola|solos|solas|todos?|todas?|ningun|ninguna|ninguno|nada|cualquier|exactamente)\b|por si sol[oa]s?|sin (?:ninguna )?excepcion/.test(folded);
}

function normalizedOptionSet(question) {
  return question.options.map(normalizeText).sort().join('|');
}

function promptSimilarity(first, second) {
  const left = new Set(normalizeText(first).split(/\s+/).filter((token) => token.length >= 4));
  const right = new Set(normalizeText(second).split(/\s+/).filter((token) => token.length >= 4));
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  const intersection = [...left].filter((token) => right.has(token)).length;
  return intersection / union.size;
}

function extractElementById(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startPattern = new RegExp(`<([a-z][a-z0-9:-]*)\\b[^>]*\\bid=["']${escaped}["'][^>]*>`, 'i');
  const startMatch = startPattern.exec(html);
  if (!startMatch) return '';
  const tag = startMatch[1];
  const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startMatch.index;
  let depth = 0;
  let token;
  while ((token = tokenPattern.exec(html))) {
    if (token.index === startMatch.index || !/^<\//.test(token[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return html.slice(startMatch.index, tokenPattern.lastIndex);
  }
  return '';
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

global.window = { location: { hash: '' }, addEventListener() {} };
global.document = { getElementById() { return null; } };

require(path.join(root, 'grupo-3-practice-v413.js'));
require(path.join(root, 'grupo-3-practice-expansion-v420.js'));
require(path.join(root, 'grupo-3-practice-grounded-v426.js'));
require(path.join(root, 'grupo-3-practice-2026-08-17-v432.js'));
const practice = global.window.MedNykutoClassPractice;
const banks = practice && practice.banks;

delete global.window;
delete global.document;

if (!banks || typeof banks !== 'object') {
  errors.push('Practice bank did not expose a banks object.');
} else {
  expect(practice.groundingPolicy === POLICY, `Expected global grounding policy ${POLICY}.`);
  expect(
    JSON.stringify(Object.keys(banks).sort()) === JSON.stringify(allExpectedCourses.slice().sort()),
    'The active challenge does not expose exactly the nine expected class topics.'
  );

  expectedCourses.forEach((courseId) => {
    const bank = banks[courseId];
    if (!bank) return;
    const grounding = bank.grounding || {};
    const prefix = `${courseId}:`;
    const sourceElement = grounding.containerId ? extractElementById(classHtml, grounding.containerId) : '';
    const sourceText = normalizeText(sourceElement);
    const evidenceUsage = new Map();
    const qcmKindCounts = { direct: 0, relation: 0 };

    expect(grounding.policy === POLICY, `${prefix} missing ${POLICY} grounding policy.`);
    expect(Boolean(grounding.containerId), `${prefix} missing course container id.`);
    expect(Boolean(sourceElement), `${prefix} source container ${grounding.containerId || '(missing)'} was not found.`);
    expect(grounding.sourceAnchor === `clase.html#${grounding.containerId}`, `${prefix} source anchor must point to its exact class section.`);
    expect(grounding.evidenceCount === 10, `${prefix} must declare exactly 10 course evidence items.`);
    expect(bank.descriptionKey === 'practiceCourseOnlyDescription', `${prefix} must display the course-only description.`);
    expect(Array.isArray(bank.sources) && bank.sources.length === 1, `${prefix} must expose exactly one internal course source.`);
    (bank.sources || []).forEach((source) => {
      expect(source.labelKey === 'courseSource', `${prefix} source must use the localized course label.`);
      expect(source.url === grounding.sourceAnchor, `${prefix} source must link to the exact class section.`);
      expect(!/^https?:\/\//i.test(source.url || ''), `${prefix} external sources are forbidden in the challenge bank.`);
    });

    const expectedCounts = { qcm: 20, vf: 10, cases: 10 };
    (bank.qcm || []).forEach((question, index) => {
      if (index > 0) {
        expect(
          question.evidenceId !== bank.qcm[index - 1].evidenceId,
          `${courseId}/qcm/${index + 1}: repeats the evidence used by the immediately preceding QCM.`
        );
      }
    });
    types.forEach((type) => {
      const questions = bank[type];
      if (!Array.isArray(questions) || questions.length !== expectedCounts[type]) {
        errors.push(`${courseId}/${type}: expected exactly ${expectedCounts[type]} questions.`);
        return;
      }

      questions.forEach((question, index) => {
        totalQuestions += 1;
        const location = `${courseId}/${type}/${index + 1}`;
        if (!question.prompt || question.prompt.trim().length < 12) errors.push(`${location}: prompt is missing or too short.`);
        else if (prompts.has(question.prompt)) errors.push(`${location}: duplicate prompt.`);
        else prompts.add(question.prompt);
        if (type !== 'vf') {
          expect(question.prompt.trim().startsWith('¿') && question.prompt.trim().endsWith('?'), `${location}: objective prompt must be written as a direct question.`);
        }
        if (type === 'qcm') {
          expect(Object.prototype.hasOwnProperty.call(qcmKindCounts, question.questionKind), `${location}: QCM angle must be direct or relation.`);
          if (Object.prototype.hasOwnProperty.call(qcmKindCounts, question.questionKind)) qcmKindCounts[question.questionKind] += 1;
          expect(!leakedCorrectionWording.test(question.prompt), `${location}: legacy correction wording reveals a distractor in the stem.`);
          expect(!genericQuestionWording.test(question.prompt), `${location}: generic or fill-in-the-blank wording must be replaced by a natural question.`);
          expect(question.learningAngle === question.questionKind, `${location}: QCM learning angle does not match its question kind.`);
          if (question.questionKind === 'relation') expect(Boolean(question.supportingEvidenceId), `${location}: relational QCM must connect a second course idea.`);
        }
        if (type === 'vf') expect(question.learningAngle === 'verification', `${location}: true/false question must use the verification angle.`);
        if (type === 'cases') {
          expect(question.learningAngle === 'clinical-integration', `${location}: clinical question must use the integration angle.`);
          expect(Boolean(question.supportingEvidenceId), `${location}: clinical question must connect a second course idea.`);
        }
        expect(!metaQuestionWording.test(question.prompt || ''), `${location}: prompt refers to the class instead of asking the subject directly.`);
        expect(!metaQuestionWording.test(question.scenario || ''), `${location}: scenario uses a generic class/review formulation.`);

        const expectedOptions = type === 'vf' ? 2 : 4;
        if (!Array.isArray(question.options) || question.options.length !== expectedOptions) {
          errors.push(`${location}: expected ${expectedOptions} options.`);
          return;
        }
        expect(new Set(question.options).size === question.options.length, `${location}: duplicate options.`);
        expect(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `${location}: answer index is invalid.`);
        if (type === 'qcm') {
          const normalizedPrompt = normalizeText(question.prompt);
          question.options.forEach((option, optionIndex) => {
            const normalizedOption = normalizeText(option);
            expect(
              !normalizedOption || !normalizedPrompt.includes(normalizedOption),
              `${location}: option ${optionIndex + 1} is already written verbatim in the prompt.`
            );
          });
        }
        expect(Boolean(question.explanation) && question.explanation.trim().length >= 35, `${location}: explanation is missing or too short.`);
        if (type === 'cases') {
          const scenario = String(question.scenario || '').trim();
          const sentenceCount = scenario.split(/[.!?]+/).filter((sentence) => sentence.trim().length >= 12).length;
          expect(scenario.length >= 90, `${location}: clinical history is missing or too short.`);
          expect(patientStoryWording.test(scenario), `${location}: clinical history must identify a patient, person or family.`);
          expect(sentenceCount >= 2, `${location}: clinical history must contain at least two meaningful sentences.`);
        }
        if (type === 'vf') {
          if (question.answer === 1) {
            expect(!hasObviousDistractorCue(question.prompt), `${location}: false true/false statement contains an obvious absolute-word cue.`);
          }
        } else {
          question.options.forEach((option, optionIndex) => {
            if (optionIndex !== question.answer) {
              expect(!hasObviousDistractorCue(option), `${location}: distractor ${optionIndex + 1} contains an obvious absolute-word cue.`);
            }
          });
        }

        expect(question.grounding === POLICY, `${location}: question is not marked as course-only.`);
        expect(question.sourceAnchor === grounding.sourceAnchor, `${location}: question points to the wrong class section.`);
        expect(typeof question.evidenceId === 'string' && question.evidenceId.startsWith(`${grounding.containerId}:`), `${location}: evidence id belongs to another section.`);
        expect(typeof question.evidence === 'string' && question.evidence.trim().length >= 8, `${location}: course evidence is missing or too short.`);
        const evidence = normalizeText(question.evidence);
        expect(Boolean(evidence) && sourceText.includes(evidence), `${location}: evidence was not found in the selected course: “${question.evidence || ''}”.`);
        expect(normalizeText(question.explanation).includes(evidence), `${location}: explanation does not show its course evidence.`);

        const questionCopy = [question.prompt, question.scenario, question.explanation].concat(question.options || []).join(' ');
        expect(!/(?:https?:\/\/|www\.|\b(?:ncbi|cdc|who|paho|aha)\b)/i.test(questionCopy), `${location}: external-source material is forbidden.`);

        if (question.evidenceId) {
          const usage = evidenceUsage.get(question.evidenceId) || { total: 0, qcm: 0, vf: 0, cases: 0, evidence: question.evidence, qcmQuestions: [], caseQuestions: [] };
          usage.total += 1;
          usage[type] += 1;
          if (type === 'qcm') usage.qcmQuestions.push(question);
          if (type === 'cases') usage.caseQuestions.push(question);
          expect(usage.evidence === question.evidence, `${location}: the same evidence id uses different source text.`);
          evidenceUsage.set(question.evidenceId, usage);
        }

        if (type !== 'vf' && Number.isInteger(question.answer)) {
          objectiveQuestions += 1;
          answerPositions[question.answer] += 1;
          const lengths = question.options.map((option) => option.length);
          const correctLength = lengths[question.answer];
          const maximum = Math.max(...lengths);
          if (correctLength === maximum && lengths.filter((length) => length === maximum).length === 1) strictlyLongestCorrect += 1;
        }
      });
    });

    expect(qcmKindCounts.direct === 10, `${prefix} expected 10 direct QCM, got ${qcmKindCounts.direct}.`);
    expect(qcmKindCounts.relation === 10, `${prefix} expected 10 relational QCM, got ${qcmKindCounts.relation}.`);
    expect(evidenceUsage.size === 10, `${prefix} expected 10 distinct course evidence items, got ${evidenceUsage.size}.`);
    evidenceUsage.forEach((usage, evidenceId) => {
      expect(usage.total === 4, `${courseId}/${evidenceId}: each course idea must produce exactly four questions.`);
      expect(usage.qcm === 2 && usage.vf === 1 && usage.cases === 1, `${courseId}/${evidenceId}: expected 2 QCM, 1 true/false and 1 application.`);
      if (usage.qcmQuestions.length === 2) {
        const direct = usage.qcmQuestions.find((question) => question.questionKind === 'direct');
        const relation = usage.qcmQuestions.find((question) => question.questionKind === 'relation');
        const clinical = usage.caseQuestions[0];
        expect(Boolean(direct && relation), `${courseId}/${evidenceId}: the two QCM must use one direct angle and one relational angle.`);
        if (direct && relation) {
          expect(normalizedOptionSet(direct) !== normalizedOptionSet(relation), `${courseId}/${evidenceId}: both QCM reuse the same answer set.`);
          expect(promptSimilarity(direct.prompt, relation.prompt) < 0.65, `${courseId}/${evidenceId}: both QCM prompts are too similar.`);
        }
        if (direct && relation && clinical) {
          expect(normalizedOptionSet(clinical) !== normalizedOptionSet(direct), `${courseId}/${evidenceId}: clinical case repeats the direct-QCM answer set.`);
          expect(normalizedOptionSet(clinical) !== normalizedOptionSet(relation), `${courseId}/${evidenceId}: clinical case repeats the relational-QCM answer set.`);
          const correctAnswers = [direct, relation, clinical].map((question) => normalizeText(question.options[question.answer]));
          expect(new Set(correctAnswers).size === 3, `${courseId}/${evidenceId}: direct, relational and clinical formats repeat the same correct answer.`);
        }
      }
    });
  });

  datedCourses.forEach((courseId) => {
    const bank = banks[courseId];
    if (!bank) return;
    const prefix = `${courseId}:`;
    const sourceElement = extractElementById(classHtml, courseId);
    const sourceUrl = `clase.html#${courseId}`;
    const objectiveOptionSets = new Set();

    expect(bank.courseId === courseId, `${prefix} course id is inconsistent.`);
    expect(bank.grounding === 'course-only', `${prefix} must be marked as course-only.`);
    expect(Boolean(sourceElement), `${prefix} exact dated lesson was not found in clase.html.`);
    expect(Array.isArray(bank.sources) && bank.sources.length === 1, `${prefix} must expose one internal class source.`);
    expect(bank.sources && bank.sources[0] && bank.sources[0].url === sourceUrl, `${prefix} source must point to its exact dated lesson.`);
    expect(!/^https?:\/\//i.test((bank.sources && bank.sources[0] && bank.sources[0].url) || ''), `${prefix} external sources are forbidden in the question bank.`);

    const expectedCounts = { qcm: 20, vf: 10, cases: 10 };
    types.forEach((type) => {
      const questions = bank[type];
      if (!Array.isArray(questions) || questions.length !== expectedCounts[type]) {
        errors.push(`${courseId}/${type}: expected exactly ${expectedCounts[type]} questions.`);
        return;
      }

      questions.forEach((question, index) => {
        totalQuestions += 1;
        const location = `${courseId}/${type}/${index + 1}`;
        const prompt = String(question.prompt || '').trim();
        if (prompt.length < 12) errors.push(`${location}: prompt is missing or too short.`);
        else if (prompts.has(prompt)) errors.push(`${location}: duplicate prompt.`);
        else prompts.add(prompt);

        if (type !== 'vf') {
          expect(prompt.startsWith('¿') && prompt.endsWith('?'), `${location}: objective prompt must be a direct question.`);
          expect(!leakedCorrectionWording.test(prompt), `${location}: correction wording reveals the answer structure.`);
          expect(!genericQuestionWording.test(prompt), `${location}: generic or fill-in-the-blank wording is forbidden.`);
        }
        expect(!metaQuestionWording.test(prompt), `${location}: prompt refers to the class instead of the subject.`);
        expect(!metaQuestionWording.test(question.scenario || ''), `${location}: scenario refers to a class or review.`);

        const expectedOptions = type === 'vf' ? 2 : 4;
        if (!Array.isArray(question.options) || question.options.length !== expectedOptions) {
          errors.push(`${location}: expected ${expectedOptions} options.`);
          return;
        }
        expect(new Set(question.options).size === question.options.length, `${location}: duplicate options.`);
        expect(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `${location}: answer index is invalid.`);
        expect(Boolean(question.explanation) && question.explanation.trim().length >= 35, `${location}: explanation is missing or too short.`);

        if (type === 'qcm') {
          const normalizedPrompt = normalizeText(prompt);
          question.options.forEach((option, optionIndex) => {
            const normalizedOption = normalizeText(option);
            expect(!normalizedOption || !normalizedPrompt.includes(normalizedOption), `${location}: option ${optionIndex + 1} is already written verbatim in the prompt.`);
          });
        }
        if (type === 'cases') {
          const scenario = String(question.scenario || '').trim();
          const sentenceCount = scenario.split(/[.!?]+/).filter((sentence) => sentence.trim().length >= 12).length;
          expect(scenario.length >= 90, `${location}: clinical history is missing or too short.`);
          expect(patientStoryWording.test(scenario), `${location}: clinical history must identify a patient or person.`);
          expect(sentenceCount >= 2, `${location}: clinical history must contain at least two meaningful sentences.`);
        }
        if (type === 'vf') {
          if (question.answer === 1) expect(!hasObviousDistractorCue(prompt), `${location}: false statement contains an obvious absolute-word cue.`);
        } else {
          question.options.forEach((option, optionIndex) => {
            if (optionIndex !== question.answer) expect(!hasObviousDistractorCue(option), `${location}: distractor ${optionIndex + 1} contains an obvious absolute-word cue.`);
          });
          const optionSet = normalizedOptionSet(question);
          expect(!objectiveOptionSets.has(optionSet), `${location}: repeats an answer set used by another objective question.`);
          objectiveOptionSets.add(optionSet);
        }

        const questionCopy = [prompt, question.scenario, question.explanation].concat(question.options || []).join(' ');
        expect(!/(?:https?:\/\/|www\.|\b(?:ncbi|cdc|who|paho|aha)\b)/i.test(questionCopy), `${location}: external-source material is forbidden.`);

        if (type !== 'vf' && Number.isInteger(question.answer)) {
          objectiveQuestions += 1;
          answerPositions[question.answer] += 1;
          const lengths = question.options.map((option) => option.length);
          const correctLength = lengths[question.answer];
          const maximum = Math.max(...lengths);
          if (correctLength === maximum && lengths.filter((length) => length === maximum).length === 1) strictlyLongestCorrect += 1;
        }
      });
    });
  });
}

expect(totalQuestions === allExpectedCourses.length * 40, `Expected exactly ${allExpectedCourses.length * 40} total questions, got ${totalQuestions}.`);
if (objectiveQuestions) {
  const minimumPositionCount = Math.floor(objectiveQuestions / 8);
  answerPositions.forEach((count, index) => {
    expect(count >= minimumPositionCount, `Answer position ${String.fromCharCode(65 + index)} is underrepresented (${count}/${objectiveQuestions}).`);
  });
  expect(strictlyLongestCorrect / objectiveQuestions <= 0.25, `Correct answer is uniquely longest too often (${Math.round((strictlyLongestCorrect / objectiveQuestions) * 100)}%).`);
}

if (errors.length) {
  console.error('Class practice bank validation failed:');
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}

console.log(
  `Class practice bank validation OK: ${allExpectedCourses.length} courses, ${totalQuestions} course-only questions, ` +
  `70 exact evidence items plus 80 questions anchored to the two dated lessons, answer positions ${answerPositions.join('/')}, ` +
  `${Math.round((strictlyLongestCorrect / objectiveQuestions) * 100)}% uniquely-longest correct options, ` +
  `0 adjacent evidence repeats, 0 generic stems, 0 repeated cross-format answer sets and 0 absolute-word distractor cues.`
);
