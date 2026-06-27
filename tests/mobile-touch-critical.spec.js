const { test, expect } = require('@playwright/test');

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerFirstVisibleOption(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
}

test.describe('Mobile critical paths', () => {
  test('mobile navigation and practice controls remain usable', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click({ force: true });
    await expect(page.locator('#navLinks a[href="qcm.html"], .nav-links a[href="qcm.html"]').first()).toBeVisible({ timeout: 10000 });

    await openPractice(page, '/qcm.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 8000 });
    const qcmNext = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(qcmNext).toBeVisible({ timeout: 5000 });
    await qcmNext.click({ force: true });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 8000 });

    await openPractice(page, '/cas-cliniques.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    const casePanel = page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first();
    await expect(casePanel).toBeVisible({ timeout: 8000 });
    const summary = casePanel.locator('details summary').first();
    if (await summary.isVisible().catch(() => false)) {
      await summary.click({ force: true });
      await expect(page.locator('#practiceList .single-question-card')).toBeVisible({ timeout: 5000 });
    }
  });
});
