module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('loads a useful photographic visual in courses that still use photography', async ({ page }) => {
    const courseVisuals = [
      ['fisio-detail', '#fisio-detail .course-photo-feature--physiology img'],
      ['epi-detail', '.course-photo-feature--epidemiology img'],
      ['micro-theory-detail', '.course-photo-feature--microbiology img'],
      ['micro-detail', '.course-photo-feature--laboratory img']
    ];

    for (const [hash, selector] of courseVisuals) {
      await page.goto(`/clase.html#${hash}`);
      const image = page.locator(selector);
      await expect(image).toBeVisible();
      await expect(image).not.toHaveAttribute('alt', '');
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    }
  });

  test('keeps completed activities in a visible archive outside the three active tasks', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(3);
    await expect(page.locator('.assignment-archive')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tareas anteriores' })).toBeVisible();
  });

  test('uses pictograms instead of navigation abbreviations', async ({ page }) => {
    await expect(page.locator('.workspace-nav .nav-icon')).toHaveCount(6);
    await expect(page.locator('.workspace-nav .nav-icon svg')).toHaveCount(6);
    await expect(page.locator('.workspace-nav').getByText('INI', { exact: true })).toHaveCount(0);
    await expect(page.locator('.workspace-nav').getByText('Tareas', { exact: true })).toBeVisible();
    await expect(page.locator('.workspace-nav').getByText('Avisos', { exact: true })).toBeVisible();
    await expect(page.locator('.workspace-nav').getByText('Materias', { exact: true })).toBeVisible();
    await expect(page.locator('.workspace-nav').getByText('P1', { exact: true })).toBeVisible();
    await page.goto('/clase.html#materias');
    await expect(page.locator('.course-selector .course-icon svg')).toHaveCount(6);
    for (const code of ['NUT', 'FIS', 'BIO', 'EPI', 'MIC', 'LAB']) {
      await expect(page.locator('.course-selector').getByText(code, { exact: true })).toHaveCount(0);
    }
    await expect(page.locator('.resource-grid .resource-icon svg')).toHaveCount(28);
    await expect(page.locator('.resource-grid .resource-code')).toHaveCount(0);
  });

  test('keeps the mobile home and course choices compact', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#inicio');

    const homeLayout = await page.evaluate(() => {
      const priorities = [...document.querySelectorAll('.priority-card')].map((card) => card.getBoundingClientRect().height);
      return {
        dashboardHeight: document.querySelector('#inicio').getBoundingClientRect().height,
        transcriptHeight: document.querySelector('.home-transcripts').getBoundingClientRect().height,
        transcriptColumns: getComputedStyle(document.querySelector('.home-transcript-grid')).gridTemplateColumns.split(' ').length,
        transcriptCardHeights: [...document.querySelectorAll('.home-transcript-card')].map((card) => card.getBoundingClientRect().height),
        transcriptCardWidths: [...document.querySelectorAll('.home-transcript-card')].map((card) => card.getBoundingClientRect().width),
        transcriptTitleFont: parseFloat(getComputedStyle(document.querySelector('.home-transcript-copy strong')).fontSize),
        transcriptLabelFont: parseFloat(getComputedStyle(document.querySelector('.home-transcript-copy small')).fontSize),
        transcriptActionFont: parseFloat(getComputedStyle(document.querySelector('.home-transcript-action')).fontSize),
        noticeHeight: document.querySelector('#classHomeNoticeSection').getBoundingClientRect().height,
        nextHeight: document.querySelector('.dashboard-next').getBoundingClientRect().height,
        priorityHeights: priorities,
        kickerDisplay: getComputedStyle(document.querySelector('.dashboard-heading .section-kicker')).display,
        introDisplay: getComputedStyle(document.querySelector('.dashboard-intro')).display,
        updatedDisplay: getComputedStyle(document.querySelector('.dashboard-updated')).display,
        lastClassDisplay: getComputedStyle(document.querySelector('.dashboard-status > div:nth-child(2)')).display,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(homeLayout.dashboardHeight).toBeLessThan(900);
    expect(homeLayout.transcriptHeight).toBeLessThanOrEqual(58);
    expect(homeLayout.transcriptColumns).toBe(2);
    expect(Math.max(...homeLayout.transcriptCardHeights)).toBeLessThanOrEqual(55);
    expect(Math.min(...homeLayout.transcriptCardWidths)).toBeGreaterThan(150);
    expect(homeLayout.transcriptTitleFont).toBeGreaterThanOrEqual(10.5);
    expect(homeLayout.transcriptLabelFont).toBeGreaterThanOrEqual(8);
    expect(homeLayout.noticeHeight).toBeLessThan(200);
    expect(homeLayout.nextHeight).toBeLessThanOrEqual(140);
    expect(Math.max(...homeLayout.priorityHeights)).toBeLessThan(110);
    expect(homeLayout.kickerDisplay).toBe('none');
    expect(homeLayout.introDisplay).toBe('none');
    expect(homeLayout.updatedDisplay).toBe('inline-flex');
    expect(homeLayout.lastClassDisplay).toBe('grid');
    expect(homeLayout.scrollWidth).toBeLessThanOrEqual(homeLayout.clientWidth + 1);

    await page.goto('/clase.html#materias');
    const courseLayout = await page.evaluate(() => {
      const courses = [...document.querySelectorAll('.course-selector a')].map((card) => card.getBoundingClientRect());
      const resources = [...document.querySelectorAll('#nutricion .resource-card')].map((card) => card.getBoundingClientRect());
      return {
        courseHeights: courses.map((card) => card.height),
        coursesShareFirstRow: Math.abs(courses[0].top - courses[1].top) < 1,
        thirdCourseStartsNextRow: courses[2].top > courses[0].top,
        resourceHeights: resources.map((card) => card.height),
        resourcesShareFirstRow: Math.abs(resources[0].top - resources[1].top) < 1,
        courseMetaDisplay: getComputedStyle(document.querySelector('.course-latest-chip')).display,
        courseMetaFont: parseFloat(getComputedStyle(document.querySelector('.course-latest-chip')).fontSize),
        courseIntroDisplay: getComputedStyle(document.querySelector('#materias .section-heading > p')).display,
        detailToggleHeight: document.querySelector('#nutricion .course-detail-toggle').getBoundingClientRect().height,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(Math.max(...courseLayout.courseHeights)).toBeLessThanOrEqual(74);
    expect(courseLayout.coursesShareFirstRow).toBe(true);
    expect(courseLayout.thirdCourseStartsNextRow).toBe(true);
    expect(Math.max(...courseLayout.resourceHeights)).toBeLessThanOrEqual(70);
    expect(courseLayout.resourcesShareFirstRow).toBe(true);
    expect(courseLayout.courseMetaDisplay).toBe('flex');
    expect(courseLayout.courseMetaFont).toBeGreaterThanOrEqual(8.5);
    await expect(page.locator('[data-course-target="nutricion"] .course-latest-chip')).toContainText('ÚLTIMA · 27 AGO');
    await expect(page.locator('[data-course-target="fisiologia"] .course-latest-chip')).toContainText('ÚLTIMA · 27 AGO');
    await expect(page.locator('[data-course-target="microbiologia-practica"] .course-latest-chip')).toContainText('PRÁCTICA · 27 AGO');
    await expect(page.locator('[data-course-target="microbiologia-teorica"] .course-latest-chip')).toContainText('TEÓRICA · 24 AGO');
    expect(courseLayout.courseIntroDisplay).toBe('none');
    expect(courseLayout.detailToggleHeight).toBeLessThanOrEqual(62);
    expect(courseLayout.scrollWidth).toBeLessThanOrEqual(courseLayout.clientWidth + 1);
  });
};
