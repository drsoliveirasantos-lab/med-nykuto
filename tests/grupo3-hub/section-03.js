module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('labels inferred preparation dates instead of presenting them as confirmed homework', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas de la clase' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Llevar una muestra de alimento con moho' })).toBeVisible();
    await expect(page.locator('#microEstimatedDate')).toContainText('20 ago.');
    await expect(page.locator('#microEstimatedDate')).toContainText('18:00–20:00');
    await expect(page.locator('#microEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#bioEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#bioEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#epiEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#epiEstimatedDate')).toContainText('11:20–13:20');
    await expect(page.locator('#epiEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('20 ago.');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('07:00–09:40');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#nutritionPrepCard .assignment-status')).toHaveText('Confirmada');
    await expect(page.getByLabel('Semana 3, del 17 al 23 de agosto de 2026')).toBeVisible();
    await expect(page.locator('#nutritionPrepCard time')).toHaveCount(2);
    await expect(page.locator('#nutritionPrepCard time').first()).toHaveAttribute('datetime', '2026-08-17');
    await expect(page.locator('#nutritionPrepCard time').last()).toHaveAttribute('datetime', '2026-08-23');
    await expect(page.locator('#bioPrepCard .assignment-status')).toHaveText('Estimada');
    await expect(page.getByText('Comprueba siempre los avisos oficiales de la facultad.')).toBeHidden();
    await page.getByText('¿De dónde sale esta fecha?').click();
    await expect(page.getByText('Comprueba siempre los avisos oficiales de la facultad.')).toBeVisible();
    await expect(page.getByText('Si no dio una fecha, usamos el horario habitual de la materia.')).toBeVisible();
  });

  test('organizes the 14 August glycolysis lesson with corrected study points', async ({ page }) => {
    await page.goto('/clase.html#bio-detail');
    await expect(page.getByRole('heading', { name: 'Glucólisis: vía común y balance energético' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Convertir una glucosa en dos piruvatos' })).toBeVisible();
    await expect(page.getByText('2 piruvatos + 2 ATP + 2 NADH', { exact: true })).toBeVisible();
    await expect(page.getByText('PEP → piruvato', { exact: true })).toBeVisible();
    await expect(page.getByText('La glucoquinasa hepática puede quedar secuestrada en el núcleo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La glucólisis en una sola mirada' })).toBeVisible();
    await expect(page.locator('.bio-board-route article')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Una glucosa se convierte en dos piruvatos' })).toBeVisible();
    await expect(page.locator('.bio-pathway-node')).toHaveCount(4);
    await expect(page.locator('.bio-abbrev-guide')).toHaveCount(0);
    await expect(page.locator('.mn-glossary-term[data-glossary-key="atp"]:visible').first()).toBeVisible();
    await expect(page.getByText('Malato–aspartato: ≈2,5 ATP/NADH; glicerol-3-fosfato: ≈1,5 ATP/NADH.')).toBeVisible();
    await expect(page.getByText('su rendimiento oxidativo no es siempre 2,5 ATP por NADH', { exact: false })).toBeVisible();
    await expect(page.getByText('Bioquímica · 3 clases')).toBeVisible();
  });

  test('opens the reconstructed glycolysis board archive in its teaching order', async ({ page }) => {
    await page.goto('/clase.html#bioquimica-2026-08-14');
    const openArchive = page.getByRole('button', { name: /Ver las 7 láminas/ });
    await expect(openArchive).toBeVisible();
    await openArchive.click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-board-archive-slide]')).toHaveCount(7);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 1 DE 7');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/01-mapa-general\.webp$/);
    await expect(page.locator('#boardArchiveSlideTitle')).toHaveText('Mapa general');
    await expect(dialog.locator('[data-board-archive-previous]')).toBeDisabled();

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/02-fase-preparatoria-1-3\.webp$/);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');

    await dialog.locator('[data-board-archive-slide="6"]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/07-regulacion-anotada\.webp$/);
    await expect(dialog.locator('[data-board-archive-next]')).toBeDisabled();
    await dialog.press('Home');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/01-mapa-general\.webp$/);
    await dialog.press('ArrowRight');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/02-fase-preparatoria-1-3\.webp$/);

    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(openArchive).toBeFocused();
  });
};
