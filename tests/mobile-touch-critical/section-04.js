module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('complete lessons stay compact across every subject on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const lessons = [
      { hash: 'nutrition-detail', detail: '#nutrition-detail', cards: '.nutrition-definitions article,.food-functions article,.enrichment-grid article' },
      { hash: 'fisio-detail', detail: '#fisio-detail', cards: '.control-loop li,.resp-centers article,.resp-modulators article' },
      { hash: 'fisio-detail-2026-08-10', detail: '#fisio-detail-2026-08-10', cards: '.gas-core-grid article,.bohr-haldane article' },
      { hash: 'bio-detail', detail: '#bio-detail', cards: '.bio-board-route article,.regulation-grid article' },
      { hash: 'epi-detail', detail: '#epi-detail', cards: '.epi-map-grid article,.dispensary-grid article,.process-strip article,.triage-colors article' },
      { hash: 'micro-theory-detail', detail: '#micro-theory-detail', cards: '.mycosis-core li,.transmission-grid article,.site-grid article,.diagnostic-flow article,.therapy-grid article,.next-mycology-grid article' },
      { hash: 'micro-detail', detail: '#micro-detail', cards: '.sample-grid article,.morphology-grid article,.sabouraud-facts article,.lab-workflow article' }
    ];

    for (const lesson of lessons) {
      await page.goto(`/clase.html#${lesson.hash}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator(lesson.detail)).toBeVisible({ timeout: 10000 });
      const layout = await page.locator(lesson.detail).evaluate((detail, cardsSelector) => {
        const cards = Array.from(detail.querySelectorAll(cardsSelector));
        const boxes = cards.map((card) => card.getBoundingClientRect());
        return {
          cardCount: cards.length,
          maxCardHeight: Math.max(...boxes.map((box) => box.height)),
          fixedMinHeights: cards.map((card) => parseFloat(getComputedStyle(card).minHeight) || 0),
          detailGap: parseFloat(getComputedStyle(detail).gap) || 0,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      }, lesson.cards);

      expect(layout.cardCount).toBeGreaterThan(0);
      expect(Math.max(...layout.fixedMinHeights)).toBe(0);
      expect(layout.maxCardHeight).toBeLessThan(230);
      expect(layout.detailGap).toBeLessThanOrEqual(10);
      expect(layout.overflow).toBeLessThanOrEqual(1);
    }

    await page.goto('/clase.html#nutrition-detail', { waitUntil: 'domcontentloaded' });
    const nutrition = await page.evaluate(() => {
      const equation = document.querySelector('.energy-equation');
      const functions = Array.from(document.querySelectorAll('.food-functions article')).map((item) => item.getBoundingClientRect());
      const disclosure = document.querySelector('#nutrition-detail .mobile-table-disclosure');
      const summary = disclosure.querySelector('summary').getBoundingClientRect();
      return {
        equationColumns: getComputedStyle(equation).gridTemplateColumns.split(' ').length,
        equationHeight: equation.getBoundingClientRect().height,
        functionColumns: getComputedStyle(document.querySelector('.food-functions')).gridTemplateColumns.split(' ').length,
        functionFirstRow: Math.abs(functions[0].top - functions[1].top) < 1,
        disclosureOpen: disclosure.open,
        summaryHeight: summary.height,
        tableDisplay: getComputedStyle(disclosure.querySelector('.table-scroll')).display
      };
    });

    expect(nutrition.equationColumns).toBe(5);
    expect(nutrition.equationHeight).toBeLessThan(70);
    expect(nutrition.functionColumns).toBe(2);
    expect(nutrition.functionFirstRow).toBe(true);
    expect(nutrition.disclosureOpen).toBe(false);
    expect(nutrition.summaryHeight).toBeLessThan(70);
    expect(nutrition.tableDisplay).toBe('none');

    const tableDisclosure = page.locator('#nutrition-detail .mobile-table-disclosure');
    await tableDisclosure.locator(':scope > summary').click();
    await expect(tableDisclosure).toHaveAttribute('open', '');
    await expect(tableDisclosure.locator('.table-scroll')).toBeVisible();
    const openTable = await tableDisclosure.evaluate((disclosure) => {
      const scroller = disclosure.querySelector('.table-scroll');
      const table = disclosure.querySelector('table');
      return {
        tableWiderThanViewport: table.scrollWidth > scroller.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(openTable.tableWiderThanViewport).toBe(true);
    expect(openTable.pageOverflow).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/clase.html#nutrition-detail', { waitUntil: 'domcontentloaded' });
    const desktopTable = page.locator('#nutrition-detail .mobile-table-disclosure').first();
    await expect(desktopTable.locator(':scope > summary')).toBeHidden();
    await expect(desktopTable.locator('.table-scroll')).toBeVisible();
  });

  test('glycolysis board archive stays inside an iPhone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#bioquimica', { waitUntil: 'domcontentloaded' });
    const launch = page.locator('#bioquimica .board-archive-launch');
    await expect(launch).toBeVisible();
    await launch.getByRole('button', { name: /Ver las 7 láminas/ }).click();

    const dialog = page.locator('#bioBoardArchive');
    await expect(dialog).toBeVisible();
    const layout = await dialog.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const close = node.querySelector('[data-board-archive-close]').getBoundingClientRect();
      const image = node.querySelector('#boardArchiveImage').getBoundingClientRect();
      const frame = node.querySelector('.board-archive-image-frame').getBoundingClientRect();
      const thumbnails = node.querySelector('.board-archive-thumbnails');
      return {
        left:box.left,
        right:box.right,
        top:box.top,
        bottom:box.bottom,
        viewportWidth:innerWidth,
        viewportHeight:innerHeight,
        closeWidth:close.width,
        closeHeight:close.height,
        imageWidth:image.width,
        frameWidth:frame.width,
        thumbnailCount:thumbnails.querySelectorAll('[data-board-archive-slide]').length,
        documentOverflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.left).toBeGreaterThanOrEqual(0);
    expect(layout.right).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(layout.viewportHeight);
    expect(layout.closeWidth).toBeGreaterThanOrEqual(44);
    expect(layout.closeHeight).toBeGreaterThanOrEqual(44);
    expect(layout.imageWidth).toBeLessThanOrEqual(layout.frameWidth);
    expect(layout.thumbnailCount).toBe(7);
    expect(layout.documentOverflow).toBeLessThanOrEqual(1);

    await dialog.locator('[data-board-archive-next]').click();
    await expect(page.locator('#boardArchiveCounter')).toHaveText('LÁMINA 2 DE 7');
  });
};
