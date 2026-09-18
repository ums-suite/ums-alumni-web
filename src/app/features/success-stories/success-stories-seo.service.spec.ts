import { TestBed } from '@angular/core/testing';
import { SuccessStoriesSeoService } from './success-stories-seo.service';
import type { NoticeDto } from './success-stories.types';

describe('SuccessStoriesSeoService', () => {
  const story: NoticeDto = {
    id: 'n1',
    title: 'From Campus to Career',
    body: 'It all started here.',
    languageCode: 'en',
    audience: ['Public'],
    organizationNodeId: null,
    isUrgent: false,
    status: 'Published',
    publishAt: null,
    expireAt: null,
    publishedAt: '2024-01-01T00:00:00Z',
    archivedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    hasBengaliTranslation: false,
    version: 1,
  };

  beforeEach(() => TestBed.configureTestingModule({}));

  afterEach(() => TestBed.inject(SuccessStoriesSeoService).clear());

  it('sets the page title and injects a JSON-LD script tag', () => {
    const service = TestBed.inject(SuccessStoriesSeoService);
    service.apply(story, 'https://alumni.example.edu/stories/n1');

    expect(document.title).toContain('From Campus to Career');
    const script = document.getElementById('alw-story-jsonld');
    expect(script).toBeTruthy();
    const jsonLd = JSON.parse(script?.textContent ?? '{}');
    expect(jsonLd['@type']).toBe('Article');
    expect(jsonLd.headline).toBe('From Campus to Career');
    expect(jsonLd.url).toBe('https://alumni.example.edu/stories/n1');
  });

  it('replaces a previously inserted script rather than duplicating it', () => {
    const service = TestBed.inject(SuccessStoriesSeoService);
    service.apply(story, 'https://alumni.example.edu/stories/n1');
    service.apply(story, 'https://alumni.example.edu/stories/n1');

    expect(document.querySelectorAll('#alw-story-jsonld').length).toBe(1);
  });

  it('removes the script on clear', () => {
    const service = TestBed.inject(SuccessStoriesSeoService);
    service.apply(story, 'https://alumni.example.edu/stories/n1');
    service.clear();

    expect(document.getElementById('alw-story-jsonld')).toBeNull();
  });
});
