import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../../../core/config/app-config';
import { ChaptersStore } from './chapters.store';
import type { ChapterDto } from '../chapters.types';

describe('ChaptersStore', () => {
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://localhost:5000';

  const chapter: ChapterDto = {
    id: 'c1',
    name: 'Dhaka Chapter',
    description: 'For alumni in Dhaka',
    region: 'Dhaka',
    memberCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the chapter list', () => {
    const store = TestBed.inject(ChaptersStore);
    store.loadList({ take: 50 });
    httpMock.expectOne((r) => r.url.includes('/alumni/chapters')).flush([chapter]);
    expect(store.items()).toEqual([chapter]);
  });

  it('loads a single chapter', () => {
    const store = TestBed.inject(ChaptersStore);
    store.loadOne('c1');
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1`).flush(chapter);
    expect(store.selected()).toEqual(chapter);
  });

  it('tracks a successful join locally', (done) => {
    const store = TestBed.inject(ChaptersStore);
    store.join('c1').subscribe(() => {
      expect(store.joinedChapterIds()).toContain('c1');
      done();
    });
    httpMock
      .expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1/join`)
      .flush({ ...chapter, memberCount: 11 });
  });

  it('removes the chapter id locally after a successful leave', (done) => {
    const store = TestBed.inject(ChaptersStore);
    store.join('c1').subscribe(() => {
      store.leave('c1').subscribe(() => {
        expect(store.joinedChapterIds()).not.toContain('c1');
        done();
      });
      httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1/leave`).flush(chapter);
    });
    httpMock.expectOne(`${apiBaseUrl}/api/v1/alumni/chapters/c1/join`).flush(chapter);
  });
});
