/**
 * Service Worker - BNE Engine v5.2
 * =========================================================================
 * Estrategia: Stale-While-Revalidate para activos, Network-First para API.
 * =========================================================================
 */
const CACHE_NAME = 'buca-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/main.js'
];

// Instalación: Cachear activos estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activación: Limpiar caches viejas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Interceptación de peticiones
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // No interceptar peticiones no GET ni peticiones a APIs externas (Firebase, Google, etc.)
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                return cachedResponse || new Response('Servicio temporalmente fuera de línea', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            });

            return cachedResponse || fetchPromise;
        })
    );
});
