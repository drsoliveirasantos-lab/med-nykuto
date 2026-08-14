const { test, expect } = require('@playwright/test');

test.describe('Class hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clase.html');
  });

  test('presents the next useful action before secondary content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tu semana, de un vistazo.' })).toBeVisible();
    await expect(page.getByText('4.º E', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.getByRole('link', { name: /Preparar tres micosis subcutáneas/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Guías \+ regiones y platos/ })).toBeVisible();
    await expect(page.locator('#homeMicroTheoryDate')).toContainText('17 ago');
    await expect(page.locator('#homeNutritionDate')).toContainText('20 ago');
    await expect(page.locator('#homeBioDate')).toContainText('19 ago');
    await expect(page.locator('#homeMicroTheoryDate')).toHaveAttribute('datetime', '2026-08-17');
    await expect(page.locator('#homeNutritionDate')).toHaveAttribute('datetime', '2026-08-20');
    await expect(page.locator('#homeBioDate')).toHaveAttribute('datetime', '2026-08-19');
    await expect(page.locator('.priority-card-head time')).toHaveCount(3);
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

    const toggle = page.locator('#fisiologia [data-detail-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#fisio-detail')).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Horario de 4.º E' })).toBeVisible();
    await expect(page.locator('#nextScheduleSubject')).not.toHaveText('Calculando…');
    await expect(page.locator('#nextScheduleWhen')).toContainText('·');
    await expect(page.getByText('Martes y sábado no presentan clases')).toBeVisible();
  });

  test('keeps the personal lab group separate and local to the device', async ({ page }) => {
    await page.goto('/clase.html#horario');
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
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tarefa de la clase' })).toBeVisible();
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
    await expect(page.locator('#nutritionPrepCard .assignment-status')).toHaveText('ACTIVIDAD CONFIRMADA');
    await expect(page.locator('#bioPrepCard .assignment-status')).toHaveText('ESTIMADA');
    await expect(page.getByText('Toda fecha calculada permanece como')).toBeHidden();
    await page.getByText('Cómo se calcula una fecha').click();
    await expect(page.getByText('Toda fecha calculada permanece como')).toBeVisible();
    await expect(page.getByText('El contenido final siempre corresponde al curso más reciente')).toBeVisible();
  });

  test('organizes the 14 August glycolysis lesson with corrected study points', async ({ page }) => {
    await page.goto('/clase.html#bio-detail');
    await expect(page.getByRole('heading', { name: 'Glucólisis: vía común y balance energético' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Convertir una glucosa en dos piruvatos' })).toBeVisible();
    await expect(page.getByText('2 piruvatos + 2 ATP + 2 NADH', { exact: true })).toBeVisible();
    await expect(page.getByText('PEP → piruvato', { exact: true })).toBeVisible();
    await expect(page.getByText('La glucoquinasa hepática puede quedar secuestrada en el núcleo')).toBeVisible();
    await expect(page.getByText('Bioquímica · 3 transcripciones')).toBeVisible();
  });

  test('separates the two Physiology blocks and prioritizes the 13 August class', async ({ page }) => {
    await page.goto('/clase.html#fisio-detail');
    await expect(page.locator('#fisio-title')).toHaveText('Control nervioso y químico de la respiración');
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
    await expect(nutrition.getByRole('link', { name: 'Vista previa · Instructivo' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(nutrition.getByRole('link', { name: 'Vista previa · Portada' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
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

  test('shows the complete official seminar requirements without leaving Tarefa', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    const task = page.locator('#nutritionPrepCard');
    await expect(task.locator('.seminar-at-a-glance b').first()).toHaveText('2');
    await expect(task.getByText('PowerPoint separados', { exact: true })).toBeVisible();
    await expect(task.getByText('informe para firma y sello', { exact: true })).toBeVisible();
    await task.getByText('Ver la consigna completa', { exact: true }).click();
    await expect(task.getByText('Trabajo 1 · Guías Alimentarias', { exact: true })).toBeVisible();
    await expect(task.getByText('Trabajo 2 · Platos típicos / regiones', { exact: true })).toBeVisible();
    await expect(task.getByText('aproximadamente hasta 5 minutos por grupo', { exact: false })).toBeVisible();
    await expect(task.getByRole('link', { name: 'Ver instructivo y descargar' })).toHaveAttribute('href', 'documentos-seminario.html#instructivo');
    await expect(task.getByRole('link', { name: 'Ver modelo de portada' })).toHaveAttribute('href', 'documentos-seminario.html#modelo-portada');
  });

  test('organizes seminar content, signed report and five-point rubric in accordions', async ({ page }) => {
    await page.goto('/clase.html#nutrition-seminar');
    const seminar = page.locator('#nutrition-seminar');
    await expect(seminar.getByText('Objetivo o mensaje principal.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis nutricional breve y conclusión.', { exact: true })).toBeVisible();

    await seminar.getByText('Informe para firma y sello', { exact: true }).click();
    await expect(seminar.getByText('Nombres y matrícula/código de los integrantes.', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Lic. Johana Belén Leguizamón Vera.', { exact: false })).toBeVisible();

    await seminar.getByText('Rúbrica de calificación · 5 puntos', { exact: true }).click();
    await expect(seminar.locator('.seminar-rubric-grid article')).toHaveCount(5);
    await expect(seminar.getByText('Investigación bibliográfica', { exact: true })).toBeVisible();
    await expect(seminar.getByText('Análisis y conclusión', { exact: true })).toBeVisible();
  });

  test('shows exact Nutrition topics after selecting a group and remembers the choice', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    const selector = page.locator('#nutritionGroupTaskSelect');
    await selector.selectOption('3');
    const output = page.locator('#nutritionPrepCard [data-nutrition-group-output]');
    await expect(output.getByText('Mensajes/Guías 9 al 12 del Paraguay', { exact: true })).toBeVisible();
    await expect(output.getByText('Región Sudeste de Brasil', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 1 · P1 (4)', { exact: true })).toBeVisible();
    await expect(output.getByText('TRABAJO 2 · P2 (5)', { exact: true })).toBeVisible();
    await page.reload();
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
    await expect(page.locator('#nutritionGroupTaskSelect')).toHaveValue('6');
    await expect(page.locator('#nutritionPrepCard [data-nutrition-group-output]').getByText('Platos típicos del Paraguay', { exact: true })).toBeVisible();
  });

  test('loads a useful photographic visual in every non-Nutrition course', async ({ page }) => {
    const courseVisuals = [
      ['fisio-detail', '.course-photo-feature--physiology img'],
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
    await expect(page.getByRole('heading', { name: 'Actividades ya realizadas' })).toBeVisible();
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
    await expect(page.locator('.workspace-nav').getByText('Tarefa', { exact: true })).toBeVisible();
    await page.goto('/clase.html#materias');
    await expect(page.locator('.course-selector .course-icon svg')).toHaveCount(6);
    for (const code of ['NUT', 'FIS', 'BIO', 'EPI', 'MIC', 'LAB']) {
      await expect(page.locator('.course-selector').getByText(code, { exact: true })).toHaveCount(0);
    }
    await expect(page.locator('.resource-grid .resource-icon svg')).toHaveCount(24);
    await expect(page.locator('.resource-grid .resource-code')).toHaveCount(0);
  });

  test('opens map explanations and oral answers in a closable answer sheet', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    const nutrition = page.locator('#nutricion');
    await nutrition.locator('[data-nutrition-mode="completo"]').click();
    await nutrition.locator('.study-map .preview-answer-trigger').first().click();
    const modal = page.locator('#studyAnswerModal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#studyAnswerTitle')).toHaveText('¿Cuánto necesita?');
    await expect(page.locator('#studyAnswerText')).toContainText('Comparar ingesta con gasto');
    await modal.getByRole('button', { name: 'Cerrar respuesta', exact: true }).last().click();
    await expect(modal).toBeHidden();

    await nutrition.locator('[data-nutrition-mode="oral"]').click();
    await nutrition.locator('.oral-list .preview-answer-trigger').first().click();
    await expect(modal).toBeVisible();
    await expect(page.locator('#studyAnswerTitle')).toContainText('diferencia entre alimentación, nutrición y dieta');
    await expect(page.locator('#studyAnswerText')).toContainText('Alimentación es la selección');
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
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
    await page.addInitScript(() => {
      localStorage.setItem('med-nykuto-class-practice-v413', JSON.stringify({
        nutricion:{
          qcm:Array.from({ length:7 }, () => ({ selected:0, correct:true })),
          vf:[],
          cases:[]
        }
      }));
    });
    await page.goto('/clase.html#practice-nutricion');
    const practice = page.locator('#practice-nutricion');
    await expect(practice.getByText('QCM · BLOQUE TERMINADO')).toBeVisible();
    await practice.getByRole('button', { name: 'Elegir otro formato' }).click();
    const picker = practice.locator('.practice-format-picker');
    await expect(picker).toBeVisible();
    await expect(picker.locator('.practice-format-choice')).toHaveCount(3);
    await picker.getByRole('button', { name: /Verdadero \/ Falso/ }).click();
    await expect(practice.getByRole('heading', { name: 'Si una dieta aporta las calorías necesarias, su calidad nutricional está automáticamente garantizada.' })).toBeVisible();

    await page.reload();
    await practice.getByRole('button', { name: 'Repetir QCM' }).click();
    await expect(practice.getByRole('heading', { name: '¿Cuál opción diferencia correctamente alimentación, nutrición y dieta?' })).toBeVisible();
  });

  test('previews both seminar Word documents before download', async ({ page }) => {
    await page.goto('/documentos-seminario.html#modelo-portada');
    await expect(page.getByRole('heading', { name: 'Modelo de portada y desarrollo' })).toBeVisible();
    await expect(page.locator('[data-document-panel="modelo-portada"] img')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/modelo-portada-seminario-nutricion.docx');
    await expect.poll(() => page.locator('[data-document-panel="modelo-portada"] img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);

    await page.getByRole('link', { name: /Instructivo oficial/ }).click();
    await expect(page.getByRole('heading', { name: 'Instructivo de presentación oral' })).toBeVisible();
    await expect(page.locator('[data-document-panel="instructivo"] img')).toHaveCount(3);
    await expect(page.getByRole('link', { name: 'Descargar Word' })).toHaveAttribute('href', 'assets/class-hub/instructivo-presentacion-oral-semana-3.docx');
  });

  test('offers explained QCM, true-false and clinical cases for every current course', async ({ page }) => {
    await page.goto('/clase.html#nutricion');
    await expect(page.locator('[data-practice-root]')).toHaveCount(6);
    const practice = page.locator('#practice-nutricion');
    await expect(practice.getByText('7QCM', { exact: false })).toBeVisible();
    await expect(practice.getByText('4Verdadero / Falso', { exact: false })).toBeVisible();
    await expect(practice.getByText('2Casos clínicos', { exact: false })).toBeVisible();
    await practice.getByRole('button', { name: 'Comenzar entrenamiento' }).click();
    await expect(practice.getByRole('heading', { name: '¿Cuál opción diferencia correctamente alimentación, nutrición y dieta?' })).toBeVisible();
    await expect(practice.locator('.practice-feedback')).toHaveCount(0);
    await practice.getByRole('radio', { name: /Alimentación: elección e ingesta/ }).click();
    await practice.getByRole('button', { name: 'Validar mi respuesta' }).click();
    await expect(practice.locator('.practice-feedback')).toContainText('Respuesta correcta');
    await expect(practice.locator('.practice-feedback')).toContainText('digestión, absorción, metabolismo');

    await page.goto('/clase.html#practice-bioquimica');
    await expect(page.locator('#bioquimica')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-workspace')).toBeVisible();
    await expect(page.locator('#practice-bioquimica .practice-tab')).toHaveCount(3);
  });

  test('organizes Epidemiology into exam points, APS and triage preparation', async ({ page }) => {
    await page.goto('/clase.html#epi-detail');
    await expect(page.getByRole('heading', { name: 'Sectorización, triage, urgencia y emergencia' })).toBeVisible();
    await expect(page.getByText('APS y modelo de atención integral', { exact: true })).toBeVisible();
    await expect(page.locator('#epidemiologia .transcription-rule-note').getByText('Regla aplicada:')).toBeVisible();
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

  test('keeps the semester selector available while the page scrolls', async ({ page }) => {
    const switcher = page.getByLabel('Elegir semestre');
    await expect(switcher).toBeVisible();
    await expect(switcher).toHaveValue('4');
    await page.goto('/clase.html#delegado');
    await page.locator('#delegado').scrollIntoViewIfNeeded();
    await expect(switcher).toBeVisible();
    await expect(page.locator('#semesterSwitcherV402')).toHaveCSS('position', 'fixed');
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
    await page.getByRole('button', { name: /Ficha rápida NUT/ }).click();
    await expect(page.getByRole('heading', { name: 'Leyes de la alimentación en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Dieta significa patrón habitual, no necesariamente plan hipocalórico.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida NUT/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Epidemiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#epidemiologia');
    await page.getByRole('button', { name: /Ficha rápida EPI/ }).click();
    await expect(page.getByRole('heading', { name: 'Lo esencial de Epidemiología en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Alma-Ata se celebró en 1978; Paraguay implementó su estrategia APS en 2008.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida EPI/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Physiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#fisiologia');
    await page.getByRole('button', { name: /Ficha rápida FIS/ }).click();
    await expect(page.getByRole('heading', { name: 'Control respiratorio en cinco minutos' })).toBeVisible();
    await expect(page.getByText('El complejo pre-Bötzinger es esencial para generar el ritmo respiratorio.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida FIS/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches Microbiology practical revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-practica');
    await page.getByRole('button', { name: /Ficha rápida LAB/ }).click();
    await expect(page.getByRole('heading', { name: 'Hongos y Sabouraud en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los mohos son filamentosos: sus hifas forman un micelio.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida LAB/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches theoretical Microbiology revision depth independently', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica');
    await page.getByRole('button', { name: /Ficha rápida MIC/ }).click();
    await expect(page.getByRole('heading', { name: 'Dermatofitosis en cinco minutos' })).toBeVisible();
    await expect(page.getByText('Los tres géneros clásicos son Trichophyton, Microsporum y Epidermophyton.')).toBeVisible();
    await expect(page.getByRole('button', { name: /Ficha rápida MIC/ })).toHaveAttribute('aria-pressed', 'true');
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
      await expect(bottomNavigation.getByRole('link')).toHaveCount(5);
      await expect(page.locator('.header-back')).toBeHidden();
    } else {
      await expect(bottomNavigation).toBeHidden();
    }
  });
});
