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

  describe('extracts input from context', () => {
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

  describe('processes check status', () => {
    it.each([
      ["no check", [], 0, 0, null, false],
      ["in progress",
        [
          {
            name: 'Swagger LintDiff',
            status: 'in_progress',
            conclusion: null,
          }
        ], 0, 0, null, false
      ],
      ["success",
        [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'success',
          },
        ], 1, 0, null, false
      ],
      ["failure",
        [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ], 0, 1, null, false
      ],
      ["failure 404",
        [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ], 0, 1, 404, false
      ],
      ["failure 500",
        [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ], 0, 1, 500, true
      ],
      ["multiple check runs",
        [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'success',
          },
        ], 0, 0, null, true
      ]
    ])('%s', async (_, checkRuns, addLabelsCalled, removeLabelCalled, removeLabelErrorStatus, expectThrow) => {
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

      const context = createMockContextCheckSuite();
      const core = createMockCore();

      github.rest.checks.listForRef.mockResolvedValue({
        data: {
          check_runs: checkRuns,
        },
      });

      if (removeLabelErrorStatus) {
        github.rest.issues.removeLabel.mockRejectedValue({ status: removeLabelErrorStatus });
      }

      if (expectThrow) {
        await expect(summary({ github, context, core })).rejects.toThrow();
      }
      else {
        await summary({ github, context, core });
      }

      expect(github.rest.issues.addLabels).toBeCalledTimes(addLabelsCalled);
      expect(github.rest.issues.removeLabel).toBeCalledTimes(removeLabelCalled);
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
