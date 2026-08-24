import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/paged-result.model';
import { PageDetail, PageListItem } from '../models/page.model';
import { NewsDetail, NewsListItem } from '../models/news.model';
import { EventDetail, EventListItem } from '../models/event.model';
import { FaqListItem } from '../models/faq.model';
import { ServiceDetail, ServiceListItem } from '../models/service.model';
import { DocumentDetail, DocumentListItem } from '../models/document.model';
import { Lookup, LookupKey } from '../models/lookup.model';
import { MediaAsset } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/public`;

  getPages(params: { lang?: string; parentId?: string; showInNavigation?: boolean; page?: number; pageSize?: number } = {}): Observable<PagedResult<PageListItem>> {
    return this.http.get<PagedResult<PageListItem>>(`${this.baseUrl}/pages`, { params: toHttpParams(params) });
  }

  getPage(slug: string, lang?: string): Observable<PageDetail> {
    return this.http.get<PageDetail>(`${this.baseUrl}/pages/${slug}`, { params: toHttpParams({ lang }) });
  }

  getNews(params: { lang?: string; isFeatured?: boolean; page?: number; pageSize?: number } = {}): Observable<PagedResult<NewsListItem>> {
    return this.http.get<PagedResult<NewsListItem>>(`${this.baseUrl}/news`, { params: toHttpParams(params) });
  }

  getNewsItem(slug: string, lang?: string): Observable<NewsDetail> {
    return this.http.get<NewsDetail>(`${this.baseUrl}/news/${slug}`, { params: toHttpParams({ lang }) });
  }

  getEvents(params: { lang?: string; upcoming?: boolean; eventTypeId?: string; page?: number; pageSize?: number } = {}): Observable<PagedResult<EventListItem>> {
    return this.http.get<PagedResult<EventListItem>>(`${this.baseUrl}/events`, { params: toHttpParams(params) });
  }

  getEvent(slug: string, lang?: string): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.baseUrl}/events/${slug}`, { params: toHttpParams({ lang }) });
  }

  getFaqs(params: { lang?: string; categoryId?: string; page?: number; pageSize?: number } = {}): Observable<PagedResult<FaqListItem>> {
    return this.http.get<PagedResult<FaqListItem>>(`${this.baseUrl}/faqs`, { params: toHttpParams(params) });
  }

  getServices(
    params: { lang?: string; deliveryType?: number; audienceId?: string; channelId?: string; isFeatured?: boolean; page?: number; pageSize?: number } = {},
  ): Observable<PagedResult<ServiceListItem>> {
    return this.http.get<PagedResult<ServiceListItem>>(`${this.baseUrl}/services`, { params: toHttpParams(params) });
  }

  getService(slug: string, lang?: string): Observable<ServiceDetail> {
    return this.http.get<ServiceDetail>(`${this.baseUrl}/services/${slug}`, { params: toHttpParams({ lang }) });
  }

  getDocuments(params: { lang?: string; section?: number; categoryId?: string; year?: number; page?: number; pageSize?: number } = {}): Observable<PagedResult<DocumentListItem>> {
    return this.http.get<PagedResult<DocumentListItem>>(`${this.baseUrl}/documents`, { params: toHttpParams(params) });
  }

  getDocument(slug: string, lang?: string): Observable<DocumentDetail> {
    return this.http.get<DocumentDetail>(`${this.baseUrl}/documents/${slug}`, { params: toHttpParams({ lang }) });
  }

  getLookups(key: LookupKey, lang?: string): Observable<Lookup[]> {
    return this.http.get<Lookup[]>(`${this.baseUrl}/lookups/${key}`, { params: toHttpParams({ lang }) });
  }

  private readonly mediaCache = new Map<string, Observable<MediaAsset>>();

  /** Media assets (icons/images) repeat heavily across cards — cache per id so each is fetched once. */
  getMedia(id: string): Observable<MediaAsset> {
    let cached = this.mediaCache.get(id);
    if (!cached) {
      cached = this.http.get<MediaAsset>(`${this.baseUrl}/media/${id}`).pipe(
        // The API returns storage-relative URLs (e.g. "/uploads/..."); resolve them against the
        // API's own origin, not the app's, since the two run on different ports/hosts.
        map((asset) => ({ ...asset, url: resolveMediaUrl(asset.url) })),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.mediaCache.set(id, cached);
    }
    return cached;
  }
}

function resolveMediaUrl(url: string): string {
  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }
  const base = environment.apiBaseUrl;
  // '/' means same-origin deployment (Fe and Api behind one reverse proxy) — relative URLs are already correct.
  if (!base || base === '/') {
    return url;
  }
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

function toHttpParams(params: Record<string, unknown>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}
