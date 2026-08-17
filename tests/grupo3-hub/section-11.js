module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica-2026-08-10');
    const quickView = page.locator('#microbiologia-teorica [data-micro-theory-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Dermatofitosis en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('saves a simple preparation checklist', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const firstTask = page.locator('#studyChecklist input').first();
    await firstTask.check();
    await expect(page.locator('#planCount')).toHaveText('1/6');
    await page.reload();
    await expect(firstTask).toBeChecked();
  });

  test('keeps the page inside the viewport', async ({ page }) => {
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('shows the persistent mobile navigation only on a phone-sized viewport', async ({ page }, testInfo) => {
    const bottomNavigation = page.locator('.mobile-bottom-nav');
    if (testInfo.project.name === 'mobile-safari-shape') {
      await expect(bottomNavigation).toBeVisible();
      await expect(bottomNavigation.getByRole('link')).toHaveCount(6);
      await expect(bottomNavigation.getByRole('link', { name: 'Plan' })).toBeVisible();
      await expect(page.locator('.header-back')).toBeHidden();
      await expect(page.locator('.workspace-nav')).toBeHidden();

      const mobileLayout = await page.evaluate(() => {
        const next = document.querySelector('.dashboard-next').getBoundingClientRect();
        const switcher = document.querySelector('#semesterSwitcherV402').getBoundingClientRect();
        const bottom = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
        return {
          viewportHeight: window.innerHeight,
          nextTop: next.top,
          switcherWidth: switcher.width,
          switcherBottom: switcher.bottom,
          bottomTop: bottom.top
        };
      });
      expect(mobileLayout.nextTop).toBeLessThan(mobileLayout.viewportHeight * 0.78);
      expect(mobileLayout.switcherWidth).toBeLessThanOrEqual(160);
      expect(mobileLayout.switcherBottom).toBeLessThanOrEqual(mobileLayout.bottomTop);
    } else {
      await expect(bottomNavigation).toBeHidden();
    }
  });

  test('renders the phone timetable as a four-day mini-week aligned to a real hour ruler', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-safari-shape', 'Mobile layout assertion');
    await page.goto('/clase.html#horario');
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
        columnCount:getComputedStyle(document.querySelector('#weeklyAgenda')).gridTemplateColumns.split(' ').length,
        visibleDays:days.filter(day => day.width > 0 && day.height > 0).length,
        alignedDayTops:new Set(days.map(day => Math.round(day.top))).size,
        gridHeight:grid.height,
        gridBottom:grid.bottom,
        summaryTop:summary.top,
        slotHeight:firstSlot.height,
        teacherDisplay:getComputedStyle(firstTeacher).display,
        axisDisplay:getComputedStyle(axis).display,
        axisLabels:axis.querySelectorAll('span').length,
        sevenStartSpread:Math.max(...sevenStarts) - Math.min(...sevenStarts),
        nineTenOffset:firstAtNineTen.top - firstAtSeven.top,
        consecutiveGap:Math.abs(mondaySecond.top - mondayFirst.bottom),
        switcherTop:switcher.top,
        switcherBottom:switcher.bottom,
        headerTop:header.top,
        headerBottom:header.bottom,
        highlightedDate:highlighted ? highlighted.getAttribute('datetime') : null,
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth
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
};
