// Main JavaScript - Navigation and Core functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio initialized');
    
    // Mobile Navigation Toggle
    initMobileNavigation();
    
    // Smooth Scrolling for Navigation Links
    initSmoothScrolling();
    
    // Active Navigation Link Highlighting
    initActiveNavigation();
    
    // Initialize Service Worker for PWA
    initServiceWorker();
    
    // Initialize all modules
    console.log('✅ Main module loaded');
});

function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        console.log('✅ Mobile navigation initialized');
    }
}

function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('✅ Smooth scrolling initialized');
}

function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
    
    console.log('✅ Active navigation initialized');
}

/**
 * Initialize Service Worker for PWA functionality
 */
async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }
    
    try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 New Service Worker installing...');
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('✨ New Service Worker available, update ready');
                    
                    // Dispatch custom event for update notification
                    window.dispatchEvent(new CustomEvent('sw-update-available', {
                        detail: { registration }
                    }));
                }
            });
        });
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
            handleServiceWorkerMessage(event.data);
        });
        
        // Check for updates on page focus
        window.addEventListener('focus', () => {
            registration.update();
        });
        
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

/**
 * Handle messages from Service Worker
 */
function handleServiceWorkerMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
        case 'CACHE_UPDATED':
            console.log('Cache updated:', payload);
            break;
        case 'OFFLINE_READY':
            console.log('App ready for offline use');
            showNotification('Application prête en mode hors ligne', 'success');
            break;
        case 'ERROR':
            console.error('Service Worker error:', payload);
            break;
        default:
            console.log('Unknown message from Service Worker:', data);
    }
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // This will be handled by the PWA module
    window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { message, type }
    }));
}

// Utility Functions
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Check if app is running as PWA
 */
export function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

/**
 * Check online status
 */
export function isOnline() {
    return navigator.onLine;
}

/**
 * Get device info for PWA optimization
 */
export function getDeviceInfo() {
    return {
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTablet: /Tablet|iPad/i.test(navigator.userAgent),
        isDesktop: !/Mobi|Android|Tablet|iPad/i.test(navigator.userAgent),
        hasTouch: 'ontouchstart' in window,
        connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
        memory: navigator.deviceMemory || 'unknown',
        cores: navigator.hardwareConcurrency || 'unknown'
    };
}

// Expose utilities globally for debug
window.portfolioUtils = {
    debounce,
    throttle,
    isPWA,
    isOnline,
    getDeviceInfo
};