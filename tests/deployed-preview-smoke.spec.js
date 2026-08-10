const { test, expect } = require('@playwright/test');

const base = (process.env.DEPLOYED_BASE_URL || 'https://med.nykuto.com').replace(/\/$/, '');

async function gotoDeployed(page, path) {
  let response = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    if (response && response.status() < 400) break;
    const status = response ? response.status() : 0;
    if (![0, 403, 429, 502, 503, 504].includes(status)) break;
    await page.waitForTimeout(1500 * (attempt + 1));
  }
  expect(response, `No response for deployed URL ${path}`).toBeTruthy();
  expect(response.status(), `${path} must not return an HTTP error`).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error|404 Not Found/i, { timeout: 1000 });
}

test.describe('Deployed production smoke', () => {
  test('public production loads key pages and core runtime markers', async ({ page }) => {
    await gotoDeployed(page, '/');
    await expect(page).toHaveTitle(/Med Nykuto/i);
    await expect(page.locator('body')).toContainText(/Med Nykuto/i);

    await gotoDeployed(page, '/qcm.html?course=fisiologia');
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });

    await gotoDeployed(page, '/cas-cliniques.html?course=fisiologia');
    await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });

    await gotoDeployed(page, '/vrai-faux.html?course=fisiologia');
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  });

  test('deployed production critical assets do not 404', async ({ page }) => {
    const failed = [];
    page.on('response', (response) => {
      const url = response.url();
      if (response.status() >= 400 && /\.(js|css|png|jpg|jpeg|webp|svg|ico)(\?|$)/i.test(url)) {
        failed.push(`${response.status()} ${url}`);
      }
    });

    await gotoDeployed(page, '/qcm.html?course=fisiologia');
    await gotoDeployed(page, '/cas-cliniques.html?course=fisiologia');
    await gotoDeployed(page, '/vrai-faux.html?course=fisiologia');
    expect(failed, 'No critical deployed assets should return 4xx/5xx').toEqual([]);
  });
});
