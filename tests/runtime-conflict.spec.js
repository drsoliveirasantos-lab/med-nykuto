const { test, expect } = require('@playwright/test');

async function openAndAnswerCase(page) {
  await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
  await expect(page.locator('#practiceList .single-question-card button.option[data-option]').first()).toBeVisible({ timeout: 20000 });
  await page.locator('#practiceList .single-question-card button.option[data-option]').first().click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Runtime script conflict detection', () => {
  test('casos clínicos use a single native feedback system', async ({ page }) => {
    await openAndAnswerCase(page);

    await expect(page.locator('#practiceList .single-question-card .ppc-card')).toHaveCount(0);
    await expect(page.locator('#practiceList .single-question-card .case-feedback-card')).toHaveCount(1);

    const answerPanelDisplay = await page.locator('#practiceList .single-question-card .answer-panel').first().evaluate((node) => getComputedStyle(node).display);
    expect(answerPanelDisplay).not.toBe('none');

    const controls = await page.locator('#practiceList .single-question-card details summary').filter({ hasText: /explicaci[oó]n|explication|compl[eè]te|completa|voir|ver/i }).count();
    expect(controls).toBe(1);
  });

  test('critical runtime markers are not duplicated or missing', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    const qcmMarker = await page.evaluate(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__);
    expect(qcmMarker).toMatch(/^v317-/);

    await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
    const caseMarker = await page.evaluate(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__);
    expect(caseMarker).toMatch(/^v314-/);
  });
});
