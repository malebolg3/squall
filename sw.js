/*<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<!-- Copyright (C) 2026 Th1eros -->*/

const CACHE = 'rapsodia-v1';
const URLS = [
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

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(URLS))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});