const { test, expect } = require('@playwright/test');

test.describe('Global medical glossary', () => {
  test('opens a simple definition above a difficult course term and closes accessibly', async ({ page }) => {
    await page.goto('/clase.html#fisiologia', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-detail-toggle][aria-controls="fisio-detail"]').click();
    await expect(page.locator('#fisio-detail')).toBeVisible();
    const term = page.locator('.mn-glossary-term[data-glossary-key="hypercapnia"]:visible').first();
    await expect(term).toBeVisible({ timeout: 15000 });
    await term.evaluate(node => node.scrollIntoView({ block:'center', inline:'nearest' }));
    await term.click();

    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover).toBeVisible();
    await expect(popover.locator('.mn-glossary-label')).toHaveText('DEFINICIÓN SIMPLE');
    await expect(popover.locator('.mn-glossary-title')).toHaveText(/hipercapnia/i);
    await expect(popover.locator('.mn-glossary-definition')).toHaveText('Aumento del CO₂ en la sangre.');
    await expect(term).toHaveAttribute('aria-expanded','true');

    const placement = await page.evaluate(() => {
      const trigger = document.querySelector('.mn-glossary-term[data-glossary-key="hypercapnia"][aria-expanded="true"]');
      const panel = document.getElementById('mnMedicalGlossaryPopover');
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return { placement:panel.dataset.placement, panelBottom:panelRect.bottom, triggerTop:triggerRect.top };
    });
    expect(placement.placement).toBe('above');
    expect(placement.panelBottom).toBeLessThanOrEqual(placement.triggerTop);

    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
    await expect(term).toHaveAttribute('aria-expanded','false');
  });

  test('uses the active Portuguese language without a second internet search', async ({ page }) => {
    await page.goto('/clase.html#fisiologia', { waitUntil: 'domcontentloaded' });
    await page.locator('#classLanguageSelect').selectOption('br');
    await page.locator('[data-detail-toggle][aria-controls="fisio-detail"]').click();
    await expect(page.locator('#fisio-detail')).toBeVisible();
    const term = page.locator('.mn-glossary-term[data-glossary-key="hypercapnia"]:visible').first();
    await expect(term).toBeVisible({ timeout: 15000 });
    await term.evaluate(node => node.scrollIntoView({ block:'center', inline:'nearest' }));
    await term.click();

    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover.locator('.mn-glossary-label')).toHaveText('EXPLICAÇÃO SIMPLES');
    await expect(popover.locator('.mn-glossary-definition')).toHaveText('Aumento do CO₂ no sangue.');
  });

  test('keeps a definition visible inside the Microbiology homework dialog on iPhone', async ({ page }) => {
    await page.setViewportSize({ width:390, height:844 });
    await page.goto('/clase.html#microTheoryPrepCard', { waitUntil:'domcontentloaded' });
    await page.locator('#microTheoryPrepCard [data-micro-review-open]').click();
    const dialog = page.locator('#microHomeworkReview');
    await expect(dialog).toBeVisible();

    const term = dialog.locator('.mn-glossary-term[data-glossary-key="keratin"]:visible').first();
    await expect(term).toBeVisible({ timeout:15000 });
    await term.click();

    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover).toBeVisible();
    await expect(popover.locator('.mn-glossary-definition')).toContainText('piel superficial');
    const placement = await page.evaluate(() => {
      const panel = document.getElementById('mnMedicalGlossaryPopover');
      const rect = panel.getBoundingClientRect();
      return {
        dialog:panel.closest('dialog') && panel.closest('dialog').id,
        left:rect.left,
        right:rect.right,
        top:rect.top,
        bottom:rect.bottom,
        width:window.innerWidth,
        height:window.innerHeight
      };
    });
    expect(placement.dialog).toBe('microHomeworkReview');
    expect(placement.left).toBeGreaterThanOrEqual(0);
    expect(placement.right).toBeLessThanOrEqual(placement.width);
    expect(placement.top).toBeGreaterThanOrEqual(0);
    expect(placement.bottom).toBeLessThanOrEqual(placement.height);
  });

  test('decorates dynamic study content but never nests controls inside QCM answers or links', async ({ page }) => {
    await page.route('**/api/community**', async route => {
      await route.fulfill({
        status:200,
        contentType:'application/json',
        body:JSON.stringify({ok:true,week:{key:'2026-08-10',start:'2026-08-10',end:'2026-08-16'},challenge:{goal:1000,points:0,questions:0,participants:0,records:0,progress:0},ranking:[],currentUser:null})
      });
    });
    await page.goto('/comunidade.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const fixture = document.createElement('p');
      fixture.id = 'dynamicGlossaryFixture';
      fixture.textContent = 'Hipercapnia ↑ PaCO₂.';
      document.querySelector('main').appendChild(fixture);
    });

    const fixture = page.locator('#dynamicGlossaryFixture');
    await expect(fixture.locator('.mn-glossary-term')).toHaveCount(3);
    await expect(fixture.locator('[data-glossary-key="increase"]')).toHaveText('↑');
    await expect(fixture.locator('[data-glossary-key="paco2"]')).toHaveText('PaCO₂');
    await expect(page.locator('button .mn-glossary-term')).toHaveCount(0);
    await expect(page.locator('a .mn-glossary-term')).toHaveCount(0);
  });
});
