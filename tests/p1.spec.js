const { test, expect } = require('@playwright/test');

test.describe('P1 cumulative review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/p1.html');
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
  });

  test('shows a compact cumulative sheet for all six subjects', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Repaso P1' })).toBeVisible();
    await expect(page.locator('#p1LessonCount')).toHaveText('18');
    await expect(page.locator('#p1QuestionCount')).toHaveText('720');
    await expect(page.locator('.p1-subject-card')).toHaveCount(6);
    await expect(page.locator('.p1-bottom-nav a')).toHaveCount(7);

    await page.getByRole('button', { name: /Nutrición/ }).first().click();
    await expect(page.getByRole('heading', { name: 'Nutrición · P1' })).toBeVisible();
    await expect(page.locator('.p1-lesson')).toHaveCount(1);
    await expect(page.getByText('La forma exacta del examen todavía no fue observada.')).toBeVisible();
    await expect(page.getByRole('link', { name: /Introducción al estudio nutricional/ })).toHaveAttribute('href', /drive\.google\.com/);
  });

  test('builds a reproducible balanced exam after removing overlaps', async ({ page }) => {
    const audit = await page.evaluate(() => {
      const subjects = Object.keys(window.MedNykutoP1.scope.subjects);
      const first = window.MedNykutoP1.buildExam({ seed: 20260827, subjectIds: subjects, length: 40 });
      const second = window.MedNykutoP1.buildExam({ seed: 20260827, subjectIds: subjects, length: 40 });
      return {
        firstIds: first.items.map((item) => item.id),
        secondIds: second.items.map((item) => item.id),
        options: first.items.map((item) => item.options.map((option) => option.text)),
        secondOptions: second.items.map((item) => item.options.map((option) => option.text)),
        types: first.items.reduce((counts, item) => ({ ...counts, [item.type]: (counts[item.type] || 0) + 1 }), {}),
        subjects: [...new Set(first.items.map((item) => item.subjectId))],
        uniqueIds: new Set(first.items.map((item) => item.id)).size,
        deduplication: first.deduplication
      };
    });
    expect(audit.firstIds).toEqual(audit.secondIds);
    expect(audit.options).toEqual(audit.secondOptions);
    expect(audit.types).toEqual({ qcm: 20, vf: 10, cases: 10 });
    expect(audit.subjects).toHaveLength(6);
    expect(audit.uniqueIds).toBe(40);
    expect(audit.deduplication.raw).toBe(720);
    expect(audit.deduplication.removed).toBeGreaterThan(0);
  });

  test('hides correction until completion and resumes the same attempt', async ({ page }) => {
    let communityPosts = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/community')) communityPosts += 1;
    });
    await page.getByRole('button', { name: /Examen blanco/ }).click();
    await page.getByRole('button', { name: 'Empezar simulacro' }).click();
    await expect(page.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 40');
    await expect(page.locator('.p1-review-body')).toHaveCount(0);
    await expect(page.locator('#p1Question')).not.toContainText('Por qué:');

    const firstId = await page.evaluate(() => window.MedNykutoP1.getSession().items[0].id);
    await page.locator('.p1-option').first().click();
    await page.getByRole('button', { name: 'Salir y continuar después' }).click();
    await expect(page.locator('#p1Resume')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    await page.getByRole('button', { name: /Examen blanco/ }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    expect(await page.evaluate(() => window.MedNykutoP1.getSession().items[0].id)).toBe(firstId);

    await page.evaluate(() => {
      const session = window.MedNykutoP1.getSession();
      session.items.forEach((item) => { session.answers[item.id] = 0; });
      localStorage.setItem(window.MedNykutoP1.storageKey, JSON.stringify(session));
    });
    await page.reload();
    await page.getByRole('button', { name: /Examen blanco/ }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('button', { name: 'Ver resultado' })).toBeEnabled();
    await page.getByRole('button', { name: 'Ver resultado' }).click();
    await expect(page.getByText('RESULTADO DEL SIMULACRO')).toBeVisible();
    await expect(page.locator('.p1-review-body').first()).toBeHidden();
    expect(communityPosts).toBe(0);
  });

  test('fits narrow iPhone widths without document overflow', async ({ page }) => {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/p1-ready/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.locator('.p1-view-switch')).toBeVisible();
    }
  });
});
