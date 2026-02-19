/**
 * Performance Optimizer Module
 * Optimise les performances pour atteindre un score Lighthouse 95+
 * et maintenir le bundle total < 100kb
 */

class PerformanceOptimizer {
    constructor() {
        this.criticalResources = new Set();
        this.deferredResources = new Map();
        this.observerInstance = null;
        this.performanceMetrics = {
            loadStart: performance.now(),
            domReady: null,
            loadComplete: null,
            totalSize: 0,
            criticalSize: 0
        };

        this.init();
    }

    init() {
        // Vite handles all CSS/JS bundling - no manual preloading needed
        this.setupIntersectionObserver();
        this.optimizeImages();
        this.setupPerformanceMonitoring();

        document.addEventListener('DOMContentLoaded', () => {
            this.performanceMetrics.domReady = performance.now();
            this.optimizeDOMInteractions();
        });

        window.addEventListener('load', () => {
            this.performanceMetrics.loadComplete = performance.now();
            this.analyzePerformance();
        });
    }

    // NOTE: preloadCriticalResources, deferNonCriticalResources, loadCSSAsync,
    // deferScript, and loadScript have been REMOVED because Vite handles all
    // CSS/JS bundling. Those methods were loading old unbundled paths that
    // don't exist in the Vite build output (e.g., /css/themes.css, /js/animations.js).

    /**
     * Configure l'Intersection Observer pour le lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback pour les navigateurs anciens
            this.loadAllDeferred();
            return;
        }

        this.observerInstance = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const callback = element._lazyCallback;
                        if (callback) {
                            callback();
                            delete element._lazyCallback;
                            this.observerInstance.unobserve(element);
                        }
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }

    /**
     * Observe un élément pour le lazy loading
     */
    observeElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element && this.observerInstance) {
            element._lazyCallback = callback;
            this.observerInstance.observe(element);
        } else if (element) {
            // Fallback si pas d'observer
            callback();
        }
    }

    /**
     * Optimise les images
     */
    optimizeImages() {
        // Lazy loading des images
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            this.observeElement(img, () => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.onload = () => img.classList.add('loaded');
            });
        });

        // WebP fallback
        if (this.supportsWebP()) {
            this.convertToWebP();
        }
    }

    /**
     * Vérifie le support WebP
     */
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    }

    /**
     * Convertit les images en WebP si supporté
     */
    convertToWebP() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.src.includes('.webp')) {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                // Teste si l'image WebP existe
                this.testImageExists(webpSrc)
                    .then(() => {
                        img.src = webpSrc;
                    })
                    .catch(() => {
                        // Garde l'image originale si WebP n'existe pas
                    });
            }
        });
    }

    /**
     * Teste si une image existe
     */
    testImageExists(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Optimise les interactions DOM
     */
    optimizeDOMInteractions() {
        // Débounce/Throttle les événements coûteux
        let scrollTimeout;
        const originalScrollHandler = window.onscroll;

        window.onscroll = () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                if (originalScrollHandler) originalScrollHandler();
                scrollTimeout = null;
            }, 16); // 60fps
        };

        // Optimise les animations
        this.optimizeAnimations();
    }

    /**
     * Optimise les animations
     */
    optimizeAnimations() {
        // Utilise will-change pour les éléments animés
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .floating, .morphing-shape');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform, opacity';
        });

        // Nettoie will-change après l'animation
        document.addEventListener('animationend', (e) => {
            e.target.style.willChange = 'auto';
        });
    }

    /**
     * Polyfill pour requestIdleCallback
     */
    requestIdleCallback(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    /**
     * Configure le monitoring de performance
     */
    setupPerformanceMonitoring() {
        // Web Vitals
        this.measureWebVitals();

        // Bundle size tracking
        this.trackBundleSize();

        // Resource timing
        this.trackResourceTiming();
    }

    /**
     * Mesure les Web Vitals
     */
    measureWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    console.log('FCP:', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    /**
     * Trace la taille du bundle
     */
    trackBundleSize() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.initiatorType === 'script' || entry.initiatorType === 'css') {
                        this.performanceMetrics.totalSize += entry.transferSize || entry.encodedBodySize || 0;
                    }
                }

                if (this.performanceMetrics.totalSize > 0) {
                    console.log('Bundle size:', (this.performanceMetrics.totalSize / 1024).toFixed(2) + 'kb');

                    if (this.performanceMetrics.totalSize > 100000) {
                        console.warn('⚠️ Bundle size exceeds 100kb target');
                    } else {
                        console.log('✅ Bundle size within 100kb target');
                    }
                }
            }).observe({ entryTypes: ['resource'] });
        }
    }

    /**
     * Trace le timing des ressources
     */
    trackResourceTiming() {
        window.addEventListener('load', () => {
            const entries = performance.getEntriesByType('resource');
            const slowResources = entries.filter(entry => entry.duration > 1000);

            if (slowResources.length > 0) {
                console.warn('Slow resources detected:', slowResources);
            }
        });
    }

    /**
     * Analyse les performances finales
     */
    analyzePerformance() {
        const metrics = this.performanceMetrics;
        const domTime = metrics.domReady - metrics.loadStart;
        const loadTime = metrics.loadComplete - metrics.loadStart;

        console.log('Performance Analysis:');
        console.log('- DOM Ready:', domTime.toFixed(2) + 'ms');
        console.log('- Load Complete:', loadTime.toFixed(2) + 'ms');
        console.log('- Critical Resources:', this.criticalResources.size);
        console.log('- Deferred Resources:', this.deferredResources.size);

        // Recommandations
        if (domTime > 1000) {
            console.warn('⚠️ DOM ready time is slow (>1s)');
        }

        if (loadTime > 3000) {
            console.warn('⚠️ Load time is slow (>3s)');
        }

        if (domTime < 500 && loadTime < 2000) {
            console.log('✅ Performance targets met!');
        }
    }

    /**
     * Charge toutes les ressources différées (fallback)
     */
    loadAllDeferred() {
        // Pour les navigateurs qui ne supportent pas IntersectionObserver
        setTimeout(() => {
            document.querySelectorAll('script[data-src]').forEach(script => {
                script.src = script.dataset.src;
                script.removeAttribute('data-src');
            });
        }, 2000);
    }
}

// Initialise l'optimiseur de performance
const performanceOptimizer = new PerformanceOptimizer();

// Export pour utilisation dans d'autres modules
export default PerformanceOptimizer;