const { test, expect } = require('@playwright/test');

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clase.html');
  });

  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo lo importante, en el orden correcto.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Glucólisis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continuar Bioquímica' })).toBeVisible();
    await expect(page.getByText('Sin datos inventados')).toBeVisible();
  });

  test('keeps the semester selector available while the page scrolls', async ({ page }) => {
    const switcher = page.getByLabel('Elegir semestre');
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveValue('4');
    await page.locator('#delegado').scrollIntoViewIfNeeded();
    await expect(switcher).toBeVisible();
    await expect(page.locator('#semesterSwitcherV402')).toHaveCSS('position', 'fixed');
  });

  test('switches revision depth without leaving the page', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida/ }).click();
    await expect(page.getByRole('heading', { name: 'El mapa central en cinco minutos' })).toBeVisible();
    await expect(page.getByText('La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('saves a simple preparation checklist', async ({ page }) => {
    const firstTask = page.locator('#studyChecklist input').first();
    await firstTask.check();
    await expect(page.locator('#planCount')).toHaveText('1/4');
    await page.reload();
    await expect(firstTask).toBeChecked();
  });

  test('keeps the page inside the viewport', async ({ page }) => {
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('shows the persistent mobile navigation only on a phone-sized viewport', async ({ page }, testInfo) => {
    const bottomNavigation = page.locator('.mobile-bottom-nav');
    if (testInfo.project.name === 'mobile-safari-shape') {
      await expect(bottomNavigation).toBeVisible();
      await expect(page.locator('.header-back')).toBeHidden();
    } else {
      await expect(bottomNavigation).toBeHidden();
    }
  });
});
