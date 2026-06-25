#!/usr/bin/env node
const fs = require('fs');
const file = process.argv[2];
if(!file || !fs.existsSync(file)){
  console.log('No Playwright JSON report found.');
  process.exit(0);
}
let report;
try { report = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch(err){ console.log('Cannot parse Playwright JSON report: ' + err.message); process.exit(0); }
const failures = [];
function textFromAttachment(a){
  if(!a) return '';
  if(typeof a.body === 'string') return a.body;
  if(a.body && typeof a.body === 'object'){
    try { return Buffer.from(a.body.data || a.body, a.body.type === 'Buffer' ? undefined : 'base64').toString('utf8'); }
    catch(e){ return ''; }
  }
  return '';
}
function collectOutput(result){
  const out = [];
  (result.stdout || []).forEach(x => out.push(typeof x === 'string' ? x : String(x.text || x || '')));
  (result.stderr || []).forEach(x => out.push(typeof x === 'string' ? x : String(x.text || x || '')));
  (result.attachments || []).forEach(a => {
    const txt = textFromAttachment(a);
    if(txt) out.push(txt);
  });
  return out.join('\n').split('\n').filter(line => /QCM_DIAG|error|expect|Timeout|locator|failed/i.test(line)).slice(0, 20).join('\n');
}
function visitSuite(suite, parents = []){
  const title = suite.title ? [...parents, suite.title] : parents;
  (suite.specs || []).forEach(spec => {
    (spec.tests || []).forEach(test => {
      (test.results || []).forEach(result => {
        if(result.status !== 'passed' && result.status !== 'skipped'){
          const error = result.error || (result.errors && result.errors[0]) || {};
          failures.push({
            title: [...title, spec.title].filter(Boolean).join(' › '),
            status: result.status,
            message: String(error.message || '').split('\n').slice(0, 8).join('\n'),
            location: error.location ? `${error.location.file}:${error.location.line}:${error.location.column}` : '',
            output: collectOutput(result)
          });
        }
      });
    });
  });
  (suite.suites || []).forEach(child => visitSuite(child, title));
}
(report.suites || []).forEach(s => visitSuite(s));
console.log('PLAYWRIGHT_COMPACT_SUMMARY_START');
if(!failures.length){
  console.log('No failing Playwright tests found in JSON report.');
} else {
  failures.slice(0, 20).forEach((f, i) => {
    console.log(`#${i + 1} ${f.status}: ${f.title}`);
    if(f.location) console.log(`at ${f.location}`);
    if(f.message) console.log(f.message);
    if(f.output){
      console.log('--- captured output ---');
      console.log(f.output);
    }
  });
  if(failures.length > 20) console.log(`... ${failures.length - 20} more failures omitted`);
}
console.log('PLAYWRIGHT_COMPACT_SUMMARY_END');
