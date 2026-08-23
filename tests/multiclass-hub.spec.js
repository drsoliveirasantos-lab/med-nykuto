const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const readRepo = (file) => fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');

const PRIVATE_NAMES = ['Alice Private', 'Bruno Secret'];
const CLASS_RESPONSE = {
  ok: true,
  class: {
    id: 's5-a',
    slug: 's5-a',
    name: 'Medicina · 5.º A',
    semester: 5,
    group: 'A',
    description: 'Espacio privado de prueba del quinto semestre.',
    driveUrl: 'https://drive.google.com/drive/folders/class-s5-a'
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
      status: 'published'
    }
  ],
  notices: [
    { id: 'room-change', title: 'Cambio de aula', body: 'La clase será en el aula 12.', priority: 'important', status: 'published' }
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
    await expect(page.locator('main [data-view]')).toHaveCount(5);
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
          tasks: [], notices: [], activities: [], groups: [], memberships: [], files: [], dates: [], editors: [], invites: []
        })
      });
    });

    await page.goto('/gestion/s5-a');

    await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href', /^\/gestion-v440\.css/);
    await expect(page.locator('script[src]')).toHaveAttribute('src', /^\/gestion-v440\.js/);
    expect(requestedPaths).toContain('/gestion-v440.css');
    expect(requestedPaths).toContain('/gestion-v440.js');
    await expect(page.locator('#authClassSlug')).toHaveText('S5-A');
    await expect(page.locator('#manageBackLink')).toHaveAttribute('href', '/turma/s5-a');

    await page.locator('#accessToken').fill('pilot-editor-token');
    await page.locator('#tokenForm').getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('#manageApp')).toBeVisible();
    await expect(page.locator('#actorName')).toContainText('Delegada piloto');
    await expect(page.locator('#manageClassTitle')).toContainText('Medicina · 5.º A');

    const adminRead = apiRequests.find((request) => request.method === 'GET' && request.resource === 'admin');
    expect(adminRead).toMatchObject({ classId: 's5-a', authorization: 'Bearer pilot-editor-token' });

    const form = page.locator('#taskForm');
    await form.locator('[name="course"]').fill('Farmacología II');
    await form.locator('[name="title"]').fill('Trabajo que no debe borrarse');
    await form.locator('[name="description"]').fill('Conservar esta consigna después del error del servidor.');
    await form.locator('[name="dueLabel"]').fill('Próximo lunes');
    await form.locator('[name="dueAt"]').fill('2099-09-01T10:00');
    await form.locator('[name="status"]').selectOption('published');
    await form.getByRole('button', { name: 'Guardar tarea' }).click();

    await expect(page.locator('#manageStatus')).toHaveText('Fallo temporal de guardado del piloto.');
    await expect(form.locator('[name="course"]')).toHaveValue('Farmacología II');
    await expect(form.locator('[name="title"]')).toHaveValue('Trabajo que no debe borrarse');
    await expect(form.locator('[name="description"]')).toHaveValue('Conservar esta consigna después del error del servidor.');
    await expect(form.locator('[name="dueLabel"]')).toHaveValue('Próximo lunes');
    await expect(form.locator('[name="dueAt"]')).toHaveValue('2099-09-01T10:00');
    await expect(form.locator('[name="status"]')).toHaveValue('published');

    const failedWrite = apiRequests.find((request) => request.method === 'POST');
    expect(failedWrite).toMatchObject({
      classId: 's5-a',
      authorization: 'Bearer pilot-editor-token',
      body: {
        action: 'task.upsert',
        course: 'Farmacología II',
        title: 'Trabajo que no debe borrarse',
        description: 'Conservar esta consigna después del error del servidor.',
        status: 'published'
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
    await classForm.getByRole('button', { name: 'Actualizar turma' }).click();
    await expect(page.locator('#classOutput')).toContainText('Turma actualizada');
    await expect(classForm.locator('[name="slug"]')).not.toHaveAttribute('readonly', '');

    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    page.once('dialog', (dialog) => dialog.accept());
    await targetCard.getByRole('button', { name: 'Archivar' }).click();
    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    await expect(targetCard).toContainText('ARCHIVADA');
    await expect(targetCard.getByRole('button', { name: 'Reactivar' })).toBeVisible();
    await expect(targetCard.getByRole('link', { name: 'Ver turma' })).toHaveCount(0);

    await targetCard.getByRole('button', { name: 'Reactivar' }).click();
    targetCard = page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 5.º A · Piloto' });
    await expect(targetCard).toContainText('ACTIVA');
    await expect(targetCard.getByRole('link', { name: 'Ver turma' })).toBeVisible();
    await expect(page.locator('#classList .manage-item').filter({ hasText: 'Medicina · 4.º E' }).getByRole('button', { name: 'Archivar' })).toHaveCount(0);

    expect(writes).toHaveLength(3);
    expect(writes.map((body) => [body.id, body.slug, body.status])).toEqual([
      ['s5-a', 's5-a', 'active'],
      ['s5-a', 's5-a', 'archived'],
      ['s5-a', 's5-a', 'active']
    ]);
  });

  test('keeps the service-worker shell generic and rejects external push targets', async () => {
    const source = readRepo('service-worker.js');
    const shellMatch = source.match(/const\s+SHELL\s*=\s*\[([\s\S]*?)\];/);
    expect(shellMatch).not.toBeNull();
    const shellEntries = [...shellMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(shellEntries).toEqual(expect.arrayContaining([
      '/offline.html',
      '/turma-shell/',
      '/turma-v471.css?v=471',
      '/turma-v471.js?v=471',
      '/turma-manifest-boot-v471.js?v=471'
    ]));
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

    expect(target('https://evil.example/turma/s5-a#tareas')).toBe('/turma/s4-e#inicio');
    expect(target('https://med.nykuto.com/gestion/s5-a')).toBe('/turma/s4-e#inicio');
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
