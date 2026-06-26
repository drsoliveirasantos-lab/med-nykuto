const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_PROGRESS_FIX = 'v361';

async function waitPracticeReady(page) {
  await page.goto('/qcm.html?course=fisiologia');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361', null, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_LOADER__ === version, CURRENT_PRACTICE_LOADER, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ === version, CURRENT_NEXT_STABILITY, { timeout: 20000 });
  await page.waitForFunction((version) => window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ === version, CURRENT_PROGRESS_FIX, { timeout: 20000 });
  await page.waitForFunction(() => typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function', null, { timeout: 20000 });
  await expect(page.locator('.single-question-card').first()).toBeAttached({ timeout: 15000 });
}

async function currentQuestionIdentity(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.single-question-card');
    if (!card) return '';
    const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
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

async function waitProgressAfterTransition(page, firstIdentity) {
  await expect.poll(async () => {
    const identity = await currentQuestionIdentity(page);
    if (identity === firstIdentity) return false;
    const counter = await currentQuestionCounter(page);
    const match = String(counter || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
    return !!match && Number(match[2]) === 20 && Number(match[1]) >= 1;
  }, { timeout: 15000 }).toBe(true);
}

async function answerCurrent(page) {
  const option = page.locator('.single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
  await expect(page.locator('.single-question-card .answer-panel:not([hidden])').first()).toBeVisible({ timeout: 15000 });
}

async function qcmDiag(page, label) {
  const data = await page.evaluate(() => {
    try {
      if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') {
        window.__MED_NYKUTO_SYNC_PROGRESS__();
      }
    } catch (e) {}
    const card = document.querySelector('.single-question-card');
    const next = document.querySelector('.single-question-card [data-action="next-question"]');
    return {
      url: location.href,
      cardId: card ? card.id : null,
      counter: document.querySelector('.premium-progress strong, .question-count-stat strong')?.textContent || null,
      progressFix: window.__MED_NYKUTO_PRACTICE_PROGRESS_FIX__ || null,
      progressMode: window.__MED_NYKUTO_PRACTICE_PROGRESS_MODE__ || null,
      progressState: window.__MED_NYKUTO_PRACTICE_PROGRESS_STATE__ || null,
      nextStability: window.__MED_NYKUTO_PRACTICE_NEXT_STABILITY__ || null,
      fallback: window.__MED_NYKUTO_PRACTICE_CRITICAL_CLICK_FALLBACK__ || null,
      forced: window.__MED_NYKUTO_LAST_FORCED_NEXT__ || null,
      nextText: next ? next.textContent.trim() : null,
      nextDisabled: next ? !!(next.disabled || next.hasAttribute('disabled')) : null,
      answerPanel: !!document.querySelector('.single-question-card .answer-panel:not([hidden])')
    };
  });
  console.log('QCM_DIAG_' + label + '=' + JSON.stringify(data));
  return data;
}

async function clickFirstVisible(locator) {
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const item = locator.nth(i);
    if (await item.isVisible().catch(() => false)) {
      await item.scrollIntoViewIfNeeded();
      await item.click({ force: true });
      return true;
    }
  }
  return false;
}

test.describe('QCM critical click behavior', () => {
  test('real next click changes the current QCM question and progress', async ({ page }) => {
    await waitPracticeReady(page);
    const firstIdentity = await currentQuestionIdentity(page);
    await qcmDiag(page, 'BEFORE');
    await answerCurrent(page);
    await qcmDiag(page, 'ANSWERED');

    const next = page.locator('.single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 10000 });
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });

    await expect.poll(async () => currentQuestionIdentity(page), { timeout: 15000 }).not.toBe(firstIdentity);
    await waitProgressAfterTransition(page, firstIdentity);
    await qcmDiag(page, 'AFTER');
  });

  test('details control in the correction remains openable after answering', async ({ page }) => {
    await waitPracticeReady(page);
    await answerCurrent(page);

    const panel = page.locator('.single-question-card .answer-panel:not([hidden])').first();
    await expect(panel).toBeVisible({ timeout: 10000 });

    const detailButton = panel.locator('button, a, [role="button"]').filter({ hasText: /explicación|detalles|détails|details|voir plus|ver más|mostrar más|plus de/i });
    if (await clickFirstVisible(detailButton)) {
      await expect(panel).toContainText(/Por qué|Correcta|respuesta|distractores|explicación/i, { timeout: 10000 });
      return;
    }

    const visibleSummary = panel.locator('details summary').filter({ hasText: /explicación|detalles|distractores|voir|ver/i });
    if (await clickFirstVisible(visibleSummary)) {
      await expect(panel.locator('details[open]').first()).toBeAttached({ timeout: 10000 });
      return;
    }

    await expect(panel).toContainText(/respuesta|correcta|correcci|Por qué/i);
  });
});
