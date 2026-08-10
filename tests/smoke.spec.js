const { test, expect } = require('@playwright/test');

const CURRENT_GLOBAL_POLISH = 'v378-loader';
const CURRENT_RUNTIME_GUARD = 'v362';
const CURRENT_MODULE_READER = 'v107-visible-reader-mode-tabs';
const EXPECTED_TOTAL_MODULES = 59;
const EXPECTED_FISIOLOGIA_MODULES = 10;

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

async function waitForBasePage(page){
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('#menuToggle')).toBeAttached();
}

test.describe('Med Nykuto smoke navigation', () => {
  for (const url of pages) {
    test(`page loads without old visible branding: ${url}`, async ({ page }) => {
      await page.goto(url);
      await waitForBasePage(page);
      await expect(page.locator('body')).not.toContainText('Med Cursos');
      await expect(page.locator('body')).not.toContainText('Netlify');
      await expect(page.locator('body')).not.toContainText('Mensaje enviado');
    });
  }

  test('restored course, module and runtime health data are available', async ({ page }) => {
    await page.goto('/matieres.html');
    await page.waitForFunction((version) => window.__MED_NYKUTO_GLOBAL_POLISH__ === version, CURRENT_GLOBAL_POLISH, { timeout: 20000 });
    await page.waitForFunction(() => window.__MED_NYKUTO_GLOBAL_FIX__ === 'v360', null, { timeout: 20000 });
    await page.waitForFunction((version) => window.__MED_NYKUTO_RUNTIME_GUARD__ === version, CURRENT_RUNTIME_GUARD, { timeout: 20000 });
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
    expect(data.moduleCount).toBe(EXPECTED_TOTAL_MODULES);
    expect(data.richModules).toBeGreaterThanOrEqual(50);
    expect(data.polish).toBe(CURRENT_GLOBAL_POLISH);
    expect(data.repair).toBe('v360');
    expect(data.runtime).toBe(CURRENT_RUNTIME_GUARD);
    expect(data.health?.ok).toBeTruthy();
    expect(data.health?.moduleCount).toBe(EXPECTED_TOTAL_MODULES);
    expect(data.bodyHealth).toBe('ok');
    expect(data.bankRequired).toBe('0');
  });

  test('homepage subject picker opens as a modal and routes selection correctly', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ === 'v370-scroll-safe-modal', null, { timeout: 20000 });
    const trigger = page.locator('[data-testid="home-subject-picker-trigger"]').first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('#homeSubjectModal.open')).toBeVisible();
    await expect(page.locator('[data-testid="home-subject-choice"]')).toHaveCount(5);
    await page.locator('[data-home-course-id="fisiologia"]').click();
    await expect(page.locator('#homePickTitle')).toContainText('Fisiología — Elegir un módulo');
    await expect(page.locator('[data-testid="home-module-choice"]')).toHaveCount(EXPECTED_FISIOLOGIA_MODULES);
  });

  test('Spanish is the coherent default when no language preference is stored', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('medLang');
      localStorage.removeItem('medCursosLang');
    });
    await page.goto('/qcm.html?course=fisiologia');
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('body')).toHaveAttribute('data-lang', 'es');
    await expect(page.locator('[data-lang="es"]').first()).toHaveClass(/active/);
    await expect(page.locator('#adaptiveWeakDashboardV261')).toContainText('Mis puntos débiles');
    await expect(page.locator('#adaptiveWeakDashboardV261')).not.toContainText(/Mes points faibles|Afficher|Réinitialiser/);
  });

  test('module page uses content-first reader layout and exposes all reading modes', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await page.waitForFunction((version) => window.__MED_NYKUTO_MODULE_DIRECT_READER__ === version, CURRENT_MODULE_READER, { timeout: 20000 });
    await expect(page.locator('body')).toHaveClass(/module-direct-ready/);
    await expect(page.locator('#moduleContent')).toBeVisible();
    await expect(page.locator('.mobile-toc')).toBeHidden();
    await expect(page.locator('.module-nav')).toBeHidden();
    const tabs = page.locator('.reader-view-tabs');
    await expect(tabs).toBeVisible();
    await expect(tabs.locator('.reader-tab')).toHaveCount(3);
    await expect(tabs.locator('.reader-tab.active')).toContainText('Curso completo');
    await tabs.locator('a[href*="view=fiche"]').click();
    await expect(page).toHaveURL(/view=fiche/);
    await expect(page.locator('body')).toHaveAttribute('data-reader-mode', 'fiche');
    await expect(page.locator('.reader-view-tabs .reader-tab.active')).toContainText('Ficha rápida');
  });

  test('Biofísica is absent or disabled safely', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction((version) => window.__MED_NYKUTO_RUNTIME_GUARD__ === version, CURRENT_RUNTIME_GUARD, { timeout: 20000 });
    const biofisica = page.locator('.subject-progress-card', { hasText: /Biofísica/ }).first();
    const count = await biofisica.count();
    if (count === 0) return;
    await expect(biofisica).toHaveAttribute('aria-disabled', 'true');
    const before = page.url();
    await biofisica.click();
    await expect(page).toHaveURL(before);
  });
});
