const { test, expect } = require('@playwright/test');

test.describe('Med Nykuto mobile menu', () => {
  test('hamburger opens, closes and keeps links clickable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    const menu = page.locator('#navLinks');
    await page.locator('#menuToggle').tap();
    await expect(menu).toHaveClass(/open/);
    await expect(page.locator('#navLinks a[href="matieres.html"]')).toBeVisible();

    await page.locator('#menuToggle').tap();
    await expect(menu).not.toHaveClass(/open/);

    await page.locator('#menuToggle').tap();
    await page.locator('#navLinks a[href="modules.html"]').click();
    await expect(page).toHaveURL(/modules\.html/);
  });
});
