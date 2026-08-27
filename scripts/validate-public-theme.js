#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('public-theme-v485.js');
const css = read('public-theme-v485.css');
const worker = read('service-worker.js');

for (const file of ['clase.html', 'comunidade.html', 'turma-shell/index.html']) {
  const html = read(file);
  assert.ok(html.includes('data-public-theme-toggle'), `${file} is missing the public theme control.`);
  assert.ok(html.includes('public-theme-v485.js?v=485') && html.includes('public-theme-v485.css?v=486'), `${file} is missing the shared theme assets.`);
  assert.ok(html.indexOf('public-theme-v485.js?v=485') < html.indexOf('public-theme-v485.css?v=486'), `${file} does not apply the saved theme before its theme CSS.`);
}

assert.ok(runtime.includes("'med-nykuto-theme-v1'") && runtime.includes("root.dataset.theme") && runtime.includes("localStorage.setItem") && runtime.includes("window.addEventListener('storage'"), 'Theme persistence or cross-tab synchronization is incomplete.');
assert.ok(runtime.includes("themeColor.content") && runtime.includes("'#f4f7fb'") && runtime.includes("aria-pressed"), 'Theme color or accessible toggle state is incomplete.');
assert.match(css, /\.public-theme-toggle\{[^}]*min-width:44px;[^}]*min-height:44px/);
assert.ok(css.includes('html[data-theme="light"]') && css.includes('--ink:#10243a') && css.includes('--community-ink:#10243a') && css.includes('--text:#10243a'), 'The light palette does not cover all public student shells.');
assert.ok(css.includes('.notebook-shell') && css.includes('.community-header') && css.includes('.class-main'), 'The light theme does not cover lessons, training and the generic class shell.');
assert.ok(css.includes('.turma-theme-toggle{width:auto;min-width:84px}') && css.includes('.schedule-task-badge{color:#075f45') && css.includes('.practice-feedback>strong{color:#075f45'), 'Light-theme control sizing or high-contrast learning states are incomplete.');
assert.ok(css.includes('.community-theme-toggle){color:var(--community-ink)') && css.includes('.community-profile-form input::placeholder{color:var(--community-muted)') && css.includes('.search-field input::placeholder{color:var(--muted)') && css.includes('.ranking-verification.is-legacy{color:#9f1f16'), 'Training controls, identity fields, search placeholders or ranking states do not have an explicit light-theme contrast treatment.');
assert.ok(css.includes('.notebook-lesson-head>span') && css.includes('color-mix(in srgb,var(--lesson-accent') && css.includes('.ai-resource-grid summary') && css.includes('.lesson-source-note b'), 'Lesson accent text or resource panels do not have an explicit light-theme contrast treatment.');
assert.ok(worker.includes("med-nykuto-shell-v486") && worker.includes('/public-theme-v485.css?v=486') && worker.includes('/public-theme-v485.js?v=485'), 'The current service-worker shell does not cache the shared theme assets.');

console.log('Public light/dark theme validation passed.');
