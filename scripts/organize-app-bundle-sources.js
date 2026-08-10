#!/usr/bin/env node
/*
  Organize byte-identical app.bundle.js fragments into domain folders.
  This keeps the manifest order and only changes source-file locations.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(sourceRoot, 'manifest.json');
const legacyPartsRoot = path.join(sourceRoot, 'parts');
const modulesRoot = path.join(sourceRoot, 'modules');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function bucketFor(part) {
  const category = String(part.category || 'misc');
  if (category === 'bundle-wrapper') return 'runtime';
  if (category.startsWith('i18n')) return 'i18n';
  if (category.startsWith('page-')) return 'pages';
  if (category.startsWith('practice')) return 'practice';
  if (category.includes('progress') || category.includes('storage')) return 'app';
  if (category.includes('dom')) return 'dom';
  if (category.startsWith('app-')) return 'app';
  return 'misc';
}

function partFileName(part) {
  return path.basename(part.path);
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');

  const newParts = manifest.parts.map(part => {
    const bucket = bucketFor(part);
    const filename = partFileName(part);
    const oldPath = path.join(sourceRoot, part.path);
    assert(fs.existsSync(oldPath), `Missing fragment: ${part.path}`);
    const targetDir = path.join(modulesRoot, bucket);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetRelative = path.posix.join('modules', bucket, filename);
    const targetPath = path.join(sourceRoot, targetRelative);
    fs.copyFileSync(oldPath, targetPath);
    return { ...part, path: targetRelative, bucket };
  });

  const organized = {
    ...manifest,
    strategy: 'ordered-domain-fragments-byte-identical',
    organizedWith: 'scripts/organize-app-bundle-sources.js',
    folders: {
      runtime: 'IIFE wrapper and generated runtime boundaries',
      app: 'application state, helpers and storage glue',
      dom: 'DOM helpers and event-related glue',
      i18n: 'translation dictionaries and language helpers',
      pages: 'page renderers',
      practice: 'practice/question engine fragments',
      misc: 'uncategorized fragments pending manual refinement'
    },
    parts: newParts
  };

  fs.writeFileSync(manifestFile, JSON.stringify(organized, null, 2) + '\n', 'utf8');
  fs.rmSync(legacyPartsRoot, { recursive: true, force: true });
  console.log(`Organized ${newParts.length} app bundle fragments into src/app-bundle/modules/.`);
}

try { main(); }
catch (error) { console.error('Organization failed:', error.message); process.exit(1); }
