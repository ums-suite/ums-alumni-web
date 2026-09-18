/**
 * Hand-typed against the real `ums-core` source (`UMS.Modules.Alumni.Api.Endpoints.
 * ChapterEndpoints`, `Application.Chapters.ChapterDto`, `Domain.Chapters.AlumniChapter`) --
 * confirmed directly, not guessed.
 *
 * FLAGGED GAP #1 (`requirement-spec.md` §3.6 "their own event/news feed"): there is no
 * chapter-scoped news/content relationship anywhere, and no way to list `AlumniEvent`s by
 * `ChapterId` -- `AlumniEvent.ChapterId` is a real, optional field (confirmed source-level), but
 * `AlumniEventEndpoints` has no list endpoint at all (see `events.types.ts`), so this app cannot
 * enumerate a chapter's events even though the data model supports the relationship in principle.
 * A chapter detail page therefore cannot show a real event feed yet; it says so plainly rather
 * than rendering an empty list that looks like "this chapter has no events."
 *
 * FLAGGED GAP #2 (`requirement-spec.md` §7/§10 item 3, "themed banner/accent within the single
 * brand"): `ChapterDto` has no color/banner field at all (confirmed by grep). The themed accent
 * this app applies is therefore a client-side-only visual treatment derived deterministically
 * from the chapter's own id (a stable hash into the shared design-system accent palette) -- never
 * a fabricated backend field, and never a full per-chapter re-skin (out of scope, §10 item 3).
 *
 * `ChapterDto` also carries no per-caller "am I a member" flag -- this app tracks the caller's own
 * join/leave actions locally for the current session (both actions are real and idempotent
 * server-side) rather than inventing a membership-status field the API doesn't return.
 */
export interface ChapterDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly region: string | null;
  readonly memberCount: number;
  readonly createdAt: string;
}

export interface ChapterListParams {
  readonly skip?: number;
  readonly take?: number;
}
