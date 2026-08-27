const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const readRepo = (file) => fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
const CSRF_COOKIE = '__Host-med-nykuto-management-csrf';
const CSRF_VALUE = 'c'.repeat(64);

const PUBLIC_RELEASE = {
  id: 'bioquimica-parcial-1',
  course: 'Bioquímica II',
  title: 'Primer parcial',
  evaluation: 'Teoría · Parcial 1',
  revision: 2,
  publishedAt: '2026-08-27T15:30:00.000Z',
  maxGrade: 10,
  rows: [
    { studentId: '00001234', result: '8.5', fullName: 'Alice Private', cpf: '52998224725' },
    { studentId: '00000099', result: 'Ausente', email: 'student.private@example.test' }
  ],
  answerKey: [{ question: '1', answer: 'A' }, { question: '2', answer: 'Verdadero' }],
  phone: '+595981234567'
};

function managementState(actor, gradeReleases = []) {
  return {
    ok: true,
    class: { id: 's4-e', slug: 's4-e', name: 'Medicina · 4.º E', semester: 4, group: 'E' },
    actor,
    profile: {},
    uploadPolicy: { enabled: false, maxBytes: 15 * 1024 * 1024, acceptedMimeTypes: [] },
    subjects: [{ id: 'bioquimica-ii', name: 'Bioquímica II', order: 1, status: 'active' }],
    lessons: [], tasks: [], notices: [], activities: [], groups: [], memberships: [], files: [], dates: [],
    scheduleSlots: [], upcomingDates: [], editors: [], invites: [], challengeReview: { candidates: [] },
    gradeReleases
  };
}

async function exposeSyntheticCsrfCookie(page) {
  await page.addInitScript(({ name, value }) => {
    const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        const current = descriptor?.get ? descriptor.get.call(document) : '';
        return [current, `${name}=${value}`].filter(Boolean).join('; ');
      },
      set(next) {
        if (descriptor?.set) descriptor.set.call(document, next);
      }
    });
  }, { name: CSRF_COOKIE, value: CSRF_VALUE });
}

async function routeManagementShell(page) {
  await page.route('**/gestion/s4-e', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: readRepo('gestion-shell/index.html')
  }));
}

test.describe('Public notes and answer keys', () => {
  test('loads only the dedicated projection and searches locally without exposing extra PII', async ({ page }) => {
    const requests = [];
    await page.route('**/api/class-hub**', async (route) => {
      const url = new URL(route.request().url());
      requests.push({ method: route.request().method(), resource: url.searchParams.get('resource'), classId: url.searchParams.get('class') });
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        headers: { 'cache-control': 'no-store' },
        body: JSON.stringify({ ok: true, releases: [PUBLIC_RELEASE] })
      });
    });

    await page.goto('/notas.html');

    await expect(page.locator('link[href^="notas-v486.css"]')).toHaveAttribute('href', 'notas-v486.css?v=486');
    await expect(page.locator('script[src^="notas-v486.js"]')).toHaveAttribute('src', 'notas-v486.js?v=486');
    await expect(page.getByRole('heading', { name: 'Notas y gabaritos' })).toBeVisible();
    await expect(page.locator('.release-card')).toHaveCount(1);
    await expect(page.locator('.release-card')).toContainText('Bioquímica II');
    await expect(page.locator('.release-card')).toContainText('Teoría · Parcial 1');
    await expect(page.locator('.release-card')).toContainText('Versión 2');
    await expect(page.locator('.release-card')).toContainText('Nota máxima · 10');
    await expect(page.locator('.results-table tbody tr')).toHaveCount(2);
    await expect(page.locator('.answer-key')).toContainText('Pregunta 1');
    await expect(page.locator('.answer-key')).toContainText('Verdadero');

    expect(requests).toEqual([{ method: 'GET', resource: 'academic-results', classId: 's4-e' }]);
    const bodyText = await page.locator('body').textContent();
    for (const forbiddenValue of ['Alice Private', '52998224725', 'student.private@example.test', '+595981234567']) {
      expect(bodyText).not.toContain(forbiddenValue);
    }

    const search = page.locator('#studentIdSearch');
    await expect(search).toHaveAttribute('autocomplete', 'off');
    await search.fill('000-01');
    await expect(page.locator('.release-card:not([hidden]) .results-table tbody tr')).toHaveCount(1);
    await expect(page.locator('.release-card:not([hidden]) .results-table tbody')).toContainText('00001234');
    await expect(page.locator('#resultCount')).toHaveText('1 resultado en 1 evaluación.');

    const browserState = await page.evaluate(() => ({
      url: location.href,
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage)
    }));
    expect(new URL(browserState.url).search).toBe('');
    expect(new URL(browserState.url).hash).toBe('');
    expect(browserState.local).toEqual([]);
    expect(browserState.session).toEqual([]);
  });

  test('keeps the search and results usable on a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, releases: [PUBLIC_RELEASE] })
    }));
    await page.goto('/notas.html');
    await expect(page.getByLabel('Catraca o matrícula')).toBeVisible();
    const clearHeight = await page.locator('#clearStudentSearch').evaluate((node) => node.getBoundingClientRect().height);
    expect(clearHeight).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('Owner-only grade management', () => {
  test('blocks PII columns, sends only strict rows, then publishes and archives by revision', async ({ page }) => {
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    const owner = { id: 'owner', role: 'owner', name: 'Propietario', classId: 's4-e' };
    let gradeReleases = [];
    const posts = [];

    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const resource = url.searchParams.get('resource');
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        posts.push({ body, actionHint: url.searchParams.get('action'), csrf: request.headers()['x-csrf-token'] || '' });
        if (body.action === 'grade.release.upsert') {
          gradeReleases = [{
            id: body.id, subjectId: body.subjectId, title: body.title, evaluation: body.evaluation,
            maxGrade: body.maxGrade, revision: 1, status: 'draft',
            rows: body.rows.map((row) => ({ studentId: row.studentId, result: row.absent ? 'Ausente' : String(row.grade) })),
            answerKey: body.answerKey
          }];
        } else if (body.action === 'grade.release.publish') {
          gradeReleases = gradeReleases.map((release) => ({ ...release, status: 'published', revision: release.revision + 1 }));
        } else if (body.action === 'grade.release.archive') {
          gradeReleases = gradeReleases.map((release) => ({ ...release, status: 'archived', revision: release.revision + 1 }));
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        return;
      }
      if (resource === 'public') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, class: managementState(owner).class }) });
        return;
      }
      if (resource === 'session') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, actor: owner, class: managementState(owner).class, passwordChangeRequired: false }) });
        return;
      }
      if (resource === 'classes') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, classes: [] }) });
        return;
      }
      if (resource === 'audit') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, audit: [] }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(owner, gradeReleases)) });
    });

    await page.goto('/gestion/s4-e');
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('link[href^="/gestion-v440.css"]')).toHaveAttribute('href', '/gestion-v440.css?v=488');
    await expect(page.locator('script[src^="/gestion-v440.js"]')).toHaveAttribute('src', '/gestion-v440.js?v=490');
    await expect(page.locator('#manageTabGrades')).toBeVisible();
    await page.locator('#manageTabGrades').click();
    await expect(page.locator('#managePanelGrades')).toBeVisible();
    await expect(page.locator('.grade-privacy-warning')).toContainText('CPF');

    const form = page.locator('#gradeReleaseForm');
    await form.locator('[name="subjectId"]').selectOption('bioquimica-ii');
    await form.locator('[name="maxGrade"]').fill('10');
    await form.locator('[name="title"]').fill('Primer parcial');
    await form.locator('[name="evaluation"]').fill('Teoría · Parcial 1');
    await page.locator('#gradeRowsInput').fill('nombre,catraca,nota\nAlice,00001234,8.5');
    await form.getByRole('button', { name: 'Guardar borrador' }).click();
    await expect(page.locator('#gradeImportStatus')).toContainText('Importación bloqueada');
    expect(posts).toHaveLength(0);

    await page.locator('#gradeRowsInput').fill('catraca,nota\n00-001-234,8.5\n000-001,Ausente');
    await page.locator('#gradeAnswerKeyInput').fill('pregunta,respuesta\n1,A\n2,Verdadero');
    await expect(page.locator('#gradeImportStatus')).toContainText('2 resultados válidos');
    await expect(page.locator('#gradePreview')).toContainText('•••• 1234');
    await expect(page.locator('#gradePreview')).not.toContainText('00001234');
    await form.getByRole('button', { name: 'Guardar borrador' }).click();
    await expect.poll(() => posts.length).toBe(1);

    const upsert = posts[0];
    expect(upsert.actionHint).toBe('grade.release.upsert');
    expect(upsert.csrf).toBe(CSRF_VALUE);
    expect(upsert.body).toEqual({
      action: 'grade.release.upsert',
      id: 'grade-bioquimica-ii-teoria-parcial-1-primer-parcial',
      subjectId: 'bioquimica-ii',
      title: 'Primer parcial',
      evaluation: 'Teoría · Parcial 1',
      maxGrade: 10,
      rows: [{ studentId: '00001234', grade: 8.5 }, { studentId: '000001', absent: true }],
      answerKey: [{ question: '1', answer: 'A' }, { question: '2', answer: 'Verdadero' }],
      expectedRevision: 0
    });
    expect(JSON.stringify(upsert.body)).not.toContain('Alice');
    expect(Object.keys(upsert.body.rows[0]).sort()).toEqual(['grade', 'studentId']);
    expect(Object.keys(upsert.body.rows[1]).sort()).toEqual(['absent', 'studentId']);

    const releaseCard = page.locator('#gradeReleaseList .manage-item').first();
    await expect(releaseCard).toContainText('BORRADOR');
    await releaseCard.getByRole('checkbox').check();
    await releaseCard.getByRole('button', { name: 'Publicar' }).click();
    await expect.poll(() => posts.length).toBe(2);
    expect(posts[1].body).toEqual({ action: 'grade.release.publish', id: upsert.body.id, expectedRevision: 1, privacyConfirmed: true });

    await expect(page.locator('#gradeReleaseList .manage-item').first()).toContainText('PUBLICADO');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#gradeReleaseList .manage-item').first().getByRole('button', { name: 'Archivar' }).click();
    await expect.poll(() => posts.length).toBe(3);
    expect(posts[2].body).toEqual({ action: 'grade.release.archive', id: upsert.body.id, expectedRevision: 2 });
  });

  test('keeps the notes tab hidden from a delegate', async ({ page }) => {
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    const editor = { id: 'editor', role: 'editor', name: 'Delegada', classId: 's4-e', capabilities: { manageContent: false, reviewChallenge: false } };
    await page.route('**/api/class-hub**', async (route) => {
      const resource = new URL(route.request().url()).searchParams.get('resource');
      const body = resource === 'public'
        ? { ok: true, class: managementState(editor).class }
        : resource === 'session'
          ? { ok: true, actor: editor, class: managementState(editor).class, passwordChangeRequired: false }
          : managementState(editor, [{ ...PUBLIC_RELEASE, status: 'published' }]);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto('/gestion/s4-e');
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#manageTabGrades')).toBeHidden();
    await expect(page.locator('#managePanelGrades')).toBeHidden();
  });
});

test('class home exposes the isolated notes link', async () => {
  const classHtml = readRepo('clase.html');
  expect(classHtml).toContain('href="notas.html"');
  expect(classHtml).toContain('<strong>Notas y gabaritos</strong>');
});
