const { test, expect } = require('@playwright/test');

async function openQcmAndAnswer(page) {
  await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card button.option[data-option]').first()).toBeVisible({ timeout: 20000 });
  await page.locator('#practiceList .single-question-card button.option[data-option]').first().click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Question feedback / report error critical behavior', () => {
  test('report error action remains local and does not navigate', async ({ page }) => {
    await openQcmAndAnswer(page);
    const before = page.url();

    const report = page.locator('#practiceList .single-question-card [data-action="open-feedback"], #practiceList .single-question-card .report-btn').first();
    await expect(report).toBeVisible({ timeout: 10000 });
    await report.scrollIntoViewIfNeeded();
    await report.click({ force: true });
    await page.waitForTimeout(250);

    expect(page.url()).toBe(before);
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 5000 });

    const feedbackSurface = page.locator('form[name="question-feedback"], textarea[name="message"], textarea, #questionFeedbackFallbackV360, .question-feedback-fallback').first();
    if (await feedbackSurface.isVisible().catch(() => false)) {
      await expect(feedbackSurface).toBeVisible();
    }
  });
});
