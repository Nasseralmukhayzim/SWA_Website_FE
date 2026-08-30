export enum ServiceDeliveryType {
  Request = 0,
  Inquiry = 1,
  Calculator = 2,
  Payment = 3,
  External = 4,
}

export interface ServiceListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  deliveryType: ServiceDeliveryType;
  iconId: string | null;
  isFeatured: boolean;
  audienceNames: string[];
  audienceSlugs: string[];
  categorySlug: string | null;
  categoryName: string | null;
  activityTypeSlug: string | null;
  activityTypeName: string | null;
}

export interface ServiceDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  deliveryType: ServiceDeliveryType;
  iconId: string | null;
  supportPhone: string | null;
  isFeatured: boolean;
  fee: string | null;
  deliveryTime: string | null;
  requiredDocuments: string | null;
  steps: string | null;
  terms: string | null;
  objectives: string | null;
  startServiceUrl: string | null;
  guideFileId: string | null;
  audienceSlugs: string[];
  channelSlugs: string[];
  audienceNames: string[];
  channelNames: string[];
  categorySlug: string | null;
  categoryName: string | null;
  activityTypeSlug: string | null;
  activityTypeName: string | null;
  updatedAtUtc: string | null;
}
