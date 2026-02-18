// Image Optimization & Lazy Loading System
// WebP support detection and progressive image loading

class ImageOptimization {
    constructor() {
        this.supportsWebP = false;
        this.lazyImages = new Map();
        this.observer = null;
        this.imageCache = new Map();
        
        this.init();
    }

    async init() {
        console.log('🖼️ Initializing image optimization system...');
        
        // Check WebP support
        await this.checkWebPSupport();
        
        // Initialize Intersection Observer for lazy loading
        this.initLazyLoading();
        
        // Process existing images
        this.processExistingImages();
        
        console.log(`✅ Image optimization initialized (WebP: ${this.supportsWebP ? 'supported' : 'not supported'})`);
    }

    // Check if browser supports WebP format
    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = (webP.height === 2);
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Initialize Intersection Observer for lazy loading
    initLazyLoading() {
        const options = {
            root: null,
            rootMargin: '50px 0px', // Start loading 50px before image enters viewport
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, options);
    }

    // Process all existing images in the DOM
    processExistingImages() {
        const images = document.querySelectorAll('img[data-src], [data-bg-src]');
        images.forEach(img => this.observeImage(img));
    }

    // Add an image to be lazy loaded
    observeImage(element) {
        if (!element) return;
        
        // Add loading placeholder
        this.addLoadingPlaceholder(element);
        
        // Store original data
        const imageData = {
            element,
            src: element.dataset.src || element.dataset.bgSrc,
            isBackground: !!element.dataset.bgSrc,
            loaded: false
        };
        
        this.lazyImages.set(element, imageData);
        this.observer.observe(element);
    }

    // Add visual loading placeholder
    addLoadingPlaceholder(element) {
        if (element.tagName === 'IMG') {
            element.classList.add('lazy-loading');
            
            // Create a low-quality placeholder or use existing placeholder
            if (!element.src || element.src === '') {
                element.src = this.generatePlaceholder(element.width || 400, element.height || 300);
            }
        } else {
            // For background images
            element.classList.add('lazy-bg-loading');
        }
    }

    // Generate a simple placeholder image
    generatePlaceholder(width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Create gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add loading indicator
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', width / 2, height / 2);
        
        return canvas.toDataURL();
    }

    // Load image when it enters viewport
    async loadImage(element) {
        const imageData = this.lazyImages.get(element);
        if (!imageData || imageData.loaded) return;

        try {
            const optimizedSrc = this.getOptimizedImageSrc(imageData.src);
            
            // Preload image
            await this.preloadImage(optimizedSrc);
            
            // Apply loaded image
            if (imageData.isBackground) {
                element.style.backgroundImage = `url('${optimizedSrc}')`;
                element.classList.remove('lazy-bg-loading');
                element.classList.add('lazy-bg-loaded');
            } else {
                element.src = optimizedSrc;
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-loaded');
            }
            
            // Mark as loaded
            imageData.loaded = true;
            
            // Stop observing
            this.observer.unobserve(element);
            
            console.log(`📷 Lazy loaded: ${optimizedSrc}`);
            
        } catch (error) {
            console.error('Error loading image:', error);
            this.handleImageError(element, imageData);
        }
    }

    // Get optimized image source (WebP if supported)
    getOptimizedImageSrc(originalSrc) {
        if (!originalSrc) return '';
        
        // Check cache first
        if (this.imageCache.has(originalSrc)) {
            return this.imageCache.get(originalSrc);
        }
        
        let optimizedSrc = originalSrc;
        
        // Convert to WebP if supported and not already WebP
        if (this.supportsWebP && !originalSrc.endsWith('.webp')) {
            const extension = originalSrc.split('.').pop();
            if (['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
                optimizedSrc = originalSrc.replace(new RegExp(`\\.${extension}$`, 'i'), '.webp');
            }
        }
        
        // Cache the result
        this.imageCache.set(originalSrc, optimizedSrc);
        
        return optimizedSrc;
    }

    // Preload image to ensure it's ready
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(src);
            img.onerror = () => {
                // Fallback to original format if WebP fails
                if (src.endsWith('.webp')) {
                    const fallbackSrc = this.getFallbackImageSrc(src);
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => resolve(fallbackSrc);
                    fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                    fallbackImg.src = fallbackSrc;
                } else {
                    reject(new Error(`Failed to load image: ${src}`));
                }
            };
            
            img.src = src;
        });
    }

    // Get fallback image source for WebP
    getFallbackImageSrc(webpSrc) {
        return webpSrc.replace('.webp', '.jpg');
    }

    // Handle image loading errors
    handleImageError(element, imageData) {
        element.classList.add('lazy-error');
        
        if (imageData.isBackground) {
            element.style.backgroundImage = 'none';
        } else {
            element.src = '/assets/images/placeholder-error.svg';
            element.alt = 'Image could not be loaded';
        }
    }

    // Public method to add new images dynamically
    addImage(element, src, isBackground = false) {
        if (isBackground) {
            element.dataset.bgSrc = src;
        } else {
            element.dataset.src = src;
        }
        
        this.observeImage(element);
    }

    // Create optimized image element
    createImage(src, alt = '', className = '', attributes = {}) {
        const img = document.createElement('img');
        
        img.dataset.src = src;
        img.alt = alt;
        img.className = `lazy-image ${className}`.trim();
        
        // Add additional attributes
        Object.entries(attributes).forEach(([key, value]) => {
            img.setAttribute(key, value);
        });
        
        this.observeImage(img);
        
        return img;
    }

    // Create element with optimized background image
    createBackgroundElement(tagName, src, className = '') {
        const element = document.createElement(tagName);
        
        element.dataset.bgSrc = src;
        element.className = `lazy-bg ${className}`.trim();
        
        this.observeImage(element);
        
        return element;
    }

    // Performance metrics
    getPerformanceMetrics() {
        const totalImages = this.lazyImages.size;
        const loadedImages = Array.from(this.lazyImages.values()).filter(img => img.loaded).length;
        const webpImages = Array.from(this.imageCache.values()).filter(src => src.endsWith('.webp')).length;
        
        return {
            totalImages,
            loadedImages,
            webpImages,
            webpSupported: this.supportsWebP,
            cacheSize: this.imageCache.size
        };
    }

    // Clean up
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.lazyImages.clear();
        this.imageCache.clear();
    }
}

// CSS styles for lazy loading
const lazyLoadingStyles = `
    .lazy-loading,
    .lazy-bg-loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite linear;
        min-height: 200px;
        transition: opacity 0.3s ease;
    }

    .lazy-loaded,
    .lazy-bg-loaded {
        opacity: 1;
        animation: fadeIn 0.5s ease;
    }

    .lazy-error {
        background-color: #f5f5f5;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
    }

    .lazy-image {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .lazy-bg {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition: opacity 0.3s ease;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Responsive image utility classes */
    .responsive-image {
        width: 100%;
        height: auto;
        display: block;
    }

    .aspect-ratio-16-9 {
        aspect-ratio: 16/9;
        object-fit: cover;
    }

    .aspect-ratio-4-3 {
        aspect-ratio: 4/3;
        object-fit: cover;
    }

    .aspect-ratio-1-1 {
        aspect-ratio: 1/1;
        object-fit: cover;
    }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = lazyLoadingStyles;
document.head.appendChild(styleElement);

// Initialize global instance
window.imageOptimization = new ImageOptimization();

export default ImageOptimization;