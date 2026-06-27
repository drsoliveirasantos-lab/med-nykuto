const { test, expect } = require('@playwright/test');

async function reset(page) {
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
}

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await reset(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerAndNext(page) {
  const card = page.locator('#practiceList .single-question-card').first();
  const beforeText = await card.innerText();
  const option = card.locator('button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 10000 });
  const next = page.locator('#practiceList .single-question-card button, #practiceList .single-question-card [role="button"]').filter({ hasText: /siguiente|next|continuar|otra|nouvelle|suivante/i }).first();
  if (await next.count()) {
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });
    await expect.poll(async () => (await page.locator('#practiceList .single-question-card').first().innerText()) !== beforeText, { timeout: 10000 }).toBeTruthy();
  }
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 10000 });
}

test('student can complete the main study loop without dead ends', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Med Nykuto/i);
  await expect(page.locator('body')).toContainText(/QCM|Casos|Materias/i);

  await page.goto('/matieres.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main, body')).toContainText(/Fisiolog|Microbiolog|Gen[eé]tica|Inmunolog|Bioqu[ií]mica/i, { timeout: 15000 });

  await page.goto('/modules.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#moduleGrid, main')).toBeVisible({ timeout: 15000 });
  const moduleLinks = page.locator('a[href*="module"], .module-card a, #moduleGrid a');
  expect(await moduleLinks.count(), 'modules page must expose module links/cards').toBeGreaterThan(0);

  await openPractice(page, '/qcm.html?course=fisiologia');
  await answerAndNext(page);

  await openPractice(page, '/cas-cliniques.html?course=fisiologia');
  await answerAndNext(page);

  await openPractice(page, '/vrai-faux.html?course=fisiologia');
  await answerAndNext(page);

  await page.goto('/erreurs.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read/i, { timeout: 1000 });
});
