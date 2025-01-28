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
      {
        name: 'no checks',
        check_runs: [],
        addLabelsCalled: 0,
        removeLabelCalled: 0,
        removeLabelErrorStatus: null,
        expectThrow: false,
      },
      {
        name: 'in progress',
        check_runs: [
          {
            name: 'Swagger LintDiff',
            status: 'in_progress',
            conclusion: null,
          },
        ],
        addLabelsCalled: 0,
        removeLabelCalled: 0,
        removeLabelErrorStatus: null,
        expectThrow: false,
      },
      {
        name: 'success',
        check_runs: [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'success',
          },
        ],
        addLabelsCalled: 1,
        removeLabelCalled: 0,
        removeLabelErrorStatus: null,
        expectThrow: false,
      },
      {
        name: 'failure',
        check_runs: [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ],
        addLabelsCalled: 0,
        removeLabelCalled: 1,
        removeLabelErrorStatus: null,
        expectThrow: false,
      },
      {
        name: 'failure 404',
        check_runs: [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ],
        addLabelsCalled: 0,
        removeLabelCalled: 1,
        removeLabelErrorStatus: 404,
        expectThrow: false,
      },
      {
        name: 'failure 500',
        check_runs: [
          {
            name: 'Swagger LintDiff',
            status: 'completed',
            conclusion: 'failure',
          },
        ],
        addLabelsCalled: 0,
        removeLabelCalled: 1,
        removeLabelErrorStatus: 500,
        expectThrow: true,
      },
      {
        name: 'multiple check runs',
        check_runs: [
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
        ],
        addLabelsCalled: 0,
        removeLabelCalled: 0,
        removeLabelErrorStatus: null,
        expectThrow: true,
      },
    ])(
      '$name',
      async ({
        check_runs,
        addLabelsCalled,
        removeLabelCalled,
        removeLabelErrorStatus,
        expectThrow,
      }) => {
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
            check_runs: check_runs,
          },
        });

        if (removeLabelErrorStatus) {
          github.rest.issues.removeLabel.mockRejectedValue({
            status: removeLabelErrorStatus,
          });
        }

        if (expectThrow) {
          await expect(summary({ github, context, core })).rejects.toThrow();
        } else {
          await summary({ github, context, core });
        }

        expect(github.rest.issues.addLabels).toBeCalledTimes(addLabelsCalled);
        expect(github.rest.issues.removeLabel).toBeCalledTimes(
          removeLabelCalled,
        );
      },
    );
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
