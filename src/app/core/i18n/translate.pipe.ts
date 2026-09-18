import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

/**
 * `{{ 'nav.directory' | translate }}` / `{{ 'directory.classOf' | translate: { year } }}`.
 *
 * Deliberately impure (`pure: false`): the translated output must re-render when
 * {@link LocaleService}'s `locale` signal changes, and a signal read inside a pure pipe's
 * `transform` is not itself an Angular-tracked binding the way a template signal call is.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  transform(key: string, params?: Readonly<Record<string, string | number>>): string {
    return this.translateService.translate(key, params);
  }
}
