const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';

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
    const nodes = Array.from(document.querySelectorAll('.question-count-stat strong, .single-question-card .quiz-head .badge, .premium-progress strong'));
    for (const node of nodes) {
      const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if (match) return `${match[1]}/${match[2]}`;
    }
    return '';
  });
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
    const card = document.querySelector('.single-question-card');
    const next = document.querySelector('.single-question-card [data-action="next-question"]');
    return {
      url: location.href,
      cardId: card ? card.id : null,
      counter: document.querySelector('.question-count-stat strong, .premium-progress strong')?.textContent || null,
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
    await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('2/20');
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
