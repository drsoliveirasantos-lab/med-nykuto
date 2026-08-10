const { test, expect } = require('@playwright/test');

const pages = ['/index.html', '/matieres.html', '/modules.html', '/qcm.html?course=fisiologia', '/cas-cliniques.html?course=fisiologia', '/vrai-faux.html?course=fisiologia', '/contact.html'];

function visibleElementInfo() {
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  };
  const nameOf = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('alt') || el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
  const controls = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]'))
    .filter(visible)
    .map((el) => ({ tag: el.tagName, type: el.getAttribute('type') || '', id: el.id || '', name: nameOf(el), html: el.outerHTML.slice(0, 160) }));
  const images = Array.from(document.querySelectorAll('img')).filter(visible).map((img) => ({ src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' }));
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(visible).map((h) => ({ level: Number(h.tagName.slice(1)), text: h.textContent.trim() }));
  return { controls, images, headings };
}

for (const pagePath of pages) {
  test(`${pagePath}: advanced accessibility heuristics`, async ({ page }) => {
    await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    const info = await page.evaluate(visibleElementInfo);

    const unnamedControls = info.controls.filter((control) => !control.name && control.type !== 'hidden');
    expect(unnamedControls, `${pagePath}: visible controls must have accessible names`).toEqual([]);

    const missingAlt = info.images.filter((image) => !image.alt.trim());
    expect(missingAlt, `${pagePath}: visible images must have alt text`).toEqual([]);

    expect(info.headings.length, `${pagePath}: should expose visible headings`).toBeGreaterThan(0);
    const emptyHeadings = info.headings.filter((heading) => !heading.text);
    expect(emptyHeadings, `${pagePath}: visible headings must not be empty`).toEqual([]);
  });
}
