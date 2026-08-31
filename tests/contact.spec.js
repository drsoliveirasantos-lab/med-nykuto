const { test, expect } = require('@playwright/test');

async function fillRequest(page, overrides = {}) {
  await page.selectOption('select[name="role"]', overrides.role || 'student');
  await page.selectOption('select[name="category"]', overrides.category || 'bug');
  await page.selectOption('select[name="location"]', overrides.location || 'general');
  if (overrides.subject) await page.fill('input[name="subject"]', overrides.subject);
  if (overrides.name) await page.fill('input[name="name"]', overrides.name);
  if (overrides.replyContact) await page.fill('input[name="replyContact"]', overrides.replyContact);
  await page.fill('textarea[name="message"]', overrides.message || 'Necesito ayuda con este problema de la plataforma.');
}

async function openContact(page) {
  await page.goto('/contact.html');
  await expect(page.locator('[data-helpdesk-form][data-helpdesk-ready="true"]')).toBeVisible();
}

test.describe('Med Nykuto Help Desk', () => {
  test('requires an actionable name and valid reply contact for both delegate flows', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/help-desk', async (route) => {
      requestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, reference: 'HD-ABCD-EFGH-JKLM', supportWhatsapp: '' })
      });
    });

    await openContact(page);
    const name = page.locator('input[name="name"]');
    const reply = page.locator('input[name="replyContact"]');

    await page.selectOption('select[name="role"]', 'future-delegate');
    await expect(name).toHaveAttribute('required', '');
    await expect(reply).toHaveAttribute('required', '');
    await expect(page.locator('[data-helpdesk-name-requirement]')).toContainText('Obligatorio');

    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="category"]', 'delegate-access');
    await expect(name).toHaveAttribute('required', '');
    await expect(reply).toHaveAttribute('required', '');

    await page.selectOption('select[name="location"]', 'delegate-panel');
    await page.fill('textarea[name="message"]', 'Quiero solicitar acceso al panel de delegado.');
    await page.click('button[type="submit"]');
    expect(await name.evaluate((control) => control.validationMessage)).toContain('Escribe tu nombre');
    expect(requestCount).toBe(0);

    await name.fill('Futura Delegada');
    await reply.fill('contacto inválido');
    await page.click('button[type="submit"]');
    expect(await reply.evaluate((control) => control.validationMessage)).toContain('7 a 15 dígitos');
    expect(requestCount).toBe(0);

    await reply.fill('future.delegate@example.test');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-helpdesk-result]')).toBeVisible();
    expect(requestCount).toBe(1);
  });

  test('keeps WhatsApp as an explicit draft and preserves the copy action', async ({ page }) => {
    await page.route('**/api/help-desk', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, reference: 'HD-WXYZ-2345-6789', supportWhatsapp: '+595981000111' })
    }));

    await openContact(page);
    await fillRequest(page);
    await page.click('button[type="submit"]');

    const result = page.locator('[data-helpdesk-result]');
    const whatsapp = page.locator('[data-helpdesk-whatsapp]');
    await expect(result).toBeVisible();
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/595981000111\?text=/);
    await expect(page.locator('[data-helpdesk-email]')).toBeHidden();
    await expect(page.locator('[data-helpdesk-copy]')).toBeVisible();
    await expect(result).toContainText('deberás revisarlo y enviarlo tú');
    expect(await result.innerText()).not.toMatch(/WhatsApp (?:fue )?enviado/i);
  });

  test('offers an honest structured email draft when WhatsApp is unavailable', async ({ page }) => {
    await page.route('**/api/help-desk', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, reference: 'HD-MAIL-2345-6789', supportWhatsapp: '' })
    }));

    await openContact(page);
    await fillRequest(page, {
      category: 'improvement',
      subject: 'Fisiología',
      name: 'Estudiante Ejemplo',
      replyContact: 'estudiante@example.test',
      message: 'Propongo mejorar la explicación de esta materia.'
    });
    await page.click('button[type="submit"]');

    const result = page.locator('[data-helpdesk-result]');
    const email = page.locator('[data-helpdesk-email]');
    await expect(result).toBeVisible();
    await expect(email).toBeVisible();
    const href = await email.getAttribute('href');
    const draft = new URL(href);
    expect(draft.protocol).toBe('mailto:');
    expect(draft.pathname).toBe('contact@nykuto.com');
    expect(draft.searchParams.get('subject')).toContain('HD-MAIL-2345-6789');
    const body = draft.searchParams.get('body');
    expect(body).toContain('Referencia: HD-MAIL-2345-6789');
    expect(body).toContain('Categoría: Idea de mejora');
    expect(body).toContain('Materia: Fisiología');
    expect(body).toContain('Página: /contact.html');
    expect(body).toContain('Detalle:\nPropongo mejorar la explicación de esta materia.');
    await expect(page.locator('[data-helpdesk-whatsapp]')).toBeHidden();
    await expect(page.locator('[data-helpdesk-copy]')).toBeVisible();
    await expect(result).toContainText('El enlace prepara un correo');
    await expect(result).toContainText('deberás revisarlo y enviarlo tú');
    expect(await result.innerText()).not.toMatch(/(?:correo|email) (?:fue )?enviado/i);
  });
});
