import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { MentorshipBrowseComponent } from './mentorship-browse.component';
import type { MentorshipMatchDto, MentorshipOptInDto } from '../mentorship.types';
import type { AlumnusDto } from '../../../core/http/alumnus-profile.types';

describe('MentorshipBrowseComponent', () => {
  let fixture: ComponentFixture<MentorshipBrowseComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const profile: AlumnusDto = {
    id: 'alum-1',
    studentIdRef: 'stu-1',
    graduationYear: 2020,
    programId: 'p1',
    departmentId: 'd1',
    profileVisibility: 'Public',
    currentEmployer: 'Acme',
    bio: null,
    location: null,
    contactEmail: 'me@example.com',
    contactPhone: '555-0100',
    hideCurrentEmployer: false,
    hideContactDetails: false,
    createdAt: '2024-01-01T00:00:00Z',
    version: 1,
  };

  const optIn: MentorshipOptInDto = {
    id: 'optin-1',
    personId: 'alum-1',
    role: 'Mentor',
    expertiseAreas: 'Software Engineering',
    capacityLimit: 3,
    activeCount: 1,
    availability: 'Weekends',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  };

  function proposedMatch(overrides: Partial<MentorshipMatchDto> = {}): MentorshipMatchDto {
    return {
      id: 'match-1',
      mentorAlumnusId: 'alum-1',
      menteeStudentId: 'stu-2',
      status: 'Proposed',
      proposedAt: '2024-05-01T00:00:00Z',
      mentorAcceptedAt: null,
      menteeAcceptedAt: null,
      activatedAt: null,
      endedAt: null,
      endedReason: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentorshipBrowseComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MentorshipBrowseComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushInit(matches: readonly MentorshipMatchDto[] = []): void {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.includes('/alumni/mentorship/matches')).flush(matches);
    httpMock.expectOne((r) => r.url.includes('/alumni/profile')).flush(profile);
    fixture.detectChanges();
  }

  it('shows an opt-in form when no mentor opt-in exists yet', () => {
    flushInit();
    expect(fixture.nativeElement.textContent).toContain('Areas of expertise');
  });

  it('submits an opt-in request and shows the resulting profile', () => {
    flushInit();
    fixture.componentInstance['expertiseAreas'].set('Software Engineering');
    fixture.componentInstance['capacityLimit'].set('3');
    fixture.componentInstance['submitOptIn']();

    httpMock.expectOne((r) => r.url.includes('/alumni/mentorship/opt-in')).flush(optIn);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Software Engineering');
  });

  it('shows a capacity-full message once active count reaches the limit', () => {
    flushInit();
    fixture.componentInstance['expertiseAreas'].set('Design');
    fixture.componentInstance['capacityLimit'].set('1');
    fixture.componentInstance['submitOptIn']();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/mentorship/opt-in'))
      .flush({ ...optIn, activeCount: 1, capacityLimit: 1 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('at capacity');
  });

  it('offers accept only for a Proposed match awaiting the mentor', () => {
    flushInit([proposedMatch()]);
    const button = fixture.nativeElement.querySelector('ums-button');
    expect(fixture.nativeElement.textContent).toContain('Proposed');
    expect(button).toBeTruthy();
  });

  it('never shows a contact-visibility preview for a Proposed match', () => {
    flushInit([proposedMatch()]);
    expect(fixture.nativeElement.textContent).not.toContain('me@example.com');
  });

  it('shows the mentor’s own visible contact channels once a match is Active', () => {
    flushInit([proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' })]);
    expect(fixture.nativeElement.textContent).toContain('me@example.com');
    expect(fixture.nativeElement.textContent).toContain('555-0100');
  });

  it('hides contact channels in the preview when the mentor has hidden them', () => {
    const hiddenProfile: AlumnusDto = { ...profile, hideContactDetails: true };
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/mentorship/matches'))
      .flush([proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' })]);
    httpMock.expectOne((r) => r.url.includes('/alumni/profile')).flush(hiddenProfile);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('me@example.com');
    expect(fixture.nativeElement.textContent).not.toContain('555-0100');
    expect(
      fixture.componentInstance['visibleContactPreview'](
        proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' }),
      ),
    ).toEqual({ email: null, phone: null });
  });

  it('accepts a proposed match via the accept action', () => {
    flushInit([proposedMatch()]);
    fixture.componentInstance['acceptMatch'](proposedMatch());
    const req = httpMock.expectOne((r) => r.url.includes('/matches/match-1/accept'));
    req.flush(proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' }));
    fixture.detectChanges();

    expect(fixture.componentInstance['store'].matches()[0].status).toBe('Active');
  });

  it('ends an active match via the end action', () => {
    flushInit([proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' })]);
    fixture.componentInstance['endMatch'](
      proposedMatch({ status: 'Active', mentorAcceptedAt: 'x', menteeAcceptedAt: 'y' }),
    );
    const req = httpMock.expectOne((r) => r.url.includes('/matches/match-1/end'));
    req.flush(proposedMatch({ status: 'Ended', endedReason: 'Ended by mentor' }));
    fixture.detectChanges();

    expect(fixture.componentInstance['store'].matches()[0].status).toBe('Ended');
  });

  it('filters the match list by status', () => {
    flushInit([
      proposedMatch({ id: 'a', status: 'Proposed' }),
      proposedMatch({ id: 'b', status: 'Ended' }),
    ]);
    fixture.componentInstance['statusFilter'].set('Ended');
    fixture.detectChanges();

    expect(
      fixture.componentInstance['filteredMatches']().map((m: MentorshipMatchDto) => m.id),
    ).toEqual(['b']);
  });
});
