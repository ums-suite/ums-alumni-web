import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../core/config/app-config';
import { DirectorySearchComponent } from './directory-search.component';

describe('DirectorySearchComponent', () => {
  let fixture: ComponentFixture<DirectorySearchComponent>;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorySearchComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DirectorySearchComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('searches on init with no filters', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne((r) => r.url.includes('/alumni/directory'));
    req.flush({ items: [], skip: 0, take: 24 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No alumni match');
  });

  it('groups results by graduation year, most recent first', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({
        items: [
          {
            id: 'a1',
            graduationYear: 2018,
            programId: 'p1',
            departmentId: 'd1',
            currentEmployer: null,
            location: null,
            contactEmail: null,
            contactPhone: null,
          },
          {
            id: 'a2',
            graduationYear: 2022,
            programId: 'p1',
            departmentId: 'd1',
            currentEmployer: null,
            location: null,
            contactEmail: null,
            contactPhone: null,
          },
        ],
        skip: 0,
        take: 24,
      });
    fixture.detectChanges();

    expect(fixture.componentInstance['groups']().map((g: { year: number }) => g.year)).toEqual([
      2022, 2018,
    ]);
  });

  it('shows a connect link only for entries with a visible contact channel', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({
        items: [
          {
            id: 'a1',
            graduationYear: 2020,
            programId: 'p1',
            departmentId: 'd1',
            currentEmployer: null,
            location: null,
            contactEmail: 'a@x.com',
            contactPhone: null,
          },
          {
            id: 'a2',
            graduationYear: 2020,
            programId: 'p1',
            departmentId: 'd1',
            currentEmployer: null,
            location: null,
            contactEmail: null,
            contactPhone: null,
          },
        ],
        skip: 0,
        take: 24,
      });
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('.alw-directory__connect');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('mailto:a@x.com');
  });

  it('re-searches with the entered filters on submit', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes('/alumni/directory'))
      .flush({ items: [], skip: 0, take: 24 });

    fixture.componentInstance['graduationYear'].set('2021');
    fixture.componentInstance['location'].set('Dhaka');
    fixture.componentInstance['search']();

    const req = httpMock.expectOne((r) => r.url.includes('/alumni/directory'));
    expect(req.request.params.get('graduationYear')).toBe('2021');
    expect(req.request.params.get('location')).toBe('Dhaka');
    req.flush({ items: [], skip: 0, take: 24 });
  });
});
