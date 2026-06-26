const { test, expect } = require('@playwright/test');

const CURRENT_PRACTICE_LOADER = 'v364';
const CURRENT_NEXT_STABILITY = 'v372-native-sticky-next-no-reload';
const CURRENT_NEXT_VISIBILITY = 'v385-native-next-no-late-repaint';
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

async function currentVisualSnapshot(page, label = 'sample') {
  return page.evaluate((snapshotLabel) => {
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const isVisibleInViewport = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    };
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
    const card = document.querySelector('.single-question-card');
    const prompt = card && card.querySelector('.question-prompt, .structured-prompt, h2, h3');
    const list = document.querySelector('#practiceList');
    const quickHeader = document.querySelector('.practice-quick-header');
    const pageHero = document.querySelector('.page-hero');
    const unknown = card && card.querySelector('.unknown-action-wrap:not([hidden]), [data-action="dont-know"]');
    const answer = card && card.querySelector('.answer-panel:not([hidden])');
    const rect = card ? card.getBoundingClientRect() : { top: 0, height: 0, bottom: 0 };
    const cardId = card ? (card.id ? `id:${card.id}` : `text:${clean(prompt?.textContent)}`) : '';
    return {
      t: performance.now(),
      label: snapshotLabel,
      cardId,
      counter: readCounter(),
      scrollY: Math.round(scrollY),
      cardTop: Math.round(rect.top),
      cardHeight: Math.round(rect.height),
      cardBottom: Math.round(rect.bottom),
      promptText: clean(prompt && prompt.textContent),
      cardText: clean(card && card.textContent).slice(0, 900),
      buttonCount: card ? card.querySelectorAll('button').length : 0,
      unknownVisible: isVisibleInViewport(unknown),
      answerVisible: isVisibleInViewport(answer),
      listEmpty: !list || !list.querySelector('.single-question-card'),
      quickHeaderVisible: isVisibleInViewport(quickHeader),
      pageHeroVisible: isVisibleInViewport(pageHero),
      nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null,
    };
  }, label);
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

    const snap = (label) => {
      try {
        const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
        const isVisibleInViewport = (el) => {
          if (!el) return false;
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
        };
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
        const list = document.querySelector('#practiceList');
        const card = document.querySelector('.single-question-card');
        const prompt = card && card.querySelector('.question-prompt, .structured-prompt, h2, h3');
        const quickHeader = document.querySelector('.practice-quick-header');
        const pageHero = document.querySelector('.page-hero');
        const rect = card ? card.getBoundingClientRect() : { top: 0, height: 0, bottom: 0 };
        const cardId = card ? (card.id ? `id:${card.id}` : `text:${clean(prompt?.textContent)}`) : '';
        window.__QCM_TRANSITION_PROBE__.push({
          t: performance.now(),
          label,
          cardId,
          counter: readCounter(),
          scrollY: Math.round(scrollY),
          cardTop: Math.round(rect.top),
          cardHeight: Math.round(rect.height),
          promptText: clean(prompt && prompt.textContent),
          buttonCount: card ? card.querySelectorAll('button').length : 0,
          listEmpty: !list || !list.querySelector('.single-question-card'),
          quickHeaderVisible: isVisibleInViewport(quickHeader),
          pageHeroVisible: isVisibleInViewport(pageHero),
          nextVisibility: window.__MED_NYKUTO_NEXT_VISIBILITY__ || null,
        });
      } catch (e) {
        window.__QCM_TRANSITION_PROBE__.push({ t: performance.now(), label, error: String(e && e.message || e) });
      }
    };

    window.__QCM_TRANSITION_SNAP__ = snap;
    const list = document.querySelector('#practiceList') || document.body;
    new MutationObserver(() => snap('mutation')).observe(list, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'class', 'style'] });
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

async function sampleTransition(page) {
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    if (typeof window.__QCM_TRANSITION_SNAP__ === 'function') window.__QCM_TRANSITION_SNAP__('after-transition-observer-window');
  });
  return page.evaluate(() => {
    const rows = window.__QCM_TRANSITION_PROBE__ || [];
    const startLabel = window.__QCM_TRANSITION_START_LABEL__ || '';
    const startIndex = rows.findIndex((row) => row.label === startLabel);
    return startIndex >= 0 ? rows.slice(startIndex) : rows;
  });
}

async function collectFinalVisualSamples(page, finalId, samples = 28, intervalMs = 50) {
  const rows = [];
  for (let i = 0; i < samples; i += 1) {
    const row = await currentVisualSnapshot(page, `final-stability-${i}`);
    rows.push(row);
    if (row.cardId !== finalId) break;
    await page.waitForTimeout(intervalMs);
  }
  return rows;
}

function compactTrace(trace) {
  return trace.map((row) => ({
    label: row.label,
    cardId: row.cardId,
    counter: row.counter,
    scrollY: row.scrollY,
    cardTop: row.cardTop,
    cardHeight: row.cardHeight,
    promptText: row.promptText,
    buttonCount: row.buttonCount,
    unknownVisible: row.unknownVisible,
    answerVisible: row.answerVisible,
    listEmpty: row.listEmpty,
    quickHeaderVisible: row.quickHeaderVisible,
    pageHeroVisible: row.pageHeroVisible,
    error: row.error,
  })).slice(0, 120);
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

function stableVisualSignature(row) {
  return [
    row.cardId,
    row.counter,
    row.promptText,
    row.buttonCount,
    row.unknownVisible ? 'unknown' : 'no-unknown',
    row.answerVisible ? 'answer' : 'no-answer',
    Math.round((row.cardTop || 0) / 4) * 4,
    Math.round((row.cardHeight || 0) / 4) * 4,
  ].join('|');
}

test.describe('QCM transition stability', () => {
  test('one real Next tap causes exactly one visually stable transition and no late repaint', async ({ page }) => {
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

    const finalId = await currentQuestionIdentity(page);
    const finalCounter = await currentQuestionCounter(page);
    const finalSamples = await collectFinalVisualSamples(page, finalId);
    const trace = await sampleTransition(page);
    const sequence = idSequenceAfterInitial(trace, firstId, finalId);
    const traceSummary = JSON.stringify(compactTrace([...trace, ...finalSamples]));

    expect(firstCounter, 'known initial counter').toBe('1/20');
    expect(finalCounter, 'known final counter').toBe('2/20');
    expect(finalId, 'one tap must land on one new question').not.toBe(firstId);
    expect(sequence, `QCM card id sequence must be first -> final only. Trace=${traceSummary}`).toEqual([firstId, finalId]);

    const allRows = [...trace, ...finalSamples];
    const sampledCounters = [...new Set(allRows.map((row) => row.counter).filter(Boolean))];
    const unexpectedCounters = sampledCounters.filter((value) => ![firstCounter, finalCounter].includes(value));
    expect(unexpectedCounters, `counter must not jump past ${finalCounter}. Trace=${traceSummary}`).toEqual([]);

    const badBlankFrames = allRows.filter((row) => row.listEmpty);
    expect(badBlankFrames, `#practiceList must never be empty after Next. Trace=${traceSummary}`).toEqual([]);

    const heroFrames = allRows.filter((row) => row.quickHeaderVisible || row.pageHeroVisible);
    expect(heroFrames, `QCM hero/header must not flash during transition. Trace=${traceSummary}`).toEqual([]);

    const maxScrollDelta = Math.max(...allRows.map((row) => Math.abs(row.scrollY - scrollBefore)), 0);
    expect(maxScrollDelta, `scroll must not jump after the question already changed. Trace=${traceSummary}`).toBeLessThanOrEqual(12);

    expect(finalSamples.length, `final question must be actively sampled repeatedly. Trace=${traceSummary}`).toBeGreaterThan(20);
    expect(finalSamples.every((row) => row.cardId === finalId), `final question must not be replaced again. Trace=${traceSummary}`).toBe(true);
    const stableRows = finalSamples.slice(4);
    const visualSignatures = [...new Set(stableRows.map(stableVisualSignature))];
    expect(visualSignatures, `final question must not repaint/mutate after it first appears. Trace=${traceSummary}`).toHaveLength(1);
  });
});
