#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const paths = {
  learningModel: path.join(root, 's4-learning-model-v178.js'),
  themeModel: path.join(root, 's4-course-themes-v182.js'),
  themeStyles: path.join(root, 's4-course-themes-v182.css'),
  notebook: path.join(root, 'class-notebook-v445.js'),
  html: path.join(root, 'clase.html')
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

const expectedThemeCountBySubject = {
  nutricion: 1,
  fisiologia: 3,
  bioquimica: 3,
  epidemiologia: 2,
  'microbiologia-teorica': 1,
  'microbiologia-practica': 1
};

const expectedSectionCountByLesson = {
  'nutricion-2026-08-13': 6,
  'nutricion-2026-08-27': 8,
  'fisiologia-2026-08-10': 7,
  'fisiologia-2026-08-13': 7,
  'fisiologia-2026-08-17': 8,
  'fisiologia-2026-08-20': 6,
  'fisiologia-2026-08-24': 7,
  'fisiologia-2026-08-27': 8,
  'bioquimica-2026-08-14': 8,
  'bioquimica-2026-08-19': 6,
  'bioquimica-2026-08-21': 6,
  'bioquimica-2026-08-26': 10,
  'bioquimica-2026-08-28': 12,
  'epidemiologia-bloque-anterior': 8,
  'epidemiologia-2026-08-19': 9,
  'epidemiologia-2026-08-26': 10,
  'epidemiologia-2026-08-28': 12,
  'microbiologia-teorica-2026-08-10': 8,
  'microbiologia-teorica-2026-08-17': 6,
  'microbiologia-teorica-2026-08-24': 11,
  'microbiologia-practica-anterior': 7,
  'microbiologia-practica-2026-08-20': 7,
  'microbiologia-practica-2026-08-27': 8
};

const expectedLessonIds = Object.values(expectedLessonsBySubject).flat();
const expectedThemeIds = [
  'nutricion-evaluacion-alimentaria-critica',
  'fisiologia-intercambio-control-respiratorio',
  'fisiologia-senal-neuronal-sinapsis',
  'fisiologia-sensibilidad-somatica-vias',
  'bioquimica-glucolisis-piruvato-pdh',
  'bioquimica-cetoacidosis-cori-integracion',
  'bioquimica-pentosas-nadph-ribosa',
  'epidemiologia-aps-redes-sistema-salud',
  'epidemiologia-urgencias-triage',
  'microbiologia-teorica-micosis-diagnostico',
  'microbiologia-practica-diagnostico-laboratorio'
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

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (!value || typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
}

function same(actual, expected, location, message) {
  if (stable(plain(actual)) !== stable(plain(expected))) {
    fail(location, `${message} Expected ${JSON.stringify(plain(expected))}, received ${JSON.stringify(plain(actual))}.`);
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

function localized(value, language) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const keys = language === 'pt' ? ['pt', 'br', 'es'] : ['es', 'pt', 'br'];
  const selected = keys.map((key) => value[key]).find((item) => typeof item === 'string' && item.trim());
  return selected ? selected.trim() : '';
}

function expectLocalized(value, location) {
  expect(localized(value, 'es').length >= 3, location, 'Spanish text is missing.');
  expect(localized(value, 'pt').length >= 3, location, 'Portuguese text is missing.');
}

function assetOccurrences(text, asset) {
  return (text.match(new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

const learningModelText = readRequired(paths.learningModel, 'learning-model');
const themeModelText = readRequired(paths.themeModel, 'theme-model');
const themeStyleText = readRequired(paths.themeStyles, 'theme-styles');
const notebookText = readRequired(paths.notebook, 'notebook');
const htmlText = readRequired(paths.html, 'clase.html');

let learningModel = null;
let thematic = null;
let originalReadingThemes = null;

if (learningModelText && themeModelText) {
  const browserWindow = {};
  const sandbox = {
    window: browserWindow,
    self: browserWindow,
    globalThis: browserWindow,
    console
  };
  try {
    vm.runInNewContext(learningModelText, sandbox, {
      filename: path.basename(paths.learningModel),
      timeout: 2_000
    });
    learningModel = browserWindow.MedNykutoS4LearningModel;
    originalReadingThemes = plain(learningModel && learningModel.readingThemes);
    vm.runInNewContext(themeModelText, sandbox, {
      filename: path.basename(paths.themeModel),
      timeout: 2_000
    });
    thematic = browserWindow.MedNykutoS4CourseThemes;
  } catch (error) {
    fail('exports', `cannot execute the models in a browser-like VM: ${error.message}`);
  }
}

expect(Boolean(learningModel), 'exports/learning-model', 'MedNykutoS4LearningModel was not exported.');
expect(Boolean(thematic), 'exports/theme-model', 'MedNykutoS4CourseThemes was not exported.');

if (learningModel && thematic) {
  expect(thematic.version === 'v182', 'theme-model/version', 'the thematic model must export v182.');
  expect(thematic.graph && thematic.graph.version === 'v182', 'theme-model/graph', 'the v182 graph is missing.');
  same((thematic.themeModes || []).map((item) => item.id), ['course', 'sessions', 'training', 'documents'], 'theme-model/modes', 'theme mode ids must match the renderer tabs.');
  expect(learningModel.courseThemeGraph === thematic.graph, 'installation/graph', 'the graph was not installed additively on the S4 model.');
  expect(learningModel.contentThemes === thematic.themes, 'installation/themes', 'contentThemes does not expose the exported themes.');
  expect(typeof learningModel.getContentTheme === 'function', 'installation/resolver', 'getContentTheme was not installed.');
  expect(typeof learningModel.mergeContentThemeContributions === 'function', 'installation/merge', 'mergeContentThemeContributions was not installed.');
  expect(typeof learningModel.setContentThemeGraph === 'function', 'installation/activation', 'setContentThemeGraph was not installed.');
  expect(typeof learningModel.activateGraph === 'function', 'installation/activation', 'activateGraph was not installed.');
  expect(typeof learningModel.getActiveContentThemeGraph === 'function', 'installation/activation', 'getActiveContentThemeGraph was not installed.');

  same(learningModel.readingThemes, originalReadingThemes, 'compatibility/reading-themes', 'installing academic themes changed the reading themes.');
  same((learningModel.readingThemes || []).map((item) => item.id), ['soft', 'sepia', 'focus'], 'compatibility/reading-theme-ids', 'soft/sepia/focus must remain intact.');
  expect(learningModel.themes === learningModel.readingThemes, 'compatibility/reading-theme-alias', 'the legacy themes alias must continue to mean reading appearance.');

  const graph = thematic.graph;
  const themes = graph.themes || [];
  same(sorted(themes.map((item) => item.id)), sorted(expectedThemeIds), 'themes/ids', 'the exact 11 real-content themes are not present.');
  expect(themes.length === 11, 'themes/count', 'there must be exactly 11 themes.');

  Object.entries(expectedThemeCountBySubject).forEach(([subjectId, count]) => {
    expect(themes.filter((item) => item.subjectId === subjectId).length === count, `themes/${subjectId}`, `expected ${count} theme(s).`);
  });

  const primaryOwners = new Map();
  const allEntityIds = new Map();
  const coveredSections = new Map();

  function recordEntityId(id, kind, location) {
    expect(typeof id === 'string' && id.length > 0, location, `${kind} id is missing.`);
    if (!id) return;
    if (allEntityIds.has(id)) fail(location, `duplicate entity id ${id}; first used by ${allEntityIds.get(id)}.`);
    else allEntityIds.set(id, `${kind} at ${location}`);
  }

  themes.forEach((theme, themeIndex) => {
    const location = `themes/${theme.id || themeIndex}`;
    recordEntityId(theme.id, 'theme', location);
    expect(expectedThemeCountBySubject[theme.subjectId] !== undefined, location, `unknown subject ${theme.subjectId}.`);
    expectLocalized(theme.label, `${location}/label`);
    expectLocalized(theme.summary, `${location}/summary`);
    expect(Number.isInteger(theme.revision) && theme.revision >= 1, `${location}/revision`, 'revision must be a positive integer.');
    expect(typeof theme.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}/.test(theme.updatedAt), `${location}/updatedAt`, 'updatedAt must be ISO-like.');
    expect(theme.course && Array.isArray(theme.course.chapters), `${location}/course`, 'course.chapters[] is required.');
    if (!theme.course || !Array.isArray(theme.course.chapters)) return;

    recordEntityId(theme.course.id, 'course', `${location}/course`);
    expect(theme.course.chapters.length >= 2 && theme.course.chapters.length <= 4, `${location}/chapters`, 'each compact theme needs 2–4 chapters/notions.');
    const notions = theme.course.chapters.flatMap((chapter) => chapter.notions || []);
    expect(notions.length >= 2 && notions.length <= 4, `${location}/notions`, 'each compact theme needs 2–4 notions.');

    const primary = theme.primarySessionIds || (theme.coverage && theme.coverage.primary) || [];
    const secondary = theme.secondarySessionIds || (theme.coverage && theme.coverage.secondary) || [];
    const sessions = theme.sessionIds || [];
    expect(new Set(primary).size === primary.length, `${location}/primary`, 'primarySessionIds contains duplicates.');
    expect(new Set(secondary).size === secondary.length, `${location}/secondary`, 'secondarySessionIds contains duplicates.');
    expect(new Set(sessions).size === sessions.length, `${location}/sessions`, 'sessionIds contains duplicates.');
    same(sorted(sessions), sorted(new Set([...primary, ...secondary])), `${location}/sessions`, 'sessionIds must be exactly primary plus transverse secondary sessions.');
    expect(theme.sessionUpdatedAt && typeof theme.sessionUpdatedAt === 'object', `${location}/sessionUpdatedAt`, 'per-session update dates are missing.');
    const chronologicalDates = sessions.map((lessonId) => theme.sessionUpdatedAt && theme.sessionUpdatedAt[lessonId]);
    expect(chronologicalDates.every((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)), `${location}/sessionUpdatedAt`, 'every session needs an ISO update date.');
    same(chronologicalDates, chronologicalDates.slice().sort(), `${location}/session-order`, 'sessionIds are not chronological by their update date.');
    same(theme.coverage && theme.coverage.primary, primary, `${location}/coverage-primary`, 'coverage.primary and primarySessionIds differ.');
    same(theme.coverage && theme.coverage.secondary, secondary, `${location}/coverage-secondary`, 'coverage.secondary and secondarySessionIds differ.');

    primary.forEach((lessonId) => {
      expect(expectedLessonIds.includes(lessonId), `${location}/primary/${lessonId}`, 'unknown primary lesson.');
      if (!primaryOwners.has(lessonId)) primaryOwners.set(lessonId, []);
      primaryOwners.get(lessonId).push(theme.id);
      expect(learningModel.lessonSubjectById[lessonId] === theme.subjectId, `${location}/primary/${lessonId}`, 'primary lesson belongs to another subject.');
    });
    secondary.forEach((lessonId) => {
      expect(expectedLessonIds.includes(lessonId), `${location}/secondary/${lessonId}`, 'unknown secondary lesson.');
      expect(learningModel.lessonSubjectById[lessonId] === theme.subjectId, `${location}/secondary/${lessonId}`, 'secondary lesson belongs to another subject.');
      expect(!primary.includes(lessonId), `${location}/secondary/${lessonId}`, 'a lesson cannot be both primary and secondary in one theme.');
    });

    theme.course.chapters.forEach((chapter, chapterIndex) => {
      const chapterLocation = `${location}/chapters/${chapter.id || chapterIndex}`;
      recordEntityId(chapter.id, 'chapter', chapterLocation);
      expectLocalized(chapter.label, `${chapterLocation}/label`);
      expect(Array.isArray(chapter.notions) && chapter.notions.length > 0, chapterLocation, 'chapter.notions[] is empty.');
      (chapter.notions || []).forEach((notion, notionIndex) => {
        const notionLocation = `${chapterLocation}/notions/${notion.id || notionIndex}`;
        recordEntityId(notion.id, 'notion', notionLocation);
        expectLocalized(notion.label, `${notionLocation}/label`);
        expect(Array.isArray(notion.sourceRefs) && notion.sourceRefs.length > 0, `${notionLocation}/sourceRefs`, 'notion provenance is empty.');
        const sourceKeys = new Set();
        let previousSourceOrder = '';
        (notion.sourceRefs || []).forEach((source, sourceIndex) => {
          const sourceLocation = `${notionLocation}/sourceRefs/${sourceIndex}`;
          expect(expectedLessonIds.includes(source.lessonId), sourceLocation, `unknown seed lesson ${source.lessonId}.`);
          expect(Array.isArray(source.sectionIndices) && source.sectionIndices.length > 0, sourceLocation, 'sectionIndices must be non-empty.');
          expect(typeof source.contribution === 'string' && thematic.contributionKinds.includes(source.contribution), sourceLocation, `invalid contribution ${source.contribution}.`);
          const maxSections = expectedSectionCountByLesson[source.lessonId];
          (source.sectionIndices || []).forEach((sectionIndex) => {
            expect(Number.isInteger(sectionIndex) && sectionIndex >= 0 && sectionIndex < maxSections, sourceLocation, `section index ${sectionIndex} is outside 0..${maxSections - 1}.`);
            if (!coveredSections.has(source.lessonId)) coveredSections.set(source.lessonId, new Set());
            coveredSections.get(source.lessonId).add(sectionIndex);
          });
          const sourceKey = `${source.lessonId}|${(source.sectionIndices || []).join(',')}|${source.contribution}`;
          const sourceOrder = `${source.updatedAt || ''}|${sourceKey}`;
          expect(sourceOrder >= previousSourceOrder, sourceLocation, 'compact source refs are not ordered by updatedAt then key.');
          previousSourceOrder = sourceOrder;
          expect(!sourceKeys.has(sourceKey), sourceLocation, 'duplicate provenance reference in one notion.');
          sourceKeys.add(sourceKey);
          expect(sessions.includes(source.lessonId), sourceLocation, 'a provenance lesson is absent from theme.sessionIds.');
        });
      });
    });
  });

  same(sorted(primaryOwners.keys()), sorted(expectedLessonIds), 'coverage/primary-partition', 'primary sessions do not cover the exact 23-session corpus.');
  expectedLessonIds.forEach((lessonId) => {
    const owners = primaryOwners.get(lessonId) || [];
    expect(owners.length === 1, `coverage/primary/${lessonId}`, `expected exactly one primary owner, received ${owners.join(', ') || 'none'}.`);
    const expectedSections = Array.from({ length: expectedSectionCountByLesson[lessonId] }, (_, index) => index);
    same(Array.from(coveredSections.get(lessonId) || []).sort((left, right) => left - right), expectedSections, `provenance/${lessonId}`, 'not every academic section is represented exactly within the valid range.');
    const resolved = thematic.getPrimaryThemeForLesson(lessonId);
    expect(resolved && resolved.id === owners[0], `resolvers/primary/${lessonId}`, 'primary-theme resolver disagrees with the partition.');
  });

  const ppp = thematic.getTheme('bioquimica-pentosas-nadph-ribosa');
  expect(Boolean(ppp), 'themes/ppp', 'the pentose-phosphate theme is missing.');
  if (ppp) {
    same(ppp.primarySessionIds, ['bioquimica-2026-08-28'], 'themes/ppp/primary', '28 August must be the primary PPP session.');
    same(ppp.secondarySessionIds, ['bioquimica-2026-08-26'], 'themes/ppp/secondary', '26 August must be the transverse PPP contribution.');
    same(sorted(ppp.sessionIds), ['bioquimica-2026-08-26', 'bioquimica-2026-08-28'], 'themes/ppp/sessions', 'PPP must use exactly the 26 and 28 August lessons.');
    const pppSourceLessons = new Set(ppp.course.chapters.flatMap((chapter) => chapter.notions || []).flatMap((notion) => notion.sourceRefs || []).map((source) => source.lessonId));
    same(sorted(pppSourceLessons), ['bioquimica-2026-08-26', 'bioquimica-2026-08-28'], 'themes/ppp/provenance', 'PPP provenance must retain both sessions.');
  }

  expect(typeof thematic.getTheme === 'function', 'resolvers/theme', 'getTheme is missing.');
  expect(typeof thematic.getCourse === 'function', 'resolvers/course', 'getCourse is missing.');
  expect(typeof thematic.getChapter === 'function', 'resolvers/chapter', 'getChapter is missing.');
  expect(typeof thematic.getNotion === 'function', 'resolvers/notion', 'getNotion is missing.');
  expect(typeof thematic.getThemesForLesson === 'function', 'resolvers/lesson', 'getThemesForLesson is missing.');
  expect(typeof thematic.resolvePath === 'function', 'resolvers/path', 'resolvePath is missing.');
  expectedThemeIds.forEach((themeId) => expect(thematic.getTheme(themeId) === thematic.themeById[themeId], `resolvers/${themeId}`, 'theme index and resolver disagree.'));

  const merge = thematic.mergeContentThemeContributions;
  expect(typeof merge === 'function', 'merge/export', 'mergeContentThemeContributions is missing.');
  if (typeof merge === 'function') {
    const baseGraph = thematic.graph;
    const baseSnapshot = plain(baseGraph);
    const targetThemeId = 'nutricion-evaluacion-alimentaria-critica';
    const targetChapterId = baseGraph.themes.find((item) => item.id === targetThemeId).course.chapters[0].id;
    const targetNotionId = baseGraph.themes.find((item) => item.id === targetThemeId).course.chapters[0].notions[0].id;
    const target = { themeId: targetThemeId, chapterId: targetChapterId, notionId: targetNotionId };
    const incrementalLessonId = 'nutricion-2026-09-03';
    const originalLabel = plain(thematic.getNotion(targetNotionId).label);
    const repetition = {
      id: 'validation-repetition',
      kind: 'repetition',
      target,
      source: { lessonId: incrementalLessonId, sectionIndices: [0], updatedAt: '2026-09-03' },
      updatedAt: '2026-09-03',
      payload: { label: { es: 'Misma regla', pt: 'Mesma regra' } }
    };
    const precision = {
      id: 'validation-precision',
      kind: 'precision',
      target,
      source: { lessonId: incrementalLessonId, sectionIndices: [1], updatedAt: '2026-09-03' },
      updatedAt: '2026-09-03',
      payload: { label: { es: 'Precisión añadida', pt: 'Precisão acrescentada' }, text: 'A more exact boundary.' }
    };
    const exampleCase = {
      id: 'validation-example-case',
      kind: 'example',
      target,
      source: { lessonId: incrementalLessonId, sectionIndices: [2], updatedAt: '2026-09-03' },
      updatedAt: '2026-09-03',
      payload: { type: 'case', label: { es: 'Caso añadido', pt: 'Caso acrescentado' } }
    };
    const newChapter = {
      id: 'validation-new-chapter',
      kind: 'new-chapter',
      target: { themeId: targetThemeId },
      source: { lessonId: incrementalLessonId, sectionIndices: [3], updatedAt: '2026-09-03' },
      updatedAt: '2026-09-03',
      chapter: {
        id: 'validation-nutrition-chapter',
        label: { es: 'Capítulo incremental', pt: 'Capítulo incremental' },
        notions: [{
          id: 'validation-nutrition-notion',
          label: { es: 'Noción incremental', pt: 'Noção incremental' }
        }]
      }
    };
    const newTheme = {
      id: 'validation-new-theme',
      kind: 'new-theme',
      source: { lessonId: 'nutricion-2026-09-10', sectionIndices: [0] },
      coverageRole: 'primary',
      theme: {
        id: 'validation-new-content-theme',
        subjectId: 'nutricion',
        label: { es: 'Tema incremental', pt: 'Tema incremental' },
        summary: { es: 'Validación de tema nuevo.', pt: 'Validação de tema novo.' },
        course: {
          id: 'course-validation-new-content-theme',
          label: { es: 'Curso incremental', pt: 'Curso incremental' },
          chapters: [{
            id: 'validation-new-theme-chapter',
            label: { es: 'Capítulo nuevo', pt: 'Capítulo novo' },
            notions: [{
              id: 'validation-new-theme-notion',
              label: { es: 'Noción nueva', pt: 'Noção nova' }
            }]
          }]
        }
      }
    };
    const divergence = {
      id: 'validation-divergence',
      kind: 'divergence',
      target,
      source: { lessonId: incrementalLessonId, sectionIndices: [4], updatedAt: '2026-09-03' },
      updatedAt: '2026-09-03',
      payload: {
        claim: 'The incoming statement conflicts with the consolidated rule.',
        reason: 'Validation conflict must remain visible.'
      }
    };
    const updates = [repetition, precision, exampleCase, newChapter, newTheme, divergence];

    let merged = null;
    try {
      merged = merge(baseGraph, updates);
    } catch (error) {
      fail('merge/execution', `merge threw: ${error.message}`);
    }

    same(baseGraph, baseSnapshot, 'merge/purity', 'the seed graph was mutated.');
    if (merged) {
      const mergedNotion = thematic.getNotion(targetNotionId, merged);
      expect(merged !== baseGraph, 'merge/purity', 'merge must return a new graph.');
      expect(merged.revision === baseGraph.revision + updates.length, 'merge/revision', 'each effective contribution must advance the graph revision once.');
      same(mergedNotion.label, originalLabel, 'merge/canonical-preservation', 'incremental contributions overwrote the canonical notion label.');
      expect(mergedNotion.repetitions.length === 1, 'merge/repetition', 'exact repetition was not recorded once.');
      expect(mergedNotion.precisions.length === 1, 'merge/precision', 'precision enrichment was not appended once.');
      expect(mergedNotion.precisions[0].content.text === precision.payload.text, 'merge/precision-payload', 'precision payload was not preserved.');
      expect(mergedNotion.examples.length === 1, 'merge/example-case', 'example/case was not appended once.');
      expect(mergedNotion.examples[0].content.type === 'case', 'merge/example-case-payload', 'case semantics were not preserved in the example.');
      const mergedNutrition = thematic.getTheme(targetThemeId, merged);
      same(mergedNutrition.sessionIds, ['nutricion-2026-08-13', 'nutricion-2026-08-27', 'nutricion-2026-09-03'], 'merge/future-session-order', 'a future contribution was not placed after the August sessions.');
      expect(mergedNutrition.sessionUpdatedAt[incrementalLessonId] === '2026-09-03', 'merge/future-session-date', 'source.updatedAt was not propagated to sessionUpdatedAt.');
      expect(Boolean(thematic.getChapter(newChapter.chapter.id, merged)), 'merge/new-chapter', 'new chapter was not added.');
      expect(Boolean(thematic.getNotion(newChapter.chapter.notions[0].id, merged)), 'merge/new-chapter-notion', 'new chapter notion was not added.');
      const mergedNewTheme = thematic.getTheme(newTheme.theme.id, merged);
      expect(Boolean(mergedNewTheme), 'merge/new-theme', 'new theme was not added.');
      if (mergedNewTheme) {
        same(mergedNewTheme.sessionIds, ['nutricion-2026-09-10'], 'merge/new-theme-session-order', 'the new theme lost its dated session.');
        expect(mergedNewTheme.sessionUpdatedAt['nutricion-2026-09-10'] === '2026-09-10', 'merge/new-theme-session-date', 'the ISO lesson-id fallback was not propagated to sessionUpdatedAt.');
      }
      expect(merged.divergences.length === 1 && merged.divergences[0].status === 'unresolved', 'merge/divergence-flag', 'divergence was not globally flagged as unresolved.');
      expect(mergedNotion.divergences.length === 1 && mergedNotion.divergences[0].status === 'unresolved', 'merge/divergence-preservation', 'divergence was not preserved on the canonical notion.');
      expect(mergedNotion.divergences[0].content.claim === divergence.payload.claim, 'merge/divergence-content', 'divergent claim was lost.');

      const replayed = merge(merged, updates);
      same(replayed, merged, 'merge/idempotence', 'replaying the same batch changed the graph.');
      const sameSemanticDifferentId = { ...repetition, id: 'validation-repetition-alias' };
      same(merge(merged, sameSemanticDifferentId), merged, 'merge/exact-repetition', 'the same semantic repetition with a different event id was not deduplicated.');

      const implicitBaseMerge = merge(updates);
      same(implicitBaseMerge, merged, 'merge/implicit-base', 'single-argument merge does not use the exported seed deterministically.');

      expect(!learningModel.getContentTheme(newTheme.theme.id), 'installation/pure-export', 'the pure exported merge unexpectedly changed the installed active graph.');
      const installedMerged = learningModel.mergeContentThemeContributions(updates);
      expect(learningModel.getActiveContentThemeGraph() === installedMerged, 'installation/active-graph', 'one-argument installed merge did not activate its result.');
      expect(learningModel.courseThemeGraph === installedMerged, 'installation/active-field', 'courseThemeGraph does not point to the active merged graph.');
      expect(learningModel.getContentTheme(newTheme.theme.id) === learningModel.contentThemeById[newTheme.theme.id], 'installation/new-theme-resolver', 'the new theme is not visible through the installed resolver/index.');
      expect(learningModel.contentThemes.some((theme) => theme.id === newTheme.theme.id), 'installation/new-theme-list', 'the new theme is absent from installed contentThemes.');
      expect(learningModel.getContentThemesForSubject('nutricion').some((theme) => theme.id === newTheme.theme.id), 'installation/new-theme-subject', 'the new theme is absent from the installed subject resolver.');
      same(learningModel.getContentTheme(targetThemeId).sessionIds, ['nutricion-2026-08-13', 'nutricion-2026-08-27', 'nutricion-2026-09-03'], 'installation/future-session-order', 'the active graph exposes the future session out of chronological order.');
      expect(learningModel.getContentTheme(newTheme.theme.id).sessionUpdatedAt['nutricion-2026-09-10'] === '2026-09-10', 'installation/new-theme-date', 'the active graph lost the new theme date.');
      same(learningModel.mergeContentThemeContributions(updates), installedMerged, 'installation/idempotence', 'replaying installed contributions changed the active graph.');

      learningModel.setContentThemeGraph(baseGraph);
      expect(learningModel.getActiveContentThemeGraph() === baseGraph, 'installation/set-graph', 'setContentThemeGraph did not activate the supplied graph.');
      expect(!learningModel.getContentTheme(newTheme.theme.id), 'installation/set-graph-index', 'setContentThemeGraph left stale theme indexes behind.');
      learningModel.activateGraph(installedMerged);
      expect(Boolean(learningModel.getContentTheme(newTheme.theme.id)), 'installation/activate-graph', 'activateGraph did not refresh installed resolvers.');
      expect(!thematic.getTheme(newTheme.theme.id), 'merge/pure-export', 'the exported seed resolver was contaminated by installed activation.');
    }
  }
}

if (htmlText) {
  const learningScript = 's4-learning-model-v178.js?v=178';
  const themeScript = 's4-course-themes-v182.js?v=182';
  const notebookScript = 'class-notebook-v445.js?v=503';
  const baseStyles = 's4-learning-experience-v178.css?v=178.1';
  const themeStyles = 's4-course-themes-v182.css?v=182';

  expect(assetOccurrences(htmlText, themeScript) === 1, 'clase.html/theme-script', 'the cache-busted v182 script must appear exactly once.');
  expect(assetOccurrences(htmlText, themeStyles) === 1, 'clase.html/theme-styles', 'the cache-busted v182 stylesheet must appear exactly once.');
  expect(htmlText.indexOf(learningScript) !== -1, 'clase.html/learning-script', 'the v178 learning model script is missing.');
  expect(htmlText.indexOf(notebookScript) !== -1, 'clase.html/notebook-script', 'the theme-aware notebook cache version is missing.');
  expect(htmlText.indexOf(baseStyles) !== -1, 'clase.html/base-styles', 'the base S4 stylesheet is missing.');
  expect(htmlText.indexOf(learningScript) < htmlText.indexOf(themeScript), 'clase.html/script-order', 'the thematic model must load after the base learning model.');
  expect(htmlText.indexOf(themeScript) < htmlText.indexOf(notebookScript), 'clase.html/script-order', 'the thematic model must load before the notebook renderer.');
  expect(htmlText.indexOf(baseStyles) < htmlText.indexOf(themeStyles), 'clase.html/style-order', 'the additive thematic stylesheet must load after the base S4 stylesheet.');
}

if (notebookText) {
  [
    'med-nykuto-s4-seen-content-v182',
    'contentThemesForSubject',
    'data-theme-tab',
    'content-theme-workspace',
    'content-theme-card',
    'content-theme-source',
    'content-theme-updates',
    'content-theme-precision',
    'content-theme-repetition',
    'content-theme-document-new',
    'themeSnapshotEntries',
    'snapshot: currentSnapshot',
    'publicClassFilesLoaded',
    'previous.snapshot.documents.concat(currentSnapshot.documents)',
    'previous.documentsComplete === false',
    'documentsComplete: Boolean(publicClassFilesLoaded',
    'persistCourseThemePreference',
    'controller.open(practiceType)',
    'data-s4-global-chronology',
    "['course', localized('Curso'",
    "['sessions', localized('Sesiones'",
    "['training', localized('Entrenar'",
    "['documents', localized('Documentos'",
    "[['cuaderno', 'Cuaderno'], ['temas', 'Temas'], ['archivos', 'Archivos'], ['progreso', 'Progreso']]",
    "['curso', 'Curso completo']",
    "['rapida', 'Ficha rápida']",
    "['ultra', 'Ficha ultra rápida']",
    "['training', 'Entrenamiento']",
    "['material', 'Material de la clase']",
    "['ia', 'Recursos IA']"
  ].forEach((marker) => {
    expect(notebookText.includes(marker), 'notebook/markers', `missing ${marker}.`);
  });
  expect(/seenRevision[\s\S]{0,600}seenAt/.test(notebookText), 'notebook/new-since-last-visit', 'theme visit state does not retain revision and visit time.');
  expect(/theme\.sessionIds\s*\|\|\s*theme\.lessonIds/.test(notebookText), 'notebook/session-resolution', 'theme sessionIds are not consumed by the renderer.');
}

if (themeStyleText) {
  [
    '.content-theme-grid',
    '.content-theme-card',
    '.content-theme-tabs',
    '.content-theme-source',
    '.content-theme-precision',
    '.content-theme-repetition',
    '.content-theme-document-new',
    '.s4-global-chronology',
    '@media(max-width:540px)',
    'min-height:44px',
    'max-height:122px'
  ].forEach((marker) => expect(themeStyleText.includes(marker), 'theme-styles/markers', `missing ${marker}.`));
}

if (errors.length) {
  console.error(`S4 theme merge validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('S4 theme merge validation OK: 11 real themes, exact 23-session primary partition, complete section provenance, stable reading themes, PPP 26/28 cross-link, pure idempotent incremental merge semantics, divergence preservation, and ordered cache-busted notebook integration.');
}
