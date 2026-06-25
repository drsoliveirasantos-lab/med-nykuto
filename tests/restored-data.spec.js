const { test, expect } = require('@playwright/test');

const expectedCourses = {
  fisiologia: { modules: 9, qcm: 1800, vf: 450, cases: 450 },
  microbiologia: { modules: 13, qcm: 2600, vf: 650, cases: 650 },
  genetica: { modules: 12, qcm: 2400, vf: 600, cases: 600 },
  bioquimica: { modules: 12, qcm: 600, vf: 120, cases: 600 },
  inmunologia: { modules: 12, qcm: 600, vf: 120, cases: 600 }
};

test.describe('Med Nykuto restored data integrity', () => {
  test('course catalog is restored and rich', async ({ page }) => {
    await page.goto('/matieres.html');
    await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361');
    const data = await page.evaluate(() => {
      const courses = window.MED_COURSES_DATA?.courses || [];
      const modules = courses.flatMap(c => (c.modules || []).map(m => ({...m, courseId: c.id})));
      return {
        siteName: window.MED_COURSES_DATA?.siteName || '',
        totalModules: window.MED_COURSES_DATA?.totalModules || 0,
        courseCount: courses.length,
        activeCourseCount: courses.filter(c => (c.modules || []).length > 0).length,
        moduleCount: modules.length,
        richModuleCount: modules.filter(m => String(m.markdown || m.fullMarkdown || '').length > 2500).length,
        genericModuleCount: modules.filter(m => /Este módulo organiza los puntos esenciales|La lógica de estudio debe seguir/i.test(String(m.markdown || m.fullMarkdown || ''))).length,
        moduleIds: modules.map(m => m.id)
      };
    });
    expect(data.courseCount).toBeGreaterThanOrEqual(6);
    expect(data.activeCourseCount).toBeGreaterThanOrEqual(5);
    expect(data.totalModules || data.moduleCount).toBe(58);
    expect(data.moduleCount).toBe(58);
    expect(data.richModuleCount).toBeGreaterThanOrEqual(50);
    expect(data.genericModuleCount).toBe(0);
    expect(new Set(data.moduleIds).size).toBe(58);
  });

  for (const [courseId, expected] of Object.entries(expectedCourses)) {
    test(`restored bank volume is healthy for ${courseId}`, async ({ page }) => {
      await page.goto(`/qcm.html?course=${courseId}`);
      await page.waitForFunction(() => window.__MED_NYKUTO_PRACTICE_LOADER__ === 'v363');
      await page.waitForFunction(() => window.__MED_NYKUTO_RUNTIME_GUARD__ === 'v361');
      const data = await page.evaluate((id) => {
        const courses = window.MED_COURSES_DATA?.courses || [];
        const course = courses.find(c => c.id === id);
        const bank = window.MED_PRACTICE_BANK?.byCourse?.[id] || {};
        const representedModules = new Set([...(bank.qcm || []), ...(bank.vf || []), ...(bank.cases || [])].map(x => x && x.moduleNumber).filter(Boolean));
        return {
          modules: course?.modules?.length || 0,
          qcm: (bank.qcm || []).length,
          vf: (bank.vf || []).length,
          cases: (bank.cases || []).length,
          representedModules: representedModules.size,
          sampleQcmOptions: (bank.qcm || [])[0]?.options?.length || 0,
          loader: window.__MED_NYKUTO_PRACTICE_LOADER__ || '',
          healthOk: !!window.MED_NYKUTO_HEALTH?.ok
        };
      }, courseId);
      expect(data.loader).toBe('v363');
      expect(data.healthOk).toBeTruthy();
      expect(data.modules).toBe(expected.modules);
      expect(data.qcm).toBeGreaterThanOrEqual(expected.qcm);
      expect(data.vf).toBeGreaterThanOrEqual(expected.vf);
      expect(data.cases).toBeGreaterThanOrEqual(expected.cases);
      expect(data.representedModules).toBeGreaterThanOrEqual(expected.modules);
      expect(data.sampleQcmOptions).toBe(4);
    });
  }
});
