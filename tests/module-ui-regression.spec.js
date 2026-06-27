const { test, expect } = require('@playwright/test');

const CURRENT_RUNTIME_GUARD = 'v362';
const CURRENT_IMAGE_ZOOM = 'v102-scroll-stable-close';

async function waitRuntime(page) {
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_RUNTIME_GUARD__ === version, CURRENT_RUNTIME_GUARD, { timeout: 20000 });
}

async function waitModuleReady(page) {
  await waitRuntime(page);
  await expect(page.locator('#moduleContent')).toBeAttached({ timeout: 15000 });
  await page.waitForTimeout(500);
}

test.describe('Module reader UI regressions', () => {
  test('module logo returns to homepage', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitModuleReady(page);
    await page.locator('a.brand, a.brand-official, .brand-logo-official').first().click({ force: true });
    await expect(page).toHaveURL(/\/index\.html$|\/$/, { timeout: 15000 });
  });

  test('course image click opens zoom modal', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitModuleReady(page);
    await page.waitForFunction((version) => window.__MED_NYKUTO_COURSE_IMAGE_ZOOM__ === version, CURRENT_IMAGE_ZOOM, { timeout: 15000 });

    const imageCount = await page.locator('.course-figure-zoom img, #moduleContent img, .reader-content img').count();
    if (imageCount === 0) {
      await page.evaluate(() => {
        const root = document.querySelector('#moduleContent');
        root.insertAdjacentHTML('beforeend', '<figure class="course-figure"><button class="course-figure-zoom" type="button" aria-label="Agrandir la figure"><img src="assets/logo-medcursos-icon.png" alt="Imagen test zoom"></button><figcaption>Imagen test zoom</figcaption></figure>');
      });
    }

    const target = page.locator('.course-figure-zoom, #moduleContent img, .reader-content img').first();
    await expect(target).toBeVisible({ timeout: 10000 });
    await target.click({ force: true });
    await expect(page.locator('#courseImageZoomModal:not([hidden])')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#courseImageZoomModal img')).toBeVisible();
  });
});
