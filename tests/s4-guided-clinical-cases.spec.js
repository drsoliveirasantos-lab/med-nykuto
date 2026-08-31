const { test, expect } = require('@playwright/test');
const { routeCurrentClassPublic } = require('./helpers/current-class-public-fixture');
const guidedContent = require('../content/class/s4-guided-respiratory-cases.json');

const ORDINARY_STORAGE_KEY = 'med-nykuto-class-practice-v431';
const GUIDED_STORAGE_KEY = 'med-nykuto-s4-guided-cases-v177';
const ASTHMA_CASE = guidedContent.cases.find((item) => item.id === 's4-fisio-resp-asma-04');
const PNEUMOTHORAX_CASE = guidedContent.cases.find((item) => item.id === 's4-fisio-resp-neumotorax-02');
const GUIDED_URL = `/clase.html?caseMode=guided&guidedScope=fisiologia-respiratorio-p1&guidedCase=${encodeURIComponent(ASTHMA_CASE.id)}#fisiologia-2026-08-13`;
const EXPECTED_LEVELS = ['Reconocimiento', 'Interpretación', 'Mecanismo', 'Integración'];

async function openAsthmaCase(page) {
  await page.goto(GUIDED_URL, { waitUntil: 'domcontentloaded' });
  const dialog = page.locator('[data-guided-cases-dialog]');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(page.locator('html')).toHaveClass(/s4-guided-modal-open/);
  await expect(page.locator('body')).toHaveClass(/s4-guided-modal-open/);
  await expect(dialog.locator('[data-guided-case-picker]')).toHaveValue(ASTHMA_CASE.id);
  return dialog;
}

async function answerWithKnownDistractor(dialog, stepIndex) {
  const question = ASTHMA_CASE.questions[stepIndex];
  const distractorIndex = (question.answerIndex + 1) % question.options.length;
  const option = dialog.locator(`[data-guided-option-index="${distractorIndex}"]`);
  await expect(option).toBeVisible();
  await option.click();

  const feedback = dialog.locator('[data-guided-feedback]');
  await expect(feedback).toBeVisible();
  await expect(feedback.getByRole('heading', { name: 'Respuesta' })).toBeVisible();
  await expect(feedback.getByRole('heading', { name: 'Mecanismo' })).toBeVisible();
  await expect(feedback.getByRole('heading', { name: 'Aplicación' })).toBeVisible();
  await expect(feedback.locator('[data-guided-source-evidence]')).toBeVisible();
  await expect(feedback.locator('.s4-guided-selected-reason')).toContainText(question.whyWrong[distractorIndex]);
  await expect(feedback.locator('[data-guided-distractors]')).toBeAttached();
  await expect(dialog.locator('[data-guided-option-index]:disabled')).toHaveCount(4);
  return { feedback, distractorIndex };
}

test.describe('S4 guided respiratory cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-30T12:00:00-03:00') });
    await routeCurrentClassPublic(page);
  });

  test('keeps the asthma case sequential, answer-safe, sourced and resumable', async ({ page }) => {
    await page.addInitScript(() => {
      window.__s4OrdinaryPracticeCompleteEvents = 0;
      document.addEventListener('mednykuto:practice-complete', () => {
        window.__s4OrdinaryPracticeCompleteEvents += 1;
      });
    });

    const dialog = await openAsthmaCase(page);
    await expect(dialog.locator('[data-guided-question]')).toHaveCount(1);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 1 de 4');
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(ASTHMA_CASE.questions[0].prompt);

    const caseData = dialog.locator('[data-guided-case-data] .s4-guided-data-list > div');
    await expect(caseData).toHaveCount(ASTHMA_CASE.data.length);
    const renderedData = await caseData.evaluateAll((rows) => rows.map((row) => ({
      label: row.querySelector('dt').textContent.trim(),
      value: row.querySelector('dd > span').textContent.trim(),
      unit: row.querySelector('dd > small') ? row.querySelector('dd > small').textContent.trim() : ''
    })));
    expect(renderedData).toEqual(ASTHMA_CASE.data.map((row) => ({
      label: String(row.label),
      value: String(row.value),
      unit: row.unit ? String(row.unit) : ''
    })));

    const firstQuestion = dialog.locator('[data-guided-question]');
    await expect(firstQuestion.locator('[data-guided-feedback]')).toHaveCount(0);
    await expect(firstQuestion.locator('[data-guided-source-evidence]')).toHaveCount(0);
    await expect(firstQuestion.locator('[data-guided-distractors]')).toHaveCount(0);
    await expect(firstQuestion.locator('[data-guided-next]')).toHaveCount(0);
    const answerLeaks = await firstQuestion.evaluate((root) => [root, ...root.querySelectorAll('*')].flatMap((node) =>
      node.getAttributeNames().filter((name) => /^(?:data-(?:answer|answer-index|correct|correct-answer|is-correct)|aria-correct)$/i.test(name))
    ));
    expect(answerLeaks).toEqual([]);

    const levels = [await dialog.locator('[data-guided-reasoning-level]').textContent()];
    const firstPrompt = ASTHMA_CASE.questions[0].prompt;
    await answerWithKnownDistractor(dialog, 0);
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(firstPrompt);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 1 de 4');
    await expect(dialog.locator('[data-guided-next]')).toHaveText('Continuar al paso 2');
    await expect(dialog.locator('[data-guided-source-evidence] a').first()).toHaveAttribute('href', /^https:\/\/drive\.google\.com\//);

    await dialog.locator('[data-guided-next]').click();
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 2 de 4');
    await expect(dialog.locator('[data-guided-case-picker]')).toHaveValue(ASTHMA_CASE.id);
    await expect(dialog.locator('[data-guided-prior-conclusions]')).toContainText(ASTHMA_CASE.questions[0].correction.conclusion);
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(ASTHMA_CASE.questions[1].prompt);
    levels.push(await dialog.locator('[data-guided-reasoning-level]').textContent());

    await page.reload({ waitUntil: 'domcontentloaded' });
    const resumedDialog = page.locator('[data-guided-cases-dialog]');
    await expect(resumedDialog).toHaveAttribute('open', '');
    await expect(resumedDialog.locator('[data-guided-case-picker]')).toHaveValue(ASTHMA_CASE.id);
    await expect(resumedDialog.locator('[data-guided-question-index]')).toHaveText('Paso 2 de 4');
    await expect(resumedDialog.locator('#s4GuidedQuestionTitle')).toHaveText(ASTHMA_CASE.questions[1].prompt);
    await expect(resumedDialog.locator('[data-guided-prior-conclusions]')).toContainText(ASTHMA_CASE.questions[0].correction.conclusion);

    await resumedDialog.locator('[data-guided-cases-close]').click();
    await expect(resumedDialog).not.toHaveAttribute('open', '');
    expect(['caseMode', 'guidedScope', 'guidedCase'].every((key) => !new URL(page.url()).searchParams.has(key))).toBe(true);
    await page.locator('[data-lesson-panel="fisiologia-2026-08-13"] [data-lesson-tab="training"]').click();
    await page.locator('[data-practice-root="fisiologia-2026-08-13"] [data-guided-cases-open]').click();
    await expect(resumedDialog).toHaveAttribute('open', '');
    await expect(resumedDialog.locator('[data-guided-case-picker]')).toHaveValue(ASTHMA_CASE.id);
    await expect(resumedDialog.locator('[data-guided-question-index]')).toHaveText('Paso 2 de 4');

    for (let stepIndex = 1; stepIndex < ASTHMA_CASE.questions.length; stepIndex += 1) {
      await answerWithKnownDistractor(resumedDialog, stepIndex);
      const next = resumedDialog.locator('[data-guided-next]');
      await expect(next).toBeVisible();
      if (stepIndex === ASTHMA_CASE.questions.length - 1) {
        await expect(next).toHaveText('Ver balance');
        await next.click();
      } else {
        await next.click();
        await expect(resumedDialog.locator('[data-guided-question-index]')).toHaveText(`Paso ${stepIndex + 2} de 4`);
        await expect(resumedDialog.locator('[data-guided-case-picker]')).toHaveValue(ASTHMA_CASE.id);
        levels.push(await resumedDialog.locator('[data-guided-reasoning-level]').textContent());
      }
    }

    expect(levels).toEqual(EXPECTED_LEVELS);
    const balance = resumedDialog.locator('[data-guided-balance]');
    await expect(balance).toBeVisible();
    await expect(balance).toBeFocused();
    await expect(balance.getByRole('heading', { name: 'Balance de razonamiento' })).toBeVisible();
    await expect(balance.locator(':scope > ol > li')).toHaveCount(4);
    await expect(balance.locator('.s4-guided-score')).toContainText('0/4');
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    const balanceBadgeContrast = await balance.locator(':scope > ol > li > span').first().evaluate((badge) => {
      function channel(value) {
        const normalizedValue = value / 255;
        return normalizedValue <= 0.04045 ? normalizedValue / 12.92 : ((normalizedValue + 0.055) / 1.055) ** 2.4;
      }
      function luminance(value) {
        const rgb = (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
      }
      const style = getComputedStyle(badge);
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(balanceBadgeContrast).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(() => window.__s4OrdinaryPracticeCompleteEvents)).toBe(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), ORDINARY_STORAGE_KEY)).toBeNull();
  });

  test('adds an opt-in launcher without changing the certified 20/10/10 practice contract', async ({ page }) => {
    const sentinel = JSON.stringify({ issue177: 'ordinary-practice-state-must-remain-byte-for-byte-identical' });
    await page.addInitScript(({ key, value }) => {
      localStorage.setItem(key, value);
      window.__s4OrdinaryPracticeCompleteEvents = 0;
      document.addEventListener('mednykuto:practice-complete', () => {
        window.__s4OrdinaryPracticeCompleteEvents += 1;
      });
    }, { key: ORDINARY_STORAGE_KEY, value: sentinel });

    await page.goto('/clase.html#fisiologia-2026-08-13', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    const lessonLauncher = page.locator('[data-practice-root="fisiologia-2026-08-13"] [data-guided-cases-open]');
    const companionLauncher = page.locator('[data-practice-root="fisiologia-2026-08-10"] [data-guided-cases-open]');
    const dialog = page.locator('[data-guided-cases-dialog]');
    await expect(lessonLauncher).toHaveCount(1);
    await expect(companionLauncher).toHaveCount(1);
    await expect(dialog).not.toHaveAttribute('open', '');
    expect(new URL(page.url()).searchParams.has('caseMode')).toBe(false);

    await expect(page.locator('[data-practice-root]')).toHaveCount(23);
    const contract = await page.evaluate(() => {
      const serializedBanks = JSON.stringify(window.MedNykutoClassPractice.banks);
      let fingerprint = 2166136261;
      for (let index = 0; index < serializedBanks.length; index += 1) {
        fingerprint ^= serializedBanks.charCodeAt(index);
        fingerprint = Math.imul(fingerprint, 16777619);
      }
      return {
        bankCount: Object.keys(window.MedNykutoClassPractice.banks).length,
        bankCounts: Object.values(window.MedNykutoClassPractice.banks).map((bank) => [bank.qcm.length, bank.vf.length, bank.cases.length]),
        bankFingerprint: `${serializedBanks.length}:${fingerprint >>> 0}`,
        ordinaryTabCounts: Array.from(document.querySelectorAll('[data-practice-root]')).map((root) => root.querySelectorAll('.practice-tab').length)
      };
    });
    expect(contract.bankCount).toBe(23);
    expect(contract.bankCounts.every((counts) => counts.join(',') === '20,10,10')).toBe(true);
    expect(contract.ordinaryTabCounts).toHaveLength(23);
    expect(contract.ordinaryTabCounts.every((count) => count === 3)).toBe(true);

    await page.locator('[data-lesson-panel="fisiologia-2026-08-13"] [data-lesson-tab="training"]').click();
    await expect(lessonLauncher).toBeVisible();
    await lessonLauncher.click();
    await expect(dialog).toHaveAttribute('open', '');
    await dialog.locator('[data-guided-option-index]').first().click();
    await expect(dialog.locator('[data-guided-feedback]')).toBeVisible();

    const lightContrasts = await dialog.evaluate((root) => {
      function channel(value) {
        const normalizedValue = value / 255;
        return normalizedValue <= 0.04045 ? normalizedValue / 12.92 : ((normalizedValue + 0.055) / 1.055) ** 2.4;
      }
      function rgb(value) {
        return (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      }
      function ratio(foreground, background) {
        const fg = rgb(foreground);
        const bg = rgb(background);
        const fgLum = 0.2126 * channel(fg[0]) + 0.7152 * channel(fg[1]) + 0.0722 * channel(fg[2]);
        const bgLum = 0.2126 * channel(bg[0]) + 0.7152 * channel(bg[1]) + 0.0722 * channel(bg[2]);
        return (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
      }
      const link = root.querySelector('.s4-guided-evidence a');
      const badge = root.querySelector('.s4-guided-option.is-correct > span');
      return {
        evidenceLink: ratio(getComputedStyle(link).color, 'rgb(255, 255, 255)'),
        correctBadge: ratio(getComputedStyle(badge).color, getComputedStyle(badge).backgroundColor)
      };
    });
    expect(lightContrasts.evidenceLink).toBeGreaterThanOrEqual(4.5);
    expect(lightContrasts.correctBadge).toBeGreaterThanOrEqual(4.5);

    expect(await page.evaluate((key) => localStorage.getItem(key), ORDINARY_STORAGE_KEY)).toBe(sentinel);
    expect(await page.evaluate(() => window.__s4OrdinaryPracticeCompleteEvents)).toBe(0);
    const banksAfterGuidedAnswer = await page.evaluate(() => {
      const banks = window.MedNykutoClassPractice.banks;
      const serializedBanks = JSON.stringify(banks);
      let fingerprint = 2166136261;
      for (let index = 0; index < serializedBanks.length; index += 1) {
        fingerprint ^= serializedBanks.charCodeAt(index);
        fingerprint = Math.imul(fingerprint, 16777619);
      }
      return {
        counts: Object.values(banks).map((bank) => [bank.qcm.length, bank.vf.length, bank.cases.length]),
        fingerprint: `${serializedBanks.length}:${fingerprint >>> 0}`
      };
    });
    expect(banksAfterGuidedAnswer.counts.every((counts) => counts.join(',') === '20,10,10')).toBe(true);
    expect(banksAfterGuidedAnswer.fingerprint).toBe(contract.bankFingerprint);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    expect(['caseMode', 'guidedScope', 'guidedCase'].every((key) => !new URL(page.url()).searchParams.has(key))).toBe(true);

    await page.goto('/clase.html#fisiologia-2026-08-10', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-lesson-panel="fisiologia-2026-08-10"] [data-lesson-tab="training"]').click();
    const tenAugustLauncher = page.locator('[data-practice-root="fisiologia-2026-08-10"] [data-guided-cases-open]');
    await tenAugustLauncher.click();
    await expect(page.locator('[data-guided-cases-dialog]')).toHaveAttribute('open', '');
    expect(new URL(page.url()).hash).toBe('#fisiologia-2026-08-10');
  });

  test('renders contextual V/F steps through the same correction flow', async ({ page }) => {
    const priorQuestions = PNEUMOTHORAX_CASE.questions.slice(0, 2);
    const answers = Object.fromEntries(priorQuestions.map((question) => [question.id, {
      selected: question.answerIndex,
      correct: true,
      answeredAt: 1
    }]));
    await page.addInitScript(({ key, dataVersion, caseId, savedAnswers }) => {
      localStorage.setItem(key, JSON.stringify({
        dataVersion,
        selectedCaseId: caseId,
        cases: { [caseId]: { current: 2, completed: false, answers: savedAnswers } }
      }));
    }, {
      key: GUIDED_STORAGE_KEY,
      dataVersion: guidedContent.version,
      caseId: PNEUMOTHORAX_CASE.id,
      savedAnswers: answers
    });

    const url = `/clase.html?caseMode=guided&guidedScope=fisiologia-respiratorio-p1&guidedCase=${PNEUMOTHORAX_CASE.id}#fisiologia-2026-08-13`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const dialog = page.locator('[data-guided-cases-dialog]');
    const vfQuestion = PNEUMOTHORAX_CASE.questions[2];
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 3 de 4');
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(vfQuestion.prompt);
    await expect(dialog.locator('[data-guided-option-index]')).toHaveCount(2);
    await expect(dialog.locator('[data-guided-option-index="0"]')).toContainText('Verdadero');
    await expect(dialog.locator('[data-guided-option-index="1"]')).toContainText('Falso');
    await expect(dialog.locator('[data-guided-feedback]')).toHaveCount(0);

    const wrongIndex = vfQuestion.answerIndex === 0 ? 1 : 0;
    await dialog.locator(`[data-guided-option-index="${wrongIndex}"]`).click();
    await expect(dialog.locator('[data-guided-feedback]')).toBeVisible();
    await expect(dialog.locator('[data-guided-option-index]:disabled')).toHaveCount(2);
    await expect(dialog.locator('.s4-guided-selected-reason')).toContainText(vfQuestion.whyWrong[wrongIndex]);
    await expect(dialog.locator('[data-guided-next]')).toHaveText('Continuar al paso 4');
  });
});
