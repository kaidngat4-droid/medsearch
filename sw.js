const CACHE_NAME = 'medsearch-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseToCache));
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/');
      });
    })
  );
});
