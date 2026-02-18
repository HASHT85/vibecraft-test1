// Generate WebP images for development
// Creates realistic placeholder WebP images for projects

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createCanvas, registerFont } from 'canvas';

class WebPImageGenerator {
    constructor() {
        this.outputDir = 'assets/images';
        this.width = 800;
        this.height = 600;
    }

    async generateProjectImages() {
        // Ensure output directory exists
        if (!existsSync(this.outputDir)) {
            await mkdir(this.outputDir, { recursive: true });
        }

        const projects = [
            {
                name: 'portfolio',
                title: 'Portfolio',
                icon: '🌟',
                colors: ['#667eea', '#764ba2'],
                tech: ['HTML5', 'CSS3', 'JS', 'Vite']
            },
            {
                name: 'api',
                title: 'REST API',
                icon: '🔗',
                colors: ['#f093fb', '#f5576c'],
                tech: ['Node.js', 'Express', 'MongoDB']
            },
            {
                name: 'mobile-app',
                title: 'Mobile App',
                icon: '📱',
                colors: ['#4facfe', '#00f2fe'],
                tech: ['React Native', 'TypeScript']
            },
            {
                name: 'dashboard',
                title: 'Dashboard',
                icon: '📊',
                colors: ['#43e97b', '#38f9d7'],
                tech: ['React', 'Chart.js', 'Tailwind']
            },
            {
                name: 'cms',
                title: 'CMS Blog',
                icon: '📝',
                colors: ['#fa709a', '#fee140'],
                tech: ['Next.js', 'Strapi', 'GraphQL']
            },
            {
                name: 'weather',
                title: 'Weather PWA',
                icon: '🌤️',
                colors: ['#a8edea', '#fed6e3'],
                tech: ['Vanilla JS', 'PWA', 'IndexedDB']
            }
        ];

        for (const project of projects) {
            const canvas = this.createProjectCanvas(project);
            const buffer = canvas.toBuffer('image/png');
            
            const filename = `${this.outputDir}/${project.name}.webp`;
            await writeFile(filename, buffer);
            
            console.log(`✅ Generated: ${filename}`);
        }

        // Generate default category images
        await this.generateCategoryImages();
        
        console.log('🎨 All WebP images generated successfully');
    }

    createProjectCanvas(project) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, project.colors[0]);
        gradient.addColorStop(1, project.colors[1]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Add subtle pattern
        this.addPattern(ctx);

        // Project icon
        ctx.font = '120px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(project.icon, this.width / 2, this.height / 2 - 50);

        // Project title
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(project.title, this.width / 2, this.height / 2 + 40);

        // Tech tags
        this.drawTechTags(ctx, project.tech);

        // Add shine effect
        this.addShineEffect(ctx);

        return canvas;
    }

    addPattern(ctx) {
        // Add subtle geometric pattern
        ctx.globalAlpha = 0.1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        for (let i = 0; i < this.width; i += 50) {
            for (let j = 0; j < this.height; j += 50) {
                ctx.beginPath();
                ctx.arc(i, j, 20, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;
    }

    drawTechTags(ctx, technologies) {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        const tagWidth = 80;
        const tagHeight = 30;
        const spacing = 10;
        const totalWidth = (tagWidth + spacing) * technologies.length - spacing;
        const startX = (this.width - totalWidth) / 2;
        const y = this.height - 80;

        technologies.forEach((tech, index) => {
            const x = startX + (tagWidth + spacing) * index;
            
            // Tag background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, y, tagWidth, tagHeight);
            
            // Tag text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.textAlign = 'center';
            ctx.fillText(tech, x + tagWidth / 2, y + 20);
        });
    }

    addShineEffect(ctx) {
        // Add diagonal shine effect
        const gradient = ctx.createLinearGradient(0, 0, this.width / 2, this.height / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width / 2, this.height);
    }

    async generateCategoryImages() {
        const categories = [
            {
                name: 'web-default',
                title: 'Web Application',
                icon: '🌐',
                colors: ['#667eea', '#764ba2']
            },
            {
                name: 'mobile-default',
                title: 'Mobile App',
                icon: '📱',
                colors: ['#4facfe', '#00f2fe']
            },
            {
                name: 'api-default',
                title: 'API Service',
                icon: '🔗',
                colors: ['#f093fb', '#f5576c']
            }
        ];

        for (const category of categories) {
            const canvas = this.createProjectCanvas({
                ...category,
                tech: ['Modern', 'Scalable', 'Optimized']
            });
            
            const buffer = canvas.toBuffer('image/png');
            const filename = `${this.outputDir}/${category.name}.webp`;
            await writeFile(filename, buffer);
            
            console.log(`✅ Generated category image: ${filename}`);
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new WebPImageGenerator();
    generator.generateProjectImages().catch(console.error);
}

export default WebPImageGenerator;