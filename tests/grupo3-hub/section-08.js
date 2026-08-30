module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('keeps the nutrition evaluation steps compact on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#nutrition-detail');

    const nutritionLayout = await page.evaluate(() => {
      const panel = document.querySelector('#nutricion .nutrition-core').getBoundingClientRect();
      const steps = [...document.querySelectorAll('#nutricion .nutrition-core li')].map((step) => step.getBoundingClientRect());
      return {
        panelHeight: panel.height,
        stepHeights: steps.map((step) => step.height),
        firstTwoShareRow: Math.abs(steps[0].top - steps[1].top) < 1,
        fifthStepSpansRow: steps[4].width > steps[0].width * 1.8,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(nutritionLayout.panelHeight).toBeLessThan(390);
    expect(Math.max(...nutritionLayout.stepHeights)).toBeLessThanOrEqual(72);
    expect(nutritionLayout.firstTwoShareRow).toBe(true);
    expect(nutritionLayout.fifthStepSpansRow).toBe(true);
    expect(nutritionLayout.scrollWidth).toBeLessThanOrEqual(nutritionLayout.clientWidth + 1);
  });

  test('keeps all current homework compact and expands each brief inside Tareas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#pendientes');
    const tasks = page.locator('#classHubLiveTasks .live-task-details');
    const practicalTask = page.locator('#task-class-practical-exams-2026-p1');
    const epidemiologyTask = page.locator('#task-epi-presentation');
    const biochemistryTask = page.locator('#task-bio-activities');
    await expect(tasks).toHaveCount(3);
    await expect(practicalTask).toContainText('Semana de pruebas prácticas');
    await expect(practicalTask).toContainText('Manchester, START y SHORT');
    await expect(practicalTask).toContainText('Sin celular ni tablet');
    await expect(practicalTask).toContainText('≈30 MIN');
    await expect(practicalTask).toContainText('la chompa es obligatoria');
    await expect(practicalTask).toContainText('04/09 · Bioquímica II');
    await expect(practicalTask).toContainText('Microbiología II · Práctica mantiene su clase del jueves por la tarde');
    expect(await practicalTask.locator('.live-task-body > .live-task-steps').first().locator('li strong').allTextContents()).toEqual([
      'LUN. 31/08 · Fisiología II',
      'MAR. 01/09 · Bioética',
      'MIÉ. 02/09 · Epidemiología',
      'JUE. 03/09 · Nutrición',
      'VIE. 04/09 · Bioquímica II'
    ]);
    await expect(page.locator('#task-bio-practical-2026-09-02')).toHaveCount(0);
    await expect(epidemiologyTask).toContainText('Epidemiología');
    await expect(biochemistryTask).toContainText('Bioquímica II');
    const heights = await tasks.evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
    expect(Math.max(...heights)).toBeLessThan(100);
    await practicalTask.locator('summary').click();
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(practicalTask).toHaveAttribute('open', '');
    await expect(practicalTask.locator('[data-task-toggle-label]')).toHaveText('Cerrar');
    await practicalTask.locator('summary').click();
    await expect(practicalTask).not.toHaveAttribute('open', '');
    await epidemiologyTask.locator('summary').click();
    await expect(epidemiologyTask).toHaveAttribute('open', '');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#materias')).toBeHidden();
    await expect(epidemiologyTask).toContainText('15 diapositivas como máximo');
    await expect(epidemiologyTask).toContainText('Solo se entregan las diapositivas');
    await expect(epidemiologyTask.getByRole('link', { name: /Descargar la consigna en DOCX/ })).toHaveAttribute('href', /trabajo-practico-salud-publica-epidemiologia\.docx$/);
    const compactControls = await epidemiologyTask.evaluate((card) => {
      const toggle = card.querySelector('.live-task-action');
      const download = card.querySelector('.live-task-download');
      const intro = card.querySelector('.live-task-intro');
      return {
        toggleHeight: toggle.getBoundingClientRect().height,
        togglePosition: getComputedStyle(toggle).position,
        downloadHeight: download.getBoundingClientRect().height,
        downloadWidth: download.getBoundingClientRect().width,
        cardWidth: card.getBoundingClientRect().width,
        introClamp: getComputedStyle(intro).webkitLineClamp
      };
    });
    expect(compactControls.toggleHeight).toBeLessThanOrEqual(32);
    expect(compactControls.togglePosition).toBe('static');
    expect(compactControls.downloadHeight).toBeGreaterThanOrEqual(44);
    expect(compactControls.downloadHeight).toBeLessThanOrEqual(46);
    expect(compactControls.downloadWidth).toBeLessThan(compactControls.cardWidth * 0.9);
    expect(compactControls.introClamp).not.toBe('1');
    await expect(page.locator('.pending-grid')).toBeVisible();
  });

  test('opens the selected homework from Home without entering a course', async ({ page }) => {
    await page.goto('/clase.html#inicio');
    const epidemiologyCard = page.locator('[data-task-id="epi-presentation"]');
    await expect(epidemiologyCard).toHaveAttribute('href', '#task-epi-presentation');
    await epidemiologyCard.click();
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#task-epi-presentation')).toHaveAttribute('open', '');
    await expect(page.locator('#epidemiologia')).toBeHidden();
    await expect(page).toHaveURL(/#task-epi-presentation$/);
  });

  test('opens the official practical calendar from Home and from a direct reload', async ({ page }) => {
    await page.goto('/clase.html#inicio');
    await page.locator('[data-practical-exams-p1]').click();
    await expect(page).toHaveURL(/#task-class-practical-exams-2026-p1$/);
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toHaveAttribute('open', '');
    await expect(page.locator('#task-class-practical-exams-2026-p1 summary')).toBeFocused();
    await page.reload();
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toHaveAttribute('open', '');
    await expect(page.locator('#task-class-practical-exams-2026-p1 summary')).toBeFocused();
    await expect(page.getByRole('link', { name: 'Ver grupos y trabajos de Bioquímica' })).toHaveAttribute('href', '/bioquimica-ii-grupos');
  });

  test('removes the practical-week card from active tasks after its Paraguay deadline', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-05T00:01:00-03:00'));
    await page.goto('/clase.html#inicio');
    await expect(page.locator('[data-practical-exams-p1]')).toHaveCount(0);
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toHaveCount(0);
    await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tareas activas');
    await page.goto('/clase.html#epidemiologia');
    const archivedProject = page.locator('#epi19-tarea');
    await expect(archivedProject).toBeVisible();
    await expect(archivedProject.locator('[data-project-status]')).toHaveText('PROYECTO ARCHIVADO · PRESENTACIÓN FINALIZADA');
    await expect(archivedProject.locator('[data-project-period]')).toHaveText('ACTIVIDAD ARCHIVADA');
    await expect(archivedProject.locator('[data-linked-task="epi-presentation"]')).toBeHidden();
  });

  test('takes an explicitly linked task notice to its exact Tareas brief', async ({ page: bootstrapPage, browser }) => {
    const linkedNoticeFixture = {
        ok: true,
        notices: [
          { id: 'week-2026-08-21', priority: 'normal', title: 'Cursos del 19 al 21 de agosto disponibles', body: 'Los cursos ya están organizados.' },
          { id: 'task-epi-notice', linkedTaskId: 'epi-presentation', priority: 'important', title: 'Exposición grupal de Epidemiología', body: 'Consulta la consigna exacta en Tareas.' }
        ],
        tasks: [
          { id: 'epi-presentation', course: 'Epidemiología', title: 'Exposición grupal de enfermedad sorteada', status: 'published', dueLabel: 'Mié. 26 ago.', dueAt: '2026-08-26T11:20:00-03:00' },
          { id: 'bio-activities', course: 'Bioquímica II', title: 'Actividades 3 y 4 impresas y manuscritas', status: 'published', dueLabel: 'Mié. 26 ago.', dueAt: '2026-08-26T09:10:00-03:00' }
        ],
        activities: [], groups: [], members: [], files: [], dates: []
    };
    const isolatedContext = await browser.newContext({ serviceWorkers: 'block' });
    const page = await isolatedContext.newPage();
    try {
      await page.route('**/api/class-hub**', (route) => {
        const url = new URL(route.request().url());
        if (url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(linkedNoticeFixture)
          });
        }
        return route.continue();
      });
      await page.goto(new URL('/clase.html#inicio', bootstrapPage.url()).href);
      await expect(page.locator('#classHubLiveTasks .live-task-details')).toHaveCount(3);
      const preview = page.locator('#classHomeNoticePreview');
      await expect(preview).toHaveAttribute('role', 'list');
      await expect(preview.locator('.notice-item')).toHaveCount(1);
      await expect(preview).toContainText('Exposición grupal de Epidemiología');
      await expect(preview).not.toContainText('Cursos del 19 al 21 de agosto disponibles');
      await expect(preview.locator('.notice-carousel-controls')).toHaveCount(0);
      await expect(page.locator('#noticeBell')).toHaveAttribute('aria-label', 'Abrir avisos · 1 importante');
      await page.locator('#noticeBell').click();
      await expect(page.locator('#avisos')).toBeVisible();
      await expect(page.locator('#classNoticePageList .notice-item')).toHaveCount(1);
      const taskNotice = page.locator('#classNoticePageList .notice-item').filter({ hasText: 'Exposición grupal de Epidemiología' });
      await expect(taskNotice).toBeVisible();
      await taskNotice.locator('.notice-caption-summary').click();
      await expect(taskNotice.locator('.notice-caption')).toHaveAttribute('open', '');
      const exactTaskLink = taskNotice.getByRole('link', { name: 'Ver tarea: Exposición grupal de enfermedad sorteada' });
      await expect(exactTaskLink).toHaveAttribute('href', '#task-epi-presentation');
      await exactTaskLink.click();
      await expect(page.locator('#avisos')).toBeHidden();
      await expect(page.locator('#pendientes')).toBeVisible();
      await expect(page.locator('#task-epi-presentation')).toHaveAttribute('open', '');
      await expect(page.locator('#task-bio-activities')).not.toHaveAttribute('open', '');
      await expect(page.locator('#classHubLiveTasks .live-task-details[open]')).toHaveCount(1);
      await expect(page).toHaveURL(/#task-epi-presentation$/);
    } finally {
      await isolatedContext.close();
    }
  });

  test('filters the central Avisos list by category, priority, subject and search without changing Home', async ({ page: bootstrapPage, browser }) => {
    const noticeFixture = {
      ok: true,
      notices: [
        { id: 'urgent-bio', course: 'Bioquímica II', category: 'academic', priority: 'urgent', title: 'Guía metabólica', body: 'Repasar pentosas antes de la próxima clase.' },
        { id: 'urgent-fisio', course: 'Fisiología II', category: 'schedule', priority: 'urgent', title: 'Cambio de aula', body: 'La clase empieza en el laboratorio.' },
        { id: 'important-bio', course: 'Bioquímica II', category: 'resource', priority: 'important', title: 'Material nuevo', body: 'Ya está disponible la presentación.' },
        { id: 'normal-epi', course: 'Epidemiología y Salud Pública', category: 'academic', priority: 'normal', title: 'Lectura recomendada', body: 'Consulta el material de triaje.' },
        { id: 'normal-general', course: '', category: 'general', priority: 'normal', title: 'Aviso general', body: 'Información para toda la clase.' },
        { id: 'bus-transport', course: '', category: 'transport', priority: 'normal', title: 'Última salida del bus', body: 'El transporte universitario sale a las 20:30.' }
      ],
      tasks: [], activities: [], groups: [], members: [], files: [], dates: []
    };
    const isolatedContext = await browser.newContext({ serviceWorkers: 'block' });
    const page = await isolatedContext.newPage();
    try {
      await page.route('**/api/class-hub**', (route) => {
        const url = new URL(route.request().url());
        if (url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(noticeFixture) });
        }
        return route.continue();
      });
      await page.goto(new URL('/clase.html#avisos', bootstrapPage.url()).href);
      const list = page.locator('#classNoticePageList');
      const count = page.locator('#classNoticeResultCount');
      const search = page.locator('#classNoticeSearch');
      const subject = page.locator('#classNoticeSubjectFilter');
      await expect(list.locator('.notice-item')).toHaveCount(6);
      await expect(count).toHaveText('6 avisos vigentes');
      await expect(count).toHaveAttribute('role', 'status');
      await expect(count).toHaveAttribute('aria-live', 'polite');
      await expect(count).toHaveAttribute('aria-atomic', 'true');

      const transport = page.locator('[data-notice-category="transport"]');
      await expect(transport).toBeVisible();
      await transport.click();
      await expect(transport).toHaveAttribute('aria-pressed', 'true');
      await expect(list.locator('.notice-item')).toHaveCount(1);
      await expect(list.locator('.notice-item[data-category="transport"]')).toContainText('Última salida del bus');
      await expect(count).toHaveText('1 de 6 avisos vigentes');
      await page.locator('#classNoticeFilters').evaluate((form) => form.reset());
      await expect(list.locator('.notice-item')).toHaveCount(6);

      await page.locator('.notice-filter-advanced > summary').click();
      const urgent = page.locator('[data-notice-priority="urgent"]');
      await urgent.click();
      await expect(urgent).toHaveAttribute('aria-pressed', 'true');
      await expect(list.locator('.notice-item')).toHaveCount(2);
      await expect(list.locator('.notice-item[data-priority="urgent"]')).toHaveCount(2);

      await subject.selectOption('bioquimica');
      await expect(list.locator('.notice-item')).toHaveCount(1);
      await expect(list.locator('.notice-item[data-subject="bioquimica"]')).toContainText('Guía metabólica');
      await search.fill('PENTOSAS');
      await expect(list.locator('.notice-item')).toHaveCount(1);
      await search.fill('término ausente');
      await expect(list.locator('.notice-item')).toHaveCount(0);
      await expect(list.locator('.notice-empty')).toHaveText('No hay avisos vigentes que coincidan con estos filtros.');
      await expect(count).toHaveText('0 de 6 avisos vigentes');
      await expect(page.locator('#classHomeNoticePreview .notice-item')).toHaveCount(3);

      await page.locator('#classNoticeFilters').evaluate((form) => form.reset());
      await expect(list.locator('.notice-item')).toHaveCount(6);
      await expect(count).toHaveText('6 avisos vigentes');
      await expect(page.locator('[data-notice-category="all"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-notice-priority="all"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(subject).toHaveValue('all');
      await expect(search).toHaveValue('');
    } finally {
      await isolatedContext.close();
    }
  });

  test('renders structured notice metadata, safe destinations and only active Home highlights', async ({ page: bootstrapPage, browser }) => {
    const structuredFixture = {
      ok: true,
      notices: [
        { id: 'active-file', course: 'Bioquímica II', priority: 'important', title: 'Guía oficial <img src=x>', body: 'Material confirmado.', category: 'resource', lifecycle: 'active', audience: 'students', effectiveAt: '2020-08-27T09:00:00-03:00', expiresAt: '2099-08-30T18:00:00-03:00', sourceLabel: 'UCP Oficial', sourceUrl: 'https://www.ucp.edu.py/aviso', imageUrl: 'https://example.test/ucp-notice.svg', imageAlt: 'Comunicado oficial de Bioquímica', targetType: 'file', targetId: 'course-file', changeSummary: 'Se reemplazó el enlace preliminar.', revision: 2 },
        { id: 'scheduled', priority: 'important', title: 'Próximo aviso', category: 'schedule', lifecycle: 'scheduled', audience: 'all', effectiveAt: '2099-09-01T08:00:00-03:00', sourceLabel: 'Mensaje oficial', sourceUrl: 'http://insecure.example/notice' },
        { id: 'updated-date', priority: 'normal', title: 'Fecha actualizada', category: 'assessment', lifecycle: 'updated', audience: 'all', targetType: 'date', targetId: 'exam-date' },
        { id: 'extended-task', priority: 'normal', title: 'Entrega ampliada', category: 'task', lifecycle: 'extended', audience: 'students', targetType: 'task', targetId: 'epi-presentation' },
        { id: 'corrected-subject', priority: 'normal', title: 'Contenido corregido', category: 'academic', lifecycle: 'corrected', audience: 'students', targetType: 'subject', targetId: 'bioquimica-ii' },
        { id: 'replaced', priority: 'urgent', title: 'Aviso reemplazado', lifecycle: 'replaced', audience: 'all' },
        { id: 'cancelled', priority: 'urgent', title: 'Aviso cancelado', lifecycle: 'cancelled', audience: 'all' },
        { id: 'expired', priority: 'important', title: 'Aviso vencido', lifecycle: 'expired', audience: 'all' },
        { id: 'expired-by-date', priority: 'important', title: 'Vigencia terminada', lifecycle: 'active', audience: 'all', expiresAt: '2021-08-27T09:00:00-03:00' }
      ],
      tasks: [
        { id: 'epi-presentation', course: 'Epidemiología', title: 'Exposición grupal', status: 'published', dueAt: '2099-09-02T08:00:00-03:00' }
      ],
      files: [
        { id: 'course-file', course: 'Bioquímica II', title: 'Guía metabólica.pdf', url: 'https://drive.google.com/file/d/course-file/view', fileType: 'PDF', status: 'published' }
      ],
      dates: [
        { id: 'exam-date', course: 'Bioquímica II', label: 'Primer parcial', startsAt: '2099-09-10T09:00:00-03:00', status: 'published' }
      ],
      activities: [], groups: [], members: []
    };
    const isolatedContext = await browser.newContext({ serviceWorkers: 'block' });
    const page = await isolatedContext.newPage();
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.route('https://example.test/ucp-notice.svg', (route) => route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><rect width="100%" height="100%" fill="#0e7490"/></svg>'
      }));
      await page.route('**/api/class-hub**', (route) => {
        const url = new URL(route.request().url());
        if (url.searchParams.get('class') === 's4-e' && url.searchParams.get('resource') === 'public') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(structuredFixture) });
        }
        return route.continue();
      });
      await page.goto(new URL('/clase.html#inicio', bootstrapPage.url()).href);

      const preview = page.locator('#classHomeNoticePreview');
      await expect(preview.locator('.notice-item')).toHaveCount(2);
      await expect(preview).toContainText('Guía oficial <img src=x>');
      await expect(preview).toContainText('Próximo aviso');
      await expect(preview).not.toContainText('Material confirmado.');
      await expect(preview.locator('.notice-meta, .notice-badges, .notice-caption')).toHaveCount(0);
      await expect(preview.locator('img')).toHaveCount(1);
      await expect(preview.locator('img')).toHaveAttribute('src', 'https://example.test/ucp-notice.svg');
      const activePreviewLink = preview.getByRole('link', { name: 'Abrir aviso: Guía oficial <img src=x>' });
      await expect(activePreviewLink).toHaveAttribute('href', /^#notice-active-file-/);
      const compactPreviewLayout = await activePreviewLink.evaluate((link) => {
        const image = link.querySelector('img');
        const thumbnail = link.querySelector('.notice-preview-thumb');
        const title = link.querySelector('.notice-preview-title');
        const linkBox = link.getBoundingClientRect();
        const thumbnailBox = thumbnail.getBoundingClientRect();
        const titleBox = title.getBoundingClientRect();
        return {
          objectFit: getComputedStyle(image).objectFit,
          linkHeight: linkBox.height,
          thumbnailLeft: thumbnailBox.left,
          thumbnailRight: thumbnailBox.right,
          titleLeft: titleBox.left,
          viewportOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(compactPreviewLayout.objectFit).toBe('contain');
      expect(compactPreviewLayout.linkHeight).toBeGreaterThanOrEqual(80);
      expect(compactPreviewLayout.linkHeight).toBeLessThanOrEqual(90);
      expect(compactPreviewLayout.thumbnailLeft).toBeLessThan(compactPreviewLayout.titleLeft);
      expect(compactPreviewLayout.thumbnailRight).toBeLessThanOrEqual(compactPreviewLayout.titleLeft + 1);
      expect(compactPreviewLayout.viewportOverflow).toBeLessThanOrEqual(1);
      const noImagePreview = preview.locator('.notice-preview-tile:not(.has-thumbnail) .notice-preview-link');
      await expect(noImagePreview).toHaveCount(1);
      expect((await noImagePreview.evaluate((link) => getComputedStyle(link).gridTemplateColumns)).split(' ')).toHaveLength(1);
      await expect(page.locator('#noticeBell')).toHaveAttribute('data-count', '2');

      await activePreviewLink.click();
      await expect(page).toHaveURL(/#notice-active-file-/);
      await expect(page.locator('#avisos')).toBeVisible();
      const list = page.locator('#classNoticePageList');
      await expect(list.locator('.notice-item')).toHaveCount(5);
      for (const label of ['ACTIVO', 'PROGRAMADO', 'ACTUALIZADO', 'AMPLIADO', 'CORREGIDO']) {
        await expect(list).toContainText(label);
      }
      for (const title of ['Aviso reemplazado', 'Aviso cancelado', 'Aviso vencido', 'Vigencia terminada']) {
        await expect(list).not.toContainText(title);
      }

      const active = list.locator('.notice-item').filter({ hasText: 'Guía oficial' });
      const activeCaption = active.locator('.notice-caption');
      const activeImage = active.getByRole('img', { name: 'Comunicado oficial de Bioquímica' });
      await expect(activeCaption).toHaveAttribute('open', '');
      await expect(active.getByRole('link', { name: 'Abrir imagen: Comunicado oficial de Bioquímica' })).toHaveAttribute('href', 'https://example.test/ucp-notice.svg');
      await expect(activeImage).toHaveAttribute('loading', 'lazy');
      await expect(activeImage).toHaveAttribute('referrerpolicy', 'no-referrer');
      const imageFirstLayout = await active.evaluate((card) => {
        const media = card.querySelector('.notice-media').getBoundingClientRect();
        const copy = card.querySelector('.notice-copy').getBoundingClientRect();
        const bounds = card.getBoundingClientRect();
        return { mediaWidth: media.width, cardWidth: bounds.width, mediaBottom: media.bottom, copyTop: copy.top };
      });
      expect(imageFirstLayout.mediaWidth).toBeLessThanOrEqual(imageFirstLayout.cardWidth - 18);
      expect(imageFirstLayout.mediaWidth).toBeGreaterThan(imageFirstLayout.cardWidth * 0.8);
      expect(imageFirstLayout.mediaBottom).toBeLessThanOrEqual(imageFirstLayout.copyTop + 1);
      await expect(activeCaption.locator('.notice-caption-preview')).toContainText('Material confirmado.');
      await activeCaption.locator('.notice-caption-summary').click();
      await expect(activeCaption).not.toHaveAttribute('open', '');
      await expect(activeCaption.locator('.notice-caption-more')).toHaveText('Ver más');
      await expect(activeCaption.locator('.notice-caption-content')).toBeHidden();
      await expect(activeCaption.locator('.notice-caption-more')).toBeVisible();
      await expect(activeCaption.locator('.notice-caption-less')).toBeHidden();
      await activeCaption.locator('.notice-caption-summary').click();
      await expect(activeCaption).toHaveAttribute('open', '');
      await expect(activeCaption.locator('.notice-caption-less')).toHaveText('Ver menos');
      await expect(activeCaption.locator('.notice-caption-content')).toBeVisible();
      await expect(activeCaption.locator('.notice-caption-more')).toBeHidden();
      await expect(activeCaption.locator('.notice-caption-less')).toBeVisible();
      await expect(active).toContainText('MATERIAL');
      await expect(active).toContainText('ESTUDIANTES');
      await expect(active).toContainText('VERSIÓN 2');
      await expect(active).toContainText('Vigente desde');
      await expect(active).toContainText('Vence');
      await expect(active).toContainText('Se reemplazó el enlace preliminar.');
      await expect(active.getByRole('link', { name: 'Fuente: UCP Oficial ↗' })).toHaveAttribute('href', 'https://www.ucp.edu.py/aviso');
      await expect(active.getByRole('link', { name: 'Abrir archivo: Guía metabólica.pdf' })).toHaveAttribute('href', 'https://drive.google.com/file/d/course-file/view');
      await expect(active.locator('img[src="x"]')).toHaveCount(0);

      const scheduled = list.locator('.notice-item').filter({ hasText: 'Próximo aviso' });
      await scheduled.locator('.notice-caption-summary').click();
      await expect(scheduled.locator('a[href^="http://insecure.example"]')).toHaveCount(0);
      await expect(scheduled).toContainText('Fuente: Mensaje oficial');
      const updatedDate = list.locator('.notice-item').filter({ hasText: 'Fecha actualizada' });
      await updatedDate.locator('.notice-caption-summary').click();
      await expect(updatedDate.getByRole('link', { name: /Ver fecha en el calendario/ })).toHaveAttribute('href', '#horario');
      const extendedTask = list.locator('.notice-item').filter({ hasText: 'Entrega ampliada' });
      await extendedTask.locator('.notice-caption-summary').click();
      await expect(extendedTask.getByRole('link', { name: 'Ver tarea: Exposición grupal' })).toHaveAttribute('href', '#task-epi-presentation');
      const correctedSubject = list.locator('.notice-item').filter({ hasText: 'Contenido corregido' });
      await correctedSubject.locator('.notice-caption-summary').click();
      await expect(correctedSubject.getByRole('link', { name: /Abrir materia: Bioquímica II/ })).toHaveAttribute('href', '#bioquimica');
    } finally {
      await isolatedContext.close();
    }
  });

  test('keeps the Avisos filters inside 320 to 430 pixel viewports', async ({ page }) => {
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/clase.html#avisos');
      const layout = await page.evaluate(() => {
        const filters = document.querySelector('#classNoticeFilters').getBoundingClientRect();
        const controls = [...document.querySelectorAll('#classNoticeFilters button, #classNoticeFilters select, #classNoticeFilters input')].filter((node) => node.offsetParent !== null);
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          filtersLeft: filters.left,
          filtersRight: filters.right,
          viewportWidth: window.innerWidth,
          minimumControlHeight: Math.min(...controls.map((node) => node.getBoundingClientRect().height)),
          searchFontSize: Number.parseFloat(getComputedStyle(document.querySelector('#classNoticeSearch')).fontSize)
        };
      });
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
      expect(layout.filtersLeft).toBeGreaterThanOrEqual(0);
      expect(layout.filtersRight).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.minimumControlHeight).toBeGreaterThanOrEqual(44);
      expect(layout.searchFontSize).toBeGreaterThanOrEqual(16);
    }
  });

  test('publishes the previous Epidemiology class as Wednesday 12 August', async ({ page }) => {
    await page.goto('/clase.html#epidemiologia-bloque-anterior');
    const historyDate = page.locator('[data-lesson-target="epidemiologia-bloque-anterior"] time');
    await expect(historyDate).toHaveAttribute('datetime', '2026-08-12');
    await expect(historyDate).toHaveText('12 AGO 2026');
    await expect(page.locator('#epidemiologia .source-pill')).toContainText('Clase confirmada · 12 ago.');
    const lesson = await page.evaluate(() => window.MedNykutoAcademicModel.subjects.epidemiologia.chapters[0].lessons[0]);
    expect(lesson.dateLong).toBe('12 de agosto de 2026');
    expect(lesson.status).toBe('confirmed');
  });

  test('opens map explanations and oral answers as small inline disclosures', async ({ page }) => {
    await page.goto('/clase.html#nutricion-2026-08-13');
    const nutrition = page.locator('#nutricion');
    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="material"]').click();
    await nutrition.locator('[data-nutrition-mode="completo"]').click();
    await expect(page.locator('#nutritionPreviewEyebrow')).toHaveText('RESUMEN COMPLETO · 13 AGO. ESTIMADO');
    const mapAnswer = nutrition.locator('.study-map .preview-answer-disclosure').first();
    await expect(mapAnswer.locator('strong')).toHaveText('¿Cuánto necesita?');
    await mapAnswer.locator('summary').click();
    await expect(mapAnswer).toHaveAttribute('open', '');
    await expect(mapAnswer.locator('.preview-answer-inline')).toContainText('Comparar ingesta con gasto');
    await expect(page.locator('#studyAnswerModal')).toHaveCount(0);
    await mapAnswer.locator('summary').click();
    await expect(mapAnswer).not.toHaveAttribute('open', '');

    await nutrition.locator('[data-nutrition-mode="oral"]').click();
    const oralAnswer = nutrition.locator('.oral-list .preview-answer-disclosure').first();
    await expect(oralAnswer.locator('strong')).toContainText('diferencia entre alimentación, nutrición y dieta');
    await oralAnswer.locator('summary').click();
    await expect(oralAnswer).toHaveAttribute('open', '');
    await expect(oralAnswer.locator('.preview-answer-inline')).toContainText('Alimentación es la selección');
    await oralAnswer.locator('summary').click();
    await expect(oralAnswer).not.toHaveAttribute('open', '');
  });

  test('separates the complete narrative, original material and training into compact tabs', async ({ page }) => {
    await page.goto('/clase.html#nutricion-2026-08-13');
    await expect(page.locator('#nutricion-2026-08-13 [data-lesson-tab="curso"]')).toBeVisible();
    await expect(page.locator('#nutricion-2026-08-13 .course-chapter-section')).toHaveCount(6);
    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="material"]').click();
    await expect(page.locator('#nutrition-detail')).toBeAttached();
    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="training"]').click();
    await expect(page.locator('#practice-nutricion')).toBeVisible();
  });

  test('opens a real format chooser after a completed training block', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('med-nykuto-class-practice-v431', JSON.stringify({
        nutricion:{
          qcm:Array.from({ length:20 }, () => ({ selected:0, correct:true })),
          vf:[],
          cases:[]
        }
      }));
    });
    await page.goto('/clase.html#practice-nutricion');
    await page.reload();
    const practice = page.locator('#practice-nutricion');
    await expect(practice.getByText('QCM · BLOQUE TERMINADO')).toBeVisible();
    await practice.getByRole('button', { name: 'Elegir otro formato' }).click();
    const picker = practice.locator('.practice-format-picker');
    await expect(picker).toBeVisible();
    await expect(picker.locator('.practice-format-choice')).toHaveCount(3);
    await picker.getByRole('button', { name: /Verdadero \/ Falso/ }).click();
    await expect(practice.getByRole('heading', { name: /Es correcto afirmar que, en la alimentación/i })).toBeVisible();

    await page.reload();
    await practice.getByRole('button', { name: 'Repetir QCM' }).click();
    await expect(practice.getByRole('heading', { name: '¿Qué acciones forman parte de la alimentación?' })).toBeVisible();
  });
};
