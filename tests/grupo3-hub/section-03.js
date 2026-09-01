module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('shows three active tasks and preserves completed homework in the visible archive', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas activas' })).toBeVisible();
    const active = page.locator('#classHubLiveTasks .live-task');
    const activeList = page.locator('#classHubLiveTasks');
    await expect(active).toHaveCount(3);
    await expect(activeList).toContainText('Semana de pruebas prácticas · cinco materias');
    await expect(activeList).toContainText('Exposición grupal de enfermedad sorteada');
    await expect(activeList).toContainText('Actividades 3 y 4 impresas y manuscritas');
    await expect(page.locator('.pending-grid')).toBeVisible();
    await expect(page.locator('.assignment-archive')).toBeVisible();
    await expect(page.locator('#nutritionPrepCard')).toBeVisible();
  });

  test('organizes the 14 August glycolysis lesson with corrected study points', async ({ page }) => {
    await page.goto('/clase.html#bio-detail');
    await expect(page.locator('#bioquimica .notebook-current-title')).toContainText('Glucólisis: vía común y balance energético');
    await expect(page.getByRole('heading', { name: 'Convertir una glucosa en dos piruvatos' })).toBeVisible();
    await expect(page.locator('#bio-detail .net-balance strong')).toHaveText('2 piruvatos + 2 ATP + 2 NADH');
    await expect(page.getByText('PEP → piruvato', { exact: true })).toBeVisible();
    await expect(page.getByText('La glucoquinasa hepática puede quedar secuestrada en el núcleo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'La glucólisis en una sola mirada' })).toBeVisible();
    await expect(page.locator('.bio-board-route article')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Una glucosa se convierte en dos piruvatos' })).toBeVisible();
    await expect(page.locator('.bio-pathway-node')).toHaveCount(4);
    await expect(page.locator('.bio-abbrev-guide')).toHaveCount(0);
    await expect(page.locator('.mn-glossary-term[data-glossary-key="atp"]:visible').first()).toBeVisible();
    await expect(page.getByText('Malato–aspartato: ≈2,5 ATP/NADH; glicerol-3-fosfato: ≈1,5 ATP/NADH.')).toBeVisible();
    await expect(page.getByText('su rendimiento oxidativo no es siempre 2,5 ATP por NADH', { exact: false })).toBeVisible();
    await expect(page.locator('#bioquimica .lesson-date-picker .history-entry')).toHaveCount(6);
  });

  test('opens the faithful glycolysis board archive in its teaching order', async ({ page }) => {
    await page.goto('/clase.html#bioquimica-2026-08-14');
    await page.locator('#bioquimica-2026-08-14 [data-lesson-tab="material"]').click();
    const openArchive = page.locator('#bioquimica-2026-08-14').getByRole('button', { name: /Ver las 7 láminas/ });
    await expect(openArchive).toBeVisible();
    await openArchive.click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-board-archive-slide]')).toHaveCount(7);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 1 DE 7');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/01-mapa-general\.webp$/);
    await expect(page.locator('#boardArchiveSlideTitle')).toHaveText('Mapa general');
    await expect(dialog.locator('[data-board-archive-previous]')).toBeDisabled();

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/02-fase-preparatoria-1-3\.webp$/);
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');

    await dialog.locator('[data-board-archive-slide="6"]').click();
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/07-regulacion-anotada\.webp$/);
    await expect(dialog.locator('[data-board-archive-next]')).toBeDisabled();
    await dialog.press('Home');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/01-mapa-general\.webp$/);
    await dialog.press('ArrowRight');
    await expect(page.locator('#boardArchiveImage')).toHaveAttribute('src', /whiteboard-v2\/02-fase-preparatoria-1-3\.webp$/);

    await dialog.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(openArchive).toBeFocused();
  });

  test('places all fifteen recovered Biochemistry boards in their dated course and unified archive', async ({ page }) => {
    const datedLessons = [
      ['bioquimica-2026-08-14', 7, null],
      ['bioquimica-2026-08-19', 2, 2],
      ['bioquimica-2026-08-21', 3, 3],
      ['bioquimica-2026-08-26', 3, 3]
    ];

    for (const [lessonId, courseBoards, materialBoards] of datedLessons) {
      await page.goto('/clase.html#' + lessonId);
      const lesson = page.locator('#' + lessonId);
      await expect(lesson.locator('[data-lesson-tab-panel="curso"] .course-inline-figure.is-teacher-board')).toHaveCount(courseBoards);
      if (materialBoards !== null) {
        await lesson.locator('[data-lesson-tab="material"]').click();
        await expect(lesson.locator('[data-lesson-tab-panel="material"] .lesson-file-card img[src*="/board/"]')).toHaveCount(materialBoards);
      }
    }

    await page.goto('/archivos.html?course=bioquimica');
    const biochemistry = page.locator('.file-group[data-course="bioquimica"]');
    await expect(biochemistry).toBeVisible();
    await expect(biochemistry.locator('.file-row[data-file-source="local"] a[href*="/board/"], .file-row[data-file-source="local"] a[href*="/whiteboard-v2/"]')).toHaveCount(15);
    await expect(biochemistry.locator('.file-row[data-file-source="local"][data-file-visual="true"] .file-row-preview')).toHaveCount(15);
    await expect(biochemistry.locator('[data-file-badge="board"]')).toHaveCount(15);
    await expect(biochemistry).toContainText('destino aeróbico del piruvato y complejo PDH');
    await expect(biochemistry).toContainText('vía de las pentosas fosfato: objetivos, fases y destinos');
    await expect(biochemistry).toContainText('regulación con anotaciones de la profesora');
  });
};
