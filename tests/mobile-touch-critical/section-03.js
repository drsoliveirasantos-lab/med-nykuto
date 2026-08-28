module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('dashboard, subjects, training and seminar plan use a tablet-like compact density', async ({ page }) => {
    await page.goto('/clase.html#inicio', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tareas activas');
    const dashboard = await page.evaluate(() => {
      const panel = document.querySelector('.class-dashboard').getBoundingClientRect();
      const title = document.querySelector('.dashboard-heading h1');
      const navItem = document.querySelector('.mobile-bottom-nav a').getBoundingClientRect();
      const prioritiesGrid = document.querySelector('.dashboard-priorities');
      const prioritiesGridRect = prioritiesGrid.getBoundingClientRect();
      const quickLinks = Array.from(document.querySelectorAll('.home-quick-links .home-quick-link')).filter((link) => link.offsetParent !== null);
      const priorities = Array.from(prioritiesGrid.querySelectorAll('.priority-card')).map((card) => {
        const rect = card.getBoundingClientRect();
        const title = card.querySelector('strong');
        return {
          left:rect.left,
          right:rect.right,
          width:rect.width,
          overflow:card.scrollWidth-card.clientWidth,
          titleSize:parseFloat(getComputedStyle(title).fontSize),
          titleLines:Math.round(title.getBoundingClientRect().height/parseFloat(getComputedStyle(title).lineHeight))
        };
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
        quickLinkCount:quickLinks.length,
        quickLinkRows:new Set(quickLinks.map((link) => Math.round(link.getBoundingClientRect().top))).size,
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
    expect(dashboard.quickLinkCount).toBe(4);
    expect(dashboard.quickLinkRows).toBe(1);
    expect(dashboard.homeworkTitle).toBe('PARA ESTA SEMANA');
    expect(dashboard.homeworkCount).toBe('3 tareas activas');
    expect(dashboard.homeworkDates).toContain('2099-09-03T09:10:00-03:00');
    expect(dashboard.homeworkDates.every(Boolean)).toBe(true);
    for (const card of dashboard.priorities) {
      expect(card.left).toBeGreaterThanOrEqual(dashboard.prioritiesGrid.left - 1);
      expect(card.right).toBeLessThanOrEqual(dashboard.prioritiesGrid.right + 1);
      expect(card.width).toBeGreaterThanOrEqual(70);
      expect(card.overflow).toBeLessThanOrEqual(1);
      expect(card.titleSize).toBeLessThanOrEqual(10);
      expect(card.titleLines).toBeLessThanOrEqual(2);
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

    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="rapida"]').click();
    await expect(page.locator('#nutricion-2026-08-13 .notebook-summary')).toBeVisible();
    await expect(page.locator('#nutricion-2026-08-13 .notebook-review-card')).toHaveCount(6);

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

  test('Avisos stays reachable in the scrollable 4E navigation and after an iPhone rotation', async ({ page }) => {
    await page.unroute('**/api/class-hub**');
    const categories = ['transport','schedule','assessment','administrative','academic','task','resource','general','emergency'];
    const notices = categories.map((category,index) => ({
      id:`mobile-${category}`,
      title:category === 'transport' ? 'Última salida del bus' : `Aviso ${category}`,
      body:category === 'transport' ? 'El transporte universitario sale a las 20:30.' : `Información vigente ${index + 1}.`,
      category,
      priority:'normal',
      status:'published',
      lifecycle:'active',
      audience:'students',
      publishedAt:`2099-08-${String(20 + index).padStart(2,'0')}T12:00:00-03:00`
    }));
    await page.route('**/api/class-hub**', (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'GET' && url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
        return route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ ok:true, notices, tasks:[], activities:[], groups:[], members:[], files:[], dates:[] }) });
      }
      return route.continue();
    });

    await page.setViewportSize({ width:320, height:568 });
    await page.goto('/clase.html#inicio', { waitUntil:'domcontentloaded' });
    const navigation = page.locator('.mobile-bottom-nav');
    await expect(navigation).toBeVisible();
    const navigationLayout = await navigation.evaluate((node) => ({
      scrollWidth:node.scrollWidth,
      clientWidth:node.clientWidth,
      minWidth:Math.min(...Array.from(node.querySelectorAll('a')).map((item) => item.getBoundingClientRect().width)),
      minHeight:Math.min(...Array.from(node.querySelectorAll('a')).map((item) => item.getBoundingClientRect().height))
    }));
    expect(navigationLayout.scrollWidth).toBeGreaterThan(navigationLayout.clientWidth);
    expect(navigationLayout.minWidth).toBeGreaterThanOrEqual(78);
    expect(navigationLayout.minHeight).toBeGreaterThanOrEqual(54);

    await page.locator('.mobile-bottom-nav [data-view-link="cursos"]').click();
    await expect.poll(() => page.evaluate(() => {
      const nav=document.querySelector('.mobile-bottom-nav'),active=nav&&nav.querySelector('[aria-current="page"]');
      if(!nav||!active)return false;
      const bounds=nav.getBoundingClientRect(),item=active.getBoundingClientRect();
      return item.left>=bounds.left-1&&item.right<=bounds.right+1;
    })).toBe(true);
    await page.setViewportSize({ width:640, height:320 });
    await page.setViewportSize({ width:320, height:568 });
    await expect.poll(() => page.evaluate(() => {
      const nav=document.querySelector('.mobile-bottom-nav'),active=nav&&nav.querySelector('[aria-current="page"]');
      if(!nav||!active)return false;
      const bounds=nav.getBoundingClientRect(),item=active.getBoundingClientRect();
      return item.left>=bounds.left-1&&item.right<=bounds.right+1;
    })).toBe(true);

    await page.locator('.mobile-bottom-nav [data-view-link="avisos"]').click();
    await expect(page.locator('#classNoticePageList .notice-item')).toHaveCount(categories.length);
    const filterStrip = page.locator('.notice-filter-category .notice-filter-chips');
    await expect(filterStrip.locator('[data-notice-category="transport"]')).toBeVisible();
    const filterLayout = await filterStrip.evaluate((node) => ({ scrollWidth:node.scrollWidth, clientWidth:node.clientWidth }));
    expect(filterLayout.scrollWidth).toBeGreaterThan(filterLayout.clientWidth);
    await filterStrip.locator('[data-notice-category="transport"]').click();
    await expect(page.locator('#classNoticePageList .notice-item')).toHaveCount(1);
    await expect(page.locator('#classNoticePageList .notice-item[data-category="transport"]')).toContainText('Última salida del bus');
    expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
};
