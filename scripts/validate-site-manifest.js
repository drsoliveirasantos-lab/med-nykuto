#!/usr/bin/env node
/* v361 — validates the release manifest JSON and critical referenced files. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestPath = path.join(root, 'data/med-site-manifest-v361.json');
const problems = [];
function add(msg){ problems.push(msg); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }

let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  add(`data/med-site-manifest-v361.json: invalid or missing JSON: ${err.message}`);
}

if(manifest){
  if(manifest.siteName !== 'Med Nykuto') add('manifest: wrong siteName');
  if(manifest.release !== 'v361-runtime-hardening') add('manifest: wrong release');
  if(manifest.branch !== 'preview') add('manifest: wrong branch');
  if(!manifest.deployment || manifest.deployment.provider !== 'Cloudflare Pages') add('manifest: deployment provider must be Cloudflare Pages');
  if(!manifest.expectedData || manifest.expectedData.moduleCount !== 58) add('manifest: expectedData.moduleCount must be 58');
  if(!manifest.safeguards || manifest.safeguards.runtimeHealthVersion !== 'v361') add('manifest: runtime safeguard version must be v361');
  (manifest.navigationPages || []).forEach(file => { if(!exists(file)) add(`manifest page missing: ${file}`); });
  (manifest.criticalScripts || []).forEach(file => { if(!exists(file)) add(`manifest critical script missing: ${file}`); });
}

if(problems.length){
  console.log('Med Nykuto manifest validation failed:');
  problems.forEach(p => console.log(' - ' + p));
  process.exit(1);
}
console.log('Med Nykuto manifest validation OK.');
