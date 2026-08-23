const { test, expect } = require('@playwright/test');
const { expectBlockedClinicalCases } = require('./helpers/practice-policy');

async function openBlockedCasePage(page) {
  await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
  await expectBlockedClinicalCases(page, expect);
}

test.describe('Runtime script conflict detection', () => {
  test('blocked clinical cases do not revive legacy feedback systems', async ({ page }) => {
    await openBlockedCasePage(page);
    await expect(page.locator('#practiceList .single-question-card, #practiceList .ppc-card, #practiceList .case-feedback-card')).toHaveCount(0);
    await expect(page.locator('#practiceList .notice')).toHaveCount(1);
  });

  test('critical runtime markers are not duplicated or missing', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    const qcmMarker = await page.evaluate(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__);
    expect(qcmMarker).toMatch(/^v321-/);

    await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
    const caseMarker = await page.evaluate(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__);
    expect(caseMarker).toMatch(/^v316-/);
  });
});
