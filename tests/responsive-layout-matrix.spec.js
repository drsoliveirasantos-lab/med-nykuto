const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-modern', width: 390, height: 844 },
  { name: 'android-large', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 }
];

const pages = [
  '/index.html',
  '/modules.html',
  '/qcm.html?course=fisiologia',
  '/cas-cliniques.html?course=fisiologia',
  '/vrai-faux.html?course=fisiologia',
  '/contact.html'
];

for (const viewport of viewports) {
  for (const path of pages) {
    test(`${viewport.name} ${path}: layout stays usable`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status() || 0, `${path} should not return HTTP error`).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

      const layout = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const visibleControls = Array.from(document.querySelectorAll('a, button, input, select, textarea'))
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
          })
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return { tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || '').trim(), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
          });
        return {
          innerWidth,
          scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
          visibleTextLength: (body.innerText || '').trim().length,
          visibleControls,
          hasMain: !!document.querySelector('main'),
          hasMenuToggle: !!document.querySelector('#menuToggle, .menu-toggle')
        };
      });

      expect(layout.visibleTextLength, `${viewport.name} ${path}: page should have visible content`).toBeGreaterThan(80);
      expect(layout.hasMain, `${viewport.name} ${path}: page should have main`).toBeTruthy();
      expect(layout.scrollWidth, `${viewport.name} ${path}: page should not overflow horizontally`).toBeLessThanOrEqual(layout.innerWidth + 24);

      if (viewport.width <= 430 && layout.hasMenuToggle) {
        const toggle = page.locator('#menuToggle, .menu-toggle').first();
        await expect(toggle).toBeVisible({ timeout: 10000 });
        await toggle.click({ force: true });
        await expect(page.locator('#navLinks.open, .nav-links.open, #navLinks, .nav-links').first()).toBeVisible({ timeout: 10000 });
      }

      if (/qcm|cas-cliniques|vrai-faux/.test(path)) {
        await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
        const cardBox = await page.locator('#practiceList .single-question-card').first().boundingBox();
        expect(cardBox?.width || 0, `${viewport.name} ${path}: practice card should have width`).toBeGreaterThan(250);
      }
    });
  }
}
