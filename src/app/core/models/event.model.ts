export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  startsAtUtc: string;
  endsAtUtc: string | null;
  imageId: string | null;
  eventTypeName: string | null;
}

export interface EventDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAtUtc: string;
  endsAtUtc: string | null;
  imageId: string | null;
  registrationUrl: string | null;
  eventTypeName: string | null;
}
