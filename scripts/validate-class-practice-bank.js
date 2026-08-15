const path = require('path');

const practicePath = path.resolve(__dirname, '..', 'grupo-3-practice-v413.js');
const expansionPath = path.resolve(__dirname, '..', 'grupo-3-practice-expansion-v420.js');
const expectedCourses = [
  'nutricion',
  'fisiologia-2026-08-13',
  'fisiologia-2026-08-10',
  'bioquimica',
  'epidemiologia',
  'microbiologia-teorica',
  'microbiologia-practica'
];
const types = ['qcm', 'vf', 'cases'];
const errors = [];
const prompts = new Set();
let totalQuestions = 0;
let objectiveQuestions = 0;
let strictlyLongestCorrect = 0;
const answerPositions = [0, 0, 0, 0];

global.window = {
  location: { hash: '' },
  addEventListener() {}
};
global.document = {
  getElementById() { return null; }
};

require(practicePath);
require(expansionPath);
const practice = global.window.MedNykutoClassPractice;
const banks = practice && practice.banks;

delete global.window;
delete global.document;

if (!banks || typeof banks !== 'object') {
  errors.push('Practice bank did not expose a banks object.');
} else {
  const actualCourses = Object.keys(banks).sort();
  const expectedSorted = expectedCourses.slice().sort();
  if (JSON.stringify(actualCourses) !== JSON.stringify(expectedSorted)) {
    errors.push('Expected courses ' + expectedSorted.join(', ') + ', got ' + actualCourses.join(', ') + '.');
  }

  expectedCourses.forEach((courseId) => {
    const bank = banks[courseId];
    if (!bank) return;

    if (!Array.isArray(bank.sources) || !bank.sources.length) {
      errors.push(courseId + ': missing verification sources.');
    } else {
      bank.sources.forEach((source) => {
        if (!source.label || !/^https:\/\//.test(source.url || '')) {
          errors.push(courseId + ': invalid verification source.');
        }
      });
    }

    const expectedCounts = { qcm: 20, vf: 10, cases: 10 };
    types.forEach((type) => {
      const questions = bank[type];
      if (!Array.isArray(questions) || questions.length !== expectedCounts[type]) {
        errors.push(courseId + '/' + type + ': expected exactly ' + expectedCounts[type] + ' questions.');
        return;
      }

      questions.forEach((question, index) => {
        totalQuestions += 1;
        const location = courseId + '/' + type + '/' + (index + 1);
        if (!question.prompt || question.prompt.trim().length < 12) {
          errors.push(location + ': prompt is missing or too short.');
        } else if (prompts.has(question.prompt)) {
          errors.push(location + ': duplicate prompt.');
        } else {
          prompts.add(question.prompt);
        }

        const expectedOptions = type === 'vf' ? 2 : 4;
        if (!Array.isArray(question.options) || question.options.length !== expectedOptions) {
          errors.push(location + ': expected ' + expectedOptions + ' options.');
          return;
        }
        if (new Set(question.options).size !== question.options.length) {
          errors.push(location + ': duplicate options.');
        }
        if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) {
          errors.push(location + ': answer index is invalid.');
        }
        if (!question.explanation || question.explanation.trim().length < 35) {
          errors.push(location + ': explanation is missing or too short.');
        }
        if (type === 'cases' && (!question.scenario || question.scenario.trim().length < 55)) {
          errors.push(location + ': clinical scenario is missing or too short.');
        }

        if (type !== 'vf' && Number.isInteger(question.answer)) {
          objectiveQuestions += 1;
          answerPositions[question.answer] += 1;
          const lengths = question.options.map((option) => option.length);
          const correctLength = lengths[question.answer];
          const maximum = Math.max(...lengths);
          if (correctLength === maximum && lengths.filter((length) => length === maximum).length === 1) {
            strictlyLongestCorrect += 1;
          }
        }
      });
    });
  });
}

if (totalQuestions !== expectedCourses.length * 40) {
  errors.push('Expected exactly ' + (expectedCourses.length * 40) + ' total questions, got ' + totalQuestions + '.');
}

if (objectiveQuestions) {
  const minimumPositionCount = Math.floor(objectiveQuestions / 8);
  answerPositions.forEach((count, index) => {
    if (count < minimumPositionCount) {
      errors.push('Answer position ' + String.fromCharCode(65 + index) + ' is underrepresented (' + count + '/' + objectiveQuestions + ').');
    }
  });
  const longestRate = strictlyLongestCorrect / objectiveQuestions;
  if (longestRate > 0.25) {
    errors.push('Correct answer is uniquely longest too often (' + Math.round(longestRate * 100) + '%).');
  }
}

if (errors.length) {
  console.error('Class practice bank validation failed:');
  errors.forEach((error) => console.error(' - ' + error));
  process.exit(1);
}

console.log(
  'Class practice bank validation OK: ' + expectedCourses.length + ' courses, ' +
  totalQuestions + ' questions, answer positions ' + answerPositions.join('/') + ', ' +
  Math.round((strictlyLongestCorrect / objectiveQuestions) * 100) + '% uniquely-longest correct options.'
);
