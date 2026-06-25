const { test, expect } = require('@playwright/test');

const QUESTION_SELECTOR = '.option, .answer-option, [data-answer], button[data-option]';
const CORRECTION_SELECTOR = '.answer-panel, .detailed-correction, .correction-card, .premium-correction, .ppc-panel, .pc-card, [data-correction]';

async function answerOneQuestion(page, url) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363', null, { timeout: 20000 });
  await expect(page.locator(QUESTION_SELECTOR).first()).toBeVisible();
  await page.locator(QUESTION_SELECTOR).first().click();
  await expect(page.locator(CORRECTION_SELECTOR).first()).toBeVisible();
  expect(errors).toEqual([]);
}

async function expectPracticeHealth(page) {
  const health = await page.evaluate(() => ({
    ok: window.MED_NYKUTO_HEALTH?.ok,
    bankRequired: window.MED_NYKUTO_HEALTH?.bankRequired,
    qcmCount: window.MED_NYKUTO_HEALTH?.qcmCount || 0,
    vfCount: window.MED_NYKUTO_HEALTH?.vfCount || 0,
    caseCount: window.MED_NYKUTO_HEALTH?.caseCount || 0,
    bodyHealth: document.body?.dataset?.medHealth || ''
  }));
  expect(health.ok).toBeTruthy();
  expect(health.bankRequired).toBeTruthy();
  expect(health.bodyHealth).toBe('ok');
}

async function counts(page, courseId) {
  return page.evaluate((id) => {
    const b = window.MED_PRACTICE_BANK?.byCourse?.[id] || {};
    return {
      qcm: (b.qcm || []).length,
      vf: (b.vf || []).length,
      cases: (b.cases || []).length,
      title: b.title || ''
    };
  }, courseId);
}

test.describe('Med Nykuto practice flows', () => {
  test('QCM renders restored Fisiología bank and correction', async ({ page }) => {
    await answerOneQuestion(page, '/qcm.html?course=fisiologia');
    await expectPracticeHealth(page);
    const bank = await counts(page, 'fisiologia');
    expect(bank.qcm).toBeGreaterThanOrEqual(1800);
    expect(bank.vf).toBeGreaterThanOrEqual(450);
    expect(bank.cases).toBeGreaterThanOrEqual(450);
  });

  test('clinical cases render restored Fisiología cases and correction', async ({ page }) => {
    await answerOneQuestion(page, '/cas-cliniques.html?course=fisiologia');
    await expectPracticeHealth(page);
    const bank = await counts(page, 'fisiologia');
    expect(bank.cases).toBeGreaterThanOrEqual(450);
  });

  test('true false renders restored Fisiología V/F and correction', async ({ page }) => {
    await answerOneQuestion(page, '/vrai-faux.html?course=fisiologia');
    await expectPracticeHealth(page);
    const bank = await counts(page, 'fisiologia');
    expect(bank.vf).toBeGreaterThanOrEqual(450);
  });

  test('Bioquímica V/F is completed by fallback without losing restored QCM and cases', async ({ page }) => {
    await answerOneQuestion(page, '/vrai-faux.html?course=bioquimica');
    await expectPracticeHealth(page);
    const bank = await counts(page, 'bioquimica');
    expect(bank.qcm).toBeGreaterThanOrEqual(600);
    expect(bank.vf).toBeGreaterThanOrEqual(120);
    expect(bank.cases).toBeGreaterThanOrEqual(600);
  });

  test('Inmunología V/F is completed by fallback without losing restored QCM and cases', async ({ page }) => {
    await answerOneQuestion(page, '/vrai-faux.html?course=inmunologia');
    await expectPracticeHealth(page);
    const bank = await counts(page, 'inmunologia');
    expect(bank.qcm).toBeGreaterThanOrEqual(600);
    expect(bank.vf).toBeGreaterThanOrEqual(120);
    expect(bank.cases).toBeGreaterThanOrEqual(600);
  });

  test('question feedback button remains visible and uses local fallback', async ({ page }) => {
    await answerOneQuestion(page, '/qcm.html?course=fisiologia');
    const report = page.locator('[data-action="open-feedback"], .report-btn, button:has-text("Reportar"), button:has-text("error")').first();
    await expect(report).toBeVisible();
    await report.click();
    await expect(page.locator('#questionFeedbackModal, [role="dialog"]').first()).toBeVisible();
    const form = page.locator('#questionFeedbackModal form, form[name="question-feedback"]').first();
    await expect(form).toBeVisible();
    const textarea = page.locator('#questionFeedbackModal textarea[name="comment"], textarea[name="comment"]').first();
    await textarea.fill('Test automatisé du report de question.');
    await page.locator('#questionFeedbackModal button[type="submit"], form[name="question-feedback"] button[type="submit"]').first().click();
    await expect(page.locator('#questionFeedbackFallbackV360')).toBeVisible();
    await expect(page.locator('#questionFeedbackFallbackV360')).toContainText('Reporte guardado localmente');
  });
});
