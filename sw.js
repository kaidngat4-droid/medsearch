// MedSearch Yemen Service Worker - Optimized v7
// MedSearch Yemen - محرك البحث الطبي العالمي
// Dr. Salah Al-Ahdal | kaidngat4@gmail.com | 🇾🇪 الجمهورية اليمنية

const CACHE_NAME = 'medsearch-yemen-v7';
const STATIC_CACHE = 'medsearch-yemen-static-v7';
const DYNAMIC_CACHE = 'medsearch-yemen-dynamic-v7';
const IMAGE_CACHE = 'medsearch-yemen-images-v7';

// Core assets - precached on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',   
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/feature-graphic.png',
  '/screenshot-1.png',
  '/screenshot1.png'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Lateef:wght@300;400;500;600;700;800&family=Scheherazade+New:wght@400;500;600;700&display=swap'
];

// Cache size limits
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  console.log('[SW] Installing MedSearch Yemen v7...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching core assets for MedSearch Yemen...');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] MedSearch Yemen core assets cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Failed to cache core assets:', err);
        // Continue even if some assets fail
        return self.skipWaiting();
      })
  );
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating MedSearch Yemen v7...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => {
            // Delete old versions of our caches
            return name.startsWith('medsearch-yemen-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== IMAGE_CACHE;
          })
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('[SW] Old caches cleaned');
      // Take control of all clients immediately
      return self.clients.claim();
    })
    .then(() => {
      // Notify all clients about update
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_NAME,
            appName: 'MedSearch Yemen',
            message: 'تم تحديث MedSearch Yemen! يرجى إعادة التحميل للحصول على أحدث الإصدار.'
          });
        });
      });
    })
  );
});

// ============ FETCH STRATEGIES ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Strategy selection based on request type
  if (isStaticAsset(request)) {
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

// ============ STRATEGY HELPERS ============

function isStaticAsset(request) {
  const staticExtensions = /\.(html|json|js|css)$/i;
  return staticExtensions.test(request.url) || 
         request.url.includes('manifest.json');
}

function isImage(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(request.url);
}

function isGoogleFont(request) {
  return request.url.includes('fonts.googleapis.com') || 
         request.url.includes('fonts.gstatic.com');
}

function isAPI(request) {
  return request.url.includes('/api/') || 
         request.url.includes('googletagmanager');
}

// ============ STRATEGIES ============

// Cache First, Network Fallback (for static assets)
async function staticAssetStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached version immediately
    // But also fetch updated version in background
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {}); // Silent fail for background update

    return cached;
  }

  // Not in cache - fetch and cache
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    // Return offline fallback for navigation
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    throw error;
  }
}

// Stale While Revalidate (for images)
async function imageStrategy(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  // Always try to fetch fresh version
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
        // Clean up old images periodically
        cleanupCache(IMAGE_CACHE, MAX_IMAGE_ITEMS);
      }
      return response;
    })
    .catch(error => {
      console.warn('[SW] Image fetch failed:', error);
      // Return cached if available, else throw
      if (cached) return cached;
      throw error;
    });

  // Return cached immediately if available
  if (cached) {
    return cached;
  }

  // Wait for network response
  return fetchPromise;
}

// Cache First for Google Fonts (rarely change)
async function fontStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Font fetch failed:', error);
    if (cached) return cached;
    throw error;
  }
}

// Network First, Cache Fallback (for API calls)
async function apiStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.warn('[SW] API fetch failed, trying cache:', error);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Network First with Cache Fallback (for dynamic content)
async function dynamicContentStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      // Clean up old dynamic entries
      cleanupCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    console.warn('[SW] Dynamic content fetch failed:', error);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    throw error;
  }
}

// ============ CACHE CLEANUP ============
async function cleanupCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest entries (FIFO)
    const entriesToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
    console.log(`[SW] Cleaned up ${entriesToDelete.length} old entries from ${cacheName}`);
  }
}

// ============ BACKGROUND SYNC ============
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medical-data') {
    console.log('[SW] Background sync triggered for MedSearch Yemen');
    event.waitUntil(syncMedicalData());
  }
});

async function syncMedicalData() {
  // Placeholder for background sync logic
  // Could sync user preferences, search history, etc.
  console.log('[SW] MedSearch Yemen medical data synced');
}

// ============ PUSH NOTIFICATIONS ============
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'MedSearch Yemen - تحديث طبي جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'medsearch-yemen-update',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'dismiss', title: 'تجاهل' }
    ],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('MedSearch Yemen', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// ============ MESSAGE HANDLING ============
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      appName: 'MedSearch Yemen',
      staticCache: STATIC_CACHE,
      dynamicCache: DYNAMIC_CACHE
    });
  }
});

// ============ PERIODIC SYNC (if supported) ============
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-medical-content') {
    event.waitUntil(updateMedicalContent());
  }
});

async function updateMedicalContent() {
  console.log('[SW] MedSearch Yemen: Periodic sync - Updating medical content...');
  // Could fetch new medical data, update dictionaries, etc.
}

console.log('%c⚕️ MedSearch Yemen', 'font-size:24px;font-weight:bold;color:#0d7377');
console.log('%cمحرك البحث الطبي العالمي - الجمهورية اليمنية', 'font-size:14px;color:#4a5568');
console.log('%c👨‍💻 Dr. Salah Al-Ahdal', 'font-size:12px;color:#d4af37');
console.log('%c📧 kaidngat4@gmail.com | 📞 711129611 | 🇾🇪 اليمن', 'font-size:11px;color:#64748b');
