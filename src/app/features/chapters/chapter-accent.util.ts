/**
 * `chapters.types.ts` flagged gap #2: `ChapterDto` has no banner/accent field at all -- this
 * derives a stable, deterministic accent index from the chapter's own id so each chapter reads as
 * visually distinct (a themed accent) without a per-chapter re-skin (out of scope, §10 item 3) or
 * a fabricated backend color field. Pure and easy to unit test in isolation from any component.
 */
const ACCENT_COUNT = 4;

export function chapterAccentIndex(chapterId: string): number {
  let hash = 0;
  for (let i = 0; i < chapterId.length; i++) {
    hash = (hash * 31 + chapterId.charCodeAt(i)) >>> 0;
  }
  return hash % ACCENT_COUNT;
}
