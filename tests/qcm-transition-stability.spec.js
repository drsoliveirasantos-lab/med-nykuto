const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_NEXT_VISIBILITY = 'v384-native-next-locked-transition-scroll-render';
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
    if (card.id) return `id:${card.id}`;
    const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    return `text:${(prompt?.textContent || '').replace(/\s+/g, ' ').trim()}`;
  });
}

async function currentQuestionCounter(page) {
  return page.evaluate(() => {
    try {
      if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__();
    } catch (e) {}
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
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForWindowFlag(page, '__MED_NYKUTO_RUNTIME_GUARD__', 'v361');
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_LOADER__', CURRENT_PRACTICE_LOADER);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_NEXT_STABILITY__', CURRENT_NEXT_STABILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_NEXT_VISIBILITY__', CURRENT_NEXT_VISIBILITY);
  await waitForWindowFlag(page, '__MED_NYKUTO_PRACTICE_PROGRESS_FIX__', CURRENT_PROGRESS_FIX);
  await expect(page.locator('.single-question-card').first()).toBeVisible({ timeout: 15000 });
  await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('1/20');
}

async function installTransitionProbe(page) {
  await page.evaluate(() => {
    window.__QCM_TRANSITION_PROBE__ = [];
    window.__QCM_TRANSITION_START_LABEL__ = '';

    const readCounter = () => {
      try {
        if (typeof window.__MED_NYKUTO_SYNC_PROGRESS__ === 'function') window.__MED_NYKUTO_SYNC_PROGRESS__();
      } catch (e) {}
      const nodes = Array.from(document.querySelectorAll('.premium-progress strong, .question-count-stat strong, .single-question-card .quiz-head .badge'));
      for (const node of nodes) {
        const match = String(node.textContent || '').match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
        if (match) return `${match[1]}/${match[2]}`;
      }
      return '';
    };

    const readCardIdentity = () => {
      const card = document.querySelector('.single-question-card');
      if (!card) return '';
      if (card.id) return `id:${card.id}`;
      const prompt = card.querySelector('.question-prompt, .structured-prompt, h2, h3');
      return `text:${(prompt?.textContent || '').replace(/\s+/g, ' ').trim()}`;
    };

    const isVisibleInViewport = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    };

    const snap = (label) => {
      const list = document.querySelector('#practiceList');
      const quickHeader = document.querySelector('.practice-quick-header');
      const pageHero = document.querySelector('.page-hero');
      window.__QCM_TRANSITION_PROBE__.push({
        t: performance.now(),
        label,
        cardId: readCardIdentity(),
        counter: readCounter(),
        scrollY: Math.round(scrollY),
        listEmpty: !list || !list.querySelector('.single-question-card'),
        quickHeaderVisible: isVisibleInViewport(quickHeader),
        pageHeroVisible: isVisibleInViewport(pageHero),
        nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null,
      });
    };

    window.__QCM_TRANSITION_SNAP__ = snap;
    const list = document.querySelector('#practiceList') || document.body;
    new MutationObserver(() => snap('mutation')).observe(list, { childList: true, subtree: true, characterData: true });
    addEventListener('scroll', () => snap('scroll'), { passive: true });
    snap('initial');
  });
}

async function startProbeClickWindow(page) {
  await page.evaluate(() => {
    window.__QCM_TRANSITION_START_LABEL__ = `before-click-${Date.now()}-${Math.random()}`;
    if (typeof window.__QCM_TRANSITION_SNAP__ === 'function') {
      window.__QCM_TRANSITION_SNAP__(window.__QCM_TRANSITION_START_LABEL__);
    }
  });
}

async function sampleTransition(page, samples = 32, intervalMs = 50) {
  for (let i = 0; i < samples; i += 1) {
    await page.waitForTimeout(intervalMs);
    await page.evaluate((label) => {
      if (typeof window.__QCM_TRANSITION_SNAP__ === 'function') window.__QCM_TRANSITION_SNAP__(label);
    }, `sample-${i}`);
  }
  return page.evaluate(() => {
    const rows = window.__QCM_TRANSITION_PROBE__ || [];
    const startLabel = window.__QCM_TRANSITION_START_LABEL__ || '';
    const startIndex = rows.findIndex((row) => row.label === startLabel);
    return startIndex >= 0 ? rows.slice(startIndex) : rows;
  });
}

function compactTrace(trace) {
  return trace.map((row) => ({
    label: row.label,
    cardId: row.cardId,
    counter: row.counter,
    scrollY: row.scrollY,
    listEmpty: row.listEmpty,
    quickHeaderVisible: row.quickHeaderVisible,
    pageHeroVisible: row.pageHeroVisible,
  })).slice(0, 80);
}

function idSequenceAfterInitial(trace, initialId, finalId) {
  const seq = [initialId];
  for (const row of trace) {
    if (!row.cardId) continue;
    if (row.cardId === initialId && seq.length === 1) continue;
    if (seq[seq.length - 1] !== row.cardId) seq.push(row.cardId);
  }
  if (seq[seq.length - 1] !== finalId) seq.push(finalId);
  return seq;
}

test.describe('QCM transition stability', () => {
  test('one real Next tap causes exactly one question transition and no blank/hero frame', async ({ page }) => {
    await openFreshQcm(page);
    await installTransitionProbe(page);

    const firstId = await currentQuestionIdentity(page);
    const firstCounter = await currentQuestionCounter(page);
    const scrollBefore = await page.evaluate(() => Math.round(scrollY));

    const next = page.locator('.single-question-card [data-action="next-question"]').first();
    await expect(next).toBeVisible({ timeout: 10000 });
    await expect(next).toBeEnabled({ timeout: 10000 });

    await startProbeClickWindow(page);
    await next.click({ force: true });

    await expect.poll(async () => currentQuestionIdentity(page), { timeout: 15000 }).not.toBe(firstId);
    await expect.poll(async () => currentQuestionCounter(page), { timeout: 15000 }).toBe('2/20');

    const trace = await sampleTransition(page);
    const finalId = await currentQuestionIdentity(page);
    const finalCounter = await currentQuestionCounter(page);
    const sequence = idSequenceAfterInitial(trace, firstId, finalId);
    const traceSummary = JSON.stringify(compactTrace(trace));

    expect(firstCounter, 'known initial counter').toBe('1/20');
    expect(finalCounter, 'known final counter').toBe('2/20');
    expect(finalId, 'one tap must land on one new question').not.toBe(firstId);
    expect(sequence, `QCM card id sequence must be first -> final only. Trace=${traceSummary}`).toEqual([firstId, finalId]);

    const sampledCounters = [...new Set(trace.map((row) => row.counter).filter(Boolean))];
    const unexpectedCounters = sampledCounters.filter((value) => ![firstCounter, finalCounter].includes(value));
    expect(unexpectedCounters, `counter must not jump past ${finalCounter}. Trace=${traceSummary}`).toEqual([]);

    const badBlankFrames = trace.filter((row) => row.listEmpty);
    expect(badBlankFrames, `#practiceList must never be empty after Next. Trace=${traceSummary}`).toEqual([]);

    const heroFrames = trace.filter((row) => row.quickHeaderVisible || row.pageHeroVisible);
    expect(heroFrames, `QCM hero/header must not flash during transition. Trace=${traceSummary}`).toEqual([]);

    const maxScrollDelta = Math.max(...trace.map((row) => Math.abs(row.scrollY - scrollBefore)), 0);
    expect(maxScrollDelta, `scroll must not jump after the question already changed. Trace=${traceSummary}`).toBeLessThanOrEqual(12);
  });
});
