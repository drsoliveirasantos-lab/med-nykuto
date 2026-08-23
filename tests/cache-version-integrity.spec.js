const { test, expect } = require('@playwright/test');

async function scriptSources(page) {
  return page.evaluate(() => Array.from(document.scripts).map((script) => script.getAttribute('src')).filter(Boolean));
}

function hasSource(sources, pattern) {
  return sources.some((src) => pattern.test(src));
}

test.describe('Cache and version integrity', () => {
  test('QCM loads the expected instant renderer and global polish versions', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    const sources = await scriptSources(page);
    expect(hasSource(sources, /app\.bundle\.js\?v=461/)).toBeTruthy();
    expect(hasSource(sources, /qcm-tap-guard-v309\.js\?v=321/)).toBeTruthy();
    expect(hasSource(sources, /site-global-polish-v310\.js\?v=460/)).toBeTruthy();
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    await expect.poll(() => page.evaluate(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__)).toMatch(/^v321-/);
  });

  test('Casos clínicos loads native instant renderer and no legacy premium overlay', async ({ page }) => {
    await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    const sources = await scriptSources(page);
    expect(hasSource(sources, /practice-tap-guard-v313\.js\?v=317/)).toBeTruthy();
    expect(hasSource(sources, /premium-correction-v313\.js/)).toBeFalsy();
    await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
  });

  test('Verdadero/Falso keeps explicit correction scripts visible to the test suite', async ({ page }) => {
    await page.goto('/vrai-faux.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    const sources = await scriptSources(page);
    expect(hasSource(sources, /premium-correction-v313\.js\?v=315/)).toBeTruthy();
    expect(hasSource(sources, /practice-tap-guard-v313\.js\?v=317/)).toBeTruthy();
    await page.waitForFunction(() => window.__MED_NYKUTO_PREMIUM_PRACTICE_CORRECTION__, null, { timeout: 20000 });
    await expect.poll(() => page.evaluate(() => window.__MED_NYKUTO_PREMIUM_PRACTICE_CORRECTION__)).toMatch(/^v315-/);
  });
});
