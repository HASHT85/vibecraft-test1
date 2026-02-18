// Animations with Intersection Observer

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initParallaxEffects();
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
    
    // Observe all glass cards
    const glassCards = document.querySelectorAll('.glass-card');
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
                
                shape.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
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
    
    window.addEventListener('scroll', requestTick);
    
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

// Add CSS animations
const animationStyles = `
    .fadeInUp {
        opacity: 0;
        animation: fadeInUp 0.8s ease forwards;
    }
    
    .fadeInLeft {
        opacity: 0;
        animation: fadeInLeft 0.8s ease forwards;
    }
    
    .fadeInRight {
        opacity: 0;
        animation: fadeInRight 0.8s ease forwards;
    }
    
    .scaleIn {
        opacity: 0;
        transform: scale(0.8);
        animation: scaleIn 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .fadeInUp,
        .fadeInLeft,
        .fadeInRight,
        .scaleIn {
            animation: none;
            opacity: 1;
            transform: none;
        }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

export { animateOnScroll, staggeredAnimation, animateCounter, typewriterEffect };