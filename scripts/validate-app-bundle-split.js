#!/usr/bin/env node
/* Validate that src/app-bundle fragments rebuild app.bundle.js byte-for-byte. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const sourceRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(sourceRoot, 'manifest.json');
const bundleFile = path.join(root, 'app.bundle.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function rebuiltFromManifest(manifest) {
  let output = '';
  for (const part of manifest.parts.slice().sort((a, b) => Number(a.order) - Number(b.order))) {
    const file = path.join(sourceRoot, part.path);
    assert(fs.existsSync(file), `Missing fragment: ${part.path}`);
    const text = read(file);
    if (typeof part.bytes === 'number') {
      assert(Buffer.byteLength(text, 'utf8') === part.bytes, `Byte count mismatch in ${part.path}`);
    }
    output += text;
  }
  return output;
}

function syntaxCheckOnly(source) {
  // Parse the bundle without executing browser code. Running app.bundle.js needs a real DOM,
  // but parsing catches syntax errors while keeping validation deterministic in CI.
  new vm.Script(source, { filename: 'app.bundle.js' });
}

try {
  assert(fs.existsSync(bundleFile), 'Missing app.bundle.js');
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(read(manifestFile));
  assert(manifest.sourceFile === 'app.bundle.js', 'manifest.sourceFile must be app.bundle.js');
  assert(Array.isArray(manifest.parts) && manifest.parts.length > 0, 'manifest.parts must not be empty');

  const original = read(bundleFile);
  const rebuilt = rebuiltFromManifest(manifest);
  assert(rebuilt === original, 'Rebuilt app.bundle.js does not match current app.bundle.js byte-for-byte');
  assert(Buffer.byteLength(rebuilt, 'utf8') === manifest.totalBytes, 'Total byte count mismatch');
  syntaxCheckOnly(rebuilt);
  console.log(`App bundle split OK: ${manifest.parts.length} fragments, ${manifest.totalBytes} bytes, byte-identical rebuild.`);
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}
