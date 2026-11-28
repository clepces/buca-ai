/**
 * Service Worker - BNE Engine v5.2
 * =========================================================================
 * Estrategia: Stale-While-Revalidate para activos, Network-First para API.
 * =========================================================================
 */
const CACHE_NAME = 'buca-cache-v1.1.25';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html'
];

const IMMUTABLE_EXT_RE = /\.(?:js|css|woff2?|ttf|svg|png|jpe?g|webp|ico)$/i;

// Instalación: Cachear activos estáticos con tolerancia a fallos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of ASSETS_TO_CACHE) {
                try {
                    await cache.add(asset);
                } catch (e) {
                    // Silently ignore individual caching failures
                }
            }
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

    // No interceptar peticiones en localhost (desarrollo) para evitar servir index.html viejo desde caché
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return;
    }

    // No interceptar peticiones no GET ni peticiones a APIs externas (Supabase, Google, etc.)
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // No interceptar módulos ni HMR de Vite en desarrollo (evita duplicados y 304 en 3G)
    if (
        url.pathname.startsWith('/src/') ||
        url.pathname.startsWith('/@') ||
        url.pathname.startsWith('/node_modules/') ||
        url.searchParams.has('t') ||
        url.searchParams.has('v')
    ) {
        return;
    }

    // Documentos HTML y manifest: Network-First con fallback a caché para recibir nuevas versiones
    const isDocument = event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/manifest.json';
    if (isDocument) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return networkResponse;
            }).catch(async () => {
                const cached = await caches.match(event.request) || await caches.match('/index.html');
                return cached || new Response('Servicio temporalmente fuera de línea', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            })
        );
        return;
    }

    // Assets con hash de producción y recursos estáticos: Cache-First (cero revalidación 304 en 3G)
    const isImmutable = url.pathname.startsWith('/assets/') || IMMUTABLE_EXT_RE.test(url.pathname);
    if (isImmutable) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkResponse;
                });
            }).catch(() => new Response('Recurso no disponible sin conexión', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            }))
        );
    }
});
