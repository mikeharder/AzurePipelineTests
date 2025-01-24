// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  let owner = process.env.OWNER || '';
  let repo = process.env.REPO || '';
  let issue_number = parseInt(process.env.ISSUE_NUMBER || '');
  let head_sha = process.env.HEAD_SHA || '';

  //#region Extract inputs from context
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
  //#endregion

  const labels = (
    await github.rest.issues.listLabelsOnIssue({
      owner: owner,
      repo: repo,
      issue_number: issue_number,
    })
  ).data.map((label) => label.name);

  const checkRuns = (
    await github.rest.checks.listForRef({
      owner: owner,
      repo: repo,
      ref: head_sha,
    })
  ).data.check_runs;

  //#region Log Labels, Check Suites, and Check Runs
  console.log('\n# Labels');
  for (const label of labels) {
    console.log(`  ${label}`);
  }

  console.log();
  console.log('# Check Runs');
  for (const run of checkRuns) {
    console.log(`  ${run.name}: ${run.status}, ${run.conclusion}`);
  }
  //#endregion

  const swaggerLintDiffSucceeded = checkRuns.some(
    (run) =>
      run.name === 'Swagger LintDiff' &&
      run.status === 'completed' &&
      run.conclusion === 'success',
  );

  const allLabelsMatch =
    labels.includes('ARMReview') &&
    !labels.includes('NotReadyForARMReview') &&
    labels.includes('ARMBestPractices') &&
    labels.includes('rp-service-existing') &&
    labels.includes('typespec-incremental') &&
    (!labels.includes('SuppressionReviewRequired') ||
      labels.includes('Suppression-Approved'));

  const armAutomatedSignOff = swaggerLintDiffSucceeded && allLabelsMatch;

  //#region Log ARMAutomatedSignOff
  console.log('\n# ARMAutomatedSignOff');
  console.log(`  result: ${armAutomatedSignOff}`);
  console.log(`  swaggerLintDiffSucceeded: ${swaggerLintDiffSucceeded}`);
  console.log('  labels:');
  console.log(`    ARMReview: ${labels.includes('ARMReview')}`);
  console.log(
    `    NotReadyForARMReview: ${labels.includes('NotReadyForARMReview')}`,
  );
  console.log(`    ARMBestPractices: ${labels.includes('ARMBestPractices')}`);
  console.log(
    `    rp-service-existing: ${labels.includes('rp-service-existing')}`,
  );
  console.log(
    `    typespec-incremental: ${labels.includes('typespec-incremental')}`,
  );
  console.log(
    `    SuppressionReviewRequired: ${labels.includes('SuppressionReviewRequired')}`,
  );
  console.log(
    `    Suppression-Approved: ${labels.includes('Suppression-Approved')}`,
  );
  //#endregion

  if (armAutomatedSignOff) {
    await github.rest.issues.addLabels({
      repo: repo,
      owner: owner,
      issue_number: issue_number,
      labels: ['ARMAutomatedSignOff'],
    });
  } else {
    try {
      await github.rest.issues.removeLabel({
        owner: owner,
        repo: repo,
        issue_number: issue_number,
        name: 'ARMAutomatedSignOff',
      });
    } catch (error) {
      if (error.status === 404) {
        core.info(`Ignoring error: ${error.status} - ${error.message}`);
      } else {
        throw error;
      }
    }
  }
};
