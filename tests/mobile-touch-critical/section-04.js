module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('complete lessons stay compact across every subject on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const lessons = [
      'nutricion-2026-08-27',
      'fisiologia-2026-08-27',
      'bioquimica-2026-08-28',
      'epidemiologia-2026-08-28',
      'microbiologia-teorica-2026-08-24',
      'microbiologia-practica-2026-08-27'
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

  test('28 August diagrams and the practical brief stay usable at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const lessonId of ['bioquimica-2026-08-28', 'epidemiologia-2026-08-28']) {
      await page.goto(`/clase.html#${lessonId}`, { waitUntil: 'domcontentloaded' });
      const lesson = page.locator(`#${lessonId}`);
      await expect(lesson).toBeVisible({ timeout: 10000 });
      const figure = lesson.locator('[data-lesson-tab-panel="curso"] .course-inline-figure.is-wide').first();
      await expect(figure).toBeVisible();
      const figureLayout = await figure.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const panel = node.closest('[data-lesson-tab-panel="curso"]').getBoundingClientRect();
        const trigger = node.querySelector('.course-inline-diagram-trigger').getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          width: box.width,
          panelWidth: panel.width,
          triggerWidth: trigger.width,
          triggerHeight: trigger.height,
          viewportWidth: innerWidth,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(figureLayout.left).toBeGreaterThanOrEqual(0);
      expect(figureLayout.right).toBeLessThanOrEqual(figureLayout.viewportWidth + 1);
      expect(figureLayout.width).toBeGreaterThanOrEqual(figureLayout.panelWidth * 0.8);
      expect(figureLayout.triggerWidth).toBeGreaterThanOrEqual(44);
      expect(figureLayout.triggerHeight).toBeGreaterThanOrEqual(44);
      expect(figureLayout.overflow).toBeLessThanOrEqual(1);

      await figure.locator('.course-inline-diagram-trigger').click();
      const dialog = page.locator('#courseDiagramDialog');
      await expect(dialog).toBeVisible();
      const dialogLayout = await dialog.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const controls = Array.from(node.querySelectorAll('.course-diagram-dialog-actions button:not([hidden])')).map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          controls,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(dialogLayout.left).toBeGreaterThanOrEqual(-1);
      expect(dialogLayout.right).toBeLessThanOrEqual(dialogLayout.viewportWidth + 1);
      expect(dialogLayout.top).toBeGreaterThanOrEqual(-1);
      expect(dialogLayout.bottom).toBeLessThanOrEqual(dialogLayout.viewportHeight + 1);
      expect(dialogLayout.controls).toHaveLength(2);
      expect(dialogLayout.controls.every((control) => control.width >= 44 && control.height >= 44)).toBe(true);
      expect(dialogLayout.overflow).toBeLessThanOrEqual(1);

      await dialog.locator('.course-diagram-zoom').click();
      const zoomLayout = await dialog.evaluate((node) => {
        const stage = node.querySelector('.course-diagram-dialog-stage');
        return {
          zoomed: node.classList.contains('is-zoomed'),
          stageScrollsInternally: stage.scrollWidth > stage.clientWidth,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(zoomLayout.zoomed).toBe(true);
      expect(zoomLayout.stageScrollsInternally).toBe(true);
      expect(zoomLayout.overflow).toBeLessThanOrEqual(1);
      await dialog.locator('.course-diagram-close').click();
      await expect(dialog).toBeHidden();
    }

    await page.goto('/clase.html#task-class-practical-exams-2026-p1', { waitUntil: 'domcontentloaded' });
    const task = page.locator('#task-class-practical-exams-2026-p1');
    await expect(page.locator('#pendientes')).toBeVisible({ timeout: 10000 });
    await expect(task).toHaveAttribute('open', '');
    const taskLayout = await task.evaluate((card) => {
      const summary = card.querySelector('summary').getBoundingClientRect();
      const cta = card.querySelector('.live-task-download').getBoundingClientRect();
      return {
        summaryWidth: summary.width,
        summaryHeight: summary.height,
        ctaWidth: cta.width,
        ctaHeight: cta.height,
        viewportWidth: innerWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(taskLayout.summaryWidth).toBeGreaterThanOrEqual(44);
    expect(taskLayout.summaryHeight).toBeGreaterThanOrEqual(44);
    expect(taskLayout.ctaWidth).toBeGreaterThanOrEqual(44);
    expect(taskLayout.ctaHeight).toBeGreaterThanOrEqual(44);
    expect(taskLayout.ctaWidth).toBeLessThanOrEqual(taskLayout.viewportWidth);
    expect(taskLayout.overflow).toBeLessThanOrEqual(1);

    await page.evaluate(() => {
      localStorage.setItem('medLang', 'br');
      localStorage.setItem('med-nykuto-theme-v1', 'light');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(task).toHaveAttribute('open', '');
    await expect(task).toContainText('Semana de provas práticas');
    await expect(task).toContainText('Sem celular nem tablet');
    await expect(task.getByRole('link', { name: /Ver grupos e trabalhos de Bioquímica/ })).toBeVisible();
    await expect(task.locator('[data-task-toggle-label]')).toHaveText('Fechar');
    const lightCta = await task.locator('.live-task-download').evaluate((node) => {
      const parseRgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (value) => parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
      }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const style = getComputedStyle(node);
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      return {
        contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(lightCta.contrast).toBeGreaterThanOrEqual(4.5);
    expect(lightCta.overflow).toBeLessThanOrEqual(1);
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
