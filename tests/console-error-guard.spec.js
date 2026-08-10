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
  '/contact.html'
];

function isCritical(message) {
  return /TypeError|ReferenceError|SyntaxError|Cannot read|is not defined|is not a function|Unhandled|Failed to load resource|ERR_ABORTED|ERR_FAILED/i.test(message)
    && !/favicon/i.test(message);
}

for (const path of pages) {
  test(`${path}: no critical console or page errors`, async ({ page }) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && isCritical(message.text())) errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (/\.(js|css|json)(\?|$)/i.test(url)) errors.push(`requestfailed: ${url} ${request.failure()?.errorText || ''}`);
    });

    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status() || 0).toBeLessThan(400);
    await page.waitForTimeout(750);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    expect(errors).toEqual([]);
  });
}
