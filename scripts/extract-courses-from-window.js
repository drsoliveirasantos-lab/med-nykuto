#!/usr/bin/env node
/* Extract a live window.MED_COURSES_DATA JS file into split content/courses sources.
   Usage: node scripts/extract-courses-from-window.js /path/to/med-courses-data.js --out content/courses
*/
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
const outArg = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join('content','courses');
if(!src){ console.error('Usage: node scripts/extract-courses-from-window.js <med-courses-data.js> [--out content/courses]'); process.exit(1); }

function slugify(s){
  return String(s || 'module').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase() || 'module';
}
function parseData(code){
  code = code.replace(/^\uFEFF/, '').trim();
  const marker = 'window.MED_COURSES_DATA=';
  const idx = code.indexOf(marker);
  if(idx < 0) throw new Error('window.MED_COURSES_DATA assignment not found');
  let json = code.slice(idx + marker.length).trim();
  if(json.endsWith(';')) json = json.slice(0, -1);
  return JSON.parse(json);
}
function write(file, content){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, content, 'utf8'); }

const data = parseData(fs.readFileSync(src, 'utf8'));
const out = path.resolve(outArg);
fs.rmSync(out, {recursive:true, force:true});
fs.mkdirSync(out, {recursive:true});
write(path.join(out, 'catalog.json'), JSON.stringify({
  siteName: data.siteName,
  version: data.version,
  generatedFrom: data.generatedFrom,
  courseOrder: (data.courses || []).map(c => c.id)
}, null, 2));

const contentKeys = new Set(['markdown','fullMarkdown','ficheMarkdown','ultraMarkdown']);
for(const course of data.courses || []){
  const cdir = path.join(out, course.id);
  const courseMeta = {...course};
  delete courseMeta.modules;
  courseMeta.moduleOrder = (course.modules || []).map(m => m.id);
  write(path.join(cdir, 'course.json'), JSON.stringify(courseMeta, null, 2));
  for(const m of course.modules || []){
    const dir = `${String(m.number || 0).padStart(2,'0')}-${slugify(m.title)}`;
    const mdir = path.join(cdir, 'modules', dir);
    const meta = {};
    for(const [k,v] of Object.entries(m)) if(!contentKeys.has(k) && k !== 'exam' && k !== 'figures') meta[k]=v;
    meta.sourceFiles = {};
    for(const [key,file] of [['markdown','markdown.md'],['fullMarkdown','full.md'],['ficheMarkdown','fiche.md'],['ultraMarkdown','ultra.md']]){
      if(m[key] !== undefined){ write(path.join(mdir,file), String(m[key])); meta.sourceFiles[key] = file; }
    }
    if(m.exam !== undefined){ write(path.join(mdir,'exam.json'), JSON.stringify(m.exam, null, 2)); meta.sourceFiles.exam='exam.json'; }
    if(m.figures !== undefined){ write(path.join(mdir,'figures.json'), JSON.stringify(m.figures, null, 2)); meta.sourceFiles.figures='figures.json'; }
    write(path.join(mdir, 'meta.json'), JSON.stringify(meta, null, 2));
  }
}
console.log(`Extracted ${data.totalModules} modules to ${out}`);
