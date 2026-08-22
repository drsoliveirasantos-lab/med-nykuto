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

  test('switches the class interface between Spanish and Brazilian Portuguese', async ({ page }) => {
    const language = page.locator('#classLanguageSelect');
    await expect(language).toHaveValue('es');
    await language.selectOption('br');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('#classLanguageSelect')).toHaveValue('br');
    await expect(page.getByRole('heading', { name: 'Sua semana', exact: true })).toBeVisible();
    await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tarefas ativas');
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver todas as tarefas' })).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav').getByText('Tarefas', { exact: true })).toBeAttached();
    await expect(page.locator('.mobile-bottom-nav').getByText('Matérias', { exact: true })).toBeAttached();

    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horário do 4.º E' })).toBeVisible();
    await expect(page.locator('[data-week-date="1"]')).toHaveText(/\d{1,2}/);
    await expect(page.locator('#weeklyAgenda')).toContainText('Microbiologia II');
    await expect(page.locator('#weeklyAgenda')).toContainText('TEÓRICA');
    await expect(page.locator('#weeklyAgenda')).toContainText('PRÁTICA');
    await expect(page.locator('#weeklyAgenda').getByText('Tarefa', { exact: true })).toBeVisible();

    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tarefas ativas' })).toBeVisible();
    await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(2);
    await expect(page.locator('#nutritionPrepCard')).toBeHidden();
    await page.goto('/clase.html#nutricion');
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
