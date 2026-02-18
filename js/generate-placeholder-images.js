// Generate placeholder WebP images for development
// This script creates placeholder images that can be used during development

class PlaceholderImageGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Generate a placeholder image with specific content
    generatePlaceholder(width, height, config = {}) {
        const {
            backgroundColor = '#f0f2f5',
            textColor = '#6c757d',
            iconColor = '#dee2e6',
            title = 'Project Image',
            subtitle = `${width}×${height}`,
            icon = '🚀'
        } = config;

        this.canvas.width = width;
        this.canvas.height = height;

        // Background
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Icon
        const iconSize = Math.min(width, height) * 0.2;
        this.ctx.font = `${iconSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(icon, width / 2, height / 2 - 20);

        // Title
        this.ctx.fillStyle = textColor;
        this.ctx.font = `${Math.min(width, height) * 0.04}px Arial`;
        this.ctx.fillText(title, width / 2, height / 2 + 40);

        // Subtitle
        this.ctx.font = `${Math.min(width, height) * 0.03}px Arial`;
        this.ctx.fillStyle = iconColor;
        this.ctx.fillText(subtitle, width / 2, height / 2 + 65);

        return this.canvas.toDataURL('image/png');
    }

    // Convert to WebP blob
    async generateWebPPlaceholder(width, height, config = {}, quality = 0.8) {
        this.generatePlaceholder(width, height, config);
        
        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/webp', quality);
        });
    }

    // Generate project-specific placeholders
    async generateProjectImages() {
        const projects = [
            { name: 'portfolio', icon: '🌟', title: 'Portfolio' },
            { name: 'api', icon: '🔗', title: 'API REST' },
            { name: 'mobile-app', icon: '📱', title: 'Mobile App' },
            { name: 'dashboard', icon: '📊', title: 'Dashboard' },
            { name: 'cms', icon: '📝', title: 'CMS Blog' },
            { name: 'weather', icon: '🌤️', title: 'Weather PWA' }
        ];

        const images = {};

        for (const project of projects) {
            const blob = await this.generateWebPPlaceholder(800, 600, {
                backgroundColor: '#f8f9fa',
                title: project.title,
                icon: project.icon,
                subtitle: 'WebP Optimized'
            });
            
            images[project.name] = blob;
        }

        return images;
    }

    // Download generated images
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Export for use in dev tools
window.PlaceholderImageGenerator = PlaceholderImageGenerator;

export default PlaceholderImageGenerator;