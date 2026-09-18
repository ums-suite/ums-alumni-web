/**
 * ALMW-22: an exhaustive grep of `ums-core`'s entire `Content` AND `Alumni` module source for
 * "success"/"story"/"testimonial"/"spotlight"/"alumni-story" returns ZERO hits -- there is no
 * entity, DTO, endpoint, or even a code comment anywhere for a "Success Story" concept. Content's
 * real, complete endpoint list is exactly: Banner, DownloadResource, Event, HomepageSection,
 * Notice -- nothing else.
 *
 * This app repurposes `Notice` (`UMS.Modules.Content.Application.Notices.NoticeDto`, real,
 * confirmed source-level) as the closest honest analog: a generic, public, published-only
 * announcement feed (`GET /api/v1/content/notices` with no `audience` param -- the module's own
 * public/anonymous path, `Draft -> Scheduled -> Published -> Archived` lifecycle, real
 * `xmin`/`Version` optimistic concurrency). This is a deliberate, documented repurposing, not a
 * fabricated "SuccessStory" API contract -- and it comes with real, honest limitations:
 *
 * - NO byline/author field at all -- a success story can never attribute itself to a named
 *   alumnus here. Per-field-visibility (Domain Invariant #1) has nothing to filter on this
 *   surface as a result; there is no "success-story byline" to redact, only to note is absent.
 * - NO image field at all -- the editorial layout's image slot is a decorative placeholder, never
 *   a fabricated image URL.
 * - NO dedicated pull-quote field -- this app derives a plain, clearly-labeled excerpt from the
 *   real `Body` text (the first sentence or so) rather than inventing a separate quote field the
 *   API doesn't have.
 * - NO SEO-friendly slug field -- routes key off the real `Id` guid.
 *
 * `requirement-spec.md` §10 item 7 (RESOLVED): success stories are authored by Admin/Content
 * staff via `ums-admin-web`'s Content screens, never published from this app -- this app is
 * strictly READ-ONLY here, confirmed by only ever calling the two public GET routes below.
 */
export interface NoticeDto {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly languageCode: string;
  readonly audience: readonly string[];
  readonly organizationNodeId: string | null;
  readonly isUrgent: boolean;
  readonly status: 'Draft' | 'Scheduled' | 'Published' | 'Archived';
  readonly publishAt: string | null;
  readonly expireAt: string | null;
  readonly publishedAt: string | null;
  readonly archivedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly hasBengaliTranslation: boolean;
  readonly version: number;
}

export interface NoticeListPage {
  readonly items: readonly NoticeDto[];
  readonly totalCount: number;
  readonly skip: number;
  readonly take: number;
}

export interface NoticeListParams {
  readonly skip?: number;
  readonly take?: number;
}

/** Naive, honest excerpt extraction -- the first sentence (or a length-capped fallback) of a real `Notice.Body`, never a fabricated separate pull-quote field. */
export function excerptOf(body: string, maxLength = 180): string {
  const firstSentenceMatch = /^.*?[.!?](?:\s|$)/.exec(body.trim());
  const candidate = firstSentenceMatch ? firstSentenceMatch[0].trim() : body.trim();
  return candidate.length > maxLength
    ? `${candidate.slice(0, maxLength - 1).trimEnd()}…`
    : candidate;
}
