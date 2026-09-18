/**
 * Hand-typed against the real `ums-core` source (`UMS.Modules.Notifications.Api.Endpoints.
 * NotificationCenterEndpoints`, `Application.Requests.NotificationDeliveryAttemptDto`) --
 * confirmed directly, not guessed.
 *
 * WIRE-FORMAT GOTCHA (confirmed source-level): `Channel`/`Status`/`DeadLetterReason` serialize as
 * RAW INTEGERS -- no `JsonStringEnumConverter` is configured anywhere in the Host. They must be
 * mapped to names client-side (`mapChannel`/`mapDeliveryStatus` below); rendering the raw ordinal
 * directly would show "3" instead of "Push" in the notification center.
 *
 * FLAGGED GAP (ALMW-23, opt-in email digest preferences): confirmed NOT to exist as an HTTP
 * endpoint anywhere -- `RecipientPreferenceService`/the preference aggregate exist only
 * internally, with the domain code's own comment stating self-service preference management is
 * out of this first-pass backend spec's literal scope. The category taxonomy that IS real
 * server-side (`Otp`/`SecurityAlert`/`Payment`/`Result`/`Transactional`/`Informational`, only
 * `Informational` opt-out-able) is also unrelated to this ticket's own domain categories (job
 * matches/event reminders/mentorship requests/campaign updates). The preferences screen is
 * therefore UI-only this sprint: it persists to this browser's own `localStorage` only (never
 * synced across devices, never actually consulted by `Notifications` module delivery) and says so
 * plainly rather than implying a real backend contract that doesn't exist.
 */
export type NotificationChannel = 'Email' | 'Sms' | 'WhatsApp' | 'Push' | 'InApp';
export type DeliveryAttemptStatus =
  'Pending' | 'InFlight' | 'Retrying' | 'Delivered' | 'Suppressed' | 'DeadLettered';

const CHANNEL_NAMES: readonly NotificationChannel[] = ['Email', 'Sms', 'WhatsApp', 'Push', 'InApp'];
const STATUS_NAMES: readonly DeliveryAttemptStatus[] = [
  'Pending',
  'InFlight',
  'Retrying',
  'Delivered',
  'Suppressed',
  'DeadLettered',
];

export function mapChannel(ordinal: number): NotificationChannel {
  return CHANNEL_NAMES[ordinal] ?? 'InApp';
}

export function mapDeliveryStatus(ordinal: number): DeliveryAttemptStatus {
  return STATUS_NAMES[ordinal] ?? 'Pending';
}

/** Raw wire shape -- `channel`/`status` are numbers straight off the JSON response, mapped by the API layer before this app's components ever see a `NotificationItem`. */
export interface RawNotificationDeliveryAttemptDto {
  readonly id: string;
  readonly notificationRequestId: string;
  readonly channel: number;
  readonly status: number;
  readonly attemptCount: number;
  readonly deadLetterReason: number | null;
  readonly lastError: string | null;
  readonly deliveredAt: string | null;
  readonly readAt: string | null;
  readonly renderedSubject: string | null;
  readonly renderedBody: string | null;
  readonly renderedDeepLink: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** App-facing shape, post-enum-mapping. */
export interface NotificationItem {
  readonly id: string;
  readonly channel: NotificationChannel;
  readonly status: DeliveryAttemptStatus;
  readonly readAt: string | null;
  readonly renderedSubject: string | null;
  readonly renderedBody: string | null;
  readonly renderedDeepLink: string | null;
  readonly createdAt: string;
}

export function toNotificationItem(raw: RawNotificationDeliveryAttemptDto): NotificationItem {
  return {
    id: raw.id,
    channel: mapChannel(raw.channel),
    status: mapDeliveryStatus(raw.status),
    readAt: raw.readAt,
    renderedSubject: raw.renderedSubject,
    renderedBody: raw.renderedBody,
    renderedDeepLink: raw.renderedDeepLink,
    createdAt: raw.createdAt,
  };
}

/** This app's own domain categories (requirement-spec.md §3.8) -- distinct from, and not mappable to, the real server-side `NotificationCategory` taxonomy (see the flagged gap above). */
export type DigestCategory =
  'jobMatches' | 'eventReminders' | 'mentorshipRequests' | 'campaignUpdates';

export interface DigestPreferences {
  readonly jobMatches: boolean;
  readonly eventReminders: boolean;
  readonly mentorshipRequests: boolean;
  readonly campaignUpdates: boolean;
}

export const DEFAULT_DIGEST_PREFERENCES: DigestPreferences = {
  jobMatches: true,
  eventReminders: true,
  mentorshipRequests: true,
  campaignUpdates: true,
};
