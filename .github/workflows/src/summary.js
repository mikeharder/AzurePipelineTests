// @ts-check

import { extractInputs } from '../../src/context';

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
module.exports = async ({ github, context, core }) => {
  let owner = process.env.OWNER || '';
  let repo = process.env.REPO || '';
  let issue_number = parseInt(process.env.ISSUE_NUMBER || '');
  let head_sha = process.env.HEAD_SHA || '';

  if (!owner || !repo || !issue_number || !head_sha) {
    let inputs = await extractInputs(github, context, core);
    owner = owner || inputs.owner;
    repo = repo || inputs.repo;
    issue_number = issue_number || inputs.issue_number;
    head_sha = head_sha || inputs.head_sha;
  }

  const labels = (
    await github.rest.issues.listLabelsOnIssue({
      owner: owner,
      repo: repo,
      issue_number: issue_number,
    })
  ).data.map((label) => label.name);

  /** @type {boolean?} */
  // true: Add Label
  // false: Remove Label
  // null|undefined: No-op
  var addAutoSignOff = null;

  const allLabelsMatch =
    labels.includes('ARMReview') &&
    !labels.includes('NotReadyForARMReview') &&
    labels.includes('ARMBestPractices') &&
    labels.includes('rp-service-existing') &&
    labels.includes('typespec-incremental') &&
    (!labels.includes('SuppressionReviewRequired') ||
      labels.includes('Suppression-Approved'));

  if (allLabelsMatch) {
    const checkRuns = (
      await github.rest.checks.listForRef({
        owner: owner,
        repo: repo,
        ref: head_sha,
      })
    ).data.check_runs;

    const swaggerLintDiffs = checkRuns.filter(
      (run) => run.name === 'Swagger LintDiff',
    );

    if (swaggerLintDiffs.length > 1) {
      throw new Error(
        `Unexpected number of checks named 'Swagger LintDiff': ${swaggerLintDiffs.length}`,
      );
    }

    const swaggerLintDiff =
      swaggerLintDiffs.length == 1 ? swaggerLintDiffs[0] : undefined;

    if (swaggerLintDiff && swaggerLintDiff.status === 'completed') {
      addAutoSignOff = swaggerLintDiff.conclusion === 'success';
    }
  } else {
    addAutoSignOff = false;
  }

  if (addAutoSignOff === true) {
    core.info("Adding label 'ARMAutomatedSignOff'");
    await github.rest.issues.addLabels({
      repo: repo,
      owner: owner,
      issue_number: issue_number,
      labels: ['ARMAutomatedSignOff'],
    });
  } else if (addAutoSignOff === false) {
    try {
      core.info("Removing label 'ARMAutomatedSignOff'");
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
  } else {
    core.info('No-op');
  }
};
