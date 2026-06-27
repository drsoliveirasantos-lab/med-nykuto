const { test, expect } = require('@playwright/test');

function isCritical(message) {
  return /TypeError|ReferenceError|SyntaxError|Cannot read|is not defined|is not a function|Unhandled|Application error/i.test(message);
}

async function openAndAnswer(page, url) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && isCritical(message.text())) errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response?.status() || 0).toBeLessThan(400);
  await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 25000 });
  const option = page.locator('#practiceList .single-question-card button.option[data-option]').first();
  await expect(option).toBeVisible({ timeout: 15000 });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
  await expect(page.locator('#practiceList .single-question-card .answer-panel:not([hidden]), #practiceList .single-question-card .ppc-card').first()).toBeVisible({ timeout: 15000 });
  expect(errors).toEqual([]);
}

test('critical practice flows work on this browser engine', async ({ page }) => {
  await openAndAnswer(page, '/qcm.html?course=fisiologia');
  await openAndAnswer(page, '/cas-cliniques.html?course=fisiologia');
  await openAndAnswer(page, '/vrai-faux.html?course=fisiologia');
});

test('core navigation opens without blank pages on this browser engine', async ({ page }) => {
  for (const url of ['/index.html', '/matieres.html', '/modules.html', '/contact.html']) {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(response?.status() || 0, `${url} should not return HTTP error`).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    const text = await page.locator('body').innerText();
    expect(text.trim().length, `${url} should not be blank`).toBeGreaterThan(80);
    expect(text).not.toMatch(/undefined|null|Application error|Cannot read/i);
  }
});
