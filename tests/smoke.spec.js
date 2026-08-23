const { test, expect } = require('@playwright/test');

const CURRENT_GLOBAL_POLISH = 'v380-multilingual-loader';
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
    await page.addInitScript(() => localStorage.setItem('medNykuto:studentSemester', 's3'));
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_HOME_SUBJECT_PICKER__ === 'v460-semester-hub-routing', null, { timeout: 20000 });
    const trigger = page.locator('[data-testid="home-subject-picker-trigger"]').first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('#homeSubjectModal.open')).toBeVisible();
    await expect(page.locator('[data-testid="home-subject-choice"]')).toHaveCount(5);
    await page.locator('[data-home-course-id="fisiologia"]').click();
    await expect(page.locator('#homePickTitle')).toContainText('Fisiología — Elegir un módulo');
    await expect(page.locator('[data-testid="home-module-choice"]')).toHaveCount(EXPECTED_FISIOLOGIA_MODULES);
  });

  test('semester 3 opens the complete hub and semester 4 routes to its real class space', async ({ page }) => {
    await page.addInitScript(() => {
      const testKey = 'medNykuto:test:semester-cleared';
      if(sessionStorage.getItem(testKey)) return;
      localStorage.removeItem('medNykuto:studentSemester');
      sessionStorage.setItem(testKey, '1');
    });
    await page.goto('/index.html');
    await expect(page.locator('#homeSemesterModal.open')).toBeVisible();
    await expect(page.locator('[data-semester-select]')).toHaveCount(3);
    await expect(page.locator('[data-semester-select="s4"]')).toContainText('Agosto–diciembre de 2026');
    await expect(page.locator('[data-semester-select="s5"]')).toContainText('A partir de febrero de 2027');
    await page.locator('[data-semester-select="s3"]').click();
    await expect(page.locator('#homeSemesterModal')).not.toHaveClass(/open/);
    await expect(page.locator('.s3-dashboard')).toBeVisible();
    await expect(page.locator('#s3-home-title')).toContainText('Todo tu tercer semestre');
    await expect(page.locator('#statModules')).toHaveText('59');
    await expect(page.locator('#statCursoes')).toHaveText('5');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest-s3.webmanifest');
    await expect(page.locator('.home-class-entry-v401')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('medNykuto:studentSemester'))).toBe('s3');
    const semesterTrigger = page.locator('[data-semester-open]').first();
    await expect(semesterTrigger).toBeVisible();
    await semesterTrigger.click();
    await expect(page.locator('#homeSemesterModal.open')).toBeVisible();
    const semesterFour = page.locator('[data-semester-select="s4"]');
    await expect(semesterFour).toBeVisible();
    await semesterFour.click();
    await expect(page).toHaveURL(/clase(?:\.html)?$/);
    await expect(page.getByRole('heading', { name: 'Tu semana' })).toBeVisible();
  });

  test('semester 4 cannot open semester 3 courses or practice by direct URL', async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.setItem('medNykuto:studentSemester', 's4'));
    await page.goto('/qcm.html?course=fisiologia');
    await expect(page).toHaveURL(/clase\.html/);
    await expect(page.getByRole('heading', { name: 'Tu semana' })).toBeVisible();
    await expect(page.locator('body')).toContainText('Fisiología II');
    await expect(page.locator('body')).not.toContainText('Genética');
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
    await expect(page.locator('button[data-lang="es"]').first()).toHaveClass(/active/);
    await expect(page.locator('body')).toContainText('QCM rápido');
    await expect(page.locator('body')).not.toContainText(/Mes points faibles|Afficher|Réinitialiser/);
  });

  test('homepage language switch keeps the navigation and primary content coherent', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('medNykuto:studentSemester', 's3'));
    await page.goto('/index.html');
    await page.locator('button[data-lang="fr"]').click();
    await page.waitForFunction(() => document.body?.dataset?.lang === 'fr', null, { timeout: 15000 });
    await expect(page.locator('#s3-home-title')).toContainText('Tout ton troisième semestre');
    await expect(page.locator('[data-s3-copy="chooseSubject"]')).toHaveText('Choisir une matière');
    await expect(page.locator('#navLinks a[href="matieres.html"]')).toHaveText('Matières');
    await page.locator('[data-semester-open]').click();
    await expect(page.locator('#semesterTitle')).toHaveText('Quel est ton semestre ?');
    await expect(page.locator('[data-semester-select="s4"]')).toContainText('Août–décembre 2026');
    await page.keyboard.press('Escape');
    await expect(page.locator('#homeSemesterModal')).not.toHaveClass(/open/);

    await page.goto('/contact.html');
    await page.waitForFunction((version) => window.__MED_NYKUTO_GLOBAL_POLISH__ === version, CURRENT_GLOBAL_POLISH, { timeout: 20000 });
    await expect(page.locator('.footer > p')).toContainText('©');
    await expect(page.locator('.footer a[href="index.html"]')).toHaveText('Accueil');
    await page.goto('/index.html');

    await page.locator('button[data-lang="br"]').click();
    await page.waitForFunction(() => document.body?.dataset?.lang === 'br', null, { timeout: 15000 });
    await expect(page.locator('#s3-home-title')).toContainText('Todo o terceiro semestre');
    await expect(page.locator('#navLinks a[href="matieres.html"]')).toHaveText('Matérias');

    await page.locator('button[data-lang="es"]').click();
    await page.waitForFunction(() => document.body?.dataset?.lang === 'es', null, { timeout: 15000 });
    await expect(page.locator('#s3-home-title')).toContainText('Todo tu tercer semestre, en un solo lugar.');
  });

  test('semester 3 exposes a compact mobile navigation and accessible study sheet', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.addInitScript(() => localStorage.setItem('medNykuto:studentSemester', 's3'));
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_S3_SHELL__ === 'v460', null, { timeout: 20000 });
    const bottom = page.locator('#s3BottomNav');
    await expect(bottom).toBeVisible();
    await expect(bottom.locator('a,button')).toHaveCount(5);
    await bottom.locator('[data-s3-study-open]').click();
    await expect(page.locator('#s3StudySheet.open')).toBeVisible();
    await expect(page.locator('#s3StudySheet a')).toHaveCount(5);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#s3StudySheet')).not.toHaveClass(/open/);
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
    await page.addInitScript(() => localStorage.setItem('medNykuto:studentSemester', 's3'));
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
