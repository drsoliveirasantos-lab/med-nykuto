'use strict';

// Control-plane only: this monitor never edits code or executes a failed run's artifacts.
const ISSUE = 183;
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
const SETUP_STEP = /^(?:Set up job|Set up runner|Initialize containers|Install dependencies|Run npm (?:ci|install)|Install Playwright\b|Run actions\/(?:checkout|setup-node)@)/;
const TRANSIENT_LOG = /\b(?:ECONNRESET|EAI_AGAIN|ETIMEDOUT)\b|Connection reset by peer|Temporary failure in name resolution|TLS handshake timeout|(?:502 Bad Gateway|503 Service Unavailable)|Process completed with exit code 124\b/i;

function latestJobs(jobs) {
  const byName = new Map();
  [...jobs].sort((a, b) => a.id - b.id).forEach((job) => byName.set(job.name, job));
  return [...byName.values()];
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
  if (run.conclusion !== 'failure') return { status: 'blocked', reason: `Run ended with ${run.conclusion}; manual diagnosis is required.` };
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
  if (issue.state !== 'open') {
    core.info('Recovery issue is closed; this repair monitor is inactive.');
    return;
  }
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
    ? await github.paginate(github.rest.actions.listJobsForWorkflowRun, { ...repo, run_id: run.id, filter: 'all', per_page: 100 })
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
  if (run && ['retry', 'green'].includes(decision.status)) {
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
      '', 'Automatic follow-up is active while this issue is open. Tests and course data are never weakened or edited by this monitor.',
      'Persistent code failures require a correcting agent or maintainer; this workflow is not a background ChatGPT coding session.'
    ].join('\n');
    const comments = await github.paginate(github.rest.issues.listComments, { ...repo, issue_number: ISSUE, per_page: 100 });
    const previous = comments.find((comment) => comment.user?.type === 'Bot' && comment.body?.includes(MARKER));
    if (previous && previous.body !== body) await github.rest.issues.updateComment({ ...repo, comment_id: previous.id, body });
    else if (!previous) await github.rest.issues.createComment({ ...repo, issue_number: ISSUE, body });
    await core.summary.addHeading(`Main CI: ${status}`).addRaw(reason).addEOL().write();
  };

  if (decision.status === 'retry') {
    try {
      await github.rest.actions.reRunWorkflowFailedJobs({ ...repo, run_id: run.id });
      await publish('retry-requested', decision.reason);
    } catch (error) {
      await publish('blocked', `Retry request failed (HTTP ${error.status || 'unknown'}). No successful retry is claimed.`);
      throw error;
    }
    return;
  }
  await publish(decision.status, decision.reason);
  if (decision.status === 'green') {
    // Close only after positive evidence for all six jobs on the live main revision.
    await github.rest.issues.update({ ...repo, issue_number: ISSUE, state: 'closed', state_reason: 'completed' });
  }
}

module.exports = monitor;
module.exports.decide = decide;
module.exports.latestJobs = latestJobs;
module.exports.REQUIRED_JOBS = REQUIRED_JOBS;
module.exports.TRANSIENT_LOG = TRANSIENT_LOG;
