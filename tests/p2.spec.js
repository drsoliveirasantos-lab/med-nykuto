const { test, expect } = require('@playwright/test');

test.describe('P2 early neurophysiology review', () => {
  test('switches to the provisional P2 scope without changing P1', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/p1.html#p2');
    await expect(page.locator('html')).toHaveClass(/p1-ready/);

    await expect(page.getByRole('heading', { name: 'Repaso P2' })).toBeVisible();
    await expect(page.locator('#p1LessonCount')).toHaveText('4');
    await expect(page.locator('#p1QuestionCount')).toHaveText('160');
    await expect(page.locator('a[data-partial-scope="p2"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#p1ScopeNotice')).toContainText(/todavía no confirmó oficialmente/i);
    await expect(page.locator('#p1TopicRankingLink')).toBeHidden();
    const activeNavigation = await page.locator('#p1BottomPartial').evaluate((active) => {
      const navigation = active.closest('.p1-bottom-nav').getBoundingClientRect();
      const item = active.getBoundingClientRect();
      return { left: item.left - navigation.left, right: navigation.right - item.right };
    });
    expect(activeNavigation.left).toBeGreaterThanOrEqual(-1);
    expect(activeNavigation.right).toBeGreaterThanOrEqual(-1);

    await page.getByRole('button', { name: /Ficha P2/ }).click();
    await page.locator('.p1-subject-card').click();
    await expect(page.locator('.p1-teacher-block')).toContainText('Sinapsis');
    await expect(page.locator('.p1-teacher-block')).toContainText('Transducción');
    await expect(page.locator('.p1-teacher-block')).not.toContainText('Respiración');
    await expect(page.locator('.p1-teacher-block')).not.toContainText('gasometría');
    await page.getByRole('button', { name: /Practicar P2/ }).click();

    const contract = await page.evaluate(() => {
      const exam = window.MedNykutoP2.buildExam({ seed: 20260828, subjectIds: ['fisiologia'], length: 40 });
      return {
        active: window.MedNykutoPartialReview.getActiveScope().label,
        p1Label: window.MedNykutoP1.scope.label,
        p2Label: window.MedNykutoP2.scope.label,
        p1Raw: window.MedNykutoP1.collectQuestions(Object.keys(window.MedNykutoP1.scope.subjects), false).length,
        p2Raw: window.MedNykutoP2.collectQuestions(['fisiologia'], false).length,
        p2Subjects: Object.keys(window.MedNykutoP2.scope.subjects),
        itemSubjects: [...new Set(exam.items.map((item) => item.subjectId))],
        storageSeparated: window.MedNykutoP1.storageKey !== window.MedNykutoP2.storageKey
      };
    });
    expect(contract).toEqual({
      active: 'P2',
      p1Label: 'P1',
      p2Label: 'P2',
      p1Raw: 720,
      p2Raw: 160,
      p2Subjects: ['fisiologia'],
      itemSubjects: ['fisiologia'],
      storageSeparated: true
    });

    await page.getByRole('button', { name: 'Empezar entrenamiento' }).click();
    await expect(page.locator('#p1PracticeDialogEyebrow')).toHaveText('PRÁCTICA P2');
    await expect(page.getByRole('dialog', { name: 'Entrenamiento en curso' })).toHaveAttribute('open', '');
    await expect(page.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 40');
    const stored = await page.evaluate(() => ({
      p1: localStorage.getItem(window.MedNykutoP1.storageKey),
      p2: localStorage.getItem(window.MedNykutoP2.storageKey)
    }));
    expect(stored.p1).toBeNull();
    expect(stored.p2).toBeTruthy();

    await page.getByRole('button', { name: 'Cerrar la práctica y continuar después' }).click();
    await expect(page.locator('#p1PracticeDialog')).not.toHaveAttribute('open', '');
    await page.locator('a[data-partial-scope="p1"]').click();
    await expect(page).toHaveURL(/p1\.html#p1$/);
    await expect(page.getByRole('heading', { name: 'Repaso P1' })).toBeVisible();
    await expect(page.locator('#p1LessonCount')).toHaveText('18');
    await expect(page.locator('#p1QuestionCount')).toHaveText('720');
    await expect(page.locator('a[data-partial-scope="p1"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#p1TopicRankingLink')).toBeVisible();
    await expect(page.locator('#p1TopicRankingLink')).toHaveAttribute('href', 'comunidade.html');
    expect(await page.evaluate(() => window.MedNykutoPartialReview.getActiveScope().label)).toBe('P1');
  });
});
