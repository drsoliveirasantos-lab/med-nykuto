const { test, expect } = require('@playwright/test');

const criticalPages = [
  '/index.html',
  '/matieres.html',
  '/modules.html',
  '/matiere.html?course=fisiologia',
  '/module.html?id=01-fisiologia-01-neurofisiologia-y-potencial-de-accion',
  '/qcm.html?course=fisiologia',
  '/cas-cliniques.html?course=fisiologia',
  '/vrai-faux.html?course=fisiologia',
  '/erreurs.html',
  '/examen.html',
  '/contact.html'
];

function collectRuntimeSignals(page) {
  const signals = { errors: [], failed: [] };
  page.on('pageerror', err => signals.errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') signals.errors.push(msg.text());
  });
  page.on('requestfailed', req => {
    const url = req.url();
    if (/\.(js|css|png|jpg|jpeg|webp|svg)(\?|$)/i.test(url)) {
      signals.failed.push(`${req.failure()?.errorText || 'failed'} ${url}`);
    }
  });
  return signals;
}

async function waitRuntime(page) {
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
}

async function waitPracticeReady(page) {
  await waitRuntime(page);
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363', null, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });
}

async function answerCurrentQuestion(page) {
  const answer = page.locator('.single-question-card button.option[data-option]').first();
  await expect(answer).toBeAttached({ timeout: 15000 });
  await answer.click({ force: true });
  await expect(page.locator('.single-question-card .answer-panel:not([hidden])').first()).toBeAttached({ timeout: 15000 });
}

test.describe('Med Nykuto full real UI audit', () => {
  for (const url of criticalPages) {
    test(`boots without critical console/resource errors: ${url}`, async ({ page }) => {
      const signals = collectRuntimeSignals(page);
      await page.goto(url);
      await waitRuntime(page);
      await page.waitForTimeout(350);
      expect(signals.failed).toEqual([]);
      expect(signals.errors.filter(e => /TypeError|ReferenceError|Cannot read|Uncaught|Failed to fetch|404/i.test(e))).toEqual([]);
    });
  }

  test('logo returns to homepage from practice page', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    await page.locator('a.brand, a.brand-official, .brand-logo-official').first().click({ force: true });
    await expect(page).toHaveURL(/\/index\.html$|\/$/, { timeout: 15000 });
  });

  test('QCM answer then next really changes the active question', async ({ page }) => {
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrentQuestion(page);
    await page.locator('.single-question-card [data-action="next-question"]').first().click({ force: true });
    await expect.poll(async () => page.locator('.single-question-card').first().getAttribute('id'), { timeout: 15000 }).not.toBe(firstId);
  });

  test('mobile QCM answer then next really changes the active question', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const firstId = await page.locator('.single-question-card').first().getAttribute('id');
    await answerCurrentQuestion(page);
    await page.locator('.single-question-card [data-action="next-question"], .compact-next-bar button, .compact-next-bar a').first().click({ force: true });
    await expect.poll(async () => page.locator('.single-question-card').first().getAttribute('id'), { timeout: 15000 }).not.toBe(firstId);
  });

  test('mobile menu opens and exposes navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await waitRuntime(page);
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible();
    await toggle.click({ force: true });
    const nav = page.locator('#navLinks');
    await expect(nav).toBeVisible({ timeout: 10000 });
    await expect(nav.locator('a[href="qcm.html"]').first()).toBeVisible();
  });

  test('visible critical controls are not covered by invisible overlays', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/qcm.html?course=fisiologia');
    await waitPracticeReady(page);
    const blocked = await page.evaluate(() => {
      const selectors = ['a.brand', 'a.brand-official', '#menuToggle', '.menu-toggle', '.single-question-card button.option', '.single-question-card [data-action="next-question"]'];
      const controls = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel))).filter(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      });
      return controls.map(el => {
        const r = el.getBoundingClientRect();
        const x = Math.min(Math.max(r.left + r.width / 2, 1), window.innerWidth - 1);
        const y = Math.min(Math.max(r.top + r.height / 2, 1), window.innerHeight - 1);
        const top = document.elementFromPoint(x, y);
        const ok = top === el || el.contains(top) || (top && top.contains(el));
        return ok ? null : {
          target: el.tagName + '#' + (el.id || '') + '.' + String(el.className || '').replace(/\s+/g, '.'),
          top: top ? top.tagName + '#' + (top.id || '') + '.' + String(top.className || '').replace(/\s+/g, '.') : 'none'
        };
      }).filter(Boolean);
    });
    expect(blocked).toEqual([]);
  });
});
