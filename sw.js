/**
 * Service Worker pour Portfolio
 * Compatible avec Vite bundled output
 */

const CACHE_NAME = 'portfolio-v2.0';
const STATIC_CACHE = 'portfolio-static-v2.0';
const DYNAMIC_CACHE = 'portfolio-dynamic-v2.0';

// Only cache the HTML entry point - CSS/JS are bundled by Vite with hashed names
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/favicon.svg',
    '/manifest.json'
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', event => {
    console.log('SW: Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log('SW: Caching critical resources');
            // Use addAll with individual catches to avoid failure if one resource is missing
            return Promise.allSettled(
                CRITICAL_RESOURCES.map(url =>
                    cache.add(url).catch(err => console.warn('SW: Failed to cache:', url, err))
                )
            );
        }).then(() => {
            console.log('SW: Installation complete');
            return self.skipWaiting();
        })
    );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', event => {
    console.log('SW: Activating...');

    event.waitUntil(
        Promise.all([
            // Clean up ALL old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE &&
                            cacheName !== CACHE_NAME) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ]).then(() => {
            console.log('SW: Activation complete');
        })
    );
});

/**
 * Interception des requêtes réseau
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Ignore non-GET requests
    if (request.method !== 'GET') return;

    // Ignore browser extensions
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // For Vite bundled assets (hashed filenames) - cache first (immutable)
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(request));
    }
    // For HTML pages - network first
    else if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
    }
    // For everything else - stale while revalidate
    else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

/**
 * Cache First strategy
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('SW: Cache first failed:', error);
        throw error;
    }
}

/**
 * Network First strategy
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        throw error;
    }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const networkResponsePromise = fetch(request).then(response => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => { });

    return cachedResponse || networkResponsePromise;
}

/**
 * Message handling
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(name => caches.delete(name)));
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

console.log('SW: Service Worker loaded successfully');