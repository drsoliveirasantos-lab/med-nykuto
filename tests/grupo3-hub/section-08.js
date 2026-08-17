module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('keeps the nutrition evaluation steps compact on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#nutricion');
    await page.locator('#nutricion [data-detail-toggle]').click();

    const nutritionLayout = await page.evaluate(() => {
      const panel = document.querySelector('#nutricion .nutrition-core').getBoundingClientRect();
      const steps = [...document.querySelectorAll('#nutricion .nutrition-core li')].map((step) => step.getBoundingClientRect());
      return {
        panelHeight: panel.height,
        stepHeights: steps.map((step) => step.height),
        firstTwoShareRow: Math.abs(steps[0].top - steps[1].top) < 1,
        fifthStepSpansRow: steps[4].width > steps[0].width * 1.8,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(nutritionLayout.panelHeight).toBeLessThan(390);
    expect(Math.max(...nutritionLayout.stepHeights)).toBeLessThanOrEqual(72);
    expect(nutritionLayout.firstTwoShareRow).toBe(true);
    expect(nutritionLayout.fifthStepSpansRow).toBe(true);
    expect(nutritionLayout.scrollWidth).toBeLessThanOrEqual(nutritionLayout.clientWidth + 1);
  });

  test('shows current homework as compact tactile rows', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('[data-current-assignment]')).toHaveCount(5);
    await expect(page.locator('.pending-grid > .assignment-featured')).toHaveCount(1);
    await expect(page.locator('.pending-grid > .assignment-compact')).toHaveCount(4);
    await expect(page.locator('.assignment-compact .assignment-pictogram svg')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Estudiar las tiñas y tres micosis subcutáneas' })).toBeVisible();
    await expect(page.getByText('Preparar tiñas y tres micosis subcutáneas', { exact: true })).toHaveCount(0);

    const microTheory = page.locator('#microTheoryPrepCard');
    const bio = page.locator('#bioPrepCard');
    await expect(microTheory).not.toHaveAttribute('open', '');
    await microTheory.locator(':scope > summary').click();
    await expect(microTheory).toHaveAttribute('open', '');
    const reason = page.locator('#microTheoryPrepCard .assignment-why');
    await expect(reason).not.toHaveAttribute('open', '');
    await reason.locator('summary').click();
    await expect(reason).toHaveAttribute('open', '');
    await expect(reason.locator('p')).toContainText('La profesora pidió esta tarea');

    await bio.locator(':scope > summary').click();
    await expect(bio).toHaveAttribute('open', '');
    await expect(microTheory).not.toHaveAttribute('open', '');

    await page.goto('/clase.html#bioPrepCard');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#bioPrepCard')).toHaveAttribute('open', '');
  });

  test('opens map explanations and oral answers as small inline disclosures', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    const nutrition = page.locator('#nutricion');
    await nutrition.locator('[data-nutrition-mode="completo"]').click();
    await expect(page.locator('#nutritionPreviewEyebrow')).toHaveText('RESUMEN COMPLETO · 13 AGO. ESTIMADO');
    const mapAnswer = nutrition.locator('.study-map .preview-answer-disclosure').first();
    await expect(mapAnswer.locator('strong')).toHaveText('¿Cuánto necesita?');
    await mapAnswer.locator('summary').click();
    await expect(mapAnswer).toHaveAttribute('open', '');
    await expect(mapAnswer.locator('.preview-answer-inline')).toContainText('Comparar ingesta con gasto');
    await expect(page.locator('#studyAnswerModal')).toHaveCount(0);
    await mapAnswer.locator('summary').click();
    await expect(mapAnswer).not.toHaveAttribute('open', '');

    await nutrition.locator('[data-nutrition-mode="oral"]').click();
    const oralAnswer = nutrition.locator('.oral-list .preview-answer-disclosure').first();
    await expect(oralAnswer.locator('strong')).toContainText('diferencia entre alimentación, nutrición y dieta');
    await oralAnswer.locator('summary').click();
    await expect(oralAnswer).toHaveAttribute('open', '');
    await expect(oralAnswer.locator('.preview-answer-inline')).toContainText('Alimentación es la selección');
    await oralAnswer.locator('summary').click();
    await expect(oralAnswer).not.toHaveAttribute('open', '');
  });

  test('shows the complete lesson before training when the course is expanded', async ({ page }) => {
    await page.goto('/clase.html#nutrition-detail');
    const order = await page.evaluate(() => {
      const detail = document.querySelector('#nutrition-detail');
      const practice = document.querySelector('#practice-nutricion');
      return Boolean(detail && practice && (detail.compareDocumentPosition(practice) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(order).toBe(true);
    await expect(page.locator('#nutrition-detail')).toBeVisible();
    await expect(page.locator('#practice-nutricion')).toBeVisible();
  });

  test('opens a real format chooser after a completed training block', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('med-nykuto-class-practice-v431', JSON.stringify({
        nutricion:{
          qcm:Array.from({ length:20 }, () => ({ selected:0, correct:true })),
          vf:[],
          cases:[]
        }
      }));
    });
    await page.goto('/clase.html#practice-nutricion');
    await page.reload();
    const practice = page.locator('#practice-nutricion');
    await expect(practice.getByText('QCM · BLOQUE TERMINADO')).toBeVisible();
    await practice.getByRole('button', { name: 'Elegir otro formato' }).click();
    const picker = practice.locator('.practice-format-picker');
    await expect(picker).toBeVisible();
    await expect(picker.locator('.practice-format-choice')).toHaveCount(3);
    await picker.getByRole('button', { name: /Verdadero \/ Falso/ }).click();
    await expect(practice.getByRole('heading', { name: /Es correcto afirmar que, en la alimentación/i })).toBeVisible();

    await page.reload();
    await practice.getByRole('button', { name: 'Repetir QCM' }).click();
    await expect(practice.getByRole('heading', { name: '¿Qué acciones forman parte de la alimentación?' })).toBeVisible();
  });
};
