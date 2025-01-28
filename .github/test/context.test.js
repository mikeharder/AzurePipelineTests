import { describe, it } from 'vitest';

import { extractInputs } from '../src/context.js';

describe('context', () => {
  it('context', async () => {
    try {
      await extractInputs(null, null, null);
    }
    catch {
    }
  });
});
