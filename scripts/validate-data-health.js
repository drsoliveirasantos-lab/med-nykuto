#!/usr/bin/env node
/* v363 — Data health validator for Med Nykuto restored split files.
   Validates the rich course catalog, restored practice banks and fallback completion. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const problems = [];
function add(msg){ problems.push(msg); }
function read(p){
  const full = path.join(root, p);
  if(!fs.existsSync(full)){ add(`${p}: missing`); return ''; }
  return fs.readFileSync(full, 'utf8');
}
function nonEmptyJs(p, marker){
  const s = read(p);
  if(!s.trim()) add(`${p}: empty file`);
  if(marker && !s.includes(marker)) add(`${p}: missing marker ${marker}`);
  return s;
}
function runInContext(label, code, context, timeout=12000){
  try { vm.runInContext(code, context, {filename: label, timeout}); }
  catch(err){ add(`${label}: execution failed: ${err.message}`); }
}
function countByModule(items){
  const set = new Set();
  (items || []).forEach(x => { if(x && x.moduleNumber) set.add(x.moduleNumber); });
  return set.size;
}
function assertBank(label, bank, expected){
  if(!bank){ add(`${label}: missing bank`); return; }
  const qcm = bank.qcm || [];
  const vf = bank.vf || [];
  const cases = bank.cases || [];
  if(qcm.length < expected.qcm) add(`${label}: expected >=${expected.qcm} QCM, got ${qcm.length}`);
  if(vf.length < expected.vf) add(`${label}: expected >=${expected.vf} V/F, got ${vf.length}`);
  if(cases.length < expected.cases) add(`${label}: expected >=${expected.cases} cases, got ${cases.length}`);
  const moduleCount = Math.max(countByModule(qcm), countByModule(vf), countByModule(cases));
  if(moduleCount < expected.modules) add(`${label}: expected ${expected.modules} modules represented, got ${moduleCount}`);
  const sample = qcm[0];
  if(!sample || !Array.isArray(sample.options) || sample.options.length !== 4) add(`${label}: sample QCM does not have 4 options`);
}

const coursesCode = nonEmptyJs('data/med-courses-data.js', 'MED_COURSES_DATA');
const initCode = nonEmptyJs('data/med-practice-bank-init.js', 'MED_PRACTICE_BANK');
const loader = nonEmptyJs('data/med-practice-bank-loader.js', 'practice-bank-functional-fallback-v360.js');
if(!/MED_PRACTICE_BANK_LAZY_WANTED/.test(loader)) add('data/med-practice-bank-loader.js: missing lazy wanted marker');
if(!/v363|VERSION\s*=\s*["']363/.test(loader)) add('data/med-practice-bank-loader.js: cache version is not v363');

const fallbackCode = nonEmptyJs('data/practice-bank-functional-fallback-v360.js', 'v360-functional-fallback');
['qcm','vf','cases'].forEach(key => { if(!new RegExp(`\\b${key}\\b`).test(fallbackCode)) add(`fallback bank: missing ${key}`); });

const context = vm.createContext({window:{}, console:{log(){}, warn(){}, error(){}}, document:{write(){}, body:{dataset:{}}}, localStorage:{}});
runInContext('data/med-courses-data.js', coursesCode, context);
const data = context.window.MED_COURSES_DATA;
if(!data || !Array.isArray(data.courses)) add('MED_COURSES_DATA: not created as expected');
else {
  const active = data.courses.filter(c => (c.modules || []).length > 0);
  const modules = data.courses.flatMap(c => c.modules || []);
  if(data.courses.length < 6) add(`MED_COURSES_DATA: expected at least 6 courses, got ${data.courses.length}`);
  if(active.length < 5) add(`MED_COURSES_DATA: expected at least 5 active courses, got ${active.length}`);
  if(modules.length !== 58) add(`MED_COURSES_DATA: expected 58 modules, got ${modules.length}`);
  const generic = modules.filter(m => /Este módulo organiza los puntos esenciales|La lógica de estudio debe seguir/i.test(String(m.markdown || m.fullMarkdown || '')));
  if(generic.length) add(`MED_COURSES_DATA: generic fallback modules detected: ${generic.length}`);
  const rich = modules.filter(m => String(m.markdown || m.fullMarkdown || '').length > 2500);
  if(rich.length < 50) add(`MED_COURSES_DATA: expected rich markdown in most modules, got ${rich.length}/58`);
  const ids = new Set();
  modules.forEach(m => {
    if(!m.id || !m.title || !(m.markdown || m.fullMarkdown)) add(`MED_COURSES_DATA: incomplete module ${m && m.id}`);
    if(ids.has(m.id)) add(`MED_COURSES_DATA: duplicate module id ${m.id}`);
    ids.add(m.id);
  });
}

runInContext('data/med-practice-bank-init.js', initCode, context);
const bankFiles = {
  fisiologia:'data/practice-bank-fisiologia.js',
  microbiologia:'data/practice-bank-microbiologia.js',
  genetica:'data/practice-bank-genetica.js',
  bioquimica:'data/practice-bank-bioquimica.js',
  inmunologia:'data/practice-bank-inmunologia.js'
};
Object.entries(bankFiles).forEach(([course, file]) => runInContext(file, nonEmptyJs(file, course), context));
context.window.MED_PRACTICE_BANK_LAZY_WANTED = Object.keys(bankFiles);
runInContext('data/practice-bank-functional-fallback-v360.js', fallbackCode, context);
const byCourse = context.window.MED_PRACTICE_BANK && context.window.MED_PRACTICE_BANK.byCourse || {};
assertBank('fisiologia', byCourse.fisiologia, {modules:9, qcm:1800, vf:450, cases:450});
assertBank('microbiologia', byCourse.microbiologia, {modules:13, qcm:2600, vf:650, cases:650});
assertBank('genetica', byCourse.genetica, {modules:12, qcm:2400, vf:600, cases:600});
assertBank('bioquimica', byCourse.bioquimica, {modules:12, qcm:600, vf:120, cases:600});
assertBank('inmunologia', byCourse.inmunologia, {modules:12, qcm:600, vf:120, cases:600});

if(problems.length){
  console.log('Med Nykuto data validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log('Med Nykuto restored data validation OK.');
