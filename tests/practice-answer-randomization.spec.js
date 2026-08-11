const { test, expect } = require('@playwright/test');

const MODULE_2 = '01-fisiologia-02-transporte-de-membrana';

function longestRun(values) {
  let longest = 0;
  let current = 0;
  let previous = null;
  values.forEach((value) => {
    current = value === previous ? current + 1 : 1;
    previous = value;
    longest = Math.max(longest, current);
  });
  return longest;
}

test('physiology module batches mix A-D answers without remapping errors', async ({ page }) => {
  await page.goto(`/qcm.html?course=fisiologia&module=${MODULE_2}`);
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v371');
  await expect(page.locator('.single-question-card')).toBeVisible({ timeout: 20000 });

  const positions = [];
  for (let index = 0; index < 20; index += 1) {
    const answer = page.locator('.single-question-card .option').first();
    await expect(answer).toBeEnabled();
    await answer.click();
    const correct = page.locator('.single-question-card .option.correct');
    await expect(correct).toHaveCount(1);
    positions.push(Number(await correct.getAttribute('data-option')));
    if (index < 19) {
      const previousQuestionId = await page.locator('.single-question-card').getAttribute('id');
      const next = page.locator('.single-question-card [data-action="next-question"]').first();
      await expect(next).toBeVisible();
      await expect(next).toBeEnabled();
      await next.scrollIntoViewIfNeeded();
      await next.click();
      await expect(page.locator('.single-question-card')).not.toHaveAttribute('id', previousQuestionId);
      await expect(page.locator('.single-question-card .option').first()).toBeVisible();
    }
  }

  const counts = [0, 0, 0, 0];
  positions.forEach((position) => { counts[position] += 1; });
  expect(Math.min(...counts)).toBeGreaterThanOrEqual(3);
  expect(Math.max(...counts)).toBeLessThanOrEqual(7);
  expect(longestRun(positions)).toBeLessThanOrEqual(3);
});

test('true-false batches avoid pathological same-answer streaks', async ({ page }) => {
  await page.goto(`/vrai-faux.html?course=fisiologia&module=${MODULE_2}`);
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v371');
  await expect(page.locator('.single-question-card')).toBeVisible({ timeout: 20000 });

  const positions = [];
  for (let index = 0; index < 20; index += 1) {
    const answer = page.locator('.single-question-card .option').first();
    await expect(answer).toBeEnabled();
    await answer.click();
    const correct = page.locator('.single-question-card .option.correct');
    await expect(correct).toHaveCount(1);
    positions.push(Number(await correct.getAttribute('data-option')));
    if (index < 19) {
      const previousQuestionId = await page.locator('.single-question-card').getAttribute('id');
      const next = page.locator('.single-question-card [data-action="next-question"]').first();
      await expect(next).toBeVisible();
      await expect(next).toBeEnabled();
      await next.scrollIntoViewIfNeeded();
      await next.click();
      await expect(page.locator('.single-question-card')).not.toHaveAttribute('id', previousQuestionId);
      await expect(page.locator('.single-question-card .option').first()).toBeVisible();
    }
  }

  expect(new Set(positions).size).toBe(2);
  expect(longestRun(positions)).toBeLessThanOrEqual(3);
});
