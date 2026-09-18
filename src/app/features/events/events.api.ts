import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type {
  AlumniEventDto,
  ContentEventFilterParams,
  ContentEventListPage,
  RsvpDto,
  SubmitRsvpRequest,
} from './events.types';

/**
 * `UMS.Modules.Content.Api.Endpoints.EventEndpoints` (`/api/v1/content/events`) and
 * `UMS.Modules.Alumni.Api.Endpoints.AlumniEventEndpoints` (`/api/v1/alumni/events`) -- confirmed
 * real routes. See `events.types.ts` for why these are two separate, uncrossed-referenced APIs.
 */
@Injectable({ providedIn: 'root' })
export class EventsApi extends AlumniApiBase {
  listCalendar(filter: ContentEventFilterParams): Observable<ContentEventListPage> {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.audience) params = params.set('audience', filter.audience);
    if (filter.skip != null) params = params.set('skip', filter.skip);
    if (filter.take != null) params = params.set('take', filter.take);

    return this.normalizeErrors(
      this.http.get<ContentEventListPage>(this.apiUrl('content/events/'), { params }),
    );
  }

  getAlumniEvent(id: string): Observable<AlumniEventDto> {
    return this.normalizeErrors(this.http.get<AlumniEventDto>(this.apiUrl(`alumni/events/${id}`)));
  }

  submitRsvp(id: string, request: SubmitRsvpRequest): Observable<RsvpDto> {
    return this.normalizeErrors(
      this.http.post<RsvpDto>(this.apiUrl(`alumni/events/${id}/rsvp`), request),
    );
  }
}
