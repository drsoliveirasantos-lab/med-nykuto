module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica-2026-08-10');
    const quickView = page.locator('#microbiologia-teorica-2026-08-10 [data-lesson-tab="rapida"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'La clase convertida en una ficha de estudio' })).toBeVisible();
    await expect(page.locator('#microbiologia-teorica-2026-08-10 .notebook-review-card')).toHaveCount(8);
    await expect(quickView).toHaveAttribute('aria-selected', 'true');
  });

  test('saves notebook progress by lesson', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-20');
    await page.locator('#fisiologia [data-notebook-mode="progreso"]').click();
    const firstTask = page.locator('#fisiologia .notebook-progress-row input').first();
    await firstTask.check();
    await expect(page.locator('#fisiologia .notebook-progress-summary')).toContainText('1 de 5');
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

  test('publishes all sixteen lessons as narrative courses with isolated forty-question training', async ({ page }) => {
    const lessons = [
      ['nutricion-2026-08-13', 'Leyes de la alimentación y evaluación del paciente', 'nutricion'],
      ['fisiologia-2026-08-10', 'Difusión y transporte de gases', 'fisiologia-2026-08-10'],
      ['fisiologia-2026-08-13', 'Control nervioso y químico de la respiración', 'fisiologia-2026-08-13'],
      ['fisiologia-2026-08-17', 'Organización, sinapsis y receptores', 'fisiologia-2026-08-17'],
      ['fisiologia-2026-08-24', 'Sensibilidades somáticas'],
      ['bioquimica-2026-08-19', 'Glucólisis, piruvato y complejo PDH'],
      ['epidemiologia-2026-08-19', 'Organización de urgencias y emergencias'],
      ['fisiologia-2026-08-20', 'Ejercicios integradores del sistema nervioso'],
      ['microbiologia-practica-2026-08-20', 'Diagnóstico práctico de micosis superficiales'],
      ['bioquimica-2026-08-14', 'Glucólisis: vía común y balance energético', 'bioquimica'],
      ['bioquimica-2026-08-21', 'Cetoacidosis diabética'],
      ['epidemiologia-bloque-anterior', 'APS, sectorización y triage', 'epidemiologia'],
      ['microbiologia-teorica-2026-08-10', 'Dermatofitosis y tiñas', 'microbiologia-teorica'],
      ['microbiologia-teorica-2026-08-17', 'Pitiriasis versicolor y tiña corporal', 'microbiologia-teorica-2026-08-17'],
      ['microbiologia-teorica-2026-08-24', 'Micosis subcutáneas, oportunistas y casos clínicos'],
      ['microbiologia-practica-anterior', 'Hongos y preparación del agar Sabouraud', 'microbiologia-practica']
    ];
    for (const [id, title, legacyPracticeId] of lessons) {
      await page.goto('/clase.html#' + id);
      await expect(page.locator('#' + id)).toBeVisible();
      await expect(page.locator('#' + id)).toHaveAttribute('data-notebook-narrative', 'true');
      await expect(page.locator('#' + id + ' [data-lesson-tabs] button')).toHaveCount(6);
      await expect(page.locator('#' + id + ' > [data-lesson-tabs]')).toBeVisible();
      expect(await page.locator('#' + id + ' > [data-lesson-tabs] button').allTextContents()).toEqual([
        'Curso completo',
        'Ficha rápida',
        'Ficha ultra rápida',
        'Entrenamiento',
        'Material de la clase',
        'Recursos IA'
      ]);
      const practiceId = legacyPracticeId || id;
      await expect(page.locator('#' + id + ' .practice-module[data-practice-root="' + practiceId + '"]')).toContainText('40 preguntas');
      await expect(page.locator('#' + id)).toContainText(title.split(':')[0]);
      const fullCourse = page.locator('#' + id + ' [data-lesson-tab-panel="curso"]');
      await expect(fullCourse).toHaveClass(/course-chapter-2026/);
      await expect(fullCourse.locator('.course-chapter-section')).not.toHaveCount(0);
      await expect(fullCourse.locator('.course-inline-figure')).not.toHaveCount(0);
      await expect(fullCourse.locator('.course-chapter-index, .notebook-course-index')).toHaveCount(0);
      await expect(fullCourse.locator('.concept-card-2026')).toHaveCount(0);
      const quick = page.locator('#' + id + ' [data-lesson-tab-panel="rapida"]');
      const ultra = page.locator('#' + id + ' [data-lesson-tab-panel="ultra"]');
      await expect(quick.locator('.notebook-review-sheet[data-lesson-review="standard"]')).toHaveCount(1);
      await expect(quick.locator('.notebook-review-route')).toHaveCount(1);
      await expect(quick.locator('.notebook-review-recall')).toHaveCount(1);
      expect(await quick.locator('.notebook-review-card').count()).toBe(await fullCourse.locator('.course-chapter-section').count());
      await expect(ultra.locator('.notebook-review-sheet[data-lesson-review="standard"]')).toHaveCount(1);
      await expect(ultra.locator('.course-inline-figure.is-summary')).toHaveCount(1);
      await expect(ultra.locator('.notebook-ultra-path li')).toHaveCount(4);
      const ultraRules = await ultra.locator('.notebook-ultra-rules li').count();
      expect(ultraRules).toBeGreaterThanOrEqual(1);
      expect(ultraRules).toBeLessThanOrEqual(5);
    }
  });

  test('separates Biochemistry synthesis diagrams from the faithful teacher boards', async ({ page }) => {
    await page.goto('/clase.html#bioquimica-2026-08-14');
    let ultra = page.locator('#bioquimica-2026-08-14 [data-lesson-tab-panel="ultra"]');
    await expect(ultra.locator('svg.diagram-pathway')).toHaveCount(1);
    await expect(ultra.locator('.course-inline-image')).toHaveCount(0);

    await page.goto('/clase.html#bioquimica-2026-08-21');
    ultra = page.locator('#bioquimica-2026-08-21 [data-lesson-tab-panel="ultra"]');
    await expect(ultra.locator('svg.diagram-flow')).toHaveCount(1);
    await expect(ultra.locator('.course-inline-image')).toHaveCount(0);
  });

  test('keeps the three 21 August teacher boards miniature and fully visible when enlarged', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica-2026-08-21');
    const course = page.locator('#bioquimica-2026-08-21 [data-lesson-tab-panel="curso"]');
    const boards = course.locator('.course-inline-figure.is-teacher-board');
    await expect(boards).toHaveCount(3);
    await expect(boards.nth(0).locator('img')).toHaveAttribute('src', /01-deficit-insulina\.svg$/);
    await expect(boards.nth(1).locator('img')).toHaveAttribute('src', /02-cetogenesis-acidosis\.svg$/);
    await expect(boards.nth(2).locator('img')).toHaveAttribute('src', /03-cerebro-osmoles\.svg$/);

    const miniatureWidth = await boards.first().evaluate((node) => node.getBoundingClientRect().width);
    expect(miniatureWidth).toBeLessThanOrEqual(145);
    const paragraphAlignment = await course.locator('.course-chapter-section p:not(.course-chapter-step)').first().evaluate((node) => getComputedStyle(node).textAlign);
    expect(paragraphAlignment).toBe('justify');

    await boards.first().locator('button').click();
    const dialog = page.locator('.course-diagram-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('PIZARRA DEL PROFESOR · RECONSTRUIDA');
    await expect(dialog.getByRole('button', { name: 'Ampliar la pizarra para leer los detalles' })).toBeVisible();
    const fit = await dialog.evaluate((node) => {
      const stage = node.querySelector('.course-diagram-dialog-stage').getBoundingClientRect();
      const image = node.querySelector('.course-inline-image').getBoundingClientRect();
      return {
        withinWidth: image.width <= stage.width + 1,
        withinHeight: image.height <= stage.height + 1,
        viewportWidth: node.getBoundingClientRect().width <= window.innerWidth,
        viewportHeight: node.getBoundingClientRect().height <= window.innerHeight
      };
    });
    expect(fit).toEqual({ withinWidth: true, withinHeight: true, viewportWidth: true, viewportHeight: true });

    await dialog.getByRole('button', { name: 'Ampliar la pizarra para leer los detalles' }).click();
    await expect(dialog).toHaveClass(/is-zoomed/);
    await expect(dialog.getByRole('button', { name: 'Ampliar la pizarra para leer los detalles' })).toHaveText('Ajustar');
    const zoomed = await dialog.evaluate((node) => {
      const stage = node.querySelector('.course-diagram-dialog-stage');
      const image = node.querySelector('.course-inline-image').getBoundingClientRect();
      return {
        imageWiderThanStage: image.width > stage.getBoundingClientRect().width,
        horizontallyScrollable: stage.scrollWidth > stage.clientWidth
      };
    });
    expect(zoomed).toEqual({ imageWiderThanStage: true, horizontallyScrollable: true });
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
      await page.locator('#fisiologia-2026-08-20 [data-lesson-tab="rapida"]').click();
      let reviewDimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(reviewDimensions.scrollWidth).toBeLessThanOrEqual(reviewDimensions.clientWidth + 1);
      await expect(page.locator('#fisiologia-2026-08-20 .notebook-review-recall')).toBeVisible();
      await page.locator('#fisiologia-2026-08-20 [data-lesson-tab="ultra"]').click();
      reviewDimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(reviewDimensions.scrollWidth).toBeLessThanOrEqual(reviewDimensions.clientWidth + 1);
      await expect(page.locator('#fisiologia-2026-08-20 .notebook-ultra-close')).toBeVisible();
    }
  });

  test('shows all 96 Epidemiology member names and ten leaders in a compact iPhone roster', async ({ page }) => {
    const assignments = [
      { topic: 'Virus sincitial respiratorio · Bronquiolitis' },
      { topic: 'Influenza' },
      { topic: 'Tuberculosis' },
      { topic: 'Sarampión' },
      { topic: 'Meningitis bacteriana' },
      { topic: 'Dengue' },
      { topic: 'COVID-19' },
      { topic: 'Sífilis' },
      { topic: 'Hepatitis B' },
      { topic: 'Malaria' }
    ];
    const memberCounts = [9, 10, 10, 10, 10, 10, 9, 9, 9, 10];
    const groups = Array.from({ length: 10 }, (_, index) => ({
      id: `epi-2026-08-19-g${index + 1}`,
      activityId: 'epi-2026-08-19',
      name: `Grupo ${index + 1}`,
      capacity: 10,
      frozen: false,
      memberCount: memberCounts[index],
      ...assignments[index]
    }));
    const members = groups.flatMap((group, groupIndex) => Array.from({ length: memberCounts[groupIndex] }, (_, memberIndex) => ({
      activityId: group.activityId,
      groupId: group.id,
      displayName: memberIndex === 0 ? `Responsable ${groupIndex + 1} Apellido Compuesto` : `Integrante ${groupIndex + 1}-${String(memberIndex + 1).padStart(2, '0')}`,
      isLeader: memberIndex === 0
    })));
    await page.route('**/api/class-hub?class=s4-e&resource=public', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        notices: [],
        tasks: [{
          id: 'epi-presentation',
          course: 'Epidemiología',
          title: 'Exposición grupal de enfermedad sorteada',
          status: 'published',
          dueLabel: 'Mié. 26 ago.',
          dueAt: '2026-08-26T11:20:00-03:00'
        }],
        activities: [{ id: 'epi-2026-08-19', title: 'Exposición de Epidemiología', capacity: 10, status: 'published', frozen: false }],
        groups,
        members,
        files: [],
        dates: []
      })
    }));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html');
    await page.locator('.mobile-bottom-nav [data-view-link="cursos"]').click();
    await page.locator('[data-course-target="epidemiologia"]').click();

    const project = page.locator('#epi19-tarea');
    await expect(project).toBeVisible();
    await expect(project.getByRole('heading', { name: 'Proyecto grupal: exposición sobre una enfermedad' })).toBeVisible();
    await expect(project).toContainText(/TODOS\s*los integrantes deben hablar/i);
    await expect(project.locator('[data-image-lightbox]')).toHaveCount(0);
    await expect(project).toContainText('ACLARACIÓN DOCENTE RESUMIDA');
    const projectPosition = await page.evaluate(() => {
      const projectNode = document.querySelector('#epi19-tarea');
      const datedLesson = document.querySelector('#epidemiologia-2026-08-19');
      return Boolean(projectNode.compareDocumentPosition(datedLesson) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(projectPosition).toBe(true);
    await expect(project.locator('[data-group-runtime]')).toHaveCount(0);
    const taskLink = project.getByRole('link', { name: 'Ver grupos en Tareas' });
    await expect(taskLink).toHaveAttribute('href', '#task-epi-presentation');
    await taskLink.click();

    const task = page.locator('#task-epi-presentation');
    await expect(task).toHaveAttribute('open', '');
    await expect(task.locator('.live-task-groups')).toContainText('Tu grupo, tema y plazas');
    const roster = task.locator('.group-roster-board');
    await expect(roster).toBeVisible();
    await expect(roster.locator('.group-roster-column')).toHaveCount(10);
    await expect(roster.locator('.group-roster-assignment')).toHaveCount(10);
    await expect(roster.locator('.group-roster-list li')).toHaveCount(100);
    await expect(roster.locator('.group-roster-list li.has-member')).toHaveCount(96);
    await expect(roster.locator('.group-roster-list li.is-open')).toHaveCount(4);
    await expect(roster.locator('.group-roster-list li.is-group-leader')).toHaveCount(10);
    await expect(roster.locator('.group-roster-leader')).toHaveCount(10);
    await expect(roster.locator('.group-roster-column').first()).toContainText('Virus sincitial respiratorio');
    await expect(roster.locator('.group-roster-column').last()).toContainText('Malaria');
    await expect(roster.getByText('Ocupado', { exact: true })).toHaveCount(0);
    await expect(roster.getByText('Libre', { exact: true })).toHaveCount(4);
    await expect(roster).toContainText('Responsable 1 Apellido Compuesto');
    await expect(roster).toContainText('Integrante 10-10');
    await expect(roster.locator('.group-roster-column').first().locator('.group-roster-choice')).toHaveAttribute('aria-label', /responsable Responsable 1 Apellido Compuesto/);
    await expect(roster.locator('.group-roster-column').first().locator('.is-group-leader')).toHaveAttribute('aria-label', /responsable del grupo/);
    await expect(task.getByRole('button', { name: 'Añadir mi nombre' })).toBeVisible();

    await roster.locator('[data-group-choice="epi-2026-08-19-g1"]').click();
    await expect(task.locator('select[aria-label="Elegir grupo"]')).toHaveValue('epi-2026-08-19-g1');
    await expect(roster.locator('[data-group-id="epi-2026-08-19-g1"]')).toHaveClass(/is-selected/);

    const dimensions = await page.evaluate(() => ({
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      boardOverflow: document.querySelector('#task-epi-presentation .group-roster-board').scrollWidth - document.querySelector('#task-epi-presentation .group-roster-board').clientWidth
    }));
    expect(dimensions.pageOverflow).toBeLessThanOrEqual(1);
    expect(dimensions.boardOverflow).toBeGreaterThan(100);
    const firstColumnWidth = await roster.locator('.group-roster-column').first().evaluate((node) => node.getBoundingClientRect().width);
    expect(firstColumnWidth).toBeGreaterThanOrEqual(110);
    const longNameLayout = await roster.getByText('Responsable 1 Apellido Compuesto', { exact: true }).last().evaluate((node) => ({
      whiteSpace: getComputedStyle(node).whiteSpace,
      fitsWidth: node.scrollWidth <= node.clientWidth + 1,
      height: node.getBoundingClientRect().height
    }));
    expect(longNameLayout.whiteSpace).not.toBe('nowrap');
    expect(longNameLayout.fitsWidth).toBe(true);
    expect(longNameLayout.height).toBeGreaterThan(16);
  });

  test('exposes management, teacher profiles and install metadata without student accounts', async ({ page }) => {
    await page.goto('/gestion-shell/?class=s4-e');
    await expect(page.getByRole('heading', { name: 'Gestionar mi clase' })).toBeVisible();
    await expect(page.locator('#authCard')).toContainText('Inicia sesión para añadir tareas');
    await page.goto('/profesores.html');
    await expect(page.locator('.teacher-card')).toHaveCount(6);
    await expect(page.locator('.teacher-prompt')).toHaveCount(6);
    await expect(page.locator('[data-state="observed"]').first()).toBeVisible();
    await page.goto('/clase.html');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
    await expect(page.locator('#noticeBell')).toBeVisible();
    await expect(page.locator('.delegate-link')).toBeVisible();
    await expect(page.locator('.home-quick-link-delegate')).toHaveAttribute('href', '/gestion/s4-e');
  });
};
