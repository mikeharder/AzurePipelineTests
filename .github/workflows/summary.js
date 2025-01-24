// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  let owner = process.env.OWNER || '';
  let repo = process.env.REPO || '';
  let issue_number = parseInt(process.env.ISSUE_NUMBER || '');
  let head_sha = process.env.HEAD_SHA || '';

  if (context.eventName === 'check_suite') {
    const payload =
      /** @type {import("@octokit/webhooks-types").CheckSuiteEvent} */ (
        context.payload
      );

    owner = owner || payload.repository.owner.login;
    repo = repo || payload.repository.name;
    head_sha = head_sha || payload.check_suite.head_sha;

    // TODO: May not work in fork PRs, manually triggered check suites, etc
    issue_number = issue_number || payload.check_suite.pull_requests[0].number;
  } else if (context.eventName === 'pull_request') {
    const payload =
      /** @type {import("@octokit/webhooks-types").PullRequestEvent} */ (
        context.payload
      );

    owner = owner || payload.repository.owner.login;
    repo = repo || payload.repository.name;
    head_sha = head_sha || payload.pull_request.head.sha;
    issue_number = issue_number || payload.pull_request.number;
  } else if (context.eventName === 'workflow_run') {
    const payload =
      /** @type {import("@octokit/webhooks-types").WorkflowRunEvent} */ (
        context.payload
      );

    owner = owner || payload.repository.owner.login;
    repo = repo || payload.repository.name;
    head_sha = head_sha || payload.workflow_run.head_sha;

    // TODO: May not work in fork PRs, manually triggered check suites, etc
    issue_number = issue_number || payload.workflow_run.pull_requests[0].number;
  }

  console.log('# Labels');
  const labels = await github.rest.issues.listLabelsOnIssue({
    owner: owner,
    repo: repo,
    issue_number: issue_number,
  });
  for (const label of labels.data) {
    console.log(`  ${label.name}`);
  }

  console.log();
  console.log('# Check Suites');
  const checkSuites = await github.rest.checks.listSuitesForRef({
    owner: owner,
    repo: repo,
    ref: head_sha,
  });
  for (const suite of checkSuites.data.check_suites) {
    console.log(`${suite.app?.name}: ${suite.status}, ${suite.conclusion}`);

    const checkRuns = await github.rest.checks.listForSuite({
      owner: owner,
      repo: repo,
      check_suite_id: suite.id,
    });

    for (const run of checkRuns.data.check_runs) {
      console.log(`  ${run.name}: ${run.status}, ${run.conclusion}`);
    }
  }

  console.log();
  console.log('# Check Runs');
  const checkRuns = await github.rest.checks.listForRef({
    owner: owner,
    repo: repo,
    ref: head_sha,
  });
  for (const run of checkRuns.data.check_runs) {
    console.log(`  ${run.name}: ${run.status}, ${run.conclusion}`);
  }
};
