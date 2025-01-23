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

    const checkRuns = await github.rest.checks.listForSuite({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      check_suite_id: payload.check_suite.id,
    });

    for (const run of checkRuns.data.check_runs) {
      console.log(JSON.stringify(run));
    }
  }
};
