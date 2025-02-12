// @ts-check

import { extractInputs } from '../../src/context.js';

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async function ntsmComment({ github, context, core }) {
  let { repo, owner, head_sha } = await extractInputs(github, context, core);

  const workflowRuns = await github.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
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

  const helloRuns = workflowRuns.data.workflow_runs.filter(
    (wf) => wf.name == 'Hello World',
  );

  if (helloRuns.length == 0) {
    core.info("Found no runs for workflow 'Hello World'");
  } else if (helloRuns.length > 1) {
    throw `Unexpected number of runs for workflow 'Hello World': ${helloRuns.length}`;
  } else {
    const artifacts = await github.rest.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: helloRuns[0].id,
    });
    artifacts.data.artifacts.forEach((a) => core.info(`Artifact: ${a.name}`));
  }

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
