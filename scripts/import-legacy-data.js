#!/usr/bin/env node
/* v363 — Med Nykuto full legacy data restore.

   Restores large uploaded legacy data files from a local folder or ZIP into /data.
   It validates the rich course catalog and split practice banks before writing.

   Usage:
     node scripts/import-legacy-data.js /path/to/recovered-folder --write
     node scripts/import-legacy-data.js /path/to/recovered-data.zip --write

   Default safety:
   - writes only course catalog + init + split practice banks;
   - preserves the current preview lazy loader/fallback/patch pipeline;
   - creates backups before overwriting.

   Optional:
     --replace-loader   also copy med-practice-bank-loader.js from source.
     --no-backup        skip backup creation.
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const childProcess = require('child_process');

const root = process.cwd();
const args = process.argv.slice(2);
const sourceArg = args.find(x => !x.startsWith('--'));
const write = args.includes('--write');
const replaceLoader = args.includes('--replace-loader');
const noBackup = args.includes('--no-backup');
const notes = [];
const problems = [];
const warnings = [];

const expected = [
  'med-courses-data.js',
  'med-practice-bank-init.js',
  'practice-bank-fisiologia.js',
  'practice-bank-microbiologia.js',
  'practice-bank-genetica.js',
  'practice-bank-bioquimica.js',
  'practice-bank-inmunologia.js'
];

const optional = ['med-practice-bank-loader.js'];

const bankExpectations = {
  fisiologia: {modules:9, qcm:1800, vf:450, cases:450},
  microbiologia: {modules:13, qcm:2600, vf:650, cases:650},
  genetica: {modules:12, qcm:2400, vf:600, cases:600},
  bioquimica: {modules:12, qcm:600, vf:0, cases:600},
  inmunologia: {modules:12, qcm:600, vf:0, cases:600}
};

function usage(){
  console.log(`Med Nykuto full legacy data restore v363\n\nUsage:\n  node scripts/import-legacy-data.js <folder-or-zip> [--write]\n\nOptions:\n  --write            Actually write into data/. Without it this is a dry run.\n  --replace-loader   Also replace data/med-practice-bank-loader.js from source.\n  --no-backup        Do not backup existing data files.\n`);
}
function fail(x){ problems.push(x); }
function warn(x){ warnings.push(x); }
function note(x){ notes.push(x); }
function exists(p){ return fs.existsSync(p); }
function read(p){ return fs.readFileSync(p, 'utf8'); }
function rel(p){ return path.relative(root, p) || p; }
function mkdir(p){ fs.mkdirSync(p, {recursive:true}); }
function sha12(p){
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0,12);
}

if(!sourceArg){ usage(); process.exit(1); }

function unzipIfNeeded(input){
  const abs = path.resolve(input);
  if(!exists(abs)){ fail(`Source not found: ${input}`); return null; }
  if(fs.statSync(abs).isDirectory()) return abs;
  if(/\.zip$/i.test(abs)){
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'med-nykuto-legacy-data-'));
    const res = childProcess.spawnSync('unzip', ['-q', abs, '-d', out], {encoding:'utf8'});
    if(res.error){ fail(`unzip failed: ${res.error.message}`); return null; }
    if(res.status !== 0){ fail(`unzip failed: ${res.stderr || res.stdout || 'unknown error'}`); return null; }
    note(`unzipped ${abs} to ${out}`);
    return out;
  }
  fail(`Unsupported source. Provide a folder or .zip: ${input}`);
  return null;
}

function walk(dir, out=[]){
  if(!exists(dir)) return out;
  const st = fs.statSync(dir);
  if(st.isFile()){ out.push(dir); return out; }
  for(const e of fs.readdirSync(dir, {withFileTypes:true})){
    if(e.name === '.git' || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if(e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function findByBasename(base){
  const files = walk(base);
  const map = new Map();
  for(const file of files){
    const bn = path.basename(file);
    if(!map.has(bn)) map.set(bn, file);
  }
  return map;
}

function extractAssignmentObject(code, marker){
  const idx = code.indexOf(marker);
  if(idx < 0) throw new Error(`marker not found: ${marker}`);
  const eq = code.indexOf('=', idx);
  if(eq < 0) throw new Error(`assignment not found after ${marker}`);
  let after = code.slice(eq + 1).trim();
  if(after.endsWith(';')) after = after.slice(0, -1).trim();
  return JSON.parse(after);
}

function validateCourses(file){
  const code = read(file);
  const data = extractAssignmentObject(code, 'window.MED_COURSES_DATA');
  const courses = Array.isArray(data.courses) ? data.courses : [];
  const active = courses.filter(c => Array.isArray(c.modules) && c.modules.length > 0);
  const modules = courses.flatMap(c => c.modules || []);
  const generic = modules.filter(m => /Este módulo organiza los puntos esenciales|La lógica de estudio debe seguir/i.test(String(m.markdown || m.fullMarkdown || '')));
  const rich = modules.filter(m => String(m.markdown || m.fullMarkdown || '').length > 2500);
  if(courses.length < 6) fail(`med-courses-data.js: expected >=6 courses, got ${courses.length}`);
  if(active.length < 5) fail(`med-courses-data.js: expected >=5 active courses, got ${active.length}`);
  if(modules.length !== 58) fail(`med-courses-data.js: expected 58 modules, got ${modules.length}`);
  if(generic.length) fail(`med-courses-data.js: generic fallback modules detected: ${generic.length}`);
  if(rich.length < 50) fail(`med-courses-data.js: expected rich course markdown in most modules, got ${rich.length}/58`);
  const ids = new Set();
  for(const m of modules){
    if(!m.id || !m.title || !(m.markdown || m.fullMarkdown)) fail(`med-courses-data.js: incomplete module ${m && m.id}`);
    if(ids.has(m.id)) fail(`med-courses-data.js: duplicate module id ${m.id}`);
    ids.add(m.id);
  }
  note(`courses OK: courses=${courses.length}, active=${active.length}, modules=${modules.length}, rich=${rich.length}, version=${data.version || 'unknown'}`);
}

function validateBank(file, courseId){
  const code = read(file);
  const marker = `window.MED_PRACTICE_BANK.byCourse["${courseId}"]`;
  const bank = extractAssignmentObject(code, marker);
  const e = bankExpectations[courseId];
  const qcm = bank.qcm || [];
  const vf = bank.vf || [];
  const cases = bank.cases || bank.case || [];
  if(qcm.length < e.qcm) fail(`${path.basename(file)}: expected >=${e.qcm} QCM, got ${qcm.length}`);
  if(e.vf > 0 && vf.length < e.vf) fail(`${path.basename(file)}: expected >=${e.vf} V/F, got ${vf.length}`);
  if(e.vf === 0 && vf.length === 0) warn(`${path.basename(file)}: no V/F found; preview fallback should keep V/F functional for this course.`);
  if(cases.length < e.cases) fail(`${path.basename(file)}: expected >=${e.cases} cases, got ${cases.length}`);
  const modules = new Set([...qcm, ...vf, ...cases].map(x => x && x.moduleNumber).filter(Boolean));
  if(modules.size < e.modules) fail(`${path.basename(file)}: expected ${e.modules} modules, got ${modules.size}`);
  const sample = qcm[0];
  if(!sample || !Array.isArray(sample.options) || sample.options.length !== 4) fail(`${path.basename(file)}: first QCM has invalid options`);
  note(`${courseId} bank OK: qcm=${qcm.length}, vf=${vf.length}, cases=${cases.length}, modules=${modules.size}`);
}

function normalizeCourseContent(code){
  return code
    .replace(/Med Cursos/g, 'Med Nykuto')
    .replace(/MedCursos/g, 'Med Nykuto')
    .replace(/med-cursos/g, 'med-nykuto')
    .replace(/"version":"([^"]*)"/, '"version":"v363_restored_legacy_data_from_uploaded_folder"');
}

function writeFileWithBackup(source, target, transform){
  mkdir(path.dirname(target));
  if(exists(target) && !noBackup){
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(root, 'data', 'backups-v363', stamp);
    mkdir(backupDir);
    fs.copyFileSync(target, path.join(backupDir, path.basename(target)));
  }
  let code = read(source);
  if(transform) code = transform(code);
  fs.writeFileSync(target, code, 'utf8');
  note(`written ${rel(target)} from ${rel(source)} (${(Buffer.byteLength(code)/1024/1024).toFixed(2)} MiB, sha=${sha12(source)})`);
}

const base = unzipIfNeeded(sourceArg);
if(problems.length){ problems.forEach(p => console.error(' - ' + p)); process.exit(1); }
const files = findByBasename(base);

for(const name of expected){
  if(!files.has(name)) fail(`missing required source file: ${name}`);
}
if(replaceLoader && !files.has('med-practice-bank-loader.js')) fail('missing med-practice-bank-loader.js but --replace-loader was requested');
if(problems.length){ problems.forEach(p => console.error(' - ' + p)); process.exit(1); }

validateCourses(files.get('med-courses-data.js'));
validateBank(files.get('practice-bank-fisiologia.js'), 'fisiologia');
validateBank(files.get('practice-bank-microbiologia.js'), 'microbiologia');
validateBank(files.get('practice-bank-genetica.js'), 'genetica');
validateBank(files.get('practice-bank-bioquimica.js'), 'bioquimica');
validateBank(files.get('practice-bank-inmunologia.js'), 'inmunologia');

notes.forEach(n => console.log('• ' + n));
warnings.forEach(w => console.log('⚠ ' + w));

if(problems.length){
  console.error('\nValidation failed:');
  problems.forEach(p => console.error(' - ' + p));
  process.exit(1);
}

if(!write){
  console.log('\nDry run OK. Add --write to restore data files.');
  process.exit(0);
}

writeFileWithBackup(files.get('med-courses-data.js'), path.join(root, 'data', 'med-courses-data.js'), normalizeCourseContent);
writeFileWithBackup(files.get('med-practice-bank-init.js'), path.join(root, 'data', 'med-practice-bank-init.js'));
for(const name of expected.filter(x => /^practice-bank-/.test(x))){
  writeFileWithBackup(files.get(name), path.join(root, 'data', name));
}
if(replaceLoader){
  writeFileWithBackup(files.get('med-practice-bank-loader.js'), path.join(root, 'data', 'med-practice-bank-loader.js'));
} else {
  note('preserved current data/med-practice-bank-loader.js to keep preview fallback and quality patches active');
}

console.log('\nRestore completed. Now run: npm run validate && npm test');
