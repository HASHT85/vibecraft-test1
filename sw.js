/**
 * Service Worker pour Portfolio
 * Optimise les performances avec cache intelligent et stratégies de réseau
 */

const CACHE_NAME = 'portfolio-v1.2';
const STATIC_CACHE = 'portfolio-static-v1.2';
const DYNAMIC_CACHE = 'portfolio-dynamic-v1.2';

// Ressources critiques à mettre en cache immédiatement
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/css/themes.css',
    '/css/main.css',
    '/js/main.js',
    '/js/theme-toggle.js',
    '/favicon.svg'
];

// Ressources à mettre en cache au runtime
const RUNTIME_CACHE = [
    '/css/glassmorphism.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/animations.js',
    '/js/performance-optimizer.js',
    '/data/profile.json',
    '/data/projects.json'
];

// Ressources externes à mettre en cache
const EXTERNAL_CACHE = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', event => {
    console.log('SW: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache des ressources critiques
            caches.open(STATIC_CACHE).then(cache => {
                console.log('SW: Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES);
            }),
            
            // Précharge des ressources runtime
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('SW: Pre-caching runtime resources');
                return cache.addAll(RUNTIME_CACHE.concat(EXTERNAL_CACHE));
            })
        ]).then(() => {
            console.log('SW: Installation complete');
            // Force l'activation immédiate
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
            // Nettoie les anciens caches
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
            
            // Prend le contrôle de toutes les pages
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
    
    // Ignore les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignore les requêtes d'extension de navigateur
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }
    
    // Stratégies de cache selon le type de ressource
    if (isCriticalResource(request.url)) {
        // Cache First pour les ressources critiques
        event.respondWith(cacheFirst(request));
    } else if (isStaticAsset(request.url)) {
        // Stale While Revalidate pour les assets statiques
        event.respondWith(staleWhileRevalidate(request));
    } else if (isAPIRequest(request.url)) {
        // Network First pour les données API
        event.respondWith(networkFirst(request));
    } else if (isImageRequest(request.url)) {
        // Cache First avec fallback pour les images
        event.respondWith(cacheFirstWithFallback(request));
    } else {
        // Network First par défaut
        event.respondWith(networkFirst(request));
    }
});

/**
 * Stratégie Cache First
 * Vérifie d'abord le cache, puis le réseau si nécessaire
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        // Met en cache la réponse pour les prochaines fois
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('SW: Cache first failed:', error);
        
        // Fallback vers une page d'erreur si disponible
        if (request.destination === 'document') {
            return caches.match('/offline.html') || new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
        
        throw error;
    }
}

/**
 * Stratégie Network First
 * Essaie le réseau d'abord, puis le cache en fallback
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Met en cache les réponses valides
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('SW: Network first failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Stratégie Stale While Revalidate
 * Sert depuis le cache immédiatement, met à jour en arrière-plan
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Requête réseau en arrière-plan
    const networkResponsePromise = fetch(request).then(response => {
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(error => {
        console.log('SW: Background fetch failed:', error);
    });
    
    // Retourne immédiatement depuis le cache ou attend le réseau
    return cachedResponse || networkResponsePromise;
}

/**
 * Cache First avec fallback pour les images
 */
async function cacheFirstWithFallback(request) {
    try {
        return await cacheFirst(request);
    } catch (error) {
        console.log('SW: Image cache failed, using fallback:', error);
        
        // Retourne une image placeholder ou une réponse vide
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image indisponible</text></svg>',
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'image/svg+xml'
                }
            }
        );
    }
}

/**
 * Vérifie si une ressource est critique
 */
function isCriticalResource(url) {
    return CRITICAL_RESOURCES.some(resource => url.includes(resource)) ||
           url.includes('/css/themes.css') ||
           url.includes('/css/main.css') ||
           url.includes('/js/main.js');
}

/**
 * Vérifie si c'est un asset statique
 */
function isStaticAsset(url) {
    return /\.(css|js|woff2?|ttf|otf)$/i.test(url) ||
           url.includes('/assets/') ||
           url.includes('fonts.googleapis.com');
}

/**
 * Vérifie si c'est une requête API
 */
function isAPIRequest(url) {
    return url.includes('/data/') ||
           url.includes('/api/') ||
           url.includes('formspree.io') ||
           url.includes('netlify/functions');
}

/**
 * Vérifie si c'est une requête d'image
 */
function isImageRequest(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url) ||
           url.includes('/images/');
}

/**
 * Gestion des messages du client
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

/**
 * Gestion des erreurs
 */
self.addEventListener('error', event => {
    console.error('SW: Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('SW: Unhandled rejection:', event.reason);
});

console.log('SW: Service Worker loaded successfully');