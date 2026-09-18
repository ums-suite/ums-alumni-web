import { excerptOf } from './success-stories.types';

describe('excerptOf', () => {
  it('returns the first sentence when one is present', () => {
    expect(excerptOf('This is the first sentence. This is the second.')).toBe(
      'This is the first sentence.',
    );
  });

  it('falls back to the whole trimmed body when there is no sentence terminator', () => {
    expect(excerptOf('  no terminator here  ')).toBe('no terminator here');
  });

  it('truncates a long first sentence to maxLength with an ellipsis', () => {
    const long = `${'a'.repeat(300)}.`;
    const result = excerptOf(long, 50);
    expect(result.length).toBe(50);
    expect(result.endsWith('…')).toBe(true);
  });
});
