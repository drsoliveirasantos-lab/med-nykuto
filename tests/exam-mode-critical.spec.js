const { test, expect } = require('@playwright/test');

async function clickFirstVisible(locator) {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    if (await item.isVisible().catch(() => false)) {
      await item.scrollIntoViewIfNeeded();
      await item.click({ force: true });
      return true;
    }
  }
  return false;
}

test('exam page exposes a usable exam setup and does not dead-end', async ({ page }) => {
  await page.goto('/examen.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#examSetup')).toBeVisible({ timeout: 15000 });

  const setupText = (await page.locator('#examSetup').innerText({ timeout: 15000 })).trim();
  expect(setupText.length, 'exam setup should not stay empty').toBeGreaterThan(20);
  await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read|Application error/i, { timeout: 1000 });

  const launchControls = page.locator('#examSetup button, #examSetup a, button, a').filter({ hasText: /iniciar|lanzar|empezar|comenzar|start|exam|examen|simulacro/i });
  const hasLaunch = await clickFirstVisible(launchControls);
  expect(hasLaunch, 'exam page should expose a visible launch/start control').toBeTruthy();

  await page.waitForTimeout(500);
  const examSurface = page.locator('#examSetup, #practiceList, .single-question-card, .exam-question, main').first();
  await expect(examSurface).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read|Application error/i, { timeout: 1000 });
});
