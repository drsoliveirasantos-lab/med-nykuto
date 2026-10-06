const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'scripts', 'validate-2026-08-21-handoff.js');
const source = fs.readFileSync(filename, 'utf8');
const localRequire = createRequire(filename);
const assets = path.join(root, 'assets', 'class-hub');

// Run the real validator with only path separators and directory entries varied.
// Fixtures never write files and never change the image allowlist or hash guards.
function run(code, separator, forbiddenName = null) {
  const output = [];
  const fakePath = { ...path, sep: separator, relative: (from, to) => path.relative(from, to).split(path.sep).join(separator) };
  const fakeFs = { ...fs, readdirSync: (directory, options) => {
    const entries = fs.readdirSync(directory, options);
    if (forbiddenName && directory === assets && options?.withFileTypes) {
      return [...entries, { name: forbiddenName, isDirectory: () => false }];
    }
    return entries;
  } };
  const sandbox = { __dirname: path.dirname(filename), console: {
    log: (...args) => output.push(args.join(' ')), error: (...args) => output.push(args.join(' '))
  }, process: { exit: (status) => { const error = new Error('validator exit'); error.exitCode = status; throw error; } },
  require: (name) => name === 'fs' ? fakeFs : name === 'path' ? fakePath : name === path.join(root, 'academic-model-v445.js') ? vm.runInContext(fs.readFileSync(name, 'utf8'), context, { filename: name }) : localRequire(name) };
  sandbox.global = sandbox;
  const context = vm.createContext(sandbox);
  try { vm.runInContext(code, context, { filename }); return { exitCode: 0, output }; }
  catch (error) { if (Number.isInteger(error.exitCode)) return { exitCode: error.exitCode, output }; throw error; }
}

if (require.main === module) {
const checks = [];
for (const separator of ['/', '\\']) {
  const approved = run(source, separator);
  assert.equal(approved.exitCode, 0, JSON.stringify(approved.output));
  checks.push({ separator, fixture: 'existing-approved-image', exitCode: approved.exitCode });
  for (const forbiddenName of ['unapproved-board.jpeg', 'photo-original.webp', 'whatsapp-capture.png']) {
    const rejected = run(source, separator, forbiddenName);
    assert.equal(rejected.exitCode, 1);
    assert(rejected.output.some((message) => message.includes('Unapproved raw board photos or message captures')));
    checks.push({ separator, fixture: forbiddenName, exitCode: rejected.exitCode, rejected: true });
  }
}
console.log(JSON.stringify({ ok: true, checks }, null, 2));
}
module.exports = { run };
