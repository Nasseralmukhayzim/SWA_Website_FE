import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MediaImage } from './media-image';

describe('MediaImage', () => {
  let component: MediaImage;
  let fixture: ComponentFixture<MediaImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaImage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaImage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
