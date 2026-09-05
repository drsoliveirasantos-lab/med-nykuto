module.exports = ({ test, expect }) => {
  test('opens and zooms the 53-field teacher-PDF practice with touch', async ({ page }) => {
    await page.goto('/p1.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/p1-ready/);

    const launcher = page.locator('#p1StartVisual');
    await expect(launcher).toContainText('Reconocer 53 imágenes');
    await launcher.tap();

    const dialog = page.getByRole('dialog', { name: 'Reconocimiento visual en curso' });
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 53');
    await expect(dialog.locator('#p1Question .p1-visual-clues')).toHaveCount(0);

    const image = dialog.locator('#p1Question .p1-question-media img');
    await expect.poll(() => image.evaluate((node) => [node.naturalWidth, node.naturalHeight])).toEqual([220, 220]);
    await dialog.getByRole('button', { name: 'Ampliar la micrografía sin salir de la práctica' }).tap();
    const viewer = dialog.getByRole('region', { name: 'Ampliación de la micrografía' });
    await expect(viewer).toBeVisible();
    await viewer.getByRole('button', { name: 'Ampliar la imagen' }).tap();
    await expect(viewer.getByRole('button', { name: '150 %' })).toBeVisible();
    await viewer.getByRole('button', { name: 'Cerrar la imagen ampliada' }).tap();
    await expect(viewer).toBeHidden();

    const baseTotal = await page.evaluate(() => window.MedNykutoP1.buildExam({ seed: 20260830, visualOnly: true, mode: 'training' }).items.length);
    expect(baseTotal).toBe(10);
  });
};
