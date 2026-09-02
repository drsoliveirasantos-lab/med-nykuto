module.exports = ({ test, expect }) => {
  test('S4 iPhone chrome stays visually miniature while touch targets remain usable', async ({ page }) => {
    const widths = [320, 375, 390, 430];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/clase.html#bioquimica-2026-08-28', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toHaveAttribute('data-class-id', 's4e-g3', { timeout: 20000 });
      await expect(page.locator('#bioquimica-2026-08-28')).toBeVisible({ timeout: 20000 });

      const metrics = await page.evaluate(() => {
        const visible = (node) => {
          if (!node) return false;
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
        };
        const rect = (node) => {
          const value = node.getBoundingClientRect();
          return { width: value.width, height: value.height };
        };
        const minMetric = (nodes, key) => Math.min(...nodes.filter(visible).map((node) => rect(node)[key]));
        const maxMetric = (nodes, key) => Math.max(...nodes.filter(visible).map((node) => rect(node)[key]));

        const header = document.querySelector('.class-header');
        const bottom = document.querySelector('.mobile-bottom-nav');
        const workspace = document.querySelector('.workspace-nav');
        const lesson = document.getElementById('bioquimica-2026-08-28');
        const lessonTabs = lesson && lesson.querySelector('[data-lesson-tabs]');
        const lessonButtons = lessonTabs ? Array.from(lessonTabs.querySelectorAll('[data-lesson-tab]')) : [];
        const subject = document.getElementById('bioquimica');
        const modeButtons = subject ? Array.from(subject.querySelectorAll('.notebook-modes button')) : [];
        const headerTargets = Array.from(document.querySelectorAll('.class-brand, .class-header-action, .class-language-switcher select'));
        const bottomIcons = Array.from(document.querySelectorAll('.mobile-bottom-nav .nav-icon svg'));
        const pseudoVisuals = modeButtons.filter(visible).map((node) => {
          const style = getComputedStyle(node, '::after');
          return Math.max(Number.parseFloat(style.width) || 0, Number.parseFloat(style.height) || 0);
        });

        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          headerHeight: rect(header).height,
          bottomHeight: rect(bottom).height,
          lessonTabsHeight: rect(lessonTabs).height,
          workspaceDisplay: getComputedStyle(workspace).display,
          headerTargetMin: minMetric(headerTargets, 'height'),
          lessonTargetMin: minMetric(lessonButtons, 'height'),
          modeTargetMin: minMetric(modeButtons, 'height'),
          bottomTargetMin: minMetric(Array.from(bottom.querySelectorAll('a')), 'height'),
          bottomIconMax: maxMetric(bottomIcons, 'width'),
          modeVisualMax: Math.max(...pseudoVisuals)
        };
      });

      expect(metrics.documentWidth - metrics.viewportWidth, `${width}px must not overflow horizontally`).toBeLessThanOrEqual(1);
      expect(metrics.headerHeight, `${width}px header must stay app-compact`).toBeLessThanOrEqual(56);
      expect(metrics.bottomHeight, `${width}px bottom nav must stay compact`).toBeLessThanOrEqual(64);
      expect(metrics.lessonTabsHeight, `${width}px lesson switcher must remain one compact row`).toBeLessThanOrEqual(52);
      expect(metrics.workspaceDisplay, `${width}px must expose only one phone navigation`).toBe('none');
      expect(metrics.headerTargetMin, `${width}px header controls need a comfortable hit area`).toBeGreaterThanOrEqual(40);
      expect(metrics.lessonTargetMin, `${width}px lesson tabs need a comfortable hit area`).toBeGreaterThanOrEqual(40);
      expect(metrics.modeTargetMin, `${width}px subject utilities need a comfortable hit area`).toBeGreaterThanOrEqual(40);
      expect(metrics.bottomTargetMin, `${width}px bottom navigation needs a comfortable hit area`).toBeGreaterThanOrEqual(50);
      expect(metrics.bottomIconMax, `${width}px bottom glyphs must stay visually miniature`).toBeLessThanOrEqual(20);
      expect(metrics.modeVisualMax, `${width}px utility glyphs must stay visually miniature`).toBeLessThanOrEqual(20);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica-2026-08-28', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#bioquimica-2026-08-28')).toBeVisible({ timeout: 20000 });

    const subjectModes = page.locator('#bioquimica .notebook-modes');
    await subjectModes.locator('[data-notebook-mode="temas"]').click();
    await expect(subjectModes.locator('[data-notebook-mode="temas"]')).toHaveAttribute('aria-selected', 'true');
    await subjectModes.locator('[data-notebook-mode="cuaderno"]').click();
    await expect(page.locator('#bioquimica-2026-08-28')).toBeVisible();

    const tabs = page.locator('#bioquimica-2026-08-28 [data-lesson-tabs]');
    await tabs.locator('[data-lesson-tab="rapida"]').click();
    await expect(tabs.locator('[data-lesson-tab="rapida"]')).toHaveAttribute('aria-selected', 'true');
    await tabs.locator('[data-lesson-tab="curso"]').click();
    await expect(tabs.locator('[data-lesson-tab="curso"]')).toHaveAttribute('aria-selected', 'true');
  });
};
