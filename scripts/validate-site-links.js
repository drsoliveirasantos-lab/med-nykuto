#!/usr/bin/env node
/* Med Nykuto v365 — static site link/identity/release-hygiene validator.
   Validates the public production pages listed below, not stray/debug HTML files. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const required = ['index.html','matieres.html','matiere.html','modules.html','module.html','qcm.html','cas-cliniques.html','vrai-faux.html','erreurs.html','examen.html','contact.html','contact-success.html','a-propos.html','mentions.html'];
const htmlFiles = required.filter(f => fs.existsSync(path.join(root, f)));
const criticalRestoredPages = ['module.html','qcm.html','cas-cliniques.html','vrai-faux.html','erreurs.html','examen.html'];
const problems = [];
function exists(p){ return fs.existsSync(path.join(root, p)); }
function add(file,msg){ problems.push(`${file}: ${msg}`); }

required.forEach(f => { if(!exists(f)) add(f, 'required file missing'); });

for(const file of htmlFiles){
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if(/Med Cursos/i.test(html)) add(file, 'contains old brand “Med Cursos”');
  if(/med-cursos\.netlify\.app/i.test(html)) add(file, 'contains old Netlify canonical/OG URL');
  if(/data-netlify|netlify-honeypot|\bNetlify\b/i.test(html)) add(file, 'contains unsupported Netlify form/reference');
  if(/Mensaje enviado|Tu retorno fue enviado correctamente/i.test(html)) add(file, 'contains fake sent-confirmation wording');
  if(/\b(2088|1044|1160|2900)\b/.test(html)) add(file, 'contains stale fixed question-bank metric');
  if(/>\s*Mentions\s*</.test(html) || /<title>\s*Mentions/i.test(html)) add(file, 'contains visible French legal label “Mentions”');
  if(!/<meta\s+name="viewport"/i.test(html)) add(file, 'missing viewport meta');
  if(!/<title>[^<]+Med Nykuto/i.test(html)) add(file, 'title does not include Med Nykuto');

  const unsafePlaceholders = Array.from(html.matchAll(/<a\b[^>]*href=["']#["'][^>]*>/gi))
    .map(m => m[0])
    .filter(tag => !/aria-disabled=["']true["']|is-coming-soon|data-allow-placeholder/i.test(tag));
  if(unsafePlaceholders.length) add(file, `unsafe href="#" links: ${unsafePlaceholders.length}`);

  if(criticalRestoredPages.includes(file)){
    ['data/med-courses-data.js?v=363','data/med-practice-bank-init.js?v=363','data/med-practice-bank-loader.js?v=363'].forEach(src => {
      if(!html.includes(src)) add(file, `restored critical asset not cache-busted: ${src}`);
    });
  }

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
  ['site-global-polish-v310.js', /__MED_NYKUTO_GLOBAL_POLISH__\s*=\s*['"]v363-loader['"]/],
  ['site-global-polish-v310.js', /CACHE_VERSION\s*=\s*['"]363['"]/],
  ['med-nykuto-runtime-guard-v361.js', /__MED_NYKUTO_RUNTIME_GUARD__\s*=\s*VERSION/],
  ['med-nykuto-global-fix-v358.js', /__MED_NYKUTO_GLOBAL_FIX__\s*=\s*VERSION/],
  ['practice-cleanup-v314.js', /__MED_NYKUTO_PRACTICE_CLEANUP__\s*=\s*['"]v360['"]/],
  ['data/med-practice-bank-loader.js', /__MED_NYKUTO_PRACTICE_LOADER__\s*=\s*['"]v363['"]/],
  ['data/med-practice-bank-loader.js', /practice-bank-functional-fallback-v360\.js/]
];
jsChecks.forEach(([file, pattern]) => {
  if(!exists(file)){ add(file, 'required JS file missing'); return; }
  const body = fs.readFileSync(path.join(root, file), 'utf8');
  if(!pattern.test(body)) add(file, 'missing expected release marker');
});

if(problems.length){
  console.log('Med Nykuto site validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log(`Med Nykuto site validation OK (${htmlFiles.length} public HTML files checked).`);
