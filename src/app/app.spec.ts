import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { NAV_MENUS } from './layout/header/nav-menu';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the header logo and navigation', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.site-header__logo img')?.getAttribute('src')).toContain('logo-swa-lockup');
    // Top-level items are disclosure buttons now; the links live inside each panel.
    expect(compiled.querySelectorAll('.site-header__nav .nav-item__label').length).toBe(NAV_MENUS.length);
  });

  it('should open a sub-menu when its nav item is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.submenu')).toBeNull();

    const first = compiled.querySelector<HTMLButtonElement>('.nav-item__label');
    first?.click();
    fixture.detectChanges();

    expect(first?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelectorAll('.submenu__list a').length).toBe(
      NAV_MENUS[0].columns.reduce((total, column) => total + column.links.length, 0),
    );
  });
});
