#!/usr/bin/env node
/* Validate split Fisiología practice bank sources. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestFile = path.join(root, 'content', 'practice', 'fisiologia', 'manifest.json');
const FORMATS = ['qcm', 'vf', 'cases'];

function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function assert(cond, msg){ if(!cond) throw new Error(msg); }

const ids = new Set();
const totals = { qcm: 0, vf: 0, cases: 0 };

function validateItem(item, fmt, mod){
  assert(item && typeof item === 'object', `${fmt} item must be an object in ${mod.id}`);
  assert(item.id && typeof item.id === 'string', `${fmt} item without id in ${mod.id}`);
  assert(!ids.has(item.id), `Duplicate item id: ${item.id}`);
  ids.add(item.id);
  assert(item.courseId === 'fisiologia', `${item.id}: courseId must be fisiologia`);
  assert(String(item.moduleId) === String(mod.id), `${item.id}: moduleId mismatch, expected ${mod.id}`);
  assert(Number(item.moduleNumber) === Number(mod.number), `${item.id}: moduleNumber mismatch, expected ${mod.number}`);
  if(fmt === 'qcm'){
    assert(Array.isArray(item.options) && item.options.length === 4, `${item.id}: QCM must have 4 options`);
    assert(Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < 4, `${item.id}: invalid answerIndex`);
  }
  if(fmt === 'vf'){
    assert(Array.isArray(item.options) && item.options.length === 2, `${item.id}: VF must have 2 options`);
    assert(Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < 2, `${item.id}: invalid VF answerIndex`);
  }
  if(fmt === 'cases'){
    assert(item.question || item.clinicalCase || item.caseText || item.stem, `${item.id}: clinical case needs a question/stem`);
    assert(Array.isArray(item.options) && item.options.length === 4, `${item.id}: clinical case must have 4 options`);
    assert(Number.isInteger(item.answerIndex) && item.answerIndex >= 0 && item.answerIndex < 4, `${item.id}: invalid case answerIndex`);
  }
}

try {
  assert(fs.existsSync(manifestFile), `Missing ${manifestFile}`);
  const manifest = readJson(manifestFile);
  const sourceRoot = path.dirname(manifestFile);
  assert(manifest.courseId === 'fisiologia', 'manifest courseId must be fisiologia');
  assert(Array.isArray(manifest.modules), 'manifest.modules must be an array');
  for(const mod of manifest.modules){
    const dir = path.join(sourceRoot, 'modules', mod.directory);
    assert(fs.existsSync(dir), `Missing module directory ${mod.directory}`);
    for(const fmt of FORMATS){
      const file = path.join(dir, (mod.files && mod.files[fmt]) || `${fmt}.json`);
      assert(fs.existsSync(file), `Missing ${fmt}.json in ${mod.directory}`);
      const rows = readJson(file);
      assert(Array.isArray(rows), `${file} must contain an array`);
      totals[fmt] += rows.length;
      for(const item of rows) validateItem(item, fmt, mod);
    }
  }
  const expected = manifest.totals || {};
  for(const fmt of FORMATS){
    assert(Number(expected[fmt]) === totals[fmt], `Total mismatch for ${fmt}: manifest=${expected[fmt]}, files=${totals[fmt]}`);
  }
  console.log(`Fisiología split bank OK: qcm=${totals.qcm}, vf=${totals.vf}, cases=${totals.cases}, unique ids=${ids.size}`);
} catch(error){
  console.error('Validation failed:', error.message);
  process.exit(1);
}
