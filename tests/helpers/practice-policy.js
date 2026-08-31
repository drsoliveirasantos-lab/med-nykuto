async function expectBlockedClinicalCases(page, expect, course = 'fisiologia', timeout = 20000) {
  const list = page.locator('#practiceList');
  const courseQuery = course ? `?course=${course}` : '';
  await expect(list.locator('.notice')).toContainText('Calidad antes que cantidad.', { timeout });
  await expect(list.locator('.single-question-card')).toHaveCount(0);
  await expect(list.locator(`a[href="qcm.html${courseQuery}"]`)).toBeVisible({ timeout });
  await expect(list.locator(`a[href="vrai-faux.html${courseQuery}"]`)).toBeVisible({ timeout });
}

async function expectClinicalPageReady(page, expect, course = 'fisiologia', timeout = 20000) {
  await page.waitForFunction(() => {
    const list = document.querySelector('#practiceList');
    return !!(list && (list.querySelector('.single-question-card') || /Calidad antes que cantidad\./.test(list.textContent || '')));
  }, null, { timeout });

  const card = page.locator('#practiceList .single-question-card').first();
  if (await card.count()) {
    await expect(card).toBeVisible({ timeout });
    return 'available';
  }

  await expectBlockedClinicalCases(page, expect, course, timeout);
  return 'blocked';
}

module.exports = { expectBlockedClinicalCases, expectClinicalPageReady };
