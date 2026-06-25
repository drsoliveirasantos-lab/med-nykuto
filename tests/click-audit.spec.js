const { test, expect } = require('@playwright/test');

const pages = [
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
  '/a-propos.html',
  '/mentions.html'
];

const navExpectations = [
  ['Inicio', /index\.html|\/$/],
  ['Materias', /matieres\.html/],
  ['Módulos', /modules\.html/],
  ['QCM', /qcm\.html/],
  ['Casos clínicos', /cas-cliniques\.html/],
  ['V/F', /vrai-faux\.html/],
  ['Errores', /erreurs\.html/],
  ['Examen blanco', /examen\.html/],
  ['Contacto', /contact\.html/]
];

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function waitReady(page) {
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
}

test.describe('Med Nykuto broad click audit', () => {
  for (const url of pages) {
    test(`interactive controls are usable and safe on ${url}`, async ({ page }) => {
      const errors = collectPageErrors(page);
      await page.goto(url);
      await waitReady(page);

      const audit = await page.evaluate(() => {
        const visible = el => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        };
        const controls = Array.from(document.querySelectorAll('a, button, summary, label, [role="button"], .option, [data-action]'))
          .filter(visible)
          .map(el => ({
            tag: el.tagName,
            text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
            href: el.getAttribute('href') || '',
            disabled: el.getAttribute('aria-disabled') === 'true' || el.disabled === true || el.closest('.is-coming-soon'),
            pointer: getComputedStyle(el).pointerEvents,
            id: el.id || '',
            cls: el.className || ''
          }));
        return {
          count: controls.length,
          badPointer: controls.filter(x => !x.disabled && x.pointer === 'none'),
          badHref: controls.filter(x => x.tag === 'A' && !x.disabled && x.href === '#'),
          emptyButtons: controls.filter(x => (x.tag === 'BUTTON' || x.tag === 'A') && !x.text && !x.id && !x.href)
        };
      });

      expect(audit.count).toBeGreaterThan(3);
      expect(audit.badPointer).toEqual([]);
      expect(audit.badHref).toEqual([]);
      expect(audit.emptyButtons).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('main navigation links go to the expected pages', async ({ page }) => {
    for (const [label, expectedUrl] of navExpectations) {
      const errors = collectPageErrors(page);
      await page.goto('/index.html');
      await waitReady(page);
      const link = page.locator('#navLinks a', { hasText: label }).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(expectedUrl);
      await expect(page.locator('body')).toBeVisible();
      expect(errors).toEqual([]);
    }
  });

  test('reader action buttons route to training pages for the selected module', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitReady(page);
    await expect(page.locator('#moduleTitle')).toContainText(/Neurofisiología|potencial/i);

    await page.locator('#openQcmBtn').click();
    await expect(page).toHaveURL(/qcm\.html/);
    await expect(page.locator('.option').first()).toBeVisible();

    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitReady(page);
    await page.locator('#openCaseBtn').click();
    await expect(page).toHaveURL(/cas-cliniques\.html/);
    await expect(page.locator('.option').first()).toBeVisible();
  });

  test('mark-as-seen button toggles module progress without navigation break', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitReady(page);
    const before = page.url();
    const btn = page.locator('#markDoneBtn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(before);
    await expect(btn).toBeVisible();
  });

  test('practice mode pills navigate between QCM cases V/F and errors', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia');
    await waitReady(page);
    await expect(page.locator('.option').first()).toBeVisible();

    await page.locator('.practice-compact-pill', { hasText: 'Casos' }).first().click();
    await expect(page).toHaveURL(/cas-cliniques\.html/);
    await expect(page.locator('.option').first()).toBeVisible();

    await page.locator('.practice-compact-pill', { hasText: 'V/F' }).first().click();
    await expect(page).toHaveURL(/vrai-faux\.html/);
    await expect(page.locator('.option').first()).toBeVisible();

    await page.locator('.practice-compact-pill', { hasText: 'Errores' }).first().click();
    await expect(page).toHaveURL(/erreurs\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('course filter controls are clickable when present', async ({ page }) => {
    await page.goto('/qcm.html');
    await waitReady(page);
    const chips = page.locator('#courseFilters .chip, #courseFilters button, #courseFilters a, #courseFilters [data-course], #courseFilters [role="button"]');
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 0; i < Math.min(count, 5); i++) {
      await chips.nth(i).click();
      await expect(page.locator('#practiceList')).toBeVisible();
    }
  });

  test('exam setup has clickable start controls and does not crash', async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto('/examen.html');
    await waitReady(page);
    await expect(page.locator('#examSetup')).toBeVisible();
    const buttons = page.locator('#examSetup button, #examSetup a, .exam-setup button, .exam-setup a');
    await expect(buttons.first()).toBeVisible();
    expect(await buttons.count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});
