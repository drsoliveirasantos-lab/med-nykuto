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
  test('medical definitions stay compact and readable above the tapped word on iPhone', async ({ page }) => {
    await page.goto('/clase.html#fisiologia', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-detail-toggle][aria-controls="fisio-detail"]').click();
    await expect(page.locator('#fisio-detail')).toBeVisible();
    const term = page.locator('.mn-glossary-term[data-glossary-key="hypercapnia"]:visible').first();
    await expect(term).toBeVisible({ timeout: 15000 });
    await term.evaluate(node => node.scrollIntoView({ block:'center', inline:'nearest' }));
    await term.click();
    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover).toBeVisible();

    const layout = await page.evaluate(() => {
      const trigger = document.querySelector('.mn-glossary-term[data-glossary-key="hypercapnia"][aria-expanded="true"]');
      const panel = document.getElementById('mnMedicalGlossaryPopover');
      const close = panel.querySelector('.mn-glossary-close');
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      return {
        placement:panel.dataset.placement,
        panelLeft:panelRect.left,
        panelRight:panelRect.right,
        panelBottom:panelRect.bottom,
        triggerTop:triggerRect.top,
        panelWidth:panelRect.width,
        closeWidth:closeRect.width,
        closeHeight:closeRect.height,
        viewport:window.innerWidth,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(layout.placement).toBe('above');
    expect(layout.panelLeft).toBeGreaterThanOrEqual(7);
    expect(layout.panelRight).toBeLessThanOrEqual(layout.viewport - 7);
    expect(layout.panelBottom).toBeLessThanOrEqual(layout.triggerTop);
    expect(layout.panelWidth).toBeLessThanOrEqual(layout.viewport - 16);
    expect(layout.closeWidth).toBeGreaterThanOrEqual(36);
    expect(layout.closeHeight).toBeGreaterThanOrEqual(36);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  });

  test('dedicated study page stays compact and switches grouped topics on iPhone', async ({ page }) => {
    await page.route('**/api/community**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok:true,
          week:{key:'2026-08-10',start:'2026-08-10',end:'2026-08-16'},
          challenge:{goal:1000,points:0,questions:0,participants:0,records:0,progress:0},
          ranking:[],
          currentUser:null
        })
      });
    });
    await page.goto('/comunidade.html', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Estudia por materia y tema.' })).toBeVisible();
    await expect(page.locator('#studySubjectPicker .study-subject-option')).toHaveCount(6);

    const initial = await page.evaluate(() => {
      const subjects = Array.from(document.querySelectorAll('.study-subject-option')).map(node => node.getBoundingClientRect());
      const picker = document.getElementById('studySubjectPicker');
      const practice = document.querySelector('#studyPracticeHost .practice-overview').getBoundingClientRect();
      const counts = Array.from(document.querySelectorAll('#studyPracticeHost .practice-counts > span')).map(node => node.getBoundingClientRect());
      return {
        columns:getComputedStyle(picker).gridTemplateColumns.split(' ').length,
        maxSubjectHeight:Math.max(...subjects.map(item => item.height)),
        practiceHeight:practice.height,
        countRows:new Set(counts.map(item => Math.round(item.top))).size,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(initial.columns).toBe(2);
    expect(initial.maxSubjectHeight).toBeLessThan(72);
    expect(initial.practiceHeight).toBeLessThan(240);
    expect(initial.countRows).toBe(1);
    expect(initial.overflow).toBeLessThanOrEqual(1);

    await page.locator('[data-study-subject="fisiologia"]').click();
    await expect(page.locator('#studyTopicPicker .study-topic-option')).toHaveCount(2);
    await page.locator('[data-study-topic="fisiologia-2026-08-10"]').click();
    await expect(page.locator('#studyPracticeHost #practice-fisiologia-2026-08-10')).toBeVisible();
  });

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
    expect(dashboard.navHeight).toBeGreaterThanOrEqual(56);
    expect(dashboard.navHeight).toBeLessThanOrEqual(62);
    expect(dashboard.overflow).toBeLessThanOrEqual(1);
    expect(dashboard.columns).toBe(1);
    expect(dashboard.appBottomPadding).toBeLessThanOrEqual(12);
    expect(dashboard.homeworkTitle).toBe('TAREAS');
    expect(dashboard.homeworkCount).toBe('3 tareas');
    expect(dashboard.homeworkDates).toEqual(['2026-08-17','2026-08-19','2026-08-20']);
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

  test('complete lessons stay compact across every subject on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const lessons = [
      { hash: 'nutrition-detail', detail: '#nutrition-detail', cards: '.nutrition-definitions article,.food-functions article,.enrichment-grid article' },
      { hash: 'fisio-detail', detail: '#fisio-detail', cards: '.control-loop li,.resp-centers article,.resp-modulators article' },
      { hash: 'fisio-detail-2026-08-10', detail: '#fisio-detail-2026-08-10', cards: '.gas-core-grid article,.bohr-haldane article' },
      { hash: 'bio-detail', detail: '#bio-detail', cards: '.bio-board-route article,.regulation-grid article' },
      { hash: 'epi-detail', detail: '#epi-detail', cards: '.epi-map-grid article,.dispensary-grid article,.process-strip article,.triage-colors article' },
      { hash: 'micro-theory-detail', detail: '#micro-theory-detail', cards: '.mycosis-core li,.transmission-grid article,.site-grid article,.diagnostic-flow article,.therapy-grid article,.next-mycology-grid article' },
      { hash: 'micro-detail', detail: '#micro-detail', cards: '.sample-grid article,.morphology-grid article,.sabouraud-facts article,.lab-workflow article' }
    ];

    for (const lesson of lessons) {
      await page.goto(`/clase.html#${lesson.hash}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(lesson.detail)).toBeVisible({ timeout: 10000 });
      const layout = await page.locator(lesson.detail).evaluate((detail, cardsSelector) => {
        const cards = Array.from(detail.querySelectorAll(cardsSelector));
        const boxes = cards.map((card) => card.getBoundingClientRect());
        return {
          cardCount: cards.length,
          maxCardHeight: Math.max(...boxes.map((box) => box.height)),
          fixedMinHeights: cards.map((card) => parseFloat(getComputedStyle(card).minHeight) || 0),
          detailGap: parseFloat(getComputedStyle(detail).gap) || 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      }, lesson.cards);

      expect(layout.cardCount).toBeGreaterThan(0);
      expect(Math.max(...layout.fixedMinHeights)).toBe(0);
      expect(layout.maxCardHeight).toBeLessThan(230);
      expect(layout.detailGap).toBeLessThanOrEqual(10);
      expect(layout.overflow).toBeLessThanOrEqual(1);
    }

    await page.goto('/clase.html#nutrition-detail', { waitUntil: 'domcontentloaded' });
    const nutrition = await page.evaluate(() => {
      const equation = document.querySelector('.energy-equation');
      const functions = Array.from(document.querySelectorAll('.food-functions article')).map((item) => item.getBoundingClientRect());
      const disclosure = document.querySelector('#nutrition-detail .mobile-table-disclosure');
      const summary = disclosure.querySelector('summary').getBoundingClientRect();
      return {
        equationColumns: getComputedStyle(equation).gridTemplateColumns.split(' ').length,
        equationHeight: equation.getBoundingClientRect().height,
        functionColumns: getComputedStyle(document.querySelector('.food-functions')).gridTemplateColumns.split(' ').length,
        functionFirstRow: Math.abs(functions[0].top - functions[1].top) < 1,
        disclosureOpen: disclosure.open,
        summaryHeight: summary.height,
        tableDisplay: getComputedStyle(disclosure.querySelector('.table-scroll')).display
      };
    });

    expect(nutrition.equationColumns).toBe(5);
    expect(nutrition.equationHeight).toBeLessThan(70);
    expect(nutrition.functionColumns).toBe(2);
    expect(nutrition.functionFirstRow).toBe(true);
    expect(nutrition.disclosureOpen).toBe(false);
    expect(nutrition.summaryHeight).toBeLessThan(70);
    expect(nutrition.tableDisplay).toBe('none');

    const tableDisclosure = page.locator('#nutrition-detail .mobile-table-disclosure');
    await tableDisclosure.locator(':scope > summary').click();
    await expect(tableDisclosure).toHaveAttribute('open', '');
    await expect(tableDisclosure.locator('.table-scroll')).toBeVisible();
    const openTable = await tableDisclosure.evaluate((disclosure) => {
      const scroller = disclosure.querySelector('.table-scroll');
      const table = disclosure.querySelector('table');
      return {
        tableWiderThanViewport: table.scrollWidth > scroller.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(openTable.tableWiderThanViewport).toBe(true);
    expect(openTable.pageOverflow).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/clase.html#nutrition-detail', { waitUntil: 'domcontentloaded' });
    const desktopTable = page.locator('#nutrition-detail .mobile-table-disclosure').first();
    await expect(desktopTable.locator(':scope > summary')).toBeHidden();
    await expect(desktopTable.locator('.table-scroll')).toBeVisible();
  });

  test('glycolysis board archive stays inside an iPhone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica', { waitUntil: 'domcontentloaded' });
    const launch = page.locator('.board-archive-launch');
    await expect(launch).toBeVisible();
    await launch.getByRole('button', { name: /Ver las 7 láminas/ }).click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    const layout = await dialog.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const close = node.querySelector('[data-board-archive-close]').getBoundingClientRect();
      const image = node.querySelector('#boardArchiveImage').getBoundingClientRect();
      const frame = node.querySelector('.board-archive-image-frame').getBoundingClientRect();
      const thumbnails = node.querySelector('.board-archive-thumbnails');
      return {
        left:box.left,
        right:box.right,
        top:box.top,
        bottom:box.bottom,
        viewportWidth:innerWidth,
        viewportHeight:innerHeight,
        closeWidth:close.width,
        closeHeight:close.height,
        imageWidth:image.width,
        frameWidth:frame.width,
        thumbnailCount:thumbnails.querySelectorAll('[data-board-archive-slide]').length,
        documentOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight);
    expect(layout.closeWidth).toBeGreaterThanOrEqual(44);
    expect(layout.closeHeight).toBeGreaterThanOrEqual(44);
    expect(layout.imageWidth).toBeLessThanOrEqual(layout.frameWidth);
    expect(layout.thumbnailCount).toBe(7);
    expect(layout.documentOverflow).toBeLessThanOrEqual(1);

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');
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
