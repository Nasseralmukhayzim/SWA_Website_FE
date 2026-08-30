import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ServiceDetail } from './service-detail';

const SLUG = 'preliminary-approval';

const DETAIL = {
  id: '1',
  slug: SLUG,
  name: 'موافقة مبدئية',
  description: 'وصف الخدمة',
  deliveryType: 0,
  iconId: null,
  supportPhone: '19913',
  isFeatured: false,
  fee: 'مجانًا',
  deliveryTime: '5 أيام',
  requiredDocuments: null,
  steps: null,
  terms: null,
  objectives: null,
  startServiceUrl: null,
  guideFileId: null,
  audienceSlugs: ['business'],
  channelSlugs: [],
  audienceNames: ['الأعمال'],
  channelNames: [],
  categorySlug: 'networked',
  categoryName: 'المياه الشبكية',
  activityTypeSlug: 'approvals',
  activityTypeName: 'الموافقات المبدئية',
  updatedAtUtc: null,
};

const listItem = (slug: string, categorySlug: string | null) => ({
  id: slug,
  slug,
  name: slug,
  description: null,
  deliveryType: 0,
  iconId: null,
  isFeatured: false,
  audienceNames: [],
  audienceSlugs: [],
  categorySlug,
  categoryName: categorySlug,
  activityTypeSlug: null,
  activityTypeName: null,
});

describe('ServiceDetail', () => {
  let component: ServiceDetail;
  let fixture: ComponentFixture<ServiceDetail>;
  let http: HttpTestingController;

  beforeEach(async () => {
    const paramMap = convertToParamMap({ slug: SLUG });

    await TestBed.configureTestingModule({
      imports: [ServiceDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(paramMap), snapshot: { paramMap } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceDetail);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  /** The component loads on creation, so every test has to settle both of its requests. */
  async function load(related: ReturnType<typeof listItem>[] = []): Promise<void> {
    http.expectOne((r) => r.url.endsWith(`/services/${SLUG}`)).flush(DETAIL);
    await fixture.whenStable();
    http
      .expectOne((r) => r.url.endsWith('/services'))
      .flush({ items: related, page: 1, pageSize: 100, totalCount: related.length });
    await fixture.whenStable();
  }

  it('should create', async () => {
    await load();
    expect(component).toBeTruthy();
  });

  it('tags the service by audience, category and activity type, in that order', async () => {
    await load();

    const tags = Array.from(fixture.nativeElement.querySelectorAll('.service-tag')) as HTMLElement[];
    expect(tags.map((tag) => tag.textContent?.trim())).toEqual([
      'الأعمال',
      'المياه الشبكية',
      'الموافقات المبدئية',
    ]);
    expect(tags.map((tag) => tag.className)).toEqual([
      'service-tag service-tag--neutral',
      'service-tag service-tag--success',
      'service-tag service-tag--info',
    ]);
  });

  it('lists related services from the same category and never the service itself', async () => {
    await load([
      listItem(SLUG, 'networked'),
      listItem('sibling', 'networked'),
      listItem('other-family', 'non-networked'),
    ]);

    const titles = Array.from(fixture.nativeElement.querySelectorAll('.related-card__title')) as HTMLElement[];
    expect(titles.map((title) => title.textContent?.trim())).toEqual(['sibling']);
  });
});
