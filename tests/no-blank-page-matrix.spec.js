const { test, expect } = require('@playwright/test');

const pages = [
  '/index.html',
  '/matieres.html',
  '/modules.html',
  '/qcm.html?course=fisiologia',
  '/cas-cliniques.html?course=fisiologia',
  '/vrai-faux.html?course=fisiologia',
  '/erreurs.html',
  '/examen.html',
  '/contact.html',
  '/a-propos.html',
  '/mentions.html'
];

for (const path of pages) {
  test(`${path}: no blank page or broken placeholder`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response, `${path} should return a response`).toBeTruthy();
    expect(response.status(), `${path} should not be an HTTP error`).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    if (await page.locator('main').count()) {
      await expect(page.locator('main').first()).toBeVisible({ timeout: 15000 });
    }

    const metrics = await page.evaluate(() => {
      const bodyText = document.body?.innerText || '';
      const mainText = document.querySelector('main')?.innerText || bodyText;
      const h1Count = document.querySelectorAll('h1').length;
      const interactiveCount = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]').length;
      return { bodyText, mainText, h1Count, interactiveCount };
    });

    expect(metrics.bodyText.trim().length, `${path} body should not be empty`).toBeGreaterThan(80);
    expect(metrics.mainText.trim().length, `${path} main should not be empty`).toBeGreaterThan(40);
    expect(metrics.h1Count, `${path} should expose at least one h1 in DOM`).toBeGreaterThan(0);
    expect(metrics.interactiveCount, `${path} should expose interactive navigation or controls`).toBeGreaterThan(0);
    expect(metrics.bodyText).not.toMatch(/\b(undefined|null|NaN|\[object Object\])\b/i);
    expect(metrics.bodyText).not.toMatch(/Application error|Internal Server Error|Cannot read properties/i);
  });
}
