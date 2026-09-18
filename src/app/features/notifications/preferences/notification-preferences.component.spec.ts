import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPreferencesComponent } from './notification-preferences.component';

describe('NotificationPreferencesComponent', () => {
  let fixture: ComponentFixture<NotificationPreferencesComponent>;

  beforeEach(async () => {
    localStorage.removeItem('alw.notifications.digestPreferences');
    await TestBed.configureTestingModule({
      imports: [NotificationPreferencesComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationPreferencesComponent);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('alw.notifications.digestPreferences'));

  it('renders a disclosure that this is not yet backed by a real preference endpoint', () => {
    expect(fixture.nativeElement.textContent).toContain('this browser');
  });

  it('renders one toggle per digest category, all checked by default', () => {
    const checkboxes: NodeListOf<HTMLInputElement> =
      fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(4);
    checkboxes.forEach((box) => expect(box.checked).toBe(true));
  });

  it('unchecks a category on toggle', () => {
    fixture.componentInstance['toggle']('jobMatches');
    fixture.detectChanges();
    const first: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(first.checked).toBe(false);
  });
});
