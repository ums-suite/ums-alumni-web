import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type {
  ApplyToJobRequest,
  EditJobPostingRequest,
  JobApplicationDto,
  JobListFilterParams,
  JobPostingDto,
  PostJobRequest,
  RemoveJobPostingRequest,
} from './jobs.types';

/** `UMS.Modules.Alumni.Api.Endpoints.JobEndpoints` -- confirmed real routes under `/api/v1/alumni/jobs`. */
@Injectable({ providedIn: 'root' })
export class JobsApi extends AlumniApiBase {
  list(filter: JobListFilterParams): Observable<readonly JobPostingDto[]> {
    let params = new HttpParams();
    if (filter.status) params = params.set('status', filter.status);
    if (filter.posterUserId) params = params.set('posterUserId', filter.posterUserId);
    if (filter.skip != null) params = params.set('skip', filter.skip);
    if (filter.take != null) params = params.set('take', filter.take);

    return this.normalizeErrors(
      this.http.get<readonly JobPostingDto[]>(this.apiUrl('alumni/jobs/'), { params }),
    );
  }

  getById(id: string): Observable<JobPostingDto> {
    return this.normalizeErrors(this.http.get<JobPostingDto>(this.apiUrl(`alumni/jobs/${id}`)));
  }

  create(request: PostJobRequest): Observable<JobPostingDto> {
    return this.normalizeErrors(
      this.http.post<JobPostingDto>(this.apiUrl('alumni/jobs/'), request),
    );
  }

  update(id: string, request: EditJobPostingRequest): Observable<JobPostingDto> {
    return this.normalizeErrors(
      this.http.patch<JobPostingDto>(this.apiUrl(`alumni/jobs/${id}`), request),
    );
  }

  remove(id: string, request: RemoveJobPostingRequest): Observable<void> {
    return this.normalizeErrors(
      this.http.delete(this.apiUrl(`alumni/jobs/${id}`), {
        body: request,
      }) as unknown as Observable<void>,
    );
  }

  apply(id: string, request: ApplyToJobRequest): Observable<JobApplicationDto> {
    return this.normalizeErrors(
      this.http.post<JobApplicationDto>(this.apiUrl(`alumni/jobs/${id}/apply`), request),
    );
  }
}
