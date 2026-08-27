const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium, webkit } = require('playwright');

const root = path.resolve(__dirname, '..');
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const evidenceDir = path.join(root, 'test-results', 'notebook-audit');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp'
};
const publicData = {
  notices: [],
  tasks: [
    { id: 'epi-presentation', course: 'Epidemiología', title: 'Exposición grupal de enfermedad sorteada', status: 'published', dueLabel: 'Semana siguiente' },
    { id: 'bio-activities', course: 'Bioquímica II', title: 'Actividades 3 y 4 impresas y manuscritas', status: 'published', dueLabel: 'Práctico · presencia obligatoria' }
  ],
  activities: [], groups: [], files: [], dates: []
};

function expect(condition, message, failures) {
  if (!condition) failures.push(message);
}

function createServer() {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, baseUrl).pathname);
    if (pathname === '/api/class-hub') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify(publicData));
      return;
    }
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) {
      response.statusCode = 403;
      response.end('Forbidden');
      return;
    }
    fs.readFile(target, (error, content) => {
      if (error) {
        response.statusCode = 404;
        response.end('Not found');
        return;
      }
      response.setHeader('content-type', mimeTypes[path.extname(target)] || 'application/octet-stream');
      response.end(content);
    });
  });
}

async function inspectNotebook(browserType, width, failures, screenshots) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

  await page.goto(`${baseUrl}/clase.html#materias`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.academic-notebook-ready');
  const hub = await page.evaluate(() => {
    const selector = document.querySelector('.course-selector');
    return {
      subjects: selector.querySelectorAll('[data-course-target]').length,
      height: selector.getBoundingClientRect().height,
      driveCards: document.querySelectorAll('.class-drive-card').length,
      planLinks: document.querySelectorAll('[data-view-link="plan"]').length,
      bottomLinks: document.querySelectorAll('.mobile-bottom-nav a').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(hub.subjects === 6, `${browserType.name()} ${width}px: expected 6 subjects.`, failures);
  expect(hub.height <= (width <= 540 ? 175 : 235), `${browserType.name()} ${width}px: subject selector is too tall (${Math.round(hub.height)}px).`, failures);
  expect(hub.driveCards === 0, `${browserType.name()} ${width}px: Drive remains duplicated in Materias.`, failures);
  expect(hub.planLinks === 0, `${browserType.name()} ${width}px: completed seminar Plan remains in navigation.`, failures);
  expect(hub.bottomLinks === 5, `${browserType.name()} ${width}px: bottom navigation should contain 5 items.`, failures);
  expect(hub.overflow <= 1, `${browserType.name()} ${width}px: document overflows horizontally by ${hub.overflow}px.`, failures);

  await page.locator('[data-course-target="fisiologia"]').click();
  await page.waitForSelector('#fisiologia:not([hidden]) .notebook-shell');
  const physiology = await page.evaluate(() => {
    const subject = document.getElementById('fisiologia');
    const active = subject.querySelector(':scope > [data-lesson-panel]:not([hidden])');
    return {
      dates: subject.querySelectorAll('.notebook-date').length,
      selectedDate: subject.querySelector('.notebook-date[aria-current="date"] strong')?.textContent.trim(),
      selectedTitle: subject.querySelector('.notebook-current-title')?.textContent.trim(),
      chapterState: subject.querySelector('.chapter-state')?.textContent.trim(),
      heroVisible: Array.from(subject.querySelectorAll('.lesson-hero-2026')).some((node) => getComputedStyle(node).display !== 'none'),
      narrativeLessons: subject.querySelectorAll('[data-notebook-narrative="true"]').length,
      sections: active?.querySelectorAll('.course-chapter-section').length || 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  expect(physiology.dates === 5, `${browserType.name()} ${width}px: Physiology should expose 5 dates.`, failures);
  expect(physiology.selectedDate === '24 AGO.', `${browserType.name()} ${width}px: latest Physiology date is not selected.`, failures);
  expect(/Sensibilidades somáticas/.test(physiology.selectedTitle), `${browserType.name()} ${width}px: selected lesson title is missing.`, failures);
  expect(physiology.chapterState === 'Capítulo en curso', `${browserType.name()} ${width}px: chapter state is missing.`, failures);
  expect(!physiology.heroVisible, `${browserType.name()} ${width}px: redundant lesson hero is still visible.`, failures);
  expect(physiology.narrativeLessons === 5, `${browserType.name()} ${width}px: not all Physiology dates use narrative courses.`, failures);
  expect(physiology.sections >= 6, `${browserType.name()} ${width}px: active full course has fewer than 6 sequential sections.`, failures);
  expect(physiology.overflow <= 1, `${browserType.name()} ${width}px: notebook overflows horizontally by ${physiology.overflow}px.`, failures);

  await page.locator('#fisiologia .notebook-date').nth(2).click();
  expect(await page.locator('#fisiologia .notebook-date[aria-current="date"] strong').textContent() === '17 AGO.', `${browserType.name()} ${width}px: date navigation did not select 17 August.`, failures);
  expect(await page.locator('#fisiologia-2026-08-17 .course-chapter-section').count() >= 6, `${browserType.name()} ${width}px: the 17 August legacy course was not converted.`, failures);

  const compactViews = { themeMax: 0, fileMax: 0, modeMax: 0 };
  for (const mode of ['temas', 'archivos', 'progreso']) {
    await page.locator(`#fisiologia [data-notebook-mode="${mode}"]`).click();
    await page.waitForSelector('#fisiologia .notebook-view-panel:not([hidden])');
    const selector = mode === 'temas' ? '.notebook-chapter-row button' : mode === 'archivos' ? '.notebook-file-row' : '.notebook-progress-row';
    const measured = await page.evaluate(({ selector }) => Math.max(...Array.from(document.querySelectorAll(`#fisiologia ${selector}`)).map((node) => node.getBoundingClientRect().height), 0), { selector });
    if (mode === 'temas') compactViews.themeMax = measured;
    if (mode === 'archivos') compactViews.fileMax = measured;
  }
  compactViews.modeMax = await page.evaluate(() => Math.max(...Array.from(document.querySelectorAll('#fisiologia .notebook-modes button')).map((node) => node.getBoundingClientRect().height), 0));
  expect(compactViews.themeMax <= 48, `${browserType.name()} ${width}px: theme buttons are too tall (${compactViews.themeMax}px).`, failures);
  expect(compactViews.fileMax <= 54, `${browserType.name()} ${width}px: archive rows are too tall (${compactViews.fileMax}px).`, failures);
  expect(compactViews.modeMax <= 40, `${browserType.name()} ${width}px: notebook menu is too tall (${compactViews.modeMax}px).`, failures);

  await page.goto(`${baseUrl}/clase.html#pendientes`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#classHubLiveTasks');
  const tasks = await page.evaluate(() => ({
    active: document.querySelectorAll('#classHubLiveTasks .live-task').length,
    staleVisible: getComputedStyle(document.querySelector('.pending-grid')).display !== 'none',
    archiveVisible: getComputedStyle(document.querySelector('.assignment-archive')).display !== 'none',
    titles: Array.from(document.querySelectorAll('#classHubLiveTasks .live-task strong')).map((node) => node.textContent.trim())
  }));
  expect(tasks.active === 2, `${browserType.name()} ${width}px: expected 2 active API tasks, found ${tasks.active}.`, failures);
  expect(!tasks.staleVisible && !tasks.archiveVisible, `${browserType.name()} ${width}px: past static assignments remain visible.`, failures);
  expect(tasks.titles.some((title) => /Exposición grupal/.test(title)) && tasks.titles.some((title) => /Actividades 3 y 4/.test(title)), `${browserType.name()} ${width}px: new task titles are missing.`, failures);

  await page.goto(`${baseUrl}/profesores.html`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.teacher-card');
  const profiles = await page.evaluate(() => ({
    count: document.querySelectorAll('.teacher-card').length,
    evidence: document.querySelectorAll('.evidence-timeline article').length,
    prompts: document.querySelectorAll('.teacher-prompt').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(profiles.count === 6, `${browserType.name()} ${width}px: expected 6 teacher audits.`, failures);
  expect(profiles.evidence >= 21, `${browserType.name()} ${width}px: teacher evidence timeline is incomplete.`, failures);
  expect(profiles.prompts === 6, `${browserType.name()} ${width}px: each teacher needs a full prompt.`, failures);
  expect(profiles.overflow <= 1, `${browserType.name()} ${width}px: teacher page overflows by ${profiles.overflow}px.`, failures);

  await page.goto(`${baseUrl}/archivos.html`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.file-row');
  const archive = await page.evaluate(() => ({
    rows: document.querySelectorAll('.file-row').length,
    maxRow: Math.max(...Array.from(document.querySelectorAll('.file-row')).map((node) => node.getBoundingClientRect().height)),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  expect(archive.rows >= 17, `${browserType.name()} ${width}px: archive files are missing.`, failures);
  expect(archive.maxRow <= 52, `${browserType.name()} ${width}px: archive rows are too tall (${archive.maxRow}px).`, failures);
  expect(archive.overflow <= 1, `${browserType.name()} ${width}px: archive page overflows by ${archive.overflow}px.`, failures);

  if (screenshots && width === 390) {
    await page.goto(`${baseUrl}/clase.html#fisiologia-2026-08-20`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(evidenceDir, `med-notebook-${browserType.name()}-390.png`), fullPage: true });
    await page.goto(`${baseUrl}/profesores.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(evidenceDir, `med-professors-${browserType.name()}-390.png`), fullPage: true });
    await page.goto(`${baseUrl}/archivos.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(evidenceDir, `med-archives-${browserType.name()}-390.png`), fullPage: true });
  }

  expect(runtimeErrors.length === 0, `${browserType.name()} ${width}px: runtime errors: ${runtimeErrors.join(' | ')}`, failures);
  await browser.close();
}

async function main() {
  const failures = [];
  fs.mkdirSync(evidenceDir, { recursive: true });
  const server = createServer();
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  try {
    for (const width of [320, 375, 390, 430]) await inspectNotebook(chromium, width, failures, true);
    await inspectNotebook(webkit, 390, failures, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  if (failures.length) {
    console.error('Notebook UI audit failed:');
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }
  console.log('Notebook UI audit OK: Chromium 320/375/390/430 + WebKit 390, 6 compact subjects, 14 narrative lessons, 2 active tasks, 6 teacher audits, compact themes/files/progress and no horizontal overflow.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
