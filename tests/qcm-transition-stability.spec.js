const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_NEXT_VISIBILITY = 'v387-native-next-fixed-viewport-lock';
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
  await waitForWindowFlag(page, '__MED_NYKUTO_RUNTIME_GUARD__', 'v361');
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_LOADER__', CURRENT_PRACTICE_LOADER);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_NEXT_STABILITY__', CURRENT_NEXT_STABILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_NEXT_VISIBILITY__', CURRENT_NEXT_VISIBILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_PROGRESS_FIX__', CURRENT_PROGRESS_FIX);
  await expect(page.locator('.single-question-card').first()).toBeVisible({ timeout: 15000 });
  await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('1/20');
}

async function installVisualSampler(page) {
  await page.evaluate(() => {
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const isVisible = (el) => {
      if (!el) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    };
    const counter = () => {
      try { if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__(); } catch (e) {}
      const nodes = Array.from(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge'));
      for (const node of nodes) {
        const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
        if (match) return `${match[1]}/${match[2]}`;
      }
      return '';
    };
    const snap = (label) => {
      const card = document.querySelector('.single-question-card');
      const prompt = card && card.querySelector('.question-prompt, .structured-prompt, h2, h3');
      const rect = card ? card.getBoundingClientRect() : { top: 0, height: 0 };
      const cardId = card ? (card.id ? `id:${card.id}` : `text:${clean(prompt?.textContent)}`) : '';
      return {
        t: performance.now(),
        label,
        cardId,
        counter: counter(),
        scrollY: Math.round(scrollY),
        bodyTop: Math.round(parseFloat(getComputedStyle(document.body).top || '0') || 0),
        viewportLock: document.body.classList.contains('practice-viewport-locked'),
        cardTop: Math.round(rect.top),
        cardHeight: Math.round(rect.height),
        promptText: clean(prompt && prompt.textContent),
        buttonCount: card ? card.querySelectorAll('button').length : 0,
        listEmpty: !document.querySelector('#practiceList .single-question-card'),
        quickHeaderVisible: isVisible(document.querySelector('.practice-quick-header')),
        pageHeroVisible: isVisible(document.querySelector('.page-hero')),
        nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null,
      };
    };
    window.__QCM_VISUAL_TRACE__ = [snap('initial')];
    window.__QCM_VISUAL_SNAP__ = snap;
    window.__QCM_START_VISUAL_SAMPLER__ = () => {
      window.__QCM_VISUAL_TRACE__.push(snap('before-click'));
      const start = performance.now();
      const id = setInterval(() => {
        window.__QCM_VISUAL_TRACE__.push(snap('sample'));
        if (performance.now() - start > 4200) clearInterval(id);
      }, 25);
    };
  });
}

async function collectActiveSamples(page, labelPrefix, samples = 28, intervalMs = 50) {
  const rows = [];
  for (let i = 0; i < samples; i += 1) {
    rows.push(await page.evaluate((label) => window.__QCM_VISUAL_SNAP__(label), `${labelPrefix}-${i}`));
    await page.waitForTimeout(intervalMs);
  }
  return rows;
}

function compactTrace(rows) {
  return JSON.stringify(rows.map((r) => ({
    label: r.label,
    cardId: r.cardId,
    counter: r.counter,
    scrollY: r.scrollY,
    bodyTop: r.bodyTop,
    viewportLock: r.viewportLock,
    cardTop: r.cardTop,
    cardHeight: r.cardHeight,
    promptText: r.promptText,
    buttonCount: r.buttonCount,
    listEmpty: r.listEmpty,
    quickHeaderVisible: r.quickHeaderVisible,
    pageHeroVisible: r.pageHeroVisible,
  })).slice(0, 180));
}

function visualSignature(row) {
  return [
    row.cardId,
    row.counter,
    row.promptText,
    row.buttonCount,
    Math.round((row.cardTop || 0) / 4) * 4,
    Math.round((row.cardHeight || 0) / 4) * 4,
  ].join('|');
}

function cardSequence(rows, firstId, finalId) {
  const seq = [firstId];
  for (const row of rows) {
    if (!row.cardId) continue;
    if (row.cardId === firstId && seq.length === 1) continue;
    if (seq[seq.length - 1] !== row.cardId) seq.push(row.cardId);
  }
  if (seq[seq.length - 1] !== finalId) seq.push(finalId);
  return seq;
}

test.describe('QCM transition stability', () => {
  test('one real Next tap causes exactly one visually stable transition and no late repaint', async ({ page }) => {
    await openFreshQcm(page);
    await installVisualSampler(page);

    const firstId = await currentQuestionIdentity(page);
    const firstCounter = await currentQuestionCounter(page);
    const next = page.locator('.single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 10000 });
    await expect(next).toBeEnabled({ timeout: 10000 });
    await next.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    const scrollBefore = await page.evaluate(() => Math.round(scrollY));

    await page.evaluate(() => window.__QCM_START_VISUAL_SAMPLER__());
    await next.click({ force: true });
    await expect.poll(async () => currentQuestionIdentity(page), { timeout: 15000 }).not.toBe(firstId);
    await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('2/20');

    const finalId = await currentQuestionIdentity(page);
    const finalCounter = await currentQuestionCounter(page);
    const duringRows = await page.evaluate(() => window.__QCM_VISUAL_TRACE__ || []);

    await expect.poll(async () => page.evaluate(() => document.body.classList.contains('practice-viewport-locked')), { timeout: 8000 }).toBe(false);
    const postUnlockRows = await collectActiveSamples(page, 'post-unlock');
    const allRows = [...duringRows, ...postUnlockRows];
    const summary = compactTrace(allRows);

    expect(firstCounter).toBe('1/20');
    expect(finalCounter).toBe('2/20');
    expect(finalId).not.toBe(firstId);

    const sequence = cardSequence(allRows, firstId, finalId);
    expect(sequence, `QCM card sequence must be first -> final only. Trace=${summary}`).toEqual([firstId, finalId]);

    const counters = [...new Set(allRows.map((r) => r.counter).filter(Boolean))];
    expect(counters.filter((v) => !['1/20', '2/20'].includes(v)), `counter must not jump. Trace=${summary}`).toEqual([]);

    expect(allRows.filter((r) => r.listEmpty), `#practiceList must never be empty. Trace=${summary}`).toEqual([]);
    expect(allRows.filter((r) => r.quickHeaderVisible || r.pageHeroVisible), `QCM hero/header must not flash. Trace=${summary}`).toEqual([]);

    const lockedRows = allRows.filter((r) => r.viewportLock);
    expect(lockedRows.length, `viewport lock must be active during QCM rerender. Trace=${summary}`).toBeGreaterThan(2);

    const unlockedRows = allRows.filter((r) => !r.viewportLock);
    const maxUnlockedScrollDelta = Math.max(...unlockedRows.map((r) => Math.abs(r.scrollY - scrollBefore)), 0);
    expect(maxUnlockedScrollDelta, `scroll must return to the exact pre-click position after transition. Trace=${summary}`).toBeLessThanOrEqual(12);

    const finalRows = postUnlockRows.filter((r) => r.cardId === finalId).slice(2);
    expect(finalRows.length, `final question must be sampled after unlock. Trace=${summary}`).toBeGreaterThan(10);
    expect([...new Set(finalRows.map(visualSignature))], `final question must not mutate after unlock. Trace=${summary}`).toHaveLength(1);
  });
});
