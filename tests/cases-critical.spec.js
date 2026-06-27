const { test, expect } = require('@playwright/test');

async function loadCasePage(page) {
  await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#practiceList .single-question-card button.option[data-option]').first()).toBeVisible({ timeout: 20000 });
}

async function currentIdentity(page) {
  return page.evaluate(() => {
    const card = document.querySelector('#practiceList .single-question-card');
    if (!card) return '';
    const prompt = card.querySelector('.question-prompt, .case-stem, h2, h3');
    return `${card.id || 'no-id'}|${(prompt?.textContent || '').replace(/\s+/g, ' ').trim()}`;
  });
}

async function visibleCardCount(page) {
  return page.locator('#practiceList .single-question-card').count();
}

test.describe('Casos clínicos critical behavior', () => {
  test('answer, complete explanation and next are local and instant', async ({ page }) => {
    await loadCasePage(page);
    const firstIdentity = await currentIdentity(page);
    const initialUrl = page.url();

    const firstOption = page.locator('#practiceList .single-question-card button.option[data-option]').first();
    await firstOption.scrollIntoViewIfNeeded();
    await firstOption.click({ force: true });

    const panel = page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first();
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect.poll(() => visibleCardCount(page), { timeout: 5000 }).toBeGreaterThan(0);
    expect(page.url()).toBe(initialUrl);

    const summary = panel.locator('details summary').filter({ hasText: /explicaci[oó]n|explication|compl[eè]te|completa|voir|ver/i }).first();
    await expect(summary).toBeVisible({ timeout: 5000 });
    const details = panel.locator('details').first();

    if (await details.evaluate((node) => node.open).catch(() => false)) {
      await summary.click({ force: true });
      await expect.poll(() => details.evaluate((node) => node.open), { timeout: 5000 }).toBe(false);
    }

    await summary.click({ force: true });
    await expect.poll(() => details.evaluate((node) => node.open), { timeout: 5000 }).toBe(true);
    await expect(panel).toContainText(/Justification|Razonamiento|correcta|respuesta|retenir|recordar|examen/i, { timeout: 5000 });
    expect(page.url()).toBe(initialUrl);

    const next = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 5000 });
    await expect(next).toBeEnabled({ timeout: 5000 });
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });

    await expect.poll(() => currentIdentity(page), { timeout: 10000 }).not.toBe(firstIdentity);
    await expect.poll(() => visibleCardCount(page), { timeout: 5000 }).toBeGreaterThan(0);
    expect(page.url()).toBe(initialUrl);
  });
});
