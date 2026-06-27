#!/usr/bin/env node
/* Scaffold a new module folder in split source tree.
   Usage: node scripts/add-module.js fisiologia 10 fisiologia-muscular "Fisiología muscular"
*/
const fs = require('fs');
const path = require('path');

const [courseId, numberRaw, slug, ...titleParts] = process.argv.slice(2);
if(!courseId || !numberRaw || !slug){
  console.error('Usage: node scripts/add-module.js <courseId> <number> <slug> [title]');
  process.exit(1);
}
const number = Number(numberRaw);
const title = titleParts.join(' ') || slug.replace(/-/g,' ');
const root = process.cwd();
const courseDir = path.join(root, 'content', 'courses', courseId);
const modulesRoot = path.join(courseDir, 'modules');
if(!fs.existsSync(courseDir)){ console.error(`Unknown course: ${courseId}`); process.exit(1); }
const dir = path.join(modulesRoot, `${String(number).padStart(2,'0')}-${slug}`);
if(fs.existsSync(dir)){ console.error(`Module folder already exists: ${dir}`); process.exit(1); }
fs.mkdirSync(dir, {recursive:true});
const id = `${String(courseId).padStart(2,'0')}-${courseId}-${String(number).padStart(2,'0')}-${slug}`;
const meta = {
  id,
  number,
  title,
  file: `Modulo_${String(number).padStart(2,'0')}_${slug.replace(/-/g,'_')}.md`,
  summary: '',
  headings: [],
  exam: [],
  courseTitle: courseId,
  contentModes: ['full','fiche','ultra'],
  sourceFiles: {
    markdown: 'markdown.md',
    fullMarkdown: 'full.md',
    ficheMarkdown: 'fiche.md',
    ultraMarkdown: 'ultra.md',
    figures: 'figures.json'
  }
};
fs.writeFileSync(path.join(dir,'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
fs.writeFileSync(path.join(dir,'markdown.md'), `# ${title}\n\n`, 'utf8');
fs.writeFileSync(path.join(dir,'full.md'), `# ${title}\n\n`, 'utf8');
fs.writeFileSync(path.join(dir,'fiche.md'), `# Ficha rápida — ${title}\n\n`, 'utf8');
fs.writeFileSync(path.join(dir,'ultra.md'), `# Ultra — ${title}\n\n`, 'utf8');
fs.writeFileSync(path.join(dir,'figures.json'), '[]\n', 'utf8');
console.log(`Created ${path.relative(root,dir)}`);
