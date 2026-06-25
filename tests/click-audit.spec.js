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
  ['#navLinks a[href="index.html"], #navLinks a[href="/"]', /index\.html|\/$/],
  ['#navLinks a[href="matieres.html"]', /matieres\.html/],
  ['#navLinks a[href="modules.html"]', /modules\.html/],
  ['#navLinks a[href="qcm.html"]', /qcm\.html/],
  ['#navLinks a[href="cas-cliniques.html"]', /cas-cliniques\.html/],
  ['#navLinks a[href="vrai-faux.html"]', /vrai-faux\.html/],
  ['#navLinks a[href="erreurs.html"]', /erreurs\.html/],
  ['#navLinks a[href="examen.html"]', /examen\.html/],
  ['#navLinks a[href="contact.html"]', /contact\.html/]
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

async function clickHref(page, hrefPart) {
  const link = page.locator(`a[href*="${hrefPart}"]`).first();
  await expect(link).toBeAttached({ timeout: 15000 });
  await link.click();
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
        const isDisabled = el => (
          el.getAttribute('aria-disabled') === 'true' ||
          el.disabled === true ||
          el.classList.contains('disabled') ||
          !!el.closest('.disabled,.is-coming-soon,[aria-disabled="true"]')
        );
        const className = el => String(el.className || '');
        const isActionHash = el => (
          el.getAttribute('href') === '#' && (
            el.hasAttribute('data-action') ||
            el.getAttribute('role') === 'button' ||
            /toggle|chip|filter|tab|dropdown|expand|collapse|force-toggle/.test(className(el))
          )
        );
        const isIconOnlyControl = el => (
          /zoom|icon|close|hamburger|menu-toggle/.test(className(el)) ||
          !!el.getAttribute('aria-label') ||
          !!el.getAttribute('title')
        );
        const controls = Array.from(document.querySelectorAll('a, button, summary, label, [role="button"], .option, [data-action]'))
          .filter(visible)
          .map(el => ({
            tag: el.tagName,
            text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
            href: el.getAttribute('href') || '',
            disabled: isDisabled(el),
            actionHash: isActionHash(el),
            iconOnly: isIconOnlyControl(el),
            pointer: getComputedStyle(el).pointerEvents,
            id: el.id || '',
            cls: el.className || '',
            label: el.getAttribute('aria-label') || el.getAttribute('title') || ''
          }));
        return {
          count: controls.length,
          badPointer: controls.filter(x => !x.disabled && x.pointer === 'none'),
          badHref: controls.filter(x => x.tag === 'A' && !x.disabled && !x.actionHash && x.href === '#'),
          emptyButtons: controls.filter(x => (x.tag === 'BUTTON' || x.tag === 'A') && !x.text && !x.id && !x.href && !x.label && !x.iconOnly)
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
    for (const [selector, expectedUrl] of navExpectations) {
      const errors = collectPageErrors(page);
      await page.goto('/index.html');
      await waitReady(page);
      const link = page.locator(selector).first();
      await expect(link).toBeAttached({ timeout: 15000 });
      await link.click();
      await expect(page).toHaveURL(expectedUrl);
      await expect(page.locator('body')).toBeVisible();
      expect(errors).toEqual([]);
    }
  });

  test('reader action buttons route to training pages for the selected module', async ({ page }) => {
    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitReady(page);
    await expect(page.locator('#moduleTitle')).not.toHaveText('');

    await page.locator('#openQcmBtn').click();
    await expect(page).toHaveURL(/qcm\.html/);
    await expect(page.locator('.option').first()).toBeAttached();

    await page.goto('/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion');
    await waitReady(page);
    await page.locator('#openCaseBtn').click();
    await expect(page).toHaveURL(/cas-cliniques\.html/);
    await expect(page.locator('.option').first()).toBeAttached();
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
    await expect(page.locator('.option').first()).toBeAttached();

    await clickHref(page, 'cas-cliniques.html');
    await expect(page).toHaveURL(/cas-cliniques\.html/);
    await expect(page.locator('.option').first()).toBeAttached();

    await clickHref(page, 'vrai-faux.html');
    await expect(page).toHaveURL(/vrai-faux\.html/);
    await expect(page.locator('.option').first()).toBeAttached();

    await clickHref(page, 'erreurs.html');
    await expect(page).toHaveURL(/erreurs\.html/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('course filter controls are clickable when present', async ({ page }) => {
    await page.goto('/qcm.html');
    await waitReady(page);
    const visibleFilterHrefs = await page.evaluate(() => {
      const visible = el => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };
      return Array.from(document.querySelectorAll('#courseFilters a:not(.active), #courseFilters button:not(.active), #courseFilters [data-course]:not(.active), #courseFilters [role="button"]:not(.active)'))
        .filter(visible)
        .map(el => el.getAttribute('href') || el.dataset.course || '')
        .filter(Boolean)
        .slice(0, 5);
    });
    if (!visibleFilterHrefs.length) {
      await expect(page.locator('#practiceList')).toBeVisible();
      return;
    }
    for (const target of visibleFilterHrefs) {
      if (/\.html/.test(target)) {
        await page.goto(target.startsWith('/') ? target : `/${target}`);
      } else {
        await page.goto(`/qcm.html?course=${encodeURIComponent(target)}`);
      }
      await waitReady(page);
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
