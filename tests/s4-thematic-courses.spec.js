const { test, expect } = require('@playwright/test');
const { CURRENT_CLASS_PUBLIC_FIXTURE, routeCurrentClassPublic } = require('./helpers/current-class-public-fixture');

const SUBJECT_ID = 'bioquimica';
const THEME_ID = 'bioquimica-pentosas-nadph-ribosa';
const PRIMARY_LESSON_ID = 'bioquimica-2026-08-28';
const CONTRIBUTOR_LESSON_ID = 'bioquimica-2026-08-26';
const SOURCE_LESSON_IDS = [CONTRIBUTOR_LESSON_ID, PRIMARY_LESSON_ID];
const TARGET_NOTION_ID = 'bio-ppp-entrada-oxidativa-notion';
const SEEN_CONTENT_KEY = 'med-nykuto-s4-seen-content-v182';

async function loadBiochemistryThemes(page) {
  await page.goto(`/clase.html#${SUBJECT_ID}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/);

  const subject = page.locator(`#${SUBJECT_ID}`);
  await expect(subject).toBeVisible();
  await expect(subject.locator('[data-notebook-mode="temas"]')).toHaveAttribute('aria-selected', 'true');

  const cards = subject.locator('[data-course-theme-card]');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toBeVisible();
  await expect(page.locator(`#${PRIMARY_LESSON_ID}`)).toBeHidden();

  return { subject, cards };
}

async function openPentoseTheme(page) {
  const { subject } = await loadBiochemistryThemes(page);
  const card = subject.locator(`[data-course-theme-card="${THEME_ID}"]`);
  await expect(card).toBeVisible();
  await expect(card).toContainText(/Pentosas/i);
  await expect(card).toContainText(/2\s+sesi(?:ó|o)n(?:es)?/i);
  await expect(card).toContainText(/28\s+AGO/i);
  await expect(card).toContainText(/0\s*\/\s*2/);
  await expect(card).toContainText(/Comenzar|Continuar/i);
  await card.locator(`[data-course-theme-open="${THEME_ID}"]`).click();

  const theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
  await expect(theme).toBeVisible();
  return { subject, card, theme };
}

function uniqueAttributeValues(locator, attribute) {
  return locator.evaluateAll((nodes, attributeName) => (
    [...new Set(nodes.map((node) => node.getAttribute(attributeName)).filter(Boolean))]
  ), attribute);
}

test.describe('S4 evolving thematic courses', () => {
  test.beforeEach(async ({ page }) => {
    await routeCurrentClassPublic(page);
  });

  test('prioritizes compact theme cards and opens the consolidated pentose course with its provenance', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The canonical theme structure is covered once in Chromium.');

    const { subject, theme } = await openPentoseTheme(page);

    const tabs = theme.locator('[data-theme-tab]');
    await expect(tabs).toHaveCount(4);
    expect(await tabs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-theme-tab')))).toEqual([
      'course',
      'sessions',
      'training',
      'documents'
    ]);

    const courseTab = theme.locator('[data-theme-tab="course"]');
    await expect(courseTab).toHaveAttribute('aria-selected', 'true');
    const courseModes = theme.locator('[data-theme-course-mode]');
    await expect(courseModes).toHaveCount(3);
    expect(await courseModes.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-theme-course-mode')))).toEqual([
      'full',
      'quick',
      'ultra'
    ]);

    for (const mode of ['quick', 'ultra', 'full']) {
      const button = theme.locator(`[data-theme-course-mode="${mode}"]`);
      await button.click();
      await expect(button).toHaveAttribute('aria-selected', 'true');
      await expect(theme.locator(`[data-theme-course-view="${mode}"]`)).toBeVisible();
    }

    const sources = theme.locator('[data-theme-source]');
    expect(await sources.count()).toBeGreaterThanOrEqual(2);
    expect((await uniqueAttributeValues(sources, 'data-theme-source')).sort()).toEqual([...SOURCE_LESSON_IDS].sort());
    await expect(theme).toContainText(/26\s+AGO/i);
    await expect(theme).toContainText(/28\s+AGO/i);

    await expect(subject.locator('[data-course-theme-card]:visible')).toHaveCount(0);
  });

  test('moves between contributing sessions, scoped training and documents without changing the 20/10/10 bank', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The canonical navigation and bank contract is covered once in Chromium.');

    let { theme } = await openPentoseTheme(page);
    await theme.locator('[data-theme-tab="sessions"]').click();

    const sessions = theme.locator('[data-theme-session]');
    await expect(sessions).toHaveCount(2);
    expect(await uniqueAttributeValues(sessions, 'data-theme-session')).toEqual(SOURCE_LESSON_IDS);
    await expect(theme.locator(`[data-theme-session="${CONTRIBUTOR_LESSON_ID}"]`)).toContainText(/26\s+AGO/i);
    await expect(theme.locator(`[data-theme-session="${PRIMARY_LESSON_ID}"]`)).toContainText(/28\s+AGO/i);

    await theme.locator(`[data-theme-session="${PRIMARY_LESSON_ID}"] [data-theme-session-open="${PRIMARY_LESSON_ID}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${PRIMARY_LESSON_ID}$`));
    const lesson = page.locator(`#${PRIMARY_LESSON_ID}`);
    await expect(lesson).toBeVisible();
    await lesson.locator('[data-lesson-tab="training"]').click();
    await expect(lesson.locator('[data-lesson-tab-panel="training"]')).toBeVisible();

    const bankSizes = await page.evaluate((lessonId) => {
      const bank = window.MedNykutoClassPractice && window.MedNykutoClassPractice.banks[lessonId];
      return bank ? [bank.qcm.length, bank.vf.length, bank.cases.length] : null;
    }, PRIMARY_LESSON_ID);
    expect(bankSizes).toEqual([20, 10, 10]);

    await page.goBack();
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();

    await theme.locator('[data-theme-tab="training"]').click();
    const scope = theme.locator('[data-theme-training-scope]');
    await expect(scope).toHaveCount(1);
    await expect(scope).toHaveValue('theme');
    expect(await scope.locator('option').evaluateAll((options) => options.map((option) => option.value))).toEqual(['theme', 'session']);

    await scope.selectOption('session');
    await expect(scope).toHaveValue('session');
    const sessionFilter = theme.locator('[data-theme-training-session]');
    await expect(sessionFilter).toBeVisible();
    const format = theme.locator('[data-theme-training-format]');
    await sessionFilter.selectOption(CONTRIBUTOR_LESSON_ID);
    await format.selectOption('open');

    const openQuestionContract = await page.evaluate(({ themeId, lessonId }) => {
      const model = window.MedNykutoS4LearningModel;
      const contentTheme = model.getContentTheme(themeId);
      const notions = contentTheme.course.chapters.flatMap((chapter) => chapter.notions || []);
      const label = (notion) => typeof notion.label === 'string' ? notion.label : notion.label.es;
      return {
        included: notions.filter((notion) => (notion.sourceRefs || []).some((source) => source.lessonId === lessonId)).slice(0, 3).map(label),
        excluded: notions.filter((notion) => !(notion.sourceRefs || []).some((source) => source.lessonId === lessonId)).map(label)
      };
    }, { themeId: THEME_ID, lessonId: CONTRIBUTOR_LESSON_ID });
    const openQuestions = theme.locator('[data-theme-open-question]');
    await expect(openQuestions).toHaveCount(openQuestionContract.included.length);
    const openQuestionText = (await openQuestions.allTextContents()).join('\n');
    openQuestionContract.included.forEach((label) => expect(openQuestionText).toContain(label));
    openQuestionContract.excluded.forEach((label) => expect(openQuestionText).not.toContain(label));

    await sessionFilter.selectOption(PRIMARY_LESSON_ID);
    await expect(sessionFilter).toHaveValue(PRIMARY_LESSON_ID);
    await format.selectOption('qcm');
    const trainingRows = theme.locator('[data-theme-training-lesson]');
    await expect(trainingRows).toHaveCount(1);
    await expect(trainingRows).toHaveAttribute('data-theme-training-lesson', PRIMARY_LESSON_ID);
    await expect(trainingRows).toContainText(/20 QCM/i);

    await trainingRows.locator('[data-theme-training-open="qcm"]').click();
    await expect(page).toHaveURL(new RegExp(`#${PRIMARY_LESSON_ID}$`));
    const exerciseLesson = page.locator(`#${PRIMARY_LESSON_ID}`);
    await expect(exerciseLesson.locator('[data-lesson-tab="training"]')).toHaveAttribute('aria-selected', 'true');
    const exerciseDialog = exerciseLesson.locator('.practice-dialog[open]');
    await expect(exerciseDialog).toBeVisible();
    await expect(exerciseDialog.getByRole('tab', { name: /^QCM/ })).toHaveAttribute('aria-selected', 'true');
    await exerciseDialog.locator('.practice-dialog-close').click();
    await expect(exerciseDialog).toBeHidden();

    await page.goBack();
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    await expect(theme.locator('[data-theme-tab="training"]')).toHaveAttribute('aria-selected', 'true');
    const restoredScope = theme.locator('[data-theme-training-scope]');
    await expect(restoredScope).toHaveValue('theme');
    const restoredTrainingRows = theme.locator('[data-theme-training-lesson]');
    await expect(restoredTrainingRows).toHaveCount(2);
    expect(await uniqueAttributeValues(restoredTrainingRows, 'data-theme-training-lesson')).toEqual(SOURCE_LESSON_IDS);

    await theme.locator('[data-theme-tab="documents"]').click();
    const documentSessions = theme.locator('[data-theme-document-session]');
    await expect(documentSessions).toHaveCount(2);
    expect(await uniqueAttributeValues(documentSessions, 'data-theme-document-session')).toEqual(SOURCE_LESSON_IDS);
    await expect(theme.locator(`[data-theme-document-session="${CONTRIBUTOR_LESSON_ID}"]`)).toContainText(/26\s+AGO/i);
    await expect(theme.locator(`[data-theme-document-session="${PRIMARY_LESSON_ID}"]`)).toContainText(/28\s+AGO/i);
    await expect(theme.locator(`[data-theme-document-session="${CONTRIBUTOR_LESSON_ID}"] button`)).toBeVisible();
  });

  test('marks a theme as seen after opening it and keeps that state across reloads', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The storage contract is covered once in Chromium.');
    await page.addInitScript(({ key, themeId }) => {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        themes: {
          [themeId]: {
            seenRevision: '2026-08-26',
            seenAt: '2026-08-26T12:00:00.000Z'
          }
        }
      }));
    }, { key: SEEN_CONTENT_KEY, themeId: THEME_ID });

    const { subject } = await loadBiochemistryThemes(page);
    const card = subject.locator(`[data-course-theme-card="${THEME_ID}"]`);
    await expect(card).toContainText(/Nuevo|Novedad/i);
    await card.locator(`[data-course-theme-open="${THEME_ID}"]`).click();
    let theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();

    const stored = await page.evaluate((key) => localStorage.getItem(key), SEEN_CONTENT_KEY);
    expect(stored).toBeTruthy();
    expect(stored).toContain(THEME_ID);
    expect(stored).toContain('2026-08-28');
    const storedTheme = JSON.parse(stored).themes[THEME_ID];
    expect(storedTheme.snapshot).toEqual(expect.objectContaining({
      notions: expect.any(Array),
      cases: expect.any(Array),
      documents: expect.any(Array)
    }));
    expect(storedTheme.snapshot.notions.length).toBeGreaterThan(0);

    await page.evaluate((lessonId) => {
      window.dispatchEvent(new CustomEvent('mednykuto:class-public-data', {
        detail: {
          files: [{
            id: 'theme-new-document',
            course: 'Bioquímica II',
            title: 'Documento incremental PPP',
            url: 'https://drive.google.com/file/d/theme-new-document/view',
            fileType: 'PDF',
            lessonId,
            lessonDate: '2026-08-28',
            modifiedAt: '2026-09-01T10:00:00-03:00',
            firstSeenAt: '2026-09-01T10:00:00-03:00',
            removedAt: null
          }]
        }
      }));
    }, PRIMARY_LESSON_ID);
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme.locator('[data-theme-updates]')).toContainText(/Documento nuevo.*Documento incremental PPP/i);
    await theme.locator('[data-theme-tab="documents"]').click();
    const newDocument = theme.locator('[data-theme-document-source][data-theme-new="true"]');
    await expect(newDocument).toContainText('Documento incremental PPP');
    await expect(newDocument.locator('.content-theme-document-new')).toContainText(/Nuevo/i);
    await theme.locator('[data-theme-tab="course"]').click();

    await theme.locator('[data-theme-course-mode="ultra"]').click();
    await expect(theme.locator('[data-theme-course-mode="ultra"]')).toHaveAttribute('aria-selected', 'true');
    await theme.locator('[data-theme-tab="documents"]').click();
    await expect(theme.locator('[data-theme-tab="documents"]')).toHaveAttribute('aria-selected', 'true');

    const preferredState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), SEEN_CONTENT_KEY);
    expect(preferredState.themes[THEME_ID]).toEqual(expect.objectContaining({
      lastCourseView: 'ultra',
      lastThemeTab: 'documents'
    }));

    await page.goto(`/clase.html#theme-${THEME_ID}`, { waitUntil: 'domcontentloaded' });
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    await expect(theme.locator('[data-theme-tab="documents"]')).toHaveAttribute('aria-selected', 'true');
    await expect(theme.locator('[data-theme-panel="documents"]')).toBeVisible();
    await theme.locator('[data-theme-tab="course"]').click();
    await expect(theme.locator('[data-theme-course-mode="ultra"]')).toHaveAttribute('aria-selected', 'true');
    await expect(theme.locator('[data-theme-course-view="ultra"]')).toBeVisible();

    await page.goto(`/clase.html#${SUBJECT_ID}`, { waitUntil: 'domcontentloaded' });
    const seenCard = page.locator(`#${SUBJECT_ID} [data-course-theme-card="${THEME_ID}"]`);
    await expect(seenCard).toBeVisible();
    await expect(seenCard).not.toContainText(/Nuevo|Novedad/i);
  });

  test('keeps a seen managed document out of the new-content feed while public data is delayed', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The delayed managed-document snapshot contract is covered once in Chromium.');
    const seenDocument = {
      id: 'theme-seen-document',
      course: 'Bioquímica II',
      title: 'Documento PPP ya consultado',
      url: 'https://drive.google.com/file/d/theme-seen-document/view',
      fileType: 'PDF',
      lessonId: PRIMARY_LESSON_ID,
      lessonDate: '2026-08-28',
      modifiedAt: '2026-09-01T10:00:00-03:00',
      firstSeenAt: '2026-09-01T10:00:00-03:00',
      removedAt: null
    };
    const documentToken = `${seenDocument.id}@${seenDocument.modifiedAt}`;
    await page.addInitScript(({ key, themeId, token }) => {
      localStorage.setItem(key, JSON.stringify({
        version: 1,
        themes: {
          [themeId]: {
            seenRevision: '2026-08-28',
            seenAt: '2026-09-01T12:00:00.000Z',
            lastThemeTab: 'documents',
            lastCourseView: 'full',
            snapshot: { notions: [], cases: [], documents: [token] }
          }
        }
      }));
    }, { key: SEEN_CONTENT_KEY, themeId: THEME_ID, token: documentToken });

    await page.unroute('**/api/class-hub**');
    let releasePublicData;
    const publicDataGate = new Promise((resolve) => { releasePublicData = resolve; });
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
        await publicDataGate;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...CURRENT_CLASS_PUBLIC_FIXTURE, files: [seenDocument] })
        });
      }
      return route.continue();
    });

    await page.goto(`/clase.html#theme-${THEME_ID}`, { waitUntil: 'domcontentloaded' });
    let theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    const snapshotBeforePublicData = await page.evaluate(({ key, themeId }) => (
      JSON.parse(localStorage.getItem(key)).themes[themeId].snapshot.documents
    ), { key: SEEN_CONTENT_KEY, themeId: THEME_ID });
    expect(snapshotBeforePublicData).toContain(documentToken);

    releasePublicData();
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    const document = theme.locator('[data-theme-document-source="' + PRIMARY_LESSON_ID + '"]', { hasText: seenDocument.title });
    await expect(document).toBeVisible();
    await expect(document).toHaveAttribute('data-theme-new', 'false');
    const updateText = (await theme.locator('[data-theme-updates]').allTextContents()).join('\n');
    expect(updateText).not.toMatch(/Documento nuevo.*Documento PPP ya consultado/i);

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mednykuto:class-public-data', {
        detail: { files: [], complete: false }
      }));
    });
    const snapshotAfterIncompleteRefresh = await page.evaluate(({ key, themeId }) => (
      JSON.parse(localStorage.getItem(key)).themes[themeId].snapshot.documents
    ), { key: SEEN_CONTENT_KEY, themeId: THEME_ID });
    expect(snapshotAfterIncompleteRefresh).toContain(documentToken);
  });

  test('baselines managed documents silently on a first visit with delayed public data', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The first-visit document baseline is covered once in Chromium.');
    const baselineDocument = {
      id: 'theme-baseline-document',
      course: 'Bioquímica II',
      title: 'Documento PPP de base',
      url: 'https://drive.google.com/file/d/theme-baseline-document/view',
      fileType: 'PDF',
      lessonId: PRIMARY_LESSON_ID,
      lessonDate: '2026-08-28',
      modifiedAt: '2026-09-01T11:00:00-03:00',
      firstSeenAt: '2026-09-01T11:00:00-03:00',
      removedAt: null
    };
    const documentToken = `${baselineDocument.id}@${baselineDocument.modifiedAt}`;
    await page.unroute('**/api/class-hub**');
    let releasePublicData;
    const publicDataGate = new Promise((resolve) => { releasePublicData = resolve; });
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
        await publicDataGate;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...CURRENT_CLASS_PUBLIC_FIXTURE, files: [baselineDocument] })
        });
      }
      return route.continue();
    });

    await page.goto(`/clase.html#theme-${THEME_ID}`, { waitUntil: 'domcontentloaded' });
    let theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    const stateBeforePublicData = await page.evaluate(({ key, themeId }) => (
      JSON.parse(localStorage.getItem(key)).themes[themeId]
    ), { key: SEEN_CONTENT_KEY, themeId: THEME_ID });
    expect(stateBeforePublicData.documentsComplete).toBe(false);

    releasePublicData();
    theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    const document = theme.locator('[data-theme-document-source="' + PRIMARY_LESSON_ID + '"]', { hasText: baselineDocument.title });
    await expect(document).toBeVisible();
    await expect(document).toHaveAttribute('data-theme-new', 'false');
    const updateText = (await theme.locator('[data-theme-updates]').allTextContents()).join('\n');
    expect(updateText).not.toMatch(/Documento nuevo.*Documento PPP de base/i);
    const stateAfterPublicData = await page.evaluate(({ key, themeId }) => (
      JSON.parse(localStorage.getItem(key)).themes[themeId]
    ), { key: SEEN_CONTENT_KEY, themeId: THEME_ID });
    expect(stateAfterPublicData.documentsComplete).toBe(true);
    expect(stateAfterPublicData.snapshot.documents).toContain(documentToken);
  });

  test('activates and renders incremental repetition, precision, case and divergence contributions', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'The active graph and rendered merge contract is covered once in Chromium.');

    const { subject } = await loadBiochemistryThemes(page);
    const mergeState = await page.evaluate(({ themeId, lessonId, notionId }) => {
      const model = window.MedNykutoS4LearningModel;
      const target = { themeId, notionId };
      const source = (sectionIndex, contribution) => ({
        lessonId,
        sectionIndices: [sectionIndex],
        contribution,
        updatedAt: '2026-09-01'
      });
      const updates = [
        {
          id: 'browser-ppp-repetition',
          kind: 'repetition',
          target,
          source: source(0, 'repetition'),
          updatedAt: '2026-09-01',
          payload: { text: 'La fase oxidativa queda confirmada sin duplicar la noción.' }
        },
        {
          id: 'browser-ppp-precision',
          kind: 'precision',
          target,
          source: source(1, 'precision'),
          updatedAt: '2026-09-01',
          payload: { text: 'Cada glucosa-6-fosfato produce exactamente dos NADPH en la fase oxidativa.' }
        },
        {
          id: 'browser-ppp-case',
          kind: 'example',
          target,
          source: source(2, 'example'),
          updatedAt: '2026-09-01',
          payload: { type: 'case', label: 'Caso incremental: eritrocito sometido a estrés oxidativo.' }
        },
        {
          id: 'browser-ppp-divergence',
          kind: 'divergence',
          target,
          source: source(3, 'divergence'),
          updatedAt: '2026-09-01',
          payload: {
            claim: 'Afirmación conflictiva: la vía tendría como objetivo directo producir ATP.',
            reason: 'Se conserva para revisión porque contradice el objetivo consolidado de la vía.'
          }
        }
      ];
      const merged = model.mergeContentThemeContributions(updates);
      const notion = model.getContentNotion(notionId);
      return {
        returnedGraphIsActive: merged === model.getActiveContentThemeGraph(),
        publicGraphIsActive: merged === model.courseThemeGraph,
        themeIsIndexed: model.getContentTheme(themeId) === model.contentThemeById[themeId],
        repetitionIds: notion.repetitions.map((item) => item.id),
        precisionIds: notion.precisions.map((item) => item.id),
        exampleIds: notion.examples.map((item) => item.id),
        divergenceIds: notion.divergences.map((item) => item.id)
      };
    }, { themeId: THEME_ID, lessonId: PRIMARY_LESSON_ID, notionId: TARGET_NOTION_ID });

    expect(mergeState).toEqual(expect.objectContaining({
      returnedGraphIsActive: true,
      publicGraphIsActive: true,
      themeIsIndexed: true
    }));
    expect(mergeState.repetitionIds).toContain('browser-ppp-repetition');
    expect(mergeState.precisionIds).toContain('browser-ppp-precision');
    expect(mergeState.exampleIds).toContain('browser-ppp-case');
    expect(mergeState.divergenceIds).toContain('browser-ppp-divergence');

    await subject.locator('[data-notebook-mode="temas"]').click();
    await subject.locator(`[data-course-theme-card="${THEME_ID}"] [data-course-theme-open="${THEME_ID}"]`).click();
    const theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    const notion = theme.locator(`[data-theme-notion="${TARGET_NOTION_ID}"]`);
    await expect(notion).toHaveCount(1);
    await expect(notion.locator('[data-theme-repetition="browser-ppp-repetition"]')).toContainText('La fase oxidativa queda confirmada sin duplicar la noción.');
    await expect(notion.locator('[data-theme-precision="browser-ppp-precision"]')).toContainText('Cada glucosa-6-fosfato produce exactamente dos NADPH en la fase oxidativa.');
    await expect(notion.locator('[data-theme-example="browser-ppp-case"]')).toContainText('Caso incremental: eritrocito sometido a estrés oxidativo.');
    const divergence = notion.locator('[data-theme-divergence="browser-ppp-divergence"]');
    await expect(divergence).toContainText('Afirmación conflictiva: la vía tendría como objetivo directo producir ATP.');
    await expect(divergence).toContainText('Se conserva para revisión porque contradice el objetivo consolidado de la vía.');
  });

  test('keeps 390px theme cards compact, unobstructed and within the viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-safari-shape', 'This is the iPhone-shaped density contract.');
    await page.setViewportSize({ width: 390, height: 844 });

    const { subject } = await loadBiochemistryThemes(page);
    const card = subject.locator(`[data-course-theme-card="${THEME_ID}"]`);
    await expect(card).toContainText(/Pentosas/i);
    await expect(card).toContainText(/2\s+sesi(?:ó|o)n(?:es)?/i);
    await expect(card).toContainText(/28\s+AGO/i);
    await expect(card).toContainText(/0\s*\/\s*2/);
    await expect(card).toContainText(/Comenzar|Continuar/i);
    const firstCard = subject.locator('[data-course-theme-card]').first();
    await firstCard.evaluate((node) => node.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await expect(firstCard).toBeInViewport();

    const cardMetrics = await subject.evaluate((panel) => {
      const cards = Array.from(panel.querySelectorAll('[data-course-theme-card]')).filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      const targets = cards.flatMap((node) => {
        const nested = Array.from(node.querySelectorAll('button, a[href], select, [role="button"]'));
        return nested.length ? nested : [node];
      });
      const rectangles = cards.map((node) => node.getBoundingClientRect());
      const targetRectangles = targets.map((node) => node.getBoundingClientRect());
      const firstTarget = targets[0];
      const firstTargetRect = firstTarget.getBoundingClientRect();
      const hit = document.elementFromPoint(
        firstTargetRect.left + firstTargetRect.width / 2,
        firstTargetRect.top + firstTargetRect.height / 2
      );

      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        cardCount: cards.length,
        columnCount: new Set(rectangles.map((rect) => Math.round(rect.left))).size,
        maximumCardHeight: Math.max(...rectangles.map((rect) => rect.height)),
        minimumTargetHeight: Math.min(...targetRectangles.map((rect) => rect.height)),
        overflowingCards: rectangles.filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1).length,
        firstTargetReceivesHit: Boolean(hit && (firstTarget === hit || firstTarget.contains(hit)))
      };
    });

    expect(cardMetrics.viewportWidth).toBe(390);
    expect(cardMetrics.documentWidth).toBeLessThanOrEqual(cardMetrics.viewportWidth + 1);
    expect(cardMetrics.cardCount).toBe(3);
    expect(cardMetrics.columnCount).toBe(1);
    expect(cardMetrics.maximumCardHeight).toBeLessThanOrEqual(180);
    expect(cardMetrics.minimumTargetHeight).toBeGreaterThanOrEqual(43.9);
    expect(cardMetrics.overflowingCards).toBe(0);
    expect(cardMetrics.firstTargetReceivesHit).toBe(true);

    await card.locator(`[data-course-theme-open="${THEME_ID}"]`).click();
    const theme = page.locator(`[data-course-theme="${THEME_ID}"]`);
    await expect(theme).toBeVisible();
    const themeTargets = theme.locator('[data-theme-tab]:visible, [data-theme-course-mode]:visible');
    expect(await themeTargets.count()).toBeGreaterThanOrEqual(7);
    const minimumThemeTargetHeight = await themeTargets.evaluateAll((nodes) => (
      Math.min(...nodes.map((node) => node.getBoundingClientRect().height))
    ));
    expect(minimumThemeTargetHeight).toBeGreaterThanOrEqual(43.9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  });
});
