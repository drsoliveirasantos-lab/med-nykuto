const { test, expect } = require('@playwright/test');

const CURRENT_RUNTIME_GUARD = 'v362';
const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_NEXT_VISIBILITY = 'v388-broad-qcm-viewport-lock';
const CURRENT_PROGRESS_FIX = 'v361';

async function waitForWindowFlag(page, name, expected, timeout = 20000) {
  await expect.poll(async () => page.evaluate((flagName) => window[flagName] || null, name), { timeout }).toBe(expected);
}

async function currentQuestionIdentity(page) {
  return page.evaluate(() => {
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const card = document.querySelector('.single-question-card');
    if (!card) return '';
    if (card.id) return `id:${card.id}`;
    const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return `text:${clean(prompt?.textContent)}`;
  });
}

async function currentQuestionCounter(page) {
  return page.evaluate(() => {
    try { if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__(); } catch (e) {}
    const nodes = Array.from(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge'));
    for (const node of nodes) {
      const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
      if (match) return `${match[1]}/${match[2]}`;
    }
    return '';
  });
}

async function openFreshQcm(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/qcm.html?course=fisiologia');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForWindowFlag(page, '__MED_NYKUTO_RUNTIME_GUARD__', CURRENT_RUNTIME_GUARD);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_LOADER__', CURRENT_PRACTICE_LOADER);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_NEXT_STABILITY__', CURRENT_NEXT_STABILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_NEXT_VISIBILITY__', CURRENT_NEXT_VISIBILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_PROGRESS_FIX__', CURRENT_PROGRESS_FIX);
  await expect(page.locator('.single-question-card').first()).toBeVisible({ timeout: 15000 });
  await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('1/20');
}

async function visualSnapshot(page) {
  return page.evaluate(() => {
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
    };
    const card = document.querySelector('.single-question-card');
    const prompt = card && card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return {
      cardId: card ? (card.id ? `id:${card.id}` : `text:${clean(prompt?.textContent)}`) : '',
      counter: (() => {
        try { if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__(); } catch (e) {}
        const nodes = Array.from(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge'));
        for (const node of nodes) {
          const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
          if (match) return `${match[1]}/${match[2]}`;
        }
        return '';
      })(),
      listEmpty: !document.querySelector('#practiceList .single-question-card'),
      quickHeaderVisible: visible(document.querySelector('.practice-quick-header')),
      pageHeroVisible: visible(document.querySelector('.page-hero')),
      nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null
    };
  });
}

test.describe('QCM transition stability', () => {
  test('one real Next tap causes exactly one visually stable transition and no late repaint', async ({ page }) => {
    await openFreshQcm(page);
    const firstId = await currentQuestionIdentity(page);
    const before = await visualSnapshot(page);
    expect(before.counter).toBe('1/20');
    expect(before.listEmpty).toBe(false);
    expect(before.quickHeaderVisible || before.pageHeroVisible).toBe(false);

    const next = page.locator('.single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 10000 });
    await expect(next).toBeEnabled({ timeout: 10000 });
    await next.scrollIntoViewIfNeeded();
    await next.click({ force: true });

    await expect.poll(async () => currentQuestionIdentity(page), { timeout: 15000 }).not.toBe(firstId);
    await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('2/20');

    const finalId = await currentQuestionIdentity(page);
    const samples = [];
    for (let i = 0; i < 16; i += 1) {
      samples.push(await visualSnapshot(page));
      await page.waitForTimeout(80);
    }

    expect(finalId).not.toBe(firstId);
    expect(samples.map(x => x.counter)).toEqual(Array(samples.length).fill('2/20'));
    expect(samples.filter(x => x.cardId !== finalId)).toEqual([]);
    expect(samples.filter(x => x.listEmpty)).toEqual([]);
    expect(samples.filter(x => x.quickHeaderVisible || x.pageHeroVisible)).toEqual([]);
  });
});
