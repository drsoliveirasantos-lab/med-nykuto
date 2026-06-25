const { test, expect } = require('@playwright/test');

const ANSWER_SELECTOR = 'button[data-option]:visible, button[data-answer]:visible, button.option:visible, button.answer-option:visible, .option button:visible, .answer-option button:visible, .option[role="button"]:visible, .answer-option[role="button"]:visible, .option:visible, .answer-option:visible, [data-answer]:visible';
const CORRECTION_VISIBLE_SELECTOR = '.answer-panel:not([hidden]):visible, .detailed-correction:visible, .correction-card:visible, .premium-correction:visible, .ppc-panel:visible, .pc-card:visible, [data-correction]:visible';
const REVEAL_SELECTOR = 'button:has-text("Ver respuesta"):visible, button:has-text("Voir la réponse"):visible, button:has-text("Não sei"):visible, button:has-text("No sé"):visible, [data-action="dont-know"]:visible, [data-action="show-answer"]:visible';

async function answerOneQuestion(page, url) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363', null, { timeout: 20000 });

  const answer = page.locator(ANSWER_SELECTOR).first();
  await expect(answer).toBeVisible({ timeout: 15000 });
  await answer.click();

  const visibleCorrection = page.locator(CORRECTION_VISIBLE_SELECTOR).first();
  try {
    await expect(visibleCorrection).toBeVisible({ timeout: 2500 });
  } catch (err) {
    const reveal = page.locator(REVEAL_SELECTOR).first();
    if (await reveal.count()) {
      await reveal.click();
    }
  }

  await expect(page.locator(CORRECTION_VISIBLE_SELECTOR).first()).toBeVisible({ timeout: 15000 });
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
  expect(health.bodyHealth).toBe('ok');
  if (health.ok !== undefined) expect(health.ok).toBeTruthy();
  if (health.bankRequired !== undefined) expect(health.bankRequired).toBeTruthy();
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
    const report = page.locator('[data-action="open-feedback"]:visible, .report-btn:visible, button:has-text("Reportar"):visible, button:has-text("error"):visible').first();
    await expect(report).toBeVisible();
    await report.click();
    await expect(page.locator('#questionFeedbackModal:visible, [role="dialog"]:visible').first()).toBeVisible();
    const form = page.locator('#questionFeedbackModal form:visible, form[name="question-feedback"]:visible').first();
    await expect(form).toBeVisible();
    const textarea = page.locator('#questionFeedbackModal textarea[name="comment"]:visible, textarea[name="comment"]:visible').first();
    await textarea.fill('Test automatisé du report de question.');
    await page.locator('#questionFeedbackModal button[type="submit"]:visible, form[name="question-feedback"] button[type="submit"]:visible').first().click();
    await expect(page.locator('#questionFeedbackFallbackV360')).toBeVisible();
    await expect(page.locator('#questionFeedbackFallbackV360')).toContainText('Reporte guardado localmente');
  });
});
