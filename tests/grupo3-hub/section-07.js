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

  test('archives completed activities by subject and counts personal signed copies', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas anteriores' })).toBeVisible();
    await expect(page.locator('#signedAssignmentCount')).toHaveText('0/2 copias firmadas');
    await expect(page.locator('[data-archive-subject]')).toHaveCount(6);

    const bioGroup = page.locator('[data-archive-subject]').filter({ hasText: 'BIOQUÍMICA II' });
    await bioGroup.locator(':scope > summary').click();
    await page.locator('#bio-tarea-glut4 > summary').click();
    await expect(page.locator('#bio-tarea-glut4')).toHaveAttribute('open', '');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#materias')).toBeHidden();
    await expect(page.getByText('Diseña el proceso de funcionamiento dependiente de insulina del GLUT4.')).toBeVisible();
    const bioSignature = page.locator('[data-signed-assignment="bio-glut4"]');
    await bioSignature.check();
    await expect(page.locator('#bio-tarea-glut4 [data-signed-mirror="bio-glut4"]')).toHaveText('Copia firmada');

    await page.goto('/clase.html#bio-tarea-glut4');
    await expect(bioGroup).toHaveAttribute('open', '');
    await expect(page.locator('#bio-tarea-glut4')).toHaveAttribute('open', '');
    await expect(bioSignature).toBeChecked();
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#signedAssignmentCount')).toHaveText('1/2 copias firmadas');

    const epiGroup = page.locator('[data-archive-subject]').filter({ hasText: 'EPIDEMIOLOGÍA Y SALUD PÚBLICA' });
    await epiGroup.locator(':scope > summary').click();
    await page.locator('#epi-tarea-salud > summary').click();
    await expect(page.locator('#epi-tarea-salud')).toHaveAttribute('open', '');
    await expect(page.locator('#epi-tarea-salud .subject-assignment-body li')).toHaveCount(11);
  });

  test('uses pictograms instead of navigation abbreviations', async ({ page }) => {
    await expect(page.locator('.workspace-nav .nav-icon')).toHaveCount(6);
    await expect(page.locator('.workspace-nav .nav-icon svg')).toHaveCount(6);
    await expect(page.locator('.workspace-nav').getByText('INI', { exact: true })).toHaveCount(0);
    await expect(page.locator('.workspace-nav').getByText('Tareas', { exact: true })).toBeVisible();
    await expect(page.locator('.workspace-nav').getByText('Materias', { exact: true })).toBeVisible();
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

    expect(homeLayout.dashboardHeight).toBeLessThan(620);
    expect(homeLayout.nextHeight).toBeLessThanOrEqual(140);
    expect(Math.max(...homeLayout.priorityHeights)).toBeLessThan(70);
    expect(homeLayout.kickerDisplay).toBe('none');
    expect(homeLayout.introDisplay).toBe('none');
    expect(homeLayout.updatedDisplay).toBe('none');
    expect(homeLayout.lastClassDisplay).toBe('none');
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
        courseMetaDisplay: getComputedStyle(document.querySelector('.course-selector b')).display,
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
    expect(courseLayout.courseMetaDisplay).toBe('none');
    expect(courseLayout.courseIntroDisplay).toBe('none');
    expect(courseLayout.detailToggleHeight).toBeLessThanOrEqual(62);
    expect(courseLayout.scrollWidth).toBeLessThanOrEqual(courseLayout.clientWidth + 1);
  });
};
