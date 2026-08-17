module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('turns the Nutrition transcript into a patient-evaluation framework and seminar brief', async ({ page }) => {
    await page.goto('/clase.html#nutrition-detail');
    await expect(page.getByRole('heading', { name: 'Leyes de la alimentación y evaluación del paciente' })).toBeVisible();
    const nutrition = page.locator('#nutricion');
    await expect(nutrition.getByText('Clase estimada · 13 ago. · confirmar')).toBeVisible();
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
    await expect(nutrition.getByText('Drive de la clase → Bibliografía → carpeta INAN.', { exact: false })).toBeVisible();
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

  test('shows the complete official seminar requirements without leaving Tareas', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    const task = page.locator('#nutritionPrepCard');
    await task.locator(':scope > summary').click();
    await expect(task.locator('.seminar-at-a-glance b').first()).toHaveText('2');
    await expect(task.getByText('presentaciones PowerPoint separadas', { exact: true })).toBeVisible();
    await expect(task.getByText('informe para firma y sello', { exact: true })).toBeVisible();
    await task.getByText('Ver todos los detalles', { exact: true }).click();
    await expect(task.getByText('Trabajo 1 · Guías Alimentarias', { exact: true })).toBeVisible();
    await expect(task.getByText('Trabajo 2 · Platos típicos / regiones', { exact: true })).toBeVisible();
    await expect(task.getByText('aproximadamente hasta 5 minutos por grupo', { exact: false })).toBeVisible();
    await expect(task.getByRole('link', { name: 'Ver las instrucciones y descargar' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(task.getByRole('link', { name: 'Ver ejemplo de la primera página' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
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
    await page.goto('/clase.html#pendientes');
    await page.locator('#nutritionPrepCard > summary').click();
    const selector = page.locator('#nutritionGroupTaskSelect');
    await selector.selectOption('3');
    const output = page.locator('#nutritionPrepCard [data-nutrition-group-output]');
    await expect(output.getByText('Mensajes/Guías 9 al 12 del Paraguay', { exact: true })).toBeVisible();
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 1 · P1 (4)', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 2 · P2 (5)', { exact: true })).toBeVisible();
    await page.reload();
    await page.locator('#nutritionPrepCard > summary').click();
    await expect(selector).toHaveValue('3');
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
  });

  test('syncs the Nutrition group and exact topics with the seminar plan', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const planSelector = page.locator('#nutritionGroupPlanSelect');
    await expect(planSelector).toBeVisible();
    await planSelector.selectOption('6');
    const planOutput = page.locator('#plan-estudio [data-nutrition-group-output]');
    await expect(planOutput.getByText('Guías Alimentarias del Paraguay', { exact: true })).toBeVisible();
    await expect(planOutput.getByText('Platos típicos del Paraguay', { exact: true })).toBeVisible();
    await expect(page.locator('#studyChecklist input[value="nutrition-group"]')).toBeChecked();
    await expect(page.locator('#planCount')).toHaveText('1/6');
    await expect(page.locator('#studyChecklist input')).toHaveCount(6);
    await expect(page.getByText('PowerPoint · Trabajo 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Informe breve', { exact: true }).last()).toBeVisible();

    await page.goto('/clase.html#pendientes');
    await page.locator('#nutritionPrepCard > summary').click();
    await expect(page.locator('#nutritionGroupTaskSelect')).toHaveValue('6');
    await expect(page.locator('#nutritionPrepCard [data-nutrition-group-output]').getByText('Platos típicos del Paraguay', { exact: true })).toBeVisible();
  });
};
