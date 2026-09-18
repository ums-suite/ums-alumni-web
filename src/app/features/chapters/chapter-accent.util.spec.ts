import { chapterAccentIndex } from './chapter-accent.util';

describe('chapterAccentIndex', () => {
  it('is deterministic for the same id', () => {
    expect(chapterAccentIndex('chapter-1')).toBe(chapterAccentIndex('chapter-1'));
  });

  it('stays within the accent palette bounds', () => {
    for (const id of ['a', 'b', 'chapter-abc', '00000000-0000-0000-0000-000000000000']) {
      const index = chapterAccentIndex(id);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(4);
    }
  });

  it('varies across different ids', () => {
    const indices = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(chapterAccentIndex));
    expect(indices.size).toBeGreaterThan(1);
  });
});
