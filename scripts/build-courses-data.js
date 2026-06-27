#!/usr/bin/env node
/* Build generated data/med-courses-data.js from split content/courses sources. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const contentRoot = path.join(root, 'content', 'courses');
const outFile = path.join(root, 'data', 'med-courses-data.js');

function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function readTextIf(file){ return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined; }
function sortModules(a,b){ return Number(a.number||0)-Number(b.number||0) || String(a.id).localeCompare(String(b.id)); }

const mojibakeMap = new Map(Object.entries({
  'Ã¡':'á','Ã©':'é','Ã­':'í','Ã³':'ó','Ãº':'ú','Ã±':'ñ',
  'Ã':'Á','Ã‰':'É','Ã':'Í','Ã“':'Ó','Ãš':'Ú','Ã‘':'Ñ',
  'Ã¼':'ü','Ãœ':'Ü','Â¿':'¿','Â¡':'¡','Â²':'²','Â³':'³','Â¹':'¹',
  'Âº':'º','Â°':'°','Â±':'±','Âµ':'µ','Â·':'·',
  'â‚‚':'₂','â‚ƒ':'₃','â‚„':'₄','â‚':'₁',
  'âº':'⁺','â»':'⁻',
  'â†’':'→','â†':'←','â†‘':'↑','â†“':'↓','â†”':'↔','â‡„':'⇄',
  'â€”':'—','â€“':'–','â€œ':'“','â€':'”','â€˜':'‘','â€™':'’',
  'â€¦':'…','â€¢':'•','âˆ’':'−','âˆ':'∝','â‰ˆ':'≈','â‰ ':'≠',
  'Ã—':'×','â‰¤':'≤','â‰¥':'≥'
}));

function repairText(value){
  if(typeof value !== 'string') return value;
  if(!/[ÃÂâ]/.test(value)) return value;
  let out = value;
  const entries = [...mojibakeMap.entries()].sort((a,b) => b[0].length - a[0].length);
  for(const [bad, good] of entries) out = out.split(bad).join(good);
  out = out.replace(/Ã(?=($|[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s,.;:!?\)\]\}\/-]))/g, 'í');
  out = out.replace(/Ã/g, 'í');
  return out;
}

function repairDeep(value){
  if(typeof value === 'string') return repairText(value);
  if(Array.isArray(value)) return value.map(repairDeep);
  if(value && typeof value === 'object'){
    for(const key of Object.keys(value)) value[key] = repairDeep(value[key]);
  }
  return value;
}

function build(){
  const catalogFile = path.join(contentRoot, 'catalog.json');
  if(!fs.existsSync(catalogFile)) throw new Error('Missing content/courses/catalog.json');
  const catalog = readJson(catalogFile);
  const courseIds = catalog.courseOrder || fs.readdirSync(contentRoot).filter(x => fs.statSync(path.join(contentRoot,x)).isDirectory()).sort();
  const courses = [];

  for(const courseId of courseIds){
    const courseDir = path.join(contentRoot, courseId);
    const courseFile = path.join(courseDir, 'course.json');
    if(!fs.existsSync(courseFile)) continue;
    const course = readJson(courseFile);
    const modulesRoot = path.join(courseDir, 'modules');
    const modules = [];
    if(fs.existsSync(modulesRoot)){
      const dirs = fs.readdirSync(modulesRoot).filter(name => fs.statSync(path.join(modulesRoot,name)).isDirectory()).sort();
      for(const dir of dirs){
        const moduleDir = path.join(modulesRoot, dir);
        const metaFile = path.join(moduleDir, 'meta.json');
        if(!fs.existsSync(metaFile)) throw new Error(`Missing meta.json in ${moduleDir}`);
        const module = readJson(metaFile);
        const files = module.sourceFiles || {};
        const contentMap = {
          markdown: files.markdown || 'markdown.md',
          fullMarkdown: files.fullMarkdown || 'full.md',
          ficheMarkdown: files.ficheMarkdown || 'fiche.md',
          ultraMarkdown: files.ultraMarkdown || 'ultra.md'
        };
        for(const [key, fname] of Object.entries(contentMap)){
          const text = readTextIf(path.join(moduleDir, fname));
          if(text !== undefined) module[key] = text;
        }
        const examFile = path.join(moduleDir, files.exam || 'exam.json');
        if(fs.existsSync(examFile)) module.exam = readJson(examFile);
        const figuresFile = path.join(moduleDir, files.figures || 'figures.json');
        if(fs.existsSync(figuresFile)) module.figures = readJson(figuresFile);
        delete module.sourceFiles;
        modules.push(module);
      }
    }
    modules.sort(sortModules);
    course.modules = modules;
    course.moduleCount = modules.length;
    delete course.moduleOrder;
    courses.push(course);
  }

  const data = repairDeep({
    siteName: catalog.siteName || 'Med Nykuto',
    version: catalog.version || `generated_${new Date().toISOString()}`,
    generatedFrom: catalog.generatedFrom || 'content/courses split sources',
    totalModules: courses.reduce((sum,c) => sum + (c.modules || []).length, 0),
    courses
  });

  fs.mkdirSync(path.dirname(outFile), {recursive:true});
  const body = `/* AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
   Source: content/courses/
   Build command: node scripts/build-courses-data.js
*/
window.MED_COURSES_DATA=${JSON.stringify(data)};\n`;
  fs.writeFileSync(outFile, body, 'utf8');
  console.log(`Built ${path.relative(root,outFile)}: ${data.courses.length} courses, ${data.totalModules} modules`);
}

try { build(); }
catch(err){ console.error('Build failed:', err.message); process.exit(1); }
