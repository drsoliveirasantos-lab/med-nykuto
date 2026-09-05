module.exports = ({ test, expect }) => {
  test('S4 iPhone chrome stays visually miniature while touch targets remain usable', async ({ page }) => {
    const widths = [320, 375, 390, 430];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/clase.html#bioquimica-2026-08-28', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/, { timeout: 20000 });
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

      const subjectModes = page.locator('#bioquimica .notebook-modes');
      const themesButton = subjectModes.locator('[data-notebook-mode="temas"]');
      await themesButton.click();
      await expect(themesButton).toHaveAttribute('aria-selected', 'true');
      const cards = page.locator('#bioquimica [data-course-theme-card]');
      await expect(cards).toHaveCount(3);
      await expect(cards.first()).toBeVisible();
      await cards.first().evaluate((card) => card.scrollIntoView({ block: 'center', inline: 'nearest' }));
      await expect(cards.first()).toBeInViewport();
      const themeMetrics = await page.locator('#bioquimica').evaluate((subject) => {
        const themeCards = Array.from(subject.querySelectorAll('[data-course-theme-card]'));
        const themeButton = subject.querySelector('[data-notebook-mode="temas"]');
        const open = themeCards[0] && themeCards[0].querySelector('[data-course-theme-open]');
        const openRect = open && open.getBoundingClientRect();
        const hit = openRect && document.elementFromPoint(openRect.left + openRect.width / 2, openRect.top + openRect.height / 2);
        return {
          columns: new Set(themeCards.map((card) => Math.round(card.getBoundingClientRect().left))).size,
          maxHeight: Math.max(...themeCards.map((card) => card.getBoundingClientRect().height)),
          openHeight: openRect ? openRect.height : 0,
          hitOpen: Boolean(open && hit && (hit === open || open.contains(hit))),
          modeHit: themeButton ? themeButton.getBoundingClientRect().height : 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(themeMetrics.columns, `${width}px themes must use one compact column`).toBe(1);
      expect(themeMetrics.maxHeight, `${width}px theme cards must stay compact`).toBeLessThanOrEqual(180);
      expect(themeMetrics.openHeight, `${width}px theme CTA needs a 44px target`).toBeGreaterThanOrEqual(43.9);
      expect(themeMetrics.modeHit, `${width}px Temas needs a 44px target`).toBeGreaterThanOrEqual(43.9);
      expect(themeMetrics.hitOpen, `${width}px theme CTA must not be intercepted`).toBe(true);
      expect(themeMetrics.overflow, `${width}px themes must not overflow`).toBeLessThanOrEqual(1);
      await subjectModes.locator('[data-notebook-mode="cuaderno"]').click();
      await expect(page.locator('#bioquimica-2026-08-28')).toBeVisible();
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica-2026-08-28', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/s4-learning-experience-v178-ready/, { timeout: 20000 });
    await expect(page.locator('#bioquimica-2026-08-28')).toBeVisible({ timeout: 20000 });

    const tabs = page.locator('#bioquimica-2026-08-28 [data-lesson-tabs]');
    await tabs.locator('[data-lesson-tab="rapida"]').click();
    await expect(tabs.locator('[data-lesson-tab="rapida"]')).toHaveAttribute('aria-selected', 'true');
    await tabs.locator('[data-lesson-tab="curso"]').click();
    await expect(tabs.locator('[data-lesson-tab="curso"]')).toHaveAttribute('aria-selected', 'true');
  });
};
