const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function routeRegex(source) {
  const pattern = source.split('/').map((segment) => {
    if (segment === '*') return '.*';
    if (segment.startsWith(':')) return '[^/]+';
    return escapeRegex(segment);
  }).join('/');
  return new RegExp(`^${pattern}/?$`);
}

const redirectRoutes = fs.existsSync(path.join(root, '_redirects'))
  ? fs.readFileSync(path.join(root, '_redirects'), 'utf8').split(/\r?\n/).flatMap((line) => {
      const clean = line.trim();
      if (!clean || clean.startsWith('#')) return [];
      const [source, , rawStatus = '302'] = clean.split(/\s+/);
      const status = Number(rawStatus);
      return source?.startsWith('/') && status >= 200 && status < 400
        ? [routeRegex(source)]
        : [];
    })
  : [];

function existsLocal(ref) {
  const raw = String(ref || '').split('#')[0].split('?')[0];
  if (raw.startsWith('/') && redirectRoutes.some((pattern) => pattern.test(raw))) return true;
  if (raw.startsWith('/api/')) {
    const functionFile = path.join(root, 'functions', `${raw.replace(/^\//, '')}.js`);
    if (fs.existsSync(functionFile)) return true;
  }
  const clean = raw.replace(/^\.\//, '').replace(/^\//, '');
  if (!clean || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return true;
  if (clean.startsWith('#')) return true;
  return fs.existsSync(path.join(root, clean));
}

function checkRef(file, attr, ref) {
  if (!existsLocal(ref)) failures.push(`${file}: missing local ${attr} target: ${ref}`);
}

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html'))
  .concat(['turma-shell/index.html', 'gestion-shell/index.html'].filter((name) => fs.existsSync(path.join(root, name))));
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

requireContains('qcm.html', /qcm-tap-guard-v309\.js\?v=321/, 'current QCM guard cache version');
requireContains('qcm.html', /app\.bundle\.js\?v=461/, 'current app bundle cache version');
requireContains('qcm.html', /site-global-polish-v310\.js\?v=460/, 'current global polish cache version');
for (const file of ['index.html', 'matieres.html', 'matiere.html', 'modules.html', 'module.html', 'qcm.html', 'cas-cliniques.html', 'vrai-faux.html', 'erreurs.html', 'examen.html']) {
  requireContains(file, /semester-3-shell-v460\.css\?v=460/, 'Semester 3 shell stylesheet');
  requireContains(file, /semester-3-shell-v460\.js\?v=460/, 'Semester 3 shell script');
}
requireContains('app.bundle.js', /__MED_NYKUTO_LEGACY_FIGURE_LIGHTBOX__\s*=\s*['"]disabled-external-zoom-v368['"]/, 'disabled legacy figure lightbox marker');
requireContains('cas-cliniques.html', /practice-tap-guard-v313\.js\?v=317/, 'current cases tap guard cache version');
if (/cas-cliniques.html/.test('cas-cliniques.html') && /premium-correction-v313\.js/.test(read('cas-cliniques.html'))) {
  failures.push('cas-cliniques.html: legacy premium correction script must not load on cases page');
}

if (failures.length) {
  console.error('Strict HTML/JS health check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Strict HTML/JS health check passed for ${htmlFiles.length} HTML files.`);
