#!/usr/bin/env node
/*
  Med Nykuto — practice bank validator

  Usage from repo root:
    node scripts/validate-practice-bank.js

  Goal:
  - catch weak or broken QCM data before publishing;
  - keep distractors homogeneous and explanations complete;
  - prevent answerIndex / option mismatches.
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const FAIL = [];
const WARN = [];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function listJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => path.join(dir, name));
}

function pushFail(file, id, msg) {
  FAIL.push(`${path.relative(ROOT, file)}${id ? ` · ${id}` : ''}: ${msg}`);
}

function pushWarn(file, id, msg) {
  WARN.push(`${path.relative(ROOT, file)}${id ? ` · ${id}` : ''}: ${msg}`);
}

function extractObjects(text) {
  // Works for the repository's current data style: objects containing options + answerIndex.
  const objects = [];
  const marker = /answerIndex\s*:/g;
  let match;
  while ((match = marker.exec(text))) {
    let start = match.index;
    while (start > 0 && text[start] !== '{') start -= 1;
    if (text[start] !== '{') continue;

    let depth = 0;
    let inStr = false;
    let quote = '';
    let esc = false;
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === quote) inStr = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; quote = ch; continue; }
      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;
      if (depth === 0) {
        objects.push(text.slice(start, i + 1));
        marker.lastIndex = i + 1;
        break;
      }
    }
  }
  return objects;
}

function getString(obj, key) {
  const re = new RegExp(`${key}\\s*:\\s*([\"'\`])([\\s\\S]*?)\\1`);
  const m = obj.match(re);
  return m ? m[2].replace(/\\n/g, ' ').trim() : '';
}

function getNumber(obj, key) {
  const re = new RegExp(`${key}\\s*:\\s*(\\d+)`);
  const m = obj.match(re);
  return m ? Number(m[1]) : NaN;
}

function getOptions(obj) {
  const m = obj.match(/options\s*:\s*\[([\s\S]*?)\]/);
  if (!m) return [];
  return [...m[1].matchAll(/(["'`])([\s\S]*?)\1/g)].map((x) => x[2].replace(/\s+/g, ' ').trim());
}

function hasField(obj, key) {
  return new RegExp(`${key}\\s*:`).test(obj);
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateObject(file, obj, index, seenQuestions) {
  const id = getString(obj, 'id') || `object#${index + 1}`;
  const question = getString(obj, 'question') || getString(obj, 'stem') || getString(obj, 'prompt');
  const options = getOptions(obj);
  const answerIndex = getNumber(obj, 'answerIndex');
  const explanation = getString(obj, 'explanation');

  if (!question) pushFail(file, id, 'question/stem/prompt manquant.');
  if (question && question.length < 18) pushWarn(file, id, 'question très courte, vérifier la valeur pédagogique.');

  const qNorm = norm(question);
  if (qNorm) {
    if (seenQuestions.has(qNorm)) pushWarn(file, id, 'question potentiellement dupliquée.');
    seenQuestions.add(qNorm);
  }

  if (options.length !== 4) pushFail(file, id, `4 options attendues, trouvé ${options.length}.`);
  if (!Number.isInteger(answerIndex)) pushFail(file, id, 'answerIndex manquant ou invalide.');
  else if (answerIndex < 0 || answerIndex >= options.length) pushFail(file, id, `answerIndex ${answerIndex} hors limites.`);

  const optionSet = new Set(options.map(norm));
  if (optionSet.size !== options.length) pushFail(file, id, 'options dupliquées ou quasi identiques.');

  if (!explanation || explanation.length < 35) {
    pushWarn(file, id, 'explanation absente ou trop courte pour correction premium.');
  }

  const hasStructuredCorrection = hasField(obj, 'whyCorrect') || hasField(obj, 'whyWrong') || hasField(obj, 'examPearl') || hasField(obj, 'trapType');
  if (!hasStructuredCorrection) {
    pushWarn(file, id, 'ajouter idéalement whyCorrect / whyWrong / trapType / examPearl.');
  }

  options.forEach((opt, i) => {
    if (opt.length < 3) pushWarn(file, id, `option ${String.fromCharCode(65 + i)} très courte.`);
    if (i !== answerIndex && /todas|toutes|todas las anteriores|ninguna|aucune/i.test(opt)) {
      pushWarn(file, id, `option ${String.fromCharCode(65 + i)} de type “toutes/aucune”, souvent trop facile.`);
    }
  });
}

function main() {
  const files = listJsFiles(DATA_DIR).filter((file) => /practice|qcm|bank/i.test(path.basename(file)));
  const seenQuestions = new Set();
  let checked = 0;

  files.forEach((file) => {
    const text = read(file);
    const objects = extractObjects(text);
    objects.forEach((obj, i) => {
      checked += 1;
      validateObject(file, obj, i, seenQuestions);
    });
  });

  console.log(`Med Nykuto validator — ${checked} objets QCM analysés.`);

  if (WARN.length) {
    console.log(`\nWarnings (${WARN.length})`);
    WARN.slice(0, 80).forEach((w) => console.log(`- ${w}`));
    if (WARN.length > 80) console.log(`- ... ${WARN.length - 80} autres warnings`);
  }

  if (FAIL.length) {
    console.error(`\nErrors (${FAIL.length})`);
    FAIL.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log('\nOK — aucune erreur bloquante détectée.');
}

main();
