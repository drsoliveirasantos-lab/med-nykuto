const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const readRepo = (file) => fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');

const PRIVATE_NAMES = ['Alice Private', 'Bruno Secret'];
const SYNTHETIC_EMAIL = 'delegate.fixture@example.test';
const SYNTHETIC_TEMP_PASSWORD = 'Temporary-Study-2026!';
const SYNTHETIC_NEW_PASSWORD = 'Personal-Study-2026!';
const SYNTHETIC_CSRF = 'c'.repeat(64);
const CSRF_COOKIE = '__Host-med-nykuto-management-csrf';
const CLASS_RESPONSE = {
  ok: true,
  class: {
    id: 's5-a',
    slug: 's5-a',
    name: 'Medicina · 5.º A',
    semester: 5,
    group: 'A',
    description: 'Espacio privado de prueba del quinto semestre.',
    driveUrl: 'https://drive.google.com/drive/folders/class-s5-a',
    supportWhatsapp: '+595981000111'
  },
  subjects: [
    { id: 'farmacologia-ii', slug: 'farmacologia-ii', name: 'Farmacología II', teacher: 'Dra. Vega', color: '#38bdf8' },
    { id: 'patologia', slug: 'patologia', name: 'Patología', teacher: 'Dr. Rojas', color: '#fbbf24' }
  ],
  tasks: [
    {
      id: 'farmaco-seminario',
      course: 'Farmacología II',
      title: 'Seminario de antimicrobianos',
      description: 'Preparar cinco diapositivas y justificar la elección terapéutica.',
      dueLabel: '1 sep.',
      dueAt: '2099-09-01T10:00:00-03:00',
      attachmentUrl: 'https://example.test/seminario-antimicrobianos.pdf',
      attachmentTitle: 'Guía del seminario',
      status: 'published'
    }
  ],
  notices: [
    { id: 'exam-official', title: 'Fecha oficial del examen', body: 'El parcial será el 10 de septiembre.', priority: 'urgent', status: 'published', imageUrl: 'https://example.test/official-exam.webp', imageAlt: 'Cronograma oficial del examen', attachmentUploadId: 'upload-exam-pdf', attachmentUrl: '/api/class-hub?class=s5-a&resource=notice-attachment&upload=upload-exam-pdf', attachmentTitle: 'Cronograma oficial.pdf', attachmentMimeType: 'application/pdf', attachmentSizeBytes: 245760, publishedAt: '2099-08-25T12:00:00-03:00' },
    { id: 'room-change', title: 'Cambio de aula', body: 'La clase será en el aula 12.', priority: 'important', status: 'published', publishedAt: '2099-08-24T12:00:00-03:00' },
    { id: 'routine-note', title: 'Material disponible', body: 'Las diapositivas ya están en Drive.', priority: 'normal', status: 'published', publishedAt: '2099-08-23T12:00:00-03:00' }
  ],
  activities: [
    { id: 'seminario-farmaco', title: 'Seminario de Farmacología', capacity: 8, status: 'published', frozen: false }
  ],
  groups: [
    { id: 'seminario-farmaco-g1', activityId: 'seminario-farmaco', name: 'Grupo 1', memberCount: 2, capacity: 8 }
  ],
  // Deliberate privacy traps: the public class UI must never render roster names,
  // even if an older or misconfigured API happens to include these legacy keys.
  members: PRIVATE_NAMES.map((displayName, index) => ({ id: `member-${index + 1}`, displayName })),
  memberships: PRIVATE_NAMES.map((displayName, index) => ({ id: `membership-${index + 1}`, displayName })),
  files: [
    { id: 'farmaco-guide', course: 'Farmacología II', lessonDate: '2099-08-25', title: 'Guía de antimicrobianos', url: 'https://example.test/antimicrobianos.pdf', fileType: 'pdf', status: 'published' }
  ],
  dates: [
    { id: 'partial-1', label: 'Primer parcial', startsAt: '2099-09-10T08:00:00-03:00', type: 'EXAMEN', status: 'published' }
  ],
  generatedAt: '2099-08-25T12:00:00-03:00'
};

const managementState = (actor, overrides = {}) => ({
  ok: true,
  class: CLASS_RESPONSE.class,
  actor,
  subjects: CLASS_RESPONSE.subjects,
  tasks: [],
  notices: [],
  activities: [],
  groups: [],
  memberships: [],
  files: [],
  dates: [],
  editors: [],
  invites: [],
  ...overrides
});

async function routeManagementShell(page, slug = 's5-a') {
  const managementHtml = readRepo('gestion-shell/index.html');
  await page.route(`**/gestion/${slug}`, (route) => route.fulfill({
    status: 200,
    contentType: 'text/html; charset=utf-8',
    body: managementHtml
  }));
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
  }, { name: CSRF_COOKIE, value: SYNTHETIC_CSRF });
}

test.describe('Multiclass student hub', () => {
  test('renders an isolated class with five tabs, expandable tasks and no member names', async ({ page }) => {
    const classHubRequests = [];
    await page.route('**/api/class-hub**', async (route) => {
      const url = new URL(route.request().url());
      classHubRequests.push(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CLASS_RESPONSE)
      });
    });

    await page.goto('/turma-shell/?class=s5-a');

    await expect(page.locator('html')).toHaveAttribute('data-class-slug', 's5-a');
    await expect(page.locator('#homeTitle')).toHaveText('Medicina · 5.º A');
    await expect(page.locator('#classEyebrow')).toHaveText('SEMESTRE 5 · GRUPO A');
    await expect(page.locator('#classSubtitle')).toContainText('quinto semestre');
    await expect(page.locator('#manageLink')).toHaveAttribute('href', '/gestion/s5-a');
    await expect(page.locator('#classManifest')).toHaveAttribute('href', '/api/class-manifest?class=s5-a');

    const tabs = page.locator('.bottom-nav [data-nav-view]');
    await expect(tabs).toHaveCount(5);
    await expect(page.locator('main [data-view]')).toHaveCount(6);
    await expect(tabs.locator('strong')).toHaveText(['Inicio', 'Tareas', 'Materias', 'Estudiar', 'Más']);

    expect(classHubRequests).toHaveLength(1);
    expect(classHubRequests[0].searchParams.get('class')).toBe('s5-a');
    expect(classHubRequests[0].searchParams.get('resource')).toBe('public');

    await page.locator('[data-nav-view="tareas"]').click();
    await expect(page.locator('[data-view="tareas"]')).toBeVisible();
    const task = page.locator('#taskList [data-task-id="farmaco-seminario"]');
    await expect(task).toBeVisible();
    await expect(task).not.toHaveAttribute('open', '');
    await task.locator('summary').click();
    await expect(task).toHaveAttribute('open', '');
    await expect(task.locator('.task-body')).toContainText('justificar la elección terapéutica');
    await expect(task.getByRole('link', { name: 'Guía del seminario ↗' })).toHaveAttribute('href', 'https://example.test/seminario-antimicrobianos.pdf');
    await expect(task.getByRole('link', { name: 'Guía del seminario ↗' })).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(task.locator('summary > b')).toHaveText('Cerrar');

    await page.locator('[data-nav-view="materias"]').click();
    await expect(page.locator('[data-view="materias"]')).toBeVisible();
    await expect(page.locator('#subjectList .subject-card')).toHaveCount(2);
    await expect(page.locator('[data-subject-id="farmacologia-ii"]')).toContainText('Farmacología II');
    await expect(page.locator('[data-subject-id="farmacologia-ii"]')).toContainText('Guía de antimicrobianos');
    await expect(page.locator('[data-subject-id="patologia"]')).toContainText('Patología');

    await page.locator('[data-nav-view="mas"]').click();
    await page.locator('#groupList').locator('..').locator('summary').click();
    await expect(page.locator('#groupCount')).toHaveText('1 grupo');
    await expect(page.locator('#groupList')).toContainText('1 grupo · 2 integrantes');
    await expect(page.locator('#groupList .class-group-choice')).toHaveCount(1);
    await expect(page.locator('#groupList .class-group-choice')).toContainText('2/8 plazas');
    await expect(page.locator('#groupList').getByRole('button', { name: 'Inscribirme' })).toBeVisible();

    const completeDomText = await page.locator('body').textContent();
    PRIVATE_NAMES.forEach((name) => expect(completeDomText).not.toContain(name));
  });

  test('offers the selected class calendar as a stable HTTPS subscription with a copy fallback', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText(value) {
            window.__copiedCalendarUrl = value;
            return Promise.resolve();
          }
        }
      });
    });
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CLASS_RESPONSE)
    }));

    await page.goto('/turma-shell/?class=s5-a#mas');

    const subscription = page.locator('#calendarSubscription');
    const link = page.locator('#calendarSubscribeLink');
    const copy = page.locator('#calendarCopyLink');
    await expect(subscription).toBeVisible();
    await expect(link).toHaveText('Suscribirme al calendario');
    await expect(link).toHaveAttribute('href', 'webcal://127.0.0.1:4173/api/class-calendar.ics?class=s5-a');
    await expect(link).toHaveAttribute('data-https-url', 'https://127.0.0.1:4173/api/class-calendar.ics?class=s5-a');
    await expect(link).not.toHaveAttribute('target', /.+/);
    await expect(link).not.toHaveAttribute('rel', /.+/);
    expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect((await copy.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#calendarSubscriptionStatus')).toContainText('información académica publicada');

    await copy.click();
    await expect.poll(() => page.evaluate(() => window.__copiedCalendarUrl || '')).toMatch(/\/api\/class-calendar\.ics\?class=s5-a$/);
    const copied = new URL(await page.evaluate(() => window.__copiedCalendarUrl));
    expect(copied.protocol).toBe('https:');
    expect(copied.pathname).toBe('/api/class-calendar.ics');
    expect(copied.searchParams.get('class')).toBe('s5-a');
    await expect(page.locator('#calendarSubscriptionStatus')).toHaveText('Enlace HTTPS copiado. Añádelo como calendario por URL.');
  });

  test('shows one readable official notice on Home and all notices in the dedicated view', async ({ page }) => {
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CLASS_RESPONSE)
    }));
    await page.route('https://example.test/official-exam.webp', (route) => route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="24"><rect width="40" height="24" fill="#0ea5e9"/></svg>'
    }));

    await page.goto('/turma-shell/?class=s5-a#inicio');

    await expect(page.locator('#homeNoticeSection')).toBeVisible();
    const carousel = page.locator('#homeNoticeCarousel');
    await expect(carousel).toHaveAttribute('role', 'region');
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carrusel');
    await expect(carousel.locator('.notice-card')).toHaveCount(1);
    await expect(carousel).toContainText('Fecha oficial del examen');
    await expect(carousel).not.toContainText('Material disponible');
    await expect(carousel.locator('.notice-carousel-count')).toHaveText('1 / 2');
    await expect(carousel.locator('time')).toHaveAttribute('datetime', '2099-08-25T12:00:00-03:00');
    await expect(page.locator('#noticeButton')).toHaveAttribute('aria-label', 'Abrir avisos · 2 importantes');
    const noticeImage = page.locator('#homeNoticeCarousel img');
    await expect(noticeImage).toHaveAttribute('alt', 'Cronograma oficial del examen');
    await expect(noticeImage).toHaveAttribute('loading', 'lazy');
    await expect(noticeImage).toHaveAttribute('decoding', 'async');
    await expect(noticeImage).toHaveAttribute('referrerpolicy', 'no-referrer');
    const attachment = carousel.getByRole('link', { name: /Abrir documento/ });
    await expect(attachment).toHaveAttribute('href', /\/api\/class-hub\?class=s5-a&resource=notice-attachment&upload=upload-exam-pdf$/);
    await expect(attachment).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(attachment).toContainText('240 KB');

    await carousel.locator('[aria-label="Aviso siguiente"]').click();
    await expect(carousel).toContainText('Cambio de aula');
    await expect(carousel.locator('.notice-carousel-count')).toHaveText('2 / 2');
    const pause = carousel.locator('.notice-carousel-pause');
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    await expect(pause).toHaveText('Reanudar');

    await page.locator('#noticeButton').click();
    await expect(page.locator('[data-view="avisos"]')).toBeVisible();
    await expect(page.locator('#noticePageList .notice-card')).toHaveCount(3);
    await expect(page.locator('#noticePageList')).toContainText('Material disponible');
    await expect(page).toHaveURL(/#avisos$/);
    await page.getByRole('button', { name: '← Volver al inicio' }).click();
    await expect(page.locator('[data-view="inicio"]')).toBeVisible();
    await page.evaluate(() => { window.location.hash = 'avisos'; });
    await expect(page.locator('[data-view="avisos"]')).toBeVisible();
    await page.evaluate(() => { window.location.hash = 'inicio'; });
    await expect(page.locator('[data-view="inicio"]')).toBeVisible();
  });

  test('opens the exact linked task from an aviso even when its due date has passed', async ({ page }) => {
    const expiredLinkedTask = {
      id: 'farmaco-linked-expired',
      course: 'Farmacología II',
      title: 'Informe enlazado ya vencido',
      description: 'Esta consigna debe seguir disponible desde su aviso.',
      dueLabel: '20 ago.',
      dueAt: '2026-08-20T08:00:00-03:00',
      status: 'published'
    };
    const otherTask = {
      id: 'patologia-other-task',
      course: 'Patología',
      title: 'Otra tarea independiente',
      dueAt: '2099-09-15T08:00:00-03:00',
      status: 'published'
    };
    const nonPublishedTask = {
      id: 'draft-linked-task',
      course: 'Patología',
      title: 'Tarea todavía privada',
      status: 'draft'
    };
    const linkedNotice = {
      id: 'notice-farmaco-linked-expired',
      linkedTaskId: expiredLinkedTask.id,
      course: expiredLinkedTask.course,
      title: expiredLinkedTask.title,
      body: 'Entrega: 20 ago. · Esta consigna debe seguir disponible desde su aviso.',
      priority: 'important',
      status: 'published',
      publishedAt: '2026-08-19T12:00:00-03:00'
    };
    const failClosedNotices = [
      { id: 'unlinked-lookalike', title: otherTask.title, body: 'Mismo título, pero sin relación explícita.', priority: 'normal', status: 'published' },
      { id: 'orphan-linked-notice', linkedTaskId: 'missing-task', title: 'Relación huérfana', priority: 'normal', status: 'published' },
      { id: 'draft-linked-notice', linkedTaskId: nonPublishedTask.id, title: 'Relación con tarea privada', priority: 'normal', status: 'published' }
    ];
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...CLASS_RESPONSE, tasks: [expiredLinkedTask, otherTask, nonPublishedTask], notices: [linkedNotice, ...failClosedNotices] })
    }));

    await page.goto('/turma-shell/?class=s5-a#avisos');
    const notice = page.locator('#noticePageList .notice-card').filter({ hasText: expiredLinkedTask.title });
    await expect(notice).toBeVisible();
    const taskLink = notice.getByRole('link', { name: 'Ver tarea' });
    await expect(taskLink).toHaveAttribute('href', '#tareas');
    for (const title of [otherTask.title, 'Relación huérfana', 'Relación con tarea privada']) {
      await expect(page.locator('#noticePageList .notice-card').filter({ hasText: title }).getByRole('link', { name: /Ver tarea/ })).toHaveCount(0);
    }
    await taskLink.click();

    await expect(page.locator('[data-view="tareas"]')).toBeVisible();
    await expect(page.locator('[data-task-filter="all"]')).toHaveClass(/is-active/);
    const linkedTask = page.locator(`#taskList [data-task-id="${expiredLinkedTask.id}"]`);
    const unrelatedTask = page.locator(`#taskList [data-task-id="${otherTask.id}"]`);
    await expect(linkedTask).toBeVisible();
    await expect(linkedTask).toHaveAttribute('open', '');
    await expect(linkedTask).toContainText(expiredLinkedTask.description);
    await expect(unrelatedTask).toBeVisible();
    await expect(unrelatedTask).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(/#tareas$/);

    await page.goto(`/turma-shell/?class=s5-a&task=${expiredLinkedTask.id}#tareas`);
    await expect(page.locator('[data-view="tareas"]')).toBeVisible();
    await expect(page.locator('[data-task-filter="all"]')).toHaveClass(/is-active/);
    await expect(page.locator(`#taskList [data-task-id="${expiredLinkedTask.id}"]`)).toHaveAttribute('open', '');
    await expect(page.locator(`#taskList [data-task-id="${otherTask.id}"]`)).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(new RegExp(`/turma-shell/\\?class=s5-a&task=${expiredLinkedTask.id}#tareas$`));
  });

  test('disables official-notice autoplay when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/api/class-hub**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) }));
    await page.route('https://example.test/official-exam.webp', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />' }));

    await page.goto('/turma-shell/?class=s5-a#inicio');
    await expect(page.locator('#homeNoticeCarousel .notice-carousel-pause')).toBeHidden();
    await expect(page.locator('#homeNoticeCarousel')).toContainText('Fecha oficial del examen');
    await page.locator('#homeNoticeCarousel [aria-label="Aviso siguiente"]').click();
    await expect(page.locator('#homeNoticeCarousel')).toContainText('Cambio de aula');
  });

  test('joins and leaves a class group without publishing the student name', async ({ page }) => {
    const actions = [];
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        actions.push(body);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body.action === 'group.join'
            ? { ok: true, activityId: body.activityId, groupId: body.groupId, groupName: 'Grupo 1', displayName: body.displayName }
            : { ok: true })
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) });
    });

    await page.goto('/turma-shell/?class=s5-a#mas');
    await page.locator('#groupList').locator('..').locator('summary').click();
    const group = page.locator('#groupList .class-group-choice');
    await group.click();
    await expect(group).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#groupList .group-name').fill('Nombre Solo Gestión');
    await page.locator('#groupList').getByRole('button', { name: 'Inscribirme' }).click();
    await expect(page.locator('#groupList .group-inline-status')).toContainText('Inscripción guardada en Grupo 1');
    await expect(page.locator('#groupList')).not.toContainText('Nombre Solo Gestión');
    expect(actions[0]).toMatchObject({ action: 'group.join', activityId: 'seminario-farmaco', groupId: 'seminario-farmaco-g1', displayName: 'Nombre Solo Gestión' });
    expect(String(actions[0].studentKey)).toHaveLength(36);

    await page.locator('#groupList').getByRole('button', { name: 'Salir del grupo' }).click();
    await expect(page.locator('#groupList').getByRole('button', { name: 'Inscribirme' })).toBeVisible();
    expect(actions[1]).toMatchObject({ action: 'group.leave', activityId: 'seminario-farmaco', studentKey: actions[0].studentKey });
  });

  test('does not revive an archived or unknown class from the offline cache', async ({ page }) => {
    await page.addInitScript(({ cacheKey, cached }) => {
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    }, { cacheKey: 'med-nykuto-class-cache:s5-a', cached: CLASS_RESPONSE });
    await page.route('**/api/class-hub**', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'class_not_found', error: 'La turma solicitada no existe o no está activa.' })
      });
    });

    await page.goto('/turma-shell/?class=s5-a');
    await expect(page.locator('#homeTitle')).toHaveText('No pudimos abrir esta turma');
    await expect(page.locator('#classSubtitle')).toContainText('no existe o no está activa');
    await expect(page.locator('body')).not.toContainText('Medicina · 5.º A');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('med-nykuto-class-cache:s5-a'))).toBeNull();
  });

  test('logs a delegate in with synthetic credentials, sends cookie CSRF on writes and logs out on the server', async ({ page }) => {
    const requests = [];
    const actor = { id: 'editor-fixture-s5-a', role: 'editor', name: 'Delegada Fixture', classId: 's5-a' };
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      requests.push({
        method: request.method(),
        resource: url.searchParams.get('resource'),
        authorization: request.headers().authorization || '',
        csrf: request.headers()['x-csrf-token'] || '',
        cookie: request.headers().cookie || '',
        body
      });
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'session') {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
        return;
      }
      if (body?.action === 'auth.login') {
        await route.fulfill({
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'set-cookie': `${CSRF_COOKIE}=${SYNTHETIC_CSRF}; Path=/; Secure; SameSite=Strict`
          },
          body: JSON.stringify({ ok: true, actor, passwordChangeRequired: false, expiresAt: '2099-09-01T12:00:00.000Z' })
        });
        return;
      }
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor)) });
        return;
      }
      if (body?.action === 'task.upsert') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 'fixture-task' }) });
        return;
      }
      if (body?.action === 'auth.logout') {
        await route.fulfill({
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'set-cookie': `${CSRF_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Strict`
          },
          body: JSON.stringify({ ok: true })
        });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#multiDeviceLoginHelp')).toContainText('teléfono y tablet');
    await expect(page.locator('#inviteAccess summary')).toHaveText('Crear mi cuenta con una invitación');
    await expect(page.locator('#inviteAccess .details-help')).toContainText('funciona una sola vez');
    await page.locator('#loginEmail').fill(SYNTHETIC_EMAIL);
    await page.locator('#loginPassword').fill(SYNTHETIC_TEMP_PASSWORD);
    await page.locator('#credentialSubmit').click();

    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#actorRole')).toHaveText('DELEGADO');
    await expect(page.locator('#actorName')).toContainText('Delegada Fixture');
    await expect(page.locator('[data-manage-tab="classes"]')).toBeHidden();
    await expect(page.locator('[data-manage-tab="access"]')).toBeHidden();
    await expect(page.locator('#classForm')).toBeHidden();
    await expect(page.locator('#delegateAccountForm')).toBeHidden();
    await expect(page.locator('#loginPassword')).toHaveValue('');
    await expect.poll(() => page.evaluate(() => document.cookie)).toContain(`${CSRF_COOKIE}=`);

    const login = requests.find((entry) => entry.body?.action === 'auth.login');
    expect(login).toMatchObject({ authorization: '', csrf: '', body: { action: 'auth.login', email: SYNTHETIC_EMAIL, password: SYNTHETIC_TEMP_PASSWORD } });
    expect(requests.some((entry) => ['classes', 'audit'].includes(entry.resource))).toBe(false);
    const browserStorage = await page.evaluate(() => ({ local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage) }));
    expect(browserStorage.local).not.toContain(SYNTHETIC_EMAIL);
    expect(browserStorage.local).not.toContain(SYNTHETIC_TEMP_PASSWORD);
    expect(browserStorage.session).not.toContain(SYNTHETIC_EMAIL);
    expect(browserStorage.session).not.toContain(SYNTHETIC_TEMP_PASSWORD);

    const taskForm = page.locator('#taskForm');
    await taskForm.locator('[name="course"]').fill('Farmacología II');
    await taskForm.locator('[name="title"]').fill('Tarea CSRF de prueba');
    await taskForm.getByRole('button', { name: 'Guardar tarea' }).click();
    await expect(page.locator('#manageStatus')).toHaveText('Datos sincronizados.');
    const taskWrite = requests.find((entry) => entry.body?.action === 'task.upsert');
    expect(taskWrite.authorization).toBe('');
    expect(taskWrite.csrf).toBe(SYNTHETIC_CSRF);

    await page.locator('#logoutButton').click();
    await expect(page.locator('#authCard')).toBeVisible();
    await expect(page.locator('#manageApp')).toBeHidden();
    await expect(page.locator('#authStatus')).toHaveText('Sesión cerrada correctamente.');
    const logout = requests.find((entry) => entry.body?.action === 'auth.logout');
    expect(logout.authorization).toBe('');
    expect(logout.csrf).toBe(SYNTHETIC_CSRF);
  });

  test('creates a permanent delegate account from a one-time fragment invitation without leaking the secret', async ({ page }) => {
    const inviteToken = 'd'.repeat(64);
    const invitePassword = 'Invitation-Personal-2026!';
    const requests = [];
    const actor = { id: 'invited-editor-s5-a', role: 'editor', name: 'Delegada Invitada', classId: 's5-a', capabilities: { manageContent: false, reviewChallenge: true } };
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url()), body = request.method() === 'POST' ? request.postDataJSON() : null;
      requests.push({ method: request.method(), url: request.url(), resource: url.searchParams.get('resource'), authorization: request.headers().authorization || '', csrf: request.headers()['x-csrf-token'] || '', body });
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'public') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) });
        return;
      }
      if (body?.action === 'invite.claim') {
        await route.fulfill({
          status: 201,
          headers: { 'content-type': 'application/json; charset=utf-8', 'set-cookie': `${CSRF_COOKIE}=${SYNTHETIC_CSRF}; Path=/; Secure; SameSite=Strict` },
          body: JSON.stringify({ ok: true, actor, passwordChangeRequired: false, expiresAt: '2099-09-01T12:00:00.000Z' })
        });
        return;
      }
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor)) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto(`/gestion/s5-a#invite=${inviteToken}`);
    await expect(page).toHaveURL(/\/gestion\/s5-a$/);
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
    await expect(page.locator('#inviteAccess')).toHaveAttribute('open', '');
    await expect(page.locator('#credentialForm')).toBeHidden();
    await expect(page.locator('#legacyTokenAccess')).toBeHidden();
    await expect(page.locator('#accountRequest')).toBeHidden();
    await expect(page.locator('#inviteCodeField')).toBeHidden();
    await expect(page.locator('#inviteToken')).toHaveValue('');
    expect(await page.locator('html').innerHTML()).not.toContain(inviteToken);
    expect(requests.some((entry) => entry.resource === 'session')).toBe(false);
    expect(requests.every((entry) => !entry.url.includes(inviteToken))).toBe(true);

    const form = page.locator('#claimForm');
    await form.locator('#inviteName').fill('Delegada Invitada');
    await form.locator('#inviteEmail').fill('INVITED.DELEGATE@example.test');
    await form.locator('#invitePassword').fill(invitePassword);
    await form.locator('#inviteConfirmPassword').fill('Mot-de-passe-different!');
    await form.getByRole('button', { name: 'Crear mi cuenta y entrar' }).click();
    expect(requests.filter((entry) => entry.body?.action === 'invite.claim')).toHaveLength(0);

    await form.locator('#inviteConfirmPassword').fill(invitePassword);
    await form.getByRole('button', { name: 'Crear mi cuenta y entrar' }).click();
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#actorName')).toContainText('Delegada Invitada');
    await expect(page.locator('[data-manage-tab="classes"]')).toBeHidden();
    await expect(page.locator('[data-manage-tab="access"]')).toBeHidden();
    await expect(form.locator('#invitePassword')).toHaveValue('');
    await expect(form.locator('#inviteConfirmPassword')).toHaveValue('');

    const claim = requests.find((entry) => entry.body?.action === 'invite.claim');
    expect(claim).toMatchObject({
      authorization: '',
      csrf: '',
      body: { action: 'invite.claim', inviteToken, name: 'Delegada Invitada', email: 'INVITED.DELEGATE@example.test', password: invitePassword }
    });
    const adminRead = requests.find((entry) => entry.method === 'GET' && entry.resource === 'admin');
    expect(adminRead.authorization).toBe('');
    const storage = await page.evaluate(() => ({ local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage) }));
    expect(`${storage.local}${storage.session}`).not.toContain(inviteToken);
    expect(`${storage.local}${storage.session}`).not.toContain(invitePassword);
  });

  test('lets the owner copy a private fragment signup link without rendering its token', async ({ page }) => {
    const ownerToken = 'owner-invite-fixture';
    const inviteToken = 'e'.repeat(64);
    const actor = { id: 'owner', role: 'owner', name: 'Propietario', classId: 's5-a', capabilities: { manageContent: true, reviewChallenge: true } };
    await page.addInitScript(({ key, value }) => {
      sessionStorage.setItem(key, value);
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(text) { window.__copiedInvite = text; return Promise.resolve(); } } });
    }, { key: 'med-nykuto-management-token-v471:s5-a', value: ownerToken });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url()), body = request.method() === 'POST' ? request.postDataJSON() : null, resource = url.searchParams.get('resource');
      if (resource === 'session') {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
        return;
      }
      if (resource === 'public') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) });
        return;
      }
      if (body?.action === 'invite.create') {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, inviteToken, invitePath: `/gestion/s5-a#invite=${inviteToken}`, expiresAt: '2099-09-03T12:00:00.000Z' }) });
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor)) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageApp')).toBeVisible();
    await page.locator('#manageTabAccess').click();
    await page.locator('#inviteForm').getByRole('button', { name: 'Crear enlace de invitación' }).click();
    await expect(page.locator('#inviteOutput')).toBeVisible();
    await expect(page.locator('#inviteOutput')).toContainText('Enlace privado creado');
    expect(await page.locator('#inviteOutput').innerHTML()).not.toContain(inviteToken);
    await page.locator('#inviteOutput').getByRole('button', { name: 'Copiar enlace' }).click();
    await expect.poll(() => page.evaluate(() => window.__copiedInvite || '')).toContain(`/gestion/s5-a#invite=${inviteToken}`);
  });

  test('shows only the invitation generator to an editor carrying invite.manage', async ({ page }) => {
    const inviteToken = 'f'.repeat(64);
    const actor = { id: 'editor-invite-manager-s5-a', role: 'editor', name: 'Administradora de accesos', classId: 's5-a', capabilities: { manageContent: false, manageInvites: true, reviewChallenge: true } };
    const writes = [];
    await exposeSyntheticCsrfCookie(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(text) { window.__copiedManagedInvite = text; return Promise.resolve(); } } });
    });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url()), resource = url.searchParams.get('resource'), body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (request.method() === 'GET' && resource === 'session') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, actor, passwordChangeRequired: false }) });
        return;
      }
      if (request.method() === 'GET' && resource === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor, { invites: [] })) });
        return;
      }
      if (body?.action === 'invite.create') {
        writes.push({ body, authorization: request.headers().authorization || '', csrf: request.headers()['x-csrf-token'] || '' });
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, inviteToken, invitePath: `/gestion/s5-a#invite=${inviteToken}`, expiresAt: '2099-09-03T12:00:00.000Z' }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageTabAccess')).toBeVisible();
    await expect(page.locator('#manageTabAccess')).toHaveText(/Accesos/);
    await expect(page.locator('#manageTabClasses')).toBeHidden();
    await page.locator('#manageTabAccess').click();
    await expect(page.locator('#inviteForm')).toBeVisible();
    await expect(page.locator('#delegateAccountForm')).toBeHidden();
    await expect(page.locator('#editorList')).toBeHidden();
    await expect(page.locator('#auditList')).toBeHidden();
    await page.locator('#inviteLabel').fill('Delegada 5.º A');
    await page.locator('#inviteForm').getByRole('button', { name: 'Crear enlace de invitación' }).click();
    await expect(page.locator('#inviteOutput')).toContainText('Enlace privado creado');
    expect(await page.locator('#inviteOutput').innerHTML()).not.toContain(inviteToken);
    await page.locator('#inviteOutput').getByRole('button', { name: 'Copiar enlace' }).click();
    await expect.poll(() => page.evaluate(() => window.__copiedManagedInvite || '')).toContain(`/gestion/s5-a#invite=${inviteToken}`);
    expect(writes).toEqual([{ authorization: '', csrf: SYNTHETIC_CSRF, body: { action: 'invite.create', label: 'Delegada 5.º A', hours: '168' } }]);
  });

  test('lets an authenticated delegate validate or reject only opaque challenge candidatures', async ({ page }) => {
    const actor = { id: 'editor-review-s5-a', role: 'editor', name: 'Delegada Revisión', classId: 's5-a', capabilities: { manageContent: false, reviewChallenge: true } };
    const privatePlayerId = '11111111-1111-4111-8111-111111111111';
    const privateHash = 'student-hash-must-not-render';
    const privateTokenHash = 'access-token-hash-must-not-render';
    const candidates = [
      { reviewId: 'a'.repeat(64), fullName: 'Ana Candidata', catraca: 'CAT1001', status: 'pending', points: 8, questions: 10, accuracy: 80, challenges: 1, playerId: privatePlayerId, studentIdHash: privateHash, accessTokenHash: privateTokenHash },
      { reviewId: 'b'.repeat(64), fullName: 'Luis Candidato', catraca: 'CAT1002', status: 'pending', points: 7, questions: 10, accuracy: 70, challenges: 1 }
    ];
    const writes = [];
    const adminBody = () => managementState(actor, {
      challengeReview: {
        enabled: true,
        week: { key: '2026-08-24', start: '2026-08-24', end: '2026-08-30', timeZone: 'America/Asuncion' },
        pendingCount: candidates.filter((candidate) => candidate.status === 'pending').length,
        candidates
      }
    });
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url()), body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'session') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, actor, passwordChangeRequired: false }) });
        return;
      }
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(adminBody()) });
        return;
      }
      if (body?.action === 'challenge.participant.review') {
        writes.push({ body, authorization: request.headers().authorization || '', csrf: request.headers()['x-csrf-token'] || '' });
        const candidate = candidates.find((item) => item.reviewId === body.reviewId);
        candidate.status = body.status;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, reviewId: body.reviewId, previousStatus: body.expectedStatus, status: body.status }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageTabChallenge')).toBeVisible();
    await page.locator('#manageTabChallenge').click();
    await expect(page.locator('#managePanelChallenge')).toBeVisible();
    await expect(page.locator('#challengeReviewPendingCount')).toHaveText('2 pendientes');
    await expect(page.locator('#challengeReviewList')).toContainText('Ana Candidata');
    await expect(page.locator('#challengeReviewList')).toContainText('Catraca pública: CAT1001');
    const visibleText = await page.locator('#managePanelChallenge').textContent();
    [privatePlayerId, privateHash, privateTokenHash, 'a'.repeat(64)].forEach((secret) => expect(visibleText).not.toContain(secret));

    const ana = page.locator('.challenge-review-item').filter({ hasText: 'Ana Candidata' });
    await ana.getByRole('button', { name: 'Validar' }).click();
    await expect(ana).toContainText('VALIDADA');
    expect(writes[0]).toEqual({
      authorization: '',
      csrf: SYNTHETIC_CSRF,
      body: { action: 'challenge.participant.review', reviewId: 'a'.repeat(64), status: 'verified', expectedStatus: 'pending' }
    });

    page.once('dialog', (dialog) => dialog.accept());
    const luis = page.locator('.challenge-review-item').filter({ hasText: 'Luis Candidato' });
    await luis.getByRole('button', { name: 'Rechazar' }).click();
    await expect(luis).toContainText('RECHAZADA');
    expect(writes[1]).toEqual({
      authorization: '',
      csrf: SYNTHETIC_CSRF,
      body: { action: 'challenge.participant.review', reviewId: 'b'.repeat(64), status: 'rejected', expectedStatus: 'pending' }
    });
    await expect(page.locator('#challengeReviewPendingCount')).toHaveText('0 pendientes');
    await expect(page.locator('[data-owner-only]').first()).toBeHidden();
  });

  test('restores a credential session with same-origin cookies and enforces the initial password change', async ({ page, context }) => {
    const requests = [];
    const actor = { id: 'editor-restored-s5-a', role: 'editor', name: 'Delegada Restaurada', classId: 's5-a' };
    await context.addCookies([{ name: 'management_session_fixture', value: 'opaque-session-cookie', url: 'http://127.0.0.1:4173/' }]);
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      requests.push({
        method: request.method(),
        resource: url.searchParams.get('resource'),
        authorization: request.headers().authorization || '',
        csrf: request.headers()['x-csrf-token'] || '',
        cookie: request.headers().cookie || '',
        body
      });
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'session') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, actor, passwordChangeRequired: true }) });
        return;
      }
      if (body?.action === 'auth.password.change') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, actor, passwordChangeRequired: false }) });
        return;
      }
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor)) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#passwordChangeCard')).toBeVisible();
    await expect(page.locator('#authMethods')).toBeHidden();
    await expect(page.locator('#manageApp')).toBeHidden();
    const sessionRead = requests.find((entry) => entry.resource === 'session');
    expect(sessionRead.authorization).toBe('');
    expect(sessionRead.cookie).toContain('management_session_fixture=opaque-session-cookie');

    await page.locator('#newPassword').fill(SYNTHETIC_NEW_PASSWORD);
    await page.locator('#confirmPassword').fill('Different-Study-2026!');
    await page.locator('#passwordChangeForm').getByRole('button', { name: 'Guardar y abrir el panel' }).click();
    await expect(page.locator('#authStatus')).toHaveText('Las contraseñas no coinciden.');
    expect(requests.some((entry) => entry.body?.action === 'auth.password.change')).toBe(false);

    await page.locator('#newPassword').fill(SYNTHETIC_NEW_PASSWORD);
    await page.locator('#confirmPassword').fill(SYNTHETIC_NEW_PASSWORD);
    await page.locator('#passwordChangeForm').getByRole('button', { name: 'Guardar y abrir el panel' }).click();
    await expect(page.locator('#manageApp')).toBeVisible();
    const passwordChange = requests.find((entry) => entry.body?.action === 'auth.password.change');
    expect(passwordChange.authorization).toBe('');
    expect(passwordChange.csrf).toBe(SYNTHETIC_CSRF);
    expect(passwordChange.body.password).toBe(SYNTHETIC_NEW_PASSWORD);
    await expect(page.locator('#newPassword')).toHaveValue('');
    await expect(page.locator('#confirmPassword')).toHaveValue('');
  });

  test('keeps failed credential login generic, rate-limited and free of stale bearer headers', async ({ page }) => {
    const loginRequests = [];
    let attempts = 0;
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'stale-synthetic-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (body?.action === 'auth.login') {
        attempts += 1;
        loginRequests.push({ authorization: request.headers().authorization || '', csrf: request.headers()['x-csrf-token'] || '', body });
        if (attempts === 1) {
          await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'invalid_credentials', error: 'Correo o contraseña incorrectos.' }) });
        } else {
          await route.fulfill({ status: 429, headers: { 'content-type': 'application/json', 'retry-after': '900' }, body: JSON.stringify({ ok: false, code: 'rate_limited', error: 'Demasiados intentos. Espera antes de volver a probar.' }) });
        }
        return;
      }
      if (request.method() === 'GET' && ['admin', 'session'].includes(url.searchParams.get('resource'))) {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#credentialSubmit')).toBeEnabled();
    await page.locator('#loginEmail').fill('unknown.fixture@example.test');
    await page.locator('#loginPassword').fill('Wrong-Synthetic-2026!');
    await page.locator('#credentialSubmit').click();
    await expect(page.locator('#authStatus')).toHaveText('Correo o contraseña incorrectos.');
    await expect(page.locator('#loginPassword')).toHaveValue('');
    await expect(page.locator('#loginEmail')).toHaveValue('unknown.fixture@example.test');
    await expect(page.locator('#credentialSubmit')).toBeEnabled();

    await page.locator('#loginPassword').fill('Still-Wrong-Synthetic-2026!');
    await page.locator('#credentialSubmit').click();
    await expect(page.locator('#authStatus')).toHaveText('Demasiados intentos. Espera antes de volver a probar.');
    await expect(page.locator('#manageApp')).toBeHidden();
    expect(loginRequests).toHaveLength(2);
    expect(loginRequests.every((entry) => entry.authorization === '' && entry.csrf === '')).toBe(true);
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('med-nykuto-management-token-v471:s5-a'))).toBeNull();
  });

  test('keeps delegate authentication usable on a narrow mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' })
    }));
    await page.goto('/gestion/s5-a');
    await expect(page.locator('#credentialForm')).toBeVisible();
    await page.locator('#loginPassword').fill('Visible-Synthetic-2026!');
    const passwordToggle = page.locator('[data-password-toggle][aria-controls="loginPassword"]');
    await passwordToggle.click();
    await expect(page.locator('#loginPassword')).toHaveAttribute('type', 'text');
    await expect(page.locator('#loginPassword')).toHaveValue('Visible-Synthetic-2026!');
    await expect(passwordToggle).toHaveAttribute('aria-pressed', 'true');
    await passwordToggle.click();
    await expect(page.locator('#loginPassword')).toHaveAttribute('type', 'password');
    const layout = await page.evaluate(() => {
      const email = document.getElementById('loginEmail');
      const password = document.getElementById('loginPassword');
      const submit = document.getElementById('credentialSubmit');
      const summary = document.querySelector('#legacyTokenAccess summary');
      const box = (node) => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, right: rect.right, height: rect.height };
      };
      return {
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        emailFont: Number.parseFloat(getComputedStyle(email).fontSize),
        passwordFont: Number.parseFloat(getComputedStyle(password).fontSize),
        controls: [box(email), box(password), box(submit), box(summary)]
      };
    });
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.emailFont).toBeGreaterThanOrEqual(16);
    expect(layout.passwordFont).toBeGreaterThanOrEqual(16);
    layout.controls.forEach((control) => {
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(layout.innerWidth + 1);
      expect(control.height).toBeGreaterThanOrEqual(44);
    });
  });

  test('keeps the delegate mobile workspace compact and edits linked content from a subject cockpit', async ({ page }) => {
    const actor = { id: 'editor-cockpit-s5-a', role: 'editor', name: 'Delegada Cockpit', classId: 's5-a' };
    const writes = [];
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-cockpit-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(managementState(actor, {
            subjects: [...CLASS_RESPONSE.subjects, { id: 'epidemiologia-y-salud-publica', name: 'Epidemiología y Salud Pública', order: 3, status: 'active' }],
            tasks: [
              { id: 'farmaco-task', course: 'Farmacología II', title: 'Tarea vinculada', description: 'Resolver la guía.', dueLabel: 'Próxima clase', dueAt: '2099-09-03T08:00', status: 'published' },
              { id: 'epi-task', course: 'Epidemiología', title: 'Tarea con nombre abreviado', dueLabel: 'Próxima clase', dueAt: '2099-09-05T11:20', status: 'published' }
            ],
            notices: [{ id: 'general-notice', course: '', title: 'Aviso general', body: 'Información para toda la clase.', priority: 'important', status: 'published' }],
            activities: [{ id: 'farmaco-activity', course: 'Farmacología II', title: 'Seminario de fármacos', capacity: 8, status: 'published', frozen: false }],
            groups: [{ id: 'farmaco-group', activityId: 'farmaco-activity', name: 'Grupo 1', capacity: 8 }],
            files: [{ id: 'farmaco-file', course: 'Farmacología II', title: 'Guía de fármacos', url: 'https://example.test/guia.pdf', fileType: 'PDF', status: 'published' }],
            dates: [{ id: 'farmaco-date', course: 'Farmacología II', label: 'Práctica de Farmacología', startsAt: '2099-09-04T08:00', status: 'published' }]
          }))
        });
        return;
      }
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        writes.push(body);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: body.id || 'generated-fixture-id' }) });
        return;
      }
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('[data-manage-tab="calendar"]')).toBeVisible();
    await expect(page.locator('[data-manage-tab="files"]')).toBeVisible();
    await expect(page.locator('#managePanelCalendar')).toBeHidden();
    await expect(page.locator('#managePanelFiles')).toBeHidden();

    await page.locator('[data-manage-tab="subjects"]').click();
    const pharmacology = page.locator('.subject-dashboard[data-subject-id="farmacologia-ii"]');
    const epidemiology = page.locator('.subject-dashboard[data-subject-id="epidemiologia-y-salud-publica"]');
    const general = page.locator('.subject-dashboard[data-subject-id="general"]');
    await expect(pharmacology).toBeVisible();
    await expect(epidemiology.locator('.subject-counts')).toContainText('1 tarea');
    await expect(pharmacology.locator('.subject-counts')).toContainText('1 tarea');
    await expect(pharmacology.locator('.subject-counts')).toContainText('1 grupo');
    await expect(pharmacology.locator('.subject-counts')).toContainText('1 archivo');
    await expect(pharmacology.locator('.subject-counts')).toContainText('1 fecha');
    await expect(general.locator('.subject-counts')).toContainText('1 aviso');

    await pharmacology.locator('summary').click();
    const taskGroup = pharmacology.locator('.subject-entry-group').filter({ has: page.getByRole('heading', { name: 'Tareas' }) });
    await taskGroup.getByRole('button', { name: 'Modificar' }).click();
    await expect(page.locator('#managePanelTasks')).toBeVisible();
    await expect(page.locator('#taskForm [name="course"]')).toHaveValue('Farmacología II');
    await expect(page.locator('#taskForm [name="title"]')).toHaveValue('Tarea vinculada');

    await page.locator('[data-manage-tab="subjects"]').click();
    const groupSection = pharmacology.locator('.subject-entry-group').filter({ has: page.getByRole('heading', { name: 'Grupos' }) });
    await groupSection.getByRole('button', { name: 'Modificar Grupo 1' }).click();
    await expect(page.locator('#managePanelGroups')).toBeVisible();
    await expect(page.locator('#groupForm [name="name"]')).toHaveValue('Grupo 1');
    await expect(page.locator('#groupForm [name="id"]')).toHaveValue('farmaco-group');
    await expect(page.locator('#groupForm [name="activityId"]')).toHaveValue('farmaco-activity');
    await page.locator('#groupForm [name="name"]').fill('Grupo 1 actualizado');
    await page.locator('#groupForm').getByRole('button', { name: 'Actualizar grupo' }).click();
    await expect.poll(() => writes.length).toBe(1);
    await expect(page.locator('#manageStatus')).toHaveText('Datos sincronizados.');
    expect(writes[0]).toMatchObject({
      action: 'group.upsert',
      id: 'farmaco-group',
      activityId: 'farmaco-activity',
      name: 'Grupo 1 actualizado',
      capacity: '8'
    });

    const compactForms = [
      ['tasks', '#taskForm'],
      ['notices', '#noticeForm'],
      ['calendar', '#dateForm'],
      ['files', '#fileForm']
    ];
    for (const [tab, formSelector] of compactForms) {
      await page.locator(`[data-manage-tab="${tab}"]`).click();
      await expect(page.locator(formSelector)).toBeVisible();
      const columnCount = await page.locator(formSelector).evaluate((form) => getComputedStyle(form).gridTemplateColumns.split(' ').filter(Boolean).length);
      expect(columnCount).toBe(2);
    }
    await expect(page.locator('#managePanelFiles')).toBeVisible();
    await expect(page.locator('#managePanelCalendar')).toBeHidden();

    const mobileLayout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      tabHeight: document.querySelector('[data-manage-tab="tasks"]').getBoundingClientRect().height,
      tabWidth: document.querySelector('[data-manage-tab="tasks"]').getBoundingClientRect().width,
      panelPadding: Number.parseFloat(getComputedStyle(document.querySelector('.manage-panel')).paddingLeft)
    }));
    expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.clientWidth + 1);
    expect(mobileLayout.tabHeight).toBeGreaterThanOrEqual(44);
    expect(mobileLayout.tabWidth).toBeLessThanOrEqual(82);
    expect(mobileLayout.panelPadding).toBeLessThanOrEqual(10);
  });

  test('creates, edits and retires a linked aviso from one task form and one API mutation', async ({ page }) => {
    const actor = { id: 'editor-linked-notice-s5-a', role: 'editor', name: 'Delegada Avisos', classId: 's5-a' };
    const writes = [];
    const managed = managementState(actor, {
      tasks: [],
      notices: [],
      scheduleSlots: [],
      upcomingDates: []
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-linked-notice-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managed) });
        return;
      }
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        writes.push(body);
        if (body.action !== 'task.upsert') {
          await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_action', error: 'Solo se esperaba task.upsert.' }) });
          return;
        }
        const id = body.id || 'linked-task-fixture';
        const current = managed.tasks.find((task) => task.id === id);
        const task = {
          ...(current || {}),
          id,
          course: body.course,
          title: body.title,
          description: body.description || '',
          dueLabel: body.dueLabel || '',
          dueAt: body.dueAt || null,
          attachmentUrl: body.attachmentUrl || null,
          attachmentTitle: body.attachmentTitle || null,
          status: body.status,
          noticeEnabled: Boolean(body.addToNotices)
        };
        if (current) Object.assign(current, task);
        else managed.tasks.unshift(task);
        let notice = managed.notices.find((item) => item.linkedTaskId === id);
        if (body.addToNotices) {
          if (!notice) {
            notice = { id: 'notice-linked-task-fixture', linkedTaskId: id };
            managed.notices.unshift(notice);
          }
          Object.assign(notice, {
            linkedTaskId: id,
            course: body.course,
            title: body.title,
            body: `Entrega: ${body.dueLabel || body.dueAt || 'por confirmar'} · ${body.description || 'Consulta la tarea.'}`,
            priority: body.noticePriority || 'normal',
            pushMode: Boolean(body.noticePushMode),
            status: body.status
          });
        } else if (notice) {
          notice.status = 'archived';
          notice.pushMode = false;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, id, status: body.status, noticeEnabled: Boolean(body.addToNotices), linkedNoticeId: notice?.id || null })
        });
        return;
      }
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageApp')).toBeVisible();
    const form = page.locator('#taskForm');
    const toggle = page.locator('#taskAddToNotices');
    const options = page.locator('#taskNoticeOptions');
    await expect(toggle).not.toBeChecked();
    await expect(options).toBeHidden();
    await expect(form.getByRole('button', { name: 'Guardar tarea' })).toBeVisible();

    await form.locator('[name="course"]').fill('Farmacología II');
    await form.locator('[name="title"]').fill('Resolver guía de antimicrobianos');
    await form.locator('[name="description"]').fill('Responder los cinco casos y justificar cada tratamiento.');
    await form.locator('[name="dueLabel"]').fill('Próximo jueves');
    await form.locator('[name="dueAt"]').fill('2099-09-03T08:00');
    await form.locator('[name="status"]').selectOption('published');
    await toggle.check();
    await expect(options).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#taskNoticeStatus')).toContainText('tarea y el aviso serán visibles');
    await form.locator('[name="noticePriority"]').selectOption('important');
    await form.locator('[name="noticePushMode"]').check();
    await form.getByRole('button', { name: 'Guardar tarea y aviso' }).click();

    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0]).toMatchObject({
      action: 'task.upsert',
      course: 'Farmacología II',
      title: 'Resolver guía de antimicrobianos',
      description: 'Responder los cinco casos y justificar cada tratamiento.',
      dueLabel: 'Próximo jueves',
      dueAt: '2099-09-03T08:00',
      status: 'published',
      addToNotices: true,
      noticePriority: 'important',
      noticePushMode: true
    });
    expect(writes.some((write) => write.action === 'notice.upsert')).toBe(false);
    const taskItem = page.locator('#taskList .manage-item').filter({ hasText: 'Resolver guía de antimicrobianos' });
    await expect(taskItem).toContainText('Aviso visible ✓');
    await page.locator('[data-manage-tab="notices"]').click();
    const linkedNotice = page.locator('#noticeList .manage-item').filter({ hasText: 'Resolver guía de antimicrobianos' });
    await expect(linkedNotice).toContainText('Vinculado a tarea');
    await expect(linkedNotice.getByRole('button', { name: 'Modificar tarea' })).toBeVisible();

    await linkedNotice.getByRole('button', { name: 'Modificar tarea' }).click();
    await expect(page.locator('#managePanelTasks')).toBeVisible();
    await expect(toggle).toBeChecked();
    await expect(form.locator('[name="noticePriority"]')).toHaveValue('important');
    await expect(form.locator('[name="noticePushMode"]')).toBeChecked();
    await expect(form.getByRole('button', { name: 'Actualizar tarea y aviso' })).toBeVisible();

    await form.locator('[name="title"]').fill('Guía de antimicrobianos actualizada');
    await toggle.uncheck();
    await expect(options).toBeHidden();
    await expect(page.locator('#taskNoticeStatus')).toContainText('el aviso enlazado se archivará');
    await form.getByRole('button', { name: 'Actualizar tarea' }).click();
    await expect.poll(() => writes.length).toBe(2);
    expect(writes[1]).toMatchObject({
      action: 'task.upsert',
      id: 'linked-task-fixture',
      title: 'Guía de antimicrobianos actualizada',
      addToNotices: false,
      noticePriority: 'important',
      noticePushMode: false
    });
    expect(managed.notices).toHaveLength(1);
    expect(managed.notices[0]).toMatchObject({ linkedTaskId: 'linked-task-fixture', status: 'archived' });
    const updatedTask = page.locator('#taskList .manage-item').filter({ hasText: 'Guía de antimicrobianos actualizada' });
    await expect(updatedTask).toContainText('Sin aviso');
    await expect(updatedTask.getByRole('button', { name: 'Añadir a Avisos' })).toBeVisible();

    const mobileLayout = await page.locator('#taskNoticeLink').evaluate((field) => {
      const rect = field.getBoundingClientRect();
      const formRect = field.closest('form').getBoundingClientRect();
      const toggleControl = field.querySelector('.task-notice-switch').getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        formLeft: formRect.left,
        formRight: formRect.right,
        toggleHeight: toggleControl.height
      };
    });
    expect(mobileLayout.left).toBeGreaterThanOrEqual(mobileLayout.formLeft - 1);
    expect(mobileLayout.right).toBeLessThanOrEqual(mobileLayout.formRight + 1);
    expect(mobileLayout.toggleHeight).toBeGreaterThanOrEqual(44);
  });

  test('uploads a notice attachment once, preserves it after a failed save and retries only the notice', async ({ page }) => {
    const actor = { id: 'editor-upload-s5-a', role: 'editor', name: 'Delegada Archivos', classId: 's5-a' };
    let uploadCount = 0;
    let noticeAttempts = 0;
    let savedNotice = null;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-upload-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const contentType = request.headers()['content-type'] || '';
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(managementState(actor, {
            uploadPolicy: { enabled: true, maxBytes: 15 * 1024 * 1024, acceptedMimeTypes: ['application/pdf', 'image/png'] },
            notices: savedNotice ? [savedNotice] : []
          }))
        });
        return;
      }
      if (request.method() === 'POST' && contentType.includes('multipart/form-data')) {
        uploadCount += 1;
        expect(url.searchParams.get('action')).toBe('notice.attachment.upload');
        expect(request.headers().authorization).toBe('Bearer synthetic-upload-bearer');
        expect(request.postData()).toContain('cronograma-oficial.pdf');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, attachment: { uploadId: 'upload-fixture-1', originalName: 'cronograma-oficial.pdf', title: 'cronograma-oficial.pdf', mimeType: 'application/pdf', sizeBytes: 28, attachmentUrl: '/api/class-hub?class=s5-a&resource=notice-attachment&upload=upload-fixture-1' } })
        });
        return;
      }
      if (request.method() === 'POST' && contentType.includes('application/json')) {
        const body = request.postDataJSON();
        if (body.action === 'notice.upsert') {
          noticeAttempts += 1;
          expect(body.attachmentUploadId).toBe('upload-fixture-1');
          expect(body.attachmentTitle).toBe('Documento del aviso');
          if (noticeAttempts === 1) {
            await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'temporary_failure', error: 'Fallo temporal de prueba.' }) });
            return;
          }
          savedNotice = { id: 'notice-fixture', course: 'Farmacología II', title: body.title, body: body.body, priority: body.priority, status: body.status, attachmentUploadId: body.attachmentUploadId, attachmentTitle: body.attachmentTitle, attachmentMimeType: 'application/pdf', attachmentSizeBytes: 28, attachmentUrl: '/api/class-hub?class=s5-a&resource=notice-attachment&upload=upload-fixture-1' };
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: savedNotice.id, ...savedNotice }) });
          return;
        }
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await page.locator('[data-manage-tab="notices"]').click();
    await page.locator('#noticeForm [name="course"]').fill('Farmacología II');
    await page.locator('#noticeForm [name="title"]').fill('Cronograma oficial');
    await page.locator('#noticeAttachmentFile').setInputFiles({ name: 'cronograma-oficial.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 synthetic fixture') });
    await expect(page.locator('#noticeAttachmentPreview')).toContainText('cronograma-oficial.pdf');
    await expect(page.locator('#noticeAttachmentPreview .notice-upload-file-icon')).toHaveText('PDF');

    await page.locator('#noticeForm').getByRole('button', { name: 'Guardar aviso' }).click();
    await expect(page.locator('#manageStatus')).toHaveText('Fallo temporal de prueba.');
    await expect(page.locator('#noticeAttachmentFile')).toHaveValue('');
    await expect(page.locator('#noticeAttachmentUploadId')).toHaveValue('upload-fixture-1');
    expect(uploadCount).toBe(1);

    await page.locator('#noticeForm').getByRole('button', { name: 'Guardar aviso' }).click();
    await expect(page.locator('#manageStatus')).toHaveText('Datos sincronizados.');
    expect(uploadCount).toBe(1);
    expect(noticeAttempts).toBe(2);
    await expect(page.locator('#noticeList .notice-admin-attachment')).toContainText('Documento del aviso');
    await expect(page.locator('#noticeList')).not.toContainText('cronograma-oficial.pdf');
  });

  test('requires a separate privacy confirmation for an AI-flagged notice attachment', async ({ page }) => {
    const actor = { id: 'editor-pii-review-s5-a', role: 'editor', name: 'Delegada Privacidad', classId: 's5-a' };
    const writes = [];
    const flaggedNotice = {
      id: 'flagged-notice-fixture',
      course: 'Farmacología II',
      title: 'Documento para revisar',
      body: 'Comprueba el archivo antes de publicar.',
      priority: 'important',
      status: 'published',
      revision: 3,
      attachmentUploadId: 'upload-flagged-fixture',
      attachmentUrl: '/api/class-hub?class=s5-a&resource=notice-attachment&upload=upload-flagged-fixture',
      attachmentTitle: 'Documento del aviso',
      attachmentMimeType: 'application/pdf',
      attachmentSizeBytes: 2048,
      attachmentPiiWarning: true,
      analysisConfidence: 0.72
    };
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-pii-review-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor, {
          uploadPolicy: { enabled: true, maxBytes: 15 * 1024 * 1024, acceptedMimeTypes: ['application/pdf', 'image/png'] },
          notices: [flaggedNotice]
        })) });
        return;
      }
      if (request.method() === 'POST') {
        writes.push(request.postDataJSON());
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: flaggedNotice.id, revision: 4, status: 'published' }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await page.locator('[data-manage-tab="notices"]').click();
    const noticeItem = page.locator('#noticeList .manage-item').filter({ hasText: flaggedNotice.title });
    await expect(noticeItem).toContainText('Archivo con alerta de privacidad');
    await noticeItem.getByRole('button', { name: 'Modificar' }).click();
    const form = page.locator('#noticeForm');
    await expect(page.locator('#noticePiiReview')).toBeVisible();
    await expect(page.locator('#noticeAttachmentPiiWarning')).toHaveValue('true');
    await expect(page.locator('#noticeAiStatus')).toContainText('posible dato personal');

    await form.getByRole('button', { name: 'Actualizar aviso' }).click();
    await expect(page.locator('#noticeHumanReview')).toHaveAttribute('required', '');
    await expect(page.locator('#noticePiiReviewConfirmed')).toHaveAttribute('required', '');
    expect(writes).toHaveLength(0);
    await page.locator('#noticeHumanReview').check();
    await form.getByRole('button', { name: 'Actualizar aviso' }).click();
    expect(writes).toHaveLength(0);
    await page.locator('#noticePiiReviewConfirmed').check();
    await form.getByRole('button', { name: 'Actualizar aviso' }).click();
    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0]).toMatchObject({
      action: 'notice.upsert',
      id: flaggedNotice.id,
      expectedRevision: 3,
      status: 'published',
      reviewConfirmed: true,
      piiReviewConfirmed: true,
      attachmentUploadId: flaggedNotice.attachmentUploadId
    });
    expect(writes[0].attachmentPiiWarning).toBeUndefined();
    expect(writes[0].humanReview).toBeUndefined();

    await noticeItem.getByRole('button', { name: 'Modificar' }).click();
    await page.locator('#noticeAttachmentFile').setInputFiles({ name: 'nouveau-document.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 replacement fixture') });
    await expect(page.locator('#noticePiiReview')).toBeHidden();
    await expect(page.locator('#noticeAttachmentPiiWarning')).toHaveValue('false');
  });

  test('discards an unsaved local notice file before editing another notice', async ({ page }) => {
    const actor = { id: 'editor-file-switch-s5-a', role: 'editor', name: 'Delegada Cambio Seguro', classId: 's5-a' };
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-file-switch-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(managementState(actor, {
            uploadPolicy: { enabled: true, maxBytes: 15 * 1024 * 1024, acceptedMimeTypes: ['application/pdf', 'image/png'] },
            notices: [{ id: 'existing-notice', course: 'Farmacología II', title: 'Aviso ya guardado', body: 'Contenido oficial.', priority: 'important', status: 'published' }]
          }))
        });
        return;
      }
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
    });

    await page.goto('/gestion/s5-a');
    await page.locator('[data-manage-tab="notices"]').click();
    await page.locator('#noticeAttachmentFile').setInputFiles({ name: 'foto-privada-no-guardada.png', mimeType: 'image/png', buffer: Buffer.from('synthetic private image fixture') });
    await expect(page.locator('#noticeAttachmentPreview')).toContainText('foto-privada-no-guardada.png');

    await page.locator('#noticeList').getByRole('button', { name: 'Modificar' }).click();
    await expect(page.locator('#noticeForm [name="title"]')).toHaveValue('Aviso ya guardado');
    await expect(page.locator('#noticeAttachmentFile')).toHaveValue('');
    await expect(page.locator('#noticeAttachmentUploadId')).toHaveValue('');
    await expect(page.locator('#noticeAttachmentPreview')).toBeHidden();
  });

  test('fails closed when direct notice storage is unavailable', async ({ page }) => {
    const actor = { id: 'editor-no-upload-s5-a', role: 'editor', name: 'Delegada Sin R2', classId: 's5-a' };
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-no-upload-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'GET' && url.searchParams.get('resource') === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(actor, { uploadPolicy: { enabled: false, maxBytes: 15 * 1024 * 1024, acceptedMimeTypes: [] } })) });
        return;
      }
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
    });
    await page.goto('/gestion/s5-a');
    await page.locator('[data-manage-tab="notices"]').click();
    await expect(page.locator('#noticeAttachmentFile')).toBeDisabled();
    await expect(page.locator('#noticeAttachmentHelp')).toContainText('temporalmente indisponible');
    await expect(page.locator('#noticeAttachmentHelp')).not.toContainText('Cloudflare');
  });

  test('keeps group exports inside their activity and sends them to the delegate WhatsApp on mobile', async ({ page }) => {
    const actor = { id: 'editor-groups-s5-a', role: 'editor', name: 'Delegada Grupos', classId: 's5-a' };
    let profile = { name: actor.name, email: SYNTHETIC_EMAIL, whatsapp: '+595981123456', whatsappFormatVerifiedAt: '2099-08-25T12:00:00.000Z' };
    const writes = [];
    await page.setViewportSize({ width: 375, height: 740 });
    await page.addInitScript(({ key }) => {
      sessionStorage.setItem(key, 'synthetic-groups-bearer');
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText(value) { window.__copiedGroupText = value; return Promise.resolve(); } }
      });
      window.open = (url) => {
        window.__openedWhatsappUrl = url;
        return { opener: null };
      };
    }, { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const resource = url.searchParams.get('resource');
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (request.method() === 'GET' && resource === 'public') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) });
        return;
      }
      if (request.method() === 'GET' && resource === 'admin') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(managementState(actor, {
            profile,
            activities: [
              { id: 'activity-alpha', title: 'Seminario Alpha', capacity: 10, status: 'published', frozen: false },
              { id: 'activity-beta', title: 'Seminario Beta', capacity: 8, status: 'published', frozen: false }
            ],
            groups: [
              { id: 'alpha-g10', activity_id: 'activity-alpha', name: 'Grupo 10', capacity: 10, frozen: 0 },
              { id: 'alpha-g2', activity_id: 'activity-alpha', name: 'Grupo 2', capacity: 10, frozen: 0 },
              { id: 'beta-g1', activity_id: 'activity-beta', name: 'Grupo 1', capacity: 8, frozen: 0 }
            ],
            memberships: [
              { id: 'alpha-lead', activity_id: 'activity-alpha', group_id: 'alpha-g2', display_name: 'Ana Responsable', isLeader: true },
              { id: 'alpha-member', activity_id: 'activity-alpha', group_id: 'alpha-g2', display_name: 'Bruno Alpha', isLeader: false },
              { id: 'beta-member', activity_id: 'activity-beta', group_id: 'beta-g1', display_name: 'Carla Beta', isLeader: false }
            ]
          }))
        });
        return;
      }
      if (body?.action === 'profile.upsert') {
        writes.push(body);
        profile = { ...profile, whatsapp: body.whatsapp, whatsappFormatVerifiedAt: '2099-08-25T12:05:00.000Z' };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, profile }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#manageApp')).toBeVisible();
    await page.locator('[data-manage-tab="groups"]').click();
    const alpha = page.locator('.activity-card[data-activity-id="activity-alpha"]');
    const beta = page.locator('.activity-card[data-activity-id="activity-beta"]');
    await expect(alpha).toBeVisible();
    await expect(beta).toBeVisible();
    await expect(alpha.locator('.activity-tools [data-group-action]')).toHaveCount(4);
    await expect(beta.locator('.activity-tools [data-group-action]')).toHaveCount(4);

    await alpha.locator('[data-group-action="copy"]').click();
    const copied = await page.evaluate(() => window.__copiedGroupText);
    expect(copied).toContain('Seminario Alpha');
    expect(copied).toContain('Responsable: Ana Responsable');
    expect(copied).toContain('Grupo 2');
    expect(copied).not.toContain('Seminario Beta');
    expect(copied).not.toContain('Carla Beta');

    await alpha.locator('[data-group-action="whatsapp"]').click();
    const openedUrl = await page.evaluate(() => window.__openedWhatsappUrl);
    expect(openedUrl).toMatch(/^https:\/\/wa\.me\/595981123456\?text=/);
    const whatsappText = new URL(openedUrl).searchParams.get('text');
    expect(whatsappText).toContain('Seminario Alpha');
    expect(whatsappText).not.toContain('Seminario Beta');

    const mobileLayout = await alpha.locator('.activity-tools').evaluate((tools) => ({
      pageWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      columns: getComputedStyle(tools).gridTemplateColumns.split(' ').length,
      heights: [...tools.querySelectorAll('button')].map((button) => button.getBoundingClientRect().height)
    }));
    expect(mobileLayout.scrollWidth).toBeLessThanOrEqual(mobileLayout.pageWidth + 1);
    expect(mobileLayout.columns).toBe(2);
    mobileLayout.heights.forEach((height) => expect(height).toBeGreaterThanOrEqual(44));

    await page.locator('[data-manage-tab="profile"]').click();
    await expect(page.locator('#profileForm [name="name"]')).toHaveValue(actor.name);
    await expect(page.locator('#profileForm [name="email"]')).toHaveValue(SYNTHETIC_EMAIL);
    await page.locator('#profileWhatsapp').fill('00 595 (982) 111-222');
    await page.locator('#profileForm').getByRole('button', { name: 'Guardar mi WhatsApp' }).click();
    await expect(page.locator('#profileWhatsapp')).toHaveValue('+595982111222');
    expect(writes).toContainEqual({ action: 'profile.upsert', whatsapp: '+595982111222' });
  });

  test('offers an unauthenticated delegate a class-specific WhatsApp access request', async ({ page }) => {
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'GET' && url.searchParams.get('resource') === 'public') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CLASS_RESPONSE) });
        return;
      }
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
    });

    await page.goto('/gestion/s5-a');
    const requestAccess = page.locator('#requestAccessLink');
    await expect(requestAccess).toBeVisible();
    await expect(requestAccess).toHaveAttribute('href', /https:\/\/wa\.me\/595981000111\?text=/);
    const href = await requestAccess.getAttribute('href');
    expect(new URL(href).searchParams.get('text')).toContain('Medicina · 5.º A');
    await expect(page.locator('#requestAccessHelp')).toContainText('WhatsApp');
  });

  test('keeps pilot management form values after an authenticated save failure', async ({ page }) => {
    const requestedPaths = [];
    const apiRequests = [];
    const managementHtml = readRepo('gestion-shell/index.html');

    page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
    await page.route('**/gestion/s5-a', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: managementHtml });
    });
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      apiRequests.push({
        method: request.method(),
        classId: url.searchParams.get('class'),
        resource: url.searchParams.get('resource'),
        authorization: request.headers().authorization || '',
        body: request.postDataJSON?.() || null
      });
      if (request.method() === 'GET' && url.searchParams.get('resource') === 'session') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' })
        });
        return;
      }
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, code: 'pilot_write_failure', error: 'Fallo temporal de guardado del piloto.' })
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          class: CLASS_RESPONSE.class,
          actor: { id: 'editor-s5-a', role: 'editor', name: 'Delegada piloto' },
          subjects: CLASS_RESPONSE.subjects,
          tasks: [], notices: [], activities: [], groups: [], memberships: [], files: [], dates: [],
          scheduleSlots: [{ id: 'farmaco-thu-0800', subjectId: 'farmacologia-ii', subject: 'Farmacología II', weekday: 4, startsTime: '08:00', endsTime: '10:00', label: 'Dra. Vega', status: 'published' }],
          upcomingDates: [
            { slotId: 'farmaco-thu-0800', subjectId: 'farmacologia-ii', subject: 'Farmacología II', date: '2099-09-03', startsAt: '2099-09-03T08:00', endsAt: '2099-09-03T10:00', label: 'jue. 3 sept. · 08:00', timeZone: 'America/Asuncion' },
            { slotId: 'farmaco-thu-0800', subjectId: 'farmacologia-ii', subject: 'Farmacología II', date: '2099-09-10', startsAt: '2099-09-10T08:00', endsAt: '2099-09-10T10:00', label: 'jue. 10 sept. · 08:00', timeZone: 'America/Asuncion' }
          ], editors: [], invites: []
        })
      });
    });

    await page.goto('/gestion/s5-a');

    await expect(page.locator('link[rel="stylesheet"][href^="/gestion-v440.css"]')).toHaveAttribute('href', '/gestion-v440.css?v=487');
    await expect(page.locator('script[src^="/gestion-v440.js"]')).toHaveAttribute('src', '/gestion-v440.js?v=489');
    expect(requestedPaths).toContain('/gestion-v440.css');
    expect(requestedPaths).toContain('/gestion-v440.js');
    await expect(page.locator('#authClassSlug')).toHaveText('S5-A');
    await expect(page.locator('#manageBackLink')).toHaveAttribute('href', '/turma/s5-a');

    await page.locator('#legacyTokenAccess').getByText('Otra forma de acceso').click();
    await page.locator('#accessToken').fill('pilot-editor-token');
    await page.locator('#tokenForm').getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#actorName')).toContainText('Delegada piloto');
    await expect(page.locator('#manageClassTitle')).toContainText('Medicina · 5.º A');

    const adminRead = apiRequests.find((request) => request.method === 'GET' && request.resource === 'admin');
    expect(adminRead).toMatchObject({ classId: 's5-a', authorization: 'Bearer pilot-editor-token' });

    const form = page.locator('#taskForm');
    await form.locator('[name="course"]').fill('Farmacología II');
    await expect(page.locator('#taskSuggestedDate option')).toHaveCount(3);
    await page.locator('#taskSuggestedDate').selectOption('2099-09-03T08:00');
    await expect(form.locator('[name="dueAt"]')).toHaveValue('2099-09-03T08:00');
    await expect(form.locator('[name="dueLabel"]')).toHaveValue('jue. 3 sept. · 08:00');
    await form.locator('[name="title"]').fill('Trabajo que no debe borrarse');
    await form.locator('[name="description"]').fill('Conservar esta consigna después del error del servidor.');
    await form.locator('[name="dueLabel"]').fill('Próximo lunes');
    await form.locator('[name="dueAt"]').fill('2099-09-01T10:00');
    await form.locator('[name="attachmentUrl"]').fill('https://example.test/trabajo.pdf');
    await form.locator('[name="attachmentTitle"]').fill('Documento del profesor');
    await form.locator('[name="status"]').selectOption('published');
    await form.locator('[name="addToNotices"]').check();
    await expect(page.locator('#taskNoticeOptions')).toBeVisible();
    await form.locator('[name="noticePriority"]').selectOption('important');
    await form.locator('[name="noticePushMode"]').check();
    await form.getByRole('button', { name: 'Guardar tarea y aviso' }).click();

    await expect(page.locator('#manageStatus')).toHaveText('Fallo temporal de guardado del piloto.');
    await expect(form.locator('[name="course"]')).toHaveValue('Farmacología II');
    await expect(form.locator('[name="title"]')).toHaveValue('Trabajo que no debe borrarse');
    await expect(form.locator('[name="description"]')).toHaveValue('Conservar esta consigna después del error del servidor.');
    await expect(form.locator('[name="dueLabel"]')).toHaveValue('Próximo lunes');
    await expect(form.locator('[name="dueAt"]')).toHaveValue('2099-09-01T10:00');
    await expect(form.locator('[name="attachmentUrl"]')).toHaveValue('https://example.test/trabajo.pdf');
    await expect(form.locator('[name="attachmentTitle"]')).toHaveValue('Documento del profesor');
    await expect(form.locator('[name="status"]')).toHaveValue('published');
    await expect(form.locator('[name="addToNotices"]')).toBeChecked();
    await expect(page.locator('#taskNoticeOptions')).toBeVisible();
    await expect(form.locator('[name="noticePriority"]')).toHaveValue('important');
    await expect(form.locator('[name="noticePushMode"]')).toBeChecked();

    const failedWrite = apiRequests.find((request) => request.method === 'POST');
    expect(failedWrite).toMatchObject({
      classId: 's5-a',
      authorization: 'Bearer pilot-editor-token',
      body: {
        action: 'task.upsert',
        course: 'Farmacología II',
        title: 'Trabajo que no debe borrarse',
        description: 'Conservar esta consigna después del error del servidor.',
        attachmentUrl: 'https://example.test/trabajo.pdf',
        attachmentTitle: 'Documento del profesor',
        status: 'published',
        addToNotices: true,
        noticePriority: 'important',
        noticePushMode: true
      }
    });
  });

  test('lets the owner create and reset a delegate credential without rendering either password', async ({ page }) => {
    const writes = [];
    const editors = [];
    const owner = { id: 'owner', role: 'owner', name: 'Propietario', classId: 's5-a' };
    const resetPassword = 'Reset-Temporary-Study-2026!';
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const resource = url.searchParams.get('resource');
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (request.method() === 'GET' && resource === 'session') {
        await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' }) });
        return;
      }
      if (request.method() === 'GET' && resource === 'classes') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, classes: [] }) });
        return;
      }
      if (request.method() === 'GET' && resource === 'audit') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, audit: [] }) });
        return;
      }
      if (request.method() === 'GET' && resource === 'admin') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(managementState(owner, { editors })) });
        return;
      }
      if (body?.action === 'editor.account.create') {
        writes.push({ authorization: request.headers().authorization || '', body });
        editors.push({
          id: 'editor-account-fixture',
          name: body.name,
          email: body.email.toLowerCase(),
          status: 'active',
          password_change_required: 1,
          last_used_at: null
        });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            editor: { id: 'editor-account-fixture', name: body.name, email: body.email.toLowerCase(), role: 'editor', classId: 's5-a', status: 'active' },
            passwordChangeRequired: true,
            temporaryExpiresAt: '2099-09-01T12:00:00.000Z'
          })
        });
        return;
      }
      if (body?.action === 'editor.password.reset') {
        writes.push({ authorization: request.headers().authorization || '', body });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: body.id, passwordChangeRequired: true, temporaryExpiresAt: '2099-09-02T12:00:00.000Z' }) });
        return;
      }
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'unexpected_request', error: 'Solicitud inesperada.' }) });
    });

    await page.goto('/gestion/s5-a');
    await page.locator('#legacyTokenAccess').getByText('Otra forma de acceso').click();
    await page.locator('#accessToken').fill('synthetic-owner-bearer');
    await page.locator('#tokenForm').getByRole('button', { name: 'Entrar con token' }).click();
    await expect(page.locator('#manageApp')).toBeVisible();
    await page.locator('[data-manage-tab="access"]').click();

    const accountForm = page.locator('#delegateAccountForm');
    await accountForm.locator('[name="name"]').fill('Delegada Sintética');
    await accountForm.locator('[name="email"]').fill(SYNTHETIC_EMAIL);
    await accountForm.locator('[name="temporaryPassword"]').fill(SYNTHETIC_TEMP_PASSWORD);
    await accountForm.locator('[name="hours"]').fill('24');
    await accountForm.getByRole('button', { name: 'Crear cuenta de delegado' }).click();

    await expect(page.locator('#accountOutput')).toContainText('Cuenta de delegado creada');
    await expect(page.locator('#accountOutput')).toContainText(SYNTHETIC_EMAIL);
    await expect(page.locator('#accountOutput')).not.toContainText(SYNTHETIC_TEMP_PASSWORD);
    await expect(accountForm.locator('[name="temporaryPassword"]')).toHaveValue('');
    let editorCard = page.locator('#editorList .manage-item').filter({ hasText: 'Delegada Sintética' });
    await expect(editorCard).toContainText('Cambio de contraseña pendiente');

    await editorCard.getByRole('button', { name: 'Restablecer contraseña' }).click();
    const resetDialog = page.locator('#resetPasswordDialog');
    await expect(resetDialog).toBeVisible();
    await resetDialog.locator('[name="temporaryPassword"]').fill(resetPassword);
    await resetDialog.locator('[name="hours"]').fill('24');
    await resetDialog.getByRole('button', { name: 'Guardar contraseña temporal' }).click();
    await expect(resetDialog).toBeHidden();
    await expect(page.locator('body')).not.toContainText(resetPassword);

    expect(writes).toHaveLength(2);
    expect(writes[0]).toEqual({
      authorization: 'Bearer synthetic-owner-bearer',
      body: {
        action: 'editor.account.create',
        name: 'Delegada Sintética',
        email: SYNTHETIC_EMAIL,
        temporaryPassword: SYNTHETIC_TEMP_PASSWORD,
        hours: '24'
      }
    });
    expect(writes[1]).toEqual({
      authorization: 'Bearer synthetic-owner-bearer',
      body: {
        id: 'editor-account-fixture',
        temporaryPassword: resetPassword,
        hours: '24',
        action: 'editor.password.reset'
      }
    });
  });

  test('lets the owner modify, archive and reactivate a class without changing its stable slug', async ({ page }) => {
    const managementHtml = readRepo('gestion-shell/index.html');
    const writes = [];
    const classes = [
      { id: 's4-e', slug: 's4-e', name: 'Medicina · 4.º E', semester: 4, group: 'E', theme: 'midnight-gold', driveUrl: '', status: 'active' },
      { id: 's5-a', slug: 's5-a', name: 'Medicina · 5.º A', semester: 5, group: 'A', theme: 'midnight-gold', driveUrl: '', status: 'active' }
    ];
    const adminState = () => ({
      ok: true,
      class: classes[0],
      actor: { id: 'owner', role: 'owner', name: 'Propietario' },
      subjects: [], tasks: [], notices: [], activities: [], groups: [], memberships: [], files: [], dates: [], editors: [], invites: []
    });

    await page.route('**/gestion/s4-e', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: managementHtml });
    });
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request();
      const resource = new URL(request.url()).searchParams.get('resource');
      if (request.method() === 'GET' && resource === 'session') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ ok: false, code: 'authentication_required', error: 'Inicia sesión.' })
        });
        return;
      }
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        writes.push(body);
        const target = classes.find((info) => info.id === body.id || info.slug === body.slug);
        Object.assign(target, {
          name: body.name,
          semester: Number(body.semester),
          group: body.group || '',
          theme: body.theme || 'midnight-gold',
          driveUrl: body.driveUrl || '',
          status: body.status
        });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, class: target }) });
        return;
      }
      const body = resource === 'classes'
        ? { ok: true, classes }
        : resource === 'audit'
          ? { ok: true, class: classes[0], audit: [] }
          : adminState();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto('/gestion/s4-e');
    await page.locator('#legacyTokenAccess').getByText('Otra forma de acceso').click();
    await page.locator('#accessToken').fill('owner-token');
    await page.locator('#tokenForm').getByRole('button', { name: 'Entrar' }).click();
    await page.locator('[data-manage-tab="classes"]').click();

    let targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A' });
    await expect(targetCard).toBeVisible();
    await targetCard.getByRole('button', { name: 'Modificar' }).click();
    const classForm = page.locator('#classForm');
    await expect(classForm.locator('[name="slug"]')).toHaveValue('s5-a');
    await expect(classForm.locator('[name="slug"]')).toHaveAttribute('readonly', '');
    await expect(classForm.locator('[name="id"]')).toHaveValue('s5-a');
    await classForm.locator('[name="name"]').fill('Medicina · 5.º A · Piloto');
    await classForm.getByRole('button', { name: 'Actualizar clase' }).click();
    await expect(page.locator('#classOutput')).toContainText('Clase actualizada');
    await expect(classForm.locator('[name="slug"]')).not.toHaveAttribute('readonly', '');

    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    page.once('dialog', (dialog) => dialog.accept());
    await targetCard.getByRole('button', { name: 'Archivar' }).click();
    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    await expect(targetCard).toContainText('ARCHIVADA');
    await expect(targetCard.getByRole('button', { name: 'Reactivar' })).toBeVisible();
    await expect(targetCard.getByRole('link', { name: 'Ver clase' })).toHaveCount(0);

    await targetCard.getByRole('button', { name: 'Reactivar' }).click();
    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    await expect(targetCard).toContainText('ACTIVA');
    await expect(targetCard.getByRole('link', { name: 'Ver clase' })).toBeVisible();
    await expect(page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 4.º E' }).getByRole('button', { name: 'Archivar' })).toHaveCount(0);

    expect(writes).toHaveLength(3);
    expect(writes.map((body) => [body.id, body.slug, body.status])).toEqual([
      ['s5-a', 's5-a', 'active'],
      ['s5-a', 's5-a', 'archived'],
      ['s5-a', 's5-a', 'active']
    ]);
  });

  test('keeps managed courses hidden from an ordinary editor', async ({ page }) => {
    const actor = { id: 'editor-standard', role: 'editor', name: 'Editor estándar', classId: 's5-a', capabilities: { manageContent: false } };
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-standard-editor'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const resource = new URL(route.request().url()).searchParams.get('resource');
      const body = resource === 'public'
        ? { ok: true, class: CLASS_RESPONSE.class }
        : managementState(actor, { lessons: [] });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto('/gestion/s5-a');

    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#actorRole')).toHaveText('DELEGADO');
    await expect(page.locator('#manageTabContent')).toBeHidden();
    await expect(page.locator('#managePanelContent')).toBeHidden();
  });

  test('prefers a capable email session over a legacy bearer and publishes a canonical lesson update', async ({ page }) => {
    const actor = { id: 'editor-content', role: 'editor', name: 'Editor de contenido', classId: 's5-a', capabilities: { manageContent: true } };
    const practice = {
      qcm: Array.from({ length: 20 }, (_, index) => ({
        id: `lesson-fixture-qcm-${String(index + 1).padStart(2, '0')}`,
        revision: index === 0 ? 4 : 1,
        question: `Pregunta QCM ${index + 1}`,
        options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        answerIndex: index % 4,
        explanation: 'Explicación basada en el curso.'
      })),
      trueFalse: Array.from({ length: 10 }, (_, index) => ({
        id: `lesson-fixture-vf-${String(index + 1).padStart(2, '0')}`,
        revision: 1,
        question: `Afirmación ${index + 1}`,
        options: ['Verdadero', 'Falso'],
        answerIndex: index % 2,
        explanation: 'Justificación basada en el curso.'
      })),
      clinicalCases: Array.from({ length: 10 }, (_, index) => ({
        id: `lesson-fixture-case-${String(index + 1).padStart(2, '0')}`,
        revision: 2,
        stem: `Escenario clínico ${index + 1}`,
        question: `Pregunta clínica ${index + 1}`,
        options: ['Conducta A', 'Conducta B', 'Conducta C', 'Conducta D'],
        answerIndex: index % 4,
        explanation: 'Razonamiento clínico basado en el curso.'
      }))
    };
    const lesson = {
      id: 'farmacologia-ii-2099-09-03-antimicrobianos',
      subjectId: 'farmacologia-ii',
      lessonDate: '2099-09-03',
      title: 'Antimicrobianos',
      description: 'Selección razonada del tratamiento.',
      status: 'published',
      revision: 7,
      full: '# Curso completo\n\nContenido fuente.',
      quick: '## Ficha rápida\n\n- Punto clave',
      ultra: '- Punto indispensable',
      practice
    };
    const writes = [], adminHeaders = [];
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-stale-legacy-bearer'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await exposeSyntheticCsrfCookie(page);
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), url = new URL(request.url()), resource = url.searchParams.get('resource');
      if (request.method() === 'POST') {
        writes.push({ url: request.url(), body: request.postDataJSON(), headers: request.headers() });
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, lesson }) });
        return;
      }
      let body;
      if (resource === 'public') body = { ok: true, class: CLASS_RESPONSE.class };
      else if (resource === 'session') body = { ok: true, class: CLASS_RESPONSE.class, actor, passwordChangeRequired: false };
      else {
        adminHeaders.push(request.headers());
        const bearerActor = { ...actor, capabilities: { manageContent: false } };
        body = managementState(request.headers().authorization ? bearerActor : actor, { lessons: [lesson] });
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto('/gestion/s5-a');
    await expect(page.locator('#actorRole')).toHaveText('ADMINISTRADOR DE CONTENIDO');
    await expect(page.locator('#manageTabContent')).toBeVisible();
    await page.locator('#manageTabContent').click();
    await page.locator('#lessonList').getByRole('button', { name: 'Modificar' }).click();
    await expect(page.locator('#lessonExpectedRevision')).toHaveValue('7');
    const withdrawButton = page.locator('#lessonForm button[data-lesson-status="draft"]');
    await expect(withdrawButton).toHaveText('Retirar y guardar borrador');
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('desaparecerá de Materia y Entrenamiento');
      await dialog.dismiss();
    });
    await withdrawButton.click();
    expect(writes).toHaveLength(0);
    const loaded = JSON.parse(await page.locator('#lessonPracticeJson').inputValue());
    expect(loaded.practice.qcm[0]).toMatchObject({ id: 'lesson-fixture-qcm-01', revision: 4 });

    const incomplete = JSON.parse(JSON.stringify(loaded));
    incomplete.practice.qcm.pop();
    await page.locator('#lessonPracticeJson').fill(JSON.stringify(incomplete));
    await page.locator('#lessonForm button[data-lesson-status="published"]').click();
    await expect(page.locator('#practiceJsonStatus')).toContainText('exactamente 20 QCM');
    expect(writes).toHaveLength(0);

    for (const malformedIndex of [null, '', true]) {
      const malformed = JSON.parse(JSON.stringify(loaded));
      malformed.practice.qcm[0].answerIndex = malformedIndex;
      await page.locator('#lessonPracticeJson').fill(JSON.stringify(malformed));
      await page.locator('#lessonForm button[data-lesson-status="published"]').click();
      await expect(page.locator('#practiceJsonStatus')).toContainText('answerIndex válido');
      expect(writes).toHaveLength(0);
    }

    const friendly = JSON.parse(JSON.stringify(loaded));
    friendly.practice.qcm[0].prompt = friendly.practice.qcm[0].question;
    friendly.practice.qcm[0].answer = friendly.practice.qcm[0].answerIndex;
    delete friendly.practice.qcm[0].question;
    delete friendly.practice.qcm[0].answerIndex;
    friendly.practice.qcm[1].answerIndex = '1';
    friendly.practice.trueFalse[0].answer = true;
    delete friendly.practice.trueFalse[0].answerIndex;
    friendly.practice.clinicalCases[0].scenario = friendly.practice.clinicalCases[0].stem;
    friendly.practice.clinicalCases[0].prompt = friendly.practice.clinicalCases[0].question;
    friendly.practice.clinicalCases[0].answer = friendly.practice.clinicalCases[0].answerIndex;
    delete friendly.practice.clinicalCases[0].stem;
    delete friendly.practice.clinicalCases[0].question;
    delete friendly.practice.clinicalCases[0].answerIndex;
    await page.locator('#lessonPracticeJson').fill(JSON.stringify({ title: lesson.title, practice: friendly.practice }));
    await page.locator('#lessonForm button[data-lesson-status="published"]').click();
    await expect.poll(() => writes.length).toBe(1);

    const write = writes[0], writeUrl = new URL(write.url);
    expect(writeUrl.searchParams.get('action')).toBe('lesson.upsert');
    await expect.poll(() => adminHeaders.length).toBe(2);
    expect(adminHeaders).toHaveLength(2);
    expect(adminHeaders.every((headers) => !headers.authorization)).toBe(true);
    expect(write.headers.authorization).toBeUndefined();
    expect(write.headers['x-csrf-token']).toBe(SYNTHETIC_CSRF);
    expect(write.body).toMatchObject({
      action: 'lesson.upsert',
      id: lesson.id,
      expectedRevision: 7,
      subjectId: lesson.subjectId,
      lessonDate: lesson.lessonDate,
      title: lesson.title,
      description: lesson.description,
      full: lesson.full,
      quick: lesson.quick,
      ultra: lesson.ultra,
      status: 'published'
    });
    expect(write.body.fullMarkdown).toBeUndefined();
    expect(write.body.practice.qcm).toHaveLength(20);
    expect(write.body.practice.trueFalse).toHaveLength(10);
    expect(write.body.practice.clinicalCases).toHaveLength(10);
    expect(write.body.practice.qcm[0]).toMatchObject({ id: 'lesson-fixture-qcm-01', revision: 4, question: 'Pregunta QCM 1', answerIndex: 0 });
    expect(write.body.practice.qcm[0].prompt).toBeUndefined();
    expect(write.body.practice.qcm[1].answerIndex).toBe(1);
    expect(write.body.practice.trueFalse[0].answerIndex).toBe(0);
    expect(write.body.practice.clinicalCases[0]).toMatchObject({ id: 'lesson-fixture-case-01', revision: 2, stem: 'Escenario clínico 1', question: 'Pregunta clínica 1', answerIndex: 0 });
  });

  test('lets the owner grant content.manage without coupling it to account creation', async ({ page }) => {
    const owner = { id: 'owner', role: 'owner', name: 'Propietario', classId: 's5-a', capabilities: { manageContent: true } };
    const editors = [
      { id: 'editor-permission-fixture', name: 'Delegado de prueba', email: 'permission.fixture@example.test', status: 'active', can_manage_content: false, can_manage_invites: false },
      { id: 'legacy-editor-fixture', name: 'Delegado con token', status: 'active', can_manage_content: false, can_manage_invites: false }
    ];
    const writes = [];
    await page.addInitScript(({ key }) => sessionStorage.setItem(key, 'synthetic-permission-owner'), { key: 'med-nykuto-management-token-v471:s5-a' });
    await routeManagementShell(page);
    await page.route('**/api/class-hub**', async (route) => {
      const request = route.request(), resource = new URL(request.url()).searchParams.get('resource');
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        writes.push({ url: request.url(), body });
        const permission = body.permission || 'content.manage';
        if (permission === 'invite.manage') editors[0].can_manage_invites = body.enabled;
        else editors[0].can_manage_content = body.enabled;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, id: editors[0].id, permission, enabled: body.enabled }) });
        return;
      }
      const body = resource === 'public'
        ? { ok: true, class: CLASS_RESPONSE.class }
        : resource === 'classes'
          ? { ok: true, classes: [] }
          : resource === 'audit'
            ? { ok: true, audit: [] }
            : managementState(owner, { lessons: [], editors });
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto('/gestion/s5-a');
    await page.locator('#manageTabAccess').click();
    const legacyEditor = page.locator('#editorList .manage-item').filter({ hasText: 'Delegado con token' });
    await expect(legacyEditor).toContainText('crea primero una cuenta por correo');
    await expect(legacyEditor.locator('[data-permission-action="content.manage"]')).toHaveCount(0);
    await page.locator('#editorList').getByRole('button', { name: 'Autorizar contenido' }).click();
    await expect.poll(() => writes.length).toBe(1);

    const writeUrl = new URL(writes[0].url);
    expect(writeUrl.searchParams.get('action')).toBeNull();
    expect(writes[0].body).toEqual({ action: 'editor.permission.update', id: 'editor-permission-fixture', enabled: true });
    await expect(page.locator('#editorList').getByRole('button', { name: 'Retirar permiso de contenido' })).toBeVisible();
    await page.locator('#editorList').getByRole('button', { name: 'Autorizar invitaciones' }).click();
    await expect.poll(() => writes.length).toBe(2);
    expect(writes[1].body).toEqual({ action: 'editor.permission.update', id: 'editor-permission-fixture', permission: 'invite.manage', enabled: true });
    await expect(page.locator('#editorList').getByRole('button', { name: 'Retirar permiso de invitaciones' })).toBeVisible();
    await expect(page.locator('#delegateAccountForm [name="email"]')).toHaveValue('');
  });

  test('keeps the service-worker shell generic and rejects external push targets', async () => {
    const source = readRepo('service-worker.js');
    const shellMatch = source.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\];/);
    expect(shellMatch).not.toBeNull();
    const shellEntries = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(shellEntries).toEqual(expect.arrayContaining([
      '/offline.html',
      '/turma-shell/',
      '/turma-v471.css?v=484',
      '/turma-v471.js?v=485',
      '/turma-manifest-boot-v471.js?v=478',
      '/public-theme-v485.css?v=485',
      '/public-theme-v485.js?v=485',
      '/calendar-subscription-v485.js?v=485'
    ]));
    expect(source).toMatch(/const\s+CACHE\s*=\s*['"]med-nykuto-shell-v485['"]/);
    [
      /\/gestion/i,
      /\/api\//i,
      /\/turma\/s[34]-/i,
      /(?:semester|semestre)-?[34]/i,
      /clase\.html/i,
      /academic-model/i,
      /class-hub/i,
      /practice-bank/i,
      /med-courses-data/i,
      /grupo-3/i
    ].forEach((forbidden) => {
      expect(shellEntries.some((entry) => forbidden.test(entry)), `Forbidden precache entry matching ${forbidden}`).toBe(false);
    });

    expect(source).toMatch(/url\.pathname\.startsWith\(['"]\/api\/['"]\)/);
    expect(source).toMatch(/url\.pathname\.startsWith\(['"]\/gestion['"]\)/);

    const listeners = {};
    const context = vm.createContext({
      URL,
      self: {
        location: { origin: 'https://med.nykuto.com' },
        addEventListener(type, handler) { listeners[type] = handler; }
      }
    });
    vm.runInContext(source, context, { filename: 'service-worker.js' });
    const target = (value) => vm.runInContext(`safeNotificationTarget(${JSON.stringify(value)})`, context);

    expect(target('https://evil.example/turma/s5-a#tareas')).toBe('/turma/s4-e#avisos');
    expect(target('https://med.nykuto.com/gestion/s5-a')).toBe('/turma/s4-e#avisos');
    expect(target('https://med.nykuto.com/turma/s5-a#tareas')).toBe('/turma/s5-a#tareas');
    expect(Object.keys(listeners)).toEqual(expect.arrayContaining(['install', 'activate', 'fetch', 'push', 'notificationclick']));
  });

  test('selects the s5-a manifest in the document head before the class runtime starts', async ({ page }) => {
    const turmaHtml = readRepo('turma-shell/index.html');
    const loadedPaths = [];
    page.on('request', (request) => loadedPaths.push(new URL(request.url()).pathname));

    await page.route('**/turma/s5-a', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: turmaHtml });
    });
    await page.route('**/turma-v471.js*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript; charset=utf-8',
        body: 'window.__manifestSeenAtRuntime = document.getElementById("classManifest").getAttribute("href");'
      });
    });

    await page.goto('/turma/s5-a');

    expect(turmaHtml.indexOf('/turma-manifest-boot-v471.js')).toBeLessThan(turmaHtml.indexOf('/turma-v471.js'));
    expect(loadedPaths).toContain('/turma-manifest-boot-v471.js');
    await expect(page.locator('#classManifest')).toHaveAttribute('href', '/api/class-manifest?class=s5-a');
    await expect.poll(() => page.evaluate(() => window.__manifestSeenAtRuntime)).toBe('/api/class-manifest?class=s5-a');
  });
});
