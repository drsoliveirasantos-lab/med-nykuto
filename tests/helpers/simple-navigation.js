// Exercise the same public menu/reader actions that students use after the S4 redesign.
async function clickStudyControl(page, target) {
  if (await target.isVisible()) return target.click();
  const mode = await target.getAttribute('data-lesson-tab') || await target.getAttribute('data-theme-tab');
  if (mode === 'training' && await page.locator('[data-s4-train]').isVisible()) return page.locator('[data-s4-train]').click();
  if (['curso', 'course'].includes(mode)) {
    const back = page.locator('[data-s4-return-course]');
    if (await back.isVisible()) return back.click();
    if (await page.locator('[data-s4-index-toggle]').isVisible()) return;
  }
  const attributes = ['data-lesson-tab', 'data-theme-tab', 'data-notebook-mode', 'data-view-link', 'data-lesson-id'];
  let selector;
  for (const attribute of attributes) {
    const value = await target.getAttribute(attribute);
    if (value) { selector = '[data-s4-target-' + attribute.slice(5) + '="' + value + '"]'; break; }
  }
  if (!selector && await target.getAttribute('data-public-theme-toggle') !== null) selector = '[data-s4-target-theme-toggle]';
  if (!selector) {
    const id = await target.getAttribute('id');
    if (id) selector = '[data-s4-target-id="' + id + '"]';
  }
  if (!selector) return target.click();
  await page.locator('[data-s4-menu-toggle]').click();
  if (selector.includes('target-lesson-id')) await page.locator('#s4SiteMenu details > summary').click();
  await page.locator('#s4SiteMenu').locator(selector).click();
}
module.exports = { clickStudyControl };
