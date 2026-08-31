const { test, expect } = require('@playwright/test');

async function selectGuidedOption(form, name) {
  const field = form.locator(`select[name="${name}"]`);
  await expect(field).toBeVisible();
  const options = await field.locator('option').evaluateAll((nodes) => nodes
    .map((node) => ({ value: node.value, label: node.textContent.trim() }))
    .filter((option) => option.value));
  expect(options.length, `${name} should offer at least one guided choice`).toBeGreaterThan(0);
  await field.selectOption(options[0].value);
  return options[0].value;
}

async function fillHelpDeskForm(form, suffix = '') {
  const role = await selectGuidedOption(form, 'role');
  const category = await selectGuidedOption(form, 'category');
  const location = await selectGuidedOption(form, 'location');
  const values = {
    subject: `Problema de acceso${suffix}`,
    name: `Estudiante de prueba${suffix}`,
    replyContact: 'qa.helpdesk@med.test',
    message: `No puedo abrir el material de la clase desde mi teléfono${suffix}.`
  };
  for (const [name, value] of Object.entries(values)) {
    await form.locator(`[name="${name}"]`).fill(value);
  }
  return { role, category, location, ...values };
}

test('support buttons copy or expose a clear fallback', async ({ page }) => {
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
  expect(afterButton.length > 0 || /copiado|copied|copiar|qr/i.test(buttonFeedback), 'support button should copy or show a clear fallback').toBeTruthy();

  if (await page.locator('#copyPixQr').count()) {
    await page.locator('#copyPixQr').click({ force: true });
    await page.waitForTimeout(400);
    const afterQr = await page.evaluate(() => window.__copiedTexts || []);
    const qrFeedback = await page.locator('body').innerText();
    expect(afterQr.length > 0 || /copiado|copied|copiar|qr/i.test(qrFeedback), 'QR hotspot should copy or show a clear fallback').toBeTruthy();
  }
});

test('contact Help Desk sends one guided request and exposes its reference through WhatsApp', async ({ page }) => {
  const submissions = [];
  await page.route('**/api/help-desk', async (route) => {
    submissions.push(route.request().postDataJSON());
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        reference: 'HD-ABCD-EFGH-JKLM',
        supportWhatsapp: '+595981000111'
      })
    });
  });

  await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
  const form = page.locator('#helpDeskContactForm[data-helpdesk-form]');
  await expect(form).toBeVisible({ timeout: 15000 });
  const expected = await fillHelpDeskForm(form);

  await form.locator('[data-helpdesk-submit]').click();
  await expect(form.locator('[data-helpdesk-result]')).toBeVisible();
  await expect(form.locator('[data-helpdesk-result]')).toContainText(/solicitud registrada/i);
  await expect(form.locator('[data-helpdesk-reference]')).toHaveText('HD-ABCD-EFGH-JKLM');
  await expect(form.locator('[data-helpdesk-whatsapp]')).toBeVisible();
  await expect(form.locator('[data-helpdesk-whatsapp]')).toHaveAttribute('href', /wa\.me\/595981000111/);
  await expect(form.locator('[data-helpdesk-copy]')).toBeVisible();

  await page.waitForTimeout(200);
  expect(submissions).toHaveLength(1);
  expect(submissions[0]).toMatchObject({ ...expected, website: '' });
  expect(submissions[0].requestId).toMatch(/^[a-z0-9-]{16,}$/i);
  expect(submissions[0].pagePath).toContain('/contact.html');
  expect(typeof submissions[0].class).toBe('string');
  expect(submissions[0].class.length).toBeGreaterThan(0);
  const savedDrafts = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('medNykutoHelpDeskDraft:v479:')));
  expect(savedDrafts).toEqual([]);
});

test('global Help Desk modal falls back to copying the reference when WhatsApp is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    window.__copiedHelpDeskTexts = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => { window.__copiedHelpDeskTexts.push(String(text || '')); }
      }
    });
  });
  let postCount = 0;
  await page.route('**/api/help-desk', async (route) => {
    postCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, reference: 'HD-MNPQ-RSTU-VWXY', supportWhatsapp: '' })
    });
  });

  await page.goto('/clase.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#helpDeskOpen')).toBeVisible({ timeout: 15000 });
  await page.locator('#helpDeskOpen').click({ force: true });
  const dialog = page.locator('#helpDeskDialog');
  await expect(dialog).toBeVisible();
  const form = dialog.locator('#helpDeskDialogForm[data-helpdesk-form]');
  await fillHelpDeskForm(form, ' modal');
  await form.locator('[data-helpdesk-submit]').click();

  await expect(form.locator('[data-helpdesk-reference]')).toHaveText('HD-MNPQ-RSTU-VWXY');
  await expect(form.locator('[data-helpdesk-whatsapp]')).toBeHidden();
  const copy = form.locator('[data-helpdesk-copy]');
  await expect(copy).toBeVisible();
  await copy.click();
  await expect.poll(() => page.evaluate(() => (window.__copiedHelpDeskTexts || []).join('\n'))).toContain('HD-MNPQ-RSTU-VWXY');
  expect(postCount).toBe(1);

  await dialog.locator('[data-helpdesk-close]').click();
  await expect(dialog).toBeHidden();
});

test('Help Desk failure preserves an unchanged retry id and rotates it after an edit', async ({ page }) => {
  const submissions = [];
  await page.route('**/api/help-desk', async (route) => {
    submissions.push(route.request().postDataJSON());
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, code: 'database_unavailable', error: 'La solicitud no se pudo enviar ahora.' })
    });
  });

  await page.goto('/contact.html', { waitUntil: 'domcontentloaded' });
  const form = page.locator('#helpDeskContactForm[data-helpdesk-form]');
  await expect(form).toBeVisible({ timeout: 15000 });
  const expected = await fillHelpDeskForm(form, ' sin red');
  const submit = form.locator('[data-helpdesk-submit]');
  await submit.click();

  await expect(form.locator('[data-helpdesk-status]')).toBeVisible();
  await expect(form.locator('[data-helpdesk-status]')).toContainText('La solicitud no se pudo enviar ahora.');
  await expect(form.locator('[data-helpdesk-result]')).toBeHidden();
  await expect(form.locator('[name="subject"]')).toHaveValue(expected.subject);
  await expect(form.locator('[name="message"]')).toHaveValue(expected.message);
  await expect(submit).toBeEnabled();

  const draft = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((item) => item.startsWith('medNykutoHelpDeskDraft:v479:'));
    return key ? { key, value: JSON.parse(localStorage.getItem(key)) } : null;
  });
  expect(draft).not.toBeNull();
  expect(draft.value).toMatchObject({
    requestId: submissions[0].requestId,
    subject: expected.subject,
    message: expected.message
  });

  await submit.click();
  await expect.poll(() => submissions.length).toBe(2);
  expect(submissions[1].requestId).toBe(submissions[0].requestId);

  await form.locator('[name="message"]').fill(expected.message + ' con un detalle nuevo');
  await submit.click();
  await expect.poll(() => submissions.length).toBe(3);
  expect(submissions[2].requestId).not.toBe(submissions[1].requestId);
});
