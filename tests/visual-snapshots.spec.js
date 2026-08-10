const { test, expect } = require('@playwright/test');
const path = require('path');

async function reset(page) {
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
}

async function saveShot(page, name, fullPage = true) {
  await page.screenshot({ path: path.join('test-results', 'visual-snapshots', `${name}.png`), fullPage });
}

async function answerFirst(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 20000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Visual snapshot evidence', () => {
  test('capture key desktop states', async ({ page }) => {
    await page.setViewportSize({ width: 1365, height: 900 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await saveShot(page, 'desktop-home');

    await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await reset(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
    await saveShot(page, 'desktop-qcm-before-answer');
    await answerFirst(page);
    await saveShot(page, 'desktop-qcm-after-answer');

    await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await reset(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await answerFirst(page);
    await saveShot(page, 'desktop-cases-after-answer');

    await page.goto('/vrai-faux.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await reset(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await answerFirst(page);
    await saveShot(page, 'desktop-vf-after-answer');
  });

  test('capture key mobile states', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click({ force: true });
    await saveShot(page, 'mobile-menu-open');

    await page.goto('/qcm.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await reset(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
    await saveShot(page, 'mobile-qcm-before-answer', false);
  });
});
