const { test, expect } = require('@playwright/test');

const PROFILE_KEY = 'medNykutoCommunityProfile:v1';
const PLAYER_ID = '11111111-1111-4111-8111-111111111111';
const ACCESS_TOKEN = 'a'.repeat(64);
const PROFILE = {
  playerId: PLAYER_ID,
  fullName: 'Baboune Nykuto',
  displayName: 'Baboune Nykuto',
  catraca: '0246810',
  studentIdMasked: '',
  classConfirmed: true,
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
    closesAt: '2026-08-30T20:00:00-03:00',
    timeZone: 'America/Asuncion',
    closed: false,
    secondsRemaining: 558000
  },
  challenge: {
    goal: 1000,
    points: 260,
    questions: 340,
    participants: 4,
    records: 8,
    progress: 26,
    closed: false,
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
      fullName: 'Nath Oliveira',
      displayName: 'Nath Oliveira',
      nickname: 'Nath Oliveira',
      catraca: '001234',
      studentId: '001234',
      identityComplete: true,
      verificationStatus: 'pending',
      eligibleForPrize: false,
      prizeEligible: false,
      points: 92,
      questions: 110,
      accuracy: 84,
      challenges: 3,
      isCurrent: false
    },
    {
      rank: 2,
      fullName: 'Baboune Nykuto',
      displayName: 'Baboune Nykuto',
      nickname: 'Baboune Nykuto',
      catraca: '0246810',
      studentId: '0246810',
      identityComplete: true,
      verificationStatus: 'pending',
      eligibleForPrize: false,
      prizeEligible: false,
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
      eligibleForPrize: false,
      prizeEligible: false,
      points: 62,
      questions: 80,
      accuracy: 78,
      challenges: 2,
      isCurrent: false
    }
  ],
  currentUser: {
    rank: 2,
    fullName: 'Baboune Nykuto',
    displayName: 'Baboune Nykuto',
    nickname: 'Baboune Nykuto',
    catraca: '0246810',
    studentId: '0246810',
    identityComplete: true,
    verificationStatus: 'pending',
    eligibleForPrize: false,
    prizeEligible: false,
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
  test('shows the 50 R$ Pix prize, complete public catracas and provisional S4-E ranking in both languages', async ({ page }) => {
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
    await expect(page.locator('#studyTopName')).toHaveText('Nath Oliveira');
    await expect(page.locator('#studyTopMeta')).toContainText('92 aciertos');
    await expect(page.locator('#studyMyScoreValue')).toHaveText('78');
    await expect(page.locator('#studyMyScoreMeta')).toContainText('#2');
    await expect(page.locator('#challengeScore')).toHaveText('260 / 1.000');
    await expect(page.locator('#challengeProgressBar')).toHaveAttribute('aria-valuenow', '26');
    await expect(page.locator('#communityRanking .ranking-row')).toHaveCount(3);
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-name')).toHaveText('Nath Oliveira');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveText('001234');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveAttribute('aria-label', 'Catraca completa: 001234');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-verification')).toHaveText('Verificación pendiente · clasificación provisional');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Baboune Nykuto');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('0246810');
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Tú');
    await expect(page.locator('#communityRanking .ranking-row').last().locator('.ranking-catraca')).toHaveText('—');
    await expect(page.locator('#communityRanking .ranking-row').last().locator('.ranking-verification')).toHaveText('Identificación pendiente · sin premio');
    await expect(page.locator('#challengeWeek')).toContainText('24 ago');
    await expect(page.locator('#challengeCountdown')).toHaveAttribute('data-state', 'open');
    await expect(page.locator('#challengeCountdownLabel')).toHaveText('Domingo 30 ago · 20:00 · hora de Paraguay');
    await expect(page.locator('#challengeCountdownDays')).toHaveText('06');
    await expect(page.locator('#challengeCountdownHours')).toHaveText('11');
    expect(new URL(rankingRequestUrl).searchParams.get('class')).toBe('s4-e');
    expect(new URL(rankingRequestUrl).searchParams.get('player')).toBe(PLAYER_ID);
    expect(new URL(rankingRequestUrl).searchParams.has('nickname')).toBe(false);
    expect(await page.content()).toContain('0246810');

    await page.locator('#communityLanguage').selectOption('br');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.getByRole('heading', { name: 'Estude por matéria e tema.' })).toBeVisible();
    await expect(page.getByText('R$ 50 via Pix', { exact: true })).toBeVisible();
    await expect(page.locator('#communityRanking .ranking-row.is-current')).toContainText('Você');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveAttribute('aria-label', 'Catraca completa: 001234');
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-verification')).toHaveText('Verificação pendente · classificação provisória');
    await expect(page.locator('#challengeCountdownLabel')).toHaveText('Domingo 30 de ago · 20:00 · horário do Paraguai');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('Participar é facultativo');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('nome completo e minha catraca completa sejam públicos');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('verificação manual');
    await expect(page.locator('[data-study-subject="nutricion"]')).toContainText('Nutrição');
  });

  test('freezes the exact countdown and ranking when Sunday 20:00 Paraguay is reached', async ({ page }) => {
    await seedProfile(page);
    await mockCommunityGet(page, {
      ...API_RESPONSE,
      week: { ...API_RESPONSE.week, closed: true, secondsRemaining: 0 },
      challenge: { ...API_RESPONSE.challenge, closed: true },
      generatedAt: '2026-08-30T23:00:00.000Z'
    });

    await page.goto('/comunidade.html');
    await expect(page.locator('#challengeCountdown')).toHaveAttribute('data-state', 'closed');
    await expect(page.locator('#challengeCountdownLabel')).toHaveText('Clasificación cerrada · ganador en verificación');
    await expect(page.locator('#challengeCountdownDays')).toHaveText('00');
    await expect(page.locator('#challengeCountdownHours')).toHaveText('00');
    await expect(page.locator('#challengeCountdownMinutes')).toHaveText('00');
    await expect(page.locator('#challengeCountdownSeconds')).toHaveText('00');
    await expect(page.locator('#rankingTitle')).toHaveText('Clasificación final provisional');
    await expect(page.locator('.ranking-explanation')).toContainText('clasificación está congelada');
  });

  test('migrates the PR 134 masked profile, prefills the name and asks again for the complete catraca', async ({ page }) => {
    await seedProfile(page, {
      playerId: PLAYER_ID,
      displayName: 'Baboune Legacy',
      studentIdMasked: '•••• 6810',
      accessToken: ACCESS_TOKEN
    });
    await mockCommunityGet(page, EMPTY_API_RESPONSE);

    await page.goto('/comunidade.html');
    await expect(page.locator('#communityDisplayName')).toHaveValue('Baboune Legacy');
    await expect(page.locator('#communityStudentId')).toHaveValue('');
    await expect(page.locator('#communityProfileStatus')).toContainText('Vuelve a escribir la catraca completa');
    const stored = await page.evaluate((key) => ({ raw: localStorage.getItem(key), parsed: JSON.parse(localStorage.getItem(key)) }), PROFILE_KEY);
    expect(stored.parsed).toMatchObject({ playerId: PLAYER_ID, fullName: 'Baboune Legacy', displayName: 'Baboune Legacy', catraca: '', studentIdMasked: '•••• 6810', classConfirmed: false, accessToken: ACCESS_TOKEN });
    expect(stored.parsed).not.toHaveProperty('studentId');
  });

  test('requires a two-word full name before enrollment', async ({ page }) => {
    await seedProfile(page, { playerId: PLAYER_ID });
    let postCount = 0;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') postCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    const form = page.locator('#communityProfileForm');
    await form.locator('input[name="displayName"]').fill('Maria');
    await form.locator('input[name="studentId"]').fill('001234');
    await form.locator('input[name="classConfirmed"]').check();
    await form.locator('input[name="consent"]').check();
    await form.getByRole('button', { name: 'Guardar y participar' }).click();

    await expect(page.locator('#communityProfileStatus')).toContainText('nombre completo (2 palabras');
    expect(postCount).toBe(0);

    await form.locator('input[name="displayName"]').fill('Ana . Silva');
    await form.getByRole('button', { name: 'Guardar y participar' }).click();
    await expect(page.locator('#communityProfileStatus')).toContainText('nombre completo (2 palabras');
    expect(postCount).toBe(0);
  });

  test('enrolls with full name, complete catraca, 4E attestation and explicit public-data consent', async ({ page }) => {
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
              studentId: '0246810',
              verificationStatus: 'pending'
            },
            accessToken: submitted.accessToken
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
    await expect(form.locator('input[name="displayName"]')).toHaveAttribute('minlength', '5');
    await expect(form.locator('input[name="classConfirmed"]')).toHaveAttribute('type', 'checkbox');
    await expect(form.locator('input[name="consent"]')).toHaveAttribute('type', 'checkbox');
    await expect(form.locator('label[for="communityIdentityConsent"]')).toContainText('Participar es facultativo');
    await expect(form.locator('label[for="communityIdentityConsent"]')).toContainText('nombre completo y mi catraca completa sean públicos');
    await expect(form.locator('label[for="communityIdentityConsent"]')).toContainText('cualquier persona que tenga el enlace');
    await expect(form.locator('label[for="communityIdentityConsent"]')).toContainText('verificación manual');
    await form.locator('input[name="displayName"]').fill('Estudiante Fixture');
    await form.locator('input[name="studentId"]').fill('02-46-810');
    await form.locator('input[name="classConfirmed"]').check();
    await form.locator('input[name="consent"]').check();
    await form.getByRole('button', { name: 'Guardar y participar' }).click();

    await expect(page.locator('#communityProfileStatus')).toContainText('Perfil guardado');
    await expect(page.locator('#communityProfileStatus')).toContainText('clasificación es provisional');
    await expect(page.locator('#communityProfileStatus')).toContainText('0246810');
    await expect(form.locator('input[name="studentId"]')).toHaveValue('0246810');
    expect(postCount).toBe(1);
    expect(submitted).toMatchObject({
      action: 'enroll',
      class: 's4-e',
      playerId: PLAYER_ID,
      fullName: 'Estudiante Fixture',
      displayName: 'Estudiante Fixture',
      catraca: '0246810',
      studentId: '0246810',
      classConfirmed: true,
      consent: true
    });
    expect(submitted.accessToken).toMatch(/^[0-9a-f]{64}$/);
    const stored = await page.evaluate((key) => ({ raw: localStorage.getItem(key), parsed: JSON.parse(localStorage.getItem(key)) }), PROFILE_KEY);
    expect(stored.parsed).toEqual({
      playerId: PLAYER_ID,
      fullName: 'Estudiante Fixture',
      displayName: 'Estudiante Fixture',
      catraca: '0246810',
      studentIdMasked: '',
      classConfirmed: true,
      accessToken: submitted.accessToken
    });
    expect(stored.parsed).not.toHaveProperty('studentId');
  });

  test('sends the existing access token for a safe update and preserves the local profile on identity conflict', async ({ page }) => {
    await seedProfile(page);
    let submitted = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, code: 'identity_conflict' })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    const before = await page.evaluate((key) => localStorage.getItem(key), PROFILE_KEY);
    const form = page.locator('#communityProfileForm');
    await form.locator('input[name="displayName"]').fill('Nombre En Conflicto');
    await form.locator('input[name="studentId"]').fill('00-99-99');
    await form.locator('input[name="classConfirmed"]').check();
    await form.locator('input[name="consent"]').check();
    await form.getByRole('button', { name: 'Guardar y participar' }).click();

    await expect(page.locator('#communityProfileStatus')).toContainText('Esta catraca ya está asociada a otro perfil');
    const helpLink = page.locator('#communityProfileStatus .community-profile-help-link');
    await expect(helpLink).toHaveText('Abrir Help Desk');
    await expect(helpLink).toHaveAttribute('href', /contact\.html\?reason=challenge-identity/);
    await expect(form.locator('input[name="studentId"]')).toHaveValue('00-99-99');
    expect(submitted).toMatchObject({
      action: 'enroll',
      class: 's4-e',
      playerId: PLAYER_ID,
      accessToken: ACCESS_TOKEN,
      fullName: 'Nombre En Conflicto',
      displayName: 'Nombre En Conflicto',
      catraca: '009999',
      studentId: '009999',
      classConfirmed: true,
      consent: true
    });
    expect(await page.evaluate((key) => localStorage.getItem(key), PROFILE_KEY)).toBe(before);
  });

  test('persists and reuses the client access token when the first enrollment response is lost', async ({ page }) => {
    await seedProfile(page, { playerId: PLAYER_ID });
    const submissions = [];
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_API_RESPONSE) });
        return;
      }
      const submitted = route.request().postDataJSON();
      submissions.push(submitted);
      if (submissions.length === 1) {
        await route.abort('failed');
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          participant: { playerId: PLAYER_ID, fullName: submitted.fullName, catraca: submitted.catraca, verificationStatus: 'pending' },
          accessToken: submitted.accessToken
        })
      });
    });

    await page.goto('/comunidade.html');
    const form = page.locator('#communityProfileForm');
    await form.locator('input[name="displayName"]').fill('Respuesta Perdida');
    await form.locator('input[name="studentId"]').fill('001122');
    await form.locator('input[name="classConfirmed"]').check();
    await form.locator('input[name="consent"]').check();
    const submit = form.getByRole('button', { name: 'Guardar y participar' });
    await submit.click();
    await expect(page.locator('#communityProfileStatus')).toContainText('No se pudo guardar');
    const pendingToken = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).pendingAccessToken, PROFILE_KEY);
    expect(pendingToken).toMatch(/^[0-9a-f]{64}$/);

    await submit.click();
    await expect(page.locator('#communityProfileStatus')).toContainText('Perfil guardado');
    expect(submissions).toHaveLength(2);
    expect(submissions[1].accessToken).toBe(submissions[0].accessToken);
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROFILE_KEY);
    expect(stored.accessToken).toBe(pendingToken);
    expect(stored).not.toHaveProperty('pendingAccessToken');
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
    await expect(page.locator('#studyTopicPicker .study-topic-option')).toHaveCount(5);
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-24"]')).toBeVisible();
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

  test('shows the 26 August Bioquímica and Epidemiología shortcuts beside the ranking', async ({ page }) => {
    await seedProfile(page);
    await mockCommunityGet(page);

    await page.goto('/comunidade.html#ranking');
    const biochemistry = page.locator('[data-study-topic-shortcut="bioquimica-2026-08-26"]');
    const epidemiology = page.locator('[data-study-topic-shortcut="epidemiologia-2026-08-26"]');
    await expect(biochemistry).toBeVisible();
    await expect(biochemistry).toContainText('Bioquímica · Cori y pentosas');
    await expect(epidemiology).toBeVisible();
    await expect(epidemiology).toContainText('Epidemiología · Casos de triaje');

    await biochemistry.click();
    await expect(page).toHaveURL(/#bioquimica-2026-08-26$/);
    await expect(page.locator('[data-study-subject="bioquimica"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-study-topic="bioquimica-2026-08-26"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#studyPracticeHost #practice-bioquimica-2026-08-26')).toBeVisible();

    await page.locator('[data-study-subject="fisiologia"]').click();
    await expect(page.locator('[data-study-subject="fisiologia"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-study-topic-shortcut="bioquimica-2026-08-26"]').click();
    await expect(page.locator('[data-study-subject="bioquimica"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-study-topic="bioquimica-2026-08-26"]')).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/comunidade.html#ranking');
    await page.locator('[data-study-topic-shortcut="epidemiologia-2026-08-26"]').click();
    await expect(page).toHaveURL(/#epidemiologia-2026-08-26$/);
    await expect(page.locator('[data-study-subject="epidemiologia"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-study-topic="epidemiologia-2026-08-26"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#studyPracticeHost #practice-epidemiologia-2026-08-26')).toBeVisible();
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
    await expect(page.locator('#studyPublishTitle')).toHaveText('9/10 respuestas correctas ya realizadas');
    await page.locator('#studyPublishButton').click();
    await expect(page.locator('#studyPublishStatus')).toHaveText('Todo tu progreso realizado fue sincronizado.');
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

  test('restores 31 answered questions and synchronizes every format from Estudiar with one click', async ({ page }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      localStorage.setItem('med-nykuto-class-practice-v431', JSON.stringify({
        nutricion: {
          qcm: Array.from({ length: 20 }, () => ({ selected: 0, correct: true })),
          vf: Array.from({ length: 10 }, (_, index) => ({ selected: 0, correct: index !== 9 })),
          cases: [{ selected: 0, correct: true }]
        }
      }));
    });
    const submissions = [];
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        submissions.push(payload);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: payload.moduleId !== 'nutricion-vf', best: { correct: payload.correct, total: payload.total } })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await expect(page.locator('#studyPublishPanel')).toBeVisible();
    await expect(page.locator('#studyPublishTitle')).toHaveText('30/31 respuestas correctas ya realizadas');
    await expect(page.locator('#studyPublishCopy')).toContainText('Un solo clic');
    await page.getByRole('button', { name: 'Sumar todo al ranking' }).click();
    await expect(page.locator('#studyPublishStatus')).toHaveText('Todo tu progreso realizado fue sincronizado.');
    await expect.poll(() => submissions.length).toBe(3);
    expect(submissions.sort((left, right) => left.moduleId.localeCompare(right.moduleId))).toEqual([
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-cases', correct: 1, total: 10 },
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-qcm', correct: 20, total: 20 },
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-vf', correct: 9, total: 10 }
    ]);
  });

  test('queues a fresh ranking read when a score is published during an older GET', async ({ page }) => {
    await seedProfile(page);
    let releaseFirstGet = null;
    let getCount = 0;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, saved: true }) });
        return;
      }
      getCount += 1;
      if (getCount === 1) {
        await new Promise((resolve) => { releaseFirstGet = resolve; });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(EMPTY_API_RESPONSE) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await expect.poll(() => Boolean(releaseFirstGet)).toBe(true);
    await page.evaluate(() => window.MedNykutoCommunity.publishScore({ courseId: 'nutricion', moduleId: 'queued-refresh', correct: 8, total: 10 }));
    releaseFirstGet();
    await expect.poll(() => getCount).toBe(2);
    await expect(page.locator('#communityRanking .ranking-row')).toHaveCount(3);
  });

  test('does not attribute a delayed publication to a newer completed result', async ({ page }) => {
    await seedProfile(page);
    let releasePost = null;
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => { releasePost = resolve; });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, saved: true }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/comunidade.html');
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('mednykuto:practice-complete', {
      detail: { courseId: 'nutricion', moduleId: 'first-result', topicId: 'nutricion', correct: 9, total: 10 }
    })));
    await page.locator('#studyPublishButton').click();
    await expect.poll(() => Boolean(releasePost)).toBe(true);
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('mednykuto:practice-complete', {
      detail: { courseId: 'nutricion', moduleId: 'newer-result', topicId: 'nutricion', correct: 4, total: 5 }
    })));
    await expect(page.locator('#studyPublishTitle')).toHaveText('4/5 respuestas correctas ya realizadas');
    releasePost();
    await expect(page.locator('#studyPublishButton')).toBeEnabled();
    await expect(page.locator('#studyPublishTitle')).toHaveText('4/5 respuestas correctas ya realizadas');
    await expect(page.locator('#studyPublishStatus')).toHaveText('');
  });

  test('publishes all locally answered Materias formats with one click and existing scopes', async ({ page }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      localStorage.setItem('med-nykuto-class-practice-v431', JSON.stringify({
        nutricion: {
          qcm: Array.from({ length: 20 }, () => ({ selected: 0, correct: true })),
          vf: Array.from({ length: 10 }, (_, index) => ({ selected: 0, correct: index !== 9 })),
          cases: [{ selected: 0, correct: true }]
        }
      }));
    });
    const submissions = [];
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        submissions.push(payload);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, saved: payload.moduleId !== 'nutricion-vf', best: { correct: payload.correct, total: payload.total } })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(API_RESPONSE) });
    });

    await page.goto('/clase.html#practice-nutricion');
    const dialog = page.locator('#practice-nutricion-dialog');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('.class-practice-publish')).toBeVisible();
    await expect(dialog.locator('.class-practice-publish h5')).toHaveText('30/31 respuestas correctas ya realizadas');
    await expect(dialog.locator('.class-practice-publish-field strong')).toHaveText('Baboune Nykuto · 0246810');
    await dialog.getByRole('button', { name: 'Sumar todo mi progreso' }).click();
    await expect(dialog.locator('.class-practice-publish-status')).toContainText('Todo tu progreso realizado fue sincronizado');
    await expect.poll(() => submissions.length).toBe(3);
    expect(submissions.sort((left, right) => left.moduleId.localeCompare(right.moduleId))).toEqual([
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-cases', correct: 1, total: 10 },
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-qcm', correct: 20, total: 20 },
      { action: 'score', class: 's4-e', playerId: PLAYER_ID, accessToken: ACCESS_TOKEN, courseId: 'nutricion', moduleId: 'nutricion-vf', correct: 9, total: 10 }
    ]);
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
    await expect(publisher.locator('.community-publish-identity')).toHaveText('Baboune Nykuto · 0246810');
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

  test('explains the frozen ranking when a scoped QCM is submitted after the exact cutoff', async ({ page }) => {
    await seedProfile(page);
    await page.route('**/api/community**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, code: 'challenge_closed' })
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
    await publisher.getByRole('button', { name: 'Sumar mi resultado' }).click();
    await expect(publisher.locator('.community-publish-status')).toContainText('cerró el domingo a las 20:00');
    await expect(publisher.locator('.community-publish-status')).toContainText('ya no cambia la clasificación');
  });

  test('links the class hub to study on desktop and mobile navigation', async ({ page }) => {
    await page.goto('/clase.html');
    await expect(page.locator('.workspace-nav a[href="comunidade.html"]')).toContainText('Estudiar');
    await expect(page.locator('.workspace-nav a[href="comunidade.html"]')).toContainText('QCM + ranking');
    await expect(page.locator('.mobile-bottom-nav a[href="comunidade.html"]')).toContainText('Estudiar');
  });

  test('keeps public identity, prize, consent and navigation usable at iPhone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedProfile(page);
    await mockCommunityGet(page);

    await page.goto('/comunidade.html', { waitUntil: 'domcontentloaded' });
    const navigation = page.locator('.mobile-bottom-nav');
    await expect(navigation).toBeVisible();
    await expect(navigation.locator('a')).toHaveCount(6);
    await expect(navigation.locator('a[aria-current="page"]')).toHaveAttribute('href', 'comunidade.html');
    await expect(navigation.locator('a[href="clase.html#inicio"]')).toContainText('Inicio');
    await expect(navigation.locator('a[href="clase.html#horario"]')).toContainText('Horario');
    await expect(navigation.locator('a[href="clase.html#pendientes"]')).toContainText('Tareas');
    await expect(navigation.locator('a[href="clase.html#avisos"]')).toContainText('Avisos');
    await expect(navigation.locator('a[href="clase.html#materias"]')).toContainText('Materias');
    await expect(page.getByText('50 R$ vía Pix', { exact: true })).toBeVisible();
    await expect(page.locator('#communityRanking .ranking-row').first().locator('.ranking-catraca')).toHaveText('001234');
    await expect(page.locator('#communityProfileForm label[for="communityDisplayName"]')).toContainText('Nombre completo');
    await expect(page.locator('#communityProfileForm label[for="communityStudentId"]')).toContainText('Catraca UCP completa');
    await expect(page.locator('#communityProfileForm label[for="communityClassConfirmed"]')).toContainText('matriculado/a en el 4.º E');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('Participar es facultativo');
    await expect(page.locator('#communityProfileForm label[for="communityIdentityConsent"]')).toContainText('catraca completa sean públicos');

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
        minNavItemWidth: Math.min(...navItems.map((item) => item.width)),
        navScrollWidth: document.querySelector('.mobile-bottom-nav').scrollWidth,
        navClientWidth: document.querySelector('.mobile-bottom-nav').clientWidth,
        activeLeft: document.querySelector('.mobile-bottom-nav [aria-current="page"]').getBoundingClientRect().left - nav.left,
        activeRight: nav.right - document.querySelector('.mobile-bottom-nav [aria-current="page"]').getBoundingClientRect().right,
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
    expect(layout.minNavItemWidth).toBeGreaterThanOrEqual(78);
    expect(layout.navScrollWidth).toBeGreaterThan(layout.navClientWidth);
    expect(layout.activeLeft).toBeGreaterThanOrEqual(-1);
    expect(layout.activeRight).toBeGreaterThanOrEqual(-1);
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
