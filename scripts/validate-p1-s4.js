const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const errors = [];
const expectedSubjects = [
  'nutricion',
  'fisiologia',
  'bioquimica',
  'epidemiologia',
  'microbiologia-teorica',
  'microbiologia-practica'
];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

global.window = { location: { hash: '' }, addEventListener() {} };
global.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; }
};

[
  'academic-model-v445.js',
  'grupo-3-practice-v413.js',
  'grupo-3-practice-expansion-v420.js',
  'grupo-3-practice-grounded-v426.js',
  'grupo-3-practice-2026-08-17-v432.js',
  'grupo-3-practice-2026-08-24-v452.js',
  'grupo-3-practice-2026-08-21-v440.js',
  'grupo-3-practice-2026-08-26-v484.js',
  'teacher-question-profile-v445.js',
  'p1-s4-e-v1.js',
  'class-p1-v1.js'
].forEach((file) => require(path.join(root, file)));

const model = global.window.MedNykutoAcademicModel;
const practice = global.window.MedNykutoClassPractice;
const profile = global.window.MedNykutoTeacherQuestionProfile;
const scope = global.window.MedNykutoP1Scope;
const p1 = global.window.MedNykutoP1;

expect(Boolean(scope), 'P1 scope is not exposed.');
expect(scope && scope.id === 's4-e-p1-2026-v1', 'P1 scope must have a stable versioned id.');
expect(scope && scope.defaultLength === 40, 'P1 default simulacro must contain 40 questions.');
expect(scope && JSON.stringify(Object.keys(scope.subjects)) === JSON.stringify(expectedSubjects), 'P1 scope must expose exactly the six 4.º E subjects in canonical order.');
expect(profile && typeof profile.apply === 'function', 'Teacher profiling must remain callable after dynamic bank updates.');
expect(p1 && typeof p1.buildExam === 'function', 'P1 exam engine is not exposed.');

const lessonByPracticeId = new Map();
Object.entries(model.subjects).forEach(([subjectId, subject]) => {
  subject.chapters.forEach((chapter) => chapter.lessons.forEach((lesson) => {
    lessonByPracticeId.set(lesson.practiceId, { subjectId, lesson });
  }));
});

const scopedPracticeIds = [];
Object.entries(scope.subjects).forEach(([subjectId, subject]) => {
  expect(subject.practiceIds.length > 0, `${subjectId}: no P1 lessons declared.`);
  subject.practiceIds.forEach((practiceId) => {
    scopedPracticeIds.push(practiceId);
    const mapping = lessonByPracticeId.get(practiceId);
    const bank = practice.banks[practiceId];
    expect(Boolean(mapping), `${practiceId}: no matching academic lesson.`);
    expect(mapping && mapping.subjectId === subjectId, `${practiceId}: lesson belongs to another subject.`);
    expect(Boolean(bank), `${practiceId}: practice bank is missing.`);
    if (!bank) return;
    expect(bank.qcm.length === 20, `${practiceId}: expected 20 QCM.`);
    expect(bank.vf.length === 10, `${practiceId}: expected 10 V/F.`);
    expect(bank.cases.length === 10, `${practiceId}: expected 10 cases.`);
    expect(Boolean(bank.teacherProfileId), `${practiceId}: teacher profile was not applied.`);
  });
});

expect(scopedPracticeIds.length === 18, `P1 must include exactly 18 lessons, found ${scopedPracticeIds.length}.`);
expect(new Set(scopedPracticeIds).size === scopedPracticeIds.length, 'P1 lesson scope contains duplicates.');
expect(scopedPracticeIds.length * 40 === 720, 'P1 source total must remain 720 questions.');
expect(scope.subjects.nutricion.status === 'provisional', 'Nutrition must remain explicitly provisional until the P1 scope is confirmed.');

const html = fs.readFileSync(path.join(root, 'p1.html'), 'utf8');
const clase = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'class-p1-v1.js'), 'utf8');
expect(/class-p1-v1\.css/.test(html) && /class-p1-v1\.js/.test(html), 'p1.html must load its own stylesheet and runtime.');
expect(/href="p1\.html"/.test(clase), 'The class hub must expose the P1 page.');
expect(!/\/api\/community|mednykuto:practice-complete/.test(runtime), 'P1 must not post to community or emit ordinary practice completion.');
expect(/completed\s*=\s*true/.test(runtime) && /correctIndex/.test(runtime), 'P1 must keep correction until exam completion.');
expect(/seenOptions/.test(runtime) && /seenExplanations/.test(runtime), 'P1 must remove repeated cross-lesson questions before sampling.');

if (p1) {
  const options = { seed: 20260827, subjectIds: expectedSubjects, length: 40 };
  const first = p1.buildExam(options);
  const second = p1.buildExam(options);
  const typeCounts = first.items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});
  expect(first.items.length === 40, 'Default P1 exam must contain 40 questions.');
  expect(JSON.stringify(typeCounts) === JSON.stringify({ qcm: 20, vf: 10, cases: 10 }), 'P1 exam must contain 20 QCM, 10 V/F and 10 cases.');
  expect(new Set(first.items.map((item) => item.subjectId)).size === 6, 'P1 exam must cover all six selected subjects.');
  expect(new Set(first.items.map((item) => item.id)).size === 40, 'P1 exam contains repeated question ids.');
  expect(first.deduplication.raw === 720 && first.deduplication.removed > 0, 'P1 deduplication did not audit all 720 source questions.');
  expect(JSON.stringify(first.items) === JSON.stringify(second.items), 'The same P1 seed must reproduce the same questions and options.');
  expect(first.items.every((item) => item.correctIndex >= 0 && item.correctIndex < item.options.length), 'An option shuffle lost the correct answer.');
}

delete global.window;
delete global.document;

if (errors.length) {
  console.error(`P1 validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('P1 validation passed: 6 subjects, 18 lessons and 720 source questions.');
