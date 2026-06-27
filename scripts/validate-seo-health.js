const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const warnings = [];

const keyPages = [
  'index.html',
  'matieres.html',
  'modules.html',
  'qcm.html',
  'cas-cliniques.html',
  'vrai-faux.html',
  'erreurs.html',
  'examen.html',
  'contact.html',
  'a-propos.html',
  'mentions.html'
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttr(html, tagPattern, attr) {
  const match = html.match(tagPattern);
  if (!match) return '';
  const tag = match[0];
  const attrMatch = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, 'i'));
  return attrMatch ? attrMatch[1].trim() : '';
}

for (const file of keyPages) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing key page: ${file}`);
    continue;
  }
  const html = read(file);
  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').trim();
  const description = getAttr(html, /<meta\s+[^>]*name=["']description["'][^>]*>/i, 'content') || getAttr(html, /<meta\s+[^>]*content=["'][^"']+["'][^>]*name=["']description["'][^>]*>/i, 'content');
  const lang = getAttr(html, /<html\b[^>]*>/i, 'lang');
  const canonical = getAttr(html, /<link\s+[^>]*rel=["']canonical["'][^>]*>/i, 'href') || getAttr(html, /<link\s+[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i, 'href');
  const text = visibleText(html);

  if (!title || title.length < 8) failures.push(`${file}: missing or too-short <title>`);
  if (!/Med Nykuto/i.test(title)) failures.push(`${file}: title should include Med Nykuto`);
  if (!description || description.length < 40) failures.push(`${file}: missing or too-short meta description`);
  if (!lang) failures.push(`${file}: missing html lang`);
  if (!canonical) failures.push(`${file}: missing canonical link`);
  if (/Med\s*Cursos/i.test(text)) failures.push(`${file}: visible text still contains Med Cursos`);
  if (/\[[^\]]*(Pr[eé]nom|Nom|email|t[eé]l[eé]phone|TODO|placeholder)[^\]]*\]/i.test(text)) failures.push(`${file}: visible placeholder text remains`);
  if (/Document\s*Title|Untitled/i.test(title)) failures.push(`${file}: placeholder title remains`);
}

if (!fs.existsSync(path.join(root, 'robots.txt'))) failures.push('robots.txt is missing');
if (!fs.existsSync(path.join(root, 'sitemap.xml'))) failures.push('sitemap.xml is missing');

if (fs.existsSync(path.join(root, 'robots.txt'))) {
  const robots = read('robots.txt');
  if (!/Sitemap:/i.test(robots)) failures.push('robots.txt: missing Sitemap directive');
  if (/med-cursos\.netlify\.app/i.test(robots)) failures.push('robots.txt: old med-cursos.netlify.app domain remains');
}

if (fs.existsSync(path.join(root, 'sitemap.xml'))) {
  const sitemap = read('sitemap.xml');
  if (!/<urlset\b/i.test(sitemap)) failures.push('sitemap.xml: missing urlset');
  if (/med-cursos\.netlify\.app/i.test(sitemap)) failures.push('sitemap.xml: old med-cursos.netlify.app domain remains');
  for (const file of keyPages) {
    if (!sitemap.includes(file === 'index.html' ? '/' : file)) warnings.push(`sitemap.xml: ${file} not clearly listed`);
  }
}

if (warnings.length) {
  console.warn('SEO warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length) {
  console.error('SEO health check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SEO health check passed for ${keyPages.length} key pages.`);
