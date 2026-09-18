import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UmsButtonComponent } from '@ums/design-system';
import { TokenStorageService } from '@ums/shared';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { CampaignsStore, isCampaignActive } from '../state/campaigns.store';

/**
 * ALMW-14: campaign landing page -- the real entry point into the donation flow
 * (requirement-spec.md §7 "Donation flow -- campaign landing"). Public/SSR; the "Donate" action
 * itself routes an unauthenticated visitor to login first (with a `returnUrl` back here), since
 * §1 requires an authenticated Alumnus session for the actual donation submission even though
 * browsing is anonymous-friendly.
 */
@Component({
  selector: 'alw-campaign-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UmsButtonComponent, TranslatePipe],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss',
})
export class CampaignDetailComponent {
  protected readonly store = inject(CampaignsStore);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly campaignId = this.route.snapshot.paramMap.get('campaignId') ?? '';

  protected readonly isActive = computed(() => {
    const campaign = this.store.selected();
    return !!campaign && isCampaignActive(campaign);
  });

  constructor() {
    this.store.loadOne(this.campaignId);
  }

  protected donate(): void {
    if (this.tokenStorage.isAuthenticated()) {
      void this.router.navigateByUrl(`/app/donations/new/${this.campaignId}`);
    } else {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/app/donations/new/${this.campaignId}` },
      });
    }
  }
}
