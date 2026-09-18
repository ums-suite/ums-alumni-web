import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
  });

  it('transforms a key to its translated string', () => {
    expect(pipe.transform('common.save')).toBe('Save');
  });

  it('passes params through to the underlying translate call', () => {
    expect(pipe.transform('directory.classOf', { year: 1999 })).toBe('Class of 1999');
  });
});
