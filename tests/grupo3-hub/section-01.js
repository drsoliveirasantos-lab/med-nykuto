module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tu semana', exact: true })).toBeVisible();
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.locator('#inicio')).not.toContainText(/de un vistazo|EN PORTADA|Panel de estudio/);
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.getByRole('link', { name: /Exposición grupal de enfermedad sorteada/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Actividades 3 y 4 impresas y manuscritas/ })).toBeVisible();
    await expect(page.locator('.priority-card-head time')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'TAREAS', exact: true })).toBeVisible();
    await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tareas');
    await expect(page.locator('#lastUpdated')).toHaveAttribute('datetime', '2026-08-21');
    await expect(page.locator('#lastUpdated')).toContainText('Actualizado 21 ago.');
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

  test('keeps a compact training shortcut directly below the selected course grid', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const shortcut = page.locator('#coursePracticeShortcut');
    await expect(shortcut).toBeVisible();
    await expect(shortcut.locator('#coursePracticeShortcutLabel')).toHaveText('Entrenar');
    await expect(shortcut.locator('#coursePracticeShortcutCourse')).toHaveText('Nutrición');
    await expect(shortcut).toHaveAttribute('data-practice-target', 'nutricion');

    const placement = await page.evaluate(() => {
      const selector = document.querySelector('.course-selector').getBoundingClientRect();
      const shortcut = document.querySelector('#coursePracticeShortcut').getBoundingClientRect();
      const drive = document.querySelector('.class-drive-card').getBoundingClientRect();
      return { selectorBottom:selector.bottom, shortcutTop:shortcut.top, shortcutBottom:shortcut.bottom, driveTop:drive.top, height:shortcut.height };
    });
    expect(placement.shortcutTop).toBeGreaterThanOrEqual(placement.selectorBottom);
    expect(placement.shortcutBottom).toBeLessThanOrEqual(placement.driveTop);
    expect(placement.height).toBeLessThan(62);

    await page.locator('[data-course-target="bioquimica"]').click();
    await expect(shortcut.locator('#coursePracticeShortcutCourse')).toHaveText('Bioquímica II');
    await expect(shortcut).toHaveAttribute('data-practice-target', 'bioquimica-2026-08-21');
    await shortcut.click();
    await expect(page.locator('#practice-bioquimica-2026-08-21-dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#practice-bioquimica-2026-08-21 .practice-workspace')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/practice-modal-open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#practice-bioquimica-2026-08-21-dialog')).not.toHaveAttribute('open', '');
    await expect(page.locator('body')).not.toHaveClass(/practice-modal-open/);
  });

  test('opens the shared class Drive from Courses, Nutrition and the seminar plan', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const centralDrive = page.getByRole('link', { name: /Abrir los materiales compartidos de la clase/ });
    await expect(centralDrive).toBeVisible();
    await expect(centralDrive).toHaveAttribute('href', CLASS_DRIVE_URL);
    await expect(centralDrive).toHaveAttribute('target', '_blank');
    await expect(centralDrive).toHaveAttribute('rel', /noopener/);
    await expect(centralDrive).toHaveAttribute('rel', /noreferrer/);

    const driveLinks = page.locator('[data-class-drive-link]');
    await expect(driveLinks).toHaveCount(4);
    expect(await driveLinks.evaluateAll((links, driveUrl) => links.every((link) => link.getAttribute('href') === driveUrl), CLASS_DRIVE_URL)).toBe(true);

    await page.goto('/clase.html#nutrition-seminar');
    await expect(page.locator('#nutrition-seminar').getByRole('link', { name: /Materiales en Drive/ })).toBeVisible();
    await page.goto('/clase.html#plan-estudio');
    await expect(page.locator('#plan-estudio').getByRole('link', { name: /Abrir Drive/ })).toBeVisible();
  });
};
