const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const teacherHtml = fs.readFileSync(path.join(root, 'profesores.html'), 'utf8');
const notebookJs = fs.readFileSync(path.join(root, 'class-notebook-v445.js'), 'utf8');
const notebookCss = fs.readFileSync(path.join(root, 'class-notebook-v445.css'), 'utf8');
const bioBoardDir = path.join(root, 'assets', 'class-hub', 'biochemistry', '2026-08-21', 'board');
const bioBoards = [
  fs.readFileSync(path.join(bioBoardDir, '01-deficit-insulina.svg'), 'utf8'),
  fs.readFileSync(path.join(bioBoardDir, '02-cetogenesis-acidosis.svg'), 'utf8'),
  fs.readFileSync(path.join(bioBoardDir, '03-cerebro-osmoles.svg'), 'utf8')
];
const errors = [];

global.window = {};
require(path.join(root, 'academic-model-v445.js'));
const model = global.window.MedNykutoAcademicModel;
delete global.window;

function expect(condition, message) {
  if (!condition) errors.push(message);
}

expect(Boolean(model), 'Academic model is missing.');
if (model) {
  const teacherIds = Object.keys(model.teachers || {});
  const subjectIds = Object.keys(model.subjects || {});
  const lessons = [];
  const practiceIds = new Set();

  expect(model.version === 'v445', 'Academic model version must be v445.');
  expect(teacherIds.length === 6, `Expected 6 teacher profiles, found ${teacherIds.length}.`);
  expect(subjectIds.length === 6, `Expected 6 subjects, found ${subjectIds.length}.`);
  expect(/id="teacherProfiles"/.test(teacherHtml), 'Teacher audit page is not model-driven.');
  expect(/academic-model-v445\.js/.test(html) && /class-notebook-v445\.js/.test(html), 'Class page does not load the academic notebook model.');
  expect(!/class="class-drive-card"/.test(html), 'Drive is still duplicated inside Materias.');
  expect((html.match(/data-class-drive-link/g) || []).length === 1, 'Drive must appear exactly once, on Home.');
  expect(!/data-view-link="plan"/.test(html), 'Completed seminar plan is still in primary navigation.');

  teacherIds.forEach((teacherId) => {
    const teacher = model.teachers[teacherId];
    const prefix = `teacher ${teacherId}:`;
    expect(teacher.evidence.length >= 3, `${prefix} needs at least 3 dated evidence items.`);
    expect(teacher.teachingArchitecture.length >= 4, `${prefix} teaching architecture is too short.`);
    expect(teacher.reasoningPath.length >= 4, `${prefix} reasoning path is too short.`);
    expect(teacher.importanceSignals.length >= 4, `${prefix} importance signals are too short.`);
    expect(teacher.observedQuestionFormats.length >= 4, `${prefix} question formats are too short.`);
    expect(teacher.likelyExamTargets.length >= 4, `${prefix} likely targets are too short.`);
    expect(teacher.distractorPolicy.length >= 4, `${prefix} distractor policy is too short.`);
    expect(teacher.hypotheses.length >= 2, `${prefix} hypotheses are too short.`);
    expect(teacher.questionAngles.length === 4, `${prefix} must expose 4 question angles.`);
    expect(teacher.aiPrompt.length >= 250, `${prefix} personalized prompt is too short.`);
  });

  subjectIds.forEach((subjectId) => {
    const subject = model.subjects[subjectId];
    expect(Boolean(model.teachers[subject.teacherId]), `${subjectId}: teacher profile does not exist.`);
    expect(subject.chapters.length >= 1, `${subjectId}: no chapter.`);
    subject.chapters.forEach((chapter) => {
      expect(['current', 'completed'].includes(chapter.status), `${chapter.id}: invalid chapter status.`);
      chapter.lessons.forEach((lesson) => {
        lessons.push({ subjectId, chapter, lesson });
        expect(!practiceIds.has(lesson.practiceId), `${lesson.id}: duplicate practice id ${lesson.practiceId}.`);
        practiceIds.add(lesson.practiceId);
      });
    });
  });

  expect(lessons.length === 14, `Expected 14 lesson dates/blocks, found ${lessons.length}.`);
  expect(practiceIds.size === 14, `Expected 14 unique practice mappings, found ${practiceIds.size}.`);
  expect(Object.keys(model.narratives || {}).length === 9, `Expected 9 generated legacy narratives, found ${Object.keys(model.narratives || {}).length}.`);
  expect(!lessons.some((entry) => entry.subjectId === 'nutricion' && /2026-08-20/.test(entry.lesson.id)), 'A false Nutrition theory class was created for 20 August.');
  expect(/Ficha rápida/.test(notebookJs) && /Ficha ultra rápida/.test(notebookJs), 'Notebook tabs do not use the canonical study-format labels.');
  expect(/standardizeLessonTabs/.test(notebookJs), 'Notebook does not standardize the tab bar across old and new lessons.');
  expect(/course-inline-figure/.test(notebookCss) && /course-diagram-dialog/.test(notebookCss), 'Inline lesson diagrams or their enlarged view are not styled.');
  expect(!/<nav class="(?:course-chapter-index|notebook-course-index)"/.test(html), 'The removed course summary navigation is still present in the class page.');
  expect(/querySelectorAll\('\.course-chapter-index, \.notebook-course-index'\)/.test(notebookJs), 'Generated legacy summary navigation is not removed at runtime.');
  expect((notebookJs.match(/type:\s*'board'/g) || []).length >= 3, 'The 21 August lesson must expose the three faithful teacher boards.');
  expect(/whiteboard-v2/.test(notebookJs), 'The 14 August lesson is not using the reviewed faithful whiteboard series.');
  expect(/course-diagram-dialog[^}]*[\s\S]{0,1800}object-fit:contain/.test(notebookCss), 'The enlarged board view does not guarantee contain fitting.');
  expect(/PIZARRA DEL PROFESOR · RECONSTRUIDA/.test(notebookJs), 'Teacher-board provenance is not explicit in the enlarged viewer.');
  expect(/ESQUEMA EXPLICATIVO DEL CURSO/.test(notebookJs), 'Contextual diagrams are not distinguished from teacher boards.');
  expect(/course-diagram-zoom/.test(notebookJs) && /course-diagram-zoom/.test(notebookCss), 'The teacher-board reader is not zoomable on mobile.');
  expect(/adipocyte[\s\S]*tejido muscular[\s\S]*hígado/i.test(bioBoards[0]), 'Board 1 does not identify adipocytes, muscle and liver semantically.');
  expect(/hepatocito[\s\S]*mitocondria[\s\S]*vessel[\s\S]*lung/i.test(bioBoards[1]), 'Board 2 does not identify hepatocyte, mitochondrion, vessel and lungs semantically.');
  expect(/célula cerebral[\s\S]*cerebro adaptado[\s\S]*edema cerebral[\s\S]*herniación/i.test(bioBoards[2]), 'Board 3 does not identify the cerebral cell, adapted brain, edema and herniation semantically.');

  lessons.forEach(({ lesson }) => {
    const narrative = model.narratives[lesson.id];
    const staticPanel = new RegExp(`id=["']${lesson.id}["'][\\s\\S]{0,2400}data-lesson-tabs`).test(html);
    expect(Boolean(narrative) || staticPanel, `${lesson.id}: neither a generated narrative nor a static full-course narrative exists.`);
    expect(new RegExp(`['"]${lesson.id}['"]\\s*:`).test(notebookJs), `${lesson.id}: no contextual inline diagram is registered.`);
    if (narrative) {
      expect(narrative.lead.length >= 120, `${lesson.id}: narrative lead is too short.`);
      expect(narrative.sections.length >= 6, `${lesson.id}: narrative needs at least 6 sequential sections.`);
      narrative.sections.forEach((section, index) => {
        expect(section.length >= 4, `${lesson.id}/section ${index + 1}: needs a step, title and at least 2 paragraphs.`);
        expect(section.slice(2).every((paragraph) => paragraph.length >= 90), `${lesson.id}/section ${index + 1}: paragraph is too short.`);
      });
    }
  });
}

if (errors.length) {
  console.error('Academic model validation failed:');
  errors.forEach((error) => console.error(` - ${error}`));
  process.exit(1);
}

console.log('Academic model validation OK: 6 subjects, 6 teacher audits, 14 lesson mappings, 14 contextual diagram mappings, 9 generated legacy narratives, no false Nutrition class and no duplicate Drive/Plan navigation.');
