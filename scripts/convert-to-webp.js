// Convert SVG images to WebP format
// Uses sharp library for high-quality image conversion

import sharp from 'sharp';
import { readdir, readFile } from 'fs/promises';
import { join, parse } from 'path';

class SVGToWebPConverter {
    constructor() {
        this.inputDir = 'assets/images';
        this.quality = 85;
        this.sizes = [
            { width: 800, height: 600, suffix: '' },
            { width: 400, height: 300, suffix: '-400w' },
            { width: 1200, height: 900, suffix: '-1200w' }
        ];
    }

    async convertAllSVGs() {
        try {
            console.log('🔄 Starting SVG to WebP conversion...');
            
            const files = await readdir(this.inputDir);
            const svgFiles = files.filter(file => file.endsWith('.svg') && file !== 'placeholder-error.svg');
            
            console.log(`Found ${svgFiles.length} SVG files to convert`);
            
            for (const svgFile of svgFiles) {
                await this.convertSVGToWebP(svgFile);
            }
            
            console.log('✅ All SVG files converted to WebP successfully');
            
        } catch (error) {
            console.error('❌ Error during conversion:', error);
        }
    }

    async convertSVGToWebP(svgFileName) {
        const svgPath = join(this.inputDir, svgFileName);
        const { name } = parse(svgFileName);
        
        try {
            // Read SVG file
            const svgBuffer = await readFile(svgPath);
            
            // Convert to different sizes
            for (const size of this.sizes) {
                const outputPath = join(this.inputDir, `${name}${size.suffix}.webp`);
                
                await sharp(svgBuffer)
                    .resize(size.width, size.height)
                    .webp({ 
                        quality: this.quality,
                        effort: 6,
                        lossless: false
                    })
                    .toFile(outputPath);
                
                console.log(`✅ Created: ${name}${size.suffix}.webp (${size.width}×${size.height})`);
            }
            
        } catch (error) {
            console.error(`❌ Error converting ${svgFileName}:`, error);
        }
    }

    // Convert a single file with custom options
    async convertFile(inputPath, outputPath, options = {}) {
        const {
            width = 800,
            height = 600,
            quality = this.quality,
            lossless = false
        } = options;

        try {
            await sharp(inputPath)
                .resize(width, height)
                .webp({
                    quality,
                    effort: 6,
                    lossless
                })
                .toFile(outputPath);
            
            console.log(`✅ Converted: ${inputPath} → ${outputPath}`);
            
        } catch (error) {
            console.error(`❌ Error converting ${inputPath}:`, error);
        }
    }

    // Generate responsive image variants
    async generateResponsiveVariants(svgFileName) {
        const svgPath = join(this.inputDir, svgFileName);
        const { name } = parse(svgFileName);
        
        const responsiveSizes = [
            { width: 320, height: 240, suffix: '-mobile' },
            { width: 768, height: 576, suffix: '-tablet' },
            { width: 1024, height: 768, suffix: '-desktop' },
            { width: 1920, height: 1440, suffix: '-hd' }
        ];

        try {
            const svgBuffer = await readFile(svgPath);
            
            for (const size of responsiveSizes) {
                const outputPath = join(this.inputDir, `${name}${size.suffix}.webp`);
                
                await sharp(svgBuffer)
                    .resize(size.width, size.height, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .webp({ 
                        quality: this.quality,
                        effort: 6 
                    })
                    .toFile(outputPath);
                
                console.log(`📱 Created responsive variant: ${name}${size.suffix}.webp`);
            }
            
        } catch (error) {
            console.error(`❌ Error generating responsive variants for ${svgFileName}:`, error);
        }
    }

    // Create optimized avatar from existing WebP
    async optimizeAvatar() {
        const inputPath = join(this.inputDir, 'avatar.webp');
        const sizes = [
            { size: 150, suffix: '-150' },
            { size: 300, suffix: '-300' },
            { size: 500, suffix: '-500' }
        ];

        try {
            for (const { size, suffix } of sizes) {
                const outputPath = join(this.inputDir, `avatar${suffix}.webp`);
                
                await sharp(inputPath)
                    .resize(size, size, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .webp({
                        quality: 90,
                        effort: 6
                    })
                    .toFile(outputPath);
                
                console.log(`👤 Created avatar variant: avatar${suffix}.webp (${size}×${size})`);
            }
            
        } catch (error) {
            console.warn('⚠️ Could not optimize avatar (file might not exist)');
        }
    }

    // Get file size information
    async getFileSizeInfo() {
        try {
            const files = await readdir(this.inputDir);
            const webpFiles = files.filter(file => file.endsWith('.webp'));
            const svgFiles = files.filter(file => file.endsWith('.svg'));
            
            console.log('\n📊 File size summary:');
            console.log(`SVG files: ${svgFiles.length}`);
            console.log(`WebP files: ${webpFiles.length}`);
            
            let totalWebPSize = 0;
            for (const file of webpFiles) {
                const filePath = join(this.inputDir, file);
                const stats = await sharp(filePath).stats();
                console.log(`  ${file}: ${this.formatBytes(stats.size || 0)}`);
                totalWebPSize += stats.size || 0;
            }
            
            console.log(`\nTotal WebP size: ${this.formatBytes(totalWebPSize)}`);
            
        } catch (error) {
            console.error('❌ Error getting file size info:', error);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Run converter
const converter = new SVGToWebPConverter();
await converter.convertAllSVGs();
await converter.optimizeAvatar();
await converter.getFileSizeInfo();

export default SVGToWebPConverter;