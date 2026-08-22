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
        homeworkTitle:document.querySelector('.dashboard-priorities-title').textContent.trim(),
        homeworkCount:document.getElementById('homeHomeworkCount').textContent.trim(),
        homeworkDates:Array.from(prioritiesGrid.querySelectorAll('.priority-card time')).map(function(time){return time.dateTime;})
      };
    });
    expect(dashboard.height).toBeLessThan(720);
    expect(dashboard.titleSize).toBeLessThan(32);
    expect(dashboard.navHeight).toBeGreaterThanOrEqual(54);
    expect(dashboard.navHeight).toBeLessThanOrEqual(62);
    expect(dashboard.overflow).toBeLessThanOrEqual(1);
    expect(dashboard.columns).toBe(1);
    expect(dashboard.appBottomPadding).toBeLessThanOrEqual(12);
    expect(dashboard.homeworkTitle).toBe('TAREAS');
    expect(dashboard.homeworkCount).toBe('2 tareas activas');
    expect(dashboard.homeworkDates).toEqual(['','','']);
    for (const card of dashboard.priorities) {
      expect(card.left).toBeGreaterThanOrEqual(dashboard.prioritiesGrid.left - 1);
      expect(card.right).toBeLessThanOrEqual(dashboard.prioritiesGrid.right + 1);
      expect(card.width).toBeGreaterThanOrEqual(dashboard.prioritiesGrid.width - 1);
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

    await page.goto('/clase.html#nutrition-repaso', { waitUntil: 'domcontentloaded' });
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
    expect(map.navItemMinHeight).toBeGreaterThanOrEqual(54);
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
