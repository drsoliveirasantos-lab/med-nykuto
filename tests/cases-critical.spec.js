const { test, expect } = require('@playwright/test');
const { expectBlockedClinicalCases } = require('./helpers/practice-policy');

async function loadBlockedCasePage(page, course) {
  await page.goto(`/cas-cliniques.html?course=${course}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
  await expectBlockedClinicalCases(page, expect, course);
}

test.describe('Casos clínicos quality gate', () => {
  test('every Semester 3 subject blocks inherited cases until manual review', async ({ page }) => {
    for (const course of ['fisiologia', 'microbiologia', 'genetica', 'bioquimica', 'inmunologia']) {
      await loadBlockedCasePage(page, course);
      await expect(page.locator('#practiceList')).toContainText(/no cumplen todavía el estándar clínico/i);
      await expect(page.locator('#practiceList .case-feedback-card, #practiceList .ppc-card')).toHaveCount(0);
    }
  });

  test('the quality notice offers certified recovery paths without a dead end', async ({ page }) => {
    await loadBlockedCasePage(page, 'fisiologia');
    const initialUrl = page.url();
    const qcm = page.locator('#practiceList a[href="qcm.html?course=fisiologia"]');
    const vf = page.locator('#practiceList a[href="vrai-faux.html?course=fisiologia"]');
    await expect(qcm).toBeVisible();
    await expect(vf).toBeVisible();
    expect(page.url()).toBe(initialUrl);

    await qcm.click();
    await expect(page).toHaveURL(/qcm\.html\?course=fisiologia/);
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
  });

  test('the unfiltered clinical entry explains the global quality gate', async ({ page }) => {
    await page.goto('/cas-cliniques.html', { waitUntil: 'domcontentloaded' });
    await expectBlockedClinicalCases(page, expect, null);
    await expect(page.locator('#practiceList')).toContainText(/del tercer semestre/i);
  });
});
