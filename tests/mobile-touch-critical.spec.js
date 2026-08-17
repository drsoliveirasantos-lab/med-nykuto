const { test, expect } = require('@playwright/test');

async function openPractice(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });
}

async function answerFirstVisibleOption(page) {
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
}

async function dismissSemesterPicker(page) {
  const modal = page.locator('#homeSemesterModal.open');
  const opened = await modal.waitFor({ state: 'visible', timeout: 1500 }).then(() => true).catch(() => false);
  if (!opened) return;
  await modal.locator('[data-semester-select="s3"]').click();
  await expect(modal).toBeHidden({ timeout: 5000 });
}

test.describe('Mobile critical paths', () => {
  require('./mobile-touch-critical/section-01.js')({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker });
  require('./mobile-touch-critical/section-02.js')({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker });
  require('./mobile-touch-critical/section-03.js')({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker });
  require('./mobile-touch-critical/section-04.js')({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker });
  require('./mobile-touch-critical/section-05.js')({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker });
});
