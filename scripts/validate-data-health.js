#!/usr/bin/env node
/* v361 — Data health validator for Med Nykuto split files.
   Executes the compact metadata and fallback bank in a VM to catch real regressions. */
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
function runInContext(label, code, context){
  try { vm.runInContext(code, context, {filename: label, timeout: 1500}); }
  catch(err){ add(`${label}: execution failed: ${err.message}`); }
}

const coursesCode = nonEmptyJs('data/med-courses-data.js', 'MED_COURSES_DATA');
if(!/courses\s*:|COURSE_SPECS|\[\[/.test(coursesCode)) add('data/med-courses-data.js: no detectable course/module structure');

const initCode = nonEmptyJs('data/med-practice-bank-init.js', 'MED_PRACTICE_BANK');
if(!/byCourse/.test(initCode)) add('data/med-practice-bank-init.js: no byCourse initializer');

const loader = nonEmptyJs('data/med-practice-bank-loader.js', 'practice-bank-functional-fallback-v360.js');
if(!/MED_PRACTICE_BANK_LAZY_WANTED/.test(loader)) add('data/med-practice-bank-loader.js: missing lazy wanted marker');

const fallbackCode = nonEmptyJs('data/practice-bank-functional-fallback-v360.js', 'v360-functional-fallback');
['qcm','vf','cases'].forEach(key => {
  if(!new RegExp(`\\b${key}\\b`).test(fallbackCode)) add(`fallback bank: missing ${key}`);
});

const context = vm.createContext({window:{}, console:{log(){}, warn(){}, error(){}}, document:{}, localStorage:{}});
runInContext('data/med-courses-data.js', coursesCode, context);
const data = context.window.MED_COURSES_DATA;
if(!data || !Array.isArray(data.courses)) add('MED_COURSES_DATA: not created as expected');
else {
  const active = data.courses.filter(c => (c.modules || []).length > 0);
  const modules = data.courses.flatMap(c => c.modules || []);
  if(data.courses.length < 6) add(`MED_COURSES_DATA: expected at least 6 courses, got ${data.courses.length}`);
  if(active.length < 5) add(`MED_COURSES_DATA: expected at least 5 active courses, got ${active.length}`);
  if(modules.length !== 58) add(`MED_COURSES_DATA: expected 58 modules, got ${modules.length}`);
  const ids = new Set();
  modules.forEach(m => {
    if(!m.id || !m.title || !m.markdown) add(`MED_COURSES_DATA: incomplete module ${m && m.id}`);
    if(ids.has(m.id)) add(`MED_COURSES_DATA: duplicate module id ${m.id}`);
    ids.add(m.id);
  });
}

context.window.MED_PRACTICE_BANK = {byCourse:{}};
context.window.MED_PRACTICE_BANK_LAZY_WANTED = ['fisiologia'];
runInContext('data/practice-bank-functional-fallback-v360.js', fallbackCode, context);
const bank = context.window.MED_PRACTICE_BANK && context.window.MED_PRACTICE_BANK.byCourse && context.window.MED_PRACTICE_BANK.byCourse.fisiologia;
if(!bank) add('fallback bank: fisiologia not built when requested');
else {
  if((bank.qcm || []).length < 180) add(`fallback bank: expected >=180 fisiologia QCM, got ${(bank.qcm || []).length}`);
  if((bank.vf || []).length < 90) add(`fallback bank: expected >=90 fisiologia V/F, got ${(bank.vf || []).length}`);
  if((bank.cases || []).length < 45) add(`fallback bank: expected >=45 fisiologia cases, got ${(bank.cases || []).length}`);
  const sample = (bank.qcm || [])[0];
  if(!sample || !Array.isArray(sample.options) || sample.options.length !== 4) add('fallback bank: sample QCM does not have 4 options');
}

if(problems.length){
  console.log('Med Nykuto data validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log('Med Nykuto data validation OK.');
