import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UmsBadgeComponent, UmsEmptyStateComponent } from '@ums/design-system';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { CampaignsStore, isCampaignActive } from '../state/campaigns.store';

/**
 * ALMW-14: public, anonymous-friendly campaign browsing (SSR route, per `app.routes.server.ts`).
 * No progress bar is rendered -- see `donations.types.ts`'s FLAGGED GAP: `DonationCampaignDto`
 * carries no amount-raised/donor-count field at all, and requirement-spec.md §3.4/§8 are explicit
 * that a progress number must be "never an invented one." An honest inline note stands in.
 */
@Component({
  selector: 'alw-campaign-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsBadgeComponent, UmsEmptyStateComponent, TranslatePipe],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss',
})
export class CampaignListComponent {
  protected readonly store = inject(CampaignsStore);
  protected readonly isCampaignActive = isCampaignActive;

  constructor() {
    this.store.loadAll();
  }
}
