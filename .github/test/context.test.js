import { describe, it } from 'vitest';

import { extractInputs } from '../src/context';

describe('context', () => {
  it('context', async () => {
    try {
      await extractInputs(null, null, null);
    }
    catch {
    }
  });
});
