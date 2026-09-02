const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium, webkit } = require('playwright');

const root = path.resolve(__dirname, '..');
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const evidenceDir = path.join(root, 'test-results', 'notebook-audit');
const widths = [320, 375, 390, 430];
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
  tasks: [],
  activities: [],
  groups: [],
  members: [],
  files: [],
  dates: [],
  contentUpdatedAt: '2026-09-02T00:00:00-03:00',
  generatedAt: '2026-09-02T00:00:00-03:00'
};

function check(condition, message, failures) {
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

async function visibleCount(locator) {
  return locator.evaluateAll((nodes) => nodes.filter((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }).length);
}

async function inspectPhone(browserType, width, failures, screenshots) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/clase.html#materias`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.academic-notebook-ready');
  await page.waitForSelector('#materias', { state: 'visible' });

  const selectorState = await page.evaluate(() => {
    const hub = document.getElementById('materias');
    const cards = Array.from(hub.querySelectorAll('[data-course-target]'));
    const visibleSubjects = Array.from(document.querySelectorAll('.subject-section[data-view="cursos"]')).filter((subject) => {
      const style = getComputedStyle(subject);
      const rect = subject.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    });
    const visibleNav = Array.from(document.querySelectorAll('.workspace-nav > a')).filter((link) => getComputedStyle(link).display !== 'none');
    return {
      hubVisible: getComputedStyle(hub).display !== 'none',
      cards: cards.length,
      maxCardHeight: Math.max(...cards.map((card) => card.getBoundingClientRect().height), 0),
      visibleSubjects: visibleSubjects.length,
      visibleNav: visibleNav.length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  check(selectorState.hubVisible, `${browserType.name()} ${width}px: Materias is not visible as a selector.`, failures);
  check(selectorState.cards === 6, `${browserType.name()} ${width}px: expected six subject cards, received ${selectorState.cards}.`, failures);
  check(selectorState.maxCardHeight <= 72, `${browserType.name()} ${width}px: subject cards are too tall (${Math.round(selectorState.maxCardHeight)}px).`, failures);
  check(selectorState.visibleSubjects === 0, `${browserType.name()} ${width}px: a subject remains visible behind Materias.`, failures);
  check(selectorState.visibleNav === 4, `${browserType.name()} ${width}px: bottom navigation should expose four primary destinations.`, failures);
  check(selectorState.overflow <= 1, `${browserType.name()} ${width}px: Materias overflows horizontally by ${selectorState.overflow}px.`, failures);

  if (screenshots && width === 390) {
    await page.screenshot({ path: path.join(evidenceDir, `materias-${browserType.name()}-${width}.png`), fullPage: false });
  }

  await page.locator('[data-course-target="bioquimica"]').click();
  await page.waitForSelector('#bioquimica:not([hidden]) .notebook-shell');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('materias')).display === 'none');

  const subjectState = await page.evaluate(() => {
    const subject = document.getElementById('bioquimica');
    const activeLesson = subject.querySelector(':scope > [data-lesson-panel]:not([hidden])');
    const utilityButtons = Array.from(subject.querySelectorAll('.notebook-modes button'));
    const dateButtons = Array.from(subject.querySelectorAll('.notebook-date'));
    const lessonTabs = Array.from(activeLesson.querySelectorAll(':scope > [data-lesson-tabs] [data-lesson-tab]')).filter((button) => getComputedStyle(button).display !== 'none');
    const visualLabels = lessonTabs.map((button) => getComputedStyle(button, '::after').content.replace(/^"|"$/g, ''));
    const visibleSubjects = Array.from(document.querySelectorAll('.subject-section[data-view="cursos"]')).filter((item) => getComputedStyle(item).display !== 'none');
    const specialization = activeLesson.querySelector('[data-s4-specialization]');
    return {
      activeLesson: activeLesson && activeLesson.id,
      dates: dateButtons.length,
      maxDateWidth: Math.max(...dateButtons.map((button) => button.getBoundingClientRect().width), 0),
      maxDateHeight: Math.max(...dateButtons.map((button) => button.getBoundingClientRect().height), 0),
      utilities: utilityButtons.length,
      utilityMin: Math.min(...utilityButtons.map((button) => button.getBoundingClientRect().height), 999),
      utilityMax: Math.max(...utilityButtons.map((button) => button.getBoundingClientRect().height), 0),
      visibleTabs: lessonTabs.length,
      tabMin: Math.min(...lessonTabs.map((button) => button.getBoundingClientRect().height), 999),
      tabMax: Math.max(...lessonTabs.map((button) => button.getBoundingClientRect().height), 0),
      visualLabels,
      genericHeroVisible: Boolean(activeLesson.querySelector('[data-s4-course-hero]') && getComputedStyle(activeLesson.querySelector('[data-s4-course-hero]')).display !== 'none'),
      notionGuideVisible: Array.from(activeLesson.querySelectorAll('[data-s4-notion-guide]')).some((node) => getComputedStyle(node).display !== 'none'),
      specializationHeight: specialization ? specialization.getBoundingClientRect().height : 0,
      visibleSubjects: visibleSubjects.length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  check(subjectState.activeLesson === 'bioquimica-2026-08-28', `${browserType.name()} ${width}px: latest Bioquímica lesson is not selected.`, failures);
  check(subjectState.dates === 5, `${browserType.name()} ${width}px: Bioquímica should expose five dates.`, failures);
  check(subjectState.maxDateWidth <= 56 && subjectState.maxDateHeight <= 44, `${browserType.name()} ${width}px: date ribbon is not miniature (${Math.round(subjectState.maxDateWidth)}×${Math.round(subjectState.maxDateHeight)}px).`, failures);
  check(subjectState.utilities === 4, `${browserType.name()} ${width}px: subject utility menu should retain four functions.`, failures);
  check(subjectState.utilityMin >= 40 && subjectState.utilityMax <= 44, `${browserType.name()} ${width}px: subject utility hit areas should stay compact and usable (${subjectState.utilityMin}–${subjectState.utilityMax}px).`, failures);
  check(subjectState.visibleTabs === 4, `${browserType.name()} ${width}px: lesson workspace should expose four compact tabs.`, failures);
  check(subjectState.tabMin >= 43.5 && subjectState.tabMax <= 48, `${browserType.name()} ${width}px: lesson tab hit areas should be about 44px (${subjectState.tabMin}–${subjectState.tabMax}px).`, failures);
  check(subjectState.visualLabels.join('|') === 'Curso|Ficha|⚡|Quiz', `${browserType.name()} ${width}px: compact tab labels are ${subjectState.visualLabels.join(', ')}.`, failures);
  check(!subjectState.genericHeroVisible, `${browserType.name()} ${width}px: generic central-question hero still blocks the course.`, failures);
  check(!subjectState.notionGuideVisible, `${browserType.name()} ${width}px: duplicated meta-pedagogical guides remain visible.`, failures);
  check(subjectState.specializationHeight > 0 && subjectState.specializationHeight <= 240, `${browserType.name()} ${width}px: specialization map is not miniature (${Math.round(subjectState.specializationHeight)}px).`, failures);
  check(subjectState.visibleSubjects === 1, `${browserType.name()} ${width}px: more than one subject is visible.`, failures);
  check(subjectState.overflow <= 1, `${browserType.name()} ${width}px: subject workspace overflows horizontally by ${subjectState.overflow}px.`, failures);

  const targetDate = page.locator('#bioquimica .notebook-date[data-lesson-id="bioquimica-2026-08-26"]');
  await targetDate.click();
  await page.waitForSelector('#bioquimica-2026-08-26:not([hidden])');
  const figure = page.locator('#bioquimica-2026-08-26 [data-lesson-tab-panel="curso"] .course-inline-figure').first();
  await figure.waitFor({ state: 'visible' });
  await figure.scrollIntoViewIfNeeded();

  const thumbnail = await figure.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const trigger = node.querySelector('.course-inline-diagram-trigger').getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      triggerWidth: trigger.width,
      triggerHeight: trigger.height,
      left: box.left,
      right: box.right,
      viewport: innerWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  check(thumbnail.width <= 245 && thumbnail.height <= 190, `${browserType.name()} ${width}px: course diagram is not a thumbnail (${Math.round(thumbnail.width)}×${Math.round(thumbnail.height)}px).`, failures);
  check(thumbnail.triggerWidth >= 44 && thumbnail.triggerHeight >= 44, `${browserType.name()} ${width}px: diagram thumbnail is not safely tappable.`, failures);
  check(thumbnail.left >= -1 && thumbnail.right <= thumbnail.viewport + 1, `${browserType.name()} ${width}px: diagram thumbnail leaves the viewport.`, failures);
  check(thumbnail.overflow <= 1, `${browserType.name()} ${width}px: diagram thumbnail creates horizontal overflow.`, failures);

  await figure.locator('.course-inline-diagram-trigger').click();
  const dialog = page.locator('#courseDiagramDialog');
  await dialog.waitFor({ state: 'visible' });
  const dialogState = await dialog.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const controls = Array.from(node.querySelectorAll('button:not([hidden])')).map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      left: box.left,
      right: box.right,
      top: box.top,
      bottom: box.bottom,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
      controls
    };
  });
  check(dialogState.left >= -1 && dialogState.right <= dialogState.viewportWidth + 1 && dialogState.top >= -1 && dialogState.bottom <= dialogState.viewportHeight + 1, `${browserType.name()} ${width}px: enlarged diagram leaves the viewport.`, failures);
  check(dialogState.controls.length >= 2 && dialogState.controls.every((control) => control.width >= 44 && control.height >= 44), `${browserType.name()} ${width}px: enlarged diagram controls are smaller than 44px.`, failures);
  await dialog.locator('.course-diagram-close').click();
  await dialog.waitFor({ state: 'hidden' });

  if (screenshots && width === 390) {
    await page.screenshot({ path: path.join(evidenceDir, `bioquimica-26-${browserType.name()}-${width}.png`), fullPage: false });
  }

  await page.locator('.workspace-nav [data-view-link="cursos"]').click();
  await page.waitForSelector('#materias', { state: 'visible' });
  const returnState = await page.evaluate(() => ({
    subjectsVisible: Array.from(document.querySelectorAll('.subject-section[data-view="cursos"]')).filter((subject) => getComputedStyle(subject).display !== 'none').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  check(returnState.subjectsVisible === 0, `${browserType.name()} ${width}px: returning to Materias leaves a subject visible.`, failures);
  check(returnState.overflow <= 1, `${browserType.name()} ${width}px: returning to Materias causes horizontal overflow.`, failures);

  check(runtimeErrors.length === 0, `${browserType.name()} ${width}px: runtime errors: ${runtimeErrors.join(' | ')}`, failures);
  await browser.close();
}

async function main() {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  const failures = [];
  try {
    for (const browserType of [chromium, webkit]) {
      for (const width of widths) {
        await inspectPhone(browserType, width, failures, true);
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  if (failures.length) {
    console.error('Mobile notebook audit failed:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
  console.log('Mobile notebook audit passed for Chromium and WebKit at 320, 375, 390 and 430 px.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
