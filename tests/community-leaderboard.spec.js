const { test, expect } = require('@playwright/test');

const PLAYER_ID = '11111111-1111-4111-8111-111111111111';
const PROFILE = { playerId: PLAYER_ID, nickname: 'Baboune' };

const API_RESPONSE = {
  ok: true,
  cohort: 'semester-4-group-e',
  week: { key: '2026-08-10', start: '2026-08-10', end: '2026-08-16' },
  challenge: { goal: 1000, points: 260, questions: 340, participants: 4, records: 8, progress: 26 },
  ranking: [
    { rank: 1, nickname: 'Nath', points: 92, questions: 110, accuracy: 84, challenges: 3, isCurrent: false },
    { rank: 2, nickname: 'Baboune', points: 78, questions: 100, accuracy: 78, challenges: 2, isCurrent: true },
    { rank: 3, nickname: 'Mango', points: 62, questions: 80, accuracy: 78, challenges: 2, isCurrent: false }
  ],
  currentUser: { rank: 2, nickname: 'Baboune', points: 78, questions: 100, accuracy: 78, challenges: 2, isCurrent: true }
};

async function seedProfile(page) {
  await page.addInitScript(({ key, profile }) => {
    localStorage.setItem(key, JSON.stringify(profile));
    localStorage.setItem('medLang', 'es');
  }, { key: 'medNykutoCommunityProfile:v1', profile: PROFILE });
}

test.describe('Weekly class challenge', () => {
  test('shows the shared weekly progress and ranking in both class languages', async ({ page }) => {
    await seedProfile(page);
    await page.route('**/api/community**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await expect(page.getByRole('heading', { name: 'Estudia por materia y tema.' })).toBeVisible();
    await expect(page.locator('#studyTopName')).toHaveText('Nath');
    await expect(page.locator('#studyTopMeta')).toContainText('92 aciertos');
    await expect(page.locator('#studyMyScoreValue')).toHaveText('78');
    await expect(page.locator('#studyMyScoreMeta')).toContainText('#2');
    await expect(page.locator('#challengeScore')).toHaveText('260 / 1.000');
    await expect(page.locator('#challengeProgressBar')).toHaveAttribute('aria-valuenow', '26');
    await expect(page.locator('#communityRanking .ranking-row')).toHaveCount(3);
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Baboune');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Tú');
    await expect(page.locator('#challengeWeek')).toContainText('10 ago');

    await page.locator('#communityLanguage').selectOption('br');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { name: 'Estude por matéria e tema.' })).toBeVisible();
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Você');
    await expect(page.locator('[data-study-subject="nutricion"]')).toContainText('Nutrição');
    await expect(page.locator('#challengeScore')).toHaveText('260 / 1.000');
  });

  test('selects a subject and a grouped theme, then reuses the class practice bank', async ({ page }) => {
    await seedProfile(page);
    await page.route('**/api/community**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await expect(page.locator('#studySubjectPicker .study-subject-option')).toHaveCount(6);
    await expect(page.locator('[data-study-subject="nutricion"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-study-topic="nutricion"]')).toContainText('Leyes de la alimentación');
    await expect(page.locator('#studyPracticeHost #practice-nutricion')).toBeVisible();
    await expect(page.locator('#studyPracticeHost #practice-nutricion')).toContainText('40 preguntas hechas únicamente con el contenido de esta clase.');
    await page.locator('#studyPracticeHost #practice-nutricion').getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(page.locator('#studyPracticeHost #practice-nutricion .practice-sources')).toContainText('SOLO CONTENIDO DE LA CLASE');
    await expect(page.locator('#studyPracticeHost #practice-nutricion .practice-sources a')).toHaveAttribute('href', 'clase.html#nutrition-detail');

    await page.locator('[data-study-subject="fisiologia"]').click();
    await expect(page.locator('#studyTopicPicker .study-topic-option')).toHaveCount(2);
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-13"]')).toContainText('Control nervioso y químico');
    await page.locator('[data-study-topic="fisiologia-2026-08-10"]').click();
    await expect(page.locator('#studyPracticeHost #practice-fisiologia-2026-08-10')).toBeVisible();

    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      subjectColumns: getComputedStyle(document.getElementById('studySubjectPicker')).gridTemplateColumns.split(' ').length
    }));
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.subjectColumns).toBeGreaterThanOrEqual(2);
  });

  test('keeps a clear fallback when the shared database is not bound yet', async ({ page }) => {
    await seedProfile(page);
    await page.route('**/api/community**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'not_configured' })
      });
    });

    await page.goto('/comunidade.html');
    await expect(page.locator('#communityError')).toBeVisible();
    await expect(page.locator('#communityError')).toContainText('falta terminar su activación en Cloudflare');
    await expect(page.locator('#studyPracticeHost #practice-nutricion')).toBeVisible();
  });

  test('publishes a completed topic result from the dedicated study page', async ({ page }) => {
    await seedProfile(page);
    let submitted = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: true, best: { correct: 9, total: 10, percentage: 90 }, challenge: API_RESPONSE.challenge })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent('mednykuto:practice-complete', {
        detail: {
          courseId: 'nutricion', moduleId: 'nutricion-qcm', topicId: 'nutricion',
          topicTitle: 'Leyes de la alimentación', type: 'qcm', correct: 9, total: 10, percentage: 90
        }
      }));
    });
    await expect(page.locator('#studyPublishPanel')).toBeVisible();
    await expect(page.locator('#studyPublishTitle')).toHaveText('9/10 respuestas correctas');
    await page.locator('#studyPublishButton').click();
    await expect(page.locator('#studyPublishStatus')).toHaveText('Resultado publicado.');
    expect(submitted).toMatchObject({
      playerId: PLAYER_ID,
      nickname: 'Baboune',
      courseId: 'nutricion',
      moduleId: 'nutricion-qcm',
      correct: 9,
      total: 10
    });
  });

  test('offers voluntary score publication when a scoped QCM is completed', async ({ page }) => {
    await seedProfile(page);
    let submitted = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            saved: true,
            best: { correct: 18, total: 20, percentage: 90 },
            challenge: API_RESPONSE.challenge
          })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/qcm.html?course=fisiologia&module=01-fisiologia-01-neurofisiologia-y-potencial-de-accion', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v373', null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeAttached({ timeout: 20000 });
    await page.evaluate(() => {
      const completion = document.createElement('article');
      completion.className = 'practice-card completion-card';
      completion.innerHTML = '<p class="eyebrow">Fin de serie</p><h2>18/20 respuestas correctas · 90%</h2><p>Serie terminada.</p>';
      document.getElementById('practiceList').replaceChildren(completion);
    });

    const publisher = page.locator('.community-publish-card').last();
    await expect(publisher).toBeVisible();
    await expect(publisher.getByRole('heading', { name: '¿Te sumas al desafío del 4.º E?' })).toBeVisible();
    await expect(publisher.getByLabel('Apodo público')).toHaveValue('Baboune');
    await publisher.getByRole('button', { name: 'Sumar mi resultado' }).click();
    await expect(publisher.locator('.community-publish-status')).toHaveText('Resultado añadido: 18/20.');

    expect(submitted).toMatchObject({
      playerId: PLAYER_ID,
      nickname: 'Baboune',
      courseId: 'fisiologia',
      moduleId: '01-fisiologia-01-neurofisiologia-y-potencial-de-accion',
      correct: 18,
      total: 20
    });
  });

  test('links the class hub to study on desktop and mobile navigation', async ({ page }) => {
    await page.goto('/clase.html');
    await expect(page.locator('.workspace-nav a[href="comunidade.html"]')).toContainText('Estudiar');
    await expect(page.locator('.workspace-nav a[href="comunidade.html"]')).toContainText('QCM + ranking');
    await expect(page.locator('.mobile-bottom-nav a[href="comunidade.html"]')).toContainText('Estudiar');
  });
});
