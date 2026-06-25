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
            location: error.location ? `${error.location.file}:${error.location.line}:${error.location.column}` : ''
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
  });
  if(failures.length > 20) console.log(`... ${failures.length - 20} more failures omitted`);
}
console.log('PLAYWRIGHT_COMPACT_SUMMARY_END');
