#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('public-theme-v485.js');
const classRuntime = read('class-hub-runtime-v440.js');
const classHtml = read('clase.html');
const css = read('public-theme-v485.css');
const worker = read('service-worker.js');
const classHubApi = read('functions/api/class-hub.js');
const biochemistryGroupsApi = read('functions/api/bioquimica-groups.js');
const biochemistryGroupsHtml = read('bioquimica-ii-grupos.html');
const turmaHtml = read('turma-shell/index.html');

for (const file of ['clase.html', 'comunidade.html', 'turma-shell/index.html']) {
  const html = read(file);
  const themeRuntimeAsset = html.match(/public-theme-v485\.js\?v=\d+/)?.[0];
  const themeCssAsset = html.match(/public-theme-v485\.css\?v=\d+/)?.[0];
  assert.ok(html.includes('data-public-theme-toggle'), `${file} is missing the public theme control.`);
  assert.ok(themeRuntimeAsset && themeCssAsset, `${file} is missing the shared theme assets.`);
  assert.ok(html.indexOf(themeRuntimeAsset) < html.indexOf(themeCssAsset), `${file} does not apply the saved theme before its theme CSS.`);
}

assert.ok(runtime.includes("'med-nykuto-theme-v1'") && runtime.includes("root.dataset.theme") && runtime.includes("localStorage.setItem") && runtime.includes("window.addEventListener('storage'"), 'Theme persistence or cross-tab synchronization is incomplete.');
assert.ok(runtime.includes("/class-practical-exams-2026-p1-v500.js?v=500") && !runtime.includes('/bioquimica-pratica-task-v498.js'), 'The class page enhancement loader must use the corrected practical-exam card only.');
assert.ok(fs.existsSync(path.join(root, 'class-practical-exams-2026-p1-v500.js')), 'The corrected practical-exam card runtime is missing.');
assert.ok(!fs.existsSync(path.join(root, 'bioquimica-pratica-task-v498.js')), 'The obsolete practical-exam card with the incorrect Bioquimica date must be removed.');
assert.ok(biochemistryGroupsApi.includes("examDate: '2026-09-04'") && biochemistryGroupsApi.includes("examDateLabel: '04/09/2026 · sexta-feira'") && !biochemistryGroupsApi.includes("examDate: '2026-09-02'"), 'The shared Bioquimica group API still exposes the incorrect practical-exam date.');
assert.ok(biochemistryGroupsHtml.includes('sexta-feira, 04/09/2026') && !biochemistryGroupsHtml.includes('02/09/2026'), 'The Bioquimica group page still exposes the incorrect practical-exam date.');
assert.ok(!turmaHtml.includes('BIOQUÍMICA II · 02/09/2026') && !turmaHtml.includes('id="bioquimicaGroupsTaskTitle"'), 'The public turma shell still exposes the incorrect or duplicate static Bioquimica task.');
assert.ok(classHtml.includes('data-project-expires-at="2026-09-05T00:00:00-03:00"') && classRuntime.includes('PROYECTO ARCHIVADO · PRESENTACIÓN FINALIZADA'), 'The reprogrammed Epidemiology project needs a resilient archived state after its week ends.');
assert.ok(classHubApi.includes("attachment_url='https://med.nykuto.com/bioquimica-ii-grupos'") && classHubApi.includes("attachment_title='Ver grupos y trabajos de Bioquímica'"), 'The authoritative Bioquimica task no longer links to the shared group list.');
assert.ok(classHubApi.includes("status=?,updated_at=? WHERE class_id=? AND id='epi-presentation'") && classHubApi.includes("status=?,updated_at=? WHERE class_id=? AND id='bio-activities'") && !classHubApi.includes("id IN ('epi-presentation','bio-activities') AND status<>'archived'"), 'The authoritative class API still archives the two reprogrammed current tasks.');
assert.ok(classHubApi.includes("const PRACTICAL_WEEK_EXPIRES_AT = '2026-09-05T00:00:00-03:00'") && classHubApi.includes("tasks: visibleTasks") && classHubApi.includes("activities: visibleActivities.map"), 'The public API must stop exposing practical-week tasks even if a warm worker keeps its schema promise alive.');
assert.ok(read('clase.html').includes('public-theme-v485.css?v=500') && css.includes('html[data-theme="light"] .live-task-download{color:#075f45') && css.includes('.live-task-facts>div,.live-task-steps li'), 'The corrected task card is missing its cache-busted high-contrast light-theme treatment.');
assert.ok(runtime.includes("themeColor.content") && runtime.includes("'#f4f7fb'") && runtime.includes("aria-pressed"), 'Theme color or accessible toggle state is incomplete.');
assert.ok(!runtime.includes('p1-ui-compact'), 'P1 responsive styles must stay deterministic in class-p1-v1.css instead of a dynamically injected patch.');
assert.match(css, /\.public-theme-toggle\{[^}]*min-width:44px;[^}]*min-height:44px/);
assert.ok(css.includes('html[data-theme="light"]') && css.includes('--ink:#10243a') && css.includes('--community-ink:#10243a') && css.includes('--text:#10243a'), 'The light palette does not cover all public student shells.');
assert.ok(css.includes('.notebook-shell') && css.includes('.community-header') && css.includes('.class-main'), 'The light theme does not cover lessons, training and the generic class shell.');
assert.ok(css.includes('.turma-theme-toggle{width:auto;min-width:84px}') && css.includes('.schedule-task-badge{color:#075f45') && css.includes('.practice-feedback>strong{color:#075f45'), 'Light-theme control sizing or high-contrast learning states are incomplete.');
assert.ok(css.includes('.community-theme-toggle){color:var(--community-ink)') && css.includes('.community-profile-form input::placeholder{color:var(--community-muted)') && css.includes('.search-field input::placeholder{color:var(--muted)') && css.includes('.ranking-verification.is-legacy{color:#9f1f16'), 'Training controls, identity fields, search placeholders or ranking states do not have an explicit light-theme contrast treatment.');
assert.ok(css.includes('.notebook-lesson-head>span') && css.includes('color-mix(in srgb,var(--lesson-accent') && css.includes('.ai-resource-grid summary') && css.includes('.lesson-source-note b'), 'Lesson accent text or resource panels do not have an explicit light-theme contrast treatment.');
assert.ok(worker.includes("med-nykuto-shell-v488") && worker.includes('/public-theme-v485.css?v=486') && worker.includes('/public-theme-v485.js?v=485'), 'The current service-worker shell does not cache the shared theme assets.');

console.log('Public light/dark theme validation passed.');
