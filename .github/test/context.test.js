import { describe, it } from 'vitest';

const { extractInputs } = require('../src/context');

describe('context', () => {
  it('context', async () => {
    try {
      await extractInputs(null, null, null);
    }
    catch {
    }
  });
});
