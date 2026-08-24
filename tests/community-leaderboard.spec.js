const { test, expect } = require('@playwright/test');

const PROFILE_KEY = 'medNykutoCommunityProfile:v1';
const PLAYER_ID = '11111111-1111-4111-8111-111111111111';
const ACCESS_TOKEN = 'a'.repeat(64);
const PROFILE = {
  playerId: PLAYER_ID,
  displayName: 'Baboune',
  studentIdMasked: '•••• 6810',
  accessToken: ACCESS_TOKEN
};

const API_RESPONSE = {
  ok: true,
  cohort: 's4-e',
  class: {
    id: 's4-e',
    slug: 's4-e',
    name: 'Medicina · 4.º E',
    semester: 4,
    group: 'E',
    theme: 'midnight-gold',
    driveUrl: ''
  },
  week: {
    key: '2026-08-24',
    start: '2026-08-24',
    end: '2026-08-30',
    closesAt: '2026-08-30T23:59:59-03:00',
    timeZone: 'America/Asuncion'
  },
  challenge: {
    goal: 1000,
    points: 260,
    questions: 340,
    participants: 4,
    records: 8,
    progress: 26,
    prize: {
      amount: 50,
      currency: 'BRL',
      method: 'PIX',
      place: 1,
      classId: 's4-e',
      provisional: true,
      verificationRequired: true
    }
  },
  ranking: [
    {
      rank: 1,
      displayName: 'Nath',
      nickname: 'Nath',
      studentIdMasked: '•••• 1234',
      identityComplete: true,
      verificationStatus: 'pending',
      points: 92,
      questions: 110,
      accuracy: 84,
      challenges: 3,
      isCurrent: false
    },
    {
      rank: 2,
      displayName: 'Baboune',
      nickname: 'Baboune',
      studentIdMasked: '•••• 6810',
      identityComplete: true,
      verificationStatus: 'pending',
      points: 78,
      questions: 100,
      accuracy: 78,
      challenges: 2,
      isCurrent: true
    },
    {
      rank: 3,
      displayName: 'Perfil anterior',
      nickname: 'Perfil anterior',
      studentIdMasked: '',
      identityComplete: false,
      verificationStatus: 'legacy',
      points: 62,
      questions: 80,
      accuracy: 78,
      challenges: 2,
      isCurrent: false
    }
  ],
  currentUser: {
    rank: 2,
    displayName: 'Baboune',
    nickname: 'Baboune',
    studentIdMasked: '•••• 6810',
    identityComplete: true,
    verificationStatus: 'pending',
    points: 78,
    questions: 100,
    accuracy: 78,
    challenges: 2,
    isCurrent: true
  },
  generatedAt: '2026-08-24T12:00:00.000Z'
};

const EMPTY_API_RESPONSE = {
  ...API_RESPONSE,
  challenge: { ...API_RESPONSE.challenge, points: 0, questions: 0, participants: 0, records: 0, progress: 0 },
  ranking: [],
  currentUser: null
};

async function seedProfile(page, profile = PROFILE) {
  await page.addInitScript(({ key, savedProfile }) => {
    localStorage.setItem(key, JSON.stringify(savedProfile));
    localStorage.setItem('medLang', 'es');
  }, { key: PROFILE_KEY, savedProfile: profile });
}

async function mockCommunityGet(page, response = API_RESPONSE) {
  await page.route('**/api/community**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
  });
}

async function replaceWithCompletion(page, score = '18/20 respuestas correctas · 90%') {
  await page.evaluate((summary) => {
    const completion = document.createElement('article');
    completion.className = 'practice-card completion-card';
    completion.innerHTML = `<p class="eyebrow">Fin de serie</p><h2>${summary}</h2><p>Serie terminada.</p>`;
    document.getElementById('practiceList').replaceChildren(completion);
  }, score);
}

test.describe('Weekly S4-E class challenge', () => {
  test('shows the 50 R$ Pix prize, masked ranking and current S4-E profile in both languages', async ({ page }) => {
    await seedProfile(page);
    let rankingRequestUrl = '';
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'GET') rankingRequestUrl = route.request().url();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await expect(page.getByRole('heading', { name: 'Estudia por materia y tema.' })).toBeVisible();
    await expect(page.getByText('50 R$ vía Pix', { exact: true })).toBeVisible();
    await expect(page.getByText('Premio para el 1.er lugar verificado', { exact: true })).toBeVisible();
    await expect(page.getByText('Exclusivo para estudiantes matriculados en el 4.º E.', { exact: true })).toBeVisible();
    await expect(page.locator('#studyTopName')).toHaveText('Nath');
    await expect(page.locator('#studyTopMeta')).toContainText('92 aciertos');
    await expect(page.locator('#studyMyScoreValue')).toHaveText('78');
    await expect(page.locator('#studyMyScoreMeta')).toContainText('#2');
    await expect(page.locator('#challengeScore')).toHaveText('260 / 1.000');
    await expect(page.locator('#challengeProgressBar')).toHaveAttribute('aria-valuenow', '26');
    await expect(page.locator('#communityRanking .ranking-row')).toHaveCount(3);
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-name')).toHaveText('Nath');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveText('•••• 1234');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveAttribute('aria-label', 'Catraca terminada en 1234');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Baboune');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('•••• 6810');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Tú');
    await expect(page.locator('#communityRanking .ranking-row').last().locator('.ranking-catraca')).toHaveText('Perfil pendiente');
    await expect(page.locator('#challengeWeek')).toContainText('24 ago');
    expect(new URL(rankingRequestUrl).searchParams.get('class')).toBe('s4-e');
    expect(new URL(rankingRequestUrl).searchParams.get('player')).toBe(PLAYER_ID);
    expect(new URL(rankingRequestUrl).searchParams.has('nickname')).toBe(false);
    expect(await page.content()).not.toContain('246810');

    await page.locator('#communityLanguage').selectOption('br');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { name: 'Estude por matéria e tema.' })).toBeVisible();
    await expect(page.getByText('R$ 50 via Pix', { exact: true })).toBeVisible();
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Você');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveAttribute('aria-label', 'Catraca terminada em 1234');
    await expect(page.locator('[data-study-subject="nutricion"]')).toContainText('Nutrição');
  });

  test('migrates the v1 nickname profile and removes every locally stored complete catraca', async ({ page }) => {
    await seedProfile(page, {
      playerId: PLAYER_ID,
      nickname: 'Baboune Legacy',
      studentId: '246810',
      accessToken: 'invalid-token'
    });
    await mockCommunityGet(page, EMPTY_API_RESPONSE);

    await page.goto('/comunidade.html');
    await expect(page.locator('#communityDisplayName')).toHaveValue('Baboune Legacy');
    await expect(page.locator('#communityStudentId')).toHaveValue('');
    const stored = await page.evaluate((key) => ({ raw: localStorage.getItem(key), parsed: JSON.parse(localStorage.getItem(key)) }), PROFILE_KEY);
    expect(stored.raw).not.toContain('246810');
    expect(stored.parsed).toMatchObject({ playerId: PLAYER_ID, displayName: 'Baboune Legacy', accessToken: '' });
    expect(stored.parsed).not.toHaveProperty('nickname');
    expect(stored.parsed).not.toHaveProperty('studentId');
  });

  test('enrolls with name, catraca and consent while keeping only the mask and token locally', async ({ page }) => {
    await seedProfile(page, { playerId: PLAYER_ID });
    let submitted = null;
    let postCount = 0;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        postCount += 1;
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            class: API_RESPONSE.class,
            participant: {
              playerId: PLAYER_ID,
              displayName: 'Estudiante Fixture',
              studentIdMasked: '•••• 6810',
              verificationStatus: 'pending'
            },
            accessToken: 'b'.repeat(64)
          })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    const form = page.locator('#communityProfileForm');
    await expect(form.locator('input[name="displayName"]')).toBeVisible();
    await expect(form.locator('input[name="studentId"]')).toHaveAttribute('aria-describedby', 'communityPrivacy');
    await expect(form.locator('input[name="consent"]')).toHaveAttribute('type', 'checkbox');
    await form.locator('input[name="displayName"]').fill('Estudiante Fixture');
    await form.locator('input[name="studentId"]').fill('24-68-10');
    await form.locator('input[name="consent"]').check();
    await form.getByRole('button', { name: 'Guardar y participar' }).click();

    await expect(page.locator('#communityProfileStatus')).toContainText('Identidad guardada');
    await expect(page.locator('#communityProfileStatus')).toContainText('•••• 6810');
    await expect(form.locator('input[name="studentId"]')).toHaveValue('');
    expect(postCount).toBe(1);
    expect(submitted).toEqual({
      action: 'enroll',
      class: 's4-e',
      playerId: PLAYER_ID,
      displayName: 'Estudiante Fixture',
      studentId: '246810',
      consent: true
    });
    const stored = await page.evaluate((key) => ({ raw: localStorage.getItem(key), parsed: JSON.parse(localStorage.getItem(key)) }), PROFILE_KEY);
    expect(stored.raw).not.toContain('246810');
    expect(stored.parsed).toEqual({
      playerId: PLAYER_ID,
      displayName: 'Estudiante Fixture',
      studentIdMasked: '•••• 6810',
      accessToken: 'b'.repeat(64)
    });
    expect(stored.parsed).not.toHaveProperty('studentId');
  });

  test('selects a subject and grouped theme, then reuses the class practice bank', async ({ page }) => {
    await seedProfile(page);
    await mockCommunityGet(page);

    await page.goto('/comunidade.html');
    await expect(page.locator('#studySubjectPicker .study-subject-option')).toHaveCount(6);
    await expect(page.locator('[data-study-subject="nutricion"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-study-topic="nutricion"]')).toContainText('Leyes de la alimentación');
    await expect(page.locator('#studyPracticeHost #practice-nutricion')).toBeVisible();
    await expect(page.locator('#studyPracticeHost #practice-nutricion')).toContainText('40 preguntas hechas únicamente con el contenido de esta clase.');
    await page.locator('#studyPracticeHost #practice-nutricion').getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(page.locator('#practice-nutricion-dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#studyPracticeHost #practice-nutricion .practice-sources')).toContainText('SOLO CONTENIDO DE LA CLASE');
    await expect(page.locator('#studyPracticeHost #practice-nutricion .practice-sources a')).toHaveAttribute('href', 'clase.html#nutrition-detail');
    await page.locator('#practice-nutricion-dialog .practice-dialog-close').click();

    await page.locator('[data-study-subject="fisiologia"]').click();
    await expect(page.locator('#studyTopicPicker .study-topic-option')).toHaveCount(4);
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-20"]')).toBeVisible();
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

  test('publishes a completed topic with action, class and participant token', async ({ page }) => {
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
          courseId: 'nutricion',
          moduleId: 'nutricion-qcm',
          topicId: 'nutricion',
          topicTitle: 'Leyes de la alimentación',
          type: 'qcm',
          correct: 9,
          total: 10,
          percentage: 90
        }
      }));
    });
    await expect(page.locator('#studyPublishPanel')).toBeVisible();
    await expect(page.locator('#studyPublishTitle')).toHaveText('9/10 respuestas correctas');
    await page.locator('#studyPublishButton').click();
    await expect(page.locator('#studyPublishStatus')).toHaveText('Resultado publicado.');
    expect(submitted).toEqual({
      action: 'score',
      class: 's4-e',
      playerId: PLAYER_ID,
      accessToken: ACCESS_TOKEN,
      courseId: 'nutricion',
      moduleId: 'nutricion-qcm',
      correct: 9,
      total: 10
    });
    expect(submitted).not.toHaveProperty('studentId');
    expect(submitted).not.toHaveProperty('nickname');
  });

  test('publishes a Materias result with the same tokenized S4-E profile', async ({ page }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      localStorage.setItem('med-nykuto-class-practice-v431', JSON.stringify({
        nutricion: {
          qcm: Array.from({ length: 20 }, () => ({ selected: 0, correct: true })),
          vf: [],
          cases: []
        }
      }));
    });
    let submitted = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: true, best: { correct: 20, total: 20, percentage: 100 } })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/clase.html#practice-nutricion');
    const dialog = page.locator('#practice-nutricion-dialog');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('.class-practice-publish')).toBeVisible();
    await expect(dialog.locator('.class-practice-publish-field strong')).toHaveText('Baboune · •••• 6810');
    await dialog.getByRole('button', { name: 'Sumar mis puntos' }).click();
    await expect(dialog.locator('.class-practice-publish-status')).toContainText('Resultado publicado');
    expect(submitted).toEqual({
      action: 'score',
      class: 's4-e',
      playerId: PLAYER_ID,
      accessToken: ACCESS_TOKEN,
      courseId: 'nutricion',
      moduleId: 'nutricion-qcm',
      correct: 20,
      total: 20
    });
  });

  test('does not advertise or publish the cash challenge from a generic QCM without class=s4-e', async ({ page }) => {
    await seedProfile(page);
    let postCount = 0;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') postCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/qcm.html?course=fisiologia&module=01-fisiologia-01-neurofisiologia-y-potencial-de-accion', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v462', null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeAttached({ timeout: 20000 });
    await replaceWithCompletion(page);
    await page.waitForTimeout(50);

    await expect(page.locator('.community-publish-card')).toHaveCount(0);
    await expect(page.getByText('¿Te sumas al desafío del 4.º E?', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/50 R\$ por Pix/)).toHaveCount(0);
    expect(postCount).toBe(0);
  });

  test('offers tokenized publication from a scoped QCM only when class=s4-e is explicit', async ({ page }) => {
    await seedProfile(page);
    let submitted = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: true, best: { correct: 18, total: 20, percentage: 90 }, challenge: API_RESPONSE.challenge })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/qcm.html?course=fisiologia&module=01-fisiologia-01-neurofisiologia-y-potencial-de-accion&class=s4-e', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v462', null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeAttached({ timeout: 20000 });
    await replaceWithCompletion(page);

    const publisher = page.locator('.community-publish-card').last();
    await expect(publisher).toBeVisible();
    await expect(publisher.getByRole('heading', { name: '¿Te sumas al desafío del 4.º E?' })).toBeVisible();
    await expect(publisher.locator('.community-publish-identity')).toHaveText('Baboune · •••• 6810');
    await expect(publisher.locator('.community-publish-privacy')).toContainText('50 R$ por Pix');
    await publisher.getByRole('button', { name: 'Sumar mi resultado' }).click();
    await expect(publisher.locator('.community-publish-status')).toHaveText('Resultado añadido: 18/20.');

    expect(submitted).toEqual({
      action: 'score',
      class: 's4-e',
      playerId: PLAYER_ID,
      accessToken: ACCESS_TOKEN,
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

  test('keeps identity, prize, masked ranking and navigation usable at iPhone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedProfile(page);
    await mockCommunityGet(page);

    await page.goto('/comunidade.html', { waitUntil: 'domcontentloaded' });
    const navigation = page.locator('.mobile-bottom-nav');
    await expect(navigation).toBeVisible();
    await expect(navigation.locator('a')).toHaveCount(5);
    await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute('href', 'comunidade.html');
    await expect(navigation.locator('a[href="clase.html#inicio"]')).toContainText('Inicio');
    await expect(navigation.locator('a[href="clase.html#horario"]')).toContainText('Horario');
    await expect(navigation.locator('a[href="clase.html#pendientes"]')).toContainText('Tareas');
    await expect(navigation.locator('a[href="clase.html#materias"]')).toContainText('Materias');
    await expect(page.getByText('50 R$ vía Pix', { exact: true })).toBeVisible();
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveText('•••• 1234');
    await expect(page.locator('#communityProfileForm label[for="communityDisplayName"]')).toContainText('Nombre visible');
    await expect(page.locator('#communityProfileForm label[for="communityStudentId"]')).toContainText('Catraca UCP');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('Confirmo que pertenezco al 4.º E');

    const layout = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
      const navItems = Array.from(document.querySelectorAll('.mobile-bottom-nav a')).map((item) => item.getBoundingClientRect());
      const nameInput = document.getElementById('communityDisplayName').getBoundingClientRect();
      const studentInput = document.getElementById('communityStudentId').getBoundingClientRect();
      const profileButton = document.querySelector('#communityProfileForm button[type="submit"]').getBoundingClientRect();
      return {
        navHeight: nav.height,
        navBottom: window.innerHeight - nav.bottom,
        minNavItemHeight: Math.min(...navItems.map((item) => item.height)),
        bodyBottomPadding: parseFloat(getComputedStyle(document.body).paddingBottom),
        nameInputHeight: nameInput.height,
        studentInputHeight: studentInput.height,
        profileButtonHeight: profileButton.height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.navHeight).toBeGreaterThanOrEqual(58);
    expect(layout.navBottom).toBeGreaterThanOrEqual(3);
    expect(layout.minNavItemHeight).toBeGreaterThanOrEqual(58);
    expect(layout.bodyBottomPadding).toBeGreaterThanOrEqual(layout.navHeight + 12);
    expect(layout.nameInputHeight).toBeGreaterThanOrEqual(44);
    expect(layout.studentInputHeight).toBeGreaterThanOrEqual(44);
    expect(layout.profileButtonHeight).toBeGreaterThanOrEqual(44);
    expect(layout.overflow).toBeLessThanOrEqual(1);

    await page.locator('#communityLanguage').selectOption('br');
    await expect(navigation.locator('a[href="clase.html#pendientes"]')).toContainText('Tarefas');
    await expect(navigation.locator('a[href="clase.html#materias"]')).toContainText('Matérias');
    await expect(navigation.locator('a[aria-current="page"]')).toContainText('Estudar');
  });
});
