const { test, expect } = require('@playwright/test');

async function loadVfPage(page) {
  await page.goto('/vrai-faux.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#practiceList .single-question-card button.option[data-option]').first()).toBeVisible({ timeout: 20000 });
}

async function currentIdentity(page) {
  return page.evaluate(() => {
    const card = document.querySelector('#practiceList .single-question-card');
    if (!card) return '';
    const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return `${card.id || 'no-id'}|${(prompt?.textContent || '').replace(/\s+/g, ' ').trim()}`;
  });
}

test.describe('Verdadero/Falso critical behavior', () => {
  test('answer, explanation and next do not navigate or empty the page', async ({ page }) => {
    await loadVfPage(page);
    const firstIdentity = await currentIdentity(page);
    const initialUrl = page.url();

    const firstOption = page.locator('#practiceList .single-question-card button.option[data-option]').first();
    await firstOption.scrollIntoViewIfNeeded();
    await firstOption.click({ force: true });

    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 8000 });
    expect(page.url()).toBe(initialUrl);

    const explanationControl = page.locator('#practiceList .single-question-card details summary, #practiceList .single-question-card .ppc-toggle').filter({ hasText: /explicaci[oó]n|explication|compl[eè]te|completa|voir|ver/i }).first();
    if (await explanationControl.isVisible().catch(() => false)) {
      await explanationControl.click({ force: true });
      await expect(page.locator('#practiceList .single-question-card')).toContainText(/respuesta|correcta|razonamiento|correcci|examen|mecanismo/i, { timeout: 5000 });
      expect(page.url()).toBe(initialUrl);
    }

    const next = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 5000 });
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });

    await expect.poll(() => currentIdentity(page), { timeout: 10000 }).not.toBe(firstIdentity);
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 5000 });
    expect(page.url()).toBe(initialUrl);
  });
});
