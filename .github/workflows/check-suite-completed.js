// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  let owner = process.env.OWNER || '';
  let repo = process.env.REPO || '';
  let head_sha = process.env.HEAD_SHA || '';

  if (context.eventName === 'check_suite') {
    const payload =
      /** @type {import("@octokit/webhooks-types").CheckSuiteCompletedEvent} */ (
        context.payload
      );

    owner = owner || payload.repository.owner.login;
    repo = repo || payload.repository.name;
    head_sha = head_sha || payload.check_suite.head_sha;
  }

  const checkSuites = await github.rest.checks.listSuitesForRef({
    owner: owner,
    repo: repo,
    ref: head_sha,
  });

  for (const suite of checkSuites.data.check_suites) {
    console.log(JSON.stringify(suite));

    const checkRuns = await github.rest.checks.listForSuite({
      owner: owner,
      repo: repo,
      check_suite_id: suite.id,
    });

    for (const run of checkRuns.data.check_runs) {
      console.log(JSON.stringify(run));
    }
  }
};
