module.exports = ({ test, expect, openPractice, answerFirstVisibleOption, dismissSemesterPicker }) => {
  test('medical definitions stay compact and readable above the tapped word on iPhone', async ({ page }) => {
    await page.goto('/clase.html#fisiologia-2026-08-13', { waitUntil: 'domcontentloaded' });
    const term = page.locator('#fisiologia-2026-08-13 [data-lesson-tab-panel="curso"] .mn-glossary-term[data-glossary-key="hypercapnia"]:visible').first();
    await expect(term).toBeVisible({ timeout: 15000 });
    await term.evaluate(node => node.scrollIntoView({ block:'center', inline:'nearest' }));
    await term.click();
    const popover = page.locator('#mnMedicalGlossaryPopover');
    await expect(popover).toBeVisible();

    const layout = await page.evaluate(() => {
      const trigger = document.querySelector('.mn-glossary-term[data-glossary-key="hypercapnia"][aria-expanded="true"]');
      const panel = document.getElementById('mnMedicalGlossaryPopover');
      const close = panel.querySelector('.mn-glossary-close');
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      return {
        placement:panel.dataset.placement,
        panelLeft:panelRect.left,
        panelRight:panelRect.right,
        panelBottom:panelRect.bottom,
        triggerTop:triggerRect.top,
        panelWidth:panelRect.width,
        closeWidth:closeRect.width,
        closeHeight:closeRect.height,
        viewport:window.innerWidth,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(layout.placement).toBe('above');
    expect(layout.panelLeft).toBeGreaterThanOrEqual(7);
    expect(layout.panelRight).toBeLessThanOrEqual(layout.viewport - 7);
    expect(layout.panelBottom).toBeLessThanOrEqual(layout.triggerTop);
    expect(layout.panelWidth).toBeLessThanOrEqual(layout.viewport - 16);
    expect(layout.closeWidth).toBeGreaterThanOrEqual(36);
    expect(layout.closeHeight).toBeGreaterThanOrEqual(36);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  });

  test('dedicated study page stays compact and switches grouped topics on iPhone', async ({ page }) => {
    await page.route('**/api/community**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok:true,
          week:{key:'2026-08-10',start:'2026-08-10',end:'2026-08-16'},
          challenge:{goal:1000,points:0,questions:0,participants:0,records:0,progress:0},
          ranking:[],
          currentUser:null
        })
      });
    });
    await page.goto('/comunidade.html', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Estudia por materia y tema.' })).toBeVisible();
    await expect(page.locator('#studySubjectPicker .study-subject-option')).toHaveCount(6);

    const initial = await page.evaluate(() => {
      const subjects = Array.from(document.querySelectorAll('.study-subject-option')).map(node => node.getBoundingClientRect());
      const picker = document.getElementById('studySubjectPicker');
      const practice = document.querySelector('#studyPracticeHost .practice-overview').getBoundingClientRect();
      const counts = Array.from(document.querySelectorAll('#studyPracticeHost .practice-counts > span')).map(node => node.getBoundingClientRect());
      return {
        columns:getComputedStyle(picker).gridTemplateColumns.split(' ').length,
        maxSubjectHeight:Math.max(...subjects.map(item => item.height)),
        practiceHeight:practice.height,
        countRows:new Set(counts.map(item => Math.round(item.top))).size,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(initial.columns).toBe(2);
    expect(initial.maxSubjectHeight).toBeLessThan(72);
    expect(initial.practiceHeight).toBeLessThan(240);
    expect(initial.countRows).toBe(1);
    expect(initial.overflow).toBeLessThanOrEqual(1);

    await page.locator('[data-study-subject="fisiologia"]').click();
    await expect(page.locator('#studyTopicPicker .study-topic-option')).toHaveCount(5);
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-24"]')).toBeVisible();
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-20"]')).toBeVisible();
    await expect(page.locator('[data-study-topic="fisiologia-2026-08-17"]')).toBeVisible();
    await page.locator('[data-study-topic="fisiologia-2026-08-10"]').click();
    await expect(page.locator('#studyPracticeHost #practice-fisiologia-2026-08-10')).toBeVisible();

    await page.goto('/comunidade.html#ranking', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.study-latest-shortcuts')).toBeVisible();
    await expect(page.locator('[data-study-topic-shortcut="bioquimica-2026-08-26"]')).toBeVisible();
    await expect(page.locator('[data-study-topic-shortcut="epidemiologia-2026-08-26"]')).toBeVisible();
    const shortcutLayout = await page.locator('.study-latest-shortcuts').evaluate(node => ({
      width:node.getBoundingClientRect().width,
      viewport:document.documentElement.clientWidth,
      overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
      columns:getComputedStyle(node).gridTemplateColumns.split(' ').length,
      cardHeights:[...node.querySelectorAll('a')].map(link => link.getBoundingClientRect().height),
      titleFont:parseFloat(getComputedStyle(node.querySelector('strong')).fontSize),
      detailFont:parseFloat(getComputedStyle(node.querySelector('small')).fontSize)
    }));
    expect(shortcutLayout.width).toBeLessThanOrEqual(shortcutLayout.viewport);
    expect(shortcutLayout.overflow).toBeLessThanOrEqual(1);
    expect(shortcutLayout.columns).toBe(1);
    expect(Math.max(...shortcutLayout.cardHeights)).toBeLessThanOrEqual(64);
    expect(shortcutLayout.titleFont).toBeGreaterThanOrEqual(10.5);
    expect(shortcutLayout.detailFont).toBeGreaterThanOrEqual(9);
  });
};
