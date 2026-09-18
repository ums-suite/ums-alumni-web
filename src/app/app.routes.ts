import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { alumnusLinkedGuard } from './core/auth/alumnus-linked.guard';

/**
 * ALMW-6: routing shell -- public SSR route group (root-level routes, rendered per
 * `app.routes.server.ts`'s `RenderMode.Server`) vs. the authenticated CSR shell (`/app/**`,
 * `RenderMode.Client`). Feature routes are added here incrementally as each ticket lands (see
 * `ComingSoonComponent` placeholders below, replaced one at a time); see `app.routes.server.ts`
 * for the matching render-mode split.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/public-home.component').then((m) => m.PublicHomeComponent),
  },
  {
    path: 'campaigns',
    loadComponent: () =>
      import('./features/donations/campaigns/campaign-list.component').then(
        (m) => m.CampaignListComponent,
      ),
  },
  {
    path: 'campaigns/:campaignId',
    loadComponent: () =>
      import('./features/donations/campaigns/campaign-detail.component').then(
        (m) => m.CampaignDetailComponent,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/registration/registration-link.component').then(
        (m) => m.RegistrationLinkComponent,
      ),
  },
  {
    path: 'register/recovery',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/registration/registration-recovery.component').then(
        (m) => m.RegistrationRecoveryComponent,
      ),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'directory' },
      {
        path: 'directory',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/directory/directory-search.component').then(
            (m) => m.DirectorySearchComponent,
          ),
      },
      {
        path: 'profile',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/profile/edit/profile-edit.component').then(
            (m) => m.ProfileEditComponent,
          ),
      },
      {
        path: 'jobs',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/jobs/postings/job-list.component').then((m) => m.JobListComponent),
      },
      {
        path: 'jobs/new',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/jobs/postings/job-editor.component').then((m) => m.JobEditorComponent),
      },
      {
        path: 'jobs/mine/applications',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/jobs/applications/my-applications.component').then(
            (m) => m.MyApplicationsComponent,
          ),
      },
      {
        path: 'jobs/:jobId/edit',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/jobs/postings/job-editor.component').then((m) => m.JobEditorComponent),
      },
      {
        path: 'jobs/:jobId',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/jobs/postings/job-detail.component').then((m) => m.JobDetailComponent),
      },
      {
        path: 'donations',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/donations/history/donation-history.component').then(
            (m) => m.DonationHistoryComponent,
          ),
      },
      {
        path: 'mentorship',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/mentorship/browse/mentorship-browse.component').then(
            (m) => m.MentorshipBrowseComponent,
          ),
      },
      {
        path: 'events',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/events/calendar/events-calendar.component').then(
            (m) => m.EventsCalendarComponent,
          ),
      },
      {
        path: 'events/:alumniEventId/rsvp',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/events/rsvp/event-rsvp.component').then((m) => m.EventRsvpComponent),
      },
      {
        path: 'events/:alumniEventId/recap',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/events/post-event/post-event-recap.component').then(
            (m) => m.PostEventRecapComponent,
          ),
      },
      {
        path: 'chapters',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/chapters/list/chapter-list.component').then(
            (m) => m.ChapterListComponent,
          ),
      },
      {
        path: 'chapters/:chapterId',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/chapters/detail/chapter-detail.component').then(
            (m) => m.ChapterDetailComponent,
          ),
      },
      {
        path: 'donations/new/:campaignId',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/donations/payment/donation-amount.component').then(
            (m) => m.DonationAmountComponent,
          ),
      },
      {
        path: 'donations/:donationId/confirming',
        canActivate: [alumnusLinkedGuard],
        loadComponent: () =>
          import('./features/donations/payment/donation-confirming.component').then(
            (m) => m.DonationConfirmingComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/ui/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
