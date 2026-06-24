#!/usr/bin/env node
/* Med Nykuto v313 — pedagogical quality audit for practice banks.
   Run from repo root: node scripts/audit-practice-bank-quality.js
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const files = [
  'data/med-courses-data.js',
  'data/med-practice-bank-init.js',
  'data/med-practice-bank-loader.js'
].map(p => path.join(root, p));

const ctx = { window: {}, console, document: null, localStorage: null, setTimeout, clearTimeout };
ctx.window.window = ctx.window;
ctx.globalThis = ctx.window;

function load(file){
  if(!fs.existsSync(file)) return;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
}
files.forEach(load);

const bank = ctx.window.MED_PRACTICE_BANK || ctx.MED_PRACTICE_BANK || { byCourse: {} };
const courses = (ctx.window.MED_COURSES_DATA && ctx.window.MED_COURSES_DATA.courses) || [];
const report = [];
const seenQuestions = new Map();

function norm(s=''){
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function add(severity, id, msg){ report.push({ severity, id, msg }); }
function text(x){ return typeof x === 'string' ? x : (x && (x.es || x.fr || x.br || x.title || x.name)) || ''; }
function checkItem(item, type, courseId){
  const id = item.id || `${courseId}:${type}:missing-id`;
  const q = text(item.question || item.stem || item.prompt || '');
  const opts = Array.isArray(item.options) ? item.options.map(text) : [];
  if(!item.id) add('error', id, 'Missing id');
  if(!q || q.length < 18) add('error', id, 'Question/stem too short or missing');
  if(type !== 'case' && opts.length < 2) add('error', id, 'Missing options');
  if(type === 'qcm' && opts.length !== 4) add('warn', id, `QCM should have 4 options, found ${opts.length}`);
  if(opts.length && (item.answerIndex == null || Number(item.answerIndex) < 0 || Number(item.answerIndex) >= opts.length)) add('error', id, 'Invalid answerIndex');
  const optNorm = opts.map(norm);
  if(new Set(optNorm).size !== optNorm.length) add('error', id, 'Duplicate or near-duplicate options');
  if(!item.explanation || String(item.explanation).length < 35) add('warn', id, 'Missing or weak explanation');
  if(type === 'qcm'){
    if(!item.whyCorrect && !item.examPearl) add('info', id, 'Could be enriched with whyCorrect/examPearl');
    const optionsAsTypes = opts.map(o => {
      if(/síndrome|syndrome|enfermedad|disease/i.test(o)) return 'diagnosis';
      if(/cromosom|trisom|monosom|deleci|transloc|46,|47,/i.test(o)) return 'genetics';
      if(/aumenta|disminuye|inhibe|estimula|activa|produce/i.test(o)) return 'mechanism';
      return 'other';
    });
    const dominant = optionsAsTypes.sort((a,b)=>optionsAsTypes.filter(x=>x===b).length-optionsAsTypes.filter(x=>x===a).length)[0];
    if(dominant && optionsAsTypes.filter(x=>x!==dominant).length >= 2) add('warn', id, 'Distractors may be heterogeneous');
  }
  const nq = norm(q).slice(0,180);
  if(nq){
    if(seenQuestions.has(nq)) add('warn', id, `Possible duplicate of ${seenQuestions.get(nq)}`);
    else seenQuestions.set(nq, id);
  }
}

Object.entries(bank.byCourse || {}).forEach(([courseId, b]) => {
  ['qcm','cases','vf'].forEach(type => (b[type] || []).forEach(item => checkItem(item, type, courseId)));
});

const counts = report.reduce((a,r)=>(a[r.severity]=(a[r.severity]||0)+1,a),{});
console.log('Med Nykuto practice bank audit');
console.log(`Courses: ${courses.length}`);
console.log(`Errors: ${counts.error||0} | Warnings: ${counts.warn||0} | Info: ${counts.info||0}`);
report.slice(0,250).forEach(r => console.log(`[${r.severity.toUpperCase()}] ${r.id}: ${r.msg}`));
if(report.length > 250) console.log(`... ${report.length-250} more findings not shown`);
process.exit((counts.error||0) > 0 ? 1 : 0);
