const { test, expect } = require('@playwright/test');

test('diagnose QCM next click visibly changes card', async ({ page }) => {
  await page.goto('/qcm.html?course=fisiologia');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v364', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ === 'v104', null, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });

  const beforeId = await page.locator('.single-question-card').first().getAttribute('id');
  console.log('QCM_DIAG_BEFORE_ID=' + beforeId);
  console.log('QCM_DIAG_FALLBACK=' + await page.evaluate(() => window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ || 'none'));

  await page.locator('.single-question-card button.option[data-option]').first().click({ force: true });
  await expect(page.locator('.single-question-card .answer-panel:not([hidden])').first()).toBeAttached({ timeout: 15000 });

  const next = page.locator('.single-question-card [data-action="next-question"], #practiceMobileNextBar .practice-stable-next').first();
  await expect(next).toBeVisible({ timeout: 10000 });
  console.log('QCM_DIAG_NEXT_TEXT=' + await next.textContent());
  console.log('QCM_DIAG_NEXT_DISABLED=' + await next.evaluate(el => el.disabled || el.hasAttribute('disabled')));

  await next.click({ force: true });
  await page.waitForTimeout(1500);
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

  const afterId = await page.locator('.single-question-card').first().getAttribute('id');
  console.log('QCM_DIAG_AFTER_ID=' + afterId);
  console.log('QCM_DIAG_FORCED=' + await page.evaluate(() => JSON.stringify(window.__MED_NYKUTO_LAST_FORCED_NEXT__ || null)));

  expect(afterId).not.toBe(beforeId);
});
