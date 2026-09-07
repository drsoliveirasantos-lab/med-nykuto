module.exports = ({ test, expect }) => {
  test('S4 reader and navigation stay compact with usable touch targets', async ({ page }) => {
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/clase.html#bioquimica-2026-08-28', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-s4-index-toggle]')).toBeVisible();
      await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
      await expect(page.locator('.workspace-nav')).toBeHidden();
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        header: document.querySelector('.class-header').getBoundingClientRect().height,
        controls: Array.from(document.querySelectorAll('[data-s4-menu-toggle], .s4-reading-actions button')).filter(n => !n.hidden).map(n => { const r=n.getBoundingClientRect(); return {width:r.width,height:r.height,left:r.left,right:r.right}; })
      }));
      expect(metrics.overflow).toBeLessThanOrEqual(1);
      expect(metrics.header).toBeLessThanOrEqual(64);
      expect(metrics.controls).toHaveLength(3);
      for (const box of metrics.controls) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
      }
      await page.locator('[data-s4-menu-toggle]').click();
      await expect(page.locator('#s4SiteMenu')).toBeVisible();
      await page.locator('[data-s4-target-notebook-mode="temas"]').click();
      const cards=page.locator('#bioquimica [data-course-theme-card]');
      await expect(cards).toHaveCount(3);
      await expect(cards.first()).toBeVisible();
      await cards.first().locator('[data-course-theme-open]').click();
      await expect(page.locator('[data-s4-train]')).toBeVisible();
      await page.locator('[data-s4-index-toggle]').click();
      await expect(page.locator('#s4CourseIndex')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-s4-index-toggle]')).toBeFocused();
    }
  });
};
