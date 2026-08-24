import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ServiceDetail } from './service-detail';

describe('ServiceDetail', () => {
  let component: ServiceDetail;
  let fixture: ComponentFixture<ServiceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
