import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type { ChapterDto, ChapterListParams } from './chapters.types';

/** `UMS.Modules.Alumni.Api.Endpoints.ChapterEndpoints` -- confirmed real routes under `/api/v1/alumni/chapters`. */
@Injectable({ providedIn: 'root' })
export class ChaptersApi extends AlumniApiBase {
  list(filter: ChapterListParams): Observable<readonly ChapterDto[]> {
    let params = new HttpParams();
    if (filter.skip != null) params = params.set('skip', filter.skip);
    if (filter.take != null) params = params.set('take', filter.take);

    return this.normalizeErrors(
      this.http.get<readonly ChapterDto[]>(this.apiUrl('alumni/chapters/'), { params }),
    );
  }

  getById(id: string): Observable<ChapterDto> {
    return this.normalizeErrors(this.http.get<ChapterDto>(this.apiUrl(`alumni/chapters/${id}`)));
  }

  join(id: string): Observable<ChapterDto> {
    return this.normalizeErrors(
      this.http.post<ChapterDto>(this.apiUrl(`alumni/chapters/${id}/join`), {}),
    );
  }

  leave(id: string): Observable<ChapterDto> {
    return this.normalizeErrors(
      this.http.post<ChapterDto>(this.apiUrl(`alumni/chapters/${id}/leave`), {}),
    );
  }
}
