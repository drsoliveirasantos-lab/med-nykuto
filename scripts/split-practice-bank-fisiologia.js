#!/usr/bin/env node
/* Split data/practice-bank-fisiologia.js into module-level JSON sources. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const coursesFile = path.join(root, 'data', 'med-courses-data.js');
const bankFile = path.join(root, 'data', 'practice-bank-fisiologia.js');
const outRoot = path.join(root, 'content', 'practice', 'fisiologia');
const modulesRoot = path.join(outRoot, 'modules');

function runWindowScript(file){
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  sandbox.window.MED_PRACTICE_BANK = { byCourse: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox.window;
}

function slugify(value){
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function byModule(rows){
  const map = new Map();
  for(const item of rows || []){
    const key = String(item.moduleId || `module-${item.moduleNumber || 'unknown'}`);
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function main(){
  if(!fs.existsSync(coursesFile)) throw new Error(`Missing ${coursesFile}`);
  if(!fs.existsSync(bankFile)) throw new Error(`Missing ${bankFile}`);

  const coursesWindow = runWindowScript(coursesFile);
  const courses = coursesWindow.MED_COURSES_DATA?.courses || [];
  const fisiologia = courses.find(c => c.id === 'fisiologia');
  if(!fisiologia) throw new Error('Fisiología course not found in med-courses-data.js');

  const bankWindow = runWindowScript(bankFile);
  const bank = bankWindow.MED_PRACTICE_BANK?.byCourse?.fisiologia;
  if(!bank) throw new Error('Fisiología bank not found in practice-bank-fisiologia.js');

  const grouped = {
    qcm: byModule(bank.qcm || []),
    vf: byModule(bank.vf || []),
    cases: byModule(bank.cases || [])
  };

  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(modulesRoot, { recursive: true });

  const manifest = {
    courseId: 'fisiologia',
    courseTitle: fisiologia.title || 'Fisiología',
    sourceFile: 'data/practice-bank-fisiologia.js',
    generatedFrom: 'scripts/split-practice-bank-fisiologia.js',
    totals: { qcm: 0, vf: 0, cases: 0 },
    modules: []
  };

  const modules = (fisiologia.modules || []).slice().sort((a,b) => Number(a.number || 0) - Number(b.number || 0));
  for(const module of modules){
    const number = Number(module.number || 0);
    const directory = `${String(number).padStart(2, '0')}-${slugify(module.title || module.id)}`;
    const moduleDir = path.join(modulesRoot, directory);
    const rows = {
      qcm: grouped.qcm.get(module.id) || [],
      vf: grouped.vf.get(module.id) || [],
      cases: grouped.cases.get(module.id) || []
    };

    writeJson(path.join(moduleDir, 'qcm.json'), rows.qcm);
    writeJson(path.join(moduleDir, 'vf.json'), rows.vf);
    writeJson(path.join(moduleDir, 'cases.json'), rows.cases);
    writeJson(path.join(moduleDir, 'meta.json'), {
      courseId: 'fisiologia',
      moduleId: module.id,
      moduleNumber: number,
      moduleTitle: module.title || '',
      directory,
      counts: { qcm: rows.qcm.length, vf: rows.vf.length, cases: rows.cases.length },
      files: { qcm: 'qcm.json', vf: 'vf.json', cases: 'cases.json' }
    });

    manifest.totals.qcm += rows.qcm.length;
    manifest.totals.vf += rows.vf.length;
    manifest.totals.cases += rows.cases.length;
    manifest.modules.push({
      id: module.id,
      number,
      title: module.title || '',
      directory,
      counts: { qcm: rows.qcm.length, vf: rows.vf.length, cases: rows.cases.length },
      files: { qcm: 'qcm.json', vf: 'vf.json', cases: 'cases.json' }
    });
  }

  writeJson(path.join(outRoot, 'manifest.json'), manifest);
  console.log(`Split Fisiología bank: qcm=${manifest.totals.qcm}, vf=${manifest.totals.vf}, cases=${manifest.totals.cases}, modules=${manifest.modules.length}`);
}

try { main(); }
catch(error){ console.error('Split failed:', error.message); process.exit(1); }
