const { test, expect } = require('@playwright/test');
const { routeCurrentClassPublic } = require('./helpers/current-class-public-fixture');

const LESSONS_BY_SUBJECT = {
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

const LESSONS = Object.entries(LESSONS_BY_SUBJECT).flatMap(([subjectId, lessonIds]) => (
  lessonIds.map((lessonId) => ({ lessonId, subjectId }))
));

const TAB_LABELS = [
  ['curso', 'Comprender'],
  ['rapida', 'Repasar'],
  ['ultra', 'Recordar'],
  ['training', 'Entrenar'],
  ['material', 'Materiales y fuentes'],
  ['ia', 'Tutor IA']
];

const TESTED_PROJECTS = new Set(['desktop-chromium', 'mobile-safari-shape']);

async function loadExperience(page, lessonId = LESSONS[0].lessonId) {
  await page.goto(`/clase.html#${lessonId}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/);
  await expect(page.locator(`#${lessonId}`)).toBeVisible();
}

async function activateLesson(page, lessonId) {
  if (!page.url().includes('/clase.html')) {
    await loadExperience(page, lessonId);
  } else if (!page.url().endsWith(`#${lessonId}`)) {
    await page.evaluate((nextLessonId) => {
      window.location.hash = nextLessonId;
    }, lessonId);
  }

  const lesson = page.locator(`#${lessonId}`);
  await expect(lesson).toBeVisible();
  const understandTab = lesson.locator(':scope > [data-lesson-tabs] [data-lesson-tab="curso"]');
  await understandTab.click();
  await expect(understandTab).toHaveAttribute('aria-selected', 'true');
  await expect(lesson.locator('[data-lesson-tab-panel="curso"]')).toBeVisible();
  return lesson;
}

async function counterValues(lab) {
  return lab.locator('[data-s4-counter]').evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [
    node.getAttribute('data-s4-counter'),
    Number(node.getAttribute('data-s4-value'))
  ])));
}

test.describe('S4 Comprender → Entrenar learning experience', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!TESTED_PROJECTS.has(testInfo.project.name), 'The S4 contract is exercised on its desktop and phone reference projects.');
    await routeCurrentClassPublic(page);
  });

  test('specializes every major topic in all 23 lessons while preserving the six-tab and training contracts', async ({ page }) => {
    await loadExperience(page);
    const kindsBySubject = new Map(Object.keys(LESSONS_BY_SUBJECT).map((subjectId) => [subjectId, new Set()]));
    const allKinds = new Set();

    for (const { lessonId, subjectId } of LESSONS) {
      const lesson = await activateLesson(page, lessonId);
      const tabs = lesson.locator(':scope > [data-lesson-tabs] [data-lesson-tab]');
      await expect(tabs).toHaveCount(6);
      expect(
        (await tabs.allTextContents()).map((label) => label.trim()),
        `${lessonId} must expose the six stable Spanish tab labels`
      ).toEqual(TAB_LABELS.map(([, label]) => label));
      expect(
        await tabs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-lesson-tab'))),
        `${lessonId} must preserve the six historical panel ids`
      ).toEqual(TAB_LABELS.map(([panelId]) => panelId));

      const course = lesson.locator('[data-lesson-tab-panel="curso"]');
      await expect(course.locator('[data-s4-course-hero]')).toHaveCount(1);
      await expect(course.locator('[data-s4-course-question]')).toHaveCount(1);
      const objectiveCount = await course.locator('[data-s4-objective]').count();
      expect(objectiveCount, `${lessonId} must have three to five evaluable objectives`).toBeGreaterThanOrEqual(3);
      expect(objectiveCount, `${lessonId} must have three to five evaluable objectives`).toBeLessThanOrEqual(5);
      await expect(course.locator('[data-s4-course-map]')).toHaveCount(1);

      const sectionCount = await course.locator('.course-chapter-section').count();
      expect(sectionCount, `${lessonId} must retain its major course topics`).toBeGreaterThanOrEqual(2);
      await expect(course.locator('.course-chapter-section[data-s4-notion]')).toHaveCount(sectionCount);

      const specialization = course.locator('[data-s4-specialization]');
      await expect(specialization).toHaveCount(1);
      await expect(specialization).toBeVisible();
      await expect(page.locator('[data-s4-specialization]:visible')).toHaveCount(1);

      const kind = await specialization.getAttribute('data-s4-kind');
      expect(kind, `${lessonId} needs a course-specific specialization type`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      allKinds.add(kind);
      kindsBySubject.get(subjectId).add(kind);

      const nodes = specialization.locator('[data-s4-specialization-node]');
      await expect(nodes).toHaveCount(sectionCount);
      expect(await nodes.count(), `${lessonId} needs at least two interactive major-topic nodes`).toBeGreaterThanOrEqual(2);

      const detail = specialization.locator('[data-s4-specialization-detail]');
      await expect(detail).toHaveCount(1);
      await expect(detail).toBeVisible();
      await expect(detail).toHaveAttribute('aria-live', 'polite');
      const nextTarget = await nodes.nth(1).getAttribute('data-s4-target');
      await nodes.nth(1).click();
      await expect(nodes.nth(1)).toHaveAttribute('aria-pressed', 'true');
      await expect(detail).toHaveAttribute('data-s4-target', nextTarget);
    }

    expect(allKinds.size, 'the semester needs at least eight relevant specialization types').toBeGreaterThanOrEqual(8);
    kindsBySubject.forEach((kinds, subjectId) => {
      expect(kinds.size, `${subjectId} needs at least one subject-relevant specialization type`).toBeGreaterThanOrEqual(1);
    });

    const practiceContract = await page.evaluate(() => ({
      roots: document.querySelectorAll('.practice-module[data-practice-root]').length,
      banks: window.MedNykutoClassPractice
        ? Object.values(window.MedNykutoClassPractice.banks).map((bank) => [bank.qcm.length, bank.vf.length, bank.cases.length])
        : []
    }));
    expect(practiceContract.roots).toBe(23);
    expect(practiceContract.banks).toHaveLength(23);
    expect(practiceContract.banks.every((counts) => counts.join(',') === '20,10,10')).toBe(true);
  });

  test('keeps Recordar concealed, persists mastery and returns to the exact source notion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Persistence and exact focus return need one canonical browser run.');
    const lessonId = 'fisiologia-2026-08-13';
    await loadExperience(page, lessonId);
    let lesson = page.locator(`#${lessonId}`);
    await lesson.locator('[data-lesson-tab="ultra"]').click();

    let firstCard = lesson.locator('[data-s4-recall-card]').first();
    const answer = firstCard.locator('[data-s4-recall-answer]');
    await expect(answer).toBeHidden();
    await firstCard.locator('[data-s4-recall-reveal]').click();
    await expect(answer).toBeVisible();

    const doubt = firstCard.locator('[data-s4-mastery="dudo"]');
    await doubt.click();
    await expect(doubt).toHaveAttribute('aria-pressed', 'true');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('med-nykuto-s4-mastery-v178')));
    expect(stored && stored[lessonId] && Object.values(stored[lessonId])).toContain('dudo');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/);
    lesson = page.locator(`#${lessonId}`);
    await lesson.locator('[data-lesson-tab="ultra"]').click();
    firstCard = lesson.locator('[data-s4-recall-card]').first();
    await expect(firstCard.locator('[data-s4-mastery="dudo"]')).toHaveAttribute('aria-pressed', 'true');

    const returnButton = firstCard.locator('[data-s4-recall-return]');
    const exactTargetId = await returnButton.getAttribute('data-s4-target');
    expect(exactTargetId).toBeTruthy();
    await expect(lesson.locator(`#${exactTargetId}[data-s4-notion]`)).toHaveCount(1);
    await returnButton.click();

    await expect(lesson.locator('[data-lesson-tab="curso"]')).toHaveAttribute('aria-selected', 'true');
    await expect(lesson.locator('[data-lesson-tab-panel="curso"]')).toBeVisible();
    await expect(lesson.locator(`#${exactTargetId}`)).toBeFocused();
    expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).toBe(exactTargetId);
  });

  test('makes glycolysis inspectable without losing reaction, energy, carbon or source-board context', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The complete biochemical interaction is covered once on desktop.');
    const lessonId = 'bioquimica-2026-08-14';
    await loadExperience(page, lessonId);
    const lesson = await activateLesson(page, lessonId);
    const lab = lesson.locator('[data-s4-glycolysis-lab]');
    await expect(lab).toBeVisible();
    await expect(lab.locator('[data-s4-glycolysis-step]')).toHaveCount(10);
    await expect(lab.locator('[data-s4-counter]')).toHaveCount(4);

    const expectedSnapshots = new Map([
      [1, { atp: -1, nadh: 0, carbons: 6, molecules: 1 }],
      [3, { atp: -2, nadh: 0, carbons: 6, molecules: 1 }],
      [6, { atp: -2, nadh: 2, carbons: 6, molecules: 2 }],
      [7, { atp: 0, nadh: 2, carbons: 6, molecules: 2 }],
      [10, { atp: 2, nadh: 2, carbons: 6, molecules: 2 }]
    ]);
    for (const [step, expectedSnapshot] of expectedSnapshots) {
      await lab.locator(`[data-s4-glycolysis-step="${step}"]`).click();
      await expect(lab.locator(`[data-s4-glycolysis-step="${step}"]`)).toHaveAttribute('aria-pressed', 'true');
      expect(await counterValues(lab), `cumulative balance after glycolysis step ${step}`).toEqual(expectedSnapshot);
    }

    await lab.locator('[data-s4-glycolysis-step="5"]').click();
    await expect(lab.locator('[data-s4-transition="starts-here"]')).toContainText('DESDE AQUÍ ×2');
    const stepRecall = lab.locator('[data-s4-step-recall="5"]');
    await expect(stepRecall).toHaveCount(1);
    await expect(stepRecall.locator('p')).toBeHidden();
    await stepRecall.locator('summary').click();
    await expect(stepRecall.locator('p')).toBeVisible();

    const sourceReturn = lab.locator('[data-s4-step-source-return]');
    const exactCourseTarget = await sourceReturn.getAttribute('data-s4-target');
    expect(exactCourseTarget).toBeTruthy();
    await expect(lesson.locator(`#${exactCourseTarget}[data-s4-notion]`)).toHaveCount(1);
    await expect(lab.locator('[data-s4-step-board-return="fase-preparatoria-4-5"]')).toHaveCount(1);

    const viewButtons = lab.locator('button[data-s4-glycolysis-view]');
    await expect(viewButtons).toHaveCount(3);
    expect((await viewButtons.allTextContents()).map((label) => label.trim())).toEqual(['Simple', 'Química', 'Pizarra']);
    await lab.locator('button[data-s4-glycolysis-view="chemistry"]').click();
    await expect(lab.locator('button[data-s4-glycolysis-view="chemistry"]')).toHaveAttribute('aria-selected', 'true');
    await expect(lab.locator('[data-s4-comparison]')).toHaveCount(6);
    await expect(lab.locator('[data-s4-representation="fischer"]')).toHaveCount(2);
    await expect(lab.locator('[data-s4-representation="fischer"] svg').first()).toBeVisible();
    expect(await lab.locator('[data-s4-representation="fischer"] svg line').count()).toBeGreaterThan(0);
    const carbonButtons = lab.locator('button[data-s4-carbon]');
    await expect(carbonButtons).toHaveCount(6);
    await carbonButtons.filter({ hasText: /^C1/ }).click();
    await expect(carbonButtons.filter({ hasText: /^C1/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(lab.locator('[data-s4-carbon-selection]')).toContainText('C1 → G3P rama A C3');

    await lab.locator('button[data-s4-glycolysis-view="simple"]').click();
    const reactionType = lab.locator('.s4-glycolysis-reaction-type');
    await expect(reactionType).toContainText('Isomerización');
    await lab.locator('[data-s4-mask-names]').click();
    await expect(reactionType).toHaveText('••••••');
    await lab.locator('[data-s4-mask-names]').click();

    await lab.locator('[data-s4-step-board-return="fase-preparatoria-4-5"]').click();
    await expect(lab.locator('button[data-s4-glycolysis-view="board"]')).toHaveAttribute('aria-selected', 'true');
    await expect(lab.locator('[data-s4-board="fase-preparatoria-4-5"]')).toBeFocused();
    await expect(lab.locator('[data-s4-board]')).toHaveCount(4);
    await expect(lab.locator('[data-s4-filter]')).toHaveCount(4);
    await expect(lab.locator('[data-s4-mask-names]')).toHaveCount(1);

    const theme = lesson.locator('[data-s4-reading-theme]');
    const optionValues = await theme.locator('option').evaluateAll((options) => options.map((option) => option.value));
    expect(optionValues).toHaveLength(3);
    const originalThemeClass = await lesson.getAttribute('data-s4-reading-theme-active');
    await theme.selectOption(optionValues[1]);
    await expect(theme).toHaveValue(optionValues[1]);
    await expect.poll(() => lesson.getAttribute('data-s4-reading-theme-active')).not.toBe(originalThemeClass);
    const selectedThemeClass = await lesson.getAttribute('data-s4-reading-theme-active');
    expect(await page.evaluate((key) => localStorage.getItem(key), `mednykuto:s4:theme:${lessonId}`)).toBe(optionValues[1]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/);
    await expect(page.locator(`#${lessonId}`)).toHaveAttribute('data-s4-reading-theme-active', selectedThemeClass);
    await expect(page.locator(`#${lessonId} [data-s4-reading-theme]`)).toHaveValue(optionValues[1]);
  });

  test('localizes the new learning layer to Brazilian Portuguese and keeps reading-theme colors authoritative', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Language and computed-theme checks need one canonical browser run.');
    await page.addInitScript(() => {
      localStorage.setItem('medLang', 'br');
    });
    await loadExperience(page, 'bioquimica-2026-08-14');
    const lesson = await activateLesson(page, 'bioquimica-2026-08-14');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(lesson.locator('[data-lesson-tab="curso"]')).toHaveText('Compreender');
    await expect(lesson.locator('[data-s4-course-question]')).toContainText('Como a célula transforma');
    await expect(lesson.locator('[data-s4-objective]').first()).toContainText('Ordenar substratos');

    const lab = lesson.locator('[data-s4-glycolysis-lab]');
    await lab.locator('[data-s4-glycolysis-step="6"]').click();
    await expect(lab.locator('.s4-glycolysis-reaction-type')).toContainText('Oxidação');
    await expect(lab.locator('[data-s4-step-recall="6"] summary')).toContainText('fosfato incorporado');
    await lab.locator('button[data-s4-glycolysis-view="chemistry"]').click();
    await expect(lab.locator('[data-s4-comparison="d-l-glucose"]')).toContainText('D-glicose');
    await lab.locator('button[data-s4-glycolysis-view="simple"]').click();
    await lab.locator('[data-s4-glycolysis-step="5"]').click();
    await lab.locator('button[data-s4-glycolysis-view="chemistry"]').click();
    const carbonC1 = lab.locator('button[data-s4-carbon="1"]');
    await carbonC1.click();
    await expect(lab.locator('[data-s4-carbon-selection]')).toContainText('C1 → G3P ramo A C3');
    await lab.locator('button[data-s4-glycolysis-view="board"]').click();
    await expect(lab.locator('[data-s4-board="mapa-general"]')).toContainText('Mapa geral');

    const theme = lesson.locator('[data-s4-reading-theme]');
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await theme.selectOption('focus');
    const focusColors = await lesson.evaluate((panel) => {
      const heading = panel.querySelector('.notebook-course-intro h3');
      return { panel: getComputedStyle(panel).color, heading: getComputedStyle(heading).color };
    });
    expect(focusColors.heading).toBe(focusColors.panel);

    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await theme.selectOption('soft');
    const softColors = await lesson.evaluate((panel) => {
      const heading = panel.querySelector('.notebook-course-intro h3');
      return { panel: getComputedStyle(panel).color, heading: getComputedStyle(heading).color };
    });
    expect(softColors.heading).toBe(softColors.panel);
  });

  test('keeps the phone learning flow inside the viewport with 44px touch targets', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-safari-shape', 'Phone-specific layout contract.');
    await page.setViewportSize({ width: 360, height: 800 });
    await loadExperience(page, 'bioquimica-2026-08-14');
    const lesson = await activateLesson(page, 'bioquimica-2026-08-14');
    const measurements = await lesson.evaluate((panel) => {
      const selector = [
        ':scope > [data-lesson-tabs] [data-lesson-tab]',
        '[data-s4-reading-theme]',
        '[data-s4-specialization-node]',
        '[data-s4-glycolysis-step]',
        'button[data-s4-glycolysis-view]',
        '[data-s4-filter]',
        '[data-s4-mask-names]'
      ].join(',');
      const visibleTargets = Array.from(panel.querySelectorAll(selector)).filter((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        targetCount: visibleTargets.length,
        minimumTargetHeight: Math.min(...visibleTargets.map((node) => node.getBoundingClientRect().height)),
        overflowingTargets: visibleTargets.filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1;
        }).length
      };
    });

    expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.clientWidth + 1);
    expect(measurements.targetCount).toBeGreaterThanOrEqual(20);
    expect(measurements.minimumTargetHeight).toBeGreaterThanOrEqual(43.9);
    expect(measurements.overflowingTargets).toBe(0);
  });
});
