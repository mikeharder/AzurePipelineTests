// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  if (
    context.eventName === 'check_suite' &&
    context.payload.action == 'completed'
  ) {
    const payload =
      /** @type {import("@octokit/webhooks-types").CheckSuiteCompletedEvent} */ (
        context.payload
      );

    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;

    const checkSuites = await github.rest.checks.listSuitesForRef({
      owner: owner,
      repo: repo,
      ref: payload.check_suite.head_sha,
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
  }
};
