const { expectBlockedClinicalCases } = require('../helpers/practice-policy');

module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('P1 mobile keeps quick and advanced subject choices mutually exclusive', async ({ page }) => {
    await page.goto('/p1.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    const rail = page.locator('#p1SubjectRail');
    const customize = page.locator('#p1ExamCustomize');

    await expect(rail).toBeVisible();
    await expect(page.locator('#p1ExamSubjects')).toBeHidden();
    await rail.locator('[data-subject-id="nutricion"]').click();
    await expect(page.locator('#p1CustomizeStatus')).toHaveText('Solo Nutrición');
    await expect(page.locator('#p1ExamSubjects input:checked')).toHaveCount(1);

    await customize.locator('summary').click();
    await expect(rail).toBeHidden();
    await expect(page.locator('#p1ExamSubjects')).toBeVisible();
    await customize.locator('summary').click();
    await expect(rail).toBeVisible();
  });

  test('P1 practice stays in a locked full-screen dialog on mobile Safari', async ({ page }) => {
    await page.goto('/p1.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '640px';
      spacer.setAttribute('aria-hidden', 'true');
      document.body.prepend(spacer);
    });
    const start = page.getByRole('button', { name: 'Empezar entrenamiento' });
    await start.scrollIntoViewIfNeeded();
    const pageScrollBefore = await page.evaluate(() => window.scrollY);
    expect(pageScrollBefore).toBeGreaterThan(0);
    await start.click();

    const dialog = page.getByRole('dialog', { name: 'Entrenamiento en curso' });
    const scroller = dialog.locator('#p1PracticeDialogScroll');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(page.locator('body')).toHaveClass(/p1-practice-open/);
    const layout = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const bodyStyle = getComputedStyle(document.body);
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyPosition: bodyStyle.position,
        bodyTop: Number.parseFloat(document.body.style.top),
        horizontalOverflow: node.scrollWidth - node.clientWidth
      };
    });
    expect(layout.top).toBeCloseTo(0, 0);
    expect(layout.left).toBeCloseTo(0, 0);
    expect(layout.width).toBeCloseTo(layout.viewportWidth, 0);
    expect(layout.height).toBeCloseTo(layout.viewportHeight, 0);
    expect(layout.bodyPosition).toBe('fixed');
    expect(layout.bodyTop).toBeCloseTo(-pageScrollBefore, 0);
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);

    const internalScroll = await scroller.evaluate((node) => {
      const session = node.querySelector('#p1ExamSession');
      const previousMinHeight = session.style.minHeight;
      session.style.minHeight = '1200px';
      node.scrollTop = 120;
      const result = {
        overflowY: getComputedStyle(node).overflowY,
        scrollTop: node.scrollTop,
        canScroll: node.scrollHeight > node.clientHeight
      };
      session.style.minHeight = previousMinHeight;
      return result;
    });
    expect(internalScroll.overflowY).toBe('auto');
    expect(internalScroll.canScroll).toBe(true);
    expect(internalScroll.scrollTop).toBeGreaterThan(0);
    expect(await page.evaluate(() => Number.parseFloat(document.body.style.top))).toBeCloseTo(-pageScrollBefore, 0);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(page.locator('body')).not.toHaveClass(/p1-practice-open/);
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);
    await expect(start).toBeFocused();

    const resume = page.getByRole('button', { name: 'Continuar' });
    await resume.click();
    await expect(dialog).toHaveAttribute('open', '');
    await dialog.getByRole('button', { name: 'Cerrar la práctica y continuar después' }).click();
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(resume).toBeFocused();
  });

  test('mobile navigation and practice controls remain usable', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await dismissSemesterPicker(page);
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click({ force: true });
    const study = page.locator('#navLinks [data-s3-study-open], .nav-links [data-s3-study-open]').first();
    await expect(study).toBeVisible({ timeout: 10000 });
    await study.click();
    await expect(page.locator('#s3StudySheet.open')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#s3StudySheet a[href="qcm.html"]')).toBeVisible();
    await page.locator('[data-s3-study-close]').click({ force: true });
    const bottomNav = page.locator('#s3BottomNav');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('a,button')).toHaveCount(5);

    await openPractice(page, '/qcm.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 8000 });
    const qcmNext = page.locator('#practiceList .single-question-card [data-action="next-question"]').first();
    await expect(qcmNext).toBeVisible({ timeout: 5000 });
    await qcmNext.click({ force: true });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 8000 });

    await page.goto('/cas-cliniques.html?course=fisiologia', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expectBlockedClinicalCases(page, expect);
  });
};
