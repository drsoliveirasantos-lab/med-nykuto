const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_NEXT_VISIBILITY = 'v379-smooth-skip-next-no-reload';
const CURRENT_PROGRESS_FIX = 'v361';

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

async function currentQuestionCounter(page) {
  return page.evaluate(() => {
    try {
      if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') {
        window.__MED_NYKUTO_SYNC_PROGRESS__();
      }
    } catch (e) {}

    const candidates = [];
    const pushCandidate = (current, total, source) => {
      const c = Number(current);
      const t = Number(total);
      if (!Number.isFinite(c) || !Number.isFinite(t) || c < 1 || t < 1) return;
      candidates.push({ current: c, total: t, source });
    };

    const nodes = Array.from(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge, .single-question-card [class*="badge"]'));
    for (const node of nodes) {
      const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if (match) pushCandidate(match[1], match[2], 'dom');
    }

    const state = window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__;
    if (state && state.current && state.total) pushCandidate(state.current, state.total, 'window-state');

    const card = document.querySelector('.single-question-card');
    const cardId = card && card.id;
    if (cardId) {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i) || '';
        try {
          const stored = JSON.parse(localStorage.getItem(key) || 'null');
          if (!stored || !Array.isArray(stored.currentBatch)) continue;
          const idx = stored.currentBatch.indexOf(cardId);
          if (idx < 0) continue;
          const total = stored.currentBatch.length || 20;
          const storedIndex = Number(stored.currentIndex || 0);
          pushCandidate(Math.max(idx + 1, storedIndex + 1), total, 'storage-visible-card');
        } catch (e) {}
      }
    }

    if (!candidates.length) return '';
    candidates.sort((a, b) => (b.current - a.current) || (b.total - a.total));
    const best = candidates[0];
    return `${best.current}/${best.total}`;
  });
}

async function waitPracticeReady(page) {
  await waitForWindowFlag(page, '__MED_NYKUTO_RUNTIME_GUARD__', 'v361');
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_LOADER__', CURRENT_PRACTICE_LOADER);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_NEXT_STABILITY__', CURRENT_NEXT_STABILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_NEXT_VISIBILITY__', CURRENT_NEXT_VISIBILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_PROGRESS_FIX__', CURRENT_PROGRESS_FIX);
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

async function waitCounterAdvanced(page, firstIdentity) {
  await expect.poll(async () => {
    const identity = await currentQuestionIdentity(page);
    if (identity === firstIdentity) return false;
    const counter = await currentQuestionCounter(page);
    const match = String(counter || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    return !!match && Number(match[2]) === 20 && Number(match[1]) >= 1;
  }, { timeout: 20000 }).toBe(true);
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
          skippedAnswerKeys: records.filter(([, rec]) => rec && (rec.skipped === true || rec.unknown === true)).map(([qid]) => qid).slice(0, 5),
        });
      } catch (e) {}
    }
    return { states, progressState: window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ || null };
  });
  console.log('REAL_CLICK_STORAGE_' + label + '=' + JSON.stringify(snapshot));
}

async function logRealClickDiag(page, label) {
  const diag = await page.evaluate(() => {
    try {
      if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') {
        window.__MED_NYKUTO_SYNC_PROGRESS__();
      }
    } catch (e) {}
    const card = document.querySelector('.single-question-card');
    const next = card && card.querySelector('[data-action="next-question"]');
    return {
      url: location.href,
      readyState: document.readyState,
      cardId: card ? card.id : null,
      cardText: card ? card.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : null,
      counter: document.querySelector('.premium-progress strong, .question-count-stat strong')?.textContent || null,
      progressFix: window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ || null,
      progressMode: window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ || null,
      progressState: window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ || null,
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

  test('QCM next can skip an unanswered question and advance progress', async ({ page }) => {
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await logRealClickDiag(page, 'SKIP_BEFORE');
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstIdentity);
    await waitCounterAdvanced(page, firstIdentity);
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
    await waitCounterAdvanced(page, firstIdentity);
    await logRealClickDiag(page, 'ANSWERED_AFTER_NEXT');
  });

  test('mobile QCM next can skip an unanswered question and advance progress', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFreshQcm(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await expect(page.locator('#practiceMobileNextBar')).toHaveCount(0);
    await logRealClickDiag(page, 'MOBILE_SKIP_BEFORE');
    await clickNativeNext(page);
    await waitQuestionChanged(page, firstIdentity);
    await waitCounterAdvanced(page, firstIdentity);
    await logRealClickDiag(page, 'MOBILE_SKIP_AFTER');
    await logStorageSnapshot(page, 'MOBILE_SKIP_AFTER');
  });
});
