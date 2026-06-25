const { test, expect } = require('@playwright/test');

const pages = [
  '/',
  '/index.html',
  '/matieres.html',
  '/matiere.html?course=fisiologia',
  '/modules.html',
  '/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion',
  '/qcm.html?course=fisiologia',
  '/cas-cliniques.html?course=fisiologia',
  '/vrai-faux.html?course=fisiologia',
  '/erreurs.html',
  '/examen.html',
  '/contact.html',
  '/contact-success.html',
  '/a-propos.html',
  '/mentions.html'
];

test.describe('Med Nykuto smoke navigation', () => {
  for (const url of pages) {
    test(`page loads without old branding: ${url}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(url);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('.site-header')).toBeVisible();
      await expect(page.locator('#menuToggle')).toBeAttached();
      await expect(page.locator('body')).not.toContainText('Med Cursos');
      await expect(page.locator('body')).not.toContainText('Netlify');
      await expect(page.locator('body')).not.toContainText('Mensaje enviado');
      expect(errors).toEqual([]);
    });
  }

  test('course and module data are available', async ({ page }) => {
    await page.goto('/matieres.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_POLISH__ === 'v360-loader');
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_FIX__ === 'v360');
    const data = await page.evaluate(() => ({
      hasData: !!window.MED_COURSES_DATA,
      courseCount: window.MED_COURSES_DATA?.courses?.length || 0,
      moduleCount: (window.MED_COURSES_DATA?.courses || []).reduce((sum, c) => sum + (c.modules?.length || 0), 0),
      polish: window.__MED_NYKUTO_GLOBAL_POLISH__ || '',
      repair: window.__MED_NYKUTO_GLOBAL_FIX__ || ''
    }));
    expect(data.hasData).toBeTruthy();
    expect(data.courseCount).toBeGreaterThanOrEqual(5);
    expect(data.moduleCount).toBeGreaterThanOrEqual(40);
    expect(data.polish).toBe('v360-loader');
    expect(data.repair).toBe('v360');
    await expect(page.locator('.course-card').first()).toBeVisible();
  });

  test('home does not expose stale fixed question metrics', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('body')).not.toContainText('2088');
    await expect(page.locator('body')).not.toContainText('1044');
    await expect(page.locator('body')).not.toContainText('1160');
    await expect(page.locator('body')).not.toContainText('2900');
    await expect(page.locator('.home-v41-proof')).toContainText('QCM');
  });
});
