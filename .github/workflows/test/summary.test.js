import { test } from 'vitest';
import summary from '../summary';

test('hello', async ({ expect }) => {
  expect(0).toBe(0);
});

test('null', async ({ expect }) => {
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

  await summary({ github: null, context: context, core: null });
});
