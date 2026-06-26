const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v370-native-exact-next';
const CURRENT_NEXT_VISIBILITY = 'v376-deterministic-skip-next';
const PRACTICE_STORAGE_PREFIX = 'medPractice:v35-bugfix:';

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

async function currentQuestionId(page) {
  return page.locator('.single-question-card').first().getAttribute('id');
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

async function storageSkipSnapshot(page, questionId) {
  return page.evaluate(({ prefix, id }) => {
    const out = {
      exactSkipped: false,
      anySkipped: false,
      sessionSkip: null,
      states: [],
    };

    try {
      const rawSessionSkip = sessionStorage.getItem('__MED_NYKUTO_SKIP_NEXT_LAST__');
      out.sessionSkip = rawSessionSkip ? JSON.parse(rawSessionSkip) : null;
      if (out.sessionSkip && (!id || out.sessionSkip.id === id)) out.anySkipped = true;
    } catch (e) {}

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || '';
      if (!key.startsWith(prefix)) continue;
      try {
        const state = JSON.parse(localStorage.getItem(key) || 'null');
        const answers = state && state.currentAnswers ? state.currentAnswers : {};
        const records = Object.entries(answers);
        const exact = id ? answers[id] : null;
        const any = records.some(([, rec]) => rec && rec.skipped === true && rec.correct === false);
        if (exact && exact.skipped === true && exact.correct === false) out.exactSkipped = true;
        if (any) out.anySkipped = true;
        out.states.push({
          key,
          currentIndex: state ? state.currentIndex : null,
          batchFinished: state ? state.batchFinished : null,
          answerKeys: records.map(([qid]) => qid).slice(0, 5),
          skippedAnswerKeys: records.filter(([, rec]) => rec && rec.skipped === true).map(([qid]) => qid).slice(0, 5),
        });
      } catch (e) {}
    }
    return out;
  }, { prefix: PRACTICE_STORAGE_PREFIX, id: questionId || '' });
}

async function waitSkippedRecord(page, questionId) {
  await expect.poll(async () => {
    const snap = await storageSkipSnapshot(page, questionId);
    return snap.exactSkipped || snap.anySkipped;
  }, { timeout: 20000 }).toBe(true);
}

async function waitQuestionChanged(page, firstIdentity) {
  await expect.poll(async () => currentQuestionIdentity(page), { timeout: 20000 }).not.toBe(firstIdentity);
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

  test('QCM next can skip unanswered question and records the skip', async ({ page }) => {
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    const firstId = await currentQuestionId(page);
    await logRealClickDiag(page, 'SKIP_BEFORE');
    await clickNativeNext(page);
    await waitSkippedRecord(page, firstId);
    await waitQuestionChanged(page, firstIdentity);
    await logRealClickDiag(page, 'SKIP_AFTER');
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

  test('mobile QCM next can skip unanswered question and records the skip', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    const firstId = await currentQuestionId(page);
    await expect(page.locator('#practiceMobileNextBar')).toHaveCount(0);
    await logRealClickDiag(page, 'MOBILE_SKIP_BEFORE');
    await clickNativeNext(page);
    await waitSkippedRecord(page, firstId);
    await waitQuestionChanged(page, firstIdentity);
    await logRealClickDiag(page, 'MOBILE_SKIP_AFTER');
  });
});
