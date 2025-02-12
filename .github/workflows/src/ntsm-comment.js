// @ts-check

import { extractInputs } from '../../src/context.js';

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async function ntsmComment({ github, context, core }) {
  let inputs = await extractInputs(github, context, core);

  // Get all check runs for the PR
  const checkRuns = await github.rest.checks.listForRef({
    owner: inputs.owner,
    repo: inputs.repo,
    ref: inputs.head_sha,
  });

  console.log('Check Runs:');
  checkRuns.data.check_runs.forEach((check) => {
    console.log(`- ${check.name}: ${check.conclusion || check.status}`);
    console.log(JSON.stringify(check));
  });
}
