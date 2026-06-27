const { test, expect } = require('@playwright/test');

const base = (process.env.DEPLOYED_PREVIEW_BASE_URL || 'https://preview.med-nykuto-git.pages.dev').replace(/\/$/, '');

async function gotoDeployed(page, path) {
  const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  expect(response, `No response for deployed URL ${path}`).toBeTruthy();
  expect(response.status(), `${path} must not return an HTTP error`).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error|404 Not Found/i, { timeout: 1000 });
}

test.describe('Deployed preview smoke', () => {
  test('public preview loads key pages and core runtime markers', async ({ page }) => {
    await gotoDeployed(page, '/index.html');
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

  test('deployed preview critical assets do not 404', async ({ page }) => {
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
