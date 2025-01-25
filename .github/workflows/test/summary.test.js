import { describe, it, vi } from 'vitest';
import summary from '../src/summary';

describe('summary', () => {
  it('removes ArmAutoSignOff if labels do not match', async ({ expect }) => {
    const github = {
      rest: {
        issues: {
          listLabelsOnIssue: vi.fn().mockResolvedValue({
            data: [{ name: 'TestLabel' }],
          }),
          removeLabel: vi.fn().mockResolvedValue(),
        },
      },
    };

    const context = {
      eventName: 'pull_request',
      payload: {
        repository: {
          name: 'TestRepoName',
          owner: {
            login: 'TestRepoOwnerLogin',
          },
        },
        pull_request: {
          head: {
            sha: 'abc123',
          },
          number: 123,
        },
      },
    };

    await summary({ github, context, core: undefined });

    expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.pull_request.number,
      name: 'ARMAutomatedSignOff',
    });
  });
});
