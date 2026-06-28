#!/usr/bin/env node
/*
  Reclassify the oversized content-normalization fragment that was carried
  with i18n fragments during the first source extraction step.

  This does not rewrite code. It only moves the source fragment and updates
  the manifest while app.bundle.js must rebuild byte-for-byte.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appBundleRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(appBundleRoot, 'manifest.json');
const targetRelative = 'modules/app/047-content-normalization.js';
const targetAbsolute = path.join(appBundleRoot, targetRelative);
const oldRelative = '../i18n/app-bundle/047-i18n-dictionary.js';
const oldAbsolute = path.resolve(appBundleRoot, oldRelative);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(value) {
  return String(value || '').replace(/\\/g, '/');
}

function isTargetPart(part) {
  const partPath = normalize(part.path);
  const summary = String(part.summary || '');
  return part.order === 47 ||
    partPath.endsWith('/047-i18n-dictionary.js') ||
    partPath.endsWith('/047-content-normalization.js') ||
    summary.includes('rehydrateCollapsedMarkdown');
}

function moveIfNeeded(part) {
  const currentPath = normalize(part.path);
  if (currentPath === targetRelative) {
    assert(fs.existsSync(targetAbsolute), `Missing target fragment: ${targetRelative}`);
    return false;
  }

  const source = fs.existsSync(oldAbsolute) ? oldAbsolute : path.resolve(appBundleRoot, currentPath);
  assert(fs.existsSync(source), `Missing source fragment: ${part.path}`);
  fs.mkdirSync(path.dirname(targetAbsolute), { recursive: true });
  fs.copyFileSync(source, targetAbsolute);
  if (path.resolve(source) !== path.resolve(targetAbsolute)) {
    fs.rmSync(source, { force: true });
  }
  return true;
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');

  let reclassified = 0;
  const nextParts = manifest.parts.map(part => {
    if (!isTargetPart(part)) return part;
    if (moveIfNeeded(part)) reclassified += 1;
    return {
      ...part,
      path: targetRelative,
      category: 'content-normalization',
      bucket: 'app',
      sourceDomain: 'app',
      sourceRoot: 'src/app-bundle/modules/app',
      summary: part.summary || "function rehydrateCollapsedMarkdown(md=''){"
    };
  });

  const nextManifest = {
    ...manifest,
    strategy: 'domain-fragments-with-content-normalization-byte-identical',
    contentNormalizationReclassifiedWith: 'scripts/reclassify-content-normalization-source.js',
    contentNormalizationSource: 'src/app-bundle/modules/app/047-content-normalization.js',
    parts: nextParts
  };

  fs.writeFileSync(manifestFile, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Reclassified ${reclassified} content-normalization fragment(s).`);
}

try { main(); }
catch (error) { console.error('Content normalization reclassification failed:', error.message); process.exit(1); }
