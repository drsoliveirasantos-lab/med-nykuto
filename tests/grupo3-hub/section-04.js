module.exports = ({ test, expect, CLASS_DRIVE_URL }) => {
  test('keeps the glycolysis diagram and direct acronym definitions compact on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bio-detail');

    const layout = await page.evaluate(() => {
      const map = document.querySelector('.bio-pathway-map').getBoundingClientRect();
      return {
        mapHeight: map.height,
        mapWidth: map.width,
        sectionWidth: document.querySelector('.bio-visual-lesson').getBoundingClientRect().width,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(layout.mapHeight).toBeLessThan(125);
    expect(layout.mapWidth).toBeLessThanOrEqual(layout.sectionWidth);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);

    const nadh = page.locator('.mn-glossary-term[data-glossary-key="nadh"]:visible').first();
    await expect(nadh).toBeVisible({ timeout:15000 });
    await nadh.evaluate(node => node.scrollIntoView({ block:'center', inline:'nearest' }));
    await nadh.click();
    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover).toBeVisible();
    await expect(popover.locator('.mn-glossary-expanded-name')).toContainText('Dinucleótido de nicotinamida y adenina');
    await expect(popover.getByText('Nicotinamida', { exact:true })).toBeVisible();
    await expect(popover.getByText('Hidrógeno recibido', { exact:true })).toBeVisible();
    const popoverBounds = await popover.evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom, width:window.innerWidth, height:window.innerHeight };
    });
    expect(popoverBounds.left).toBeGreaterThanOrEqual(0);
    expect(popoverBounds.right).toBeLessThanOrEqual(popoverBounds.width);
    expect(popoverBounds.top).toBeGreaterThanOrEqual(0);
    expect(popoverBounds.bottom).toBeLessThanOrEqual(popoverBounds.height);
  });

  test('opens both teacher PDF decks inside the Microbiology archive', async ({ page }) => {
    await page.goto('/clase.html#microbiologia-teorica-2026-08-10');
    await page.locator('#microbiologia-teorica-2026-08-10 [data-lesson-tab="material"]').click();
    const launchers = page.locator('#microbiologia-teorica-2026-08-10 [data-micro-archive-open]');
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

  test('opens all three teacher documents inside the Epidemiology archive', async ({ page }) => {
    await page.goto('/clase.html#epidemiologia-bloque-anterior');
    await page.locator('#epidemiologia-bloque-anterior [data-lesson-tab="material"]').click();
    await expect(page.locator('.epi-material-archive [data-epi-archive-open]')).toHaveCount(3);
    const firstLauncher = page.locator('.epi-material-archive [data-epi-archive-open="aps"]');
    await firstLauncher.click();

    const dialog = page.locator('#epiDocumentArchive');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-epi-archive-slide]')).toHaveCount(36);
    await expect(page.locator('#epiDocumentArchiveImage')).toHaveAttribute('src', /aps-slides\/01\.webp$/);
    await expect(page.locator('#epiDocumentArchiveDownload')).toHaveAttribute('href', /atencion-primaria-salud\.pptx$/);

    await dialog.locator('[data-epi-archive-document="rac"]').click();
    await expect(dialog.locator('[data-epi-archive-slide]')).toHaveCount(3);
    await expect(page.locator('#epiDocumentArchiveImage')).toHaveAttribute('src', /rac-pages\/01-cover\.webp$/);
    await expect(page.locator('#epiDocumentArchiveDownload')).toHaveAttribute('href', /manual-rac-paraguay-2011\.pdf$/);

    await dialog.locator('[data-epi-archive-document="salud"]').click();
    await expect(dialog.locator('[data-epi-archive-slide]')).toHaveCount(3);
    await expect(page.locator('#epiDocumentArchiveImage')).toHaveAttribute('src', /salud-publica-pages\/01-cover\.webp$/);
    await expect(page.locator('#epiDocumentArchiveDownload')).toHaveAttribute('href', /salud-publica-paraguay\.pdf$/);
    await dialog.getByRole('button', { name:'Cerrar archivo de Epidemiología' }).click();
    await expect(dialog).toBeHidden();
    await expect(firstLauncher).toBeFocused();
  });

  test('keeps the completed RAC homework out of active tasks while preserving its course source', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#epiPrepCard')).toBeHidden();
    await expect(page.locator('#classHubLiveTasks')).not.toContainText('Clasificación de riesgo RAC');

    await page.goto('/clase.html#epidemiologia-bloque-anterior');
    await page.locator('#epidemiologia-bloque-anterior [data-lesson-tab="material"]').click();
    await expect(page.locator('.epi-material-archive [data-epi-archive-open="rac"]')).toBeVisible();
  });
};
