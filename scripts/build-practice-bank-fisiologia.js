#!/usr/bin/env node
/* Build data/practice-bank-fisiologia.js from split content/practice/fisiologia sources. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestFile = path.join(root, 'content', 'practice', 'fisiologia', 'manifest.json');
const outFile = path.join(root, 'data', 'practice-bank-fisiologia.js');
const FORMATS = ['qcm', 'vf', 'cases'];

function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function assert(cond, msg){ if(!cond) throw new Error(msg); }

function build(){
  assert(fs.existsSync(manifestFile), `Missing ${manifestFile}`);
  const manifest = readJson(manifestFile);
  const sourceRoot = path.dirname(manifestFile);
  const bank = { qcm: [], cases: [], vf: [] };

  for(const mod of manifest.modules || []){
    const dir = path.join(sourceRoot, 'modules', mod.directory);
    assert(fs.existsSync(dir), `Missing module directory: ${dir}`);
    for(const fmt of FORMATS){
      const file = path.join(dir, (mod.files && mod.files[fmt]) || `${fmt}.json`);
      assert(fs.existsSync(file), `Missing ${fmt}.json for ${mod.id}`);
      const rows = readJson(file);
      assert(Array.isArray(rows), `${file} must be an array`);
      if(fmt === 'cases') bank.cases.push(...rows);
      else bank[fmt].push(...rows);
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const body = [
    'window.MED_PRACTICE_BANK=window.MED_PRACTICE_BANK||{};',
    'window.MED_PRACTICE_BANK.byCourse=window.MED_PRACTICE_BANK.byCourse||{};',
    `window.MED_PRACTICE_BANK.byCourse["fisiologia"]=${JSON.stringify(bank)};`,
    ''
  ].join('\n');
  fs.writeFileSync(outFile, body, 'utf8');
  console.log(`Built ${path.relative(root, outFile)}: qcm=${bank.qcm.length}, vf=${bank.vf.length}, cases=${bank.cases.length}`);
}

try { build(); }
catch(error){ console.error('Build failed:', error.message); process.exit(1); }
