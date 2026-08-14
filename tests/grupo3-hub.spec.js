const { test, expect } = require('@playwright/test');

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clase.html');
  });

  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo lo importante, en el orden correcto.' })).toBeVisible();
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Regulación de la glucólisis', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Abrir Microbiología' })).toBeVisible();
    await expect(page.getByText('Estados claros')).toBeVisible();
  });

  test('shows the shared timetable and calculates the next class', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Horario de 4.º E' })).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.locator('#nextScheduleWhen')).toContainText('·');
    await expect(page.getByText('Martes y sábado no presentan clases')).toBeVisible();
  });

  test('keeps the personal lab group separate and local to the device', async ({ page }) => {
    const groupSelector = page.getByLabel('Mi subgrupo de Microbiología II');
    await expect(groupSelector).toHaveValue('');
    await groupSelector.selectOption('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
    await expect(page.locator('#labScheduleTime')).toHaveText('18:00–20:00');
    await page.reload();
    await expect(groupSelector).toHaveValue('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
  });

  test('labels inferred preparation dates instead of presenting them as confirmed homework', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pendientes con fecha clara' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Llevar una muestra de alimento con moho' })).toBeVisible();
    await expect(page.locator('#microEstimatedDate')).toContainText('20 ago.');
    await expect(page.locator('#microEstimatedDate')).toContainText('18:00–20:00');
    await expect(page.locator('#microEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#bioEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#bioEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#epiEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#epiEstimatedDate')).toContainText('11:20–13:20');
    await expect(page.locator('#epiEstimatedDate')).toContainText('por confirmar');
    await expect(page.getByText('Fecha oral confirmada · 14 ago.')).toBeVisible();
    await expect(page.getByText('Último bloque · fecha por confirmar')).toBeVisible();
    await expect(page.getByText('Toda fecha calculada permanece como')).toBeHidden();
    await page.getByText('Cómo se calcula una fecha').click();
    await expect(page.getByText('Toda fecha calculada permanece como')).toBeVisible();
    await expect(page.getByText('El contenido final siempre corresponde al curso más reciente')).toBeVisible();
  });

  test('organizes the 14 August glycolysis lesson with corrected study points', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Glucólisis: vía común y balance energético' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Convertir una glucosa en dos piruvatos' })).toBeVisible();
    await expect(page.getByText('2 piruvatos + 2 ATP + 2 NADH', { exact: true })).toBeVisible();
    await expect(page.getByText('PEP → piruvato', { exact: true })).toBeVisible();
    await expect(page.getByText('La glucoquinasa hepática puede quedar secuestrada en el núcleo')).toBeVisible();
    await expect(page.getByText('Bioquímica · 3 transcripciones')).toBeVisible();
  });

  test('separates the two Physiology blocks and prioritizes the 13 August class', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Control nervioso y químico de la respiración' })).toBeVisible();
    await expect(page.getByText('Fecha oral interpretada · 13 ago.')).toBeVisible();
    await expect(page.getByText('Regulación nerviosa de la respiración', { exact: true })).toBeVisible();
    await expect(page.getByText('Difusión y transporte de gases', { exact: true })).toBeVisible();
    await expect(page.getByText('La lectura sobre regulación nerviosa era la preparación para el curso del 13')).toBeVisible();
    await expect(page.locator('.control-loop li')).toHaveCount(3);
    await expect(page.getByText('complejo pre-Bötzinger', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('row', { name: /Quimiorreceptor central/ })).toBeVisible();
    await expect(page.getByText('EFECTO BOHR', { exact: true })).toBeVisible();
    await expect(page.getByText('Una SpO₂ de 100 % puede ser normal.')).toBeVisible();
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.fisiologia);
    expect(transcript.resolvedDate).toBe('2026-08-13');
    expect(transcript.segments[0].estimatedDate).toBe('2026-08-10');
  });

  test('organizes Epidemiology into exam points, APS and triage preparation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sectorización, triage, urgencia y emergencia' })).toBeVisible();
    await expect(page.getByText('APS y modelo de atención integral', { exact: true })).toBeVisible();
    await expect(page.getByText('Regla aplicada:')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lo que la profesora señaló que puede preguntar' })).toBeVisible();
    await expect(page.getByText('2008: implementación de la estrategia APS en Paraguay.')).toBeVisible();
    await page.locator('.lesson-accordion').nth(3).locator('summary').click();
    await expect(page.getByText('URGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('EMERGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('No existe una regla de “máximo seis horas” para la intubación.')).toBeVisible();
    await expect(page.locator('.triage-colors article')).toHaveCount(5);
  });

  test('turns the Group 3 practical transcript into a safe fungal culture guide', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Cultivo de hongos en agar Sabouraud' })).toBeVisible();
    await expect(page.getByText('Clase estimada · 13 ago. · confirmar')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lleva una muestra sólida con moho' })).toBeVisible();
    await expect(page.getByText('Pan duro con moho', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /Levadura Principalmente unicelular/ })).toBeVisible();
    await expect(page.getByText('Conidióforo + conidios', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agar dextrosa Sabouraud' })).toBeVisible();
    await expect(page.getByText('La dosis del medio no es universal.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La muestra permanece cerrada hasta que la docente indique abrirla' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'HiMedia · Sabouraud y preparación' })).toBeVisible();
  });

  test('organizes theoretical Microbiology into dermatophyte reasoning and next-class preparation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dermatofitosis: de la queratina al caso clínico' })).toBeVisible();
    await expect(page.getByText('Clase estimada · 10 ago. · confirmar')).toBeVisible();
    await expect(page.getByRole('row', { name: /Trichophyton Sí Sí Sí/ })).toBeVisible();
    await expect(page.getByText('Tinea capitis y tiña del cuero cabelludo son el mismo diagnóstico.')).toBeVisible();
    await expect(page.getByText('El KOH muestra hifas o artroconidios', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tres micosis subcutáneas para la próxima clase' })).toBeVisible();
    await expect(page.getByText('Esporotricosis linfocutánea', { exact: true })).toBeVisible();
    await expect(page.getByText('Cromoblastomicosis', { exact: true })).toBeVisible();
    await expect(page.getByText('Micetoma eumicótico', { exact: true })).toBeVisible();
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.microbiologiaTeorica);
    expect(transcript.oralDate).toBeNull();
    expect(transcript.estimatedClassDate).toBe('2026-08-10');
    expect(transcript.estimatedPreparation.date).toBe('2026-08-17');
  });

  test('keeps the semester selector available while the page scrolls', async ({ page }) => {
    const switcher = page.getByLabel('Elegir semestre');
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveValue('4');
    await page.locator('#delegado').scrollIntoViewIfNeeded();
    await expect(switcher).toBeVisible();
    await expect(page.locator('#semesterSwitcherV402')).toHaveCSS('position', 'fixed');
  });

  test('switches revision depth without leaving the page', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida/ }).click();
    await expect(page.getByRole('heading', { name: 'El mapa central en cinco minutos' })).toBeVisible();
    await expect(page.getByText('La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Epidemiology revision depth independently', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida EPI/ }).click();
    await expect(page.getByRole('heading', { name: 'Lo esencial de Epidemiología en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida EPI/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Physiology revision depth independently', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida FIS/ }).click();
    await expect(page.getByRole('heading', { name: 'Control respiratorio en cinco minutos' })).toBeVisible();
    await expect(page.getByText('El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida FIS/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Microbiology practical revision depth independently', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida LAB/ }).click();
    await expect(page.getByRole('heading', { name: 'Hongos y Sabouraud en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los mohos son filamentosos: sus hifas forman un micelio.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida LAB/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha rápida MIC/ }).click();
    await expect(page.getByRole('heading', { name: 'Dermatofitosis en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida MIC/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('saves a simple preparation checklist', async ({ page }) => {
    const firstTask = page.locator('#studyChecklist input').first();
    await firstTask.check();
    await expect(page.locator('#planCount')).toHaveText('1/4');
    await page.reload();
    await expect(firstTask).toBeChecked();
  });

  test('keeps the page inside the viewport', async ({ page }) => {
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('shows the persistent mobile navigation only on a phone-sized viewport', async ({ page }, testInfo) => {
    const bottomNavigation = page.locator('.mobile-bottom-nav');
    if (testInfo.project.name === 'mobile-safari-shape') {
      await expect(bottomNavigation).toBeVisible();
      await expect(page.locator('.header-back')).toBeHidden();
    } else {
      await expect(bottomNavigation).toBeHidden();
    }
  });
});
