const { test, expect } = require('@playwright/test');

async function getPerformance(page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const resourceBytes = resources.reduce((sum, item) => sum + (item.transferSize || item.encodedBodySize || 0), 0);
    return {
      domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
      loadEventEnd: nav ? nav.loadEventEnd - nav.startTime : 0,
      resourceCount: resources.length,
      resourceBytes
    };
  });
}

const pages = [
  { path: '/index.html', minText: 300 },
  { path: '/modules.html', minText: 300 },
  { path: '/qcm.html?course=fisiologia', minText: 200 },
  { path: '/cas-cliniques.html?course=fisiologia', minText: 200 },
  { path: '/vrai-faux.html?course=fisiologia', minText: 200 }
];

for (const item of pages) {
  test(`${item.path}: stays within generous local performance budget`, async ({ page }) => {
    const start = Date.now();
    await page.goto(item.path, { waitUntil: 'load' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    if (/qcm|cas-cliniques|vrai-faux/.test(item.path)) {
      await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
    }
    const elapsed = Date.now() - start;
    const perf = await getPerformance(page);
    const bodyText = await page.locator('body').innerText();

    expect(bodyText.trim().length, `${item.path}: visible content should load`).toBeGreaterThan(item.minText);
    expect(elapsed, `${item.path}: end-to-end local load budget`).toBeLessThan(25000);
    expect(perf.domContentLoaded, `${item.path}: DOMContentLoaded budget`).toBeLessThan(12000);
    expect(perf.resourceCount, `${item.path}: resource count budget`).toBeLessThan(120);
    expect(perf.resourceBytes, `${item.path}: transfer/resource byte budget`).toBeLessThan(80 * 1024 * 1024);
  });
}

test('answer feedback stays responsive', async ({ page }) => {
  await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  const start = Date.now();
  await page.locator('#practiceList .single-question-card button.option[data-option]').first().click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 7000 });
  expect(Date.now() - start, 'answer feedback latency budget').toBeLessThan(7000);
});
