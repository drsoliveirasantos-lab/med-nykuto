module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('turns the Nutrition transcript into a patient-evaluation framework and seminar brief', async ({ page }) => {
    await page.goto('/clase.html#nutrition-detail');
    await expect(page.locator('#nutricion .notebook-current-title')).toContainText('Leyes de la alimentación y evaluación del paciente');
    const nutrition = page.locator('#nutricion');
    await expect(nutrition.locator('.notebook-date[aria-current="date"]')).toContainText('13 AGO.');
    await expect(page.locator('.nutrition-laws article')).toHaveCount(5);
    await expect(page.locator('.nutrition-law-photo img')).toHaveCount(5);
    await expect(page.locator('.plate-photo')).toBeVisible();
    await expect.poll(() => page.locator('.nutrition-law-photo img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.getByText('Una dieta no se juzga solo por sus calorías')).toBeVisible();
    await expect(page.getByText('Paraguay difunde 12 mensajes alimentarios oficiales, no 10.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seminario / presentación oral' })).toBeVisible();
    await expect(nutrition.getByText('2 PPT + 1 informe', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('Hasta 4 por PPT', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('Hasta 5 minutos', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('materiales bibliográficos del INAN entregados para el seminario', { exact: false })).toBeVisible();
    await expect(nutrition.getByRole('link', { name: 'Ver las instrucciones' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(nutrition.getByRole('link', { name: 'Ver ejemplo de la primera página' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.nutricion);
    expect(transcript.oralDate).toBeNull();
    expect(transcript.estimatedClassDate).toBe('2026-08-13');
    expect(transcript.estimatedPreparation.date).toBe('2026-08-20');
    expect(transcript.assignment.maxMinutesPerGroup).toBe(5);
    expect(transcript.assignment.maxSlidesPerPresentation).toBe(4);
    expect(transcript.assignment.deliverables).toHaveLength(3);
    expect(transcript.assignment.evaluation.totalPoints).toBe(5);
    expect(Object.keys(transcript.assignment.groups)).toHaveLength(6);
  });

  test('removes the completed seminar from active Tareas', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#nutritionPrepCard')).toBeHidden();
    await expect(page.locator('#classHubLiveTasks')).not.toContainText('Seminario y presentación oral');
    await page.goto('/clase.html#horario');
    await expect(page.locator('.schedule-slot[data-subject="nutrition"]')).toContainText('Presentación realizada · sin clase teórica nueva');
  });

  test('organizes seminar content, signed report and five-point rubric in accordions', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    const seminar = page.locator('#nutrition-seminar');
    await expect(seminar.getByText('Objetivo o mensaje principal.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis nutricional breve y conclusión.', { exact: true })).toBeVisible();

    await seminar.getByText('Informe para firma y sello', { exact: true }).click();
    await expect(seminar.getByText('Nombres y matrícula/código de los integrantes.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Lic. Johana Belén Leguizamón Vera.', { exact: false })).toBeVisible();

    await seminar.getByText('Cómo se califica · 5 puntos', { exact: true }).click();
    await expect(seminar.locator('.seminar-rubric-grid article')).toHaveCount(5);
    await expect(seminar.getByText('Fuentes utilizadas', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis y conclusión', { exact: true })).toBeVisible();
  });

  test('shows exact Nutrition topics after selecting a group and remembers the choice', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    const selector = page.locator('#nutritionGroupCourseSelect');
    await selector.selectOption('3');
    const output = page.locator('#nutrition-seminar [data-nutrition-group-output]');
    await expect(output.getByText('Mensajes/Guías 9 al 12 del Paraguay', { exact: true })).toBeVisible();
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 1 · P1 (4)', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 2 · P2 (5)', { exact: true })).toBeVisible();
    await page.reload();
    await expect(selector).toHaveValue('3');
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
  });

  test('keeps the seminar separate and adds only the documented 27 August Nutrition class', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    await expect(page.locator('#nutricion .notebook-date')).toHaveCount(2);
    await expect(page.locator('#nutricion .notebook-date')).toContainText('13 AGO.');
    await expect(page.locator('#nutricion .notebook-date')).toContainText('27 AGO.');
    await expect(page.locator('#nutricion .notebook-date')).not.toContainText('20 AGO.');
    await expect(page.locator('#nutricion .notebook-current-title')).not.toContainText('20 de agosto');
    await expect(page.locator('#nutricion .notebook-current-title')).toContainText('Guías alimentarias, etiquetado y lectura crítica');
    await expect(page.locator('#nutricion-2026-08-27 .course-photo-card')).toHaveCount(2);
    await expect(page.locator('#nutricion')).toContainText('Seminario presentado el 20 de agosto');
  });
};
