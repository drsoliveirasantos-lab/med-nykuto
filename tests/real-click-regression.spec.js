const { test, expect } = require('@playwright/test');

async function waitPracticeReady(page) {
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363', null, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });
}

async function answerCurrentQuestion(page) {
  const answer = page.locator('.single-question-card button.option[data-option]').first();
  await expect(answer).toBeAttached({ timeout: 15000 });
  await answer.scrollIntoViewIfNeeded();
  await answer.click({ force: true });
  await expect(page.locator('.single-question-card .answer-panel:not([hidden])').first()).toBeAttached({ timeout: 15000 });
}

async function clickVisibleNext(page) {
  const clicked = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('#practiceMobileNextBar .practice-stable-next, .compact-next-bar.practice-mobile-next-bar .practice-stable-next, .single-question-card [data-action="next-question"]'));
    const visible = candidates.find(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && !el.disabled && !el.hasAttribute('disabled');
    });
    if (!visible) return false;
    visible.scrollIntoView({ block: 'center', inline: 'center' });
    visible.click();
    return true;
  });
  expect(clicked).toBe(true);
}

test.describe('Med Nykuto real user click regressions', () => {
  test('clicking the site logo from QCM returns to homepage', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    await page.locator('a.brand, a.brand-official, .brand-logo-official').first().click({ force: true });
    await expect(page).toHaveURL(/\/index\.html$|\/$/, { timeout: 15000 });
  });

  test('QCM next button advances to the following question after answering', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrentQuestion(page);
    await clickVisibleNext(page);
    await expect.poll(async () => page.locator('.single-question-card').first().getAttribute('id'), { timeout: 15000 }).not.toBe(firstId);
  });

  test('mobile QCM next button advances after answering', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrentQuestion(page);
    await expect(page.locator('#practiceMobileNextBar .practice-stable-next, .compact-next-bar.practice-mobile-next-bar .practice-stable-next').first()).toBeVisible({ timeout: 8000 });
    await clickVisibleNext(page);
    await expect.poll(async () => page.locator('.single-question-card').first().getAttribute('id'), { timeout: 15000 }).not.toBe(firstId);
  });
});
