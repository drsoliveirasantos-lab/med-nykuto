#!/usr/bin/env node
/*
  Complete preview hygiene audit.
  Reads the checked-out repository tree and blocks known stale files that can confuse future edits.
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const critical = [];
const warnings = [];
const notes = [];

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  'playwright-report',
  'test-results',
  'reports',
  'docs/archive'
]);

const forbiddenExactPaths = new Set([
  'README_SPLIT_MIGRATION.md',
  'split_migration_manifest.json',
  '_source_backup/med-courses-data-live-v363-original-58.js',
  'window.txt'
]);

const forbiddenFilenamePatterns = [
  /^README_.*_MIGRATION\.md$/,
  /split[_-]migration/i,
  /original[-_]58/i,
  /live[-_]v\d+[-_]original/i,
  /apply[-_]split[-_]migration/i,
  /rebuild[-_]split[-_]course[-_]data/i
];

const suspiciousNamePatterns = [
  /(^|[-_./])backup($|[-_./])/i,
  /(^|[-_./])old($|[-_./])/i,
  /(^|[-_./])obsolete($|[-_./])/i,
  /(^|[-_./])legacy($|[-_./])/i,
  /(^|[-_./])tmp($|[-_./])/i,
  /(^|[-_./])temp($|[-_./])/i,
  /(^|[-_./])draft($|[-_./])/i,
  /(^|[-_./])copy($|[-_./])/i,
  /(^|[-_./])migration($|[-_./])/i,
  /(^|[-_./])original($|[-_./])/i
];

const archiveFilePattern = /\.(zip|rar|7z|tar|tgz|gz)$/i;
const allowedRootFiles = new Set([
  '.gitignore',
  'README.md',
  'SOURCE_OF_TRUTH.md',
  'index.html',
  'app.bundle.js',
  'content-lock.json',
  'package.json',
  'package-lock.json',
  'playwright.config.js',
  'robots.txt',
  'sitemap.xml'
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function isIgnoredDir(rel) {
  return ignoredDirs.has(rel);
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const absolute = path.join(dir, name);
    const rel = toPosix(path.relative(root, absolute));
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) {
      if (!isIgnoredDir(rel)) walk(absolute, out);
    } else {
      out.push(rel);
    }
  }
  return out;
}

function listDirs(rel) {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(path.join(dir, name)).isDirectory())
    .sort();
}

function addCritical(message) {
  critical.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function checkSourceOfTruth() {
  if (!exists('SOURCE_OF_TRUTH.md')) addCritical('Missing root SOURCE_OF_TRUTH.md.');
  if (!exists('content-lock.json')) addCritical('Missing content-lock.json.');
  if (!exists('scripts/validate-course-sources.js')) addCritical('Missing course source validator.');
  if (!exists('scripts/validate-no-stale-files.js')) addCritical('Missing stale-file hygiene validator.');
}

function checkFilenames(files) {
  for (const rel of files) {
    if (rel === 'scripts/validate-no-stale-files.js') continue;
    if (forbiddenExactPaths.has(rel)) addCritical(`Forbidden stale file still present: ${rel}`);
    const base = path.posix.basename(rel);
    for (const pattern of forbiddenFilenamePatterns) {
      if (pattern.test(base) || pattern.test(rel)) {
        addCritical(`Suspicious legacy/migration filename: ${rel}`);
        break;
      }
    }
    if (archiveFilePattern.test(base)) addWarning(`Archive file present in repository tree: ${rel}`);
    for (const pattern of suspiciousNamePatterns) {
      if (pattern.test(rel)) {
        addWarning(`Review suspicious historical/temp-style path: ${rel}`);
        break;
      }
    }
  }
}

function checkRootClutter(files) {
  const rootFiles = files.filter(rel => !rel.includes('/')).sort();
  const unexpectedRootFiles = rootFiles.filter(rel => !allowedRootFiles.has(rel));
  if (unexpectedRootFiles.length) {
    unexpectedRootFiles.forEach(rel => addWarning(`Unexpected root-level file requires review: ${rel}`));
  }
  notes.push(`Root files: ${rootFiles.join(', ')}`);
}

function checkCourseSources() {
  if (!exists('content-lock.json') || !exists('content/courses')) return;
  const lock = readJson('content-lock.json');
  const expectedCourses = lock.courses || {};
  const courseDirs = listDirs('content/courses');
  const expectedTotal = Number(lock.totalModules);
  let computedTotal = 0;

  for (const courseId of Object.keys(expectedCourses).sort()) {
    const courseJsonPath = `content/courses/${courseId}/course.json`;
    if (!exists(courseJsonPath)) {
      addCritical(`Missing course.json for locked course ${courseId}.`);
      continue;
    }
    const course = readJson(courseJsonPath);
    const modulesDir = `content/courses/${courseId}/modules`;
    const moduleDirs = listDirs(modulesDir);
    const declared = Number(course.moduleCount);
    const locked = Number(expectedCourses[courseId]);
    computedTotal += moduleDirs.length;
    if (declared !== locked) addCritical(`${courseId}: course.json moduleCount ${declared} differs from content-lock ${locked}.`);
    if (moduleDirs.length !== locked) addCritical(`${courseId}: module folder count ${moduleDirs.length} differs from content-lock ${locked}.`);
    if (Array.isArray(course.moduleOrder)) {
      if (course.moduleOrder.length !== moduleDirs.length) addCritical(`${courseId}: moduleOrder length ${course.moduleOrder.length} differs from module folders ${moduleDirs.length}.`);
      for (const moduleId of course.moduleOrder) {
        if (!moduleDirs.includes(moduleId)) addCritical(`${courseId}: moduleOrder references missing folder ${moduleId}.`);
      }
    } else {
      addCritical(`${courseId}: course.json must define moduleOrder array.`);
    }
  }

  for (const courseId of courseDirs) {
    if (!(courseId in expectedCourses)) addWarning(`Course directory not declared in content-lock.json: ${courseId}`);
  }

  if (computedTotal !== expectedTotal) addCritical(`Computed total modules ${computedTotal} differs from content-lock total ${expectedTotal}.`);
  notes.push(`Course audit total modules: ${computedTotal}; locked total: ${expectedTotal}.`);
}

function checkHomepageCounters() {
  if (!exists('content-lock.json') || !exists('index.html')) return;
  const lock = readJson('content-lock.json');
  const expectedTotal = Number(lock.totalModules);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const id of ['statModulesHero', 'statModules']) {
    const pattern = new RegExp(`id=["']${id}["'][^>]*>\\s*${expectedTotal}\\s*<`);
    if (!pattern.test(html)) addCritical(`index.html counter ${id} does not show locked total ${expectedTotal}.`);
  }
  if (expectedTotal !== 58 && /id=["'](?:statModulesHero|statModules)["'][^>]*>\s*58\s*</.test(html)) {
    addCritical('Homepage contains stale visible module counter 58 while content-lock.json expects a different total.');
  }
}

function checkGeneratedCourseData() {
  if (!exists('data/med-courses-data.js')) {
    addCritical('Missing generated data/med-courses-data.js.');
    return;
  }
  const code = fs.readFileSync(path.join(root, 'data/med-courses-data.js'), 'utf8');
  notes.push(`Generated course data size: ${code.length} characters.`);
  if (!/MED_COURSES_DATA/.test(code)) {
    addWarning('Generated data file exists, but MED_COURSES_DATA marker was not found by the lightweight audit. Browser tests remain the source of truth for runtime loading.');
  }
}

function checkWorkflows(files) {
  const workflows = files.filter(rel => rel.startsWith('.github/workflows/') && /\.ya?ml$/i.test(rel)).sort();
  if (!workflows.includes('.github/workflows/site-tests.yml')) addCritical('Missing permanent site-tests workflow.');
  for (const workflow of workflows) {
    if (/(migration|split-course|zip|temporary|temp|refactor|apply)/i.test(workflow)) {
      addCritical(`Workflow looks temporary or migration-specific: ${workflow}`);
    }
  }
  notes.push(`Workflow files: ${workflows.length ? workflows.join(', ') : '(none)'}`);
}

function checkBranches() {
  try {
    const output = cp.execSync('git branch -r --format="%(refname:short)"', { encoding: 'utf8' });
    const branches = output.split('\n').map(line => line.trim()).filter(Boolean).filter(name => name !== 'origin/HEAD');
    const nonPrimary = branches.filter(name => !['origin/main', 'origin/preview'].includes(name)).sort();
    notes.push(`Remote branches visible to audit: ${branches.length}`);
    if (nonPrimary.length) {
      nonPrimary.forEach(branch => addWarning(`Non-primary remote branch exists and may confuse future work: ${branch}`));
    }
  } catch (error) {
    addWarning(`Could not audit remote branches: ${error.message}`);
  }
}

function writeReports(files) {
  const report = {
    scannedFiles: files.length,
    critical,
    warnings,
    notes,
    generatedAt: new Date().toISOString()
  };
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(root, 'reports/preview-hygiene-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    'Preview hygiene audit',
    `Scanned files: ${files.length}`,
    `Critical findings: ${critical.length}`,
    `Warnings/review items: ${warnings.length}`,
    '',
    'Critical findings:',
    ...(critical.length ? critical.map(item => ` - ${item}`) : [' - none']),
    '',
    'Warnings/review items:',
    ...(warnings.length ? warnings.map(item => ` - ${item}`) : [' - none']),
    '',
    'Notes:',
    ...(notes.length ? notes.map(item => ` - ${item}`) : [' - none'])
  ];
  fs.writeFileSync(path.join(root, 'reports/preview-hygiene-audit.txt'), `${lines.join('\n')}\n`);
  console.log(lines.join('\n'));
}

checkSourceOfTruth();
const files = walk(root).sort();
checkFilenames(files);
checkRootClutter(files);
checkCourseSources();
checkHomepageCounters();
checkGeneratedCourseData();
checkWorkflows(files);
checkBranches();
writeReports(files);

if (critical.length) {
  process.exit(1);
}
