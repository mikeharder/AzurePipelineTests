import { test } from 'vitest';
import summary from '../summary';

test('hello', async ({ expect }) => {
  expect(0).toBe(0);
});

test('mock', async ({ expect }) => {
  const github = {
    rest: {
      issues: {
        listLabelsOnIssue: () =>
          Promise.resolve({
            data: [{ name: 'TestLabel' }],
          }),
        removeLabel: () => Promise.resolve(),
      },
    },
  };

  const context = {
    eventName: 'check_suite',
    payload: {
      repository: {
        name: 'TestRepoName',
        owner: {
          login: 'TestRepoOwnerLogin',
        },
      },
      check_suite: {
        head_sha: 'abc123',
        pull_requests: [
          {
            number: 123,
          },
        ],
      },
    },
  };

  await summary({ github: github, context: context, core: null });
});
