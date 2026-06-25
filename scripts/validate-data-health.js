#!/usr/bin/env node
/* v360 — Data health validator for Med Nykuto split files. */
const fs = require('fs');
const path = require('path');

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

const courses = nonEmptyJs('data/med-courses-data.js', 'MED_COURSES_DATA');
if(!/courses\s*:|COURSE_SPECS|\[\[/.test(courses)) add('data/med-courses-data.js: no detectable course/module structure');

const init = nonEmptyJs('data/med-practice-bank-init.js', 'MED_PRACTICE_BANK');
if(!/byCourse/.test(init)) add('data/med-practice-bank-init.js: no byCourse initializer');

const loader = nonEmptyJs('data/med-practice-bank-loader.js', 'practice-bank-functional-fallback-v360.js');
if(!/MED_PRACTICE_BANK_LAZY_WANTED/.test(loader)) add('data/med-practice-bank-loader.js: missing lazy wanted marker');

const fallback = nonEmptyJs('data/practice-bank-functional-fallback-v360.js', 'v360-functional-fallback');
['qcm','vf','cases'].forEach(key => {
  if(!new RegExp(`\\b${key}\\b`).test(fallback)) add(`fallback bank: missing ${key}`);
});

if(problems.length){
  console.log('Med Nykuto data validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log('Med Nykuto data validation OK.');
