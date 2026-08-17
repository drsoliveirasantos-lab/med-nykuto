module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('class schedule shows the complete four-day mini-week on iPhone', async ({ page }) => {
    await page.goto('/clase.html#horario', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible({ timeout: 10000 });

    const layout = await page.evaluate(() => {
      const grid = document.querySelector('#weeklyAgenda').getBoundingClientRect();
      const days = Array.from(document.querySelectorAll('.agenda-day')).map(day => day.getBoundingClientRect());
      const firstSlot = document.querySelector('.schedule-slot').getBoundingClientRect();
      const firstTeacher = document.querySelector('.schedule-slot small');
      const axis = document.querySelector('.schedule-time-axis');
      const sevenStarts = Array.from(document.querySelectorAll('.schedule-slot[data-start="07:00"]')).map(slot => slot.getBoundingClientRect().top);
      const firstAtSeven = document.querySelector('.schedule-slot[data-start="07:00"]').getBoundingClientRect();
      const firstAtNineTen = document.querySelector('.agenda-day[data-schedule-day="3"] .schedule-slot[data-start="09:10"]').getBoundingClientRect();
      const mondayFirst = document.querySelector('.agenda-day[data-schedule-day="1"] .schedule-slot[data-start="07:00"]').getBoundingClientRect();
      const mondaySecond = document.querySelector('.agenda-day[data-schedule-day="1"] .schedule-slot[data-start="10:10"]').getBoundingClientRect();
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
        axisDisplay: getComputedStyle(axis).display,
        axisLabels: axis.querySelectorAll('span').length,
        sevenStartSpread: Math.max(...sevenStarts) - Math.min(...sevenStarts),
        nineTenOffset: firstAtNineTen.top - firstAtSeven.top,
        consecutiveGap: Math.abs(mondaySecond.top - mondayFirst.bottom),
        switcherTop: switcher.top,
        switcherBottom: switcher.bottom,
        headerTop: header.top,
        headerBottom: header.bottom,
        highlightedDate: highlighted ? highlighted.getAttribute('datetime') : null,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(layout.columnCount).toBe(5);
    expect(layout.visibleDays).toBe(4);
    expect(layout.alignedDayTops).toBe(1);
    expect(layout.gridHeight).toBeLessThan(340);
    expect(layout.gridBottom).toBeLessThanOrEqual(layout.summaryTop);
    expect(layout.slotHeight).toBeLessThan(125);
    expect(layout.teacherDisplay).toBe('none');
    expect(layout.axisDisplay).toBe('block');
    expect(layout.axisLabels).toBe(14);
    expect(layout.sevenStartSpread).toBeLessThanOrEqual(1);
    expect(layout.nineTenOffset).toBeGreaterThan(40);
    expect(layout.consecutiveGap).toBeLessThanOrEqual(1);
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
};
