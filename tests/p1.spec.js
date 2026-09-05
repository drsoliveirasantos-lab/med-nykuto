const { test, expect } = require('@playwright/test');

test.describe('P1 cumulative review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/p1.html');
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
  });

  test('shows a compact cumulative sheet for all six subjects', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Repaso P1' })).toHaveCount(1);
    await expect(page.locator('#p1LessonCount')).toHaveText('18');
    await expect(page.locator('#p1QuestionCount')).toHaveText('720');
    await expect(page.locator('#p1SubjectRail')).toBeVisible();
    await expect(page.locator('#p1SubjectRail [data-subject-id="all"]')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /Ficha P1/ }).click();
    await expect(page.locator('#p1SubjectRail')).toBeHidden();
    await expect(page.locator('.p1-subject-card')).toHaveCount(6);
    await expect(page.locator('.p1-bottom-nav a')).toHaveCount(5);
    await expect(page.locator('.p1-bottom-nav')).not.toContainText('Avisos');

    await page.getByRole('button', { name: /Nutrición/ }).first().click();
    await expect(page.locator('#p1SubjectRail')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nutrición · P1' })).toBeVisible();
    await expect(page.locator('.p1-lesson')).toHaveCount(2);
    await expect(page.getByText(/trabajadas hasta el 27 de agosto/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Introducción al estudio nutricional/ })).toHaveAttribute('href', /drive\.google\.com/);
  });

  test('adds Bioquímica 28 to P1 questions without duplicating its full course sheet', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha P1/ }).click();
    await page.locator('.p1-subject-card').filter({ hasText: 'Bioquímica II' }).click();
    await expect(page.getByRole('heading', { name: 'Bioquímica II · P1' })).toBeVisible();
    await expect(page.locator('.p1-lesson')).toHaveCount(4);
    await expect(page.getByText(/Su curso completo permanece en el cuaderno de la clase/)).toBeVisible();

    const audit = await page.evaluate(() => {
      const questions = window.MedNykutoP1.collectQuestions(['bioquimica'], false);
      const bank = window.MedNykutoClassPractice.banks['bioquimica-2026-08-28'];
      const bankQuestions = ['qcm', 'vf', 'cases'].flatMap((type) => bank[type]);
      const exam = window.MedNykutoP1.buildExam({ seed: 20260830, subjectIds: ['bioquimica'], length: 40 });
      return {
        total: questions.length,
        practiceIds: [...new Set(questions.map((item) => item.practiceId))],
        bankAngles: [...new Set(bankQuestions.map((item) => item.teacherAngle))],
        sampledAngles: [...new Set(exam.items.map((item) => item.teacherAngle))]
      };
    });
    expect(audit.total).toBe(200);
    expect(audit.practiceIds).toContain('bioquimica-2026-08-28');
    expect(audit.bankAngles.sort()).toEqual(['consecuencia', 'integracion-clinica', 'mecanismo', 'por-que'].sort());
    expect(audit.sampledAngles.sort()).toEqual(['consecuencia', 'integracion-clinica', 'mecanismo', 'por-que'].sort());
  });

  test('keeps quick presets and advanced subject filters mutually exclusive', async ({ page }) => {
    const rail = page.locator('#p1SubjectRail');
    const customize = page.locator('#p1ExamCustomize');
    const nutritionPreset = rail.locator('[data-subject-id="nutricion"]');

    await expect(rail).toBeVisible();
    await expect(customize).not.toHaveAttribute('open', '');
    await nutritionPreset.click();
    await expect(nutritionPreset).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#p1CustomizeStatus')).toHaveText('Solo Nutrición');
    await expect(page.locator('#p1ExamSubjects input:checked')).toHaveCount(1);
    await expect(page.locator('#p1ExamSubjects input[value="nutricion"]')).toBeChecked();

    await customize.locator('summary').click();
    await expect(customize).toHaveAttribute('open', '');
    await expect(rail).toBeHidden();
    await page.locator('#p1ExamSubjects input[value="fisiologia"]').check();
    await expect(page.locator('#p1CustomizeStatus')).toHaveText('2 materias');

    await customize.locator('summary').click();
    await expect(rail).toBeVisible();
    await expect(rail.locator('[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#p1SubjectCustomState')).toHaveText('Personalizado · 2');

    await page.getByRole('button', { name: 'Empezar entrenamiento' }).click();
    await expect(rail).toBeHidden();
    const sessionSubjects = await page.evaluate(() => [...new Set(window.MedNykutoP1.getSession().items.map((item) => item.subjectId))]);
    expect(sessionSubjects.sort()).toEqual(['fisiologia', 'nutricion']);
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

  test('keeps the P1 physiology sheet respiratory-only', async ({ page }) => {
    await page.getByRole('button', { name: /Ficha P1/ }).click();
    await page.locator('.p1-subject-card').filter({ hasText: 'Fisiología II' }).click();
    await expect(page.locator('.p1-teacher-block')).toContainText('Ley de Fick');
    await expect(page.locator('.p1-teacher-block')).toContainText('gasometría');
    await expect(page.locator('.p1-teacher-block')).not.toContainText('Sinapsis');
    await expect(page.locator('.p1-teacher-block')).not.toContainText('Transducción');
  });

  test('builds a ten-field answer-safe visual microbiology practice', async ({ page }) => {
    const visual = await page.evaluate(() => {
      const exam = window.MedNykutoP1.buildExam({ seed: 20260830, visualOnly: true, mode: 'training' });
      return {
        kind: exam.kind,
        ids: exam.items.map((item) => item.visualRecognitionId),
        sources: exam.items.map((item) => item.imageSrc),
        alts: exam.items.map((item) => item.imageAlt),
        pending: exam.items.map((item) => item.validationPending)
      };
    });
    expect(visual.kind).toBe('visual-recognition');
    expect(visual.ids).toHaveLength(10);
    expect(new Set(visual.ids).size).toBe(10);
    expect(new Set(visual.sources).size).toBe(10);
    expect(visual.sources.every((src) => /^assets\/courses\/2026-08-27\/micro-p1\/micro-p1-[a-f0-9]{10}\.webp$/.test(src))).toBe(true);
    expect(visual.alts.every((alt) => alt === 'Micrografía de microbiología práctica para identificar')).toBe(true);
    expect(visual.pending.every(Boolean)).toBe(true);
  });

  test('opens the 53-field PDF practice, zooms in-page and reveals clues only after correction', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // The UI uses the current PDF overlay; the base 10-field bank above stays isolated.
    const launcher = page.locator('#p1StartVisual');
    await expect(launcher).toContainText('Reconocer 53 imágenes');
    await launcher.click();

    const dialog = page.getByRole('dialog', { name: 'Reconocimiento visual en curso' });
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 53');
    const image = dialog.locator('#p1Question .p1-question-media img');
    await expect(image).toHaveAttribute('alt', /^Imagen \d+ del PDF P1 Micro Práctica$/);
    await expect(image).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
    await expect.poll(() => image.evaluate((node) => ({
      width: node.naturalWidth, height: node.naturalHeight
    }))).toEqual({ width: 220, height: 220 });
    const visualAudit = await page.evaluate(() => {
      const session = window.MedNykutoP1.getSession();
      const base = window.MedNykutoP1.buildExam({ seed: 20260830, visualOnly: true, mode: 'training' });
      return {
        kind: session.kind,
        total: session.items.length,
        uniqueIds: new Set(session.items.map((item) => item.visualRecognitionId)).size,
        pdfOnly: session.items.every((item) => /^micro-p1-practica-pdf-\d{3}$/.test(item.visualRecognitionId)),
        neutralAlts: session.items.every((item) => /^Imagen \d+ del PDF P1 Micro Práctica$/.test(item.imageAlt)),
        confirmed: session.items.every((item) => item.validationPending === false),
        baseTotal: base.items.length
      };
    });
    expect(visualAudit).toEqual({
      kind: 'visual-recognition', total: 53, uniqueIds: 53,
      pdfOnly: true, neutralAlts: true, confirmed: true, baseTotal: 10
    });
    await expect(dialog.locator('#p1Question .p1-review-body')).toHaveCount(0);
    await expect(dialog.locator('#p1Question .p1-visual-clues')).toHaveCount(0);
    const imageLayout = await image.evaluate((node) => ({
      height: node.getBoundingClientRect().height,
      viewportHeight: window.innerHeight
    }));
    expect(imageLayout.height).toBeLessThanOrEqual(Math.min(220, imageLayout.viewportHeight * 0.26) + 1);
    await expect(dialog.locator('.p1-option').nth(1)).toBeInViewport();
    await expect(dialog.locator('.p1-validation-badge')).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Ampliar la micrografía sin salir de la práctica' }).click();
    const viewer = dialog.getByRole('region', { name: 'Ampliación de la micrografía' });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole('button', { name: 'Cerrar la imagen ampliada' })).toBeFocused();
    await viewer.getByRole('button', { name: 'Ampliar la imagen' }).click();
    await expect(viewer.getByRole('button', { name: '150 %' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(viewer).toBeHidden();
    await expect(dialog).toHaveAttribute('open', '');

    await dialog.locator('.p1-option').first().click();
    await dialog.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(dialog.locator('#p1Question .p1-review-body')).toContainText('Claves visuales:');
    await expect(dialog.locator('#p1Question .p1-review-body')).toContainText('Según el gabarito docente');
    await expect(dialog.locator('#p1Question .p1-review-body')).toContainText('Fuente: P1 Micro Práctica.');
  });

  test('shows and preserves immediate correction in training mode', async ({ page }) => {
    let communityPosts = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/community')) communityPosts += 1;
    });
    await expect(page.getByLabel('Entrenamiento · corrección inmediata')).toBeChecked();
    await expect(page.getByRole('button', { name: 'Empezar entrenamiento' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar entrenamiento' }).click();
    await expect(page.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 40');
    expect(await page.evaluate(() => window.MedNykutoP1.getSession().mode)).toBe('training');

    await page.locator('.p1-option').first().click();
    await expect(page.locator('.p1-review-body')).toHaveCount(0);
    await expect(page.locator('#p1AnsweredCount')).toHaveText('0 respondidas');
    await page.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(page.locator('#p1Question input[name="p1-answer"]').first()).toBeDisabled();
    await expect(page.locator('#p1Question .p1-option.is-correct-answer')).toHaveCount(1);
    await expect(page.locator('#p1Question .p1-review-body')).toContainText('Respuesta correcta:');
    await expect(page.locator('#p1Question .p1-review-body')).toContainText('Por qué:');
    await expect(page.locator('#p1AnsweredCount')).toHaveText('1 respondida');

    await page.getByRole('button', { name: 'Salir y continuar después' }).click();
    await expect(page.locator('#p1ResumeLabel')).toContainText('Entrenamiento · 1 de 40');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    await page.getByRole('button', { name: 'Continuar' }).click();
    expect(await page.evaluate(() => window.MedNykutoP1.getSession().mode)).toBe('training');
    await expect(page.locator('#p1Question input[name="p1-answer"]').first()).toBeDisabled();
    await expect(page.locator('#p1Question .p1-review-body')).toContainText('Por qué:');
    expect(communityPosts).toBe(0);
  });

  test('opens practice in a full-screen modal and restores the page after closing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '640px';
      spacer.setAttribute('aria-hidden', 'true');
      document.body.prepend(spacer);
    });
    const start = page.getByRole('button', { name: 'Empezar entrenamiento' });
    await start.scrollIntoViewIfNeeded();
    const pageScrollBefore = await page.evaluate(() => window.scrollY);
    expect(pageScrollBefore).toBeGreaterThan(0);
    await start.click();

    const dialog = page.getByRole('dialog', { name: 'Entrenamiento en curso' });
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 40');
    await expect(page.locator('html')).toHaveClass(/p1-practice-open/);
    await expect(page.locator('body')).toHaveClass(/p1-practice-open/);
    await expect(page.locator('.p1-bottom-nav')).toBeHidden();
    await expect(dialog.getByRole('button', { name: 'Cerrar la práctica y continuar después' })).toBeFocused();
    const layout = await dialog.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const bodyStyle = getComputedStyle(document.body);
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bodyPosition: bodyStyle.position,
        horizontalOverflow: node.scrollWidth - node.clientWidth
      };
    });
    expect(layout.top).toBeCloseTo(0, 0);
    expect(layout.left).toBeCloseTo(0, 0);
    expect(layout.width).toBeCloseTo(390, 0);
    expect(layout.height).toBeCloseTo(844, 0);
    expect(layout.bodyPosition).toBe('fixed');
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);

    const scroller = dialog.locator('#p1PracticeDialogScroll');
    const firstOption = page.locator('.p1-option').first();
    await firstOption.scrollIntoViewIfNeeded();
    const selectionScrollBefore = await scroller.evaluate((node) => node.scrollTop);
    await firstOption.click();
    await expect.poll(async () => Math.abs((await scroller.evaluate((node) => node.scrollTop)) - selectionScrollBefore)).toBeLessThanOrEqual(2);
    await scroller.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    await dialog.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(dialog.locator('#p1AnswerAnnouncement')).toHaveText(/Respuesta (correcta|incorrecta)/);
    const feedback = dialog.locator('#p1Question .p1-review-item');
    await expect(feedback).toBeVisible();
    await expect.poll(async () => feedback.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const viewport = document.getElementById('p1PracticeDialogScroll').getBoundingClientRect();
      return rect.top < viewport.bottom && rect.bottom > viewport.top;
    })).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#p1PracticeDialog')).not.toHaveAttribute('open', '');
    await expect(page.locator('html')).not.toHaveClass(/p1-practice-open/);
    await expect(page.locator('body')).not.toHaveClass(/p1-practice-open/);
    await expect(page.locator('#p1Resume')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);
    await expect(start).toBeFocused();

    const resume = page.getByRole('button', { name: 'Continuar' });
    await resume.click();
    await expect(dialog).toHaveAttribute('open', '');
    await expect(page.locator('#p1Question input[name="p1-answer"]').first()).toBeChecked();
    await dialog.getByRole('button', { name: 'Cerrar la práctica y continuar después' }).click();
    await expect(page.locator('#p1PracticeDialog')).not.toHaveAttribute('open', '');
    await expect(resume).toBeFocused();
  });

  test('hides correction in exam mode until completion and resumes the same attempt', async ({ page }) => {
    let communityPosts = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/community')) communityPosts += 1;
    });
    await page.getByLabel('Examen blanco · corrección al final').check();
    await page.getByRole('button', { name: 'Empezar examen blanco' }).click();
    await expect(page.locator('#p1QuestionPosition')).toHaveText('Pregunta 1 de 40');
    expect(await page.evaluate(() => window.MedNykutoP1.getSession().mode)).toBe('exam');
    await expect(page.locator('.p1-review-body')).toHaveCount(0);
    await expect(page.locator('#p1Question')).not.toContainText('Por qué:');

    const firstId = await page.evaluate(() => window.MedNykutoP1.getSession().items[0].id);
    await page.locator('.p1-option').first().click();
    await page.getByRole('button', { name: 'Salir y continuar después' }).click();
    await expect(page.locator('#p1Resume')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    await page.getByRole('button', { name: 'Continuar' }).click();
    expect(await page.evaluate(() => window.MedNykutoP1.getSession().items[0].id)).toBe(firstId);

    await page.evaluate(() => {
      const session = window.MedNykutoP1.getSession();
      session.items.forEach((item) => { session.answers[item.id] = 0; });
      localStorage.setItem(window.MedNykutoP1.storageKey, JSON.stringify(session));
    });
    await page.reload();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('button', { name: 'Ver resultado', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Ver resultado', exact: true }).click();
    await expect(page.getByText('RESULTADO DEL EXAMEN BLANCO', { exact: true })).toBeVisible();
    await expect(page.locator('.p1-review-body').first()).toBeHidden();
    expect(communityPosts).toBe(0);
  });

  test('keeps the final training correction before the direct result button', async ({ page }) => {
    await page.getByRole('button', { name: 'Empezar entrenamiento' }).click();
    await page.evaluate(() => {
      const session = window.MedNykutoP1.getSession();
      session.items.slice(0, -1).forEach((item) => {
        session.answers[item.id] = 0;
        session.validated[item.id] = true;
      });
      session.currentIndex = session.items.length - 1;
      localStorage.setItem(window.MedNykutoP1.storageKey, JSON.stringify(session));
    });
    await page.reload();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.locator('.p1-option').first().click();
    await page.getByRole('button', { name: 'Comprobar respuesta' }).click();
    await expect(page.locator('#p1Question .p1-review-body')).toContainText('Por qué:');
    const resultAction = page.getByRole('button', { name: 'Ver resultado →', exact: true });
    await expect(resultAction).toBeEnabled();
    await resultAction.click();
    await expect(page.getByText('RESUMEN DEL ENTRENAMIENTO')).toBeVisible();
  });

  test('fits narrow iPhone widths without document overflow', async ({ page }) => {
    for (const width of [320, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      await expect(page.locator('html')).toHaveClass(/p1-ready/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.locator('.p1-view-switch')).toBeVisible();
      const activeNavigation = await page.locator('#p1BottomPartial').evaluate((active) => {
        const navigationElement = active.closest('.p1-bottom-nav');
        const navigation = navigationElement.getBoundingClientRect();
        const item = active.getBoundingClientRect();
        return {
          left: item.left - navigation.left,
          right: navigation.right - item.right,
          overflow: navigationElement.scrollWidth - navigationElement.clientWidth,
          minHeight: Math.min(...Array.from(navigationElement.querySelectorAll('a'), (link) => link.getBoundingClientRect().height))
        };
      });
      expect(activeNavigation.left).toBeGreaterThanOrEqual(-1);
      expect(activeNavigation.right).toBeGreaterThanOrEqual(-1);
      expect(activeNavigation.overflow).toBeLessThanOrEqual(1);
      expect(activeNavigation.minHeight).toBeGreaterThanOrEqual(56);
    }

    await page.setViewportSize({ width: 844, height: 390 });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/p1-ready/);
    await expect(page.locator('.p1-bottom-nav')).toBeVisible();
    const landscapeLayout = await page.evaluate(() => {
      const header = document.querySelector('.p1-header');
      const nav = document.querySelector('.p1-bottom-nav');
      const navBox = nav.getBoundingClientRect();
      const navItems = Array.from(nav.querySelectorAll('a')).map((item) => item.getBoundingClientRect());
      return {
        headerHeight: header.getBoundingClientRect().height,
        headerOverflow: header.scrollWidth - header.clientWidth,
        navWidth: navBox.width,
        navCount: navItems.length,
        navOverflow: nav.scrollWidth - nav.clientWidth,
        minNavItemHeight: Math.min(...navItems.map((item) => item.height)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(landscapeLayout.headerHeight).toBeLessThanOrEqual(80);
    expect(landscapeLayout.headerOverflow).toBeLessThanOrEqual(1);
    expect(landscapeLayout.navWidth).toBeLessThanOrEqual(640);
    expect(landscapeLayout.navCount).toBe(5);
    expect(landscapeLayout.navOverflow).toBeLessThanOrEqual(1);
    expect(landscapeLayout.minNavItemHeight).toBeGreaterThanOrEqual(58);
    expect(landscapeLayout.overflow).toBeLessThanOrEqual(1);
  });
});
