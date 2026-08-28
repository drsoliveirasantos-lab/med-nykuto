const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const errors = [];
const expectedPracticeIds = [
  'fisiologia-2026-08-17',
  'fisiologia-2026-08-20',
  'fisiologia-2026-08-24',
  'fisiologia-2026-08-27'
];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

global.window = { location: { hash: '#p2' }, addEventListener() {} };
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
  'p2-s4-e-v1.js',
  'class-p1-v1.js'
].forEach((file) => require(path.join(root, file)));

const model = global.window.MedNykutoAcademicModel;
const practice = global.window.MedNykutoClassPractice;
const profile = global.window.MedNykutoTeacherQuestionProfile;
const p1Scope = global.window.MedNykutoP1Scope;
const p2Scope = global.window.MedNykutoP2Scope;
const p1 = global.window.MedNykutoP1;
const p2 = global.window.MedNykutoP2;

expect(Boolean(p2Scope), 'P2 scope is not exposed.');
expect(p2Scope && p2Scope.id === 's4-e-p2-2026-v1', 'P2 scope must have a stable versioned id.');
expect(p2Scope && p2Scope.label === 'P2' && p2Scope.defaultLength === 40, 'P2 label or default length is invalid.');
expect(p2Scope && p2Scope.status === 'provisional', 'P2 must remain provisional until the official scope is confirmed.');
expect(p2Scope && /no confirm/i.test(p2Scope.note), 'P2 must explain that its official scope is not yet confirmed.');
expect(p2Scope && JSON.stringify(Object.keys(p2Scope.subjects)) === JSON.stringify(['fisiologia']), 'P2 must expose Fisiología only.');
expect(p2Scope && JSON.stringify(p2Scope.subjects.fisiologia.practiceIds) === JSON.stringify(expectedPracticeIds), 'P2 must contain only the four neurophysiology lessons from 17, 20, 24 and 27 August.');
const p2PhysiologySheet = p2Scope ? `${p2Scope.subjects.fisiologia.reasoningPath.join(' ')} ${p2Scope.subjects.fisiologia.likelyExamTargets.join(' ')}` : '';
expect(/sinaps|transducci|decusaci/i.test(p2PhysiologySheet), 'P2 physiology sheet must expose neurophysiology reasoning and targets.');
expect(!/respiraci|gasometr/i.test(p2PhysiologySheet), 'P2 physiology sheet must not expose respiratory targets.');
expect(profile && typeof profile.apply === 'function', 'Teacher profiling must remain callable for P2.');
expect(p1 && p1.scope === p1Scope, 'window.MedNykutoP1 must remain bound to the P1 scope.');
expect(p2 && p2.scope === p2Scope, 'window.MedNykutoP2 must remain bound to the P2 scope.');
expect(p1 && p2 && p1.storageKey !== p2.storageKey, 'P1 and P2 must use different storage keys.');

const lessonByPracticeId = new Map();
Object.entries(model.subjects).forEach(([subjectId, subject]) => {
  subject.chapters.forEach((chapter) => chapter.lessons.forEach((lesson) => {
    lessonByPracticeId.set(lesson.practiceId, { subjectId, lesson });
  }));
});

expectedPracticeIds.forEach((practiceId) => {
  const mapping = lessonByPracticeId.get(practiceId);
  const bank = practice.banks[practiceId];
  expect(Boolean(mapping), `${practiceId}: no matching academic lesson.`);
  expect(mapping && mapping.subjectId === 'fisiologia', `${practiceId}: lesson is not part of Fisiología.`);
  expect(Boolean(bank), `${practiceId}: practice bank is missing.`);
  if (!bank) return;
  expect(bank.qcm.length === 20, `${practiceId}: expected 20 QCM.`);
  expect(bank.vf.length === 10, `${practiceId}: expected 10 V/F.`);
  expect(bank.cases.length === 10, `${practiceId}: expected 10 cases.`);
  expect(Boolean(bank.teacherProfileId), `${practiceId}: teacher profile was not applied.`);
});

if (p2) {
  const raw = p2.collectQuestions(['fisiologia'], false);
  const first = p2.buildExam({ seed: 20260828, subjectIds: ['fisiologia'], length: 40 });
  const second = p2.buildExam({ seed: 20260828, subjectIds: ['fisiologia'], length: 40 });
  const typeCounts = first.items.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] || 0) + 1;
    return counts;
  }, {});
  expect(raw.length === 160, `P2 must expose 160 source questions, found ${raw.length}.`);
  expect(first.deduplication.raw === 160, 'P2 deduplication must audit all 160 source questions.');
  expect(first.items.length === 40, 'Default P2 practice must contain 40 questions.');
  expect(typeCounts.qcm === 20 && typeCounts.vf === 10 && typeCounts.cases === 10, 'P2 practice must contain 20 QCM, 10 V/F and 10 cases.');
  expect(first.items.every((item) => item.subjectId === 'fisiologia'), 'P2 contains a question outside Fisiología.');
  expect(JSON.stringify(first.items) === JSON.stringify(second.items), 'The same P2 seed must reproduce the same questions and options.');
}

if (p1) {
  expect(p1.collectQuestions(Object.keys(p1Scope.subjects), false).length === 680, 'The P2 integration changed the P1 total of 680 source questions.');
}

const html = fs.readFileSync(path.join(root, 'p1.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'class-p1-v1.js'), 'utf8');
expect(html.indexOf('p2-s4-e-v1.js?v=494') > html.indexOf('p1-s4-e-v1.js?v=494'), 'p1.html must load P2 after P1.');
expect(html.indexOf('class-p1-v1.js?v=496') > html.indexOf('p2-s4-e-v1.js?v=494'), 'p1.html must load both scopes before the shared runtime.');
expect(/class-p1-v1\.css\?v=496/.test(html), 'The shared partial-review stylesheet cache key must be 496.');
expect(/href="#p2"[^>]*data-partial-scope="p2"/.test(html), 'The compact P2 selector is missing.');
expect(/Clases individuales/.test(html) && /Practicar por fecha \+ ranking/.test(html) && /href="comunidade\.html"/.test(html), 'The individual-class practice and ranking shortcut is missing.');
expect(/id="p1SubjectRail"[^>]*hidden/.test(html) && /Personalizar práctica/.test(html), 'The P1 page still exposes duplicate subject selectors in its default practice view.');
expect(/function updateSubjectRailVisibility/.test(runtime) && /state\.activeView !== 'sheet' \|\| state\.selectedSubject === 'all'/.test(runtime), 'The subject rail must appear only inside a specific cumulative subject sheet.');
expect(/hashchange/.test(runtime) && /MedNykutoPartialReview/.test(runtime), 'The shared runtime does not expose clean hash-based scope switching.');
expect(/p1TopicRankingLink/.test(runtime) && /topicRanking\.hidden\s*=\s*activeScopeKey\s*===\s*'p2'/.test(runtime), 'The P1-only thematic ranking shortcut must be hidden while P2 is active.');

delete global.window;
delete global.document;

if (errors.length) {
  console.error(`P2 validation failed (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('P2 validation passed: provisional Fisiología scope, 4 neurophysiology lessons and 160 source questions.');
