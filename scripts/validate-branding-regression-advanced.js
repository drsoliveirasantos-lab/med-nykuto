#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const reportDir = path.join(root, 'reports');
const reportJson = path.join(reportDir, 'branding-regression-report.json');
const reportTxt = path.join(reportDir, 'branding-regression-report.txt');
const failures = [];
const warnings = [];
const allowedAssetName = /logo-medcursos|medcursos-icon|medcursos-official/i;
const oldDomainPattern = /med-cursos\.netlify\.app/i;
const oldBrandPattern = /Med\s*Cursos|MedCursos/i;
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();
const staticFiles = ['robots.txt', 'sitemap.xml', ...htmlFiles];

function add(list, entry) { list.push({ ...entry, createdAt: new Date().toISOString() }); }
function lineOf(text, index) { return text.slice(0, index).split(/\r?\n/).length; }
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function scanRaw(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, 'utf8');
  const domain = oldDomainPattern.exec(text);
  if (domain) {
    add(failures, { file, line: lineOf(text, domain.index), type: 'old-domain', message: `${file}: old Netlify domain detected` });
  }
  const assetMentions = text.match(/logo-medcursos[^"'\s)]*/gi) || [];
  assetMentions.forEach((asset) => add(warnings, { file, type: 'legacy-asset-filename', message: `${file}: legacy asset filename still referenced: ${asset}` }));
}
function scanVisibleHtml(file) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, 'utf8');
  const body = (html.match(/<body[\s\S]*?<\/body>/i) || [''])[0];
  const visibleText = stripTags(body);
  const match = oldBrandPattern.exec(visibleText);
  if (match) add(failures, { file, type: 'old-visible-brand', message: `${file}: old visible brand detected in body text` });

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [null, ''])[1];
  if (oldBrandPattern.test(title)) add(failures, { file, type: 'old-title-brand', message: `${file}: old brand detected in title` });
  const metaMatches = [...html.matchAll(/<meta\b[^>]*(?:content|property|name)=[^>]*>/gi)];
  metaMatches.forEach((m) => {
    const raw = m[0];
    if (oldBrandPattern.test(raw) && !allowedAssetName.test(raw)) add(failures, { file, type: 'old-meta-brand', message: `${file}: old brand detected in metadata` });
  });
}

fs.mkdirSync(reportDir, { recursive: true });
staticFiles.forEach(scanRaw);
htmlFiles.forEach(scanVisibleHtml);

const report = { generatedAt: new Date().toISOString(), summary: { failureCount: failures.length, warningCount: warnings.length, checkedFiles: staticFiles.length }, failures, warnings };
fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
const lines = [];
lines.push('Med Nykuto — Branding regression report');
lines.push(`Failures: ${failures.length}`);
lines.push(`Warnings: ${warnings.length}`);
lines.push('');
lines.push('Failures:');
if (!failures.length) lines.push('- none');
failures.forEach((item, index) => lines.push(`${index + 1}. ${item.message}`));
lines.push('');
lines.push('Warnings:');
if (!warnings.length) lines.push('- none');
warnings.slice(0, 100).forEach((item, index) => lines.push(`${index + 1}. ${item.message}`));
if (warnings.length > 100) lines.push(`...and ${warnings.length - 100} more warnings`);
fs.writeFileSync(reportTxt, lines.join('\n') + '\n');

if (warnings.length) console.warn(`Branding warnings: ${warnings.length}. See reports/branding-regression-report.txt`);
if (failures.length) {
  console.error(`Branding regression failed: ${failures.length}`);
  failures.forEach((item) => console.error(`- ${item.message}`));
  process.exit(1);
}
console.log(`Branding regression advanced OK. Warnings: ${warnings.length}.`);
