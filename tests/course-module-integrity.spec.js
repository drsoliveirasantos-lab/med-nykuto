const { test, expect } = require('@playwright/test');

test('course catalog exposes active courses, rich modules and unique module IDs', async ({ page }) => {
  await page.goto('/modules.html', { waitUntil: 'domcontentloaded' });
  const data = await page.evaluate(() => {
    const courses = window.MED_COURSES_DATA?.courses || [];
    const modules = courses.flatMap((course) => (course.modules || []).map((module) => ({
      courseId: course.id,
      courseTitle: course.title,
      id: module.id,
      title: module.title || module.shortTitle,
      markdownLength: String(module.markdown || module.fullMarkdown || '').length
    })));
    return { courses, modules };
  });

  expect(data.courses.length).toBeGreaterThanOrEqual(6);
  expect(data.modules.length).toBeGreaterThanOrEqual(58);
  const ids = data.modules.map((module) => module.id).filter(Boolean);
  expect(new Set(ids).size, 'module IDs must be unique').toBe(ids.length);
  expect(data.modules.filter((module) => module.title && module.markdownLength > 1000).length).toBeGreaterThanOrEqual(50);
});

test('modules page search and course filters keep visible results usable', async ({ page }) => {
  await page.goto('/modules.html', { waitUntil: 'domcontentloaded' });
  const moduleSurface = page.locator('#moduleGrid').first();
  await expect(moduleSurface).toBeVisible({ timeout: 15000 });

  const cards = page.locator('#moduleGrid a, .module-card, .course-module-card');
  expect(await cards.count(), 'module grid must expose cards or links').toBeGreaterThan(0);

  const search = page.locator('#searchInput');
  if (await search.count()) {
    await search.fill('cardio');
    await page.waitForTimeout(300);
    await expect(moduleSurface).toBeVisible();
    await search.fill('');
  }

  const filters = page.locator('#courseFilters button, #courseFilters a, .chips button, .chips a');
  if (await filters.count()) {
    await filters.first().click({ force: true });
    await page.waitForTimeout(300);
    await expect(moduleSurface).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/undefined|null|Cannot read/i, { timeout: 1000 });
  }
});
