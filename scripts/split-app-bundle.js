#!/usr/bin/env node
/*
  Split app.bundle.js into ordered source fragments without changing runtime behavior.
  The generated fragments are concatenated by scripts/build-app-bundle.js.
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const sourceFile = path.join(root, 'app.bundle.js');
const outRoot = path.join(root, 'src', 'app-bundle');
const partsRoot = path.join(outRoot, 'parts');
const manifestFile = path.join(outRoot, 'manifest.json');

function splitLinesPreserveEol(text) {
  return text.match(/[^\n]*\n|[^\n]+$/g) || [];
}

function slug(value) {
  return String(value || 'part')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'part';
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

function splitBodyIntoTopLevelBlocks(lines) {
  const blocks = [];
  const state = { brace: 0, paren: 0, bracket: 0, quote: null, escape: false, blockComment: false };
  let current = [];

  function flush() {
    if (current.length) {
      blocks.push(current.join(''));
      current = [];
    }
  }

  for (const line of lines) {
    current.push(line);
    countState(line, state);
    const trimmed = line.trim();
    const top = state.brace === 0 && state.paren === 0 && state.bracket === 0 && !state.quote && !state.blockComment;
    if (!top) continue;

    if (!trimmed) {
      continue;
    }
    if (
      trimmed.endsWith(';') ||
      trimmed === '}' ||
      trimmed === '});' ||
      trimmed === '});\n' ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*')
    ) {
      flush();
    }
  }
  flush();
  return blocks;
}

function classify(block, index) {
  const text = block;
  if (index === 0 && /const DATA\b/.test(text)) return 'app-bootstrap-state';
  if (/const UI\s*=\s*\{/.test(text) || /Object\.assign\(UI\./.test(text)) return 'i18n-dictionary';
  if (/function\s+(lang|t|setHtmlLang|currentLang|syncLangControls|setLang)\b/.test(text)) return 'i18n-helpers';
  if (/progressKey|localStorage|loadProgress|saveProgress|moduleKey|markModule|courseProgress|globalProgress/.test(text)) return 'progress-storage';
  if (/function\s+(questionsFor|shuffle|makeSession|saveMistake|removeMistake|loadMistakes|reviewItems)/.test(text)) return 'practice-data';
  if (/function\s+(renderPractice|renderQuestion|answerQuestion|finishSeries|renderBalance|renderClinical|renderVf)/.test(text)) return 'practice-engine';
  if (/function\s+renderHome\b/.test(text)) return 'page-home';
  if (/function\s+renderSubjects\b/.test(text)) return 'page-subjects';
  if (/function\s+renderModules\b/.test(text)) return 'page-modules';
  if (/function\s+renderCourse\b/.test(text)) return 'page-course';
  if (/function\s+renderModule\b/.test(text)) return 'page-module-reader';
  if (/function\s+renderErrors\b/.test(text)) return 'page-errors';
  if (/function\s+renderContact\b/.test(text)) return 'page-contact';
  if (/function\s+renderAbout\b|function\s+renderLegal\b/.test(text)) return 'page-info-legal';
  if (/page\s*===|renderHome\(\)|renderSubjects\(\)|renderModules\(\)|renderPractice\(/.test(text)) return 'router-entrypoint';
  if (/addEventListener|DOMContentLoaded|querySelector/.test(text)) return 'dom-events';
  if (/function\s+/.test(text)) return 'app-functions';
  return 'app-misc';
}

function summarize(block) {
  const line = (block.split('\n').find(l => l.trim() && !l.trim().startsWith('//')) || '').trim();
  return line.slice(0, 120);
}

function main() {
  if (!fs.existsSync(sourceFile)) throw new Error(`Missing ${sourceFile}`);
  const original = fs.readFileSync(sourceFile, 'utf8');
  const lines = splitLinesPreserveEol(original);
  const openIndex = lines.findIndex(line => line.trim() === '(function(){');
  const closeIndex = lines.map(line => line.trim()).lastIndexOf('})();');
  if (openIndex < 0 || closeIndex < 0 || closeIndex <= openIndex) {
    throw new Error('Could not identify app.bundle.js IIFE wrapper');
  }

  const preamble = lines.slice(0, openIndex + 1).join('');
  const body = lines.slice(openIndex + 1, closeIndex);
  const closing = lines.slice(closeIndex).join('');

  const bodyBlocks = splitBodyIntoTopLevelBlocks(body);
  const entries = [];
  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(partsRoot, { recursive: true });

  const fragments = [
    { category: 'bundle-wrapper', text: preamble, summary: 'Opening comments and IIFE wrapper' },
    ...bodyBlocks.map((text, idx) => ({ category: classify(text, idx), text, summary: summarize(text) })),
    { category: 'bundle-wrapper', text: closing, summary: 'Closing IIFE wrapper' }
  ];

  fragments.forEach((fragment, index) => {
    const fileName = `${String(index + 1).padStart(3, '0')}-${slug(fragment.category)}.js`;
    const relativePath = path.posix.join('parts', fileName);
    fs.writeFileSync(path.join(partsRoot, fileName), fragment.text, 'utf8');
    entries.push({ order: index + 1, path: relativePath, category: fragment.category, bytes: Buffer.byteLength(fragment.text, 'utf8'), summary: fragment.summary });
  });

  const manifest = {
    generatedFrom: 'scripts/split-app-bundle.js',
    rebuildWith: 'scripts/build-app-bundle.js',
    validateWith: 'scripts/validate-app-bundle-split.js',
    sourceFile: 'app.bundle.js',
    strategy: 'ordered-fragments-byte-identical',
    partCount: entries.length,
    totalBytes: Buffer.byteLength(original, 'utf8'),
    parts: entries
  };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Split app.bundle.js into ${entries.length} ordered fragments (${manifest.totalBytes} bytes).`);
}

try { main(); }
catch (error) { console.error('Split failed:', error.message); process.exit(1); }
