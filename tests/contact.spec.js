const { test, expect } = require('@playwright/test');

test.describe('Med Nykuto contact fallback', () => {
  test('contact form does not fake-send on Cloudflare fallback', async ({ page }) => {
    await page.goto('/contact.html');
    await page.selectOption('select[name="type"]', 'technical-issue');
    await page.fill('input[name="name"]', 'Test');
    await page.fill('textarea[name="message"]', 'Test automatisé du formulaire.');
    await page.click('button[type="submit"]');
    await expect(page.locator('#contactFormFallbackV358')).toBeVisible();
    await expect(page.locator('#contactFormFallbackV358')).toContainText('Mensaje preparado');
  });
});
