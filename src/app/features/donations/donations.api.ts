import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumniApiBase } from '../../core/http/alumni-api.base';
import type {
  DonationCampaignDto,
  DonationCampaignPage,
  DonationDto,
  InitiateDonationRequest,
} from './donations.types';

/** `UMS.Modules.Alumni.Api.Endpoints.DonationEndpoints` -- confirmed real routes. */
@Injectable({ providedIn: 'root' })
export class DonationsApi extends AlumniApiBase {
  listCampaigns(skip = 0, take = 50): Observable<DonationCampaignPage> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.normalizeErrors(
      this.http.get<DonationCampaignPage>(this.apiUrl('alumni/donation-campaigns/'), { params }),
    );
  }

  getCampaign(id: string): Observable<DonationCampaignDto> {
    return this.normalizeErrors(
      this.http.get<DonationCampaignDto>(this.apiUrl(`alumni/donation-campaigns/${id}`)),
    );
  }

  initiateDonation(request: InitiateDonationRequest): Observable<DonationDto> {
    return this.normalizeErrors(
      this.http.post<DonationDto>(this.apiUrl('alumni/donations/'), request),
    );
  }

  getDonation(id: string): Observable<DonationDto> {
    return this.normalizeErrors(this.http.get<DonationDto>(this.apiUrl(`alumni/donations/${id}`)));
  }

  myDonations(): Observable<readonly DonationDto[]> {
    return this.normalizeErrors(
      this.http.get<readonly DonationDto[]>(this.apiUrl('alumni/donations/')),
    );
  }

  cancelRecurring(id: string): Observable<DonationDto> {
    return this.normalizeErrors(
      this.http.post<DonationDto>(this.apiUrl(`alumni/donations/${id}/cancel-recurring`), {}),
    );
  }

  resumeRecurring(id: string): Observable<DonationDto> {
    return this.normalizeErrors(
      this.http.post<DonationDto>(this.apiUrl(`alumni/donations/${id}/resume-recurring`), {}),
    );
  }
}
