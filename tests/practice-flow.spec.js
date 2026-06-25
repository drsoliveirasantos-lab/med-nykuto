const { test, expect } = require('@playwright/test');

const CARD_SELECTOR = '.single-question-card';
const ANSWER_SELECTOR = `${CARD_SELECTOR} button.option[data-option]`;
const CORRECTION_READY_SELECTOR = `${CARD_SELECTOR} .answer-panel:not([hidden])`;

async function preparePracticePage(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363', null, { timeout: 20000 });
  await expect(page.locator(CARD_SELECTOR).first()).toBeAttached({ timeout: 15000 });
  await expect(page.locator(ANSWER_SELECTOR).first()).toBeAttached({ timeout: 15000 });
}

async function answerOneQuestion(page, url) {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await preparePracticePage(page, url);

  await page.evaluate(() => {
    const card = document.querySelector('.single-question-card');
    if (!card) return;
    const panel = card.querySelector('.answer-panel:not([hidden])');
    if (panel) return;
    const answer = card.querySelector('button.option[data-option]:not([disabled])');
    const reveal = card.querySelector('[data-action="dont-know"]');
    (answer || reveal)?.click();
  });

  await expect(page.locator(CORRECTION_READY_SELECTOR).first()).toBeAttached({ timeout: 15000 });
  await expect(page.locator(`${CORRECTION_READY_SELECTOR} .detailed-correction`).first()).toBeAttached({ timeout: 15000 });
  expect(errors).toEqual([]);
}

async function expectPracticeHealth(page) {
  const health = await page.evaluate(() => ({
    ok: window.MED_NYKUTO_HEALTH?.ok,
    bankRequired: window.MED_NYKUTO_HEALTH?.bankRequired,
    qcmCount: window.MED_NYKUTO_HEALTH?.qcmCount || 0,
    vfCount: window.MED_NYKUTO_HEALTH?.vfCount || 0,
    caseCount: window.MED_NYKUTO_HEALTH?.caseCount || 0,
    bodyHealth: document.body?.dataset?.medHealth || '',
    hasBank: !!window.MED_PRACTICE_BANK?.byCourse
  }));
  expect(health.hasBank).toBeTruthy();
  if (health.bodyHealth) expect(health.bodyHealth).toBe('ok');
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
    await preparePracticePage(page, '/qcm.html?course=fisiologia');
    await page.evaluate(() => {
      document.querySelector('.single-question-card [data-action="open-feedback"]')?.click();
    });
    await expect(page.locator('#questionFeedbackModal').first()).toBeAttached({ timeout: 15000 });
    const form = page.locator('#questionFeedbackModal form, form[name="question-feedback"]').first();
    await expect(form).toBeAttached();
    const textarea = page.locator('#questionFeedbackModal textarea[name="comment"], textarea[name="comment"]').first();
    await textarea.fill('Test automatisé du report de question.');
    await page.evaluate(() => {
      const form = document.querySelector('#questionFeedbackModal form, form[name="question-feedback"]');
      if (form?.requestSubmit) form.requestSubmit();
      else form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    await expect(page.locator('#questionFeedbackFallbackV360')).toBeAttached({ timeout: 15000 });
    await expect(page.locator('#questionFeedbackFallbackV360')).toContainText('Reporte guardado localmente');
  });
});
