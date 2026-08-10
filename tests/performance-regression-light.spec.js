const { test, expect } = require('@playwright/test');

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function currentIdentity(page) {
  return page.evaluate(() => {
    const card = document.querySelector('#practiceList .single-question-card');
    if (!card) return '';
    return `${card.id || ''}|${(card.querySelector('.question-prompt, .case-stem, h3')?.textContent || '').replace(/\s+/g, ' ').trim()}`;
  });
}

async function sampleCardCounts(page) {
  const samples = [];
  for (let i = 0; i < 10; i += 1) {
    samples.push(await page.locator('#practiceList .single-question-card').count());
    await page.waitForTimeout(60);
  }
  return samples;
}

for (const [label, url] of [
  ['qcm', '/qcm.html?course=fisiologia'],
  ['cases', '/cas-cliniques.html?course=fisiologia']
]) {
  test(`${label}: answer and next do not leave an empty practice list`, async ({ page }) => {
    await openPractice(page, url);
    const firstIdentity = await currentIdentity(page);

    const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
    await option.scrollIntoViewIfNeeded();
    await option.click({ force: true });
    const answerSamples = await sampleCardCounts(page);
    expect(answerSamples.every((count) => count > 0), `${label} answer must not empty #practiceList`).toBeTruthy();
    await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 5000 });

    const next = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 5000 });
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });
    const nextSamples = await sampleCardCounts(page);
    expect(nextSamples.every((count) => count > 0), `${label} next must not empty #practiceList`).toBeTruthy();
    await expect.poll(() => currentIdentity(page), { timeout: 10000 }).not.toBe(firstIdentity);
  });
}
