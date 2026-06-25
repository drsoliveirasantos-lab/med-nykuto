#!/usr/bin/env node
/* v362 — Med Nykuto legacy course importer.

   Usage:
     node scripts/import-legacy-courses.js /path/to/site-med-cursos-v281-cloudflare-full-split.zip --write
     node scripts/import-legacy-courses.js /path/to/extracted-site-folder --write
     node scripts/import-legacy-courses.js /path/to/data/med-courses-data.js --write

   The script searches for legacy course data, validates it, rejects generic fallback
   data by default, then writes data/med-courses-data.js with a backup.
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
const allowGeneric = args.includes('--allow-generic');
const noBackup = args.includes('--no-backup');

const problems = [];
const notes = [];
function fail(msg){ problems.push(msg); }
function note(msg){ notes.push(msg); }
function exists(p){ return fs.existsSync(p); }
function rel(p){ return path.relative(root, p) || p; }
function read(p){ return fs.readFileSync(p, 'utf8'); }

function usage(){
  console.log(`Med Nykuto legacy course importer v362\n\nUsage:\n  node scripts/import-legacy-courses.js <legacy-zip|legacy-folder|course-js> [--write]\n\nOptions:\n  --write          Write data/med-courses-data.js. Without it, only validates.\n  --allow-generic Allow generic fallback-like content. Normally rejected.\n  --no-backup     Do not create a backup before writing.\n`);
}

if(!sourceArg){ usage(); process.exit(1); }

function makeTempDir(){ return fs.mkdtempSync(path.join(os.tmpdir(), 'med-nykuto-course-import-')); }
function unzipIfNeeded(input){
  const abs = path.resolve(input);
  if(!exists(abs)){ fail(`source not found: ${input}`); return null; }
  if(fs.statSync(abs).isDirectory()) return abs;
  if(/\.zip$/i.test(abs)){
    const out = makeTempDir();
    const res = childProcess.spawnSync('unzip', ['-q', abs, '-d', out], {encoding:'utf8'});
    if(res.error) { fail(`unzip failed: ${res.error.message}`); return null; }
    if(res.status !== 0){ fail(`unzip failed: ${res.stderr || res.stdout || 'unknown error'}`); return null; }
    note(`unzipped ${abs} to ${out}`);
    return out;
  }
  return abs;
}

function walk(start, out=[]){
  if(!exists(start)) return out;
  const st = fs.statSync(start);
  if(st.isFile()){ out.push(start); return out; }
  const entries = fs.readdirSync(start, {withFileTypes:true});
  for(const entry of entries){
    if(entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.tmp') continue;
    const p = path.join(start, entry.name);
    if(entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function candidateScore(file){
  const name = file.replace(/\\/g,'/');
  if(/data\/med-courses-data\.js$/i.test(name)) return 100;
  if(/data\/courses-data\.js$/i.test(name)) return 90;
  if(/app\.bundle\.js$/i.test(name)) return 50;
  if(/app\.js$/i.test(name)) return 45;
  if(/courses|course|curso|cours|materia|module/i.test(name) && /\.js$/i.test(name)) return 30;
  return 0;
}

function findCandidates(base){
  const files = walk(base);
  return files
    .filter(f => /\.(js|mjs)$/i.test(f))
    .map(f => ({file:f, score:candidateScore(f)}))
    .filter(x => x.score > 0)
    .sort((a,b) => b.score - a.score || a.file.localeCompare(b.file))
    .map(x => x.file);
}

function contextForEval(){
  const dummy = new Proxy(function(){}, {
    get(){ return dummy; },
    apply(){ return dummy; },
    set(){ return true; }
  });
  const ctx = {
    window: {},
    console: {log(){}, warn(){}, error(){}},
    document: {
      body: {dataset:{}},
      documentElement: {dataset:{}},
      querySelector(){ return null; },
      querySelectorAll(){ return []; },
      addEventListener(){},
      createElement(){ return {style:{}, dataset:{}, appendChild(){}, setAttribute(){}, addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return []}}; },
      write(){}
    },
    location: {search:'', pathname:'/index.html'},
    localStorage: {getItem(){return null;}, setItem(){}, removeItem(){}},
    URLSearchParams,
    setTimeout(){},
    clearTimeout(){},
    navigator: {userAgent:'node-importer'},
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  ctx.window.location = ctx.location;
  ctx.window.localStorage = ctx.localStorage;
  ctx.window.addEventListener = function(){};
  ctx.window.removeEventListener = function(){};
  ctx.globalThis = ctx.window;
  return vm.createContext(ctx);
}

function extractWithVm(file){
  const code = read(file);
  const ctx = contextForEval();
  try{
    vm.runInContext(code, ctx, {filename:file, timeout:2500});
    if(ctx.window && ctx.window.MED_COURSES_DATA) return ctx.window.MED_COURSES_DATA;
  }catch(err){
    note(`VM extraction failed for ${rel(file)}: ${err.message}`);
  }
  return null;
}

function extractByAssignment(file){
  const code = read(file);
  const marker = 'window.MED_COURSES_DATA';
  const idx = code.indexOf(marker);
  if(idx < 0) return null;
  const eq = code.indexOf('=', idx);
  if(eq < 0) return null;
  const after = code.slice(eq + 1).trim();
  const end = after.lastIndexOf('};');
  if(end < 0) return null;
  const objectLiteral = after.slice(0, end + 1);
  try { return vm.runInNewContext('(' + objectLiteral + ')', {}, {timeout:2500}); }
  catch(err){ note(`assignment extraction failed for ${rel(file)}: ${err.message}`); return null; }
}

function allModules(data){
  return (data.courses || []).flatMap(course => (course.modules || []).map(module => ({course, module})));
}

function validateData(data, sourceFile){
  const localProblems = [];
  if(!data || !Array.isArray(data.courses)) localProblems.push('missing courses array');
  if(localProblems.length) return {ok:false, problems:localProblems};
  const modules = allModules(data);
  const activeCourses = data.courses.filter(c => (c.modules || []).length > 0);
  if(data.courses.length < 5) localProblems.push(`expected at least 5 courses, got ${data.courses.length}`);
  if(activeCourses.length < 5) localProblems.push(`expected at least 5 active courses, got ${activeCourses.length}`);
  if(modules.length < 58) localProblems.push(`expected at least 58 modules, got ${modules.length}`);
  const ids = new Set();
  for(const {course, module} of modules){
    if(!course.id) localProblems.push('course without id');
    if(!module.id) localProblems.push(`module without id in course ${course.id || '?'}`);
    if(!module.title) localProblems.push(`module without title: ${module.id || '?'}`);
    if(ids.has(module.id)) localProblems.push(`duplicate module id: ${module.id}`);
    ids.add(module.id);
  }
  const genericRx = /Este módulo organiza los puntos esenciales|La lógica de estudio debe seguir|concepto probado → mecanismo/i;
  const genericCount = modules.filter(({module}) => genericRx.test(String(module.markdown || module.fullMarkdown || ''))).length;
  const richCount = modules.filter(({module}) => String(module.fullMarkdown || module.markdown || '').length > 2500).length;
  if(!allowGeneric && genericCount > Math.max(3, modules.length * 0.25)) localProblems.push(`looks like generic fallback data: ${genericCount}/${modules.length} generic modules`);
  if(!allowGeneric && richCount < Math.min(10, Math.floor(modules.length * 0.2))) localProblems.push(`not enough rich modules detected: ${richCount}/${modules.length}`);
  return {
    ok: localProblems.length === 0,
    problems: localProblems,
    stats: {source: sourceFile, courses:data.courses.length, activeCourses:activeCourses.length, modules:modules.length, genericModules:genericCount, richModules:richCount}
  };
}

function normalizeData(data, sourceFile){
  const copy = JSON.parse(JSON.stringify(data));
  copy.siteName = 'Med Nykuto';
  copy.version = `v362_restored_from_legacy:${path.basename(sourceFile)}`;
  (copy.courses || []).forEach(course => {
    if(typeof course.folder === 'string') course.folder = course.folder.replace(/Med Cursos/g, 'Med Nykuto');
    (course.modules || []).forEach(module => {
      ['markdown','fullMarkdown','ficheMarkdown','ultraMarkdown','summary'].forEach(k => {
        if(typeof module[k] === 'string') module[k] = module[k].replace(/Med Cursos/g, 'Med Nykuto');
      });
    });
  });
  return copy;
}

function writeData(data, sourceFile){
  const out = path.join(root, 'data', 'med-courses-data.js');
  if(!exists(path.dirname(out))) fs.mkdirSync(path.dirname(out), {recursive:true});
  if(exists(out) && !noBackup){
    const backup = path.join(root, 'data', `med-courses-data.backup-before-v362-import.${Date.now()}.js`);
    fs.copyFileSync(out, backup);
    note(`backup written: ${rel(backup)}`);
  }
  const body = `/* v362 — Restored rich course data from legacy source.\n   Source: ${rel(sourceFile)}\n   Generated by scripts/import-legacy-courses.js. */\nwindow.MED_COURSES_DATA = ${JSON.stringify(data)};\n`;
  fs.writeFileSync(out, body, 'utf8');
  note(`written: ${rel(out)} (${(Buffer.byteLength(body)/1024/1024).toFixed(2)} MiB)`);
}

const base = unzipIfNeeded(sourceArg);
if(problems.length){ problems.forEach(p => console.error(' - ' + p)); process.exit(1); }
const candidates = findCandidates(base);
if(!candidates.length){ console.error('No candidate course JS files found.'); process.exit(1); }

let selected = null;
let selectedData = null;
let selectedValidation = null;
for(const candidate of candidates){
  const data = extractWithVm(candidate) || extractByAssignment(candidate);
  if(!data){ note(`no course data extracted from ${rel(candidate)}`); continue; }
  const validation = validateData(data, candidate);
  note(`${rel(candidate)} => courses=${validation.stats?.courses || 0}, modules=${validation.stats?.modules || 0}, rich=${validation.stats?.richModules || 0}, generic=${validation.stats?.genericModules || 0}`);
  if(validation.ok){ selected = candidate; selectedData = data; selectedValidation = validation; break; }
  note(`rejected ${rel(candidate)}: ${validation.problems.join('; ')}`);
}

notes.forEach(n => console.log('• ' + n));
if(!selected){
  console.error('\nNo valid rich MED_COURSES_DATA source found.');
  console.error('Tip: use the v281/v282 full split ZIP or pass --allow-generic only if you intentionally want fallback-like data.');
  process.exit(1);
}

const normalized = normalizeData(selectedData, selected);
console.log('\nSelected source:', rel(selected));
console.log('Stats:', JSON.stringify(selectedValidation.stats, null, 2));
if(write){
  writeData(normalized, selected);
  console.log('Import completed. Run: npm run validate && npm test');
} else {
  console.log('Dry run only. Add --write to replace data/med-courses-data.js.');
}
