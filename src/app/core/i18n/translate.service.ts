import { Injectable, computed, inject } from '@angular/core';
import { BN_DICTIONARY } from './dictionaries/bn';
import { EN_DICTIONARY } from './dictionaries/en';
import { LocaleService } from './locale.service';
import type { AlmwLocale } from './locale.types';

const DICTIONARIES: Record<AlmwLocale, Record<string, string>> = {
  en: EN_DICTIONARY,
  bn: BN_DICTIONARY,
};

function interpolate(template: string, params: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * ALMW-5: flat-dictionary translation lookup with ADR-0011's fallback-to-English rule, applied to
 * this app's own UI chrome strings (nav, CTAs, empty states, donation/receipt/event copy).
 */
@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly localeService = inject(LocaleService);

  readonly locale = computed(() => this.localeService.locale());

  translate(key: string, params?: Readonly<Record<string, string | number>>): string {
    const dictionary = DICTIONARIES[this.locale()];
    const template = dictionary[key] ?? EN_DICTIONARY[key] ?? key;
    return params ? interpolate(template, params) : template;
  }
}
