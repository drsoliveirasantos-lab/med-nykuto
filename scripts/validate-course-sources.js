#!/usr/bin/env node
/* Validate split course source tree before building. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const contentRoot = path.join(root, 'content', 'courses');
const lockFile = path.join(root, 'content-lock.json');
const indexFile = path.join(root, 'index.html');
const problems = [];
const warnings = [];
const strictAssets = process.argv.includes('--strict-assets');

function add(msg){ problems.push(msg); }
function warn(msg){ warnings.push(msg); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readText(file){ return fs.readFileSync(file, 'utf8'); }
function localAssetRefs(md){
  const refs = [];
  const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  const htmlRe = /<img[^>]+src=["']([^"']+)["']/g;
  let m;
  while((m = imgRe.exec(md || ''))) refs.push(m[1]);
  while((m = htmlRe.exec(md || ''))) refs.push(m[1]);
  return refs.map(x => String(x).split('#')[0].split('?')[0].trim())
    .filter(Boolean)
    .filter(x => !/^(https?:|data:|mailto:|tel:)/i.test(x));
}

let lock = null;
if(fs.existsSync(lockFile)) lock = readJson(lockFile);
else warn('content-lock.json missing');

const catalogFile = path.join(contentRoot, 'catalog.json');
if(!fs.existsSync(catalogFile)) add('Missing content/courses/catalog.json');
const catalog = fs.existsSync(catalogFile) ? readJson(catalogFile) : {courseOrder:[]};

const ids = new Set();
let total = 0;
const courseCounts = {};
let rich = 0;
const courseIds = catalog.courseOrder || [];

for(const courseId of courseIds){
  const courseDir = path.join(contentRoot, courseId);
  const courseFile = path.join(courseDir, 'course.json');
  if(!fs.existsSync(courseFile)){ add(`${courseId}: missing course.json`); continue; }
  const course = readJson(courseFile);
  const modulesRoot = path.join(courseDir, 'modules');
  const dirs = fs.existsSync(modulesRoot) ? fs.readdirSync(modulesRoot).filter(name => fs.statSync(path.join(modulesRoot,name)).isDirectory()).sort() : [];
  courseCounts[courseId] = dirs.length;
  if(Number(course.moduleCount || 0) !== dirs.length) add(`${courseId}: course.json moduleCount=${course.moduleCount} but source has ${dirs.length}`);
  if(Array.isArray(course.moduleOrder) && course.moduleOrder.length !== dirs.length) add(`${courseId}: moduleOrder has ${course.moduleOrder.length} entries but source has ${dirs.length}`);
  for(const dir of dirs){
    total++;
    const moduleDir = path.join(modulesRoot, dir);
    const metaFile = path.join(moduleDir, 'meta.json');
    if(!fs.existsSync(metaFile)){ add(`${courseId}/${dir}: missing meta.json`); continue; }
    const meta = readJson(metaFile);
    if(!meta.id) add(`${courseId}/${dir}: missing module id`);
    if(!meta.title) add(`${courseId}/${dir}: missing module title`);
    if(ids.has(meta.id)) add(`duplicate module id: ${meta.id}`);
    ids.add(meta.id);
    const markdownFiles = ['markdown.md','full.md','fiche.md','ultra.md'];
    const texts = markdownFiles.map(f => fs.existsSync(path.join(moduleDir,f)) ? readText(path.join(moduleDir,f)) : '');
    if(!texts.some(x => x.trim().length > 0)) add(`${meta.id}: no markdown content`);
    if(texts.join('\n').length > 2500) rich++;
    for(const txt of texts){
      for(const ref of localAssetRefs(txt)){
        if(!exists(ref)) (strictAssets ? add : warn)(`${meta.id}: missing local asset ${ref}`);
      }
    }
    const figuresFile = path.join(moduleDir, 'figures.json');
    if(fs.existsSync(figuresFile)){
      const figures = readJson(figuresFile);
      if(Array.isArray(figures)){
        figures.forEach(fig => {
          if(fig && fig.src && !/^(https?:|data:)/.test(fig.src) && !exists(fig.src)) (strictAssets ? add : warn)(`${meta.id}: missing figure asset ${fig.src}`);
        });
      }
    }
  }
}

if(lock){
  if(total !== lock.totalModules) add(`total module count mismatch: expected ${lock.totalModules}, got ${total}`);
  for(const [courseId, expected] of Object.entries(lock.courses || {})){
    if((courseCounts[courseId] || 0) !== expected) add(`${courseId}: expected ${expected} modules, got ${courseCounts[courseId] || 0}`);
  }
  if(lock.expectedNewModule && !ids.has(lock.expectedNewModule)) add(`missing expected module ${lock.expectedNewModule}`);
}

if(fs.existsSync(indexFile) && lock && Number.isInteger(lock.totalModules)){
  const html = readText(indexFile);
  const expected = String(lock.totalModules);
  const staleHardcoded = ['statModulesHero', 'statModules']
    .map(id => new RegExp(`<strong\\s+id=["']${id}["']>${expected}<\\/strong>|<span\\s+id=["']${id}["']>${expected}<\\/span>`).test(html) ? null : id)
    .filter(Boolean);
  if(staleHardcoded.length) add(`homepage module counter mismatch for: ${staleHardcoded.join(', ')}; expected ${expected}`);
  if(/>58<|58\s*<\/strong>|58\s*<\/span>/.test(html) && expected !== '58') add('homepage still contains stale visible module count 58');
}

if(lock && total < lock.totalModules) add(`expected at least ${lock.totalModules} modules, got ${total}`);
else if(!lock && total < 1) add(`expected source modules, got ${total}`);
if(rich < 50) add(`expected at least 50 rich modules, got ${rich}`);

warnings.forEach(w => console.log('Warning:', w));
if(problems.length){
  console.log('Split course validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log(`Split course validation OK: ${Object.keys(courseCounts).length} courses, ${total} modules, ${rich} rich modules`);
