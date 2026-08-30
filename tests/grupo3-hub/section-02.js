module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('keeps deep links working and opens the required class detail', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    await expect(page.locator('#materias')).toBeVisible();
    await expect(page.locator('#nutricion')).toBeVisible();
    await expect(page.locator('#nutrition-detail')).toBeVisible();
    await expect(page.locator('#nutricion [data-detail-toggle]')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('heading', { name: 'Seminario / presentación oral' })).toBeVisible();
  });

  test('shows the shared timetable and calculates the next class', async ({ page }) => {
    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.locator('#nextScheduleWhen')).toContainText('·');
    await expect(page.getByText('No hay clases el martes ni el sábado')).toBeVisible();
    await expect(page.locator('#scheduleWeekRange')).toContainText(/Semana del \d+/);
    for (const day of ['1','3','4','5']) {
      await expect(page.locator(`[data-week-date="${day}"]`)).toHaveText(/\d{1,2} [a-záéíóú]+\.?/i);
      await expect(page.locator(`[data-week-date="${day}"]`)).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    }
    await expect(page.locator('#weeklyAgenda .course-type-badge')).toHaveText(['TEÓRICA','PRÁCTICA']);
    await expect(page.locator('#weeklyAgenda .schedule-task-badge')).toHaveCount(4);
    await expect(page.locator('.schedule-slot[data-subject="nutrition"]')).toContainText('sin clase teórica nueva');
    await expect(page.locator('.agenda-day')).toHaveCount(4);
    await expect(page.locator('.schedule-guide-card')).toBeVisible();
    const desktopOrder = await page.evaluate(() => {
      const summary = document.querySelector('.agenda-summary').getBoundingClientRect();
      const grid = document.querySelector('#weeklyAgenda').getBoundingClientRect();
      return { summaryTop: summary.top, gridTop: grid.top };
    });
    expect(desktopOrder.summaryTop).toBeLessThan(desktopOrder.gridTop);
    await expect(page.locator('.schedule-slot small').first()).toBeVisible();
    await expect(page.getByText('KM 8', { exact: true })).toHaveCount(0);
  });

  test('shows the live iCal subscription directly inside Horario with a secure copy fallback', async ({ page }) => {
    await page.goto('/clase.html#horario');

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText(value) {
            window.__copiedClassCalendarUrl = value;
            return Promise.resolve();
          }
        }
      });
    });

    const subscription = page.locator('#classCalendarSubscription');
    const summary = subscription.locator('summary');
    const link = page.locator('#classCalendarSubscribeLink');
    const copy = page.locator('#classCalendarCopyLink');
    await expect(subscription).toBeVisible();
    await expect(summary).toContainText('iCal');
    await expect(link).toBeHidden();
    expect((await summary.boundingBox()).height).toBeLessThanOrEqual(44);
    await summary.click();
    await expect(subscription).toHaveAttribute('open', '');
    await expect(subscription).toContainText('Se actualiza cuando publicamos cambios.');
    await expect(link).toHaveAttribute('href', 'webcal://127.0.0.1:4173/api/class-calendar.ics?class=s4-e');
    await expect(link).toHaveAttribute('data-https-url', 'https://127.0.0.1:4173/api/class-calendar.ics?class=s4-e');
    expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect((await copy.boundingBox()).height).toBeGreaterThanOrEqual(44);

    await copy.click();
    await expect.poll(() => page.evaluate(() => window.__copiedClassCalendarUrl || '')).toMatch(/\/api\/class-calendar\.ics\?class=s4-e$/);
    await expect(page.locator('#classCalendarSubscriptionStatus')).toHaveText('Enlace HTTPS copiado. Añádelo como calendario por URL.');
  });

  test('persists the accessible light theme across lessons and training', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('med-nykuto-theme-v1'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const toggle = page.locator('[data-public-theme-toggle]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect((await toggle.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f4f7fb');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.goto('/clase.html#materias');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('#materias')).toBeVisible();
    await page.goto('/comunidade.html#ranking');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('[data-public-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-public-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('switches the class interface between Spanish and Brazilian Portuguese', async ({ page }) => {
    const language = page.locator('#classLanguageSelect');
    await expect(language).toHaveValue('es');
    await language.selectOption('br');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('#classLanguageSelect')).toHaveValue('br');
    await expect(page.getByRole('heading', { name: 'Sua semana', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aulas reconstruídas e revisadas', exact: true })).toBeVisible();
    await expect(page.locator('.home-transcript-bio')).toContainText('Pentoses: regulação, balanços e destinos');
    await expect(page.locator('.home-transcript-epi')).toContainText('Sistema paraguaio, RIISS e níveis de atenção');
    await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tarefas ativas');
    await expect(page.locator('#lastUpdated')).toHaveText('Atualizado em 28 ago. · conteúdo revisado');
    await expect(page.locator('#lastUpdated')).toHaveAttribute('datetime', '2026-08-28');
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver todas as tarefas' })).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav').getByText('Tarefas', { exact: true })).toBeAttached();
    await expect(page.locator('.mobile-bottom-nav').getByText('Matérias', { exact: true })).toBeAttached();

    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toContainText('Semana de provas práticas');
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toContainText('Sem celular nem tablet');
    await expect(page.locator('#task-class-practical-exams-2026-p1')).toContainText('SEX. 04/09 · Bioquímica II');
    const practicalExamCard = page.locator('#task-class-practical-exams-2026-p1');
    await practicalExamCard.locator('summary').click();
    await expect(practicalExamCard.locator('[data-task-toggle-label]')).toHaveText('Fechar');
    await practicalExamCard.locator('summary').click();
    await expect(practicalExamCard.locator('[data-task-toggle-label]')).toHaveText('Abrir');

    await page.goto('/clase.html#bioquimica-2026-08-28');
    const reviewedPractice = page.locator('#bioquimica-2026-08-28 [data-practice-root="bioquimica-2026-08-28"]');
    await expect(reviewedPractice).toContainText('Via das pentoses-fosfato: integração metabólica');
    await page.locator('#bioquimica-2026-08-28 [data-lesson-tab="training"]').click();
    await reviewedPractice.locator('.practice-start').click();
    await expect(reviewedPractice.locator('.practice-sources')).toContainText('AULA REVISADA · AULA + FONTES OFICIAIS');
    await expect(reviewedPractice.locator('.practice-sources')).toContainText('NCBI · G6PD e defesa antioxidante');
    await reviewedPractice.locator('.practice-dialog-close').click();
    await page.locator('#bioquimica-2026-08-28 [data-lesson-tab="ia"]').click();
    const biochemistryAudit = page.locator('#bioquimica-2026-08-28 [data-lesson-tab-panel="ia"]');
    await expect(biochemistryAudit).toContainText('Cinco aulas orais completas');
    await expect(biochemistryAudit.locator('.lesson-teacher-prompt p')).toContainText('Atue como a Dra. Andrea López');
    await expect(biochemistryAudit.locator('.lesson-teacher-prompt p')).toContainText('Aula ativa:');
    await page.goto('/clase.html#epidemiologia-2026-08-28');
    await page.locator('#epidemiologia-2026-08-28 [data-lesson-tab="ia"]').click();
    const epidemiologyAudit = page.locator('#epidemiologia-2026-08-28 [data-lesson-tab-panel="ia"]');
    await expect(epidemiologyAudit).toContainText('Seis blocos observados');
    await expect(epidemiologyAudit).toContainText('Pede a aplicação de um algoritmo de classificação completo');
    await expect(epidemiologyAudit).not.toContainText('Seis bloques observados');

    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horário do 4.º E' })).toBeVisible();
    await expect(page.locator('[data-week-date="1"]')).toHaveText(/\d{1,2}/);
    await expect(page.locator('#weeklyAgenda')).toContainText('Microbiologia II');
    await expect(page.locator('#weeklyAgenda')).toContainText('TEÓRICA');
    await expect(page.locator('#weeklyAgenda')).toContainText('PRÁTICA');
    await expect(page.locator('#weeklyAgenda').getByText('Tarefa', { exact: true })).toBeVisible();

    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tarefas ativas' })).toBeVisible();
    await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(3);
    await expect(page.locator('#nutritionPrepCard')).toBeVisible();
    await page.goto('/clase.html#nutricion');
    await page.locator('#nutricion .notebook-date[data-lesson-id="nutricion-2026-08-13"]').click();
    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="material"]').click();
    await page.locator('[data-nutrition-mode="rapido"]').click();
    await expect(page.locator('#nutritionPreviewEyebrow')).toHaveText('RESUMO RÁPIDO · 10 IDEIAS');

    await page.goto('/clase.html#plan-estudio');
    await expect(page.getByText('ARQUIVOS PARA COMEÇAR', { exact: true })).toBeVisible();
    await expect(page.locator('#plan-estudio').getByRole('link', { name: 'Ver exemplo da primeira página', exact: true })).toBeVisible();
    await expect(page.locator('#plan-estudio')).not.toContainText(/Primera página|Documento firmado|Este paso se completa/);

    await page.locator('#classLanguageSelect').selectOption('es');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { name: 'Plan del seminario' })).toBeVisible();
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas activas' })).toBeVisible();
    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible();
  });

  test('keeps the personal lab group separate and local to the device', async ({ page }) => {
    await page.goto('/clase.html#horario');
    const groupSelector = page.getByLabel('Mi grupo de Microbiología II · Práctica');
    await expect(groupSelector).toHaveValue('');
    await groupSelector.selectOption('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
    await expect(page.locator('#labScheduleTime')).toHaveText('18:00–20:00');
    await page.reload();
    await expect(groupSelector).toHaveValue('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
  });
};
