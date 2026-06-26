const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v370-native-exact-next';
const CURRENT_NEXT_VISIBILITY = 'v377-deterministic-skip-next-storage-scan';

async function waitForWindowFlag(page, name, expected, timeout = 20000) {
  await expect.poll(
    async () => page.evaluate((flagName) => window[flagName] || null, name),
    { timeout }
  ).toBe(expected);
}

async function currentQuestionIdentity(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.single-question-card');
    if (!card) return '';
    const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3, p');
    return [card.id || '', (prompt?.textContent || '').replace(/\s+/g, ' ').trim()].join('|');
  });
}

async function waitPracticeReady(page) {
  await waitForWindowFlag(page, '__MED_NYKUTO_RUNTIME_GUARD__', 'v361');
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_LOADER__', CURRENT_PRACTICE_LOADER);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_NEXT_STABILITY__', CURRENT_NEXT_STABILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_NEXT_VISIBILITY__', CURRENT_NEXT_VISIBILITY);
  await expect(page.locator('.single-question-card').first()).toBeVisible({ timeout: 15000 });
}

async function openFreshQcm(page) {
  await page.goto('/qcm.html?course=fisiologia');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitPracticeReady(page);
}

async function answerCurrentQuestion(page) {
  const answer = page.locator('.single-question-card button.option[data-option]').first();
  await expect(answer).toBeVisible({ timeout: 15000 });
  await answer.scrollIntoViewIfNeeded();
  await answer.click({ force: true });

  await expect.poll(async () => page.evaluate(() => {
    const card = document.querySelector('.single-question-card');
    return !!card && !!card.querySelector('.answer-panel:not([hidden]), .option.correct, .option.wrong, .option.chosen, .options.answered');
  }), { timeout: 15000 }).toBe(true);
}

async function clickNativeNext(page) {
  const next = page.locator('.single-question-card [data-action="next-question"]').first();
  await expect(next).toBeVisible({ timeout: 10000 });
  await expect(next).toBeEnabled({ timeout: 10000 });
  await next.scrollIntoViewIfNeeded();
  await next.click({ force: true });
}

async function waitQuestionChanged(page, firstIdentity) {
  await expect.poll(async () => currentQuestionIdentity(page), { timeout: 20000 }).not.toBe(firstIdentity);
}

async function logStorageSnapshot(page, label) {
  const snapshot = await page.evaluate(() => {
    const states = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || '';
      try {
        const state = JSON.parse(localStorage.getItem(key) || 'null');
        if (!state || !Array.isArray(state.currentBatch)) continue;
        const answers = state.currentAnswers || {};
        const records = Object.entries(answers);
        states.push({
          key,
          currentIndex: state.currentIndex ?? null,
          batchFinished: state.batchFinished ?? null,
          answerCount: records.length,
          skippedAnswerKeys: records.filter(([, rec]) => rec && rec.skipped === true).map(([qid]) => qid).slice(0, 5),
        });
      } catch (e) {}
    }
    let sessionSkip = null;
    try {
      const raw = sessionStorage.getItem('__MED_NYKUTO_SKIP_NEXT_LAST__');
      sessionSkip = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    return { sessionSkip, states };
  });
  console.log('REAL_CLICK_STORAGE_' + label + '=' + JSON.stringify(snapshot));
}

async function logRealClickDiag(page, label) {
  const diag = await page.evaluate(() => {
    const card = document.querySelector('.single-question-card');
    const next = card && card.querySelector('[data-action="next-question"]');
    return {
      url: location.href,
      readyState: document.readyState,
      cardId: card ? card.id : null,
      cardText: card ? card.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : null,
      nextVisible: next ? getComputedStyle(next).display !== 'none' && getComputedStyle(next).visibility !== 'hidden' : null,
      nextDisabled: next ? !!(next.disabled || next.hasAttribute('disabled')) : null,
      nextText: next ? next.textContent.trim() : null,
      nextStability: window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ || null,
      nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null,
      forcedNext: window.__MED_NYKUTO_LAST_FORCED_NEXT__ || null,
    };
  });
  console.log('REAL_CLICK_DIAG_' + label + '=' + JSON.stringify(diag));
}

test.describe('Med Nykuto real user click regressions', () => {
  test('clicking the site logo from QCM returns to homepage', async ({ page }) => {
    await openFreshQcm(page);
    await page.locator('a.brand, a.brand-official, .brand-logo-official').first().click({ force: true });
    await expect(page).toHaveURL(/\/index\.html$|\/$/, { timeout: 15000 });
  });

  test('QCM next can skip an unanswered question and visibly advance', async ({ page }) => {
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await logRealClickDiag(page, 'SKIP_BEFORE');
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstIdentity);
    await logRealClickDiag(page, 'SKIP_AFTER');
    await logStorageSnapshot(page, 'SKIP_AFTER');
  });

  test('QCM next advances after answering', async ({ page }) => {
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await answerCurrentQuestion(page);
    await logRealClickDiag(page, 'ANSWERED_BEFORE_NEXT');
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstIdentity);
    await logRealClickDiag(page, 'ANSWERED_AFTER_NEXT');
  });

  test('mobile QCM next can skip an unanswered question and visibly advance', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await expect(page.locator('#practiceMobileNextBar')).toHaveCount(0);
    await logRealClickDiag(page, 'MOBILE_SKIP_BEFORE');
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstIdentity);
    await logRealClickDiag(page, 'MOBILE_SKIP_AFTER');
    await logStorageSnapshot(page, 'MOBILE_SKIP_AFTER');
  });
});
