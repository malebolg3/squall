// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Th1eros

'use strict';

const CACHE_NAME = 'malebolge-v1.4.0';
const CACHE_ALLOW_LIST = [CACHE_NAME];

const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/aBit.png',
  '/Male.png',
  '/manifest.json',
  '/blue/dashboard.html',
  '/blue/analyzer.html',
  '/blue/graph.html',
  '/blue/health.html',
  '/blue/notifications.html',
  '/blue/profile.html',
  '/blue/admin/form.html',
  '/blue/admin/list.html',
  '/blue/assets/form.html',
  '/blue/assets/list.html',
  '/blue/domains/monitor.html',
  '/blue/incidents/form.html',
  '/blue/incidents/list.html',
  '/blue/integrations/form.html',
  '/blue/integrations/list.html',
  '/blue/reports/form.html',
  '/blue/reports/list.html',
  '/blue/vulns/form.html',
  '/blue/vulns/list.html',
  '/red/dashboard.html',
  '/red/monitor.html',
  '/red/tool.html',
  '/red/exploits/list.html',
  '/red/scans/list.html',
  '/violet/dashboard.html',
  '/violet/monitor.html',
  '/violet/labs/create.html',
  '/violet/labs/list.html',
  '/silver/dashboard.html',
  '/silver/monitor.html',
  '/silver/agents/create.html',
  '/silver/agents/list.html',
  '/silver/obsidian/list.html',
  '/silver/orchestration/run.html'
];

const API_PATH_PATTERN = /\/api\//;
const AUTH_PATH_PATTERN = /\/Auth\//;
const STATIC_EXTENSIONS = /\.(?:html|css|js|png|jpg|svg|ico|json|woff2?)$/;

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (CACHE_ALLOW_LIST.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') {
    return;
  }

  if (API_PATH_PATTERN.test(event.request.url)) {
    return;
  }

  if (AUTH_PATH_PATTERN.test(event.request.url)) {
    return;
  }

  if (event.request.mode === 'navigate' && !STATIC_EXTENSIONS.test(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .catch(function() {
          return caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(function(response) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            if (STATIC_EXTENSIONS.test(event.request.url)) {
              var responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseClone);
                });
            }

            return response;
          })
          .catch(function() {
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }

            if (event.request.url.match(/\.(png|jpg|svg|ico)$/)) {
              return caches.match('/Male.png');
            }

            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data && event.data.action === 'clearCache') {
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
      .then(function() {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ action: 'cacheCleared' });
        }
      });
  }

  if (event.data && event.data.action === 'getVersion') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: CACHE_NAME });
    }
  }
});

self.addEventListener('error', function(event) {
  console.error('[SW] Unhandled error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] Unhandled rejection:', event.reason);
});