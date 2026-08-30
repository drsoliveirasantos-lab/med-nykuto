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
  'academic-model-2026-08-28-v500.js',
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
  'grupo-3-practice-bioquimica-2026-08-28-v500.js',
  'teacher-question-profile-v445.js',
  'p1-s4-e-v2.js',
  'class-p1-v1.js'
].forEach((file) => require(path.join(root, file)));

const model = global.window.MedNykutoAcademicModel;
const practice = global.window.MedNykutoClassPractice;
const profile = global.window.MedNykutoTeacherQuestionProfile;
const scope = global.window.MedNykutoP1Scope;
const p1 = global.window.MedNykutoP1;

expect(Boolean(scope), 'P1 scope is not exposed.');
expect(scope && scope.id === 's4-e-p1-2026-v2', 'P1 scope must have the current stable versioned id.');
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
expect(scope.subjects.bioquimica.practiceIds.includes('bioquimica-2026-08-28'), 'P1 must include the 28 August Biochemistry bank selected for study.');
expect(!scopedPracticeIds.includes('epidemiologia-2026-08-28'), 'The 28 August Epidemiology lesson must remain outside P1.');
expect(JSON.stringify(scope.subjects.bioquimica.sheetPracticeIds) === JSON.stringify(['bioquimica', 'bioquimica-2026-08-19', 'bioquimica-2026-08-21', 'bioquimica-2026-08-26']), 'The 28 August Biochemistry course must stay in the notebook instead of being duplicated as a P1 lesson card.');
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
const stylesheet = fs.readFileSync(path.join(root, 'class-p1-v1.css'), 'utf8');
expect(/academic-model-2026-08-28-v500\.js/.test(html), 'The P1 page must load the cumulative teacher model through 28 August.');
expect(/grupo-3-practice-bioquimica-2026-08-28-v500\.js/.test(html), 'The P1 page must load the selected 28 August Biochemistry bank.');
expect(!/grupo-3-practice-epidemiologia-2026-08-28-v500\.js/.test(html), 'The P1 page must not load the excluded 28 August Epidemiology bank.');
expect(/class-p1-v1\.css\?v=502/.test(html) && /class-p1-v1\.js\?v=502/.test(html), 'p1.html must load the current P1 stylesheet and runtime.');
expect(/href="p1\.html"/.test(clase), 'The class hub must expose the P1 page.');
expect(/Entrenamiento · corrección inmediata/.test(html), 'P1 must expose immediate correction training before starting.');
expect(/Examen blanco · corrección al final/.test(html), 'P1 must expose final-only exam correction before starting.');
expect(/data-p1-view="exam" aria-selected="true"/.test(html), 'P1 practice must be the default visible view.');
expect(!/\/api\/community|mednykuto:practice-complete/.test(runtime), 'P1 must not post to community or emit ordinary practice completion.');
expect(/completed\s*=\s*true/.test(runtime) && /correctIndex/.test(runtime), 'P1 must preserve final scoring for both correction modes.');
expect(/appendImmediateCorrection/.test(runtime) && /validated/.test(runtime), 'P1 training must lock and correct each validated answer immediately.');
expect(/seenOptions/.test(runtime) && /seenExplanations/.test(runtime), 'P1 must remove repeated cross-lesson questions before sampling.');
expect(/item\.teacherAngle \|\| 'sin-clasificar'/.test(runtime) && /group\.angles/.test(runtime), 'P1 sampling must balance the observed teacher angles inside each lesson.');
expect(/id="p1PracticeDialog"/.test(html) && /id="p1PracticeClose"/.test(html) && /aria-labelledby="p1PracticeDialogTitle"/.test(html), 'P1 practice must expose an accessible full-screen dialog with a visible close control.');
expect(/showModal/.test(runtime) && /p1-practice-open/.test(runtime) && /practiceDialogScrollY/.test(runtime) && /addEventListener\('cancel'/.test(runtime), 'P1 practice must lock and restore the background and support Escape while the dialog is open.');
expect(/\.p1-practice-dialog\{position:fixed/.test(stylesheet) && /\.p1-practice-dialog-scroll\{[^}]*overflow-y:auto/.test(stylesheet), 'P1 practice must cover the viewport while keeping scrolling inside the dialog.');

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
  expect(first.deduplication.raw === 720 && first.deduplication.removed > 0, 'P1 deduplication did not audit all 720 source questions.');
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
  const biochemistryBank = practice.banks['bioquimica-2026-08-28'];
  const biochemistryQuestions = ['qcm', 'vf', 'cases'].flatMap((type) => biochemistryBank[type]);
  const biochemistryAngles = new Set(biochemistryQuestions.map((item) => item.teacherAngle));
  expect(biochemistryQuestions.length === 40, 'The 28 August Biochemistry lesson must keep its complete 20/10/10 bank.');
  expect(model.teachers['andrea-lopez'].questionAngles.every((angle) => biochemistryAngles.has(angle)), 'The 28 August Biochemistry bank must cover all four observed teacher reasoning angles.');
  const biochemistryExam = p1.buildExam({ seed: 20260830, subjectIds: ['bioquimica'], length: 40 });
  const sampledAngles = new Set(biochemistryExam.items.map((item) => item.teacherAngle));
  expect(model.teachers['andrea-lopez'].questionAngles.every((angle) => sampledAngles.has(angle)), 'A 40-question Biochemistry practice must preserve all four teacher reasoning angles.');
}

delete global.window;
delete global.document;

if (errors.length) {
  console.error(`P1 validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('P1 validation passed: 6 subjects, 18 lessons and 720 source questions.');
