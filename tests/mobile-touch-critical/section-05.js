module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('mobile navigation and practice controls remain usable', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await dismissSemesterPicker(page);
    const toggle = page.locator('#menuToggle, .menu-toggle').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click({ force: true });
    const study = page.locator('#navLinks [data-s3-study-open], .nav-links [data-s3-study-open]').first();
    await expect(study).toBeVisible({ timeout: 10000 });
    await study.click({ force: true });
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

    await openPractice(page, '/cas-cliniques.html?course=fisiologia');
    await answerFirstVisibleOption(page);
    const casePanel = page.locator('#practiceList .single-question-card .answer-panel:not([hidden])').first();
    await expect(casePanel).toBeVisible({ timeout: 8000 });
    const summary = casePanel.locator('details summary').first();
    if (await summary.isVisible().catch(() => false)) {
      await summary.click({ force: true });
      await expect(page.locator('#practiceList .single-question-card')).toBeVisible({ timeout: 5000 });
    }
  });
};
