import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicHomeComponent } from './public-home.component';

describe('PublicHomeComponent', () => {
  let fixture: ComponentFixture<PublicHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PublicHomeComponent);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a heading', () => {
    expect(fixture.nativeElement.querySelector('h1')).toBeTruthy();
  });
});
