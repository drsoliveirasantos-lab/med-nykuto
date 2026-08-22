module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('dashboard, subjects, training and seminar plan use a tablet-like compact density', async ({ page }) => {
    await page.goto('/clase.html#inicio', { waitUntil: 'domcontentloaded' });
    const dashboard = await page.evaluate(() => {
      const panel = document.querySelector('.class-dashboard').getBoundingClientRect();
      const title = document.querySelector('.dashboard-heading h1');
      const navItem = document.querySelector('.mobile-bottom-nav a').getBoundingClientRect();
      const prioritiesGrid = document.querySelector('.dashboard-priorities');
      const prioritiesGridRect = prioritiesGrid.getBoundingClientRect();
      const priorities = Array.from(prioritiesGrid.querySelectorAll('.priority-card')).map((card) => {
        const rect = card.getBoundingClientRect();
        return { left:rect.left, right:rect.right, width:rect.width };
      });
      return {
        height:panel.height,
        titleSize:parseFloat(getComputedStyle(title).fontSize),
        navHeight:navItem.height,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
        columns:getComputedStyle(prioritiesGrid).gridTemplateColumns.split(' ').length,
        priorities,
        prioritiesGrid:{ left:prioritiesGridRect.left, right:prioritiesGridRect.right, width:prioritiesGridRect.width },
        appBottomPadding:parseFloat(getComputedStyle(document.querySelector('.class-app')).paddingBottom),
        homeworkTitle:document.querySelector('.dashboard-week-heading span').textContent.trim(),
        homeworkCount:document.getElementById('homeHomeworkCount').textContent.trim(),
        homeworkDates:Array.from(prioritiesGrid.querySelectorAll('.priority-card time')).map(function(time){return time.dateTime;})
      };
    });
    expect(dashboard.height).toBeLessThan(720);
    expect(dashboard.titleSize).toBeLessThan(32);
    expect(dashboard.navHeight).toBeGreaterThanOrEqual(54);
    expect(dashboard.navHeight).toBeLessThanOrEqual(62);
    expect(dashboard.overflow).toBeLessThanOrEqual(1);
    expect(dashboard.columns).toBe(2);
    expect(dashboard.appBottomPadding).toBeLessThanOrEqual(12);
    expect(dashboard.homeworkTitle).toBe('PARA ESTA SEMANA');
    expect(dashboard.homeworkCount).toBe('2 tareas activas');
    expect(dashboard.homeworkDates).toContain('2026-08-21T09:10:00-03:00');
    expect(dashboard.homeworkDates.every(Boolean)).toBe(true);
    for (const card of dashboard.priorities) {
      expect(card.left).toBeGreaterThanOrEqual(dashboard.prioritiesGrid.left - 1);
      expect(card.right).toBeLessThanOrEqual(dashboard.prioritiesGrid.right + 1);
      expect(card.width).toBeGreaterThanOrEqual((dashboard.prioritiesGrid.width - 7) / 2 - 1);
    }

    await page.goto('/clase.html#materias', { waitUntil: 'domcontentloaded' });
    const library = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.course-selector > a')).map(card => card.getBoundingClientRect());
      return {
        columns:getComputedStyle(document.querySelector('.course-selector')).gridTemplateColumns.split(' ').length,
        firstRowTops:new Set(cards.slice(0,2).map(card => Math.round(card.top))).size,
        maxCardHeight:Math.max(...cards.map(card => card.height)),
        gridHeight:document.querySelector('.course-selector').getBoundingClientRect().height,
        practiceShortcutHeight:document.querySelector('#coursePracticeShortcut').getBoundingClientRect().height,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(library.columns).toBe(2);
    expect(library.firstRowTops).toBe(1);
    expect(library.maxCardHeight).toBeLessThan(95);
    expect(library.gridHeight).toBeLessThan(270);
    expect(library.practiceShortcutHeight).toBeLessThan(52);
    expect(library.overflow).toBeLessThanOrEqual(1);

    await page.goto('/clase.html#nutricion-2026-08-13', { waitUntil: 'domcontentloaded' });
    const course = await page.evaluate(() => {
      const modes = Array.from(document.querySelectorAll('#nutricion .notebook-modes button')).map(item => item.getBoundingClientRect());
      const dates = Array.from(document.querySelectorAll('#nutricion .notebook-date')).map(item => item.getBoundingClientRect());
      const sections = Array.from(document.querySelectorAll('#nutricion-2026-08-13 .course-chapter-section'));
      return {
        modeColumns:getComputedStyle(document.querySelector('#nutricion .notebook-modes')).gridTemplateColumns.split(' ').length,
        modeRows:new Set(modes.map(item => Math.round(item.top))).size,
        modeMaxHeight:Math.max(...modes.map(item => item.height)),
        dateMaxHeight:Math.max(...dates.map(item => item.height)),
        sectionCount:sections.length,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(course.modeColumns).toBe(4);
    expect(course.modeRows).toBe(1);
    expect(course.modeMaxHeight).toBeLessThanOrEqual(40);
    expect(course.dateMaxHeight).toBeLessThanOrEqual(44);
    expect(course.sectionCount).toBe(6);
    expect(course.overflow).toBeLessThanOrEqual(1);

    const notebook = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
      const navItems = Array.from(document.querySelectorAll('.mobile-bottom-nav a')).map(item => item.getBoundingClientRect());
      const navIcon = document.querySelector('.mobile-bottom-nav .nav-icon svg').getBoundingClientRect();
      return {
        navHeight:nav.height,
        navItemMinHeight:Math.min(...navItems.map(item => item.height)),
        navIconWidth:navIcon.width,
        bodyBottomPadding:parseFloat(getComputedStyle(document.body).paddingBottom),
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(notebook.navHeight).toBeGreaterThanOrEqual(56);
    expect(notebook.navItemMinHeight).toBeGreaterThanOrEqual(54);
    expect(notebook.navIconWidth).toBeGreaterThanOrEqual(19);
    expect(notebook.bodyBottomPadding).toBeGreaterThanOrEqual(notebook.navHeight + 12);
    expect(notebook.overflow).toBeLessThanOrEqual(1);

    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="rapido"]').click();
    await expect(page.locator('#nutricion-2026-08-13 .notebook-summary')).toBeVisible();
    await expect(page.locator('#nutricion-2026-08-13 .notebook-summary li')).toHaveCount(6);

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

    await page.locator('#plan-estudio').getByRole('link', { name: 'Ver las instrucciones', exact: true }).click();
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
};
