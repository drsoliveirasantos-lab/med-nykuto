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
  'academic-model-2026-08-27-v494.js',
  'grupo-3-practice-v413.js',
  'grupo-3-practice-expansion-v420.js',
  'grupo-3-practice-grounded-v426.js',
  'grupo-3-practice-2026-08-17-v432.js',
  'grupo-3-practice-2026-08-24-v452.js',
  'grupo-3-practice-2026-08-21-v440.js',
  'grupo-3-practice-2026-08-26-v484.js',
  'grupo-3-practice-nutricion-2026-08-27-v494.js',
  'grupo-3-practice-fisiologia-2026-08-27-v494.js',
  'grupo-3-practice-microbiologia-practica-2026-08-27-v494.js',
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

expect(scopedPracticeIds.length === 17, `P1 must include exactly 17 lessons, found ${scopedPracticeIds.length}.`);
expect(new Set(scopedPracticeIds).size === scopedPracticeIds.length, 'P1 lesson scope contains duplicates.');
expect(scopedPracticeIds.length * 40 === 680, 'P1 source total must remain 680 questions.');
expect(scope.subjects.nutricion.status === 'ready', 'Nutrition through 27 August must be ready for P1.');
expect(JSON.stringify(scope.subjects.fisiologia.practiceIds) === JSON.stringify(['fisiologia-2026-08-10', 'fisiologia-2026-08-13']), 'P1 physiology must contain only the two respiratory lessons.');
expect(!scope.subjects.fisiologia.practiceIds.some((id) => /08-(17|20|24|27)$/.test(id)), 'P1 physiology must exclude the neurophysiology lessons.');
const p1PhysiologySheet = `${scope.subjects.fisiologia.reasoningPath.join(' ')} ${scope.subjects.fisiologia.likelyExamTargets.join(' ')}`;
expect(/Fick|gasometr/i.test(p1PhysiologySheet), 'P1 physiology sheet must expose respiratory reasoning and targets.');
expect(!/sinaps|transducci|potencial de acción/i.test(p1PhysiologySheet), 'P1 physiology sheet must not expose neurophysiology targets.');
expect(scope.subjects['microbiologia-practica'].practiceIds.includes('microbiologia-practica-2026-08-27'), 'P1 must include the visual microbiology practical from 27 August.');

const html = fs.readFileSync(path.join(root, 'p1.html'), 'utf8');
const clase = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'class-p1-v1.js'), 'utf8');
expect(/class-p1-v1\.css/.test(html) && /class-p1-v1\.js/.test(html), 'p1.html must load its own stylesheet and runtime.');
expect(/href="p1\.html"/.test(clase), 'The class hub must expose the P1 page.');
expect(/Entrenamiento · corrección inmediata/.test(html), 'P1 must expose immediate correction training before starting.');
expect(/Examen blanco · corrección al final/.test(html), 'P1 must expose final-only exam correction before starting.');
expect(/data-p1-view="exam" aria-selected="true"/.test(html), 'P1 practice must be the default visible view.');
expect(!/\/api\/community|mednykuto:practice-complete/.test(runtime), 'P1 must not post to community or emit ordinary practice completion.');
expect(/completed\s*=\s*true/.test(runtime) && /correctIndex/.test(runtime), 'P1 must preserve final scoring for both correction modes.');
expect(/appendImmediateCorrection/.test(runtime) && /validated/.test(runtime), 'P1 training must lock and correct each validated answer immediately.');
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
  expect(typeCounts.qcm === 20 && typeCounts.vf === 10 && typeCounts.cases === 10, 'P1 exam must contain 20 QCM, 10 V/F and 10 cases.');
  expect(new Set(first.items.map((item) => item.subjectId)).size === 6, 'P1 exam must cover all six selected subjects.');
  expect(new Set(first.items.map((item) => item.id)).size === 40, 'P1 exam contains repeated question ids.');
  expect(first.deduplication.raw === 680 && first.deduplication.removed > 0, 'P1 deduplication did not audit all 680 source questions.');
  expect(JSON.stringify(first.items) === JSON.stringify(second.items), 'The same P1 seed must reproduce the same questions and options.');
  expect(first.items.every((item) => item.correctIndex >= 0 && item.correctIndex < item.options.length), 'An option shuffle lost the correct answer.');
  const training = p1.buildExam({ ...options, mode: 'training' });
  const exam = p1.buildExam({ ...options, mode: 'exam' });
  expect(training.mode === 'training' && exam.mode === 'exam', 'P1 must persist the selected correction mode in each session.');
  expect(training.validated && Object.keys(training.validated).length === 0, 'P1 training must start with an empty validated-answer state.');
  const microExam = p1.buildExam({ seed: 20260827, subjectIds: ['microbiologia-practica'], length: 40 });
  const visualItems = microExam.items.filter((item) => item.imageSrc);
  expect(visualItems.length > 0, 'The 27 August microbiology images did not reach the P1 engine.');
  visualItems.forEach((item) => expect(fs.existsSync(path.join(root, item.imageSrc)), `${item.imageSrc}: referenced P1 image is missing.`));
}

delete global.window;
delete global.document;

if (errors.length) {
  console.error(`P1 validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('P1 validation passed: 6 subjects, 17 lessons and 680 source questions.');
