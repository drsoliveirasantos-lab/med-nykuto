const { test, expect } = require('@playwright/test');
const { routeCurrentClassPublic } = require('./helpers/current-class-public-fixture');
const guidedContent = require('../content/class/s4-guided-respiratory-cases.json');

const ASTHMA_CASE = guidedContent.cases.find((item) => item.id === 's4-fisio-resp-asma-04');
const GUIDED_URL = `/clase.html?caseMode=guided&guidedScope=fisiologia-respiratorio-p1&guidedCase=${encodeURIComponent(ASTHMA_CASE.id)}#fisiologia-2026-08-13`;

async function expectTapTarget(locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(48);
  expect(box.height).toBeGreaterThanOrEqual(48);
}

async function expectNoHorizontalOverflow(page, dialog, scroller) {
  const overflow = await page.evaluate(({ dialogSelector, scrollerSelector }) => {
    const dialogNode = document.querySelector(dialogSelector);
    const scrollerNode = document.querySelector(scrollerSelector);
    return {
      root: document.documentElement.scrollWidth - window.innerWidth,
      body: document.body.scrollWidth - window.innerWidth,
      dialog: dialogNode.scrollWidth - dialogNode.clientWidth,
      scroller: scrollerNode.scrollWidth - scrollerNode.clientWidth
    };
  }, {
    dialogSelector: '[data-guided-cases-dialog]',
    scrollerSelector: '[data-guided-dialog-scroll]'
  });
  expect(overflow.root).toBeLessThanOrEqual(1);
  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.dialog).toBeLessThanOrEqual(1);
  expect(overflow.scroller).toBeLessThanOrEqual(1);
  await expect(dialog).toBeVisible();
  await expect(scroller).toBeVisible();
}

test.describe('S4 guided cases on a 375 px mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.clock.install({ time: new Date('2026-08-30T12:00:00-03:00') });
    await routeCurrentClassPublic(page);
  });

  test('keeps one question, consultable context and deliberate one-step taps in the full-screen dialog', async ({ page }) => {
    await page.goto(GUIDED_URL, { waitUntil: 'domcontentloaded' });
    const dialog = page.locator('[data-guided-cases-dialog]');
    const scroller = dialog.locator('[data-guided-dialog-scroll]');
    const close = dialog.locator('[data-guided-cases-close]');
    const context = dialog.locator('[data-guided-case-context]');
    const contextToggle = context.locator('[data-guided-context-toggle]');

    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('[data-guided-question]')).toHaveCount(1);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 1 de 4');
    const layout = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const scroll = node.querySelector('[data-guided-dialog-scroll]');
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollerOverflowY: getComputedStyle(scroll).overflowY,
        scrollerCanScroll: scroll.scrollHeight > scroll.clientHeight,
        bodyPosition: getComputedStyle(document.body).position,
        rootOverflow: getComputedStyle(document.documentElement).overflow
      };
    });
    expect(layout.top).toBeCloseTo(0, 0);
    expect(layout.left).toBeCloseTo(0, 0);
    expect(layout.width).toBeCloseTo(layout.viewportWidth, 0);
    expect(layout.height).toBeCloseTo(layout.viewportHeight, 0);
    expect(layout.scrollerOverflowY).toBe('auto');
    expect(layout.scrollerCanScroll).toBe(true);
    expect(layout.bodyPosition).toBe('fixed');
    expect(layout.rootOverflow).toBe('hidden');
    await expectNoHorizontalOverflow(page, dialog, scroller);

    const firstQuestion = ASTHMA_CASE.questions[0];
    const distractorIndex = (firstQuestion.answerIndex + 1) % firstQuestion.options.length;
    const option = dialog.locator(`[data-guided-option-index="${distractorIndex}"]`);
    await expectTapTarget(close);
    await expectTapTarget(contextToggle);
    await expectTapTarget(option);

    await expect(context).toHaveAttribute('open', '');
    await contextToggle.click();
    await expect(context).not.toHaveAttribute('open', '');
    const scrolled = await scroller.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
      return node.scrollTop;
    });
    expect(scrolled).toBeGreaterThan(0);
    await expect(contextToggle).toBeInViewport();
    await contextToggle.click();
    await expect(context).toHaveAttribute('open', '');
    const vef1Row = ASTHMA_CASE.data.find((row) => /^VEF(?:1|₁)(?!\/)/i.test(row.label));
    await expect(context.locator('[data-guided-case-data]')).toContainText(vef1Row.label);
    await expect(context.locator('[data-guided-case-data]')).toContainText(String(vef1Row.value));

    const heading = dialog.locator('#s4GuidedQuestionTitle');
    const promptBeforeAnswer = await heading.textContent();
    await option.scrollIntoViewIfNeeded();
    await option.click();
    await expect(dialog.locator('[data-guided-feedback]')).toBeVisible();
    await expect(dialog.locator('[data-guided-question]')).toHaveCount(1);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 1 de 4');
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(promptBeforeAnswer);
    await expectNoHorizontalOverflow(page, dialog, scroller);

    const next = dialog.locator('[data-guided-next]');
    await expectTapTarget(next);
    await next.scrollIntoViewIfNeeded();
    await expect(next).toBeInViewport();
    const nextBox = await next.boundingBox();
    const tapX = nextBox.x + nextBox.width / 2;
    const tapY = nextBox.y + nextBox.height / 2;

    // Use Locator.tap for the deliberate first action so WebKit always emits
    // the complete touch/click sequence. The second raw tap deliberately reuses
    // the old coordinates to exercise the stale-double-tap guard.
    await next.tap();
    await expect(dialog.locator('[data-guided-option-index]:disabled')).toHaveCount(4);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 2 de 4');
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(ASTHMA_CASE.questions[1].prompt);
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toBeFocused();
    await page.touchscreen.tap(tapX, tapY);
    await page.clock.runFor(500);

    await expect(dialog.locator('[data-guided-question]')).toHaveCount(1);
    await expect(dialog.locator('[data-guided-question-index]')).toHaveText('Paso 2 de 4');
    await expect(dialog.locator('#s4GuidedQuestionTitle')).toHaveText(ASTHMA_CASE.questions[1].prompt);
    await expect(dialog.locator('[data-guided-feedback]')).toHaveCount(0);
    await expect(dialog.locator('[data-guided-option-index]:not(:disabled)')).toHaveCount(4);
    await expectNoHorizontalOverflow(page, dialog, scroller);
  });
});