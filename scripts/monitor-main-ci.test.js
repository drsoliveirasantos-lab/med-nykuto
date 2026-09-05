'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { decide, latestJobs, REQUIRED_JOBS, TRANSIENT_LOG } = require('./monitor-main-ci');
const sha = 'current-main-sha';
const run = { head_sha: sha, head_branch: 'main', status: 'completed', conclusion: 'success', run_attempt: 1 };
const green = () => REQUIRED_JOBS.map((name, i) => ({ id: i + 1, name, conclusion: 'success', steps: [] }));

test('green requires all six successful jobs and a successful current run', () => {
  assert.equal(decide(run, sha, green()).status, 'green');
  assert.equal(decide(run, sha, green().slice(1)).status, 'blocked');
  const skipped = green(); skipped[2].conclusion = 'skipped';
  assert.equal(decide(run, sha, skipped).status, 'blocked');
  assert.equal(decide({ ...run, conclusion: 'failure' }, sha, green()).status, 'blocked');
});
test('no duplicate or stale revision retry', () => {
  assert.equal(decide(undefined, sha, []).status, 'waiting');
  assert.equal(decide({ ...run, head_sha: 'old' }, sha, green()).status, 'waiting');
  assert.equal(decide({ ...run, head_branch: 'preview' }, sha, green()).status, 'waiting');
  assert.equal(decide({ ...run, status: 'in_progress' }, sha, []).status, 'waiting');
  assert.equal(decide({ ...run, status: 'queued' }, sha, []).status, 'waiting');
});
test('never retry cancelled workflows or test assertion failures', () => {
  assert.equal(decide({ ...run, conclusion: 'cancelled' }, sha, []).status, 'blocked');
  const jobs = green();
  jobs[1] = { ...jobs[1], conclusion: 'failure', steps: [{ name: 'Run desktop core regression tests', conclusion: 'failure' }] };
  assert.equal(decide({ ...run, conclusion: 'failure' }, sha, jobs).status, 'blocked');
});
test('setup failure requires log inspection and has a finite retry budget', () => {
  const jobs = green();
  jobs[2] = { ...jobs[2], conclusion: 'failure', steps: [{ name: 'Install Playwright Chromium and WebKit with timeout', conclusion: 'failure' }] };
  assert.equal(decide({ ...run, conclusion: 'failure' }, sha, jobs).status, 'inspect');
  assert.equal(decide({ ...run, conclusion: 'failure', run_attempt: 3 }, sha, jobs).status, 'blocked');
  jobs[2].steps.push({ name: 'Run mobile touch critical tests', conclusion: 'failure' });
  assert.equal(decide({ ...run, conclusion: 'failure' }, sha, jobs).status, 'blocked');
});
test('all attempts retain successful jobs but newer failures take precedence', () => {
  const jobs = green();
  const newer = { ...jobs[0], id: 99, conclusion: 'failure' };
  assert.equal(latestJobs([newer, ...jobs]).find((job) => job.name === newer.name).conclusion, 'failure');
  assert.equal(decide(run, sha, [...jobs, newer]).status, 'blocked');
});
test('locator timeouts and dependency/configuration errors are not temporary network evidence', () => {
  for (const text of ['locator.click: Timeout 15000ms exceeded', 'Expected 53, received 10', 'npm ERR! E404 package missing', 'Permission denied']) {
    assert.equal(TRANSIENT_LOG.test(text), false, text);
  }
  for (const text of ['npm ERR! EAI_AGAIN', 'Error: ECONNRESET', '503 Service Unavailable', 'Process completed with exit code 124.']) {
    assert.equal(TRANSIENT_LOG.test(text), true, text);
  }
});
