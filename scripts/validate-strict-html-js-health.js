const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function existsLocal(ref) {
  const clean = String(ref || '').split('#')[0].split('?')[0].replace(/^\.\//, '').replace(/^\//, '');
  if (!clean || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return true;
  if (clean.startsWith('#')) return true;
  return fs.existsSync(path.join(root, clean));
}

function checkRef(file, attr, ref) {
  if (!existsLocal(ref)) failures.push(`${file}: missing local ${attr} target: ${ref}`);
}

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<(script|link|a|img)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[1].toLowerCase();
    const ref = match[2];
    if (tag === 'a' && !/\.html(?:[?#]|$)/i.test(ref) && !ref.startsWith('/')) continue;
    checkRef(file, tag, ref);
  }
}

const requiredFiles = [
  'index.html',
  'qcm.html',
  'cas-cliniques.html',
  'vrai-faux.html',
  'module.html',
  'app.bundle.js',
  'site-global-polish-v310.js',
  'qcm-tap-guard-v309.js',
  'practice-tap-guard-v313.js'
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`required file missing: ${file}`);
}

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function requireContains(file, pattern, label) {
  const content = read(file);
  if (!pattern.test(content)) failures.push(`${file}: missing ${label}`);
}

requireContains('qcm.html', /qcm-tap-guard-v309\.js\?v=317/, 'current QCM guard cache version');
requireContains('qcm.html', /site-global-polish-v310\.js\?v=377/, 'current global polish cache version');
requireContains('cas-cliniques.html', /practice-tap-guard-v313\.js\?v=315/, 'current cases tap guard cache version');
if (/cas-cliniques.html/.test('cas-cliniques.html') && /premium-correction-v313\.js/.test(read('cas-cliniques.html'))) {
  failures.push('cas-cliniques.html: legacy premium correction script must not load on cases page');
}

if (failures.length) {
  console.error('Strict HTML/JS health check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Strict HTML/JS health check passed for ${htmlFiles.length} HTML files.`);
