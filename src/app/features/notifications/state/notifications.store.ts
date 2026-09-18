import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { tap } from 'rxjs';
import { NotificationsApi } from '../notifications.api';
import type { NotificationItem } from '../notifications.types';

interface NotificationsState {
  readonly items: readonly NotificationItem[];
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

/** ALMW-23: feature-scoped signal store for the in-app notification center. */
export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationsState>(initialState),
  withMethods((store, api = inject(NotificationsApi)) => ({
    load(): void {
      patchState(store, { isLoading: true, error: null });
      api.list(0, 50).subscribe({
        next: (items) => patchState(store, { items, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
      api.unreadCount().subscribe({ next: (unreadCount) => patchState(store, { unreadCount }) });
    },
  })),
  withMethods((store, api = inject(NotificationsApi)) => ({
    markRead: (id: string) =>
      api.markRead(id).pipe(
        tap(() => {
          const wasUnread = store.items().find((item) => item.id === id)?.readAt == null;
          patchState(store, {
            items: store
              .items()
              .map((item) =>
                item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
              ),
            unreadCount: wasUnread ? Math.max(0, store.unreadCount() - 1) : store.unreadCount(),
          });
        }),
      ),

    markAllRead: () =>
      api.markAllRead().pipe(
        tap(() => {
          const now = new Date().toISOString();
          patchState(store, {
            items: store.items().map((item) => (item.readAt ? item : { ...item, readAt: now })),
            unreadCount: 0,
          });
        }),
      ),
  })),
);
