const CACHE_VERSION = 'kreyol-matinik-v1';
const CORE_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/styles.css',
  '/src/app.js',
  '/src/firebase.js',
  '/src/data/vocab.js',
  '/src/data/curriculum.js',
  '/src/data/culturalData.js',
  '/src/data/mapData.js',
  '/src/services/audioEngine.js',
  '/src/views/curriculumAndQuiz.js',
  '/src/views/flashcardsAndDictionary.js',
  '/src/views/learningPathAndCulture.js',
  '/src/views/mapAndKoudmen.js',
  '/src/views/progressAndAdmin.js',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
  '/public/icons/apple-touch-icon.png',
  '/public/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) =>
        Promise.all(
          CORE_SHELL_ASSETS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept cross-origin APIs (Firebase, Google Auth, Open-Meteo, OSM) or server API calls
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;
  if (url.pathname === '/firebase-applet-config.json') return;

  // Navigation requests: Network-first with cached /index.html fallback for offline resilience
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((c) => c.put('/index.html', copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Core stylesheet, vocabulary modules, JS views, and local assets: Stale-While-Revalidate
  const isCoreOfflineAsset =
    url.pathname === '/src/styles.css' ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/public/') ||
    url.pathname === '/manifest.webmanifest';

  if (isCoreOfflineAsset) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }
        const net = await networkPromise;
        return net || new Response('Offline asset unavailable', { status: 503 });
      })
    );
  }
});
