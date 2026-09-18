import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegistrationRecoveryComponent } from './registration-recovery.component';

describe('RegistrationRecoveryComponent', () => {
  let fixture: ComponentFixture<RegistrationRecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationRecoveryComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RegistrationRecoveryComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a support contact email', () => {
    expect(fixture.nativeElement.querySelector('a[href^="mailto:"]')).toBeTruthy();
  });
});
