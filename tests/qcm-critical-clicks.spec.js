const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';

async function waitPracticeReady(page) {
  await page.goto('/qcm.html?course=fisiologia');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_LOADER__ === version, CURRENT_PRACTICE_LOADER, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });
}

async function answerCurrent(page) {
  const option = page.locator('.single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click();
  await expect(page.locator('.single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 15000 });
}

test.describe('QCM critical click behavior', () => {
  test('real next click changes the current QCM question', async ({ page }) => {
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrent(page);

    const next = page.locator('.single-question-card [data-action="next-question"], #practiceMobileNextBar .practice-stable-next').first();
    await expect(next).toBeVisible({ timeout: 10000 });
    await next.scrollIntoViewIfNeeded();
    await next.click();

    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await expect.poll(async () => page.locator('.single-question-card').first().getAttribute('id'), { timeout: 15000 }).not.toBe(firstId);
  });

  test('details control in the correction remains openable after answering', async ({ page }) => {
    await waitPracticeReady(page);
    await answerCurrent(page);

    const panel = page.locator('.single-question-card .answer-panel:not([hidden])').first();
    await expect(panel).toBeVisible({ timeout: 10000 });

    const details = panel.locator('details').first();
    const hasDetails = await details.count();
    if (hasDetails) {
      const summary = details.locator('summary').first();
      await expect(summary).toBeVisible({ timeout: 10000 });
      const alreadyOpen = await details.evaluate(el => !!el.open);
      if (!alreadyOpen) await summary.click();
      await expect(details).toHaveJSProperty('open', true, { timeout: 10000 });
      return;
    }

    const detailButton = panel.locator('button, a, [role="button"]').filter({ hasText: /detalles|détails|details|voir plus|ver más|mostrar más|plus de/i }).first();
    if (await detailButton.count()) {
      await expect(detailButton).toBeVisible({ timeout: 10000 });
      await detailButton.click();
      await expect(panel).toBeVisible({ timeout: 10000 });
      await expect(panel.locator('.detailed-correction, .premium-correction-card, .pc-card, .ppc-card, .ppc-panel').first()).toBeVisible({ timeout: 10000 });
      return;
    }

    await expect(panel).toContainText(/respuesta|correcta|correcci/i);
  });
});
