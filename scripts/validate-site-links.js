#!/usr/bin/env node
/* Med Nykuto v360 — static site link/identity/release-hygiene validator.
   Run from repo root: node scripts/validate-site-links.js
*/
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const required = ['index.html','matieres.html','matiere.html','modules.html','module.html','qcm.html','cas-cliniques.html','vrai-faux.html','erreurs.html','examen.html','contact.html','contact-success.html','a-propos.html','mentions.html'];
const problems = [];
function exists(p){ return fs.existsSync(path.join(root, p)); }
function add(file,msg){ problems.push(`${file}: ${msg}`); }
function isAudit(file){ return /^audit-|^debug-|^test-/i.test(file); }

required.forEach(f => { if(!exists(f)) add(f, 'required file missing'); });

for(const file of htmlFiles){
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if(/Med Cursos/i.test(html)) add(file, 'contains old brand “Med Cursos”');
  if(/med-cursos\.netlify\.app/i.test(html)) add(file, 'contains old Netlify canonical/OG URL');
  if(/data-netlify|netlify-honeypot|\bNetlify\b/i.test(html)) add(file, 'contains unsupported Netlify form/reference');
  if(/Mensaje enviado|Tu retorno fue enviado correctamente/i.test(html)) add(file, 'contains fake sent-confirmation wording');
  if(!isAudit(file) && /\b(2088|1044|1160|2900)\b/.test(html)) add(file, 'contains stale fixed question-bank metric');
  if(/>\s*Mentions\s*</.test(html) || /<title>\s*Mentions/i.test(html)) add(file, 'contains visible French legal label “Mentions”');
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

const jsChecks = [
  ['site-global-polish-v310.js', /__MED_NYKUTO_GLOBAL_POLISH__\s*=\s*['"]v360-loader['"]/],
  ['med-nykuto-global-fix-v358.js', /__MED_NYKUTO_GLOBAL_FIX__\s*=\s*VERSION/],
  ['practice-cleanup-v314.js', /__MED_NYKUTO_PRACTICE_CLEANUP__\s*=\s*['"]v360['"]/],
  ['data/med-practice-bank-loader.js', /practice-bank-functional-fallback-v360\.js/]
];
jsChecks.forEach(([file, pattern]) => {
  if(!exists(file)){ add(file, 'required JS file missing'); return; }
  const body = fs.readFileSync(path.join(root, file), 'utf8');
  if(!pattern.test(body)) add(file, 'missing expected v360 marker');
});

if(problems.length){
  console.log('Med Nykuto site validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log(`Med Nykuto site validation OK (${htmlFiles.length} HTML files checked).`);
