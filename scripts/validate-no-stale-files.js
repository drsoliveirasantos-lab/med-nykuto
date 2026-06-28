#!/usr/bin/env node
/*
  Repository hygiene guard.
  Blocks known stale migration/back-up files that can confuse future edits.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const problems = [];

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
  /live[-_]v\d+[-_]original/i
];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
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

const files = walk(root);
for (const rel of files) {
  if (rel === 'scripts/validate-no-stale-files.js') continue;
  if (forbiddenExactPaths.has(rel)) problems.push(`Forbidden stale file still present: ${rel}`);
  const base = path.posix.basename(rel);
  for (const pattern of forbiddenFilenamePatterns) {
    if (pattern.test(base) || pattern.test(rel)) {
      problems.push(`Suspicious legacy/migration filename: ${rel}`);
      break;
    }
  }
}

if (fs.existsSync(path.join(root, 'content-lock.json'))) {
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'content-lock.json'), 'utf8'));
  if (Number(lock.totalModules) === 59) {
    const indexPath = path.join(root, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      if (/id=["']statModulesHero["']>58<|id=["']statModules["']>58</.test(html)) {
        problems.push('Homepage contains stale visible module counter 58 while content-lock.json expects 59.');
      }
    }
  }
}

if (problems.length) {
  console.log('Repository hygiene validation failed:');
  problems.forEach(problem => console.log(` - ${problem}`));
  process.exit(1);
}

console.log(`Repository hygiene validation OK: scanned ${files.length} files.`);
