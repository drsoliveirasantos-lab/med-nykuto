const { test, expect } = require('@playwright/test');

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerFirstVisibleOption(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
}

async function dismissSemesterPicker(page) {
  const modal = page.locator('#homeSemesterModal.open');
  const opened = await modal.waitFor({ state: 'visible', timeout: 1500 }).then(() => true).catch(() => false);
  if (!opened) return;
  await modal.locator('[data-semester-select="s3"]').click();
  await expect(modal).toBeHidden({ timeout: 5000 });
}

test.describe('Mobile critical paths', () => {
  test('class schedule shows the complete four-day mini-week on iPhone', async ({ page }) => {
    await page.goto('/clase.html#horario', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible({ timeout: 10000 });

    const layout = await page.evaluate(() => {
      const grid = document.querySelector('#weeklyAgenda').getBoundingClientRect();
      const days = Array.from(document.querySelectorAll('.agenda-day')).map(day => day.getBoundingClientRect());
      const firstSlot = document.querySelector('.schedule-slot').getBoundingClientRect();
      const firstTeacher = document.querySelector('.schedule-slot small');
      const summary = document.querySelector('.agenda-summary').getBoundingClientRect();
      const switcher = document.querySelector('#semesterSwitcherV402').getBoundingClientRect();
      const header = document.querySelector('.class-header').getBoundingClientRect();
      const highlighted = document.querySelector('.agenda-day.is-next-day [data-week-date]');
      return {
        columnCount: getComputedStyle(document.querySelector('#weeklyAgenda')).gridTemplateColumns.split(' ').length,
        visibleDays: days.filter(day => day.width > 0 && day.height > 0).length,
        alignedDayTops: new Set(days.map(day => Math.round(day.top))).size,
        gridHeight: grid.height,
        gridBottom: grid.bottom,
        summaryTop: summary.top,
        slotHeight: firstSlot.height,
        teacherDisplay: getComputedStyle(firstTeacher).display,
        switcherTop: switcher.top,
        switcherBottom: switcher.bottom,
        headerTop: header.top,
        headerBottom: header.bottom,
        highlightedDate: highlighted ? highlighted.getAttribute('datetime') : null,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(layout.columnCount).toBe(4);
    expect(layout.visibleDays).toBe(4);
    expect(layout.alignedDayTops).toBe(1);
    expect(layout.gridHeight).toBeLessThan(340);
    expect(layout.gridBottom).toBeLessThanOrEqual(layout.summaryTop);
    expect(layout.slotHeight).toBeLessThan(125);
    expect(layout.teacherDisplay).toBe('none');
    expect(layout.switcherTop).toBeGreaterThanOrEqual(layout.headerTop);
    expect(layout.switcherBottom).toBeLessThanOrEqual(layout.headerBottom + 1);
    expect(layout.highlightedDate).toMatch(/^2026-\d{2}-\d{2}$/);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    await expect(page.locator('.schedule-slot[data-subject]')).toHaveCount(10);
    await expect(page.locator('.agenda-day')).toHaveCount(4);
    await expect(page.locator('#weeklyAgenda .schedule-task-badge')).toHaveCount(5);
  });

  test('current assignments form a compact inline accordion on iPhone', async ({ page }) => {
    await page.goto('/clase.html#pendientes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Tareas de la clase' })).toBeVisible({ timeout: 10000 });

    const assignments = page.locator('[data-current-assignment]');
    const summaries = page.locator('[data-current-assignment] > summary');
    await expect(assignments).toHaveCount(5);
    await expect(summaries).toHaveCount(5);
    await expect(page.locator('.current-assignment-meta > b')).toHaveCount(5);
    await expect(page.locator('.current-assignment-date > strong')).toHaveCount(5);
    await expect(page.locator('.current-assignment-copy > [role="heading"]')).toHaveCount(5);

    const layout = await page.evaluate(() => {
      const list = document.querySelector('.pending-grid').getBoundingClientRect();
      const rows = Array.from(document.querySelectorAll('[data-current-assignment] > summary')).map(summary => summary.getBoundingClientRect());
      return {
        maxRowHeight: Math.max(...rows.map(row => row.height)),
        listHeight: list.height,
        openCount: document.querySelectorAll('[data-current-assignment][open]').length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(layout.maxRowHeight).toBeLessThan(120);
    expect(layout.listHeight).toBeLessThan(620);
    expect(layout.openCount).toBe(0);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);

    const nutrition = page.locator('#nutritionPrepCard');
    const microbiology = page.locator('#microTheoryPrepCard');
    await nutrition.locator(':scope > summary').click();
    await expect(nutrition).toHaveAttribute('open', '');
    await expect(nutrition.locator('.current-assignment-body')).toBeVisible();
    await microbiology.locator(':scope > summary').click();
    await expect(microbiology).toHaveAttribute('open', '');
    await expect(nutrition).not.toHaveAttribute('open', '');
  });

  test('dashboard, subjects, training and seminar plan use a tablet-like compact density', async ({ page }) => {
    await page.goto('/clase.html#inicio', { waitUntil: 'domcontentloaded' });
    const dashboard = await page.evaluate(() => {
      const panel = document.querySelector('.class-dashboard').getBoundingClientRect();
      const title = document.querySelector('.dashboard-heading h1');
      const navItem = document.querySelector('.mobile-bottom-nav a').getBoundingClientRect();
      return {
        height:panel.height,
        titleSize:parseFloat(getComputedStyle(title).fontSize),
        navHeight:navItem.height,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(dashboard.height).toBeLessThan(720);
    expect(dashboard.titleSize).toBeLessThan(32);
    expect(dashboard.navHeight).toBeGreaterThanOrEqual(56);
    expect(dashboard.navHeight).toBeLessThanOrEqual(62);
    expect(dashboard.overflow).toBeLessThanOrEqual(1);

    await page.goto('/clase.html#materias', { waitUntil: 'domcontentloaded' });
    const library = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.course-selector > a')).map(card => card.getBoundingClientRect());
      return {
        columns:getComputedStyle(document.querySelector('.course-selector')).gridTemplateColumns.split(' ').length,
        firstRowTops:new Set(cards.slice(0,2).map(card => Math.round(card.top))).size,
        maxCardHeight:Math.max(...cards.map(card => card.height)),
        gridHeight:document.querySelector('.course-selector').getBoundingClientRect().height,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(library.columns).toBe(2);
    expect(library.firstRowTops).toBe(1);
    expect(library.maxCardHeight).toBeLessThan(95);
    expect(library.gridHeight).toBeLessThan(270);
    expect(library.overflow).toBeLessThanOrEqual(1);

    await page.goto('/clase.html#nutricion', { waitUntil: 'domcontentloaded' });
    const course = await page.evaluate(() => {
      const resources = Array.from(document.querySelectorAll('#nutricion .resource-card')).map(card => card.getBoundingClientRect());
      const counts = Array.from(document.querySelectorAll('#practice-nutricion .practice-counts > span')).map(item => item.getBoundingClientRect());
      return {
        resourceColumns:getComputedStyle(document.querySelector('#nutricion .resource-grid')).gridTemplateColumns.split(' ').length,
        resourceMaxHeight:Math.max(...resources.map(card => card.height)),
        countTops:new Set(counts.map(item => Math.round(item.top))).size,
        countMaxHeight:Math.max(...counts.map(item => item.height)),
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(course.resourceColumns).toBe(2);
    expect(course.resourceMaxHeight).toBeLessThan(105);
    expect(course.countTops).toBe(1);
    expect(course.countMaxHeight).toBeLessThan(48);
    expect(course.overflow).toBeLessThanOrEqual(1);

    const map = await page.evaluate(() => {
      const list = document.querySelector('#nutricion .study-map');
      const rows = Array.from(list.querySelectorAll(':scope > li'));
      const summaries = rows.map(row => row.querySelector('summary').getBoundingClientRect());
      const nav = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
      const navItems = Array.from(document.querySelectorAll('.mobile-bottom-nav a')).map(item => item.getBoundingClientRect());
      const navIcon = document.querySelector('.mobile-bottom-nav .nav-icon svg').getBoundingClientRect();
      return {
        rowCount:rows.length,
        maxClosedRowHeight:Math.max(...rows.map(row => row.getBoundingClientRect().height)),
        maxSummaryHeight:Math.max(...summaries.map(summary => summary.height)),
        listHeight:list.getBoundingClientRect().height,
        navHeight:nav.height,
        navItemMinHeight:Math.min(...navItems.map(item => item.height)),
        navIconWidth:navIcon.width,
        bodyBottomPadding:parseFloat(getComputedStyle(document.body).paddingBottom),
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(map.rowCount).toBeGreaterThanOrEqual(5);
    expect(map.maxClosedRowHeight).toBeLessThan(80);
    expect(map.maxSummaryHeight).toBeLessThan(80);
    expect(map.listHeight).toBeLessThan(460);
    expect(map.navHeight).toBeGreaterThanOrEqual(56);
    expect(map.navItemMinHeight).toBeGreaterThanOrEqual(56);
    expect(map.navIconWidth).toBeGreaterThanOrEqual(19);
    expect(map.bodyBottomPadding).toBeGreaterThanOrEqual(map.navHeight + 12);
    expect(map.overflow).toBeLessThanOrEqual(1);

    const firstMapAnswer = page.locator('#nutricion .study-map .preview-answer-disclosure').first();
    const closedHeight = await firstMapAnswer.evaluate(node => node.parentElement.getBoundingClientRect().height);
    await firstMapAnswer.locator(':scope > summary').click();
    await expect(firstMapAnswer).toHaveAttribute('open', '');
    await expect(firstMapAnswer.locator('.preview-answer-inline')).toBeVisible();
    const openHeight = await firstMapAnswer.evaluate(node => node.parentElement.getBoundingClientRect().height);
    expect(openHeight).toBeGreaterThan(closedHeight);
    await firstMapAnswer.locator(':scope > summary').click();
    await expect(firstMapAnswer).not.toHaveAttribute('open', '');

    await page.goto('/clase.html#plan-estudio', { waitUntil: 'domcontentloaded' });
    const plan = await page.evaluate(() => {
      const deliverables = Array.from(document.querySelectorAll('.plan-deliverables article')).map(item => item.getBoundingClientRect());
      const checklist = Array.from(document.querySelectorAll('.study-checklist label')).map(item => item.getBoundingClientRect());
      return {
        photoHeight:document.querySelector('.plan-seminar-photo').getBoundingClientRect().height,
        deliverableTops:new Set(deliverables.map(item => Math.round(item.top))).size,
        checklistFirstRow:new Set(checklist.slice(0,2).map(item => Math.round(item.top))).size,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(plan.photoHeight).toBeLessThan(200);
    expect(plan.deliverableTops).toBe(1);
    expect(plan.checklistFirstRow).toBe(1);
    expect(plan.overflow).toBeLessThanOrEqual(1);

    await page.locator('#plan-estudio').getByRole('link', { name: 'Ver instructivo', exact: true }).click();
    const modal = page.locator('#seminarDocumentPreview');
    await expect(modal).toBeVisible();
    const modalLayout = await modal.evaluate((node) => {
      const close = node.querySelector('[data-document-preview-close]').getBoundingClientRect();
      const box = node.getBoundingClientRect();
      return {width:box.width,height:box.height,closeWidth:close.width,closeHeight:close.height,viewportWidth:innerWidth,viewportHeight:innerHeight};
    });
    expect(modalLayout.width).toBeLessThanOrEqual(modalLayout.viewportWidth);
    expect(modalLayout.height).toBeLessThanOrEqual(modalLayout.viewportHeight);
    expect(modalLayout.closeWidth).toBeGreaterThanOrEqual(44);
    expect(modalLayout.closeHeight).toBeGreaterThanOrEqual(44);
  });

  test('mobile navigation and practice controls remain usable', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await dismissSemesterPicker(page);
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click({ force: true });
    await expect(page.locator('#navLinks a[href="qcm.html"], .nav-links a[href="qcm.html"]').first()).toBeVisible({ timeout: 10000 });

    await openPractice(page, '/qcm.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 8000 });
    const qcmNext = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(qcmNext).toBeVisible({ timeout: 5000 });
    await qcmNext.click({ force: true });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 8000 });

    await openPractice(page, '/cas-cliniques.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    const casePanel = page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first();
    await expect(casePanel).toBeVisible({ timeout: 8000 });
    const summary = casePanel.locator('details summary').first();
    if (await summary.isVisible().catch(() => false)) {
      await summary.click({ force: true });
      await expect(page.locator('#practiceList .single-question-card')).toBeVisible({ timeout: 5000 });
    }
  });
});
