const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clase.html'), 'utf8');
const teacherHtml = fs.readFileSync(path.join(root, 'profesores.html'), 'utf8');
const notebookJs = fs.readFileSync(path.join(root, 'class-notebook-v445.js'), 'utf8');
const notebookCss = fs.readFileSync(path.join(root, 'class-notebook-v445.css'), 'utf8');
const microClinicalDir = path.join(root, 'assets', 'class-hub', 'microbiology-theory', '2026-08-24', 'expanded-cases');
const microClinicalPdf = path.join(microClinicalDir, 'casos-clinicos-y-candidiasis-24-08.pdf');
const microClinicalPreviews = [
  path.join(microClinicalDir, 'eumicetoma-casos-preview.webp'),
  path.join(microClinicalDir, 'candidiasis-atlas-preview.webp')
];
const datedLessonVisuals = Object.freeze({
  'nutricion-2026-08-27': [
    'nutrition-hidden-claims.webp',
    'nutrition-protein-marketing.webp'
  ],
  'fisiologia-2026-08-27': [
    'physiology-somatic-sensitivities-source.svg'
  ],
  'microbiologia-practica-2026-08-27': [
    'micro-arthroconidia.webp',
    'micro-aspergillus-fumigatus.webp',
    'micro-candida-albicans.webp',
    'micro-case-aspergillosis.webp',
    'micro-case-candidemia.webp',
    'micro-cryptococcus-neoformans.webp',
    'micro-cryptococcus.webp',
    'micro-mucor.webp',
    'micro-mycelium.webp',
    'micro-penicillium.webp',
    'micro-rhizopus.webp',
    'micro-spores-conidia-a.webp',
    'micro-spores-conidia-b.webp'
  ]
});
const datedVisualDir = path.join(root, 'assets', 'courses', '2026-08-27');
const physiologyDiagram = fs.readFileSync(path.join(datedVisualDir, 'physiology-somatic-sensitivities-source.svg'), 'utf8');
const bioBoardDir = path.join(root, 'assets', 'class-hub', 'biochemistry', '2026-08-21', 'board');
const bioBoards = [
  fs.readFileSync(path.join(bioBoardDir, '01-deficit-insulina.svg'), 'utf8'),
  fs.readFileSync(path.join(bioBoardDir, '02-cetogenesis-acidosis.svg'), 'utf8'),
  fs.readFileSync(path.join(bioBoardDir, '03-cerebro-osmoles.svg'), 'utf8')
];
const errors = [];

global.window = {};
require(path.join(root, 'academic-model-v445.js'));
require(path.join(root, 'academic-model-2026-08-27-v494.js'));
require(path.join(root, 'academic-model-2026-08-28-v500.js'));
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

  expect(model.version === 'v500', 'Academic model version must include the 28 August v500 extension.');
  expect(teacherIds.length === 6, `Expected 6 teacher profiles, found ${teacherIds.length}.`);
  expect(subjectIds.length === 6, `Expected 6 subjects, found ${subjectIds.length}.`);
  expect(/id="teacherProfiles"/.test(teacherHtml), 'Teacher audit page is not model-driven.');
  expect(/academic-model-v445\.js/.test(html) && /academic-model-2026-08-27-v494\.js/.test(html) && /academic-model-2026-08-28-v500\.js/.test(html) && /class-notebook-v445\.js\?v=500/.test(html), 'Class page does not load the complete academic model through 28 August and the current academic notebook.');
  expect(/academic-model-2026-08-28-v500\.js/.test(teacherHtml) && /23 CLASES/.test(teacherHtml) && /28 ago\. 2026/.test(teacherHtml), 'Teacher audit page does not expose the 28 August model and updated lesson count.');
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

  expect(lessons.length === 23, `Expected 23 lesson dates/blocks, found ${lessons.length}.`);
  const previousEpidemiology = lessons.find((entry) => entry.lesson.id === 'epidemiologia-bloque-anterior');
  expect(previousEpidemiology && previousEpidemiology.lesson.dateLong === '12 de agosto de 2026' && previousEpidemiology.lesson.status === 'confirmed', 'The previous Epidemiology lesson must be confirmed as 12 August 2026.');
  Object.keys(datedLessonVisuals).forEach((lessonId) => {
    const datedLesson = lessons.find((entry) => entry.lesson.id === lessonId);
    expect(Boolean(datedLesson), `${lessonId}: the confirmed 27 August lesson is missing from the academic model.`);
    if (datedLesson) {
      expect(datedLesson.lesson.dateLong === '27 de agosto de 2026', `${lessonId}: the dated lesson must remain attached to 27 August 2026.`);
      expect(datedLesson.lesson.status === 'confirmed', `${lessonId}: the dated lesson must remain confirmed.`);
      expect(datedLesson.lesson.practiceId === lessonId, `${lessonId}: the dated lesson must map to its exact practice bank.`);
    }
  });
  ['bioquimica-2026-08-28', 'epidemiologia-2026-08-28'].forEach((lessonId) => {
    const datedLesson = lessons.find((entry) => entry.lesson.id === lessonId);
    expect(Boolean(datedLesson), `${lessonId}: the confirmed 28 August lesson is missing from the academic model.`);
    if (datedLesson) {
      expect(datedLesson.lesson.dateLong === '28 de agosto de 2026', `${lessonId}: the dated lesson must remain attached to 28 August 2026.`);
      expect(datedLesson.lesson.status === 'confirmed', `${lessonId}: the dated lesson must remain confirmed.`);
      expect(datedLesson.lesson.practiceId === lessonId, `${lessonId}: the dated lesson must map to its exact practice bank.`);
    }
    expect(new RegExp(`['"]${lessonId}['"]\\s*:`).test(notebookJs), `${lessonId}: no contextual diagram is registered.`);
  });
  expect(practiceIds.size === 23, `Expected 23 unique practice mappings, found ${practiceIds.size}.`);
  expect(Object.keys(model.narratives || {}).length === 16, `Expected 16 generated narratives after the 28 August extension, found ${Object.keys(model.narratives || {}).length}.`);
  const august28Content = JSON.stringify({ bio: model.narratives['bioquimica-2026-08-28'], epi: model.narratives['epidemiologia-2026-08-28'] });
  expect(/NADPH/.test(august28Content) && /transaldolasa transfiere tres carbonos/i.test(august28Content), 'The Biochemistry correction layer lost NADPH or the three-carbon transaldolase transfer.');
  expect(/RIISS/.test(august28Content) && /cuatro niveles/i.test(notebookJs), 'The Paraguay lesson lost the official RIISS/four-level framing.');
  expect(!/(?:75\s*%|19[,.]4\s*%|electroconvuls|amputaci[oó]n|nombre propio del paciente)/i.test(august28Content), 'The 28 August lessons include an unverified statistic or a private anecdote.');
  expect(/sin teléfono, sin leer apuntes/i.test(august28Content) && /trabajos firmados/i.test(august28Content), 'The confirmed Biochemistry oral-preparation rules are missing.');
  expect(/Cinco clases orales completas/.test(model.teachers['andrea-lopez'].confidenceReason) && model.teachers['andrea-lopez'].observedQuestionFormats.some((item) => /preparación grupal/i.test(item)), 'The cumulative Biochemistry teacher model was not refreshed for 28 August.');
  const biochemistryTeacherMethod = JSON.stringify(model.teachers['andrea-lopez']);
  expect(/conteo de carbonos|número de carbonos/i.test(biochemistryTeacherMethod) && /C2.*transcetolasa/i.test(biochemistryTeacherMethod) && /C3.*transaldolasa/i.test(biochemistryTeacherMethod), 'The Biochemistry teacher profile must preserve the observed carbon-counting and C2/C3 distinction from 28 August.');
  expect(/sin teléfono ni apuntes/i.test(biochemistryTeacherMethod) && /NADP\+\/NADPH/i.test(biochemistryTeacherMethod), 'The Biochemistry teacher profile must preserve the observed oral-recall method and characteristic distractors.');
  expect(model.teachers['andrea-isasi'].likelyExamTargets.some((item) => /Manchester, START y SHORT/i.test(item)) && model.teachers['andrea-isasi'].likelyExamTargets.some((item) => /cuatro niveles/i.test(item)), 'The Epidemiology teacher model omits the confirmed practical methods or RIISS levels.');
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
  expect(/RECONSTRUCCIÓN LIMPIA/.test(physiologyDiagram), 'The 27 August physiology diagram must identify itself as a clean reconstruction.');
  expect(/Terminaciones nerviosas/.test(physiologyDiagram) && !/TÉRMINOS NERVIOSOS|AFFERENTES|\bSLOW\b|\bFAST\b/.test(physiologyDiagram), 'The reviewed physiology diagram contains a stale or incorrect label.');
  expect(/function diagramVisual\(definition\)\s*{\s*if \(!definition\.src\) return diagramSvg/.test(notebookJs), 'Source-backed explanatory diagrams must render their reviewed image instead of a generated fallback.');
  expect(fs.existsSync(microClinicalPdf), 'The optimized 24 August Microbiology clinical PDF is missing.');
  if (fs.existsSync(microClinicalPdf)) {
    const pdfSize = fs.statSync(microClinicalPdf).size;
    expect(pdfSize >= 100000 && pdfSize <= 8000000, `The optimized Microbiology PDF must remain between 100 KB and 8 MB; found ${pdfSize} bytes.`);
  }
  microClinicalPreviews.forEach((preview) => expect(fs.existsSync(preview), `Clinical preview is missing: ${path.basename(preview)}.`));
  expect(/clinical-miniature-link/.test(html) && /casos-clinicos-y-candidiasis-24-08\.pdf/.test(html), 'The Microbiology lesson does not expose the optimized PDF and its clinical miniatures.');
  expect(/Candida oportunista/.test(JSON.stringify(model.narratives['microbiologia-teorica-2026-08-24'] || {})), 'The 24 August Microbiology narrative does not include the documented Candida block.');
  expect(/function summaryPanel\([\s\S]*outlineFromCourse/.test(notebookJs), 'The quick and ultra sheets are not rebuilt from each lesson outline.');
  expect(/dataset\.lessonReview = 'standard'/.test(notebookJs), 'The unified review-sheet marker is missing.');
  expect(/notebook-review-route/.test(notebookJs) && /notebook-review-card/.test(notebookJs) && /notebook-review-recall/.test(notebookJs), 'The five-minute sheet is missing its route, reasoned cards or active-recall prompt.');
  expect(/notebook-ultra-path/.test(notebookJs) && /notebook-ultra-rules/.test(notebookJs) && /notebook-ultra-close/.test(notebookJs), 'The ninety-second sheet is missing its scan path, limits or closing recall line.');
  expect(/ultraLessonVisuals[\s\S]*'bioquimica-2026-08-14'[\s\S]*type:\s*'pathway'[\s\S]*'bioquimica-2026-08-21'[\s\S]*type:\s*'flow'/.test(notebookJs), 'Biochemistry ultra sheets must use dedicated synthesis diagrams instead of teacher boards.');
  expect(/notebook-review-layout/.test(notebookCss) && /notebook-ultra-scan/.test(notebookCss), 'The unified review sheets are not styled.');
  expect(/adipocyte[\s\S]*tejido muscular[\s\S]*hígado/i.test(bioBoards[0]), 'Board 1 does not identify adipocytes, muscle and liver semantically.');
  expect(/hepatocito[\s\S]*mitocondria[\s\S]*vessel[\s\S]*lung/i.test(bioBoards[1]), 'Board 2 does not identify hepatocyte, mitochondrion, vessel and lungs semantically.');
  expect(/célula cerebral[\s\S]*cerebro adaptado[\s\S]*edema cerebral[\s\S]*herniación/i.test(bioBoards[2]), 'Board 3 does not identify the cerebral cell, adapted brain, edema and herniation semantically.');

  lessons.forEach(({ lesson }) => {
    const narrative = model.narratives[lesson.id];
    const staticPanel = new RegExp(`id=["']${lesson.id}["'][\\s\\S]{0,2400}data-lesson-tabs`).test(html);
    const notebookVisual = new RegExp(`['"]${lesson.id}['"]\\s*:`).test(notebookJs);
    const datedVisuals = datedLessonVisuals[lesson.id] || [];
    expect(Boolean(narrative) || staticPanel, `${lesson.id}: neither a generated narrative nor a static full-course narrative exists.`);
    expect(notebookVisual, `${lesson.id}: no contextual inline diagram is registered.`);
    datedVisuals.forEach((filename) => {
      const visualPath = path.join(datedVisualDir, filename);
      expect(fs.existsSync(visualPath), `${lesson.id}: dated visual is missing: ${filename}.`);
      expect(notebookJs.includes(`assets/courses/2026-08-27/${filename}`), `${lesson.id}: dated visual is not wired into the notebook: ${filename}.`);
      if (fs.existsSync(visualPath)) {
        const size = fs.statSync(visualPath).size;
        const minimumSize = path.extname(filename) === '.svg' ? 4000 : 8000;
        expect(size >= minimumSize && size <= 1000000, `${lesson.id}: ${filename} must remain between ${minimumSize / 1000} KB and 1 MB; found ${size} bytes.`);
      }
    });
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

console.log('Academic model validation OK: 6 subjects, 6 teacher audits, 23 lesson mappings, 23 contextual diagram mappings including 3 dated visual packs (16 wired assets), 16 generated narratives, corrected 28 August content, no false Nutrition class and no duplicate Drive/Plan navigation.');
