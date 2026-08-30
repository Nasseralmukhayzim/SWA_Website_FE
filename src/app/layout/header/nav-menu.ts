/**
 * Main navigation, transcribed from the Figma header and its seven sub-menus
 * (nodes 3787:44237–44243).
 *
 * The CMS has no navigation model, so this lives in code. Arabic labels come from the page titles
 * already stored in the CMS; English labels come from the design.
 *
 * Four items in the design have no page behind them yet — "Projects and Achievements", "Water
 * Sector by the Numbers", "Sector Localization" and "Media Library" — so they are left out rather
 * than shipped as links to a 404. Add the pages and they can be dropped straight in here.
 */
export interface NavLink {
  readonly path: string;
  readonly ar: string;
  readonly en: string;
}

export interface NavColumn {
  /** Some menus group their links under a coloured heading; most do not. */
  readonly headingAr?: string;
  readonly headingEn?: string;
  readonly links: readonly NavLink[];
}

export interface NavMenu {
  readonly key: string;
  readonly ar: string;
  readonly en: string;
  /** Where the top-level label itself points, when it has a landing page. */
  readonly path?: string;
  readonly columns: readonly NavColumn[];
}

const page = (slug: string, ar: string, en: string): NavLink => ({ path: `/pages/${slug}`, ar, en });

export const NAV_MENUS: readonly NavMenu[] = [
  {
    key: 'about',
    ar: 'عن الهيئة',
    en: 'About Us',
    columns: [
      {
        links: [
          page('authority-overview-and-strategy', 'لمحة عن الهيئة و استراتيجتها', 'Overview of the Authority and Its Strategy'),
          page('authority-and-saudi-vision-2030', 'الهيئة السعودية للمياه و رؤية 2030', 'Saudi Water Authority and Vision 2030'),
          page('board-of-directors', 'مجلس الإدارة', 'Board of Directors'),
          page('organizational-structure', 'الهيكل التنظيمي', 'Organizational Structure'),
        ],
      },
      {
        links: [
          page('international-presence-and-strategic-partnerships', 'الحضور الدولي والشراكات الاستراتيجية', 'International Presence and Strategic Partnerships'),
          page('awards-and-achievements', 'الجوائز و الإنجازات', 'Awards and Achievements'),
          page('sustainability', 'الإستدامة', 'Sustainability'),
          page('tenders-and-procurement', 'المنافسات و المشتريات', 'Procurement & Contracts'),
        ],
      },
      {
        links: [
          page('affiliated-entities', 'الكيانات التابعة', 'Affiliated Entities'),
          page('e-participation', 'المشاركة الإلكترونية', 'E-Participation'),
          page('join-us', 'انضم إلينا', 'Join Us'),
          page('contact-us', 'تواصل معنا', 'Contact Us'),
        ],
      },
    ],
  },
  {
    key: 'water-ecosystem',
    ar: 'منظومة المياه',
    en: 'Water Ecosystem',
    columns: [
      {
        links: [
          page('national-water-strategy', 'الاستراتيجية الوطنية للمياه', 'National Water Strategy'),
          page('sector-governance', 'حوكمة القطاع', 'Sector Governance'),
        ],
      },
      {
        links: [
          page('water-ecosystem-value-chain', 'سلسلة القيمة لمنظومة المياه', 'Water Sector Value Chain'),
        ],
      },
    ],
  },
  {
    key: 'e-services',
    ar: 'الخدمات الإلكترونية',
    en: 'E-Services',
    path: '/services',
    columns: [
      {
        links: [
          { path: '/services', ar: 'خدمات الأفراد', en: 'Individuals Services' },
          { path: '/services', ar: 'خدمات الأعمال', en: 'Business Services' },
        ],
      },
    ],
  },
  {
    key: 'regulations',
    ar: 'الأنظمة و اللوائح',
    en: 'Regulations',
    columns: [
      {
        headingAr: 'التراخيص',
        headingEn: 'Licensing',
        links: [
          page('licensing-governance', 'حوكمة التراخيص', 'Licensing Governance'),
          page('licensed-entities', 'الجهات المرخصة', 'Licensed Entities'),
        ],
      },
      {
        headingAr: 'الأنظمة والقرارات',
        headingEn: 'Regulations and Decisions',
        links: [
          page('regulations-and-laws', 'الأنظمة و اللوائح و القرارات', 'Legislation, Regulations, and Decisions'),
        ],
      },
    ],
  },
  {
    key: 'innovation',
    ar: 'الابتكار وبناء القدرات',
    en: 'Innovation',
    columns: [
      {
        links: [
          page('innovation-and-capacity-building', 'الابتكار وبناء القدرات', 'Innovation and Capacity Building'),
          page('investment', 'الاستثمار', 'Investment'),
        ],
      },
    ],
  },
  {
    key: 'knowledge',
    ar: 'مركز المعرفة',
    en: 'Knowledge Centre',
    columns: [
      {
        links: [
          page('beneficiary-awareness', 'توعية المستفيدين', 'Beneficiary Awareness'),
          { path: '/documents', ar: 'الأوراق البحثية والتقارير', en: 'Research Papers and Reports' },
          page('open-data', 'البيانات المفتوحة', 'Open Data'),
          { path: '/faqs', ar: 'الأسئلة الشائعة', en: 'Frequently Asked Questions (FAQ)' },
        ],
      },
    ],
  },
  {
    key: 'media',
    ar: 'المركز الإعلامي',
    en: 'Media Centre',
    columns: [
      {
        links: [
          { path: '/news', ar: 'الأخبار', en: 'News' },
          { path: '/events', ar: 'تقويم الفعاليات', en: 'Events Calendar' },
          page('brand-identity', 'الهوية البصرية', 'Visual Identity'),
        ],
      },
    ],
  },
];
