// WebP Image Converter Utility
// Converts existing images to WebP format for better performance

class WebPConverter {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
    }

    // Initialize canvas for image processing
    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }
    }

    // Convert image file to WebP
    async convertToWebP(file, quality = 0.8) {
        if (!this.isImageFile(file)) {
            throw new Error('File is not a supported image format');
        }

        this.init();

        try {
            // Load image
            const img = await this.loadImageFromFile(file);
            
            // Set canvas dimensions
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;
            
            // Draw image to canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            // Convert to WebP
            return new Promise((resolve, reject) => {
                this.canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert image to WebP'));
                    }
                }, 'image/webp', quality);
            });
            
        } catch (error) {
            throw new Error(`Conversion failed: ${error.message}`);
        }
    }

    // Convert image URL to WebP
    async convertUrlToWebP(imageUrl, quality = 0.8) {
        try {
            // Fetch image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }
            
            const blob = await response.blob();
            return await this.convertToWebP(new File([blob], 'image', { type: blob.type }), quality);
            
        } catch (error) {
            throw new Error(`URL conversion failed: ${error.message}`);
        }
    }

    // Load image from file
    loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    // Check if file is a supported image format
    isImageFile(file) {
        return this.supportedFormats.includes(file.type);
    }

    // Resize image while converting
    async convertAndResize(file, width, height, quality = 0.8, maintainAspect = true) {
        if (!this.isImageFile(file)) {
            throw new Error('File is not a supported image format');
        }

        this.init();

        try {
            const img = await this.loadImageFromFile(file);
            
            // Calculate dimensions
            let newWidth = width;
            let newHeight = height;
            
            if (maintainAspect) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                
                if (width && !height) {
                    newWidth = width;
                    newHeight = width / aspectRatio;
                } else if (height && !width) {
                    newHeight = height;
                    newWidth = height * aspectRatio;
                } else if (width && height) {
                    const targetAspect = width / height;
                    if (aspectRatio > targetAspect) {
                        newWidth = width;
                        newHeight = width / aspectRatio;
                    } else {
                        newHeight = height;
                        newWidth = height * aspectRatio;
                    }
                }
            }
            
            // Set canvas dimensions
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
            
            // Draw and resize image
            this.ctx.clearRect(0, 0, newWidth, newHeight);
            this.ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            // Convert to WebP
            return new Promise((resolve, reject) => {
                this.canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert and resize image'));
                    }
                }, 'image/webp', quality);
            });
            
        } catch (error) {
            throw new Error(`Resize and conversion failed: ${error.message}`);
        }
    }

    // Generate multiple sizes for responsive images
    async generateResponsiveSizes(file, sizes = [400, 800, 1200], quality = 0.8) {
        const results = {};
        
        for (const size of sizes) {
            try {
                const webpBlob = await this.convertAndResize(file, size, null, quality);
                results[`${size}w`] = webpBlob;
            } catch (error) {
                console.warn(`Failed to generate ${size}px version:`, error);
            }
        }
        
        return results;
    }

    // Batch convert multiple files
    async batchConvert(files, options = {}) {
        const { quality = 0.8, onProgress, onError } = options;
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            try {
                const webpBlob = await this.convertToWebP(files[i], quality);
                results.push({
                    original: files[i],
                    webp: webpBlob,
                    success: true
                });
                
                if (onProgress) {
                    onProgress(i + 1, files.length);
                }
            } catch (error) {
                results.push({
                    original: files[i],
                    error: error.message,
                    success: false
                });
                
                if (onError) {
                    onError(files[i], error);
                }
            }
        }
        
        return results;
    }

    // Get image metadata
    async getImageInfo(file) {
        if (!this.isImageFile(file)) {
            throw new Error('File is not a supported image format');
        }

        try {
            const img = await this.loadImageFromFile(file);
            
            return {
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: file.size,
                type: file.type,
                aspectRatio: img.naturalWidth / img.naturalHeight,
                megapixels: (img.naturalWidth * img.naturalHeight) / 1000000
            };
        } catch (error) {
            throw new Error(`Failed to get image info: ${error.message}`);
        }
    }

    // Estimate WebP file size reduction
    estimateWebPSavings(originalSize, quality = 0.8) {
        // WebP typically provides 25-35% smaller files than JPEG
        // and 25-50% smaller than PNG
        const compressionRatio = quality > 0.9 ? 0.7 : quality > 0.7 ? 0.65 : 0.6;
        const estimatedSize = Math.round(originalSize * compressionRatio);
        const savings = originalSize - estimatedSize;
        const savingsPercent = Math.round((savings / originalSize) * 100);
        
        return {
            originalSize,
            estimatedSize,
            savings,
            savingsPercent
        };
    }

    // Clean up resources
    destroy() {
        if (this.canvas) {
            this.canvas = null;
            this.ctx = null;
        }
    }
}

// Utility functions for client-side image processing
export const imageUtils = {
    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Create data URL from blob
    async blobToDataURL(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

export default WebPConverter;