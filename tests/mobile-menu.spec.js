const { test, expect } = require('@playwright/test');

test.describe('Med Nykuto mobile menu', () => {
  test('hamburger opens, closes and keeps links clickable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_FIX__ === 'v360', null, { timeout: 20000 });

    const menu = page.locator('#navLinks');
    const toggle = page.locator('#menuToggle');

    await toggle.click();
    await expect(menu).toHaveClass(/open/);
    await expect(page.locator('#navLinks a[href="matieres.html"]')).toBeVisible();

    await toggle.click();
    await expect(menu).not.toHaveClass(/open/);

    await toggle.click();
    await expect(menu).toHaveClass(/open/);
    await page.locator('#navLinks a[href="modules.html"]').click();
    await expect(page).toHaveURL(/modules\.html/);
  });
});
