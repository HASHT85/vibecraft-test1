// Enhanced Animations with Intersection Observer

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffects();
    initAnimateOnScrollElements();
});

function initScrollAnimations() {
    // Create Intersection Observer for glass cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add staggered animation delay for multiple cards
                const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                entry.target.style.animationDelay = `${delay}ms`;
            }
        });
    }, observerOptions);
    
    // Observe all glass cards (except hero which is handled separately)
    const glassCards = document.querySelectorAll('.glass-card:not(.hero .glass-card)');
    glassCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        observer.observe(title);
    });
    
    console.log('✅ Scroll animations initialized');
}

function initAnimateOnScrollElements() {
    // Handle elements with animate-on-scroll class
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };
    
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine animation type based on element
                let animationClass = 'fadeInUp';
                
                if (entry.target.classList.contains('project-card')) {
                    animationClass = 'scaleIn';
                } else if (entry.target.classList.contains('section-title')) {
                    animationClass = 'fadeInDown';
                } else if (entry.target.classList.contains('contact-info')) {
                    animationClass = 'fadeInLeft';
                } else if (entry.target.classList.contains('contact-form')) {
                    animationClass = 'fadeInRight';
                }
                
                // Add staggered delay for grid items
                const isGridItem = entry.target.closest('.projects-grid');
                if (isGridItem) {
                    const gridItems = Array.from(isGridItem.children);
                    const index = gridItems.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 150}ms`;
                }
                
                entry.target.classList.add(animationClass);
                animateObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animateElements.forEach(element => {
        animateObserver.observe(element);
    });
    
    console.log('✅ Animate-on-scroll elements initialized');
}

function initParallaxEffects() {
    const hero = document.querySelector('.hero');
    const shapes = document.querySelectorAll('.shape');
    
    if (!hero || shapes.length === 0) return;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        const scrollPercent = scrolled / heroHeight;
        
        if (scrollPercent <= 1) {
            shapes.forEach((shape, index) => {
                const speed = 0.5 + (index * 0.1); // Different speeds for each shape
                const yPos = scrolled * speed;
                const rotation = scrolled * (0.1 + index * 0.05);
                
                // Don't override hero-animations.js transforms
                if (!shape.style.transform.includes('scale')) {
                    shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
                }
            });
        }
    }
    
    // Use requestAnimationFrame for smooth animations
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16); // ~60fps
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    console.log('✅ Parallax effects initialized');
}

// Advanced animations for elements
function animateOnScroll(element, animationClass = 'fadeInUp', delay = 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add(animationClass);
                    observer.unobserve(entry.target);
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });
    
    observer.observe(element);
}

// Staggered animations for lists/grids
function staggeredAnimation(elements, animationClass = 'fadeInUp', staggerDelay = 100) {
    elements.forEach((element, index) => {
        animateOnScroll(element, animationClass, index * staggerDelay);
    });
}

// Counter animation for numbers
function animateCounter(element, start = 0, end, duration = 2000) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const startTime = performance.now();
                
                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(start + (end - start) * easeOut);
                    
                    element.textContent = current;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(element);
}

// Typewriter effect
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function typeWriter() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(element);
}

// Reveal animations on scroll
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });
    
    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Enhanced CSS animations
const enhancedAnimationStyles = `
    .fadeInUp {
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 0.8s ease forwards;
    }
    
    .fadeInDown {
        opacity: 0;
        transform: translateY(-30px);
        animation: fadeInDown 0.8s ease forwards;
    }
    
    .fadeInLeft {
        opacity: 0;
        transform: translateX(-40px);
        animation: fadeInLeft 0.8s ease forwards;
    }
    
    .fadeInRight {
        opacity: 0;
        transform: translateX(40px);
        animation: fadeInRight 0.8s ease forwards;
    }
    
    .scaleIn {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
        animation: scaleIn 0.7s ease forwards;
    }
    
    .slideInUp {
        opacity: 0;
        transform: translateY(50px);
        animation: slideInUp 0.6s ease forwards;
    }
    
    .bounceIn {
        opacity: 0;
        transform: scale(0.3);
        animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
    
    .rotateIn {
        opacity: 0;
        transform: rotate(-10deg) scale(0.8);
        animation: rotateIn 0.8s ease forwards;
    }
    
    /* Keyframe animations */
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInDown {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInLeft {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    @keyframes slideInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes rotateIn {
        to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }
    }
    
    /* Reveal animations */
    .reveal {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.8s ease;
    }
    
    .reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Staggered animations */
    .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
    .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
    .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
    .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
    .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
    .stagger-animation > *:nth-child(6) { animation-delay: 0.6s; }
    
    /* Hover animations */
    .hover-float:hover {
        transform: translateY(-5px);
        transition: transform 0.3s ease;
    }
    
    .hover-scale:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease;
    }
    
    .hover-rotate:hover {
        transform: rotate(5deg);
        transition: transform 0.3s ease;
    }
    
    /* Loading animations */
    .loading {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            opacity: 1;
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .fadeInUp,
        .fadeInDown,
        .fadeInLeft,
        .fadeInRight,
        .scaleIn,
        .slideInUp,
        .bounceIn,
        .rotateIn,
        .reveal {
            animation: none;
            opacity: 1;
            transform: none;
            transition: none;
        }
        
        .hover-float:hover,
        .hover-scale:hover,
        .hover-rotate:hover {
            transform: none;
        }
        
        .loading {
            animation: none;
        }
    }
    
    /* Performance optimizations */
    .animate-on-scroll {
        will-change: transform, opacity;
    }
    
    .animate-on-scroll.fadeInUp,
    .animate-on-scroll.fadeInDown,
    .animate-on-scroll.fadeInLeft,
    .animate-on-scroll.fadeInRight,
    .animate-on-scroll.scaleIn {
        will-change: auto;
    }
`;

// Add enhanced styles to head
const enhancedStyleSheet = document.createElement('style');
enhancedStyleSheet.textContent = enhancedAnimationStyles;
document.head.appendChild(enhancedStyleSheet);

// Initialize reveal animations
document.addEventListener('DOMContentLoaded', revealOnScroll);

export { animateOnScroll, staggeredAnimation, animateCounter, typewriterEffect, revealOnScroll };