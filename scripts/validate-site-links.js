#!/usr/bin/env node
/* Med Nykuto v313 — static site link/identity validator.
   Run from repo root: node scripts/validate-site-links.js
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const required = ['index.html','matieres.html','modules.html','module.html','qcm.html','cas-cliniques.html','vrai-faux.html','examen.html','contact.html','a-propos.html','mentions.html'];
const problems = [];
function exists(p){ return fs.existsSync(path.join(root, p)); }
function add(file,msg){ problems.push(`${file}: ${msg}`); }

required.forEach(f => { if(!exists(f)) add(f, 'required file missing'); });

for(const file of htmlFiles){
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if(/Med Cursos/i.test(html)) add(file, 'contains old brand “Med Cursos”');
  if(/med-cursos\.netlify\.app/i.test(html)) add(file, 'contains old Netlify canonical/OG URL');
  if(!/<meta\s+name="viewport"/i.test(html)) add(file, 'missing viewport meta');
  if(!/<title>[^<]+Med Nykuto/i.test(html) && !['README_DEPLOIEMENT.txt'].includes(file)) add(file, 'title does not include Med Nykuto');
  const scripts = Array.from(html.matchAll(/<script[^>]+src="([^"]+)"/g)).map(m => m[1]);
  scripts.forEach(src => {
    const clean = src.split('?')[0];
    if(!/^https?:/i.test(clean) && !exists(clean)) add(file, `missing script: ${clean}`);
  });
  const links = Array.from(html.matchAll(/<(?:a|link)[^>]+href="([^"]+)"/g)).map(m => m[1]);
  links.forEach(href => {
    const clean = href.split('#')[0].split('?')[0];
    if(!clean || /^(https?:|mailto:|tel:|#)/i.test(clean)) return;
    if(!exists(clean)) add(file, `missing href target: ${clean}`);
  });
}

if(problems.length){
  console.log('Med Nykuto site validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log(`Med Nykuto site validation OK (${htmlFiles.length} HTML files checked).`);
