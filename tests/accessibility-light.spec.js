const { test, expect } = require('@playwright/test');

const pages = [
  '/index.html',
  '/matieres.html',
  '/modules.html',
  '/qcm.html?course=fisiologia',
  '/cas-cliniques.html?course=fisiologia',
  '/vrai-faux.html?course=fisiologia',
  '/erreurs.html',
  '/contact.html',
  '/mentions.html'
];

async function visibleA11yIssues(page) {
  return page.evaluate(() => {
    const isVisible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const nameOf = (el) => {
      const imgAlt = Array.from(el.querySelectorAll?.('img[alt]') || []).map((img) => img.getAttribute('alt')).join(' ');
      return [
        el.getAttribute('aria-label'),
        el.getAttribute('title'),
        el.getAttribute('alt'),
        el.value,
        el.textContent,
        imgAlt
      ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    };
    const describe = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className ? `.${String(el.className).trim().replace(/\s+/g, '.')}` : ''}`;

    const issues = [];
    const controls = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]'));
    for (const el of controls) {
      if (!isVisible(el)) continue;
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'hidden') continue;
      if (!nameOf(el)) issues.push(`Visible interactive control has no accessible name: ${describe(el)}`);
    }

    const visibleInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select')).filter(isVisible);
    for (const el of visibleInputs) {
      const id = el.getAttribute('id');
      const hasLabel = Boolean(
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        el.closest('label')
      );
      if (!hasLabel) issues.push(`Visible form field has no label: ${describe(el)}`);
    }

    const h1Count = Array.from(document.querySelectorAll('h1')).filter(isVisible).length;
    if (h1Count === 0) issues.push('Page has no visible h1');

    return issues;
  });
}

for (const path of pages) {
  test(`${path}: visible controls keep basic accessibility`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    const issues = await visibleA11yIssues(page);
    expect(issues).toEqual([]);
  });
}
