module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('turns the Group 3 practical transcript into a safe fungal culture guide', async ({ page }) => {
    await page.goto('/clase.html#micro-detail');
    await expect(page.locator('#microbiologia-practica .notebook-current-title')).toContainText('Hongos y preparación del agar Sabouraud');
    await expect(page.locator('#microbiologia-practica .notebook-date[aria-current="date"]')).toContainText('13 AGO.');
    await expect(page.getByRole('heading', { name: 'Lleva una muestra sólida con moho' })).toBeVisible();
    await expect(page.getByText('Pan duro con moho', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /Levadura Principalmente unicelular/ })).toBeVisible();
    await expect(page.getByText('Conidióforo + conidios', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agar dextrosa Sabouraud' })).toBeVisible();
    await expect(page.getByText('La dosis del medio no es universal.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La muestra permanece cerrada hasta que la docente indique abrirla' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HiMedia · Sabouraud y preparación' })).toBeVisible();
  });

  test('opens the compact 27 August fungal gallery and its two documented cases', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-practica-2026-08-27');
    const lesson = page.locator('#microbiologia-practica-2026-08-27');
    await expect(page.locator('#microbiologia-practica .notebook-current-title')).toContainText('Reconocimiento microscópico y casos de micosis oportunistas');
    await expect(lesson.locator('.course-photo-card')).toHaveCount(15);
    await expect(lesson.locator('.course-inline-figure.is-course-photo')).toHaveCount(2);
    await expect(lesson.getByText('Caso docente · candidemia', { exact: true })).toBeVisible();
    await expect(lesson.getByText('Caso docente · aspergilosis invasiva', { exact: true })).toBeVisible();
    await expect(lesson).toContainText('El tercer caso no está disponible y no se reconstruye');
    await expect(lesson.locator('.practice-module[data-practice-root="microbiologia-practica-2026-08-27"]')).toContainText('40 preguntas para dominar este curso');
  });

  test('organizes theoretical Microbiology into dermatophyte reasoning and next-class preparation', async ({ page }) => {
    await page.goto('/clase.html#micro-theory-detail');
    await expect(page.locator('#microbiologia-teorica .notebook-current-title')).toContainText('Dermatofitosis y tiñas');
    await expect(page.locator('#microbiologia-teorica .notebook-date[aria-current="date"]')).toContainText('10 AGO.');
    await expect(page.getByRole('row', { name: /Trichophyton Sí Sí Sí/ })).toBeVisible();
    await expect(page.getByText('Tiña capitis y tiña del cuero cabelludo son el mismo diagnóstico.')).toBeVisible();
    await expect(page.getByText('El hidróxido de potasio aclara queratina y permite ver hifas septadas o artroconidios', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tres micosis subcutáneas para la próxima clase' })).toBeVisible();
    const nextMycology = page.locator('#micro-theory-detail');
    await expect(nextMycology.getByText('Esporotricosis linfocutánea', { exact: true })).toBeVisible();
    await expect(nextMycology.getByText('Cromoblastomicosis', { exact: true })).toBeVisible();
    await expect(nextMycology.getByText('Micetoma eumicótico', { exact: true })).toBeVisible();
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.microbiologiaTeorica);
    expect(transcript.oralDate).toBe('2026-08-24');
    expect(transcript.resolvedDate).toBe('2026-08-24');
    expect(transcript.estimatedClassDate).toBeNull();
    expect(transcript.estimatedPreparation.date).toBe('2026-08-24');
  });

  test('keeps the semester selector inside the sticky class header', async ({ page }) => {
    const switcher = page.getByLabel('Elegir semestre');
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveValue('4');
    await page.goto('/clase.html#delegado');
    await page.locator('#delegado').scrollIntoViewIfNeeded();
    await expect(switcher).toBeVisible();
    await expect(page.locator('#semesterSwitcherV402')).toHaveClass(/is-class-header-v402/);
    await expect(page.locator('#semesterSwitcherV402')).toHaveCSS('position', 'static');
    await expect(page.locator('.class-header')).toHaveCSS('position', 'sticky');
  });

  test('switches revision depth without leaving the page', async ({ page }) => {
    await page.goto('/clase.html#bioquimica-2026-08-14');
    await page.locator('#bioquimica-2026-08-14 [data-lesson-tab="material"]').click();
    await page.locator('#bioquimica-2026-08-14 [data-study-mode="rapido"]').click();
    await expect(page.getByRole('heading', { name: 'El mapa central en cinco minutos' })).toBeVisible();
    await expect(page.getByText('La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.')).toBeVisible();
    await expect(page.locator('[data-study-mode="rapido"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Nutrition revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#nutricion-2026-08-13');
    await page.locator('#nutricion-2026-08-13 [data-lesson-tab="material"]').click();
    const quickView = page.locator('#nutricion [data-nutrition-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Leyes de la alimentación en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Dieta significa patrón habitual, no necesariamente plan hipocalórico.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Epidemiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#epidemiologia-bloque-anterior');
    await page.locator('#epidemiologia-bloque-anterior [data-lesson-tab="material"]').click();
    const quickView = page.locator('#epidemiologia [data-epi-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Lo esencial de Epidemiología en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Physiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-13');
    await page.locator('#fisiologia-2026-08-13 [data-lesson-tab="material"]').click();
    const quickView = page.locator('#fisiologia [data-fisio-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Control respiratorio en cinco minutos' })).toBeVisible();
    await expect(page.getByText('El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches the 10 August gas-exchange revision without exposing the 13 August lesson', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-10');
    await page.locator('#fisiologia-2026-08-10 [data-lesson-tab="material"]').click();
    const comparison = page.locator('#fisiologia-2026-08-10 [data-fisio-gas-mode="comparar"]');
    await comparison.click();
    await expect(page.getByRole('heading', { name: 'Dos efectos, dos preguntas diferentes' })).toBeVisible();
    await expect(page.getByText('Haldane en pulmón:', { exact: false })).toBeVisible();
    await expect(comparison).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#fisiologia-2026-08-13')).toBeHidden();
  });

  test('switches Microbiology practical revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-practica-anterior');
    await page.locator('#microbiologia-practica-anterior [data-lesson-tab="material"]').click();
    const quickView = page.locator('#microbiologia-practica [data-micro-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Hongos y Sabouraud en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los mohos son filamentosos: sus hifas forman un micelio.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });
};
