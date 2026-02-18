// Enhanced Animations with Intersection Observer - Version 2.0

/**
 * Animation system using Intersection Observer API
 * Provides scroll-triggered animations with performance optimization
 */

class ScrollAnimations {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.config = {
            default: {
                threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
                rootMargin: '0px 0px -50px 0px'
            },
            entrance: {
                threshold: 0.1,
                rootMargin: '0px 0px -10% 0px'
            },
            parallax: {
                threshold: 0,
                rootMargin: '0px'
            },
            counter: {
                threshold: 0.5,
                rootMargin: '0px 0px -20% 0px'
            }
        };
        
        this.init();
    }

    init() {
        if (!window.IntersectionObserver) {
            console.warn('IntersectionObserver not supported, falling back to scroll events');
            this.initFallback();
            return;
        }

        this.setupObservers();
        this.observeElements();
        this.initSpecialAnimations();
        
        console.log('✅ Enhanced scroll animations initialized');
    }

    setupObservers() {
        // Main entrance animations observer
        this.observers.set('entrance', new IntersectionObserver(
            this.handleEntranceAnimations.bind(this),
            this.config.entrance
        ));

        // Parallax effects observer
        this.observers.set('parallax', new IntersectionObserver(
            this.handleParallaxAnimations.bind(this),
            this.config.parallax
        ));

        // Counter animations observer
        this.observers.set('counter', new IntersectionObserver(
            this.handleCounterAnimations.bind(this),
            this.config.counter
        ));

        // Progress bars observer
        this.observers.set('progress', new IntersectionObserver(
            this.handleProgressAnimations.bind(this),
            this.config.entrance
        ));
    }

    observeElements() {
        // Observe entrance animation elements
        const entranceElements = document.querySelectorAll([
            '.animate-on-scroll',
            '.glass-card:not(.hero .glass-card)',
            '.section-title',
            '.project-card',
            '.contact-info',
            '.contact-form',
            '.skill-tag',
            '.project-link'
        ].join(', '));

        entranceElements.forEach((element, index) => {
            element.dataset.animationIndex = index;
            this.observers.get('entrance').observe(element);
        });

        // Observe parallax elements
        const parallaxElements = document.querySelectorAll([
            '.parallax-element',
            '.floating-shapes',
            '.shape',
            '.hero-background'
        ].join(', '));

        parallaxElements.forEach(element => {
            this.observers.get('parallax').observe(element);
        });

        // Observe counter elements
        const counterElements = document.querySelectorAll('[data-counter]');
        counterElements.forEach(element => {
            this.observers.get('counter').observe(element);
        });

        // Observe progress elements
        const progressElements = document.querySelectorAll('.progress-bar, .skill-progress');
        progressElements.forEach(element => {
            this.observers.get('progress').observe(element);
        });
    }

    handleEntranceAnimations(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animateEntrance(entry.target);
                this.animatedElements.add(entry.target);
            }
        });
    }

    animateEntrance(element) {
        const animationType = this.getAnimationType(element);
        const delay = this.calculateDelay(element);
        
        // Add base animation class
        element.classList.add('animate-entrance');
        
        // Apply specific animation with delay
        setTimeout(() => {
            element.classList.add(animationType);
            element.style.animationDelay = `${delay}ms`;
            
            // Trigger custom events for other modules
            element.dispatchEvent(new CustomEvent('elementAnimated', {
                detail: { type: animationType, delay }
            }));
        }, 50);
    }

    getAnimationType(element) {
        // Determine animation based on element type and position
        if (element.classList.contains('section-title')) {
            return 'fadeInDown';
        }
        
        if (element.classList.contains('project-card')) {
            return 'scaleIn';
        }
        
        if (element.classList.contains('contact-info')) {
            return 'fadeInLeft';
        }
        
        if (element.classList.contains('contact-form')) {
            return 'fadeInRight';
        }
        
        if (element.classList.contains('skill-tag')) {
            return 'bounceIn';
        }

        if (element.classList.contains('glass-card')) {
            return 'glassReveal';
        }
        
        // Default animation
        return 'fadeInUp';
    }

    calculateDelay(element) {
        const baseDelay = 0;
        const staggerDelay = 100;
        
        // Staggered animation for grid items
        if (element.closest('.projects-grid, .skills-preview')) {
            const parent = element.closest('.projects-grid, .skills-preview');
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(element);
            return index * staggerDelay;
        }
        
        // Animation index from dataset
        if (element.dataset.animationIndex) {
            return parseInt(element.dataset.animationIndex) * 50;
        }
        
        return baseDelay;
    }

    handleParallaxAnimations(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.updateParallax(entry.target, entry.intersectionRatio);
            }
        });
    }

    updateParallax(element, intersectionRatio) {
        if (element.classList.contains('shape')) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            const rotation = scrolled * 0.1;
            
            element.style.transform = `translate3d(0, ${rate}px, 0) rotate(${rotation}deg)`;
        }
        
        if (element.classList.contains('hero-background')) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            element.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
    }

    handleCounterAnimations(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animateCounter(entry.target);
                this.animatedElements.add(entry.target);
            }
        });
    }

    animateCounter(element) {
        const finalValue = parseInt(element.dataset.counter);
        const duration = parseInt(element.dataset.duration) || 2000;
        const startValue = 0;
        
        let currentValue = startValue;
        const increment = finalValue / (duration / 16); // 60fps
        
        const updateCounter = () => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                element.textContent = finalValue;
                return;
            }
            
            element.textContent = Math.floor(currentValue);
            requestAnimationFrame(updateCounter);
        };
        
        updateCounter();
    }

    handleProgressAnimations(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animateProgress(entry.target);
                this.animatedElements.add(entry.target);
            }
        });
    }

    animateProgress(element) {
        const targetWidth = element.dataset.progress || '100%';
        const duration = parseInt(element.dataset.duration) || 1500;
        
        element.style.width = '0%';
        element.style.transition = `width ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.width = targetWidth;
        }, 100);
    }

    // Special animations for specific use cases
    initSpecialAnimations() {
        this.initTypewriterEffect();
        this.initStaggeredTextReveal();
        this.initMorphingShapes();
    }

    initTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.typewriterAnimation(entry.target);
                        this.animatedElements.add(entry.target);
                    }
                });
            }, this.config.entrance);
            
            observer.observe(element);
        });
    }

    typewriterAnimation(element) {
        const text = element.dataset.typewriter;
        const speed = parseInt(element.dataset.speed) || 80;
        
        element.textContent = '';
        element.style.borderRight = '2px solid var(--text-accent)';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Remove cursor after animation
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        typeWriter();
    }

    initStaggeredTextReveal() {
        const textElements = document.querySelectorAll('.staggered-text');
        
        textElements.forEach(element => {
            const words = element.textContent.split(' ');
            element.innerHTML = words.map(word => 
                `<span class="word-reveal">${word}</span>`
            ).join(' ');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.revealWords(entry.target);
                    }
                });
            }, this.config.entrance);
            
            observer.observe(element);
        });
    }

    revealWords(element) {
        const words = element.querySelectorAll('.word-reveal');
        
        words.forEach((word, index) => {
            setTimeout(() => {
                word.classList.add('revealed');
            }, index * 150);
        });
    }

    initMorphingShapes() {
        const morphingElements = document.querySelectorAll('.morphing-shape');
        
        morphingElements.forEach(element => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        element.classList.add('morphing-active');
                    }
                });
            }, this.config.default);
            
            observer.observe(element);
        });
    }

    // Fallback for browsers without IntersectionObserver
    initFallback() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.checkElementsInViewport();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        this.checkElementsInViewport(); // Initial check
    }

    checkElementsInViewport() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            if (this.animatedElements.has(element)) return;
            
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < windowHeight && elementBottom >= 0) {
                this.animateEntrance(element);
                this.animatedElements.add(element);
            }
        });
    }

    // Public API methods
    addCustomAnimation(element, animationType, delay = 0) {
        setTimeout(() => {
            element.classList.add(animationType);
        }, delay);
    }

    pauseAnimations() {
        this.observers.forEach(observer => observer.disconnect());
    }

    resumeAnimations() {
        this.setupObservers();
        this.observeElements();
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animatedElements.clear();
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimations;
}