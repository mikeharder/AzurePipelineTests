import { describe, expect, it, vi } from 'vitest';
import summary from '../src/summary';

describe('summary', () => {
  it('loads inputs from env', async () => {
    const github = createMockGithub();
    const core = createMockCore();

    try {
      process.env.OWNER = 'TestRepoOwnerLoginEnv';
      process.env.REPO = 'TestRepoNameEnv';
      process.env.ISSUE_NUMBER = '123';
      process.env.HEAD_SHA = 'abc123';

      await summary({
        github,
        context: null,
        core,
      });
    } finally {
      delete process.env.OWNER;
      delete process.env.REPO;
      delete process.env.ISSUE_NUMBER;
      delete process.env.HEAD_SHA;
    }

    expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
      owner: 'TestRepoOwnerLoginEnv',
      repo: 'TestRepoNameEnv',
      issue_number: 123,
      name: 'ARMAutomatedSignOff',
    });
  });

  describe('removes label if labels not match', () => {
    it.each([
      ['check_suite', createMockContextCheckSuite()],
      ['pull_request', createMockContextPullRequest()],
    ])('%s', async (_, context) => {
      const github = createMockGithub();
      const core = createMockCore();

      await summary({ github, context, core });

      expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: 123,
        name: 'ARMAutomatedSignOff',
      });
    });
  });

  describe('adds and removes label based on check status', () => {
    it.each([
      ['check_suite', createMockContextCheckSuite()],
      ['pull_request', createMockContextPullRequest()],
    ])('%s', async (_, context) => {
      const github = createMockGithub();
      github.rest.issues.listLabelsOnIssue.mockResolvedValue({
        data: [
          { name: 'ARMReview' },
          { name: 'ARMBestPractices' },
          { name: 'rp-service-existing' },
          { name: 'typespec-incremental' },
          { name: 'SuppressionReviewRequired' },
          { name: 'Suppression-Approved' },
        ],
      });

      const core = createMockCore();

      // Before check starts running
      await summary({ github, context, core });
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toBeCalledTimes(0);

      // Check in-progress
      github.rest.checks.listForRef.mockResolvedValue({
        data: {
          check_runs: [
            {
              name: 'Swagger LintDiff',
              status: 'in_progress',
              conclusion: null,
            },
          ],
        },
      });
      await summary({ github, context, core });
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toBeCalledTimes(0);

      // Check completed with success
      github.rest.checks.listForRef.mockResolvedValue({
        data: {
          check_runs: [
            {
              name: 'Swagger LintDiff',
              status: 'completed',
              conclusion: 'success',
            },
          ],
        },
      });
      await summary({ github, context, core });
      expect(github.rest.issues.addLabels).toHaveBeenCalledWith({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: 123,
        labels: ['ARMAutomatedSignOff'],
      });
      expect(github.rest.issues.removeLabel).toBeCalledTimes(0);

      // Check completed with failure
      github.rest.issues.addLabels.mockReset();
      github.rest.issues.removeLabel.mockReset();
      github.rest.checks.listForRef.mockResolvedValue({
        data: {
          check_runs: [
            {
              name: 'Swagger LintDiff',
              status: 'completed',
              conclusion: 'failure',
            },
          ],
        },
      });
      await summary({ github, context, core });
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: 123,
        name: 'ARMAutomatedSignOff',
      });

      // Ignore 404 from removeLabel()
      github.rest.issues.addLabels.mockReset();
      github.rest.issues.removeLabel.mockReset();
      github.rest.issues.removeLabel.mockRejectedValue({ status: 404 });
      await summary({ github, context, core });
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: 123,
        name: 'ARMAutomatedSignOff',
      });

      // Throw if other error from removeLabel()
      github.rest.issues.addLabels.mockReset();
      github.rest.issues.removeLabel.mockReset();
      github.rest.issues.removeLabel.mockRejectedValue({ status: 500 });
      await expect(summary({ github, context, core })).rejects.toThrow();
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: 123,
        name: 'ARMAutomatedSignOff',
      });

      // Invalid: multiple check runs named "Swagger LintDiff"
      github.rest.issues.addLabels.mockReset();
      github.rest.issues.removeLabel.mockReset();
      github.rest.checks.listForRef.mockResolvedValue({
        data: {
          check_runs: [
            {
              name: 'Swagger LintDiff',
              status: 'completed',
              conclusion: 'success',
            },
            {
              name: 'Swagger LintDiff',
              status: 'completed',
              conclusion: 'failure',
            },
          ],
        },
      });

      await expect(summary({ github, context, core })).rejects.toThrow();
      expect(github.rest.issues.addLabels).toBeCalledTimes(0);
      expect(github.rest.issues.removeLabel).toBeCalledTimes(0);
    });
  });
});

function createMockGithub() {
  return {
    rest: {
      checks: {
        listForRef: vi.fn().mockResolvedValue({
          data: {
            check_runs: [],
          },
        }),
      },
      issues: {
        addLabels: vi.fn().mockResolvedValue(),
        listLabelsOnIssue: vi.fn().mockResolvedValue({
          data: [],
        }),
        removeLabel: vi.fn().mockResolvedValue(),
      },
    },
  };
}

function createMockContextCheckSuite() {
  return {
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
}

function createMockContextPullRequest() {
  return {
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
}

function createMockCore() {
  return {
    info: vi.fn(),
  };
}
