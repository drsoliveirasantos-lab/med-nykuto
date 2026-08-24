module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tu semana', exact: true })).toBeVisible();
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.locator('#inicio')).not.toContainText(/de un vistazo|EN PORTADA|Panel de estudio/);
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.getByRole('link', { name: /Exposición grupal de enfermedad sorteada/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Actividades 3 y 4 impresas y manuscritas/ })).toBeVisible();
    await expect(page.locator('.priority-card-head time')).toHaveCount(2);
    await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tareas activas');
    await expect(page.locator('#lastUpdated')).toHaveAttribute('datetime', '2026-08-24');
    await expect(page.locator('#lastUpdated')).toContainText('Actualizado 24 ago.');
    await expect(page.locator('#horario')).toBeHidden();
    await expect(page.locator('#materias')).toBeHidden();
  });

  test('keeps the official UCP portal and shared class files visible from the home page', async ({ page }) => {
    const portal = page.getByRole('link', { name:/Abrir el Portal UCP/ });
    await expect(portal).toBeVisible();
    await expect(portal).toHaveAttribute('href', 'https://virtual.central.edu.py/auth');
    await expect(portal).toHaveAttribute('target', '_blank');
    await expect(portal).toHaveAttribute('rel', /noopener/);
    await expect(portal).toHaveAttribute('rel', /noreferrer/);
    await expect(portal).toContainText('Notas y aula virtual');

    const homeDrive = page.locator('.home-quick-links [data-class-drive-link]');
    await expect(homeDrive).toBeVisible();
    await expect(homeDrive).toHaveAttribute('href', CLASS_DRIVE_URL);
    await expect(homeDrive).toContainText('PDF y PowerPoint');
    await expect(page.getByRole('button', { name:/Apoyar el proyecto/ })).toBeVisible();
  });

  test('uses clickable views and shows only one course at a time', async ({ page }) => {
    await page.locator('.workspace-nav [data-view-link="cursos"]').click();
    await expect(page.locator('#materias')).toBeVisible();
    await expect(page.locator('#nutricion')).toBeVisible();
    await expect(page.locator('#fisiologia')).toBeHidden();
    await expect(page.locator('#nutrition-detail')).toBeHidden();

    await page.locator('[data-course-target="fisiologia"]').click();
    await expect(page.locator('#nutricion')).toBeHidden();
    await expect(page.locator('#fisiologia')).toBeVisible();
    await expect(page.locator('#fisiologia-2026-08-20')).toBeVisible();
    await expect(page.locator('#fisiologia-2026-08-17')).toBeHidden();
    await expect(page.locator('#practice-fisiologia-2026-08-20')).toContainText('40 preguntas');
  });

  test('opens the selected subject directly in its notebook without a duplicate shortcut', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const shortcut = page.locator('#coursePracticeShortcut');
    await expect(shortcut).toBeHidden();
    await page.locator('[data-course-target="bioquimica"]').click();
    await expect(page.locator('#bioquimica .notebook-shell')).toBeVisible();
    await expect(page.locator('#bioquimica .notebook-current-title')).toContainText('Cetoacidosis diabética');
    await page.locator('#bioquimica-2026-08-21 [data-lesson-tab="training"]').click();
    await page.locator('#practice-bioquimica-2026-08-21').getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(page.locator('#practice-bioquimica-2026-08-21-dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#practice-bioquimica-2026-08-21 .practice-workspace')).toBeVisible();
    await expect(page.locator('#practice-bioquimica-2026-08-21 .practice-teacher-angle')).toContainText('Dra. Andrea López');
    await expect(page.locator('body')).toHaveClass(/practice-modal-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#practice-bioquimica-2026-08-21-dialog')).not.toHaveAttribute('open', '');
    await expect(page.locator('body')).not.toHaveClass(/practice-modal-open/);
  });

  test('keeps the shared Drive only on Home and removes the duplicate from Materias', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const driveLinks = page.locator('[data-class-drive-link]');
    await expect(driveLinks).toHaveCount(1);
    await expect(page.locator('#materias [data-class-drive-link], .subject-section [data-class-drive-link]')).toHaveCount(0);
    await page.goto('/clase.html#inicio');
    await expect(driveLinks).toBeVisible();
    await expect(driveLinks).toHaveAttribute('href', CLASS_DRIVE_URL);
  });
};
