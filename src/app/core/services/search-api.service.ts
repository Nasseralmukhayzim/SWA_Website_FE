import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/paged-result.model';
import { SearchResult } from '../models/search.model';

/**
 * Site search sits in its own client rather than on ContentApiService: the search endpoint takes the
 * language as a query parameter, while the content endpoints carry it as a route segment, so the two
 * have no URL shape to share.
 */
@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/public/search`;

  search(params: {
    q: string;
    lang: string;
    contentType?: string | null;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<SearchResult>> {
    let httpParams = new HttpParams().set('q', params.q).set('lang', params.lang);
    if (params.contentType) {
      httpParams = httpParams.set('contentType', params.contentType);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    return this.http.get<PagedResult<SearchResult>>(this.url, { params: httpParams });
  }
}
