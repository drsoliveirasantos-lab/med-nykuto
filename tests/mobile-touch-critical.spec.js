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
