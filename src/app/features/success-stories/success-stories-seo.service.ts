import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type { NoticeDto } from './success-stories.types';
import { excerptOf } from './success-stories.types';

const JSON_LD_SCRIPT_ID = 'alw-story-jsonld';

/**
 * ALMW-22: `Article` schema.org JSON-LD for a Success Story/News detail page, mirroring
 * `ums-public-web`'s `ProgramSeoService` pattern (removes-then-reinserts by a stable element id,
 * called imperatively from the component's data-load `.subscribe()`). Only fields `NoticeDto`
 * genuinely has are populated (`name`, `articleBody`, `datePublished`) -- no fabricated `author`
 * or `image` property (see `success-stories.types.ts`'s flagged gaps).
 */
@Injectable({ providedIn: 'root' })
export class SuccessStoriesSeoService {
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);

  apply(story: NoticeDto, canonicalUrl: string): void {
    this.titleService.setTitle(`${story.title} | UMS Alumni Success Stories`);

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: story.title,
      articleBody: story.body,
      description: excerptOf(story.body),
      url: canonicalUrl,
    };
    if (story.publishedAt) {
      jsonLd['datePublished'] = story.publishedAt;
    }

    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
    const script = this.document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }

  clear(): void {
    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
  }
}
