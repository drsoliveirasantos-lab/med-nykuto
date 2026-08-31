const { test, expect } = require('@playwright/test');

test('exam page exposes a usable exam setup and does not dead-end', async ({ page }) => {
  await page.goto('/examen.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#examSetup')).toBeVisible({ timeout: 15000 });

  const setupText = (await page.locator('#examSetup').innerText({ timeout: 15000 })).trim();
  expect(setupText.length, 'exam setup should not stay empty').toBeGreaterThan(20);
  await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read|Application error/i, { timeout: 1000 });

  const launchControl = page.locator('#examSetup #startExamBtn');
  await expect(launchControl, 'exam page should expose its dedicated launch control').toBeVisible({ timeout: 15000 });
  await launchControl.click();

  await expect(page).toHaveURL(/qcm\.html\?(?=.*difficulty=examen)(?=.*exam=1)/, { timeout: 15000 });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read|Application error/i, { timeout: 1000 });
});
