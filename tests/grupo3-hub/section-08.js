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

  test('keeps homework compact and expands each brief inside Tareas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#pendientes');
    const tasks = page.locator('#classHubLiveTasks .live-task-details');
    await expect(tasks).toHaveCount(2);
    await expect(tasks.nth(0)).toContainText('Epidemiología');
    await expect(tasks.nth(1)).toContainText('Bioquímica II');
    const heights = await tasks.evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
    expect(Math.max(...heights)).toBeLessThan(100);
    await tasks.nth(0).locator('summary').click();
    await expect(tasks.nth(0)).toHaveAttribute('open', '');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#materias')).toBeHidden();
    await expect(tasks.nth(0)).toContainText('15 diapositivas como máximo');
    await expect(tasks.nth(0)).toContainText('Solo se entregan las diapositivas');
    await expect(tasks.nth(0).getByRole('link', { name: /Descargar la consigna en DOCX/ })).toHaveAttribute('href', /trabajo-practico-salud-publica-epidemiologia\.docx$/);
    const compactControls = await tasks.nth(0).evaluate((card) => {
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
    await expect(page.locator('.pending-grid')).toBeHidden();
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

  test('takes an explicitly linked task notice to its exact Tareas brief', async ({ page }) => {
    await page.route('**/api/class-hub**', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
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
      })
    }));
    await page.goto('/clase.html#inicio');
    await expect(page.locator('#classHubLiveTasks .live-task-details')).toHaveCount(2);
    const carousel = page.locator('#classHomeNoticeCarousel');
    await expect(carousel).toHaveAttribute('role', 'region');
    await expect(carousel.locator('.notice-item')).toHaveCount(1);
    await expect(carousel).toContainText('Exposición grupal de Epidemiología');
    await expect(carousel).not.toContainText('Cursos del 19 al 21 de agosto disponibles');
    await expect(carousel.locator('.notice-carousel-controls')).toHaveCount(0);
    await expect(page.locator('#noticeBell')).toHaveAttribute('aria-label', 'Abrir avisos · 1 importante');
    await page.locator('#noticeBell').click();
    await expect(page.locator('#avisos')).toBeVisible();
    await expect(page.locator('#classNoticePageList .notice-item')).toHaveCount(2);
    const taskNotice = page.locator('#classNoticePageList .notice-item').filter({ hasText: 'Exposición grupal de Epidemiología' });
    await expect(taskNotice).toBeVisible();
    const exactTaskLink = taskNotice.getByRole('link', { name: 'Ver tarea: Exposición grupal de enfermedad sorteada' });
    await expect(exactTaskLink).toHaveAttribute('href', '#task-epi-presentation');
    await exactTaskLink.click();
    await expect(page.locator('#avisos')).toBeHidden();
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#task-epi-presentation')).toHaveAttribute('open', '');
    await expect(page.locator('#task-bio-activities')).not.toHaveAttribute('open', '');
    await expect(page.locator('#classHubLiveTasks .live-task-details[open]')).toHaveCount(1);
    await expect(page).toHaveURL(/#task-epi-presentation$/);
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
