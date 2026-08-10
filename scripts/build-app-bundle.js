#!/usr/bin/env node
/* Build app.bundle.js from src/app-bundle ordered fragments. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(sourceRoot, 'manifest.json');
const outFile = path.join(root, 'app.bundle.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  assert(fs.existsSync(manifestFile), `Missing ${manifestFile}`);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');
  const ordered = manifest.parts.slice().sort((a, b) => Number(a.order) - Number(b.order));
  let output = '';
  for (const part of ordered) {
    assert(part.path, `Manifest part ${part.order} has no path`);
    const file = path.join(sourceRoot, part.path);
    assert(fs.existsSync(file), `Missing fragment: ${part.path}`);
    output += fs.readFileSync(file, 'utf8');
  }
  fs.writeFileSync(outFile, output, 'utf8');
  console.log(`Built app.bundle.js from ${ordered.length} fragments (${Buffer.byteLength(output, 'utf8')} bytes).`);
}

try { main(); }
catch (error) { console.error('Build failed:', error.message); process.exit(1); }
