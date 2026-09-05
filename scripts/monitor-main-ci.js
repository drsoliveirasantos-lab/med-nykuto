'use strict';

// Control-plane only: this monitor never edits code or executes a failed run's artifacts.
const ISSUE = 183;
const PERMANENT_STATUS_ISSUE = 1;
const MARKER = '<!-- med-nykuto-main-ci-recovery -->';
const MAX_ATTEMPTS = 3;
const REQUIRED_JOBS = [
  'Static, data and quality validation',
  'Browser desktop core regression tests',
  'Browser mobile Safari-shape critical tests',
  'Browser deployed, visual and accessibility tests',
  'Browser lot 2 visible feature tests',
  'Browser lot 3 hardening tests'
];
const SETUP_STEP = /^(?:Set up job|Set up runner|Initialize containers|Install dependencies|Run npm (?:ci|install)|Install Playwright\b|Run actions\/(?:checkout|setup-node)@|Upload .+ evidence)/;
const TRANSIENT_LOG = /\b(?:ECONNRESET|EAI_AGAIN|ETIMEDOUT|ERR_SOCKET_TIMEOUT)\b|socket hang up|Connection reset by peer|Temporary failure in name resolution|TLS handshake timeout|(?:502 Bad Gateway|503 Service Unavailable|504 Gateway Timeout)/i;

function latestJobs(jobs) {
  const byName = new Map();
  [...jobs].sort((a, b) => {
    const attempt = Number(a.__attempt || a.run_attempt || 0) - Number(b.__attempt || b.run_attempt || 0);
    return attempt || a.id - b.id;
  }).forEach((job) => byName.set(job.name, job));
  return [...byName.values()];
}

async function jobsThroughAttempt(github, repo, run) {
  const jobs = [];
  const attempts = Math.max(1, Number(run.run_attempt || 1));
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const attemptJobs = await github.paginate(github.rest.actions.listJobsForWorkflowRunAttempt, {
      ...repo,
      run_id: run.id,
      attempt_number: attempt,
      per_page: 100
    });
    jobs.push(...attemptJobs.map((job) => ({ ...job, __attempt: attempt })));
  }
  return jobs;
}

function decide(run, headSha, jobs) {
  if (!run || run.head_sha !== headSha || run.head_branch !== 'main') {
    return { status: 'waiting', reason: 'No consolidated run for the current main revision.' };
  }
  if (run.status !== 'completed') return { status: 'waiting', reason: 'Validation is already queued or running; no duplicate launch.' };
  const current = latestJobs(jobs);
  if (run.conclusion === 'success') {
    const missing = REQUIRED_JOBS.filter((name) => !current.some((job) => job.name === name && job.conclusion === 'success'));
    const bad = current.some((job) => ['failure', 'timed_out', 'cancelled', 'action_required', 'startup_failure'].includes(job.conclusion));
    return missing.length || bad
      ? { status: 'blocked', reason: 'Run reports success but required job evidence is incomplete or unsuccessful.' }
      : { status: 'green', reason: 'The consolidated workflow and every required job passed on the current main SHA.' };
  }
  // Respect manual cancellation and never rerun assertions until a code change fixes them.
  if (!['failure', 'timed_out'].includes(run.conclusion)) return { status: 'blocked', reason: `Run ended with ${run.conclusion}; manual diagnosis is required.` };
  if (Number(run.run_attempt || 1) >= MAX_ATTEMPTS) return { status: 'blocked', reason: 'Automatic retry budget exhausted (three total attempts). Diagnosis required.' };
  const failed = current.filter((job) => job.conclusion === 'failure' || job.conclusion === 'timed_out');
  const setupOnly = failed.length > 0 && failed.every((job) => {
    const steps = (job.steps || []).filter((step) => step.conclusion === 'failure' || step.conclusion === 'timed_out');
    return steps.length > 0 && steps.every((step) => SETUP_STEP.test(step.name));
  });
  return setupOnly
    ? { status: 'inspect', reason: 'Setup failed; inspect logs for explicit transient infrastructure evidence.', failed }
    : { status: 'blocked', reason: 'Tests, audit, validation or another non-transient step failed. A code correction is required; no blind retry.' };
}

async function monitor({ github, context, core }) {
  const repo = context.repo;
  const issue = (await github.rest.issues.get({ ...repo, issue_number: ISSUE })).data;
  const statusIssue = issue.state === 'open' ? ISSUE : PERMANENT_STATUS_ISSUE;
  const branch = (await github.rest.repos.getBranch({ ...repo, branch: 'main' })).data;
  const headSha = branch.commit.sha;
  const response = await github.rest.actions.listWorkflowRuns({
    ...repo, workflow_id: 'site-tests.yml', branch: 'main', head_sha: headSha, per_page: 100
  });
  const runs = response.data.workflow_runs.filter((run) =>
    run.head_sha === headSha && run.head_branch === 'main' &&
    ['push', 'workflow_dispatch', 'schedule'].includes(run.event) &&
    run.head_repository && run.head_repository.full_name === `${repo.owner}/${repo.repo}`
  ).sort((a, b) => b.id - a.id);
  const run = runs[0];
  const jobs = run && run.status === 'completed'
    ? await jobsThroughAttempt(github, repo, run)
    : [];
  let decision = decide(run, headSha, jobs);
  if (decision.status === 'inspect') {
    let transient = true;
    for (const job of decision.failed) {
      // Never publish logs (they can contain private data); only classify transport signatures.
      const log = await github.rest.actions.downloadJobLogsForWorkflowRun({ ...repo, job_id: job.id });
      const text = typeof log.data === 'string' ? log.data : Buffer.from(log.data).toString('utf8');
      if (!TRANSIENT_LOG.test(text)) transient = false;
    }
    decision = transient
      ? { status: 'retry', reason: 'Explicit temporary installation/network failure. Retry only failed jobs and their dependents.' }
      : { status: 'blocked', reason: 'Setup error has no proven transient signature. Diagnose instead of blindly retrying.' };
  }

  // Re-check immediately before any retry or success acknowledgement to avoid stale-SHA decisions.
  const liveHead = (await github.rest.repos.getBranch({ ...repo, branch: 'main' })).data.commit.sha;
  if (liveHead !== headSha) { core.info('Main advanced during inspection; leave the newer validation untouched.'); return; }
  if (run) {
    const liveRun = (await github.rest.actions.getWorkflowRun({ ...repo, run_id: run.id })).data;
    if (liveRun.status !== 'completed' || liveRun.run_attempt !== run.run_attempt || liveRun.conclusion !== run.conclusion) {
      core.info('Run changed during inspection; the next event/watchdog will re-evaluate it.');
      return;
    }
  }

  const publish = async (status, reason) => {
    const body = [
      MARKER, `## Main CI recovery: ${status.toUpperCase()}`, '',
      `Commit: \`${headSha}\``,
      run ? `Run: ${run.html_url} — attempt ${run.run_attempt || 1}/${MAX_ATTEMPTS}` : 'Run: not yet available.',
      '', reason, '',
      ...latestJobs(jobs).map((job) => `- ${job.name}: **${job.conclusion || job.status}**`),
      '', 'Automatic main follow-up is active. Tests and course data are never weakened or edited by this monitor.',
      'Persistent code failures require a correcting agent or maintainer; this workflow is not a background ChatGPT coding session.'
    ].join('\n');
    const comments = await github.paginate(github.rest.issues.listComments, { ...repo, issue_number: statusIssue, per_page: 100 });
    const previous = comments.find((comment) => comment.user?.type === 'Bot' && comment.body?.includes(MARKER));
    if (previous && previous.body !== body) await github.rest.issues.updateComment({ ...repo, comment_id: previous.id, body });
    else if (!previous) await github.rest.issues.createComment({ ...repo, issue_number: statusIssue, body });
    await core.summary.addHeading(`Main CI: ${status}`).addRaw(reason).addEOL().write();
  };

  if (!run && ['schedule', 'workflow_dispatch'].includes(context.eventName)) {
    await github.rest.actions.createWorkflowDispatch({ ...repo, workflow_id: 'site-tests.yml', ref: 'main' });
    await publish('validation-requested', 'No consolidated run exists for the current main revision. One validation was dispatched.');
    return;
  }

  if (decision.status === 'retry') {
    const concurrentResponse = await github.rest.actions.listWorkflowRuns({
      ...repo, workflow_id: 'site-tests.yml', branch: 'main', head_sha: headSha, per_page: 100
    });
    const concurrentRuns = concurrentResponse.data.workflow_runs.filter((candidate) =>
      candidate.head_sha === headSha && candidate.head_branch === 'main' &&
      ['push', 'workflow_dispatch', 'schedule'].includes(candidate.event) &&
      candidate.head_repository && candidate.head_repository.full_name === `${repo.owner}/${repo.repo}`
    ).sort((a, b) => b.id - a.id);
    if (concurrentRuns[0]?.id !== run.id || concurrentRuns.some((candidate) => candidate.id !== run.id && candidate.status !== 'completed')) {
      core.info('A newer validation exists for this revision; do not retry an older run.');
      return;
    }
    try {
      await github.rest.actions.reRunWorkflowFailedJobs({ ...repo, run_id: run.id });
    } catch (error) {
      await publish('blocked', `Retry request failed (HTTP ${error.status || 'unknown'}). No successful retry is claimed.`);
      throw error;
    }
    await publish('retry-requested', decision.reason);
    return;
  }
  await publish(decision.status, decision.reason);
  if (decision.status === 'blocked') {
    core.setFailed(decision.reason);
    return;
  }
  if (decision.status === 'green') {
    // Publishing can take long enough for main or the run attempt to change.
    // Reconfirm both immediately before closing the only recovery gate.
    const closingHead = (await github.rest.repos.getBranch({ ...repo, branch: 'main' })).data.commit.sha;
    if (closingHead !== headSha) { core.info('Main advanced while publishing green evidence; keep the recovery issue open.'); return; }
    const closingRun = (await github.rest.actions.getWorkflowRun({ ...repo, run_id: run.id })).data;
    if (closingRun.status !== 'completed' || closingRun.run_attempt !== run.run_attempt || closingRun.conclusion !== run.conclusion) {
      core.info('Run changed while publishing green evidence; keep the recovery issue open.');
      return;
    }
    // Close only after positive evidence for all six jobs on the still-live main revision.
    if (issue.state === 'open') await github.rest.issues.update({ ...repo, issue_number: ISSUE, state: 'closed', state_reason: 'completed' });
  }
}

module.exports = monitor;
module.exports.decide = decide;
module.exports.latestJobs = latestJobs;
module.exports.jobsThroughAttempt = jobsThroughAttempt;
module.exports.REQUIRED_JOBS = REQUIRED_JOBS;
module.exports.TRANSIENT_LOG = TRANSIENT_LOG;
