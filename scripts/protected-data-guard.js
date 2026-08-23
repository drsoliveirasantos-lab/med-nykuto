const { spawnSync } = require('child_process');
const fs = require('fs');

const protectedFiles = new Set([
  'data/med-courses-data.js',
  'data/med-practice-bank-init.js',
  'data/med-practice-bank-loader.js',
  'data/practice-bank-fisiologia.js',
  'data/practice-bank-microbiologia.js',
  'data/practice-bank-genetica.js',
  'data/practice-bank-bioquimica.js',
  'data/practice-bank-inmunologia.js'
]);

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) return '';
  return String(result.stdout || '').trim();
}

function getChangedFiles() {
  const event = process.env.GITHUB_EVENT_NAME || '';
  const base = process.env.GITHUB_BASE_REF || '';
  if (event === 'pull_request' && base) {
    run('git', ['fetch', 'origin', base, '--depth=1']);
    return run('git', ['diff', '--name-only', `origin/${base}...HEAD`]).split('\n').filter(Boolean);
  }
  return run('git', ['diff', '--name-only', 'HEAD~1', 'HEAD']).split('\n').filter(Boolean);
}

function getRelevantCommitMessages() {
  const event = process.env.GITHUB_EVENT_NAME || '';
  const base = process.env.GITHUB_BASE_REF || '';
  if (event === 'pull_request' && base) {
    return run('git', ['log', '--format=%B', `origin/${base}..HEAD`]);
  }
  return run('git', ['log', '-1', '--format=%B']);
}

function isIntentionalSplitCourseDataChange(protectedChanged) {
  if (protectedChanged.length !== 1 || protectedChanged[0] !== 'data/med-courses-data.js') return false;
  if (!fs.existsSync('content-lock.json')) return false;
  try {
    const lock = JSON.parse(fs.readFileSync('content-lock.json', 'utf8'));
    return lock.version === 'split-module10-lock-v1'
      && lock.totalModules === 59
      && lock.courses?.fisiologia === 10
      && lock.expectedNewModule === '01-fisiologia-10-fisiologia-muscular';
  } catch (error) {
    return false;
  }
}

const changed = getChangedFiles();
const protectedChanged = changed.filter((file) => protectedFiles.has(file));
// Pull-request checkouts point HEAD at a synthetic merge commit. Inspect the
// complete PR commit range so an explicit marker on the authored bank commit
// remains visible without allowing unrelated commits outside the PR scope.
const commitMessages = getRelevantCommitMessages();
const intentionalBankMarker = /\[bank-data-change\]/i.test(commitMessages);
const allowed = String(process.env.ALLOW_PROTECTED_DATA_CHANGE || '').toLowerCase() === 'true'
  || intentionalBankMarker
  || isIntentionalSplitCourseDataChange(protectedChanged);

if (protectedChanged.length > 0 && !allowed) {
  console.error('Protected data files changed without explicit allowance:');
  protectedChanged.forEach((file) => console.error(`- ${file}`));
  console.error('Use [bank-data-change] in the commit message or ALLOW_PROTECTED_DATA_CHANGE=true only for intentional bank/data work.');
  process.exit(1);
}

console.log(`Protected data guard passed. Checked ${changed.length} changed files.`);
