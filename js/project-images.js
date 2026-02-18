// Project Images Management with WebP optimization
// Handles dynamic loading and optimization of project images

import ImageOptimization from './image-optimization.js';

class ProjectImages {
    constructor() {
        this.imageOptimization = null;
        this.projectImageMap = new Map();
        this.loadingPromises = new Map();
        
        this.init();
    }

    async init() {
        // Wait for ImageOptimization to be ready
        if (window.imageOptimization) {
            this.imageOptimization = window.imageOptimization;
        } else {
            // Create new instance if not available
            this.imageOptimization = new ImageOptimization();
        }

        // Initialize project image mappings
        this.initProjectImageMap();
        
        console.log('🖼️ ProjectImages initialized');
    }

    // Map project IDs to their image files
    initProjectImageMap() {
        this.projectImageMap.set('portfolio-2024', '/assets/images/portfolio.webp');
        this.projectImageMap.set('ecommerce-api', '/assets/images/api.webp');
        this.projectImageMap.set('task-mobile-app', '/assets/images/mobile-app.webp');
        this.projectImageMap.set('dashboard-web', '/assets/images/dashboard.webp');
        this.projectImageMap.set('blog-cms', '/assets/images/cms.webp');
        this.projectImageMap.set('weather-pwa', '/assets/images/weather.webp');
        
        // Default fallback images by category
        this.categoryImageMap = new Map([
            ['web', '/assets/images/web-default.webp'],
            ['mobile', '/assets/images/mobile-default.webp'],
            ['api', '/assets/images/api-default.webp']
        ]);
    }

    // Get optimized image URL for a project
    getProjectImageUrl(projectId, category = 'web') {
        // Check specific project image first
        if (this.projectImageMap.has(projectId)) {
            return this.projectImageMap.get(projectId);
        }
        
        // Fall back to category default
        return this.categoryImageMap.get(category) || '/assets/images/placeholder-error.svg';
    }

    // Create optimized project image element
    createProjectImage(projectId, category = 'web', alt = '', className = '') {
        const imageSrc = this.getProjectImageUrl(projectId, category);
        
        return this.imageOptimization.createImage(
            imageSrc,
            alt || `${projectId} project screenshot`,
            `project-image ${className}`.trim(),
            {
                'data-project-id': projectId,
                'data-category': category,
                'loading': 'lazy' // Native lazy loading as fallback
            }
        );
    }

    // Create project image with background
    createProjectBackground(projectId, category = 'web', className = '') {
        const imageSrc = this.getProjectImageUrl(projectId, category);
        
        return this.imageOptimization.createBackgroundElement(
            'div',
            imageSrc,
            `project-bg ${className}`.trim()
        );
    }

    // Preload critical project images
    async preloadCriticalImages(projectIds = []) {
        const preloadPromises = projectIds.map(projectId => {
            const imageSrc = this.getProjectImageUrl(projectId);
            return this.preloadImage(imageSrc);
        });

        try {
            await Promise.all(preloadPromises);
            console.log(`✅ Preloaded ${projectIds.length} critical project images`);
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        }
    }

    // Preload single image
    preloadImage(src) {
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
            img.src = this.imageOptimization.getOptimizedImageSrc(src);
        });

        this.loadingPromises.set(src, promise);
        return promise;
    }

    // Update project card image
    updateProjectCardImage(projectCard, projectData) {
        const imageContainer = projectCard.querySelector('.project-image');
        if (!imageContainer) return;

        // Remove existing image/placeholder
        imageContainer.innerHTML = '';

        // Create new optimized image
        const img = this.createProjectImage(
            projectData.id,
            projectData.category,
            `${projectData.title} screenshot`,
            'responsive-image aspect-ratio-16-9'
        );

        // Add image to container
        imageContainer.appendChild(img);

        // Add hover effects
        img.addEventListener('load', () => {
            projectCard.classList.add('image-loaded');
        });
    }

    // Create responsive image set for different screen sizes
    createResponsiveImage(projectId, category = 'web', alt = '', sizes = '(max-width: 768px) 100vw, 50vw') {
        const baseSrc = this.getProjectImageUrl(projectId, category);
        const img = document.createElement('img');

        // Set up responsive attributes
        img.dataset.src = baseSrc;
        img.alt = alt || `${projectId} project screenshot`;
        img.className = 'project-image responsive-image';
        img.sizes = sizes;

        // Generate srcset for different sizes if supported
        if (this.imageOptimization.supportsWebP) {
            const baseName = baseSrc.replace(/\.[^/.]+$/, "");
            img.dataset.srcset = [
                `${baseName}-400w.webp 400w`,
                `${baseName}-800w.webp 800w`,
                `${baseName}.webp 1200w`
            ].join(', ');
        }

        // Add to lazy loading system
        this.imageOptimization.observeImage(img);

        return img;
    }

    // Generate placeholder SVG for immediate display
    generatePlaceholderSVG(width = 400, height = 300, projectId = '', category = 'web') {
        const categoryIcons = {
            web: '🌐',
            mobile: '📱',
            api: '🔗'
        };

        const icon = categoryIcons[category] || '🚀';
        
        const svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-${projectId}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg-${projectId})"/>
                <text x="50%" y="40%" text-anchor="middle" font-size="${Math.min(width, height) * 0.15}" fill="#6c757d">${icon}</text>
                <text x="50%" y="65%" text-anchor="middle" font-size="${Math.min(width, height) * 0.04}" fill="#495057" font-family="system-ui">Project Image</text>
                <text x="50%" y="80%" text-anchor="middle" font-size="${Math.min(width, height) * 0.03}" fill="#6c757d" font-family="system-ui">Loading...</text>
            </svg>
        `;

        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    // Get performance metrics
    getMetrics() {
        const imageOptMetrics = this.imageOptimization.getPerformanceMetrics();
        
        return {
            ...imageOptMetrics,
            projectImages: this.projectImageMap.size,
            categoryImages: this.categoryImageMap.size,
            preloadCache: this.loadingPromises.size
        };
    }

    // Clean up resources
    destroy() {
        this.projectImageMap.clear();
        this.categoryImageMap.clear();
        this.loadingPromises.clear();
        
        if (this.imageOptimization && this.imageOptimization !== window.imageOptimization) {
            this.imageOptimization.destroy();
        }
    }
}

// Initialize global instance
window.projectImages = new ProjectImages();

export default ProjectImages;