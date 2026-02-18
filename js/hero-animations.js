// Advanced Hero Section Animations with Intersection Observer

class HeroAnimations {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.heroContent = document.querySelector('.hero-content');
        this.heroTitle = document.querySelector('.hero-title');
        this.heroDescription = document.querySelector('.hero-description');
        this.heroActions = document.querySelector('.hero-actions');
        this.shapes = document.querySelectorAll('.shape');
        this.scrollIndicator = null;
        
        this.isInitialized = false;
        this.animations = [];
        
        this.init();
    }
    
    init() {
        if (!this.hero) return;
        
        this.createScrollIndicator();
        this.setupTitleAnimation();
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupInteractiveElements();
        this.setupTypewriterEffect();
        
        this.isInitialized = true;
        console.log('✅ Hero animations initialized');
    }
    
    createScrollIndicator() {
        this.scrollIndicator = document.createElement('div');
        this.scrollIndicator.className = 'scroll-indicator';
        this.scrollIndicator.setAttribute('aria-label', 'Défiler vers le bas');
        this.hero.appendChild(this.scrollIndicator);
        
        // Add click handler
        this.scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start' 
                });
            }
        });
    }
    
    setupTitleAnimation() {
        if (!this.heroTitle) return;
        
        const text = this.heroTitle.textContent;
        const words = text.split(' ');
        
        // Clear original text
        this.heroTitle.innerHTML = '';
        
        // Create word spans
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = word;
            
            // Special handling for highlight word
            if (word.includes('Développeur') || word.includes('Designer')) {
                wordSpan.innerHTML = `<span class="highlight">${word}</span>`;
            }
            
            this.heroTitle.appendChild(wordSpan);
            
            // Add space except for last word
            if (index < words.length - 1) {
                this.heroTitle.appendChild(document.createTextNode(' '));
            }
        });
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };
        
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerHeroAnimations();
                    heroObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        heroObserver.observe(this.hero);
        
        // Observer for scroll indicator
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (this.scrollIndicator) {
                    this.scrollIndicator.style.opacity = entry.isIntersecting ? '1' : '0';
                }
            });
        }, {
            threshold: 0.5
        });
        
        scrollObserver.observe(this.hero);
    }
    
    triggerHeroAnimations() {
        // Add CSS classes to trigger animations
        this.hero.classList.add('animate-in');
        
        // Stagger word animations
        const words = this.heroTitle.querySelectorAll('.word');
        words.forEach((word, index) => {
            setTimeout(() => {
                word.style.animationDelay = `${0.8 + (index * 0.2)}s`;
                word.classList.add('animate');
            }, index * 100);
        });
        
        // Trigger description animation
        setTimeout(() => {
            if (this.heroDescription) {
                this.heroDescription.classList.add('animate-in');
            }
        }, 1500);
        
        // Trigger actions animation
        setTimeout(() => {
            if (this.heroActions) {
                this.heroActions.classList.add('animate-in');
                this.animateButtons();
            }
        }, 2000);
        
        // Trigger shapes animation
        setTimeout(() => {
            this.animateShapes();
        }, 1000);
    }
    
    animateButtons() {
        const buttons = this.heroActions.querySelectorAll('.btn');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.classList.add('animate-in');
                this.addButtonHoverEffects(btn);
            }, index * 200);
        });
    }
    
    addButtonHoverEffects(button) {
        button.addEventListener('mouseenter', () => {
            this.createRippleEffect(button);
        });
        
        button.addEventListener('click', (e) => {
            this.createClickEffect(button, e);
        });
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    createClickEffect(element, event) {
        const clickEffect = document.createElement('div');
        clickEffect.className = 'click-effect';
        
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        clickEffect.style.left = x + 'px';
        clickEffect.style.top = y + 'px';
        
        element.appendChild(clickEffect);
        
        setTimeout(() => {
            clickEffect.remove();
        }, 300);
    }
    
    animateShapes() {
        this.shapes.forEach((shape, index) => {
            setTimeout(() => {
                shape.classList.add('animate-in');
                this.addShapeInteraction(shape);
            }, index * 300);
        });
    }
    
    addShapeInteraction(shape) {
        shape.addEventListener('mouseenter', () => {
            shape.style.transform += ' scale(1.1)';
            shape.style.opacity = '0.15';
        });
        
        shape.addEventListener('mouseleave', () => {
            shape.style.transform = shape.style.transform.replace(' scale(1.1)', '');
            shape.style.opacity = '0.08';
        });
    }
    
    setupParallaxEffects() {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const heroHeight = this.hero.offsetHeight;
            const scrollPercent = Math.min(scrolled / heroHeight, 1);
            
            // Parallax for shapes
            this.shapes.forEach((shape, index) => {
                if (scrollPercent <= 1) {
                    const speed = 0.3 + (index * 0.1);
                    const yPos = scrolled * speed;
                    const rotation = scrolled * (0.05 + index * 0.02);
                    const scale = 1 - (scrollPercent * 0.1);
                    
                    shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg) scale(${scale})`;
                }
            });
            
            // Parallax for hero content
            if (this.heroContent && scrollPercent <= 1) {
                const yPos = scrolled * 0.5;
                const opacity = 1 - (scrollPercent * 0.8);
                
                this.heroContent.style.transform = `translateY(${yPos}px)`;
                this.heroContent.style.opacity = opacity;
            }
            
            // Update scroll indicator
            if (this.scrollIndicator) {
                const opacity = 1 - (scrollPercent * 2);
                this.scrollIndicator.style.opacity = Math.max(0, opacity);
            }
            
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
        
        // Initial call
        updateParallax();
    }
    
    setupInteractiveElements() {
        // Create interactive area
        const interactiveArea = document.createElement('div');
        interactiveArea.className = 'hero-interactive-area';
        this.hero.appendChild(interactiveArea);
        
        // Add interaction effects
        interactiveArea.addEventListener('click', () => {
            this.triggerInteractiveAnimation();
        });
        
        // Mouse move effect
        this.hero.addEventListener('mousemove', (e) => {
            this.createMouseTrail(e);
        });
    }
    
    triggerInteractiveAnimation() {
        // Create pulse effect
        const pulse = document.createElement('div');
        pulse.className = 'pulse-effect';
        pulse.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(120, 119, 198, 0.5) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            animation: pulseExpand 1s ease-out;
            pointer-events: none;
        `;
        
        this.hero.appendChild(pulse);
        
        setTimeout(() => {
            pulse.remove();
        }, 1000);
    }
    
    createMouseTrail(event) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        
        const rect = this.hero.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        trail.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: rgba(120, 119, 198, 0.3);
            pointer-events: none;
            animation: trailFade 1s ease-out;
        `;
        
        this.hero.appendChild(trail);
        
        setTimeout(() => {
            trail.remove();
        }, 1000);
    }
    
    setupTypewriterEffect() {
        // Find elements with typewriter effect
        const typewriterElements = document.querySelectorAll('[data-typewriter]');
        
        typewriterElements.forEach(element => {
            const text = element.getAttribute('data-typewriter') || element.textContent;
            const speed = parseInt(element.getAttribute('data-speed')) || 50;
            
            this.typewriterEffect(element, text, speed);
        });
    }
    
    typewriterEffect(element, text, speed = 50) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let i = 0;
                    element.textContent = '';
                    
                    const typeWriter = () => {
                        if (i < text.length) {
                            element.textContent += text.charAt(i);
                            i++;
                            setTimeout(typeWriter, speed);
                        }
                    };
                    
                    setTimeout(typeWriter, 500);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    }
    
    // Public methods
    destroy() {
        if (!this.isInitialized) return;
        
        // Clean up event listeners and observers
        this.animations.forEach(animation => {
            if (animation.cancel) animation.cancel();
        });
        
        // Remove created elements
        if (this.scrollIndicator) {
            this.scrollIndicator.remove();
        }
        
        console.log('✅ Hero animations destroyed');
    }
    
    restart() {
        this.destroy();
        this.init();
    }
}

// Additional CSS animations via JavaScript
const additionalAnimationStyles = `
    @keyframes pulseExpand {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(10); opacity: 0; }
    }
    
    @keyframes trailFade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0); }
    }
    
    @keyframes rippleAnimation {
        0% { transform: scale(0); opacity: 0.5; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    }
    
    .click-effect {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
        transform: translate(-50%, -50%) scale(0);
        animation: clickExpand 0.3s ease-out;
        pointer-events: none;
    }
    
    @keyframes clickExpand {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
    }
    
    /* Enhanced responsive animations */
    @media (max-width: 768px) {
        .hero-interactive-area {
            display: none;
        }
        
        .mouse-trail {
            display: none;
        }
    }
`;

// Add additional styles to the document
const additionalStyleSheet = document.createElement('style');
additionalStyleSheet.textContent = additionalAnimationStyles;
document.head.appendChild(additionalStyleSheet);

// Initialize hero animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.heroAnimations = new HeroAnimations();
});

// Export for module usage
export default HeroAnimations;