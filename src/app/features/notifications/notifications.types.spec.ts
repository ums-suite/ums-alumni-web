import { mapChannel, mapDeliveryStatus, toNotificationItem } from './notifications.types';
import type { RawNotificationDeliveryAttemptDto } from './notifications.types';

describe('notification enum mapping', () => {
  it('maps every real channel ordinal to its name', () => {
    expect(mapChannel(0)).toBe('Email');
    expect(mapChannel(1)).toBe('Sms');
    expect(mapChannel(2)).toBe('WhatsApp');
    expect(mapChannel(3)).toBe('Push');
    expect(mapChannel(4)).toBe('InApp');
  });

  it('maps every real delivery-status ordinal to its name', () => {
    expect(mapDeliveryStatus(0)).toBe('Pending');
    expect(mapDeliveryStatus(3)).toBe('Delivered');
    expect(mapDeliveryStatus(5)).toBe('DeadLettered');
  });

  it('falls back gracefully on an unrecognized ordinal', () => {
    expect(mapChannel(99)).toBe('InApp');
    expect(mapDeliveryStatus(99)).toBe('Pending');
  });

  it('converts a raw wire DTO into an app-facing NotificationItem', () => {
    const raw: RawNotificationDeliveryAttemptDto = {
      id: 'n1',
      notificationRequestId: 'r1',
      channel: 3,
      status: 3,
      attemptCount: 1,
      deadLetterReason: null,
      lastError: null,
      deliveredAt: '2024-01-01T00:00:00Z',
      readAt: null,
      renderedSubject: 'Subject',
      renderedBody: 'Body',
      renderedDeepLink: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    expect(toNotificationItem(raw)).toEqual({
      id: 'n1',
      channel: 'Push',
      status: 'Delivered',
      readAt: null,
      renderedSubject: 'Subject',
      renderedBody: 'Body',
      renderedDeepLink: null,
      createdAt: '2024-01-01T00:00:00Z',
    });
  });
});
