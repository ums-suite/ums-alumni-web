/**
 * Hand-typed against the real `ums-core` source -- confirmed directly, not guessed. TWO separate,
 * unrelated "event" concepts back this ticket, and this app deliberately does not conflate them:
 *
 * - `UMS.Modules.Content.Api.Endpoints.EventEndpoints` (`ContentEventDto` below) -- the real,
 *   anonymous, filterable, PAGINATED calendar data source (`GET /api/v1/content/events`). This is
 *   what actually backs a browsable "event calendar."
 * - `UMS.Modules.Alumni.Api.Endpoints.AlumniEventEndpoints` (`AlumniEventDto`/`RsvpDto` below) --
 *   a separate, lightweight Alumni-owned RSVP wrapper. Confirmed source-level: `GET
 *   /{id:guid}` is the ONLY read endpoint (no list at all), and `POST /{id}/rsvp` is a plain
 *   Going/Interested/NotGoing + guest-count upsert with an explicit code comment reading "no
 *   seating/capacity enforcement in v1" -- there is no `capacity`/`waitlist` field anywhere on
 *   `AlumniEvent`.
 *
 * FLAGGED GAP #1 (capacity-aware waitlist, `requirement-spec.md` §3.6/§9): does not exist
 * server-side at all, confirmed by the backend's own code comment. This app never fabricates a
 * client-side capacity count or waitlist queue implying an enforcement mechanism that isn't
 * real -- an RSVP is always either accepted or rejected on validation grounds, never queued.
 *
 * FLAGGED GAP #2 (no cross-reference from a Content Event to its optional `AlumniEvent`
 * wrapper): `AlumniEvent.ContentEventId` is a one-way, OPTIONAL pointer FROM `AlumniEvent` TO a
 * Content `Event` -- `ContentEventDto` carries no reverse `alumniEventId` field, and
 * `AlumniEvent` has no list endpoint to search by `ContentEventId` either. This app therefore
 * cannot offer "RSVP" as a click-through from a browsed calendar entry -- the calendar (browse
 * screen) and RSVP (by a known `AlumniEvent` id, e.g. from a notification link) are two
 * genuinely separate screens here, not two views of the same data.
 */
export interface ContentEventDto {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly locationLabel: string | null;
  readonly languageCode: string;
  readonly audience: readonly string[];
  readonly organizationNodeId: string | null;
  readonly startAt: string;
  readonly endAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface ContentEventListPage {
  readonly items: readonly ContentEventDto[];
  readonly totalCount: number;
  readonly skip: number;
  readonly take: number;
}

export interface ContentEventFilterParams {
  readonly from?: string;
  readonly to?: string;
  readonly audience?: string;
  readonly skip?: number;
  readonly take?: number;
}

export type RsvpResponse = 'Going' | 'Interested' | 'NotGoing';

export interface AlumniEventDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly chapterId: string | null;
  readonly contentEventId: string | null;
  readonly eventDate: string;
  readonly createdAt: string;
}

export interface RsvpDto {
  readonly id: string;
  readonly eventId: string;
  readonly alumnusId: string;
  readonly response: RsvpResponse;
  readonly guestCount: number;
  readonly respondedAt: string;
}

export interface SubmitRsvpRequest {
  readonly response: RsvpResponse;
  readonly guestCount: number;
}
