const { test, expect } = require('@playwright/test');

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerFirst(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 10000 });
}

async function expectNoNavigationAfterClick(page, locator) {
  const before = page.url();
  await locator.scrollIntoViewIfNeeded();
  await locator.click({ force: true });
  await page.waitForTimeout(250);
  expect(page.url()).toBe(before);
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 5000 });
}

for (const [label, url] of [
  ['qcm', '/qcm.html?course=fisiologia'],
  ['cases', '/cas-cliniques.html?course=fisiologia'],
  ['vf', '/vrai-faux.html?course=fisiologia']
]) {
  test(`${label}: explanation controls are local, not navigation`, async ({ page }) => {
    await openPractice(page, url);
    await answerFirst(page);

    const controls = page.locator('#practiceList .single-question-card details summary, #practiceList .single-question-card .ppc-toggle, #practiceList .single-question-card [role="button"]').filter({ hasText: /explicaci[oó]n|explication|detalles|détails|distractores|voir|ver/i });
    const count = await controls.count();
    expect(count, `${label} must expose at least one local explanation/detail control`).toBeGreaterThan(0);
    await expectNoNavigationAfterClick(page, controls.first());
  });
}

test('No sé / Ver respuesta reveals locally without navigation', async ({ page }) => {
  await openPractice(page, '/cas-cliniques.html?course=fisiologia');
  const before = page.url();
  const dontKnow = page.locator('#practiceList .single-question-card [data-action="dont-know"]').first();
  await expect(dontKnow).toBeVisible({ timeout: 10000 });
  await dontKnow.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 8000 });
  expect(page.url()).toBe(before);
});
