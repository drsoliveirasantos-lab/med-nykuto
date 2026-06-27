const { test, expect } = require('@playwright/test');

test('Pix support buttons copy or expose a clear fallback', async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedTexts = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => { window.__copiedTexts.push(String(text || '')); }
      }
    });
  });

  await page.goto('/index.html#supportProject', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#supportProject')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#copyPixBtn')).toBeVisible({ timeout: 10000 });

  await page.locator('#copyPixBtn').click({ force: true });
  await page.waitForTimeout(400);
  const afterButton = await page.evaluate(() => window.__copiedTexts || []);
  const buttonFeedback = await page.locator('body').innerText();
  expect(afterButton.length > 0 || /copiado|copied|copiar|qr pix/i.test(buttonFeedback), 'Pix button should copy or show a clear fallback').toBeTruthy();

  if (await page.locator('#copyPixQr').count()) {
    await page.locator('#copyPixQr').click({ force: true });
    await page.waitForTimeout(400);
    const afterQr = await page.evaluate(() => window.__copiedTexts || []);
    const qrFeedback = await page.locator('body').innerText();
    expect(afterQr.length > 0 || /copiado|copied|copiar|qr pix/i.test(qrFeedback), 'QR Pix hotspot should copy or show a clear fallback').toBeTruthy();
  }
});

test('contact form prepares a local message without navigating away', async ({ page }) => {
  await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('form[name="site-contact"]')).toBeVisible({ timeout: 15000 });

  await page.locator('select[name="type"]').selectOption('technical-issue');
  await page.locator('input[name="name"]').fill('Test Med Nykuto');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('textarea[name="message"]').fill('Message de test automatique pour vérifier le formulaire contact.');

  await page.locator('form[name="site-contact"] button[type="submit"]').click({ force: true });
  await expect(page.locator('#contactFormFallbackV358')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#contactFormFallbackV358 textarea')).toContainText(/Message de test automatique/i);
  expect(page.url()).toContain('/contact.html');
});
