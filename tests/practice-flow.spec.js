const { test, expect } = require('@playwright/test');

async function answerOneQuestion(page, url) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(url);
  await expect(page.locator('.option').first()).toBeVisible();
  await page.locator('.option').first().click();
  await expect(page.locator('.answer-panel, .detailed-correction').first()).toBeVisible();
  expect(errors).toEqual([]);
}

test.describe('Med Nykuto practice flows', () => {
  test('QCM renders options and correction', async ({ page }) => {
    await answerOneQuestion(page, '/qcm.html?course=fisiologia');
    const bank = await page.evaluate(() => window.MED_PRACTICE_BANK?.byCourse?.fisiologia?.qcm?.length || 0);
    expect(bank).toBeGreaterThanOrEqual(20);
  });

  test('clinical cases render options and correction', async ({ page }) => {
    await answerOneQuestion(page, '/cas-cliniques.html?course=fisiologia');
    const bank = await page.evaluate(() => window.MED_PRACTICE_BANK?.byCourse?.fisiologia?.cases?.length || 0);
    expect(bank).toBeGreaterThanOrEqual(5);
  });

  test('true false renders options and correction', async ({ page }) => {
    await answerOneQuestion(page, '/vrai-faux.html?course=fisiologia');
    const bank = await page.evaluate(() => window.MED_PRACTICE_BANK?.byCourse?.fisiologia?.vf?.length || 0);
    expect(bank).toBeGreaterThanOrEqual(10);
  });

  test('question feedback button remains visible and uses local fallback', async ({ page }) => {
    await answerOneQuestion(page, '/qcm.html?course=fisiologia');
    const report = page.locator('[data-action="open-feedback"]').first();
    await expect(report).toBeVisible();
    await report.click();
    await expect(page.locator('#questionFeedbackModal')).toBeVisible();
    await expect(page.locator('#questionFeedbackModal form[data-med-nykuto-question-feedback-bound="1"]')).toBeVisible();
    await page.fill('#questionFeedbackModal textarea[name="comment"]', 'Test automatisé du report de question.');
    await page.click('#questionFeedbackModal button[type="submit"]');
    await expect(page.locator('#questionFeedbackFallbackV360')).toBeVisible();
    await expect(page.locator('#questionFeedbackFallbackV360')).toContainText('Reporte guardado localmente');
  });
});
