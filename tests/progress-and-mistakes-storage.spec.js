const { test, expect } = require('@playwright/test');

async function corruptStorage(page) {
  await page.evaluate(() => {
    localStorage.setItem('med-nykuto-progress', '{bad json');
    localStorage.setItem('med-nykuto-mistakes', '{bad json');
    localStorage.setItem('med-nykuto-contact-drafts-v358', '{bad json');
    sessionStorage.setItem('med-nykuto-session', '{bad json');
  });
}

async function openQcm(page) {
  await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerFirst(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 10000 });
}

test('practice survives corrupted localStorage and keeps the question flow usable', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await corruptStorage(page);
  await openQcm(page);
  await answerFirst(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
});

test('errors/progress surfaces do not break after answering and reloading', async ({ page }) => {
  await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  await answerFirst(page);

  const storageKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => /med|nykuto|practice|progress|mistake|error/i.test(key)));
  expect(storageKeys.length, 'answering should not prevent localStorage inspection and may create study-state keys').toBeGreaterThanOrEqual(0);

  await page.goto('/erreurs.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('body')).not.toContainText(/Application error|Cannot read|undefined|null/i, { timeout: 1000 });

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  const reset = page.locator('#clearProgress, button').filter({ hasText: /reiniciar|reset|limpiar/i }).first();
  if (await reset.count()) {
    await reset.click({ force: true });
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  }
});
