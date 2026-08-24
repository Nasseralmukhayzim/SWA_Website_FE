import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSectionComponent } from './page-section';

describe('PageSectionComponent', () => {
  let component: PageSectionComponent;
  let fixture: ComponentFixture<PageSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('section', { kind: 'Text', heading: 'Test', intro: null, body: 'Test', items: [] });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
