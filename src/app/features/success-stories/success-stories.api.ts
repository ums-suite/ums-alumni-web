import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type { NoticeDto, NoticeListPage, NoticeListParams } from './success-stories.types';

/**
 * `UMS.Modules.Content.Api.Endpoints.NoticeEndpoints` -- confirmed real, public, anonymous routes
 * under `/api/v1/content/notices`. This app only ever calls the two read (`GET`) routes -- see
 * `success-stories.types.ts` for why `Notice` is being repurposed here and why this is read-only.
 */
@Injectable({ providedIn: 'root' })
export class SuccessStoriesApi extends AlumniApiBase {
  listPublished(filter: NoticeListParams): Observable<NoticeListPage> {
    let params = new HttpParams();
    if (filter.skip != null) params = params.set('skip', filter.skip);
    if (filter.take != null) params = params.set('take', filter.take);

    return this.normalizeErrors(
      this.http.get<NoticeListPage>(this.apiUrl('content/notices/'), { params }),
    );
  }

  getById(id: string): Observable<NoticeDto> {
    return this.normalizeErrors(this.http.get<NoticeDto>(this.apiUrl(`content/notices/${id}`)));
  }
}
