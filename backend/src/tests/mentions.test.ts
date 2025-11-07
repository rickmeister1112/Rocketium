import { describe, expect, it } from 'vitest';

import { extractMentions } from '../utils/mentions';

describe('extractMentions', () => {
  it('collects unique mentions from text', () => {
    const result = extractMentions('Hello @alex and @jordan, ping @alex again');
    expect(result).toEqual(['alex', 'jordan']);
  });

  it('returns empty array when no mentions', () => {
    expect(extractMentions('No mentions here')).toEqual([]);
  });
});

