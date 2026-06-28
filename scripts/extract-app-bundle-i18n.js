#!/usr/bin/env node
/*
  Move app-bundle i18n fragments into src/i18n while preserving the
  manifest order and byte-identical app.bundle.js rebuild.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appBundleRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(appBundleRoot, 'manifest.json');
const i18nRoot = path.join(root, 'src', 'i18n', 'app-bundle');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isI18nPart(part) {
  const category = String(part.category || '');
  const bucket = String(part.bucket || '');
  const partPath = String(part.path || '');
  return category === 'i18n' || category.startsWith('i18n') || bucket === 'i18n' || partPath.includes('/i18n/');
}

function safeFileName(part) {
  return path.basename(part.path);
}

function pathFromAppBundleRootToI18n(filename) {
  return path.posix.join('..', 'i18n', 'app-bundle', filename);
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');
  fs.mkdirSync(i18nRoot, { recursive: true });

  let moved = 0;
  const nextParts = manifest.parts.map(part => {
    if (!isI18nPart(part)) return part;
    const source = path.join(appBundleRoot, part.path);
    assert(fs.existsSync(source), `Missing i18n fragment: ${part.path}`);
    const filename = safeFileName(part);
    const target = path.join(i18nRoot, filename);
    const text = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, text, 'utf8');
    fs.rmSync(source, { force: true });
    moved += 1;
    return {
      ...part,
      path: pathFromAppBundleRootToI18n(filename),
      sourceDomain: 'i18n',
      sourceRoot: 'src/i18n/app-bundle'
    };
  });

  const nextManifest = {
    ...manifest,
    strategy: 'i18n-extracted-domain-fragments-byte-identical',
    i18nExtractedWith: 'scripts/extract-app-bundle-i18n.js',
    i18nSourceRoot: 'src/i18n/app-bundle',
    i18nPartCount: moved,
    parts: nextParts
  };

  fs.writeFileSync(manifestFile, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Extracted ${moved} i18n fragment(s) to src/i18n/app-bundle/.`);
}

try { main(); }
catch (error) { console.error('i18n extraction failed:', error.message); process.exit(1); }
