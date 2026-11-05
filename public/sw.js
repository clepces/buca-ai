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
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Verificar si la respuesta es válida para cachear
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // CLONAR INMEDIATAMENTE antes de que sea consumida
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    const url = new URL(event.request.url);
                    if (event.request.method === 'GET' && (url.protocol === 'http:' || url.protocol === 'https:')) {
                        cache.put(event.request, responseToCache);
                    }
                });

                return networkResponse;
            }).catch(() => {
                // Silenciar fallos de red (Offline)
            });

            // Si está en caché, lo servimos de inmediato. Si no, esperamos a la red.
            return cachedResponse || fetchPromise;
        })
    );
});
