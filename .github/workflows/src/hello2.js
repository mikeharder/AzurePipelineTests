// @ts-check

/**
 * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async function hello2({ github, context, core }) {
  core.summary.addRaw('Test Github Step Summary 2');
  core.summary.write();
}
