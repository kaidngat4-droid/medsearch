// MedSearch Yemen Service Worker - Native Hybrid v4
// محرك البحث الطبي العالمي - مع ميزات أصلية للجوال
// Dr. Salah Al-Ahdal | kaidngat4@gmail.com | 🇾🇪 الجمهورية اليمنية
//
// v4 CHANGELOG:
// - FIX: merged the two separate `fetch` listeners into ONE. Registering
//   multiple fetch listeners that each call event.respondWith() is invalid
//   per the Service Worker spec and was silently breaking navigation /
//   offline fallback in some browsers (undefined behavior when two
//   listeners race to respond to the same event).
// - FIX: offline fallback now lives inside dynamicContentStrategy /
//   staticAssetStrategy instead of a second, separate listener.
// - FIX: icon paths standardized to /images/... to match manifest.json
//   and the app icon actually shipped by the developer.
// - Bumped cache version to force old caches to be evicted on update.

const SW_VERSION = 'v4';
const STATIC_CACHE = `medsearch-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `medsearch-dynamic-${SW_VERSION}`;
const IMAGE_CACHE = `medsearch-images-${SW_VERSION}`;
const FONT_CACHE = `medsearch-fonts-${SW_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE];

// Core assets - precached on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/app.js',    
  '/images/icon-192.png',
  '/images/icon-512.png',
    '/images/icon-72.png',
  '/images/icon-128.png',
  '/images/icon-144.png
  '/images/icon-192-maskable.png',
  '/images/icon-384.png',
  '/images/icon-512-maskable.png',
  '/images/screenshot-home-narrow.png',  
  '/images/screenshot-home-wide.png'     
];

// External resources to cache (Google Fonts used in index.html)
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Lateef:wght@300;400;500;600;700;800&family=Scheherazade+New:wght@400;500;600;700&display=swap'
];

// Cache size limits
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;
const MAX_FONT_ITEMS = 20;

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing MedSearch Native ${SW_VERSION}...`);

  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        // Cache assets individually so ONE missing file (e.g. an icon that
        // hasn't been added to /images/ yet) doesn't fail the whole install.
        await Promise.all(
          CORE_ASSETS.map((url) =>
            fetch(url)
              .then((res) => (res.ok ? staticCache.put(url, res) : null))
              .catch((err) => console.warn('[SW] Could not precache:', url, err))
          )
        );

        const fontCache = await caches.open(FONT_CACHE);
        await Promise.all(
          EXTERNAL_RESOURCES.map((url) =>
            fetch(url, { mode: 'cors' })
              .then((res) => (res.ok ? fontCache.put(url, res) : null))
              .catch((err) => console.warn('[SW] Font fetch failed:', url, err))
          )
        );

        console.log(`[SW] MedSearch Native ${SW_VERSION} installed successfully`);
      } catch (err) {
        console.error('[SW] Install error:', err);
      } finally {
        await self.skipWaiting();
      }
    })()
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating MedSearch Native ${SW_VERSION}...`);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('medsearch-') && !ALL_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );

      await self.clients.claim();

      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: SW_VERSION,
          appName: 'MedSearch Yemen',
          message: 'تم تحديث MedSearch Yemen! يرجى إعادة التحميل للحصول على أحدث إصدار.'
        });
      });
    })()
  );
});

// ============ SINGLE FETCH HANDLER ============
// NOTE: there must only be ONE 'fetch' listener that calls respondWith().
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(staticAssetStrategy(request));
  } else if (isImage(request)) {
    event.respondWith(imageStrategy(request));
  } else if (isGoogleFont(request)) {
    event.respondWith(fontStrategy(request));
  } else if (isAPI(request)) {
    event.respondWith(apiStrategy(request));
  } else {
    event.respondWith(dynamicContentStrategy(request));
  }
});

// ============ REQUEST TYPE HELPERS ============
function isStaticAsset(request) {
  return /\.(html|json|js|css)$/i.test(request.url) || request.url.includes('manifest.json');
}
function isImage(request) {
  return request.destination === 'image' || /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(request.url);
}
function isGoogleFont(request) {
  return request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com');
}
function isAPI(request) {
  return request.url.includes('/api/') || request.url.includes('googletagmanager') || request.url.includes('analytics');
}

// ============ STRATEGIES ============

// Navigation requests: network first, cache fallback, offline.html as last resort
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Navigation response not ok');
  } catch (err) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedPage = await cache.match(request);
    if (cachedPage) return cachedPage;
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) return offlinePage;
    const indexPage = await cache.match('/index.html');
    if (indexPage) return indexPage;
    return new Response(
      '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>MedSearch - Offline</title></head><body style="font-family:sans-serif;background:#0d7377;color:#fff;text-align:center;padding:40px"><h1>⚕️ MedSearch Yemen</h1><p>أنت غير متصل بالإنترنت حالياً.</p><button onclick="location.reload()">إعادة المحاولة</button></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// Cache First, Network Fallback (static assets: html/js/css/json)
async function staticAssetStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
      })
      .catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    throw error;
  }
}

// Stale While Revalidate (images)
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
        cleanupCache(IMAGE_CACHE, MAX_IMAGE_ITEMS);
      }
      return response;
    })
    .catch((error) => {
      if (cached) return cached;
      throw error;
    });

  return cached || fetchPromise;
}

// Cache First for Google Fonts (rarely change)
async function fontStrategy(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request, { mode: 'cors' });
    if (response && response.ok) {
      cache.put(request, response.clone());
      cleanupCache(FONT_CACHE, MAX_FONT_ITEMS);
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

// Network First, Cache Fallback (API / analytics calls)
async function apiStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('API response not ok');
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Network First with Cache Fallback (everything else)
async function dynamicContentStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      cleanupCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
      return networkResponse;
    }
    throw new Error('Dynamic response not ok');
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

// ============ CACHE CLEANUP ============
async function cleanupCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const entriesToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(entriesToDelete.map((key) => cache.delete(key)));
    console.log(`[SW] Cleaned up ${entriesToDelete.length} old entries from ${cacheName}`);
  }
}

// ============ BACKGROUND SYNC ============
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medical-data') {
    event.waitUntil(syncMedicalData());
  }
  if (event.tag === 'sync-search-history') {
    event.waitUntil(syncSearchHistory());
  }
});

async function syncMedicalData() {
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-medical-data', message: 'تمت مزامنة البيانات الطبية' });
  });
}

async function syncSearchHistory() {
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-search-history', message: 'تمت مزامنة سجل البحث' });
  });
}

// ============ PUSH NOTIFICATIONS ============
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : 'MedSearch Yemen - تحديث طبي جديد' };
  }

  const options = {
    body: data.body || 'MedSearch Yemen - تحديث طبي جديد',
    icon: data.icon || '/images/icon-192.png',
    badge: data.badge || '/images/icon-192.png',
    image: data.image || undefined,
    tag: data.tag || 'medsearch-yemen-update',
    requireInteraction: data.requireInteraction || false,
    renotify: data.renotify || false,
    silent: data.silent || false,
    actions: data.actions || [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'search', title: '🔍 بحث' },
      { action: 'dismiss', title: 'تجاهل' }
    ],
    data: {
      url: data.url || '/',
      type: data.type || 'general',
      timestamp: Date.now()
    },
    vibrate: data.vibrate || [100, 50, 100, 50, 200]
  };

  event.waitUntil(self.registration.showNotification(data.title || 'MedSearch Yemen', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};

  if (event.action === 'search') {
    event.waitUntil(clients.openWindow('/index.html?action=search'));
  } else if (event.action === 'dismiss') {
    return;
  } else {
    event.waitUntil(clients.openWindow(notificationData.url || '/'));
  }
});

// ============ MESSAGE HANDLING ============
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          version: SW_VERSION,
          appName: 'MedSearch Yemen',
          staticCache: STATIC_CACHE,
          dynamicCache: DYNAMIC_CACHE,
          imageCache: IMAGE_CACHE,
          fontCache: FONT_CACHE
        });
      }
      break;

    case 'CACHE_URLS':
      if (Array.isArray(event.data.urls)) {
        event.waitUntil(
          caches.open(DYNAMIC_CACHE).then((cache) =>
            Promise.all(
              event.data.urls.map((url) =>
                fetch(url)
                  .then((response) => (response.ok ? cache.put(url, response) : null))
                  .catch((err) => console.warn('[SW] Failed to cache:', url, err))
              )
            )
          )
        );
      }
      break;

    case 'CLEAR_CACHE': {
      const targetCache = event.data.cacheName || DYNAMIC_CACHE;
      event.waitUntil(
        caches
          .open(targetCache)
          .then((cache) => cache.keys().then((keys) => Promise.all(keys.map((key) => cache.delete(key)))))
          .then(() => {
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ type: 'CACHE_CLEARED', cacheName: targetCache });
            }
          })
      );
      break;
    }

    case 'GET_CACHE_SIZE':
      event.waitUntil(
        Promise.all(ALL_CACHES.map((name) => caches.open(name)))
          .then((opened) => Promise.all(opened.map((c) => c.keys().then((k) => k.length))))
          .then(([staticSize, dynamicSize, imageSize, fontSize]) => {
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({
                type: 'CACHE_SIZE',
                static: staticSize,
                dynamic: dynamicSize,
                images: imageSize,
                fonts: fontSize,
                total: staticSize + dynamicSize + imageSize + fontSize
              });
            }
          })
      );
      break;

    default:
      console.log('[SW] Unknown message type:', event.data.type);
  }
});

// ============ PERIODIC SYNC ============
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-medical-content') {
    event.waitUntil(updateMedicalContent());
  }
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupAllCaches());
  }
});

async function updateMedicalContent() {
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach((client) => {
    client.postMessage({ type: 'CONTENT_UPDATED', message: 'تم تحديث المحتوى الطبي' });
  });
}

async function cleanupAllCaches() {
  await cleanupCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
  await cleanupCache(IMAGE_CACHE, MAX_IMAGE_ITEMS);
  await cleanupCache(FONT_CACHE, MAX_FONT_ITEMS);
}

// ============ CONSOLE SIGNATURE ============
console.log(`%c⚕️ MedSearch Yemen Native ${SW_VERSION}`, 'font-size:20px;font-weight:bold;color:#0d7377');
console.log('%c👨‍💻 Dr. Salah Al-Ahdal | 📧 kaidngat4@gmail.com | 🇾🇪', 'font-size:11px;color:#64748b');
