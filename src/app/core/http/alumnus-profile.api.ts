import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from './alumni-api.base';
import type {
  AlumniDirectoryFilterParams,
  AlumniDirectoryPage,
  AlumnusDto,
  UpdateOwnProfileRequest,
} from './alumnus-profile.types';

/**
 * `UMS.Modules.Alumni.Api.Endpoints.AlumnusEndpoints` -- confirmed real routes:
 * `GET/PUT /api/v1/alumni/profile`, `GET /api/v1/alumni/directory`.
 *
 * Lives in `core/http/` (not a feature module) because both the profile-edit feature (ALMW-8)
 * and the cross-cutting `AlumnusContextService` (ALMW-4's Alumni-scoped session boundary) need
 * the exact same "does my session resolve to an Alumnus" call.
 */
@Injectable({ providedIn: 'root' })
export class AlumnusProfileApi extends AlumniApiBase {
  getMyProfile(): Observable<AlumnusDto> {
    return this.normalizeErrors(this.http.get<AlumnusDto>(this.apiUrl('alumni/profile')));
  }

  updateMyProfile(request: UpdateOwnProfileRequest): Observable<AlumnusDto> {
    return this.normalizeErrors(this.http.put<AlumnusDto>(this.apiUrl('alumni/profile'), request));
  }

  searchDirectory(filter: AlumniDirectoryFilterParams): Observable<AlumniDirectoryPage> {
    let params = new HttpParams();
    if (filter.graduationYear != null) params = params.set('graduationYear', filter.graduationYear);
    if (filter.programId) params = params.set('programId', filter.programId);
    if (filter.departmentId) params = params.set('departmentId', filter.departmentId);
    if (filter.chapterId) params = params.set('chapterId', filter.chapterId);
    if (filter.employer) params = params.set('employer', filter.employer);
    if (filter.location) params = params.set('location', filter.location);
    if (filter.skip != null) params = params.set('skip', filter.skip);
    if (filter.take != null) params = params.set('take', filter.take);

    return this.normalizeErrors(
      this.http.get<AlumniDirectoryPage>(this.apiUrl('alumni/directory'), { params }),
    );
  }
}
