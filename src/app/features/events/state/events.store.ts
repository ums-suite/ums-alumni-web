import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { toUmsApiError } from '@ums/shared';
import { tap } from 'rxjs';
import { EventsApi } from '../events.api';
import type {
  AlumniEventDto,
  ContentEventDto,
  ContentEventFilterParams,
  RsvpDto,
  SubmitRsvpRequest,
} from '../events.types';

interface EventsState {
  readonly calendar: readonly ContentEventDto[];
  readonly totalCount: number;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectedEvent: AlumniEventDto | null;
  readonly myRsvp: RsvpDto | null;
  readonly rsvpError: string | null;
}

const initialState: EventsState = {
  calendar: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  selectedEvent: null,
  myRsvp: null,
  rsvpError: null,
};

/** ALMW-19: feature-scoped signal store for the Content-Events calendar browse + Alumni-Event RSVP screens. */
export const EventsStore = signalStore(
  { providedIn: 'root' },
  withState<EventsState>(initialState),
  withMethods((store, api = inject(EventsApi)) => ({
    loadCalendar(filter: ContentEventFilterParams): void {
      patchState(store, { isLoading: true, error: null });
      api.listCalendar(filter).subscribe({
        next: (page) =>
          patchState(store, {
            calendar: page.items,
            totalCount: page.totalCount,
            isLoading: false,
          }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },

    loadAlumniEvent(id: string): void {
      patchState(store, { isLoading: true, error: null, selectedEvent: null, myRsvp: null });
      api.getAlumniEvent(id).subscribe({
        next: (selectedEvent) => patchState(store, { selectedEvent, isLoading: false }),
        error: (error: unknown) =>
          patchState(store, { isLoading: false, error: toUmsApiError(error).message }),
      });
    },
  })),
  withMethods((store, api = inject(EventsApi)) => ({
    submitRsvp: (id: string, request: SubmitRsvpRequest) =>
      api
        .submitRsvp(id, request)
        .pipe(tap((myRsvp) => patchState(store, { myRsvp, rsvpError: null }))),
  })),
);
