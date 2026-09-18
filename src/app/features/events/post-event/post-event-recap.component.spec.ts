import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostEventRecapComponent } from './post-event-recap.component';

describe('PostEventRecapComponent', () => {
  let fixture: ComponentFixture<PostEventRecapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEventRecapComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PostEventRecapComponent);
  });

  it('renders an honest not-yet-available state rather than fabricated recap content', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('not yet available');
  });
});
