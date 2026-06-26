const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v370-native-exact-next';

async function waitPracticeReady(page) {
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_LOADER__ === version, CURRENT_PRACTICE_LOADER, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ === version, CURRENT_NEXT_STABILITY, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });
}

async function answerCurrentQuestion(page) {
  const answer = page.locator('.single-question-card button.option[data-option]').first();
  await expect(answer).toBeAttached({ timeout: 15000 });
  await answer.scrollIntoViewIfNeeded();
  await answer.click({ force: true });
  await page.waitForFunction(() => {
    const card = document.querySelector('.single-question-card');
    return !!card && !!card.querySelector('.answer-panel:not([hidden]), .option.correct, .option.wrong, .option.selected, .option.chosen');
  }, null, { timeout: 15000 });
}

async function clickNativeNext(page) {
  const next = page.locator('.single-question-card [data-action="next-question"]').first();
  await expect(next).toBeVisible({ timeout: 10000 });
  await next.scrollIntoViewIfNeeded();
  await next.click({ force: true });
}

async function waitQuestionChanged(page, firstId) {
  await page.waitForFunction((id) => {
    const card = document.querySelector('.single-question-card');
    return !!card && card.id !== id;
  }, firstId, { timeout: 15000 });
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
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstId);
  });

  test('mobile QCM native next button advances after answering', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrentQuestion(page);
    await expect(page.locator('#practiceMobileNextBar')).toHaveCount(0);
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstId);
  });
});
