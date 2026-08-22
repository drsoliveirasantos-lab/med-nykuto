module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('complete lessons stay compact across every subject on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const lessons = [
      'nutricion-2026-08-13',
      'fisiologia-2026-08-20',
      'bioquimica-2026-08-21',
      'epidemiologia-2026-08-19',
      'microbiologia-teorica-2026-08-17',
      'microbiologia-practica-2026-08-20'
    ];

    for (const lessonId of lessons) {
      await page.goto(`/clase.html#${lessonId}`, { waitUntil: 'domcontentloaded' });
      const lesson = page.locator(`#${lessonId}`);
      await expect(lesson).toBeVisible({ timeout: 10000 });
      const layout = await lesson.evaluate((panel) => {
        const sections = Array.from(panel.querySelectorAll('[data-lesson-tab-panel="curso"] .course-chapter-section'));
        const paragraphs = Array.from(panel.querySelectorAll('[data-lesson-tab-panel="curso"] .course-chapter-section p:not(.course-chapter-step)'));
        return {
          sectionCount: sections.length,
          cardCount: panel.querySelectorAll('[data-lesson-tab-panel="curso"] .concept-card-2026').length,
          minParagraphSize: Math.min(...paragraphs.map((paragraph) => parseFloat(getComputedStyle(paragraph).fontSize))),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });

      expect(layout.sectionCount).toBeGreaterThanOrEqual(6);
      expect(layout.cardCount).toBe(0);
      expect(layout.minParagraphSize).toBeGreaterThanOrEqual(12);
      expect(layout.overflow).toBeLessThanOrEqual(1);
    }
  });

  test('glycolysis board archive stays inside an iPhone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica-2026-08-14', { waitUntil: 'domcontentloaded' });
    await page.locator('#bioquimica-2026-08-14 [data-lesson-tab="material"]').click();
    const launch = page.locator('#bioquimica-2026-08-14 .board-archive-launch');
    await expect(launch).toBeVisible();
    await launch.getByRole('button', { name: /Ver las 7 láminas/ }).click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    const layout = await dialog.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const close = node.querySelector('[data-board-archive-close]').getBoundingClientRect();
      const image = node.querySelector('#boardArchiveImage').getBoundingClientRect();
      const frame = node.querySelector('.board-archive-image-frame').getBoundingClientRect();
      const thumbnails = node.querySelector('.board-archive-thumbnails');
      return {
        left:box.left,
        right:box.right,
        top:box.top,
        bottom:box.bottom,
        viewportWidth:innerWidth,
        viewportHeight:innerHeight,
        closeWidth:close.width,
        closeHeight:close.height,
        imageWidth:image.width,
        frameWidth:frame.width,
        thumbnailCount:thumbnails.querySelectorAll('[data-board-archive-slide]').length,
        documentOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight);
    expect(layout.closeWidth).toBeGreaterThanOrEqual(44);
    expect(layout.closeHeight).toBeGreaterThanOrEqual(44);
    expect(layout.imageWidth).toBeLessThanOrEqual(layout.frameWidth);
    expect(layout.thumbnailCount).toBe(7);
    expect(layout.documentOverflow).toBeLessThanOrEqual(1);

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');
  });
};
