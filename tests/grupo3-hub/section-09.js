module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('previews both seminar Word documents before download', async ({ page }) => {
    await page.goto('/documentos-seminario.html#modelo-portada');
    await expect(page.getByRole('heading', { name: 'Ejemplo de la primera página y del desarrollo' })).toBeVisible();
    await expect(page.locator('[data-document-panel="modelo-portada"] img')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/modelo-portada-seminario-nutricion.docx');
    await expect.poll(() => page.locator('[data-document-panel="modelo-portada"] img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);

    await page.locator('[data-document-tab="instructivo"]').click();
    await expect(page.getByRole('heading', { name: 'Instrucciones para la presentación oral' })).toBeVisible();
    await expect(page.locator('[data-document-panel="instructivo"] img')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/instructivo-presentacion-oral-semana-3.docx');
  });

  test('previews seminar documents in a closable same-page dialog', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const originalUrl = page.url();
    const dialog = page.locator('#seminarDocumentPreview');

    await page.locator('#plan-estudio').getByRole('link', { name: 'Ver las instrucciones', exact: true }).click();
    await expect(dialog).toBeVisible();
    expect(page.url()).toBe(originalUrl);
    await expect(dialog.locator('[data-document-preview-panel="instructivo"]')).toBeVisible();
    await expect(dialog.locator('[data-document-preview-panel="instructivo"] img')).toHaveCount(3);
    await expect(dialog.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/instructivo-presentacion-oral-semana-3.docx');

    await dialog.getByRole('button', { name: 'Ejemplo de la primera página' }).click();
    await expect(dialog.locator('[data-document-preview-panel="modelo-portada"]')).toBeVisible();
    await expect(dialog.locator('[data-document-preview-panel="modelo-portada"] img')).toHaveCount(2);
    await expect(dialog.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/modelo-portada-seminario-nutricion.docx');

    await dialog.getByRole('button', { name: 'Cerrar vista previa' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('#plan-estudio')).toBeVisible();
    expect(page.url()).toBe(originalUrl);
  });

  test('offers exactly 20 QCM, 10 true-false and 10 clinical cases for every dated course', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    await expect(page.locator('[data-practice-root]')).toHaveCount(14);
    const everyBankHasForty = await page.locator('[data-practice-root]').evaluateAll((roots) => roots.every((root) => {
      const counts = Array.from(root.querySelectorAll('.practice-counts strong')).map((node) => Number(node.textContent));
      return counts.join(',') === '20,10,10';
    }));
    expect(everyBankHasForty).toBe(true);
    const clinicalStoriesArePatientVignettes = await page.evaluate(() => Object.values(window.MedNykutoClassPractice.banks).every((bank) =>
      bank.cases.every((item) => {
        const story = String(item.scenario || '').trim();
        const sentences = story.split(/[.!?]+/).filter((sentence) => sentence.trim().length >= 12);
        return /\b(?:pacientes?|personas?|familias?|parejas?|niñ[oa]s?|mujeres?|hombres?)\b/i.test(story) && sentences.length >= 2;
      })
    ));
    expect(clinicalStoriesArePatientVignettes).toBe(true);
    const practice = page.locator('#practice-nutricion');
    const overviewCounts = practice.locator('.practice-counts > span');
    await expect(overviewCounts.nth(0)).toHaveText('20QCM');
    await expect(overviewCounts.nth(1)).toHaveText('10Verdadero / Falso');
    await expect(overviewCounts.nth(2)).toHaveText('10Casos clínicos');
    await practice.getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(practice).toContainText('40 preguntas hechas únicamente con el contenido de esta clase.');
    await expect(practice.getByRole('heading', { name: '¿Qué acciones forman parte de la alimentación?' })).toBeVisible();
    await expect(practice.locator('.practice-feedback')).toHaveCount(0);
    await practice.getByRole('radio', { name: 'La alimentación incluye elegir, preparar e ingerir alimentos.' }).click();
    await practice.getByRole('button', { name: 'Validar mi respuesta' }).click();
    await expect(practice.locator('.practice-feedback')).toContainText('Respuesta correcta');
    await expect(practice.locator('.practice-feedback')).toContainText('Elección, preparación e ingestión de alimentos');
    await expect(practice.locator('.practice-sources')).toContainText('SOLO CONTENIDO DE LA CLASE');
    await expect(practice.locator('.practice-sources a')).toHaveAttribute('href', 'clase.html#nutrition-detail');

    await page.goto('/clase.html#practice-bioquimica');
    await expect(page.locator('#bioquimica')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-workspace')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-tab')).toHaveCount(3);
  });

  test('organizes Epidemiology into exam points, APS and triage preparation', async ({ page }) => {
    await page.goto('/clase.html#epi-detail');
    await expect(page.getByRole('heading', { name: 'Sectorización, triage, urgencia y emergencia' })).toBeVisible();
    await expect(page.getByText('APS y modelo de atención integral', { exact: true })).toBeVisible();
    await expect(page.locator('#epidemiologia .transcription-rule-note').getByText('Cómo se separaron las clases:')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lo que la profesora señaló que puede preguntar' })).toBeVisible();
    await expect(page.getByText('2008: implementación de la estrategia APS en Paraguay.')).toBeVisible();
    await page.locator('#epidemiologia .lesson-accordion').nth(3).locator('summary').click();
    await expect(page.getByText('URGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('EMERGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('No existe una regla de “máximo seis horas” para la intubación.')).toBeVisible();
    await expect(page.locator('.triage-colors article')).toHaveCount(5);
  });
};
