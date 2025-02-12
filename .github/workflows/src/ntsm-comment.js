// @ts-check

import { extractInputs } from '../../src/context.js';

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async function ntsmComment({ github, context, core }) {
  let { repo, owner, head_sha } = await extractInputs(github, context, core);

  const workflowRuns = await github.rest.actions.listWorkflowRunsForRepo({
    repo,
    owner,
    event: 'pull_request',
    status: 'completed',
    per_page: 100,
    head_sha,
  });

  console.log('Workflow Runs:');
  workflowRuns.data.workflow_runs.forEach((wf) => {
    console.log(`- ${wf.name}: ${wf.conclusion || wf.status}`);
    console.log(JSON.stringify(wf));
  });

  // Get all check runs for the PR
  const checkRuns = await github.rest.checks.listForRef({
    owner,
    repo,
    ref: head_sha,
  });

  console.log('Check Runs:');
  checkRuns.data.check_runs.forEach((check) => {
    console.log(`- ${check.name}: ${check.conclusion || check.status}`);
    console.log(JSON.stringify(check));
  });
}
