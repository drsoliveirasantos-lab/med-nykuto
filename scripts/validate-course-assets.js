#!/usr/bin/env node
/* v363 — validates restored course catalog structure and local assets referenced in markdown. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const problems = [];
function add(msg){ problems.push(msg); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8'); }
function loadCourses(){
  const context = vm.createContext({window:{}, console:{log(){}, warn(){}, error(){}}});
  vm.runInContext(read('data/med-courses-data.js'), context, {filename:'data/med-courses-data.js', timeout:12000});
  return context.window.MED_COURSES_DATA;
}
function markdownOf(module){
  return [module.markdown, module.fullMarkdown, module.quickMarkdown, module.ultraMarkdown, module.ficheMarkdown]
    .filter(Boolean).join('\n');
}
function localAssetRefs(md){
  const refs = [];
  const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  const linkRe = /<img[^>]+src=["']([^"']+)["']/g;
  let m;
  while((m = imgRe.exec(md))) refs.push(m[1]);
  while((m = linkRe.exec(md))) refs.push(m[1]);
  return refs
    .map(x => String(x || '').split('#')[0].split('?')[0].trim())
    .filter(Boolean)
    .filter(x => !/^(https?:|data:|mailto:|tel:)/i.test(x));
}

let data;
try { data = loadCourses(); }
catch(err){ add(`data/med-courses-data.js cannot execute: ${err.message}`); }

if(data && Array.isArray(data.courses)){
  const moduleIds = new Set();
  let total = 0;
  let rich = 0;
  let imageRefs = 0;
  data.courses.forEach(course => {
    const modules = course.modules || [];
    if((course.moduleCount || modules.length || 0) !== modules.length) add(`${course.id}: moduleCount mismatch (${course.moduleCount} vs ${modules.length})`);
    modules.forEach(module => {
      total += 1;
      if(moduleIds.has(module.id)) add(`duplicate module id: ${module.id}`);
      moduleIds.add(module.id);
      if(!module.id || !module.title) add(`incomplete module metadata in ${course.id}`);
      const md = markdownOf(module);
      if(md.length > 2500) rich += 1;
      if(/Med Cursos/i.test(md)) add(`${module.id}: contains old brand Med Cursos inside markdown`);
      localAssetRefs(md).forEach(ref => {
        imageRefs += 1;
        if(!exists(ref)) add(`${module.id}: missing local asset ${ref}`);
      });
    });
  });
  if(total !== 58) add(`expected 58 modules, got ${total}`);
  if(rich < 50) add(`expected at least 50 rich modules, got ${rich}`);
  if(imageRefs < 10) add(`expected restored course images/references, got only ${imageRefs}`);
} else {
  add('MED_COURSES_DATA missing or invalid');
}

if(problems.length){
  console.log('Med Nykuto course asset validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log('Med Nykuto course asset validation OK.');
