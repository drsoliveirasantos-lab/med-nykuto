const { test, expect } = require('@playwright/test');

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clase.html');
  });

  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Todo lo importante, en el orden correcto.' })).toBeVisible();
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Regulación de la glucólisis', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Abrir Epidemiología' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Sin entregas confirmadas' })).toBeVisible();
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
