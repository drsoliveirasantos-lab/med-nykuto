from pathlib import Path
import re


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_exact(path, old, new, expected=1):
    text = read(path)
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} occurrence(s), found {count}: {old[:100]!r}')
    write(path, text.replace(old, new))
    print(f'patched {path}: exact replacement x{count}')


def replace_regex(path, pattern, replacement, expected=1):
    text = read(path)
    updated, count = re.subn(pattern, replacement, text, flags=re.S)
    if count != expected:
        raise RuntimeError(f'{path}: expected {expected} regex replacement(s), found {count}: {pattern[:120]!r}')
    write(path, updated)
    print(f'patched {path}: regex replacement x{count}')


workflow = Path('.github/workflows/site-tests.yml')
workflow_text = workflow.read_text(encoding='utf-8')
node20_count = workflow_text.count('node-version: 20')
if node20_count < 1:
    raise RuntimeError('site-tests.yml: no Node 20 setup remained to upgrade')
workflow_text = workflow_text.replace('node-version: 20', 'node-version: 22')
workflow_text = workflow_text.replace('Restore Node 20 for general validation', 'Keep Node 22 for general validation')
workflow.write_text(workflow_text, encoding='utf-8')
print(f'patched site-tests.yml: upgraded {node20_count} setup step(s) to Node 22')

replace_exact(
    'bioquimica-pratica-task-v498.js',
    "var card=make('details','live-task live-task-details');card.id='task-'+TASK_ID;card.dataset.liveTaskId=TASK_ID;card.open=true;",
    "var card=make('details','live-task live-task-details');card.id='task-'+TASK_ID;card.dataset.liveTaskId=TASK_ID;card.open=location.hash==='#task-'+TASK_ID;"
)
replace_exact(
    'bioquimica-pratica-task-v498.js',
    "summary.appendChild(make('b','live-task-action','Cerrar'));",
    "summary.appendChild(make('b','live-task-action',card.open?'Cerrar':'Abrir'));"
)
replace_exact(
    'bioquimica-pratica-task-v498.js',
    "var count=document.getElementById('homeHomeworkCount');if(count&&/Todo al día|0 tareas/i.test(count.textContent||''))count.textContent='1 tarea activa';",
    "var count=document.getElementById('homeHomeworkCount');if(count){var total=host.querySelectorAll('.live-task').length;var pt=/^pt\\b/i.test(document.documentElement.lang||'');count.textContent=total+' '+(pt?(total===1?'tarefa ativa':'tarefas ativas'):(total===1?'tarea activa':'tareas activas'));}"
)
replace_exact(
    'bioquimica-pratica-task-v498.js',
    "  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(render,800);},{once:true});else setTimeout(render,800);\n  window.addEventListener('hashchange',function(){if(location.hash==='#task-'+TASK_ID)setTimeout(render,0);});",
    "  var renderAttempts=0;\n  function startRender(){var host=document.getElementById('classHubLiveTasks');if(host&&host.querySelectorAll('.live-task').length>=2){render();return;}if(renderAttempts<40){renderAttempts+=1;setTimeout(startRender,50);return;}render();}\n  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startRender,{once:true});else startRender();\n  window.addEventListener('hashchange',function(){startRender();var card=document.getElementById('task-'+TASK_ID);if(card)card.open=location.hash==='#task-'+TASK_ID;});"
)
replace_exact('public-theme-v485.js', "/bioquimica-pratica-task-v498.js?v=498", "/bioquimica-pratica-task-v498.js?v=499")
replace_exact('clase.html', 'public-theme-v485.js?v=485', 'public-theme-v485.js?v=499')

replace_exact('tests/grupo3-hub/section-02.js', "await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tarefas ativas');", "await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tarefas ativas');")
replace_exact('tests/grupo3-hub/section-02.js', "await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(2);", "await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(3);")
replace_exact('tests/grupo3-hub/section-02.js', "await expect(page.locator('#nutritionPrepCard')).toBeHidden();", "await expect(page.locator('#nutritionPrepCard')).toBeVisible();")
replace_exact(
    'tests/grupo3-hub/section-02.js',
    "    await page.goto('/clase.html#nutricion');\n    await page.locator('#nutricion-2026-08-13 [data-lesson-tab=\"material\"]').click();",
    "    await page.goto('/clase.html#nutricion');\n    await page.locator('#nutricion .notebook-date[data-lesson-id=\"nutricion-2026-08-13\"]').click();\n    await page.locator('#nutricion-2026-08-13 [data-lesson-tab=\"material\"]').click();"
)

replace_regex(
    'tests/grupo3-hub/section-03.js',
    r"  test\('shows only published active tasks and removes completed static homework', async \(\{ page \}\) => \{.*?\n  \}\);\n",
    """  test('shows three active tasks and preserves completed homework in the visible archive', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.getByRole('heading', { name: 'Tareas activas' })).toBeVisible();
    const active = page.locator('#classHubLiveTasks .live-task');
    const activeList = page.locator('#classHubLiveTasks');
    await expect(active).toHaveCount(3);
    await expect(activeList).toContainText('Prueba práctica · caso clínico, trabajos firmados y grupos');
    await expect(activeList).toContainText('Exposición grupal de enfermedad sorteada');
    await expect(activeList).toContainText('Actividades 3 y 4 impresas y manuscritas');
    await expect(page.locator('.pending-grid')).toBeVisible();
    await expect(page.locator('.assignment-archive')).toBeVisible();
    await expect(page.locator('#nutritionPrepCard')).toBeVisible();
  });
"""
)

replace_exact('tests/grupo3-hub/section-04.js', "test('keeps the completed RAC homework out of active tasks while preserving its course source'", "test('keeps the completed RAC homework archived while preserving its course source'")
replace_exact('tests/grupo3-hub/section-04.js', "await expect(page.locator('#epiPrepCard')).toBeHidden();", "await expect(page.locator('#epiPrepCard')).toBeVisible();")

replace_exact('tests/grupo3-hub/section-05.js', "test('removes the completed Microbiology homework and keeps the dated course available'", "test('archives the completed Microbiology homework and keeps the dated course available'")
replace_exact('tests/grupo3-hub/section-05.js', "await expect(page.locator('#microTheoryPrepCard')).toBeHidden();", "await expect(page.locator('#microTheoryPrepCard')).toBeVisible();")

replace_exact('tests/grupo3-hub/section-06.js', "test('removes the completed seminar from active Tareas'", "test('archives the completed seminar outside active Tareas'")
replace_exact('tests/grupo3-hub/section-06.js', "await expect(page.locator('#nutritionPrepCard')).toBeHidden();", "await expect(page.locator('#nutritionPrepCard')).toBeVisible();")
replace_exact('tests/grupo3-hub/section-06.js', "await expect(page.locator('#nutricion .notebook-date')).toContainText('13 AGO.');", "await expect(page.locator('#nutricion .notebook-date[data-lesson-id=\"nutricion-2026-08-13\"]')).toContainText('13 AGO.');")
replace_exact('tests/grupo3-hub/section-06.js', "await expect(page.locator('#nutricion .notebook-date')).toContainText('27 AGO.');", "await expect(page.locator('#nutricion .notebook-date[data-lesson-id=\"nutricion-2026-08-27\"]')).toContainText('27 AGO.');")
replace_exact('tests/grupo3-hub/section-06.js', "await expect(page.locator('#nutricion .notebook-date')).not.toContainText('20 AGO.');", "await expect(page.locator('#nutricion .notebook-date[data-lesson-id=\"nutricion-2026-08-20\"]')).toHaveCount(0);")

replace_regex(
    'tests/grupo3-hub/section-07.js',
    r"  test\('keeps completed activities out of the active task page', async \(\{ page \}\) => \{.*?\n  \}\);\n",
    """  test('keeps completed activities in a visible archive outside the three active tasks', async ({ page }) => {
    await page.goto('/clase.html#pendientes');
    await expect(page.locator('#classHubLiveTasks .live-task')).toHaveCount(3);
    await expect(page.locator('.assignment-archive')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tareas anteriores' })).toBeVisible();
  });
"""
)

replace_regex(
    'tests/grupo3-hub/section-08.js',
    r"  test\('keeps homework compact and expands each brief inside Tareas', async \(\{ page \}\) => \{.*?\n  \}\);\n\n(?=  test\('opens the selected homework)",
    """  test('keeps all current homework compact and expands each brief inside Tareas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/clase.html#pendientes');
    const tasks = page.locator('#classHubLiveTasks .live-task-details');
    const practicalTask = page.locator('#task-bio-practical-2026-09-02');
    const epidemiologyTask = page.locator('#task-epi-presentation');
    const biochemistryTask = page.locator('#task-bio-activities');
    await expect(tasks).toHaveCount(3);
    await expect(practicalTask).toContainText('Prueba práctica');
    await expect(epidemiologyTask).toContainText('Epidemiología');
    await expect(biochemistryTask).toContainText('Bioquímica II');
    const heights = await tasks.evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
    expect(Math.max(...heights)).toBeLessThan(100);
    await epidemiologyTask.locator('summary').click();
    await expect(epidemiologyTask).toHaveAttribute('open', '');
    await expect(page.locator('#pendientes')).toBeVisible();
    await expect(page.locator('#materias')).toBeHidden();
    await expect(epidemiologyTask).toContainText('15 diapositivas como máximo');
    await expect(epidemiologyTask).toContainText('Solo se entregan las diapositivas');
    await expect(epidemiologyTask.getByRole('link', { name: /Descargar la consigna en DOCX/ })).toHaveAttribute('href', /trabajo-practico-salud-publica-epidemiologia\.docx$/);
    const compactControls = await epidemiologyTask.evaluate((card) => {
      const toggle = card.querySelector('.live-task-action');
      const download = card.querySelector('.live-task-download');
      const intro = card.querySelector('.live-task-intro');
      return {
        toggleHeight: toggle.getBoundingClientRect().height,
        togglePosition: getComputedStyle(toggle).position,
        downloadHeight: download.getBoundingClientRect().height,
        downloadWidth: download.getBoundingClientRect().width,
        cardWidth: card.getBoundingClientRect().width,
        introClamp: getComputedStyle(intro).webkitLineClamp
      };
    });
    expect(compactControls.toggleHeight).toBeLessThanOrEqual(32);
    expect(compactControls.togglePosition).toBe('static');
    expect(compactControls.downloadHeight).toBeGreaterThanOrEqual(44);
    expect(compactControls.downloadHeight).toBeLessThanOrEqual(46);
    expect(compactControls.downloadWidth).toBeLessThan(compactControls.cardWidth * 0.9);
    expect(compactControls.introClamp).not.toBe('1');
    await expect(page.locator('.pending-grid')).toBeVisible();
  });

"""
)

replace_exact('tests/grupo3-hub/section-10.js', "await expect(lesson.locator('.course-photo-card')).toHaveCount(11);", "await expect(lesson.locator('.course-photo-card')).toHaveCount(15);")
replace_exact(
    'tests/grupo3-hub/section-10.js',
    "    await page.goto('/clase.html#nutricion');\n    await page.locator('#nutricion-2026-08-13 [data-lesson-tab=\"material\"]').click();",
    "    await page.goto('/clase.html#nutricion-2026-08-13');\n    await page.locator('#nutricion-2026-08-13 [data-lesson-tab=\"material\"]').click();"
)

replace_exact('tests/grupo3-hub/section-11.js', "await expect(page.locator('#fisiologia .notebook-progress-summary')).toContainText('1 de 5');", "await expect(page.locator('#fisiologia .notebook-progress-summary')).toContainText('1 de 6');")

replace_regex(
    'tests/mobile-touch-critical/section-02.js',
    r"  test\('active API assignments form compact rows on iPhone', async \(\{ page \}\) => \{.*?\n  \}\);\n(?=\};)",
    """  test('active assignments and their archive form compact rows on iPhone', async ({ page }) => {
    await page.goto('/clase.html#pendientes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Tareas activas' })).toBeVisible({ timeout: 10000 });
    const assignments = page.locator('#classHubLiveTasks .live-task');
    await expect(assignments).toHaveCount(3);

    const layout = await page.evaluate(() => {
      const list = document.querySelector('#classHubLiveTasks').getBoundingClientRect();
      const rows = Array.from(document.querySelectorAll('#classHubLiveTasks .live-task')).map(card => card.getBoundingClientRect());
      return {
        maxRowHeight: Math.max(...rows.map(row => row.height)),
        listHeight: list.height,
        archiveDisplay: getComputedStyle(document.querySelector('.pending-grid')).display,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    expect(layout.maxRowHeight).toBeLessThan(110);
    expect(layout.listHeight).toBeLessThan(360);
    expect(layout.archiveDisplay).not.toBe('none');
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    await expect(page.locator('#task-bio-practical-2026-09-02')).toContainText('Prueba práctica');
    await expect(page.locator('#task-epi-presentation')).toContainText('Epidemiología');
    await expect(page.locator('#task-bio-activities')).toContainText('Bioquímica II');
    await expect(page.locator('.assignment-archive')).toBeVisible();
  });
"""
)

replace_exact('tests/community-leaderboard.spec.js', "await expect(page.getByRole('heading', { name: 'Estude por matéria e tema.' })).toBeVisible();", "await expect(page.getByRole('heading', { name: 'P1 · Treino por tema e classificação' })).toBeVisible();")

replace_exact('tests/p2.spec.js', "await expect(page.locator('[data-partial-scope=\"p2\"]')).toHaveAttribute('aria-current', 'page');", "await expect(page.locator('a[data-partial-scope=\"p2\"]')).toHaveAttribute('aria-current', 'page');")
replace_exact('tests/p2.spec.js', "await page.locator('[data-partial-scope=\"p1\"]').click();", "await page.locator('a[data-partial-scope=\"p1\"]').click();")
replace_exact('tests/p2.spec.js', "await expect(page.locator('[data-partial-scope=\"p1\"]')).toHaveAttribute('aria-current', 'page');", "await expect(page.locator('a[data-partial-scope=\"p1\"]')).toHaveAttribute('aria-current', 'page');")
