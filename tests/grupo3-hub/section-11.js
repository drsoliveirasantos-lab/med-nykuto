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
    await expect(page.locator('#fisiologia .notebook-progress-summary')).toContainText('1 de 6');
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
      await expect(bottomNavigation.getByRole('link')).toHaveCount(6);
      await expect(bottomNavigation.getByRole('link', { name: 'Avisos' })).toHaveAttribute('href', '#avisos');
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
          bottomTop: bottom.top,
          navScrollWidth: document.querySelector('.mobile-bottom-nav').scrollWidth,
          navClientWidth: document.querySelector('.mobile-bottom-nav').clientWidth,
          minItemWidth: Math.min(...Array.from(document.querySelectorAll('.mobile-bottom-nav a')).map((item) => item.getBoundingClientRect().width))
        };
      });
      expect(mobileLayout.nextTop).toBeLessThan(mobileLayout.viewportHeight * 0.78);
      expect(mobileLayout.switcherWidth).toBeLessThanOrEqual(160);
      expect(mobileLayout.switcherBottom).toBeLessThanOrEqual(mobileLayout.bottomTop);
      expect(mobileLayout.navScrollWidth).toBeGreaterThan(mobileLayout.navClientWidth);
      expect(mobileLayout.minItemWidth).toBeGreaterThanOrEqual(78);
      await bottomNavigation.getByRole('link', { name: 'Avisos' }).click();
      await expect(page.locator('#avisos')).toBeVisible();
      const activeVisibility = await page.evaluate(() => {
        const nav = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
        const active = document.querySelector('.mobile-bottom-nav [data-view-link="avisos"]').getBoundingClientRect();
        return { left: active.left - nav.left, right: nav.right - active.right };
      });
      expect(activeVisibility.left).toBeGreaterThanOrEqual(-1);
      expect(activeVisibility.right).toBeGreaterThanOrEqual(-1);
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

  test('publishes all twenty-one lessons as narrative courses with isolated forty-question training', async ({ page }) => {
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
      ['bioquimica-2026-08-26', 'Ciclo de Cori y vía de las pentosas fosfato'],
      ['epidemiologia-bloque-anterior', 'APS, sectorización y triage', 'epidemiologia'],
      ['epidemiologia-2026-08-26', 'Casos clínicos de triaje y sistema de salud'],
      ['microbiologia-teorica-2026-08-10', 'Dermatofitosis y tiñas', 'microbiologia-teorica'],
      ['microbiologia-teorica-2026-08-17', 'Pitiriasis versicolor y tiña corporal', 'microbiologia-teorica-2026-08-17'],
      ['microbiologia-teorica-2026-08-24', 'Micosis subcutáneas, oportunistas y casos clínicos'],
      ['microbiologia-practica-anterior', 'Hongos y preparación del agar Sabouraud', 'microbiologia-practica'],
      ['nutricion-2026-08-27', 'Guías alimentarias, etiquetado y lectura crítica'],
      ['fisiologia-2026-08-27', 'Vías sensitivas, decusación y localización de lesiones'],
      ['microbiologia-practica-2026-08-27', 'Reconocimiento microscópico y casos de micosis oportunistas']
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

  test('merges the Drive catalog into an already open subject notebook', async ({ page: bootstrapPage, browser }) => {
    const now = Date.now();
    const seen = (daysAgo) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const driveFiles = [
      { id: 'drive-bio-1', course: 'Bioquímica II', title: 'Pentosas recientes', url: 'https://drive.google.com/open?id=drive-bio-1', fileType: 'PDF', createdAt: seen(2), modifiedAt: seen(1), firstSeenAt: seen(1), visibility: 'verified_anonymous' },
      { id: 'drive-bio-2', course: 'Bioquímica II', title: 'Ciclo de Cori reciente', url: 'https://docs.google.com/presentation/d/drive-bio-2/edit?usp=sharing', fileType: 'PPTX', createdAt: seen(3), modifiedAt: seen(2), firstSeenAt: seen(2), visibility: 'verified_anonymous' },
      { id: 'external-bio-3', course: 'Bioquímica II', title: 'Documento externo reciente', url: 'https://files.example.test/bioquimica-reciente.pdf', fileType: 'PDF', createdAt: seen(4), modifiedAt: seen(3), firstSeenAt: seen(3), visibility: 'verified_anonymous' },
      { id: 'drive-bio-old', course: 'Bioquímica II', title: 'Documento Drive anterior', url: 'https://drive.google.com/open?id=drive-bio-old', fileType: 'DOCX', createdAt: seen(12), modifiedAt: seen(9), firstSeenAt: seen(9), visibility: 'verified_anonymous' },
      { id: 'drive-bio-removed', course: 'Bioquímica II', title: 'Documento eliminado', url: 'https://drive.google.com/file/d/drive-bio-removed/view', fileType: 'PDF', createdAt: seen(1), modifiedAt: seen(1), firstSeenAt: seen(1), removedAt: seen(0), visibility: 'verified_anonymous' },
      { id: 'drive-private', course: 'Bioquímica II', title: 'Documento sin acceso anónimo', url: 'https://drive.google.com/open?id=drive-private', fileType: 'PDF', firstSeenAt: seen(1), visibility: 'access_not_verified' }
    ];
    let releaseApi;
    const apiGate = new Promise((resolve) => { releaseApi = resolve; });
    const isolatedContext = await browser.newContext({ serviceWorkers: 'block' });
    const page = await isolatedContext.newPage();
    try {
      await page.route('**/data/drive-files.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, scannedAt: seen(0), files: driveFiles }) }));
      await page.route('**/api/class-hub**', async (route) => {
        const url = new URL(route.request().url());
        if (url.searchParams.get('class') !== 's4-e' || url.searchParams.get('resource') !== 'public') return route.continue();
        await apiGate;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true, notices: [], tasks: [], activities: [], groups: [], members: [], dates: [],
            files: [
              { id: 'api-copy-bio-1', course: 'Bioquímica II', title: 'Pentosas recientes', url: 'https://drive.google.com/open?id=drive-bio-1&usp=sharing', fileType: 'PDF', status: 'published' },
              { id: 'api-copy-removed', course: 'Bioquímica II', title: 'Documento eliminado', url: 'https://drive.google.com/file/d/drive-bio-removed/view', fileType: 'PDF', status: 'published' }
            ]
          })
        });
      });
      await page.goto(new URL('/clase.html#bioquimica-2026-08-21', bootstrapPage.url()).href);
      await page.locator('#bioquimica [data-notebook-mode="archivos"]').click();
      const rows = page.locator('#bioquimica .notebook-file-row');
      const managedRows = page.locator('#bioquimica .notebook-file-row[data-file-source="hub"]');
      await expect(rows).not.toHaveCount(0);
      await expect(managedRows).toHaveCount(0);

      releaseApi();
      await expect(managedRows).toHaveCount(4);
      await expect(rows.filter({ hasText: 'Documento eliminado' })).toHaveCount(0);
      await expect(rows.filter({ hasText: 'Pentosas recientes' })).toHaveCount(1);
      await expect(page.locator('#bioquimica .notebook-file-row[data-file-recent="true"]')).toHaveCount(3);
      await expect(rows.locator('[data-file-badge="drive"]')).toHaveCount(3);
      await expect(rows.locator('[data-file-badge="recent"]')).toHaveCount(3);
      await expect(rows.filter({ hasText: 'Documento Drive anterior' })).toHaveAttribute('data-file-recent', 'false');
      await expect(rows.filter({ hasText: 'Documento externo reciente' }).locator('[data-file-badge="drive"]')).toHaveCount(0);
      await expect(rows.filter({ hasText: 'Pentosas recientes' })).toHaveAttribute('data-file-visibility', 'verified_anonymous');
      await expect(rows.filter({ hasText: 'Documento sin acceso anónimo' })).toHaveCount(0);
      const managedOrder = await page.locator('#bioquimica .notebook-file-row[data-file-source="hub"] .notebook-file-copy>strong').allTextContents();
      expect(managedOrder).toEqual(['Pentosas recientes', 'Ciclo de Cori reciente', 'Documento externo reciente', 'Documento Drive anterior']);
    } finally {
      releaseApi();
      await isolatedContext.close();
    }
  });

  test('keeps the Archivo course filter after catalog and API files load', async ({ page: bootstrapPage, browser }) => {
    const recent = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const removed = new Date().toISOString();
    const isolatedContext = await browser.newContext({ serviceWorkers: 'block' });
    const page = await isolatedContext.newPage();
    try {
      await page.route('**/data/drive-files.json', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ files: [
        { id: 'catalog-bio', course: 'Bioquímica II', title: 'Catálogo Bioquímica', url: 'https://drive.google.com/file/d/catalog-bio/view', fileType: 'PDF', createdAt: recent, modifiedAt: recent, firstSeenAt: recent, visibility: 'verified_anonymous' },
        { id: 'catalog-fisio', course: 'Fisiología II', title: 'Catálogo Fisiología', url: 'https://drive.google.com/file/d/catalog-fisio/view', fileType: 'PDF', createdAt: recent, modifiedAt: recent, firstSeenAt: recent, visibility: 'verified_anonymous' },
        { id: 'catalog-removed', course: 'Bioquímica II', title: 'Catálogo eliminado', url: 'https://drive.google.com/file/d/catalog-removed/view', fileType: 'PDF', firstSeenAt: recent, removedAt: removed, visibility: 'verified_anonymous' }
      ] })
    }));
      await page.route('**/api/class-hub**', (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('class') !== 's4-e' || url.searchParams.get('resource') !== 'public') return route.continue();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ files: [
        { id: 'api-copy-bio', course: 'Bioquímica II', title: 'Catálogo Bioquímica', url: 'https://drive.google.com/file/d/catalog-bio/view?usp=sharing', fileType: 'PDF' },
        { id: 'api-bio-only', course: 'Bioquímica II', title: 'Archivo API Bioquímica', url: 'https://files.example.test/api-bio.pdf', fileType: 'PDF' },
        { id: 'api-copy-removed', course: 'Bioquímica II', title: 'Catálogo eliminado', url: 'https://drive.google.com/file/d/catalog-removed/view', fileType: 'PDF' }
      ] }) });
    });

      await page.goto(new URL('/archivos.html?course=bioquimica', bootstrapPage.url()).href);
      await expect(page.locator('.file-group')).toHaveCount(1);
      await expect(page.locator('.file-group')).toHaveAttribute('data-course', 'bioquimica');
      await expect(page.locator('.file-row').filter({ hasText: 'Catálogo Bioquímica' })).toHaveCount(1);
      await expect(page.locator('.file-row').filter({ hasText: 'Archivo API Bioquímica' })).toHaveCount(1);
      await expect(page.locator('.file-row').filter({ hasText: 'Catálogo eliminado' })).toHaveCount(0);
      await expect(page.locator('.file-row').filter({ hasText: 'Catálogo Bioquímica' })).toHaveAttribute('data-file-recent', 'true');
      await expect(page.locator('.file-row').filter({ hasText: 'Catálogo Bioquímica' }).locator('[data-file-badge="drive"]')).toHaveCount(1);
      await expect(page.locator('#fileGroups')).not.toContainText('Catálogo Fisiología');

      await page.goto(new URL('/archivos.html', bootstrapPage.url()).href);
      await expect(page.locator('.file-group').filter({ hasText: 'Catálogo Fisiología' })).toHaveCount(1);
      expect(await page.locator('.file-group').count()).toBeGreaterThan(1);
    } finally {
      await isolatedContext.close();
    }
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
