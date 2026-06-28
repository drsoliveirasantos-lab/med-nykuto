#!/usr/bin/env node
/*
  Move app-bundle DOM fragments into src/dom while preserving the manifest
  order and byte-identical app.bundle.js rebuild.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const appBundleRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(appBundleRoot, 'manifest.json');
const domRoot = path.join(root, 'src', 'dom', 'app-bundle');
const extractedPrefix = '../dom/app-bundle/';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizedPartPath(part) {
  return String(part.path || '').replace(/\\/g, '/');
}

function isAlreadyExtracted(part) {
  return normalizedPartPath(part).startsWith(extractedPrefix);
}

function isDomPart(part) {
  const category = String(part.category || '');
  const bucket = String(part.bucket || '');
  const partPath = normalizedPartPath(part);
  return category === 'dom' || category.startsWith('dom') || bucket === 'dom' || partPath.includes('/dom/');
}

function safeFileName(part) {
  return path.basename(normalizedPartPath(part));
}

function pathFromAppBundleRootToDom(filename) {
  return path.posix.join('..', 'dom', 'app-bundle', filename);
}

function absolutePartPath(part) {
  return path.resolve(appBundleRoot, normalizedPartPath(part));
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');
  fs.mkdirSync(domRoot, { recursive: true });

  let moved = 0;
  let alreadyExtracted = 0;
  const nextParts = manifest.parts.map(part => {
    if (!isDomPart(part)) return part;

    if (isAlreadyExtracted(part)) {
      assert(fs.existsSync(absolutePartPath(part)), `Missing extracted DOM fragment: ${part.path}`);
      alreadyExtracted += 1;
      return {
        ...part,
        sourceDomain: 'dom',
        sourceRoot: 'src/dom/app-bundle'
      };
    }

    const source = absolutePartPath(part);
    assert(fs.existsSync(source), `Missing DOM fragment: ${part.path}`);
    const filename = safeFileName(part);
    const target = path.join(domRoot, filename);
    const text = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, text, 'utf8');
    fs.rmSync(source, { force: true });
    moved += 1;
    return {
      ...part,
      path: pathFromAppBundleRootToDom(filename),
      sourceDomain: 'dom',
      sourceRoot: 'src/dom/app-bundle'
    };
  });

  const nextManifest = {
    ...manifest,
    strategy: 'dom-extracted-domain-fragments-byte-identical',
    domExtractedWith: 'scripts/extract-app-bundle-dom.js',
    domSourceRoot: 'src/dom/app-bundle',
    domPartCount: moved + alreadyExtracted,
    parts: nextParts
  };

  fs.writeFileSync(manifestFile, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Extracted ${moved} DOM fragment(s); ${alreadyExtracted} already in src/dom/app-bundle/.`);
}

try { main(); }
catch (error) { console.error('DOM extraction failed:', error.message); process.exit(1); }
