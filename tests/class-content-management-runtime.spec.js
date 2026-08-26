const { test, expect } = require('@playwright/test');

const SUBJECTS = [
  { id: 'bioquimica-ii', name: 'Bioquímica II' },
  { id: 'epidemiologia-salud-publica', name: 'Epidemiología y Salud Pública' },
  { id: 'fisiologia-ii', name: 'Fisiología II' },
  { id: 'microbiologia-ii-teorica', name: 'Microbiología II · Teórica' },
  { id: 'microbiologia-ii-practica', name: 'Microbiología II · Práctica' },
  { id: 'nutricion', name: 'Nutrición' }
];

function canonicalQuestion(kind, index) {
  const number = index + 1;
  const question = {
    id: `managed-${kind}-${String(number).padStart(2, '0')}`,
    revision: 1,
    question: kind === 'trueFalse'
      ? `La afirmación gestionada número ${number} conserva su explicación.`
      : `¿Cuál es la respuesta gestionada correcta para la pregunta ${number}?`,
    options: kind === 'trueFalse'
      ? ['Verdadero', 'Falso']
      : [`Respuesta A ${number}`, `Respuesta B ${number}`, `Respuesta C ${number}`, `Respuesta D ${number}`],
    answerIndex: kind === 'trueFalse' ? index % 2 : index % 4,
    explanation: `La explicación gestionada ${number} relaciona la respuesta con el mecanismo descrito en el curso publicado.`
  };
  if (kind === 'clinicalCases') {
    question.stem = `Una paciente de ${30 + number} años consulta por un cuadro compatible con la clase gestionada. La evolución y los hallazgos permiten aplicar el mecanismo antes de elegir una respuesta.`;
  }
  return question;
}

function canonicalPractice() {
  return {
    qcm: Array.from({ length: 20 }, (_, index) => canonicalQuestion('qcm', index)),
    trueFalse: Array.from({ length: 10 }, (_, index) => canonicalQuestion('trueFalse', index)),
    clinicalCases: Array.from({ length: 10 }, (_, index) => canonicalQuestion('clinicalCases', index))
  };
}

function publicPayload(lessons) {
  return {
    ok: true,
    class: {
      id: 's4-e',
      slug: '4e',
      name: 'Medicina · 4.º E',
      semester: 4,
      group: 'E',
      theme: 'midnight-gold',
      driveUrl: ''
    },
    subjects: SUBJECTS,
    lessons,
    notices: [],
    tasks: [],
    activities: [],
    groups: [],
    members: [],
    files: [],
    dates: [],
    scheduleSlots: [],
    upcomingDates: [],
    generatedAt: '2026-08-26T12:00:00.000Z'
  };
}

test.describe('Published class content student runtime', () => {
  test('overlays a canonical 20/10/10 lesson in Materias and mounts revisioned safe training', async ({ page }) => {
    const managedLesson = {
      id: 'managed-fisiologia-2026-08-24',
      subjectId: 'fisiologia-ii',
      lessonDate: '2026-08-24',
      title: 'Sensibilidades somáticas · versión gestionada',
      description: 'Contenido publicado desde la gestión de la clase.',
      status: 'published',
      revision: 9,
      practiceRevision: 7,
      full: [
        '# CURSO COMPLETO GESTIONADO',
        '',
        'Este texto procede de la publicación canónica.',
        '',
        '<img src="x" onerror="window.__managedContentInjected = true">'
      ].join('\n'),
      quick: '## FICHA RÁPIDA GESTIONADA\n\n- Ancla rápida propia.\n- Segundo punto propio.',
      ultra: '## FICHA ULTRA GESTIONADA\n\n> Recuerdo ultra propio.',
      practice: canonicalPractice()
    };
    await page.route('**/api/class-hub?class=s4-e&resource=public', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(publicPayload([managedLesson]))
    }));

    await page.goto('/clase.html#fisiologia-2026-08-24', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/academic-notebook-ready/);

    const panel = page.locator('#fisiologia-2026-08-24');
    await expect(page.locator('#fisiologia')).toBeVisible();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('data-managed-lesson', 'true');
    await expect(panel.locator('[data-lesson-tab-panel="curso"]')).toContainText('CURSO COMPLETO GESTIONADO');
    await expect(panel.locator('[data-managed-markdown] img')).toHaveCount(0);
    await expect(panel.locator('[data-lesson-tab-panel="curso"]')).toContainText('<img src="x"');
    expect(await page.evaluate(() => window.__managedContentInjected)).toBeUndefined();

    const quickTab = panel.locator('[data-lesson-tab="rapida"]');
    await expect(panel.locator('[data-lesson-tabs]')).toHaveAttribute('role', 'tablist');
    await expect(quickTab).toHaveAttribute('role', 'tab');
    await expect(quickTab).toHaveAttribute('aria-controls', 'fisiologia-2026-08-24-panel-rapida');
    await expect(panel.locator('[data-lesson-tab-panel="rapida"]')).toHaveAttribute('aria-labelledby', 'fisiologia-2026-08-24-tab-rapida');
    await quickTab.click();
    await expect(quickTab).toHaveAttribute('aria-selected', 'true');
    await expect(panel.locator('[data-lesson-tab-panel="rapida"]')).toBeVisible();
    await expect(panel.locator('[data-lesson-tab-panel="rapida"]')).toContainText('FICHA RÁPIDA GESTIONADA');
    await quickTab.press('ArrowRight');
    await expect(panel.locator('[data-lesson-tab-panel="ultra"]')).toBeVisible();
    await expect(panel.locator('[data-lesson-tab-panel="ultra"]')).toContainText('FICHA ULTRA GESTIONADA');

    const practiceId = 'fisiologia-2026-08-24-practice-r7';
    await panel.locator('[data-lesson-tab="training"]').click();
    const practice = panel.locator(`.practice-module[data-practice-root="${practiceId}"]`);
    await expect(practice).toBeVisible();
    await expect(practice.locator('.practice-counts strong')).toHaveText(['20', '10', '10']);

    const runtimeState = await page.evaluate((expectedPracticeId) => {
      const lesson = window.MedNykutoAcademicModel.subjects.fisiologia.chapters
        .flatMap((chapter) => chapter.lessons)
        .find((candidate) => candidate.id === 'fisiologia-2026-08-24');
      const bank = window.MedNykutoClassPractice.banks[expectedPracticeId];
      return {
        title: lesson && lesson.title,
        managedContent: lesson && lesson.managedContent,
        practiceId: lesson && lesson.practiceId,
        counts: bank && [bank.qcm.length, bank.vf.length, bank.cases.length],
        oldBankPresent: Boolean(window.MedNykutoClassPractice.banks['fisiologia-2026-08-24']),
        controllerPresent: Boolean(window.MedNykutoClassPractice.controllers[expectedPracticeId]),
        oldControllerPresent: Boolean(window.MedNykutoClassPractice.controllers['fisiologia-2026-08-24']),
        staticSourceHidden: Boolean(document.querySelector('[data-managed-static-source-for="fisiologia-2026-08-24"][data-notebook-persistent][hidden]'))
      };
    }, practiceId);
    expect(runtimeState).toEqual({
      title: managedLesson.title,
      managedContent: true,
      practiceId,
      counts: [20, 10, 10],
      oldBankPresent: false,
      controllerPresent: true,
      oldControllerPresent: false,
      staticSourceHidden: true
    });
  });

  test('keeps the static lesson, academic model and bank unchanged when the public API fails', async ({ page }) => {
    await page.route('**/api/class-hub?class=s4-e&resource=public', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, code: 'database_unavailable' })
    }));

    await page.goto('/clase.html#fisiologia-2026-08-24', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/academic-notebook-ready/);
    const panel = page.locator('#fisiologia-2026-08-24');
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveAttribute('data-managed-lesson', 'true');
    await expect(page.locator('[data-managed-static-source-for="fisiologia-2026-08-24"]')).toHaveCount(0);

    const staticState = await page.evaluate(() => {
      const lesson = window.MedNykutoAcademicModel.subjects.fisiologia.chapters
        .flatMap((chapter) => chapter.lessons)
        .find((candidate) => candidate.id === 'fisiologia-2026-08-24');
      const bank = window.MedNykutoClassPractice.banks['fisiologia-2026-08-24'];
      return {
        title: lesson && lesson.title,
        practiceId: lesson && lesson.practiceId,
        managedContent: lesson && lesson.managedContent,
        counts: bank && [bank.qcm.length, bank.vf.length, bank.cases.length],
        revisionedKeys: Object.keys(window.MedNykutoClassPractice.banks).filter((key) => key.includes('-practice-r'))
      };
    });
    expect(staticState).toEqual({
      title: 'Sensibilidades somáticas',
      practiceId: 'fisiologia-2026-08-24',
      managedContent: undefined,
      counts: [20, 10, 10],
      revisionedKeys: []
    });
  });
});
