import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveImageComponent } from './responsive-image.component';

describe('ResponsiveImageComponent', () => {
  let fixture: ComponentFixture<ResponsiveImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiveImageComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ResponsiveImageComponent);
    fixture.componentRef.setInput('src', 'https://cdn.example.edu/photo.jpg');
    fixture.detectChanges();
  });

  it('renders an img with the given src', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('photo.jpg');
  });

  it('defaults to lazy loading', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('omits lazy loading when priority is set', () => {
    fixture.componentRef.setInput('priority', true);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('loading')).toBeNull();
    expect(img.getAttribute('fetchpriority')).toBe('high');
  });

  it('uses an empty alt for decorative images', () => {
    fixture.componentRef.setInput('alt', 'a photo');
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('builds a srcset string from sources', () => {
    fixture.componentRef.setInput('sources', [
      { url: 'a.jpg', width: 400 },
      { url: 'b.jpg', width: 800 },
    ]);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('srcset')).toBe('a.jpg 400w, b.jpg 800w');
  });

  it('marks loaded on the load event', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('alw-responsive-image--loaded')).toBeTrue();
  });

  it('marks errored on the error event', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('alw-responsive-image--errored')).toBeTrue();
  });
});
