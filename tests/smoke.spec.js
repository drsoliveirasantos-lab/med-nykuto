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

  test('restored course, module and runtime health data are available', async ({ page }) => {
    await page.goto('/matieres.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_POLISH__ === 'v363-loader');
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_FIX__ === 'v360');
    await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361');
    const data = await page.evaluate(() => {
      const modules = (window.MED_COURSES_DATA?.courses || []).flatMap(c => c.modules || []);
      return {
        hasData: !!window.MED_COURSES_DATA,
        courseCount: window.MED_COURSES_DATA?.courses?.length || 0,
        moduleCount: modules.length,
        richModules: modules.filter(m => String(m.markdown || m.fullMarkdown || '').length > 2500).length,
        polish: window.__MED_NYKUTO_GLOBAL_POLISH__ || '',
        repair: window.__MED_NYKUTO_GLOBAL_FIX__ || '',
        runtime: window.__MED_NYKUTO_RUNTIME_GUARD__ || '',
        health: window.MED_NYKUTO_HEALTH || null,
        bodyHealth: document.body?.dataset?.medHealth || '',
        bankRequired: document.body?.dataset?.medBankRequired || ''
      };
    });
    expect(data.hasData).toBeTruthy();
    expect(data.courseCount).toBeGreaterThanOrEqual(6);
    expect(data.moduleCount).toBe(58);
    expect(data.richModules).toBeGreaterThanOrEqual(50);
    expect(data.polish).toBe('v363-loader');
    expect(data.repair).toBe('v360');
    expect(data.runtime).toBe('v361');
    expect(data.health?.ok).toBeTruthy();
    expect(data.health?.moduleCount).toBe(58);
    expect(data.bodyHealth).toBe('ok');
    expect(data.bankRequired).toBe('0');
    await expect(page.locator('.course-card').first()).toBeVisible();
  });

  test('home does not expose stale fixed question metrics', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361');
    await expect(page.locator('body')).not.toContainText('2088');
    await expect(page.locator('body')).not.toContainText('1044');
    await expect(page.locator('body')).not.toContainText('1160');
    await expect(page.locator('body')).not.toContainText('2900');
    await expect(page.locator('.home-v41-proof')).toContainText('QCM');
  });

  test('coming-soon Biofísica card is disabled safely', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361');
    const biofisica = page.locator('.subject-progress-card', { hasText: /Biofísica/ }).first();
    await expect(biofisica).toHaveAttribute('aria-disabled', 'true');
    const before = page.url();
    await biofisica.click();
    await expect(page).toHaveURL(before);
  });
});
