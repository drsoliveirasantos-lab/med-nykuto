#!/usr/bin/env node
/*
  Refine oversized app.bundle.js source fragments into smaller ordered fragments.
  The manifest order is preserved and app.bundle.js must rebuild byte-for-byte.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceRoot = path.join(root, 'src', 'app-bundle');
const manifestFile = path.join(sourceRoot, 'manifest.json');
const largeThresholdBytes = 50000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function splitLinesPreserveEol(text) {
  return text.match(/[^\n]*\n|[^\n]+$/g) || [];
}

function slug(value) {
  return String(value || 'fragment')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'fragment';
}

function countState(line, state) {
  let i = 0;
  let lineComment = false;
  while (i < line.length) {
    const ch = line[i];
    const next = line[i + 1];

    if (lineComment) break;

    if (state.blockComment) {
      if (ch === '*' && next === '/') {
        state.blockComment = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (state.quote) {
      if (state.escape) {
        state.escape = false;
        i += 1;
        continue;
      }
      if (ch === '\\') {
        state.escape = true;
        i += 1;
        continue;
      }
      if (ch === state.quote) {
        state.quote = null;
        i += 1;
        continue;
      }
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      break;
    }
    if (ch === '/' && next === '*') {
      state.blockComment = true;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      state.quote = ch;
      state.escape = false;
      i += 1;
      continue;
    }
    if (ch === '{') state.brace += 1;
    else if (ch === '}') state.brace -= 1;
    else if (ch === '(') state.paren += 1;
    else if (ch === ')') state.paren -= 1;
    else if (ch === '[') state.bracket += 1;
    else if (ch === ']') state.bracket -= 1;
    i += 1;
  }
}

function splitTopLevelBlocks(text) {
  const lines = splitLinesPreserveEol(text);
  const blocks = [];
  const state = { brace: 0, paren: 0, bracket: 0, quote: null, escape: false, blockComment: false };
  let current = [];

  function flush() {
    if (!current.length) return;
    blocks.push(current.join(''));
    current = [];
  }

  for (const line of lines) {
    current.push(line);
    countState(line, state);
    const trimmed = line.trim();
    const top = state.brace === 0 && state.paren === 0 && state.bracket === 0 && !state.quote && !state.blockComment;
    if (!top || !trimmed) continue;

    if (
      trimmed.endsWith(';') ||
      trimmed === '}' ||
      trimmed === '});' ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*')
    ) {
      flush();
    }
  }
  flush();
  return blocks;
}

function summarize(block) {
  const line = (block.split('\n').find(l => l.trim() && !l.trim().startsWith('//')) || '').trim();
  return line.slice(0, 120);
}

function classify(block) {
  const text = block;
  if (/^\s*\}\)\(\);\s*$/.test(text)) return 'runtime-wrapper';
  if (/\b(UI\.|Object\.assign\(UI|function\s+(lang|t|setHtmlLang|currentLang|syncLangControls|setLang)\b)/.test(text)) return 'i18n';
  if (/\b(questionsFor|makeSession|renderPractice|renderQuestion|answerQuestion|finishSeries|renderClinical|renderVf|saveMistake|removeMistake|loadMistakes|reviewItems|examMode|mistakes)\b/.test(text)) return 'practice';
  if (/\b(renderHome|renderSubjects|renderModules|renderCourse|renderModule|renderContact|renderAbout|renderLegal|renderDashboard|renderErrors)\b/.test(text)) return 'pages';
  if (/\b(localStorage|progressKey|safeGetItem|safeSetItem|loadProgress|saveProgress|moduleKey|courseProgress|globalProgress)\b/.test(text)) return 'app-storage';
  if (/\b(querySelector|querySelectorAll|addEventListener|classList|innerHTML|createElement|document\.)\b/.test(text)) return 'dom';
  if (/\b(rehydrateCollapsedMarkdown|editorialCleanText|applyEditorialPhrases|EDITORIAL_PHRASE_MAP)\b/.test(text)) return 'content-normalization';
  if (/\b(function\s+|const\s+|let\s+|var\s+)/.test(text)) return 'app-logic';
  return 'misc';
}

function bucketFor(category) {
  if (category === 'runtime-wrapper') return 'runtime';
  if (category === 'i18n') return 'i18n';
  if (category === 'practice') return 'practice';
  if (category === 'pages') return 'pages';
  if (category === 'dom') return 'dom';
  if (category === 'app-storage' || category === 'content-normalization' || category === 'app-logic') return 'app';
  return 'misc';
}

function refinePart(part) {
  const originalPath = path.join(sourceRoot, part.path);
  assert(fs.existsSync(originalPath), `Missing fragment: ${part.path}`);
  const original = fs.readFileSync(originalPath, 'utf8');
  const bytes = Buffer.byteLength(original, 'utf8');
  if (bytes <= largeThresholdBytes) return [{ ...part, bytes }];

  const blocks = splitTopLevelBlocks(original);
  if (blocks.length < 2 || blocks.join('') !== original) {
    return [{ ...part, bytes, refineNote: 'not-safely-splittable' }];
  }

  const orderPrefix = String(Math.floor(Number(part.order))).padStart(3, '0');
  const generated = blocks.map((block, index) => {
    const category = classify(block);
    const bucket = bucketFor(category);
    const fileName = `${orderPrefix}-${String(index + 1).padStart(3, '0')}-${slug(category)}.js`;
    const relativePath = path.posix.join('modules', bucket, fileName);
    const target = path.join(sourceRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, block, 'utf8');
    return {
      ...part,
      path: relativePath,
      category,
      bucket,
      bytes: Buffer.byteLength(block, 'utf8'),
      summary: summarize(block),
      refinedFrom: part.path,
      refinementIndex: index + 1
    };
  });

  fs.rmSync(originalPath, { force: true });
  return generated;
}

function renumber(parts) {
  return parts.map((part, index) => ({ ...part, order: index + 1 }));
}

function main() {
  assert(fs.existsSync(manifestFile), 'Missing src/app-bundle/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  assert(Array.isArray(manifest.parts), 'manifest.parts must be an array');

  const ordered = manifest.parts.slice().sort((a, b) => Number(a.order) - Number(b.order));
  let refined = [];
  let refinedCount = 0;
  for (const part of ordered) {
    const out = refinePart(part);
    if (out.length > 1) refinedCount += 1;
    refined = refined.concat(out);
  }

  refined = renumber(refined);
  const totalBytes = refined.reduce((sum, part) => sum + Number(part.bytes || 0), 0);
  const nextManifest = {
    ...manifest,
    strategy: 'refined-domain-fragments-byte-identical',
    refinedWith: 'scripts/refine-app-bundle-fragments.js',
    largeFragmentThresholdBytes: largeThresholdBytes,
    refinedLargeFragmentCount: refinedCount,
    partCount: refined.length,
    totalBytes,
    parts: refined
  };
  fs.writeFileSync(manifestFile, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Refined ${refinedCount} oversized app bundle fragment(s). Manifest now has ${refined.length} parts.`);
}

try { main(); }
catch (error) { console.error('Refinement failed:', error.message); process.exit(1); }
