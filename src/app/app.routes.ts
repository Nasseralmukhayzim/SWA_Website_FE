import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'pages',
    loadComponent: () => import('./features/pages/page-list/page-list').then((m) => m.PageList),
  },
  {
    path: 'pages/:slug',
    loadComponent: () => import('./features/pages/page-detail/page-detail').then((m) => m.PageDetail),
  },
  {
    path: 'news',
    loadComponent: () => import('./features/news/news-list/news-list').then((m) => m.NewsList),
  },
  {
    path: 'news/:slug',
    loadComponent: () => import('./features/news/news-detail/news-detail').then((m) => m.NewsDetail),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/event-list/event-list').then((m) => m.EventList),
  },
  {
    path: 'events/:slug',
    loadComponent: () => import('./features/events/event-detail/event-detail').then((m) => m.EventDetail),
  },
  {
    path: 'faqs',
    loadComponent: () => import('./features/faqs/faq-list/faq-list').then((m) => m.FaqList),
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/service-list/service-list').then((m) => m.ServiceList),
  },
  {
    path: 'services/:slug',
    loadComponent: () => import('./features/services/service-detail/service-detail').then((m) => m.ServiceDetail),
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search-page/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/document-list/document-list').then((m) => m.DocumentList),
  },
  {
    path: 'documents/:slug',
    loadComponent: () => import('./features/documents/document-detail/document-detail').then((m) => m.DocumentDetail),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFound),
  },
];
