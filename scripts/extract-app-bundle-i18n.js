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
const extractedPrefix = '../i18n/app-bundle/';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizedPartPath(part) {
  return String(part.path || '').replace(/\\/g, '/');
}

function isAlreadyExtracted(part) {
  return normalizedPartPath(part).startsWith(extractedPrefix);
}

function isI18nPart(part) {
  const category = String(part.category || '');
  const bucket = String(part.bucket || '');
  const partPath = normalizedPartPath(part);
  return category === 'i18n' || category.startsWith('i18n') || bucket === 'i18n' || partPath.includes('/i18n/');
}

function safeFileName(part) {
  return path.basename(normalizedPartPath(part));
}

function pathFromAppBundleRootToI18n(filename) {
  return path.posix.join('..', 'i18n', 'app-bundle', filename);
}

function absolutePartPath(part) {
  return path.resolve(appBundleRoot, normalizedPartPath(part));
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');
  fs.mkdirSync(i18nRoot, { recursive: true });

  let moved = 0;
  let alreadyExtracted = 0;
  const nextParts = manifest.parts.map(part => {
    if (!isI18nPart(part)) return part;

    if (isAlreadyExtracted(part)) {
      assert(fs.existsSync(absolutePartPath(part)), `Missing extracted i18n fragment: ${part.path}`);
      alreadyExtracted += 1;
      return {
        ...part,
        sourceDomain: 'i18n',
        sourceRoot: 'src/i18n/app-bundle'
      };
    }

    const source = absolutePartPath(part);
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
    i18nPartCount: moved + alreadyExtracted,
    parts: nextParts
  };

  fs.writeFileSync(manifestFile, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Extracted ${moved} i18n fragment(s); ${alreadyExtracted} already in src/i18n/app-bundle/.`);
}

try { main(); }
catch (error) { console.error('i18n extraction failed:', error.message); process.exit(1); }
