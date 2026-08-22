module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('removes the completed Microbiology homework and keeps the dated course available', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#microTheoryPrepCard')).toBeHidden();
    await expect(page.locator('#classHubLiveTasks')).not.toContainText('Micosis superficiales y dermatofitosis');

    await page.goto('/clase.html#microbiologia-teorica-2026-08-10');
    await expect(page.locator('#microbiologia-teorica .notebook-current-title')).toContainText('Dermatofitosis y tiñas');
    await expect(page.locator('#microbiologia-teorica-2026-08-10 .course-chapter-section')).toHaveCount(8);
  });

  test('opens the 10 and 13 August Physiology lessons independently', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-13');
    await expect(page.locator('#fisiologia .notebook-current-title')).toContainText('Control nervioso y químico de la respiración');
    await expect(page.locator('#fisiologia .notebook-date[aria-current="date"]')).toContainText('13 AGO.');
    await expect(page.locator('#fisiologia .chapter-state')).toHaveText('Capítulo terminado');
    await expect(page.locator('#fisiologia-2026-08-13')).toBeVisible();
    await expect(page.locator('#fisiologia-2026-08-10')).toBeHidden();
    await page.locator('#fisiologia-2026-08-13 [data-lesson-tab="material"]').click();
    await page.locator('#fisiologia-2026-08-13 [data-detail-toggle]').click();
    await expect(page.locator('#fisiologia-2026-08-13 .control-loop li')).toHaveCount(3);
    await expect(page.getByText('complejo pre-Bötzinger', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('row', { name: /Quimiorreceptor central/ })).toBeVisible();
    await expect(page.locator('#practice-fisiologia-2026-08-13')).toContainText('40 preguntas para dominar este curso');
    await expect(page.locator('#fisiologia-2026-08-13').getByText('EFECTO BOHR', { exact: true })).toHaveCount(0);

    await page.locator('#fisiologia .notebook-date[data-lesson-id="fisiologia-2026-08-10"]').click();
    await expect(page.locator('#fisiologia .notebook-current-title')).toContainText('Difusión y transporte de gases');
    await expect(page.locator('#fisiologia-2026-08-13')).toBeHidden();
    await expect(page.locator('#fisiologia-2026-08-10')).toBeVisible();
    await expect(page.locator('#fisiologia .notebook-date[data-lesson-id="fisiologia-2026-08-10"]')).toHaveAttribute('aria-current', 'date');
    await page.locator('#fisiologia-2026-08-10 [data-lesson-tab="material"]').click();
    await page.locator('#fisiologia-2026-08-10 [data-detail-toggle]').click();
    await expect(page.locator('#fisiologia-2026-08-10').getByText('EFECTO BOHR', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /Barrera alveolocapilar/ })).toBeVisible();
    await expect(page.locator('#practice-fisiologia-2026-08-10')).toContainText('40 preguntas para dominar este curso');
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.fisiologia);
    expect(transcript.resolvedDate).toBe('2026-08-17');
    expect(transcript.segments[0].estimatedDate).toBe('2026-08-10');
  });

  test('opens the 17 August Physiology and Microbiology class archives', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-17');
    await expect(page.locator('#fisiologia .notebook-current-title')).toContainText('Organización, sinapsis y receptores');
    await expect(page.locator('#practice-fisiologia-2026-08-17')).toContainText('40 preguntas para dominar este curso');
    await page.locator('#fisiologia-2026-08-17 [data-lesson-tab="material"]').click();

    const archive = page.locator('#sessionArchiveDialog');
    await page.locator('[data-session-archive-open="fisio-17-slides"]').click();
    await expect(archive).toBeVisible();
    await expect(archive.locator('#sessionArchiveThumbnails button')).toHaveCount(35);
    await expect(archive.locator('[data-session-archive-total]')).toHaveText('35');
    await archive.locator('[data-session-archive-close]').click();

    await page.goto('/clase.html#microbiologia-teorica-2026-08-17');
    await expect(page.locator('#microbiologia-teorica .notebook-current-title')).toContainText('Micosis por profundidad y casos clínicos');
    await expect(page.locator('#practice-microbiologia-teorica-2026-08-17')).toContainText('40 preguntas para dominar este curso');
    await page.locator('#microbiologia-teorica-2026-08-17 [data-lesson-tab="material"]').click();
    await page.locator('[data-session-archive-open="micro-17-cases"]').click();
    await expect(archive).toBeVisible();
    await expect(archive.locator('#sessionArchiveThumbnails button')).toHaveCount(8);
    await expect(archive.locator('[data-session-archive-total]')).toHaveText('8');
  });
};
