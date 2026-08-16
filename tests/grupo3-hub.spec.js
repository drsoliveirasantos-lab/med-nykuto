const { test, expect } = require('@playwright/test');

const CLASS_DRIVE_URL = 'https://drive.google.com/drive/u/0/mobile/folders/1AE16HsBFgPw80tQYS_O5lQf3hsz9CFdy/1FWhE0vQoc7dNILKqa0qMrGfoF68ZElij?sort=13&direction=a';

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clase.html');
  });

  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tu semana', exact: true })).toBeVisible();
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.locator('#inicio')).not.toContainText(/de un vistazo|EN PORTADA|Panel de estudio/);
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.getByRole('link', { name: /Estudiar tres micosis subcutáneas/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Guías \+ regiones y platos/ })).toBeVisible();
    await expect(page.locator('#homeMicroTheoryDate')).toContainText('17 ago');
    await expect(page.locator('#homeNutritionDate')).toContainText('20 ago');
    await expect(page.locator('#homeBioDate')).toContainText('19 ago');
    await expect(page.locator('#homeMicroTheoryDate')).toHaveAttribute('datetime', '2026-08-17');
    await expect(page.locator('#homeNutritionDate')).toHaveAttribute('datetime', '2026-08-20');
    await expect(page.locator('#homeBioDate')).toHaveAttribute('datetime', '2026-08-19');
    await expect(page.locator('.priority-card-head time')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'TAREAS', exact: true })).toBeVisible();
    await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tareas');
    expect(await page.locator('.dashboard-priorities .priority-card time').evaluateAll((times) => times.map((time) => time.dateTime))).toEqual(['2026-08-17', '2026-08-19', '2026-08-20']);
    await expect(page.locator('#lastUpdated')).toHaveAttribute('datetime', /^2026-08-15T\d{2}:\d{2}:\d{2}-03:00$/);
    await expect(page.locator('#lastUpdated')).toHaveText(/^Actualizado 15 ago\.? · \d{2}:\d{2} PY$/);
    await expect(page.locator('#horario')).toBeHidden();
    await expect(page.locator('#materias')).toBeHidden();
  });

  test('uses clickable views and shows only one course at a time', async ({ page }) => {
    await page.locator('.workspace-nav [data-view-link="cursos"]').click();
    await expect(page.locator('#materias')).toBeVisible();
    await expect(page.locator('#nutricion')).toBeVisible();
    await expect(page.locator('#fisiologia')).toBeHidden();
    await expect(page.locator('#nutrition-detail')).toBeHidden();

    await page.locator('[data-course-target="fisiologia"]').click();
    await expect(page.locator('#nutricion')).toBeHidden();
    await expect(page.locator('#fisiologia')).toBeVisible();
    await expect(page.locator('#fisio-detail')).toBeHidden();

    const toggle = page.locator('#fisiologia-2026-08-13 [data-detail-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#fisio-detail')).toBeVisible();
  });

  test('keeps a compact training shortcut directly below the selected course grid', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const shortcut = page.locator('#coursePracticeShortcut');
    await expect(shortcut).toBeVisible();
    await expect(shortcut.locator('#coursePracticeShortcutLabel')).toHaveText('Entrenar');
    await expect(shortcut.locator('#coursePracticeShortcutCourse')).toHaveText('Nutrición');
    await expect(shortcut).toHaveAttribute('data-practice-target', 'nutricion');

    const placement = await page.evaluate(() => {
      const selector = document.querySelector('.course-selector').getBoundingClientRect();
      const shortcut = document.querySelector('#coursePracticeShortcut').getBoundingClientRect();
      const drive = document.querySelector('.class-drive-card').getBoundingClientRect();
      return { selectorBottom:selector.bottom, shortcutTop:shortcut.top, shortcutBottom:shortcut.bottom, driveTop:drive.top, height:shortcut.height };
    });
    expect(placement.shortcutTop).toBeGreaterThanOrEqual(placement.selectorBottom);
    expect(placement.shortcutBottom).toBeLessThanOrEqual(placement.driveTop);
    expect(placement.height).toBeLessThan(62);

    await page.locator('[data-course-target="bioquimica"]').click();
    await expect(shortcut.locator('#coursePracticeShortcutCourse')).toHaveText('Bioquímica II');
    await expect(shortcut).toHaveAttribute('data-practice-target', 'bioquimica');
    await shortcut.click();
    await expect(page.locator('#practice-bioquimica .practice-workspace')).toBeVisible();
  });

  test('opens the shared class Drive from Courses, Nutrition and the seminar plan', async ({ page }) => {
    await page.goto('/clase.html#materias');
    const centralDrive = page.getByRole('link', { name: /Abrir los materiales compartidos de la clase/ });
    await expect(centralDrive).toBeVisible();
    await expect(centralDrive).toHaveAttribute('href', CLASS_DRIVE_URL);
    await expect(centralDrive).toHaveAttribute('target', '_blank');
    await expect(centralDrive).toHaveAttribute('rel', /noopener/);
    await expect(centralDrive).toHaveAttribute('rel', /noreferrer/);

    const driveLinks = page.locator('[data-class-drive-link]');
    await expect(driveLinks).toHaveCount(3);
    expect(await driveLinks.evaluateAll((links, driveUrl) => links.every((link) => link.getAttribute('href') === driveUrl), CLASS_DRIVE_URL)).toBe(true);

    await page.goto('/clase.html#nutrition-seminar');
    await expect(page.locator('#nutrition-seminar').getByRole('link', { name: /Materiales en Drive/ })).toBeVisible();
    await page.goto('/clase.html#plan-estudio');
    await expect(page.locator('#plan-estudio').getByRole('link', { name: /Abrir Drive/ })).toBeVisible();
  });

  test('keeps deep links working and opens the required class detail', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    await expect(page.locator('#materias')).toBeVisible();
    await expect(page.locator('#nutricion')).toBeVisible();
    await expect(page.locator('#nutrition-detail')).toBeVisible();
    await expect(page.locator('#nutricion [data-detail-toggle]')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('heading', { name: 'Seminario / presentación oral' })).toBeVisible();
  });

  test('shows the shared timetable and calculates the next class', async ({ page }) => {
    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.locator('#nextScheduleWhen')).toContainText('·');
    await expect(page.getByText('No hay clases el martes ni el sábado')).toBeVisible();
    await expect(page.locator('#scheduleWeekRange')).toContainText(/Semana del \d+/);
    for (const day of ['1','3','4','5']) {
      await expect(page.locator(`[data-week-date="${day}"]`)).toHaveText(/\d{1,2} [a-záéíóú]+\.?/i);
      await expect(page.locator(`[data-week-date="${day}"]`)).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    }
    await expect(page.locator('#weeklyAgenda .course-type-badge')).toHaveText(['TEÓRICA','PRÁCTICA']);
    await expect(page.locator('#weeklyAgenda .schedule-task-badge')).toHaveCount(5);
    await expect(page.locator('.agenda-day')).toHaveCount(4);
    await expect(page.locator('.schedule-guide-card')).toBeVisible();
    const desktopOrder = await page.evaluate(() => {
      const summary = document.querySelector('.agenda-summary').getBoundingClientRect();
      const grid = document.querySelector('#weeklyAgenda').getBoundingClientRect();
      return { summaryTop: summary.top, gridTop: grid.top };
    });
    expect(desktopOrder.summaryTop).toBeLessThan(desktopOrder.gridTop);
    await expect(page.locator('.schedule-slot small').first()).toBeVisible();
    await expect(page.getByText('KM 8', { exact: true })).toHaveCount(0);
  });

  test('switches the class interface between Spanish and Brazilian Portuguese', async ({ page }) => {
    const language = page.locator('#classLanguageSelect');
    await expect(language).toHaveValue('es');
    await language.selectOption('br');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('#classLanguageSelect')).toHaveValue('br');
    await expect(page.getByRole('heading', { name: 'Sua semana', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TAREFAS', exact: true })).toBeVisible();
    await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tarefas');
    await expect(page.getByText('PARA ESTA SEMANA', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver todas as tarefas' })).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav').getByText('Tarefas', { exact: true })).toBeAttached();
    await expect(page.locator('.mobile-bottom-nav').getByText('Matérias', { exact: true })).toBeAttached();

    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horário do 4.º E' })).toBeVisible();
    await expect(page.locator('[data-week-date="1"]')).toHaveText(/\d{1,2}/);
    await expect(page.locator('#weeklyAgenda')).toContainText('Microbiologia II');
    await expect(page.locator('#weeklyAgenda')).toContainText('TEÓRICA');
    await expect(page.locator('#weeklyAgenda')).toContainText('PRÁTICA');
    await expect(page.locator('#weeklyAgenda').getByText('Tarefa', { exact: true })).toBeVisible();

    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tarefas da turma' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seminário e apresentação oral' })).toBeVisible();
    await expect(page.locator('#microTheoryPrepCard')).toContainText('Microbiologia II · Teórica');
    await expect(page.locator('[data-current-assignment]')).toHaveCount(5);
    await page.goto('/clase.html#nutricion');
    await page.locator('[data-nutrition-mode="rapido"]').click();
    await expect(page.locator('#nutritionPreviewEyebrow')).toHaveText('RESUMO RÁPIDO · 10 IDEIAS');

    await page.goto('/clase.html#plan-estudio');
    await expect(page.getByText('ARQUIVOS PARA COMEÇAR', { exact: true })).toBeVisible();
    await expect(page.locator('#plan-estudio').getByRole('link', { name: 'Ver exemplo da primeira página', exact: true })).toBeVisible();
    await expect(page.locator('#plan-estudio')).not.toContainText(/Primera página|Documento firmado|Este paso se completa/);

    await page.locator('#classLanguageSelect').selectOption('es');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { name: 'Plan del seminario' })).toBeVisible();
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas de la clase' })).toBeVisible();
    await page.goto('/clase.html#horario');
    await expect(page.getByRole('heading', { name: 'Horario del 4.º E' })).toBeVisible();
  });

  test('keeps the personal lab group separate and local to the device', async ({ page }) => {
    await page.goto('/clase.html#horario');
    const groupSelector = page.getByLabel('Mi grupo de Microbiología II · Práctica');
    await expect(groupSelector).toHaveValue('');
    await groupSelector.selectOption('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
    await expect(page.locator('#labScheduleTime')).toHaveText('18:00–20:00');
    await page.reload();
    await expect(groupSelector).toHaveValue('3');
    await expect(page.locator('#labScheduleGroup')).toContainText('Grupo 3');
  });

  test('labels inferred preparation dates instead of presenting them as confirmed homework', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas de la clase' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Llevar una muestra de alimento con moho' })).toBeVisible();
    await expect(page.locator('#microEstimatedDate')).toContainText('20 ago.');
    await expect(page.locator('#microEstimatedDate')).toContainText('18:00–20:00');
    await expect(page.locator('#microEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#bioEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#bioEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#epiEstimatedDate')).toContainText('19 ago.');
    await expect(page.locator('#epiEstimatedDate')).toContainText('11:20–13:20');
    await expect(page.locator('#epiEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('20 ago.');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('07:00–09:40');
    await expect(page.locator('#nutritionEstimatedDate')).toContainText('por confirmar');
    await expect(page.locator('#nutritionPrepCard .assignment-status')).toHaveText('Confirmada');
    await expect(page.getByLabel('Semana 3, del 17 al 23 de agosto de 2026')).toBeVisible();
    await expect(page.locator('#nutritionPrepCard time')).toHaveCount(2);
    await expect(page.locator('#nutritionPrepCard time').first()).toHaveAttribute('datetime', '2026-08-17');
    await expect(page.locator('#nutritionPrepCard time').last()).toHaveAttribute('datetime', '2026-08-23');
    await expect(page.locator('#bioPrepCard .assignment-status')).toHaveText('Estimada');
    await expect(page.getByText('Comprueba siempre los avisos oficiales de la facultad.')).toBeHidden();
    await page.getByText('¿De dónde sale esta fecha?').click();
    await expect(page.getByText('Comprueba siempre los avisos oficiales de la facultad.')).toBeVisible();
    await expect(page.getByText('Si no dio una fecha, usamos el horario habitual de la materia.')).toBeVisible();
  });

  test('organizes the 14 August glycolysis lesson with corrected study points', async ({ page }) => {
    await page.goto('/clase.html#bio-detail');
    await expect(page.getByRole('heading', { name: 'Glucólisis: vía común y balance energético' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Convertir una glucosa en dos piruvatos' })).toBeVisible();
    await expect(page.getByText('2 piruvatos + 2 ATP + 2 NADH', { exact: true })).toBeVisible();
    await expect(page.getByText('PEP → piruvato', { exact: true })).toBeVisible();
    await expect(page.getByText('La glucoquinasa hepática puede quedar secuestrada en el núcleo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La glucólisis en una sola mirada' })).toBeVisible();
    await expect(page.locator('.bio-board-route article')).toHaveCount(4);
    await expect(page.getByText('Malato–aspartato: ≈2,5 ATP/NADH; glicerol-3-fosfato: ≈1,5 ATP/NADH.')).toBeVisible();
    await expect(page.getByText('su rendimiento oxidativo no es siempre 2,5 ATP por NADH', { exact: false })).toBeVisible();
    await expect(page.getByText('Bioquímica · 3 clases')).toBeVisible();
  });

  test('opens the reconstructed glycolysis board archive in its teaching order', async ({ page }) => {
    await page.goto('/clase.html#bioquimica');
    const openArchive = page.getByRole('button', { name: /Ver las 7 láminas/ });
    await expect(openArchive).toBeVisible();
    await openArchive.click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-board-archive-slide]')).toHaveCount(7);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 1 DE 7');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /restored\/01-mapa-general\.webp$/);
    await expect(page.locator('#boardArchiveSlideTitle')).toHaveText('Mapa general');
    await expect(dialog.locator('[data-board-archive-previous]')).toBeDisabled();

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /restored\/02-fase-preparatoria-1-3\.webp$/);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');

    await dialog.locator('[data-board-archive-slide="6"]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /restored\/07-regulacion-anotada\.webp$/);
    await expect(dialog.locator('[data-board-archive-next]')).toBeDisabled();
    await dialog.press('Home');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /restored\/01-mapa-general\.webp$/);
    await dialog.press('ArrowRight');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /restored\/02-fase-preparatoria-1-3\.webp$/);

    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(openArchive).toBeFocused();
  });

  test('opens both teacher PDF decks inside the Microbiology archive', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica');
    const launchers = page.locator('[data-micro-archive-open]');
    await expect(launchers).toHaveCount(2);
    await expect(launchers.first()).toBeVisible();
    await launchers.first().click();

    const dialog = page.locator('#microSlideArchive');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-micro-archive-slide]')).toHaveCount(11);
    await expect(page.locator('#microSlideArchiveCounter')).toHaveText('DIAPOSITIVA 1 DE 11');
    await expect(page.locator('#microSlideArchiveImage')).toHaveAttribute('src', /generalidades\/01\.webp$/);
    await expect(page.locator('#microSlideArchiveDownload')).toHaveAttribute('href', /micologia-generalidades\.pdf$/);

    await dialog.locator('[data-micro-archive-document="superficiales"]').click();
    await expect(dialog.locator('[data-micro-archive-slide]')).toHaveCount(11);
    await expect(page.locator('#microSlideArchiveImage')).toHaveAttribute('src', /micosis-superficiales\/01\.webp$/);
    await expect(page.locator('#microSlideArchiveDownload')).toHaveAttribute('href', /micosis-superficiales\.pdf$/);
    await dialog.locator('[data-micro-archive-next]').click();
    await expect(page.locator('#microSlideArchiveImage')).toHaveAttribute('src', /micosis-superficiales\/02\.webp$/);

    await dialog.getByRole('button', { name: 'Cerrar archivo de diapositivas' }).click();
    await expect(dialog).toBeHidden();
    await expect(launchers.first()).toBeFocused();
  });

  test('opens the homework review and separates PDF content from upcoming topics', async ({ page }) => {
    await page.goto('/clase.html#microTheoryPrepCard');
    const assignment = page.locator('#microTheoryPrepCard');
    await expect(assignment).toHaveAttribute('open', '');
    const openReview = assignment.locator('[data-micro-review-open]');
    await expect(openReview).toBeVisible();
    await openReview.click();

    const dialog = page.locator('#microHomeworkReview');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-micro-review-panel]')).toHaveCount(4);
    await expect(dialog.locator('[data-micro-review-panel="0"]')).toBeVisible();
    await expect(dialog).toContainText('Las diapositivas desarrollan las tiñas');
    await dialog.locator('[data-micro-review-next]').click();
    await expect(dialog.locator('[data-micro-review-panel="1"]')).toBeVisible();
    await expect(dialog).toContainText('NO DESARROLLADO EN LOS PDF');
    await dialog.press('End');
    await expect(dialog.locator('[data-micro-review-panel="3"]')).toBeVisible();
    await expect(dialog).toContainText('NO APARECE EN LOS PDF');

    await dialog.getByRole('button', { name: 'Cerrar ficha de repaso' }).click();
    await expect(dialog).toBeHidden();
    await expect(openReview).toBeFocused();
  });

  test('opens the 10 and 13 August Physiology lessons independently', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-13');
    await expect(page.locator('#fisio-title')).toHaveText('Control nervioso y químico de la respiración');
    await expect(page.getByText('Fecha oral interpretada · 13 ago.')).toBeVisible();
    await expect(page.locator('#fisiologia-2026-08-13')).toBeVisible();
    await expect(page.locator('#fisiologia-2026-08-10')).toBeHidden();
    await page.locator('#fisiologia-2026-08-13 [data-detail-toggle]').click();
    await expect(page.locator('#fisiologia-2026-08-13 .control-loop li')).toHaveCount(3);
    await expect(page.getByText('complejo pre-Bötzinger', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('row', { name: /Quimiorreceptor central/ })).toBeVisible();
    await expect(page.locator('#practice-fisiologia-2026-08-13')).toContainText('40 preguntas para dominar este curso');
    await expect(page.locator('#fisiologia-2026-08-13').getByText('EFECTO BOHR', { exact: true })).toHaveCount(0);

    await page.locator('[data-lesson-target="fisiologia-2026-08-10"]').click();
    await expect(page.locator('#fisio-title')).toHaveText('Difusión y transporte de gases');
    await expect(page.locator('#fisiologia-2026-08-13')).toBeHidden();
    await expect(page.locator('#fisiologia-2026-08-10')).toBeVisible();
    await expect(page.locator('[data-lesson-target="fisiologia-2026-08-10"]')).toHaveAttribute('aria-current', 'true');
    await page.locator('#fisiologia-2026-08-10 [data-detail-toggle]').click();
    await expect(page.locator('#fisiologia-2026-08-10').getByText('EFECTO BOHR', { exact: true })).toBeVisible();
    await expect(page.getByRole('row', { name: /Barrera alveolocapilar/ })).toBeVisible();
    await expect(page.locator('#practice-fisiologia-2026-08-10')).toContainText('40 preguntas para dominar este curso');
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.fisiologia);
    expect(transcript.resolvedDate).toBe('2026-08-13');
    expect(transcript.segments[0].estimatedDate).toBe('2026-08-10');
  });

  test('turns the Nutrition transcript into a patient-evaluation framework and seminar brief', async ({ page }) => {
    await page.goto('/clase.html#nutrition-detail');
    await expect(page.getByRole('heading', { name: 'Leyes de la alimentación y evaluación del paciente' })).toBeVisible();
    const nutrition = page.locator('#nutricion');
    await expect(nutrition.getByText('Clase estimada · 13 ago. · confirmar')).toBeVisible();
    await expect(page.locator('.nutrition-laws article')).toHaveCount(5);
    await expect(page.locator('.nutrition-law-photo img')).toHaveCount(5);
    await expect(page.locator('.plate-photo')).toBeVisible();
    await expect.poll(() => page.locator('.nutrition-law-photo img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.getByText('Una dieta no se juzga solo por sus calorías')).toBeVisible();
    await expect(page.getByText('Paraguay difunde 12 mensajes alimentarios oficiales, no 10.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Seminario / presentación oral' })).toBeVisible();
    await expect(nutrition.getByText('2 PPT + 1 informe', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('Hasta 4 por PPT', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('Hasta 5 minutos', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('Drive de la clase → Bibliografía → carpeta INAN.', { exact: false })).toBeVisible();
    await expect(nutrition.getByRole('link', { name: 'Ver las instrucciones' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(nutrition.getByRole('link', { name: 'Ver ejemplo de la primera página' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.nutricion);
    expect(transcript.oralDate).toBeNull();
    expect(transcript.estimatedClassDate).toBe('2026-08-13');
    expect(transcript.estimatedPreparation.date).toBe('2026-08-20');
    expect(transcript.assignment.maxMinutesPerGroup).toBe(5);
    expect(transcript.assignment.maxSlidesPerPresentation).toBe(4);
    expect(transcript.assignment.deliverables).toHaveLength(3);
    expect(transcript.assignment.evaluation.totalPoints).toBe(5);
    expect(Object.keys(transcript.assignment.groups)).toHaveLength(6);
  });

  test('shows the complete official seminar requirements without leaving Tareas', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    const task = page.locator('#nutritionPrepCard');
    await task.locator(':scope > summary').click();
    await expect(task.locator('.seminar-at-a-glance b').first()).toHaveText('2');
    await expect(task.getByText('presentaciones PowerPoint separadas', { exact: true })).toBeVisible();
    await expect(task.getByText('informe para firma y sello', { exact: true })).toBeVisible();
    await task.getByText('Ver todos los detalles', { exact: true }).click();
    await expect(task.getByText('Trabajo 1 · Guías Alimentarias', { exact: true })).toBeVisible();
    await expect(task.getByText('Trabajo 2 · Platos típicos / regiones', { exact: true })).toBeVisible();
    await expect(task.getByText('aproximadamente hasta 5 minutos por grupo', { exact: false })).toBeVisible();
    await expect(task.getByRole('link', { name: 'Ver las instrucciones y descargar' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(task.getByRole('link', { name: 'Ver ejemplo de la primera página' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
  });

  test('organizes seminar content, signed report and five-point rubric in accordions', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    const seminar = page.locator('#nutrition-seminar');
    await expect(seminar.getByText('Objetivo o mensaje principal.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis nutricional breve y conclusión.', { exact: true })).toBeVisible();

    await seminar.getByText('Informe para firma y sello', { exact: true }).click();
    await expect(seminar.getByText('Nombres y matrícula/código de los integrantes.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Lic. Johana Belén Leguizamón Vera.', { exact: false })).toBeVisible();

    await seminar.getByText('Cómo se califica · 5 puntos', { exact: true }).click();
    await expect(seminar.locator('.seminar-rubric-grid article')).toHaveCount(5);
    await expect(seminar.getByText('Fuentes utilizadas', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis y conclusión', { exact: true })).toBeVisible();
  });

  test('shows exact Nutrition topics after selecting a group and remembers the choice', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await page.locator('#nutritionPrepCard > summary').click();
    const selector = page.locator('#nutritionGroupTaskSelect');
    await selector.selectOption('3');
    const output = page.locator('#nutritionPrepCard [data-nutrition-group-output]');
    await expect(output.getByText('Mensajes/Guías 9 al 12 del Paraguay', { exact: true })).toBeVisible();
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 1 · P1 (4)', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 2 · P2 (5)', { exact: true })).toBeVisible();
    await page.reload();
    await page.locator('#nutritionPrepCard > summary').click();
    await expect(selector).toHaveValue('3');
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
  });

  test('syncs the Nutrition group and exact topics with the seminar plan', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const planSelector = page.locator('#nutritionGroupPlanSelect');
    await expect(planSelector).toBeVisible();
    await planSelector.selectOption('6');
    const planOutput = page.locator('#plan-estudio [data-nutrition-group-output]');
    await expect(planOutput.getByText('Guías Alimentarias del Paraguay', { exact: true })).toBeVisible();
    await expect(planOutput.getByText('Platos típicos del Paraguay', { exact: true })).toBeVisible();
    await expect(page.locator('#studyChecklist input[value="nutrition-group"]')).toBeChecked();
    await expect(page.locator('#planCount')).toHaveText('1/6');
    await expect(page.locator('#studyChecklist input')).toHaveCount(6);
    await expect(page.getByText('PowerPoint · Trabajo 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Informe breve', { exact: true }).last()).toBeVisible();

    await page.goto('/clase.html#pendientes');
    await page.locator('#nutritionPrepCard > summary').click();
    await expect(page.locator('#nutritionGroupTaskSelect')).toHaveValue('6');
    await expect(page.locator('#nutritionPrepCard [data-nutrition-group-output]').getByText('Platos típicos del Paraguay', { exact: true })).toBeVisible();
  });

  test('loads a useful photographic visual in every non-Nutrition course', async ({ page }) => {
    const courseVisuals = [
      ['fisio-detail', '#fisio-detail .course-photo-feature--physiology img'],
      ['bio-detail', '.course-photo-feature--biochemistry img'],
      ['epi-detail', '.course-photo-feature--epidemiology img'],
      ['micro-theory-detail', '.course-photo-feature--microbiology img'],
      ['micro-detail', '.course-photo-feature--laboratory img']
    ];

    for (const [hash, selector] of courseVisuals) {
      await page.goto(`/clase.html#${hash}`);
      const image = page.locator(selector);
      await expect(image).toBeVisible();
      await expect(image).not.toHaveAttribute('alt', '');
      await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    }
  });

  test('archives completed activities by subject and counts personal signed copies', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas anteriores' })).toBeVisible();
    await expect(page.locator('#signedAssignmentCount')).toHaveText('0/2 copias firmadas');
    await expect(page.locator('[data-archive-subject]')).toHaveCount(6);

    const bioGroup = page.locator('[data-archive-subject]').filter({ hasText: 'BIOQUÍMICA II' });
    await bioGroup.locator(':scope > summary').click();
    await page.locator('#bio-tarea-glut4 > summary').click();
    await expect(page.locator('#bio-tarea-glut4')).toHaveAttribute('open', '');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#materias')).toBeHidden();
    await expect(page.getByText('Diseña el proceso de funcionamiento dependiente de insulina del GLUT4.')).toBeVisible();
    const bioSignature = page.locator('[data-signed-assignment="bio-glut4"]');
    await bioSignature.check();
    await expect(page.locator('#bio-tarea-glut4 [data-signed-mirror="bio-glut4"]')).toHaveText('Copia firmada');

    await page.goto('/clase.html#bio-tarea-glut4');
    await expect(bioGroup).toHaveAttribute('open', '');
    await expect(page.locator('#bio-tarea-glut4')).toHaveAttribute('open', '');
    await expect(bioSignature).toBeChecked();
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#signedAssignmentCount')).toHaveText('1/2 copias firmadas');

    const epiGroup = page.locator('[data-archive-subject]').filter({ hasText: 'EPIDEMIOLOGÍA Y SALUD PÚBLICA' });
    await epiGroup.locator(':scope > summary').click();
    await page.locator('#epi-tarea-salud > summary').click();
    await expect(page.locator('#epi-tarea-salud')).toHaveAttribute('open', '');
    await expect(page.locator('#epi-tarea-salud .subject-assignment-body li')).toHaveCount(11);
  });

  test('uses pictograms instead of navigation abbreviations', async ({ page }) => {
    await expect(page.locator('.workspace-nav .nav-icon')).toHaveCount(6);
    await expect(page.locator('.workspace-nav .nav-icon svg')).toHaveCount(6);
    await expect(page.locator('.workspace-nav').getByText('INI', { exact: true })).toHaveCount(0);
    await expect(page.locator('.workspace-nav').getByText('Tareas', { exact: true })).toBeVisible();
    await expect(page.locator('.workspace-nav').getByText('Materias', { exact: true })).toBeVisible();
    await page.goto('/clase.html#materias');
    await expect(page.locator('.course-selector .course-icon svg')).toHaveCount(6);
    for (const code of ['NUT', 'FIS', 'BIO', 'EPI', 'MIC', 'LAB']) {
      await expect(page.locator('.course-selector').getByText(code, { exact: true })).toHaveCount(0);
    }
    await expect(page.locator('.resource-grid .resource-icon svg')).toHaveCount(28);
    await expect(page.locator('.resource-grid .resource-code')).toHaveCount(0);
  });

  test('keeps the mobile home and course choices compact', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#inicio');

    const homeLayout = await page.evaluate(() => {
      const priorities = [...document.querySelectorAll('.priority-card')].map((card) => card.getBoundingClientRect().height);
      return {
        dashboardHeight: document.querySelector('#inicio').getBoundingClientRect().height,
        nextHeight: document.querySelector('.dashboard-next').getBoundingClientRect().height,
        priorityHeights: priorities,
        kickerDisplay: getComputedStyle(document.querySelector('.dashboard-heading .section-kicker')).display,
        introDisplay: getComputedStyle(document.querySelector('.dashboard-intro')).display,
        updatedDisplay: getComputedStyle(document.querySelector('.dashboard-updated')).display,
        lastClassDisplay: getComputedStyle(document.querySelector('.dashboard-status > div:nth-child(2)')).display,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(homeLayout.dashboardHeight).toBeLessThan(620);
    expect(homeLayout.nextHeight).toBeLessThanOrEqual(140);
    expect(Math.max(...homeLayout.priorityHeights)).toBeLessThan(70);
    expect(homeLayout.kickerDisplay).toBe('none');
    expect(homeLayout.introDisplay).toBe('none');
    expect(homeLayout.updatedDisplay).toBe('none');
    expect(homeLayout.lastClassDisplay).toBe('none');
    expect(homeLayout.scrollWidth).toBeLessThanOrEqual(homeLayout.clientWidth + 1);

    await page.goto('/clase.html#materias');
    const courseLayout = await page.evaluate(() => {
      const courses = [...document.querySelectorAll('.course-selector a')].map((card) => card.getBoundingClientRect());
      const resources = [...document.querySelectorAll('#nutricion .resource-card')].map((card) => card.getBoundingClientRect());
      return {
        courseHeights: courses.map((card) => card.height),
        coursesShareFirstRow: Math.abs(courses[0].top - courses[1].top) < 1,
        thirdCourseStartsNextRow: courses[2].top > courses[0].top,
        resourceHeights: resources.map((card) => card.height),
        resourcesShareFirstRow: Math.abs(resources[0].top - resources[1].top) < 1,
        courseMetaDisplay: getComputedStyle(document.querySelector('.course-selector b')).display,
        courseIntroDisplay: getComputedStyle(document.querySelector('#materias .section-heading > p')).display,
        detailToggleHeight: document.querySelector('#nutricion .course-detail-toggle').getBoundingClientRect().height,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(Math.max(...courseLayout.courseHeights)).toBeLessThanOrEqual(74);
    expect(courseLayout.coursesShareFirstRow).toBe(true);
    expect(courseLayout.thirdCourseStartsNextRow).toBe(true);
    expect(Math.max(...courseLayout.resourceHeights)).toBeLessThanOrEqual(70);
    expect(courseLayout.resourcesShareFirstRow).toBe(true);
    expect(courseLayout.courseMetaDisplay).toBe('none');
    expect(courseLayout.courseIntroDisplay).toBe('none');
    expect(courseLayout.detailToggleHeight).toBeLessThanOrEqual(62);
    expect(courseLayout.scrollWidth).toBeLessThanOrEqual(courseLayout.clientWidth + 1);
  });

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
      localStorage.setItem('med-nykuto-class-practice-v429', JSON.stringify({
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
    await expect(practice.getByRole('heading', { name: 'La alimentación incluye elegir, preparar e ingerir alimentos.' })).toBeVisible();

    await page.reload();
    await practice.getByRole('button', { name: 'Repetir QCM' }).click();
    await expect(practice.getByRole('heading', { name: '¿Cuál es la afirmación correcta sobre la alimentación?' })).toBeVisible();
  });

  test('previews both seminar Word documents before download', async ({ page }) => {
    await page.goto('/documentos-seminario.html#modelo-portada');
    await expect(page.getByRole('heading', { name: 'Ejemplo de la primera página y del desarrollo' })).toBeVisible();
    await expect(page.locator('[data-document-panel="modelo-portada"] img')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/modelo-portada-seminario-nutricion.docx');
    await expect.poll(() => page.locator('[data-document-panel="modelo-portada"] img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);

    await page.locator('[data-document-tab="instructivo"]').click();
    await expect(page.getByRole('heading', { name: 'Instrucciones para la presentación oral' })).toBeVisible();
    await expect(page.locator('[data-document-panel="instructivo"] img')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/instructivo-presentacion-oral-semana-3.docx');
  });

  test('previews seminar documents in a closable same-page dialog', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const originalUrl = page.url();
    const dialog = page.locator('#seminarDocumentPreview');

    await page.locator('#plan-estudio').getByRole('link', { name: 'Ver las instrucciones', exact: true }).click();
    await expect(dialog).toBeVisible();
    expect(page.url()).toBe(originalUrl);
    await expect(dialog.locator('[data-document-preview-panel="instructivo"]')).toBeVisible();
    await expect(dialog.locator('[data-document-preview-panel="instructivo"] img')).toHaveCount(3);
    await expect(dialog.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/instructivo-presentacion-oral-semana-3.docx');

    await dialog.getByRole('button', { name: 'Ejemplo de la primera página' }).click();
    await expect(dialog.locator('[data-document-preview-panel="modelo-portada"]')).toBeVisible();
    await expect(dialog.locator('[data-document-preview-panel="modelo-portada"] img')).toHaveCount(2);
    await expect(dialog.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/modelo-portada-seminario-nutricion.docx');

    await dialog.getByRole('button', { name: 'Cerrar vista previa' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('#plan-estudio')).toBeVisible();
    expect(page.url()).toBe(originalUrl);
  });

  test('offers exactly 20 QCM, 10 true-false and 10 clinical cases for every dated course', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    await expect(page.locator('[data-practice-root]')).toHaveCount(7);
    const everyBankHasForty = await page.locator('[data-practice-root]').evaluateAll((roots) => roots.every((root) => {
      const counts = Array.from(root.querySelectorAll('.practice-counts strong')).map((node) => Number(node.textContent));
      return counts.join(',') === '20,10,10';
    }));
    expect(everyBankHasForty).toBe(true);
    const practice = page.locator('#practice-nutricion');
    const overviewCounts = practice.locator('.practice-counts > span');
    await expect(overviewCounts.nth(0)).toHaveText('20QCM');
    await expect(overviewCounts.nth(1)).toHaveText('10Verdadero / Falso');
    await expect(overviewCounts.nth(2)).toHaveText('10Casos clínicos');
    await practice.getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(practice).toContainText('40 preguntas hechas únicamente con el contenido de esta clase.');
    await expect(practice.getByRole('heading', { name: '¿Cuál es la afirmación correcta sobre la alimentación?' })).toBeVisible();
    await expect(practice.locator('.practice-feedback')).toHaveCount(0);
    await practice.getByRole('radio', { name: 'La alimentación incluye elegir, preparar e ingerir alimentos.' }).click();
    await practice.getByRole('button', { name: 'Validar mi respuesta' }).click();
    await expect(practice.locator('.practice-feedback')).toContainText('Respuesta correcta');
    await expect(practice.locator('.practice-feedback')).toContainText('Elección, preparación e ingestión de alimentos');
    await expect(practice.locator('.practice-sources')).toContainText('SOLO CONTENIDO DE LA CLASE');
    await expect(practice.locator('.practice-sources a')).toHaveAttribute('href', 'clase.html#nutrition-detail');

    await page.goto('/clase.html#practice-bioquimica');
    await expect(page.locator('#bioquimica')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-workspace')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-tab')).toHaveCount(3);
  });

  test('organizes Epidemiology into exam points, APS and triage preparation', async ({ page }) => {
    await page.goto('/clase.html#epi-detail');
    await expect(page.getByRole('heading', { name: 'Sectorización, triage, urgencia y emergencia' })).toBeVisible();
    await expect(page.getByText('APS y modelo de atención integral', { exact: true })).toBeVisible();
    await expect(page.locator('#epidemiologia .transcription-rule-note').getByText('Cómo se separaron las clases:')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lo que la profesora señaló que puede preguntar' })).toBeVisible();
    await expect(page.getByText('2008: implementación de la estrategia APS en Paraguay.')).toBeVisible();
    await page.locator('#epidemiologia .lesson-accordion').nth(3).locator('summary').click();
    await expect(page.getByText('URGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('EMERGENCIA', { exact: true })).toBeVisible();
    await expect(page.getByText('No existe una regla de “máximo seis horas” para la intubación.')).toBeVisible();
    await expect(page.locator('.triage-colors article')).toHaveCount(5);
  });

  test('turns the Group 3 practical transcript into a safe fungal culture guide', async ({ page }) => {
    await page.goto('/clase.html#micro-detail');
    await expect(page.getByRole('heading', { name: 'Cultivo de hongos en agar Sabouraud' })).toBeVisible();
    await expect(page.locator('#microbiologia-practica').getByText('Clase estimada · 13 ago. · confirmar')).toBeVisible();
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
    await page.goto('/clase.html#micro-theory-detail');
    await expect(page.getByRole('heading', { name: 'Dermatofitosis: de la queratina al caso clínico' })).toBeVisible();
    await expect(page.getByText('Clase estimada · 10 ago. · confirmar')).toBeVisible();
    await expect(page.getByRole('row', { name: /Trichophyton Sí Sí Sí/ })).toBeVisible();
    await expect(page.getByText('Tiña capitis y tiña del cuero cabelludo son el mismo diagnóstico.')).toBeVisible();
    await expect(page.getByText('El hidróxido de potasio aclara queratina y permite ver hifas septadas o artroconidios', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tres micosis subcutáneas para la próxima clase' })).toBeVisible();
    await expect(page.getByText('Esporotricosis linfocutánea', { exact: true })).toBeVisible();
    await expect(page.getByText('Cromoblastomicosis', { exact: true })).toBeVisible();
    await expect(page.getByText('Micetoma eumicótico', { exact: true })).toBeVisible();
    const transcript = await page.evaluate(() => window.MED_NYKUTO_LATEST_TRANSCRIPTS.microbiologiaTeorica);
    expect(transcript.oralDate).toBeNull();
    expect(transcript.estimatedClassDate).toBe('2026-08-10');
    expect(transcript.estimatedPreparation.date).toBe('2026-08-17');
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
    await page.goto('/clase.html#bioquimica');
    await page.locator('[data-study-mode="rapido"]').click();
    await expect(page.getByRole('heading', { name: 'El mapa central en cinco minutos' })).toBeVisible();
    await expect(page.getByText('La glucólisis produce 2 piruvatos, 2 ATP netos y 2 NADH.')).toBeVisible();
    await expect(page.locator('[data-study-mode="rapido"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Nutrition revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    const quickView = page.locator('#nutricion [data-nutrition-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Leyes de la alimentación en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Dieta significa patrón habitual, no necesariamente plan hipocalórico.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Epidemiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#epidemiologia');
    const quickView = page.locator('#epidemiologia [data-epi-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Lo esencial de Epidemiología en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Physiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#fisiologia');
    const quickView = page.locator('#fisiologia [data-fisio-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Control respiratorio en cinco minutos' })).toBeVisible();
    await expect(page.getByText('El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches the 10 August gas-exchange revision without exposing the 13 August lesson', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-10');
    const comparison = page.locator('#fisiologia-2026-08-10 [data-fisio-gas-mode="comparar"]');
    await comparison.click();
    await expect(page.getByRole('heading', { name: 'Dos efectos, dos preguntas diferentes' })).toBeVisible();
    await expect(page.getByText('Haldane en pulmón:', { exact: false })).toBeVisible();
    await expect(comparison).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#fisiologia-2026-08-13')).toBeHidden();
  });

  test('switches Microbiology practical revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-practica');
    const quickView = page.locator('#microbiologia-practica [data-micro-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Hongos y Sabouraud en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los mohos son filamentosos: sus hifas forman un micelio.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica');
    const quickView = page.locator('#microbiologia-teorica [data-micro-theory-mode="rapido"]');
    await quickView.click();
    await expect(page.getByRole('heading', { name: 'Dermatofitosis en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.')).toBeVisible();
    await expect(quickView).toHaveAttribute('aria-pressed', 'true');
  });

  test('saves a simple preparation checklist', async ({ page }) => {
    await page.goto('/clase.html#plan-estudio');
    const firstTask = page.locator('#studyChecklist input').first();
    await firstTask.check();
    await expect(page.locator('#planCount')).toHaveText('1/6');
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
      await expect(bottomNavigation.getByRole('link')).toHaveCount(6);
      await expect(bottomNavigation.getByRole('link', { name: 'Plan' })).toBeVisible();
      await expect(page.locator('.header-back')).toBeHidden();
      await expect(page.locator('.workspace-nav')).toBeHidden();

      const mobileLayout = await page.evaluate(() => {
        const next = document.querySelector('.dashboard-next').getBoundingClientRect();
        const switcher = document.querySelector('#semesterSwitcherV402').getBoundingClientRect();
        const bottom = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
        return {
          viewportHeight: window.innerHeight,
          nextTop: next.top,
          switcherWidth: switcher.width,
          switcherBottom: switcher.bottom,
          bottomTop: bottom.top
        };
      });
      expect(mobileLayout.nextTop).toBeLessThan(mobileLayout.viewportHeight * 0.78);
      expect(mobileLayout.switcherWidth).toBeLessThanOrEqual(160);
      expect(mobileLayout.switcherBottom).toBeLessThanOrEqual(mobileLayout.bottomTop);
    } else {
      await expect(bottomNavigation).toBeHidden();
    }
  });

  test('renders the phone timetable as a four-day mini-week aligned to a real hour ruler', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-safari-shape', 'Mobile layout assertion');
    await page.goto('/clase.html#horario');
    const layout = await page.evaluate(() => {
      const grid = document.querySelector('#weeklyAgenda').getBoundingClientRect();
      const days = Array.from(document.querySelectorAll('.agenda-day')).map(day => day.getBoundingClientRect());
      const firstSlot = document.querySelector('.schedule-slot').getBoundingClientRect();
      const firstTeacher = document.querySelector('.schedule-slot small');
      const axis = document.querySelector('.schedule-time-axis');
      const sevenStarts = Array.from(document.querySelectorAll('.schedule-slot[data-start="07:00"]')).map(slot => slot.getBoundingClientRect().top);
      const firstAtSeven = document.querySelector('.schedule-slot[data-start="07:00"]').getBoundingClientRect();
      const firstAtNineTen = document.querySelector('.agenda-day[data-schedule-day="3"] .schedule-slot[data-start="09:10"]').getBoundingClientRect();
      const mondayFirst = document.querySelector('.agenda-day[data-schedule-day="1"] .schedule-slot[data-start="07:00"]').getBoundingClientRect();
      const mondaySecond = document.querySelector('.agenda-day[data-schedule-day="1"] .schedule-slot[data-start="10:10"]').getBoundingClientRect();
      const summary = document.querySelector('.agenda-summary').getBoundingClientRect();
      const switcher = document.querySelector('#semesterSwitcherV402').getBoundingClientRect();
      const header = document.querySelector('.class-header').getBoundingClientRect();
      const highlighted = document.querySelector('.agenda-day.is-next-day [data-week-date]');
      return {
        columnCount:getComputedStyle(document.querySelector('#weeklyAgenda')).gridTemplateColumns.split(' ').length,
        visibleDays:days.filter(day => day.width > 0 && day.height > 0).length,
        alignedDayTops:new Set(days.map(day => Math.round(day.top))).size,
        gridHeight:grid.height,
        gridBottom:grid.bottom,
        summaryTop:summary.top,
        slotHeight:firstSlot.height,
        teacherDisplay:getComputedStyle(firstTeacher).display,
        axisDisplay:getComputedStyle(axis).display,
        axisLabels:axis.querySelectorAll('span').length,
        sevenStartSpread:Math.max(...sevenStarts) - Math.min(...sevenStarts),
        nineTenOffset:firstAtNineTen.top - firstAtSeven.top,
        consecutiveGap:Math.abs(mondaySecond.top - mondayFirst.bottom),
        switcherTop:switcher.top,
        switcherBottom:switcher.bottom,
        headerTop:header.top,
        headerBottom:header.bottom,
        highlightedDate:highlighted ? highlighted.getAttribute('datetime') : null,
        scrollWidth:document.documentElement.scrollWidth,
        clientWidth:document.documentElement.clientWidth
      };
    });
    expect(layout.columnCount).toBe(5);
    expect(layout.visibleDays).toBe(4);
    expect(layout.alignedDayTops).toBe(1);
    expect(layout.gridHeight).toBeLessThan(340);
    expect(layout.gridBottom).toBeLessThanOrEqual(layout.summaryTop);
    expect(layout.slotHeight).toBeLessThan(125);
    expect(layout.teacherDisplay).toBe('none');
    expect(layout.axisDisplay).toBe('block');
    expect(layout.axisLabels).toBe(14);
    expect(layout.sevenStartSpread).toBeLessThanOrEqual(1);
    expect(layout.nineTenOffset).toBeGreaterThan(40);
    expect(layout.consecutiveGap).toBeLessThanOrEqual(1);
    expect(layout.switcherTop).toBeGreaterThanOrEqual(layout.headerTop);
    expect(layout.switcherBottom).toBeLessThanOrEqual(layout.headerBottom + 1);
    expect(layout.highlightedDate).toMatch(/^2026-\d{2}-\d{2}$/);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    await expect(page.locator('.schedule-slot[data-subject]')).toHaveCount(10);
    await expect(page.locator('.agenda-day')).toHaveCount(4);
    await expect(page.locator('#weeklyAgenda .schedule-task-badge')).toHaveCount(5);
  });
});
