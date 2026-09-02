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
  notices: [], tasks: [], activities: [], groups: [], members: [], files: [], dates: [],
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

async function visibleNodes(locator) {
  return locator.evaluateAll((nodes) => nodes.filter((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.05;
  }).length);
}

async function inspectPhone(browserType, width, failures) {
  const browserName = browserType.name();
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

  const subjectCards = page.locator('#materias [data-course-target]');
  const selectorState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#materias [data-course-target]'));
    const visibleSubjects = Array.from(document.querySelectorAll('.subject-section[data-view="cursos"]')).filter((subject) => {
      const rect = subject.getBoundingClientRect();
      const style = getComputedStyle(subject);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const nav = document.querySelector('.mobile-bottom-nav');
    const help = document.querySelector('.helpdesk-fab');
    const helpStyle = help ? getComputedStyle(help) : null;
    const helpRect = help ? help.getBoundingClientRect() : null;
    return {
      cardCount: cards.length,
      columns: getComputedStyle(document.querySelector('#materias .course-selector')).gridTemplateColumns.split(' ').length,
      maxCardHeight: Math.max(...cards.map((card) => card.getBoundingClientRect().height), 0),
      visibleSubjects: visibleSubjects.length,
      navCount: nav ? nav.querySelectorAll('a').length : 0,
      navHeight: nav ? nav.getBoundingClientRect().height : 0,
      helpVisible: Boolean(help && helpRect.width > 0 && helpRect.height > 0 && helpStyle.display !== 'none' && helpStyle.visibility !== 'hidden' && Number(helpStyle.opacity || 1) > 0.05),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  check(selectorState.cardCount === 6, `${browserName} ${width}px: expected six subject cards.`, failures);
  check(selectorState.columns === 2, `${browserName} ${width}px: Materias should use two scan-friendly columns.`, failures);
  check(selectorState.maxCardHeight <= 72, `${browserName} ${width}px: subject cards are too tall (${Math.round(selectorState.maxCardHeight)}px).`, failures);
  check(selectorState.visibleSubjects === 0, `${browserName} ${width}px: a subject remains visible behind Materias.`, failures);
  check(selectorState.navCount === 5 && selectorState.navHeight >= 56, `${browserName} ${width}px: the compatible mobile navigation DOM is not intact.`, failures);
  check(!selectorState.helpVisible, `${browserName} ${width}px: floating help still competes with the Materias selector.`, failures);
  check(selectorState.overflow <= 1, `${browserName} ${width}px: Materias overflows by ${selectorState.overflow}px.`, failures);

  if (width === 390) {
    await page.screenshot({ path: path.join(evidenceDir, `materias-${browserName}-${width}.png`), fullPage: false });
  }

  await subjectCards.filter({ has: page.locator('[data-course-target="bioquimica"]') }).count().catch(() => 0);
  await page.locator('[data-course-target="bioquimica"]').click();
  await page.waitForSelector('#bioquimica:not([hidden]) .notebook-shell');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('materias')).display === 'none');

  const subjectState = await page.evaluate(() => {
    const subject = document.getElementById('bioquimica');
    const lesson = subject.querySelector(':scope > [data-lesson-panel]:not([hidden])');
    const utilities = Array.from(subject.querySelectorAll('.notebook-modes button'));
    const dates = Array.from(subject.querySelectorAll('.notebook-date'));
    const allTabs = Array.from(lesson.querySelectorAll(':scope > [data-lesson-tabs] [data-lesson-tab]'));
    const tabs = allTabs.filter((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.05;
    });
    const specialization = lesson.querySelector('[data-s4-specialization]');
    const tabBar = lesson.querySelector(':scope > [data-lesson-tabs]');
    const appHeader = document.querySelector('.class-header');
    return {
      lessonId: lesson && lesson.id,
      utilityColumns: getComputedStyle(subject.querySelector('.notebook-modes')).gridTemplateColumns.split(' ').length,
      utilityHeights: utilities.map((button) => button.getBoundingClientRect().height),
      dates: dates.length,
      dateHeights: dates.map((button) => button.getBoundingClientRect().height),
      stableTabIds: allTabs.map((button) => button.dataset.lessonTab),
      tabs: tabs.map((button) => ({
        id: button.dataset.lessonTab,
        height: button.getBoundingClientRect().height,
        label: getComputedStyle(button, '::after').content.replace(/^"|"$/g, '')
      })),
      tabTop: tabBar ? tabBar.getBoundingClientRect().top : -1,
      headerBottom: appHeader ? appHeader.getBoundingClientRect().bottom : -1,
      heroVisible: Boolean(lesson.querySelector('[data-s4-course-hero]') && getComputedStyle(lesson.querySelector('[data-s4-course-hero]')).display !== 'none'),
      guideVisible: Array.from(lesson.querySelectorAll('[data-s4-notion-guide]')).some((node) => getComputedStyle(node).display !== 'none'),
      specializationHeight: specialization ? specialization.getBoundingClientRect().height : 0,
      visibleSubjects: Array.from(document.querySelectorAll('.subject-section[data-view="cursos"]')).filter((node) => getComputedStyle(node).display !== 'none').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  check(subjectState.lessonId === 'bioquimica-2026-08-28', `${browserName} ${width}px: latest Bioquímica lesson is not selected.`, failures);
  check(subjectState.utilityColumns === 4, `${browserName} ${width}px: subject utilities are not a four-column miniature grid.`, failures);
  check(subjectState.utilityHeights.every((height) => height >= 43.5 && height <= 45), `${browserName} ${width}px: utility hit areas are not 44px.`, failures);
  check(subjectState.dates === 5 && subjectState.dateHeights.every((height) => height >= 43.5 && height <= 45), `${browserName} ${width}px: date ribbon is not a compact 44px row.`, failures);
  check(subjectState.stableTabIds.join('|') === 'curso|rapida|ultra|training|material|ia', `${browserName} ${width}px: stable lesson ids changed (${subjectState.stableTabIds.join(', ')}).`, failures);
  check(subjectState.tabs.length === 5, `${browserName} ${width}px: expected five visible lesson choices before opening secondary tools.`, failures);
  check(subjectState.tabs.every((tab) => tab.height >= 43.5 && tab.height <= 45), `${browserName} ${width}px: lesson hit areas are not 44px.`, failures);
  check(subjectState.tabs.map((tab) => tab.id).join('|') === 'curso|rapida|ultra|training|material', `${browserName} ${width}px: visible lesson order is ${subjectState.tabs.map((tab) => tab.id).join(', ')}.`, failures);
  check(subjectState.tabs.map((tab) => tab.label).join('|') === 'Curso|Ficha|⚡|Quiz|⋯', `${browserName} ${width}px: compact labels are ${subjectState.tabs.map((tab) => tab.label).join(', ')}.`, failures);
  check(Math.abs(subjectState.tabTop - subjectState.headerBottom) <= 8, `${browserName} ${width}px: lesson bar is not consolidated directly below the app header (${Math.round(subjectState.tabTop)} vs ${Math.round(subjectState.headerBottom)}).`, failures);
  check(!subjectState.heroVisible && !subjectState.guideVisible, `${browserName} ${width}px: meta-pedagogical blocks still dominate the first screen.`, failures);
  check(subjectState.specializationHeight > 0 && subjectState.specializationHeight <= 240, `${browserName} ${width}px: specialization is not miniature (${Math.round(subjectState.specializationHeight)}px).`, failures);
  check(subjectState.visibleSubjects === 1, `${browserName} ${width}px: more than one subject is visible.`, failures);
  check(subjectState.overflow <= 1, `${browserName} ${width}px: subject workspace overflows by ${subjectState.overflow}px.`, failures);

  const activeLesson = page.locator('#bioquimica-2026-08-28');
  await activeLesson.locator('[data-lesson-tab="material"]').click();
  await activeLesson.locator('[data-lesson-tab-panel="material"]').waitFor({ state: 'visible' });
  const iaState = await activeLesson.locator('[data-lesson-tab="ia"]').evaluate((button) => {
    const rect = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    return {
      visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.05,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      label: getComputedStyle(button, '::after').content.replace(/^"|"$/g, '')
    };
  });
  check(iaState.visible && iaState.height >= 43.5 && iaState.width >= 100, `${browserName} ${width}px: Tutor IA is not exposed as a safe contextual action.`, failures);
  check(iaState.left >= -1 && iaState.right <= width + 1, `${browserName} ${width}px: Tutor IA popover leaves the viewport.`, failures);
  check(iaState.label === 'Tutor IA', `${browserName} ${width}px: Tutor IA contextual label is ${iaState.label}.`, failures);
  if (iaState.visible) {
    await activeLesson.locator('[data-lesson-tab="ia"]').click();
    await activeLesson.locator('[data-lesson-tab-panel="ia"]').waitFor({ state: 'visible' });
  }
  await activeLesson.locator('[data-lesson-tab="curso"]').click();

  await page.locator('#bioquimica .notebook-date[data-lesson-id="bioquimica-2026-08-26"]').click();
  await page.waitForSelector('#bioquimica-2026-08-26:not([hidden])');
  const figure = page.locator('#bioquimica-2026-08-26 [data-lesson-tab-panel="curso"] .course-inline-figure').first();
  await figure.waitFor({ state: 'visible' });
  await figure.scrollIntoViewIfNeeded();
  const thumbnail = await figure.evaluate((node) => {
    const trigger = node.querySelector('.course-inline-diagram-trigger').getBoundingClientRect();
    return {
      triggerWidth: trigger.width,
      triggerHeight: trigger.height,
      left: trigger.left,
      right: trigger.right,
      viewport: innerWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  check(thumbnail.triggerWidth <= 245 && thumbnail.triggerHeight <= 140, `${browserName} ${width}px: course diagram is not a thumbnail (${Math.round(thumbnail.triggerWidth)}×${Math.round(thumbnail.triggerHeight)}px).`, failures);
  check(thumbnail.triggerWidth >= 44 && thumbnail.triggerHeight >= 44, `${browserName} ${width}px: diagram thumbnail is not safely tappable.`, failures);
  check(thumbnail.left >= -1 && thumbnail.right <= thumbnail.viewport + 1 && thumbnail.overflow <= 1, `${browserName} ${width}px: diagram thumbnail leaves the viewport.`, failures);

  await figure.locator('.course-inline-diagram-trigger').click();
  const dialog = page.locator('#courseDiagramDialog');
  await dialog.waitFor({ state: 'visible' });
  const dialogState = await dialog.evaluate((node) => {
    const box = node.getBoundingClientRect();
    const controls = Array.from(node.querySelectorAll('button:not([hidden])')).map((button) => button.getBoundingClientRect());
    return {
      inside: box.left >= -1 && box.right <= innerWidth + 1 && box.top >= -1 && box.bottom <= innerHeight + 1,
      controlsUsable: controls.length >= 2 && controls.every((rect) => rect.width >= 44 && rect.height >= 44)
    };
  });
  check(dialogState.inside && dialogState.controlsUsable, `${browserName} ${width}px: enlarged diagram or its controls are outside the usable viewport.`, failures);
  await dialog.locator('.course-diagram-close').click();

  if (width === 390) {
    await page.screenshot({ path: path.join(evidenceDir, `bioquimica-26-${browserName}-${width}.png`), fullPage: false });
  }

  await page.locator('.mobile-bottom-nav [data-view-link="cursos"]').click();
  await page.waitForSelector('#materias', { state: 'visible' });
  check(await visibleNodes(page.locator('.subject-section[data-view="cursos"]')) === 0, `${browserName} ${width}px: returning to Materias leaves a subject visible.`, failures);
  check(await visibleNodes(page.locator('.helpdesk-fab')) === 0, `${browserName} ${width}px: floating help returns over the Materias selector.`, failures);
  check(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1, `${browserName} ${width}px: returning to Materias creates overflow.`, failures);
  check(runtimeErrors.length === 0, `${browserName} ${width}px: runtime errors: ${runtimeErrors.join(' | ')}`, failures);

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
      for (const width of widths) await inspectPhone(browserType, width, failures);
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
