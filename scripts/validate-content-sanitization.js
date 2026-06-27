#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const reportDir = path.join(root, 'reports');
const reportJson = path.join(reportDir, 'content-sanitization-report.json');
const reportTxt = path.join(reportDir, 'content-sanitization-report.txt');
const failures = [];
const warnings = [];

const dataFiles = [
  'data/med-courses-data.js',
  'data/practice-bank-fisiologia.js',
  'data/practice-bank-microbiologia.js',
  'data/practice-bank-genetica.js',
  'data/practice-bank-bioquimica.js',
  'data/practice-bank-inmunologia.js'
];
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html')).sort();

const dangerousContentPatterns = [
  { type: 'script-tag', pattern: /<\s*script\b/i, severity: 'failure' },
  { type: 'inline-event-handler', pattern: /\son[a-z]+\s*=/i, severity: 'failure' },
  { type: 'javascript-url', pattern: /javascript\s*:/i, severity: 'failure' },
  { type: 'srcdoc', pattern: /\bsrcdoc\s*=/i, severity: 'failure' },
  { type: 'iframe-tag', pattern: /<\s*iframe\b/i, severity: 'failure' },
  { type: 'object-embed-tag', pattern: /<\s*(object|embed)\b/i, severity: 'failure' },
  { type: 'data-html-url', pattern: /data\s*:\s*text\/html/i, severity: 'failure' }
];

const htmlObservationPatterns = [
  { type: 'inline-event-handler', pattern: /\son[a-z]+\s*=/i },
  { type: 'javascript-url', pattern: /javascript\s*:/i },
  { type: 'iframe-tag', pattern: /<\s*iframe\b/i },
  { type: 'object-embed-tag', pattern: /<\s*(object|embed)\b/i }
];

function add(list, entry) { list.push({ ...entry, createdAt: new Date().toISOString() }); }
function lineOf(text, index) { return text.slice(0, index).split(/\r?\n/).length; }
function preview(text, index) { return text.slice(Math.max(0, index - 80), Math.min(text.length, index + 160)).replace(/\s+/g, ' ').trim(); }
function scanFile(file, patterns, mode) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, 'utf8');
  patterns.forEach((rule) => {
    const match = rule.pattern.exec(text);
    if (!match) return;
    const entry = { file, line: lineOf(text, match.index), type: rule.type, message: `${file}: ${rule.type} detected at line ${lineOf(text, match.index)}`, preview: preview(text, match.index) };
    if (mode === 'content') add(failures, entry);
    else add(warnings, entry);
  });
}

fs.mkdirSync(reportDir, { recursive: true });
dataFiles.forEach((file) => scanFile(file, dangerousContentPatterns, 'content'));
htmlFiles.forEach((file) => scanFile(file, htmlObservationPatterns, 'html'));

const report = {
  generatedAt: new Date().toISOString(),
  summary: { checkedContentFiles: dataFiles.length, checkedHtmlFiles: htmlFiles.length, failureCount: failures.length, warningCount: warnings.length },
  failures,
  warnings
};
fs.writeFileSync(reportJson, JSON.stringify(report, null, 2));
const lines = [];
lines.push('Med Nykuto — Content sanitization report');
lines.push(`Failures: ${failures.length}`);
lines.push(`Warnings: ${warnings.length}`);
lines.push('');
lines.push('Failures in course/question content:');
if (!failures.length) lines.push('- none');
failures.forEach((item, index) => lines.push(`${index + 1}. ${item.message}\n   ${item.preview}`));
lines.push('');
lines.push('HTML observations, non-blocking:');
if (!warnings.length) lines.push('- none');
warnings.forEach((item, index) => lines.push(`${index + 1}. ${item.message}\n   ${item.preview}`));
fs.writeFileSync(reportTxt, lines.join('\n') + '\n');

if (warnings.length) {
  console.warn(`Content sanitization warnings: ${warnings.length}. See reports/content-sanitization-report.txt`);
}
if (failures.length) {
  console.error(`Content sanitization failed: ${failures.length} dangerous pattern(s) in course/question content.`);
  failures.forEach((item) => console.error(`- ${item.message}`));
  process.exit(1);
}
console.log(`Content sanitization OK. Warnings: ${warnings.length}.`);
