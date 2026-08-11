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

async function readPracticeSession(page, type) {
  return page.evaluate((practiceType) => {
    const prefix = `medPractice:v371-answer-mix:study:${practiceType}:`;
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    const key = keys.find((entry) => entry && entry.startsWith(prefix));
    return key ? JSON.parse(localStorage.getItem(key)) : null;
  }, type);
}

test('physiology module batches mix A-D answers without remapping errors', async ({ page }) => {
  await page.goto(`/qcm.html?course=fisiologia&module=${MODULE_2}`);
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v371');
  await expect(page.locator('.single-question-card')).toBeVisible({ timeout: 20000 });

  await page.locator('.single-question-card .option').first().click();
  const correct = page.locator('.single-question-card .option.correct');
  await expect(correct).toHaveCount(1);
  await expect.poll(() => readPracticeSession(page, 'qcm')).toBeTruthy();
  const session = await readPracticeSession(page, 'qcm');
  expect(session).toBeTruthy();
  const positions = session.currentBatch.map((id) => session.answerSlots[id]);
  expect(Number(await correct.getAttribute('data-option'))).toBe(positions[0]);

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

  await page.locator('.single-question-card .option').first().click();
  await expect.poll(() => readPracticeSession(page, 'vf')).toBeTruthy();
  const positions = await page.evaluate(() => {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    const key = keys.find((entry) => entry && entry.startsWith('medPractice:v371-answer-mix:study:vf:'));
    const session = key ? JSON.parse(localStorage.getItem(key)) : null;
    const byId = new Map();
    const visit = (value) => {
      if (!value || typeof value !== 'object') return;
      if (value.id && Number.isInteger(value.answerIndex)) byId.set(value.id, value.answerIndex);
      Object.values(value).forEach(visit);
    };
    visit(window.MED_PRACTICE_BANK);
    return session.currentBatch.map((id) => byId.get(id));
  });

  expect(new Set(positions).size).toBe(2);
  expect(longestRun(positions)).toBeLessThanOrEqual(3);
});
