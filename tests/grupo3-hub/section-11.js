module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica-2026-08-10');
    const quickView = page.locator('#microbiologia-teorica-2026-08-10 [data-lesson-tab="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Hilo lógico de la clase' })).toBeVisible();
    await expect(page.locator('#microbiologia-teorica-2026-08-10 .notebook-summary li')).toHaveCount(8);
    await expect(quickView).toHaveAttribute('aria-selected', 'true');
  });

  test('saves notebook progress by lesson', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-20');
    await page.locator('#fisiologia [data-notebook-mode="progreso"]').click();
    const firstTask = page.locator('#fisiologia .notebook-progress-row input').first();
    await firstTask.check();
    await expect(page.locator('#fisiologia .notebook-progress-summary')).toContainText('1 de 4');
    await page.reload();
    await page.locator('#fisiologia [data-notebook-mode="progreso"]').click();
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
      await expect(bottomNavigation.getByRole('link')).toHaveCount(5);
      await expect(bottomNavigation.getByRole('link', { name: 'Plan' })).toHaveCount(0);
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
    await expect(page.locator('#weeklyAgenda .schedule-task-badge')).toHaveCount(4);
  });

  test('publishes all fourteen lessons as narrative courses with isolated forty-question training', async ({ page }) => {
    const lessons = [
      ['nutricion-2026-08-13', 'Leyes de la alimentación y evaluación del paciente', 'nutricion'],
      ['fisiologia-2026-08-10', 'Difusión y transporte de gases', 'fisiologia-2026-08-10'],
      ['fisiologia-2026-08-13', 'Control nervioso y químico de la respiración', 'fisiologia-2026-08-13'],
      ['fisiologia-2026-08-17', 'Organización, sinapsis y receptores', 'fisiologia-2026-08-17'],
      ['bioquimica-2026-08-19', 'Glucólisis, piruvato y complejo PDH'],
      ['epidemiologia-2026-08-19', 'Organización de urgencias y emergencias'],
      ['fisiologia-2026-08-20', 'Ejercicios integradores del sistema nervioso'],
      ['microbiologia-practica-2026-08-20', 'Diagnóstico práctico de micosis superficiales'],
      ['bioquimica-2026-08-14', 'Glucólisis: vía común y balance energético', 'bioquimica'],
      ['bioquimica-2026-08-21', 'Cetoacidosis diabética'],
      ['epidemiologia-bloque-anterior', 'APS, sectorización y triage', 'epidemiologia'],
      ['microbiologia-teorica-2026-08-10', 'Dermatofitosis y tiñas', 'microbiologia-teorica'],
      ['microbiologia-teorica-2026-08-17', 'Micosis por profundidad y casos clínicos', 'microbiologia-teorica-2026-08-17'],
      ['microbiologia-practica-anterior', 'Hongos y preparación del agar Sabouraud', 'microbiologia-practica']
    ];
    for (const [id, title, legacyPracticeId] of lessons) {
      await page.goto('/clase.html#' + id);
      await expect(page.locator('#' + id)).toBeVisible();
      await expect(page.locator('#' + id)).toHaveAttribute('data-notebook-narrative', 'true');
      await expect(page.locator('#' + id + ' [data-lesson-tabs] button')).toHaveCount(6);
      const practiceId = legacyPracticeId || id;
      await expect(page.locator('#' + id + ' .practice-module[data-practice-root="' + practiceId + '"]')).toContainText('40 preguntas');
      await expect(page.locator('#' + id)).toContainText(title.split(':')[0]);
      const fullCourse = page.locator('#' + id + ' [data-lesson-tab-panel="curso"]');
      await expect(fullCourse).toHaveClass(/course-chapter-2026/);
      await expect(fullCourse.locator('.course-chapter-section')).not.toHaveCount(0);
      await expect(fullCourse.locator('.concept-card-2026')).toHaveCount(0);
    }
  });

  test('opens course files and progress through the four-part workspace', async ({ page }) => {
    await page.goto('/clase.html#bioquimica-2026-08-21');
    const workspace = page.locator('#bioquimica .notebook-modes');
    await expect(workspace.getByRole('button')).toHaveCount(4);
    await workspace.getByRole('button', { name: 'Archivos' }).click();
    await expect(page.locator('#bioquimica .notebook-file-row')).not.toHaveCount(0);
    await workspace.getByRole('button', { name: 'Progreso' }).click();
    const first = page.locator('#bioquimica .notebook-progress-row input').first();
    await first.check();
    await expect(page.locator('#bioquimica .notebook-progress-summary')).toContainText('1 de');
    await workspace.getByRole('button', { name: 'Cuaderno' }).click();
    await expect(page.locator('#bioquimica-2026-08-21')).toBeVisible();
  });

  test('keeps the new lesson shell inside 320 to 430 pixel viewports', async ({ page }) => {
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/clase.html#fisiologia-2026-08-20');
      const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      const tabHeight = await page.locator('#fisiologia-2026-08-20 [data-lesson-tabs] button').first().evaluate((node) => node.getBoundingClientRect().height);
      expect(tabHeight).toBeGreaterThanOrEqual(38);
    }
  });

  test('shows all six Epidemiology groups in a compact iPhone roster', async ({ page }) => {
    const groups = Array.from({ length: 6 }, (_, index) => ({
      id: `epi-2026-08-19-g${index + 1}`,
      activityId: 'epi-2026-08-19',
      name: `Grupo ${index + 1}`,
      capacity: 10,
      frozen: false,
      memberCount: index === 0 ? 2 : index === 3 ? 1 : 0
    }));
    await page.route('**/api/class-hub?resource=public', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        notices: [],
        tasks: [],
        activities: [{ id: 'epi-2026-08-19', title: 'Exposición de Epidemiología', capacity: 10, status: 'published', frozen: false }],
        groups,
        members: [
          { activityId: 'epi-2026-08-19', groupId: 'epi-2026-08-19-g1', displayName: 'Ana Pérez', joinedAt: '2026-08-22T09:00:00Z' },
          { activityId: 'epi-2026-08-19', groupId: 'epi-2026-08-19-g1', displayName: 'Luis Gómez', joinedAt: '2026-08-22T09:01:00Z' },
          { activityId: 'epi-2026-08-19', groupId: 'epi-2026-08-19-g4', displayName: 'María Silva', joinedAt: '2026-08-22T09:02:00Z' }
        ],
        files: [],
        dates: []
      })
    }));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html');
    await page.locator('[data-view-link="cursos"]').click();
    await page.locator('[data-course-target="epidemiologia"]').click();

    const roster = page.locator('#epi19-tarea .group-roster-board');
    await expect(roster).toBeVisible();
    await expect(roster.locator('.group-roster-column')).toHaveCount(6);
    await expect(roster.locator('.group-roster-list li')).toHaveCount(60);
    await expect(roster).toContainText('Ana Pérez');
    await expect(roster).toContainText('María Silva');
    await expect(page.getByRole('button', { name: 'Añadir mi nombre' })).toBeVisible();

    await roster.locator('[data-group-choice="epi-2026-08-19-g4"]').click();
    await expect(page.locator('#epi19-tarea select[aria-label="Elegir grupo"]')).toHaveValue('epi-2026-08-19-g4');
    await expect(roster.locator('[data-group-id="epi-2026-08-19-g4"]')).toHaveClass(/is-selected/);

    const dimensions = await page.evaluate(() => ({
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      boardOverflow: document.querySelector('.group-roster-board').scrollWidth - document.querySelector('.group-roster-board').clientWidth
    }));
    expect(dimensions.pageOverflow).toBeLessThanOrEqual(1);
    expect(dimensions.boardOverflow).toBeLessThanOrEqual(1);
  });

  test('exposes management, teacher profiles and install metadata without student accounts', async ({ page }) => {
    await page.goto('/gestion.html');
    await expect(page.getByRole('heading', { name: 'Med Nykuto Gestión' })).toBeVisible();
    await expect(page.locator('#authCard')).toContainText('No se guarda de forma permanente');
    await page.goto('/profesores.html');
    await expect(page.locator('.teacher-card')).toHaveCount(6);
    await expect(page.locator('.teacher-prompt')).toHaveCount(6);
    await expect(page.locator('[data-state="observed"]').first()).toBeVisible();
    await page.goto('/clase.html');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
    await expect(page.locator('#noticeBell')).toBeVisible();
  });
};
