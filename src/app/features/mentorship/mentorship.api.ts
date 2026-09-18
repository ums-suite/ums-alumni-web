import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type {
  EndMatchRequest,
  MentorshipMatchDto,
  MentorshipOptInDto,
  OptInRequest,
} from './mentorship.types';

/**
 * `UMS.Modules.Alumni.Api.Endpoints.MentorshipEndpoints` -- confirmed real routes under
 * `/api/v1/alumni/mentorship`. See `mentorship.types.ts` for the flagged gaps that shape which of
 * these this app actually calls (no browse/self-service-request/reject endpoint is used here --
 * `reject` is coordinator-only and out of this app's scope).
 */
@Injectable({ providedIn: 'root' })
export class MentorshipApi extends AlumniApiBase {
  optIn(request: OptInRequest): Observable<MentorshipOptInDto> {
    return this.normalizeErrors(
      this.http.post<MentorshipOptInDto>(this.apiUrl('alumni/mentorship/opt-in'), request),
    );
  }

  getMyMatches(): Observable<readonly MentorshipMatchDto[]> {
    return this.normalizeErrors(
      this.http.get<readonly MentorshipMatchDto[]>(this.apiUrl('alumni/mentorship/matches')),
    );
  }

  acceptMatch(id: string): Observable<MentorshipMatchDto> {
    return this.normalizeErrors(
      this.http.post<MentorshipMatchDto>(this.apiUrl(`alumni/mentorship/matches/${id}/accept`), {}),
    );
  }

  endMatch(id: string, request: EndMatchRequest): Observable<MentorshipMatchDto> {
    return this.normalizeErrors(
      this.http.post<MentorshipMatchDto>(
        this.apiUrl(`alumni/mentorship/matches/${id}/end`),
        request,
      ),
    );
  }
}
