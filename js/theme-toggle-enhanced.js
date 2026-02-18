// Enhanced Theme Toggle - Dark/Light Mode with Advanced Features

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
});

class ThemeManager {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.body = document.body;
        this.currentTheme = this.getInitialTheme();
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.setTheme(this.currentTheme, false);
        this.bindEvents();
        this.handleSystemThemeChanges();
        console.log('✅ Enhanced theme toggle initialized');
    }
    
    getInitialTheme() {
        // Priority: localStorage > system preference > light (default)
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        return 'light';
    }
    
    bindEvents() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Keyboard support
            this.themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }
    
    toggleTheme() {
        if (this.isTransitioning) return;
        
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
        this.saveTheme(newTheme);
    }
    
    setTheme(theme, animate = false) {
        this.isTransitioning = true;
        
        // Add transition class for smooth theme change
        if (animate) {
            this.body.classList.add('theme-transitioning');
        }
        
        // Update theme
        this.body.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update button
        this.updateThemeToggleButton(theme, animate);
        
        // Update meta theme color
        this.updateMetaThemeColor(theme);
        
        // Update favicon if needed
        this.updateFavicon(theme);
        
        // Dispatch custom event for other components
        this.dispatchThemeChange(theme);
        
        // Remove transition class
        if (animate) {
            setTimeout(() => {
                this.body.classList.remove('theme-transitioning');
                this.isTransitioning = false;
            }, 300);
        } else {
            this.isTransitioning = false;
        }
    }
    
    updateThemeToggleButton(theme, animate) {
        if (!this.themeToggle) return;
        
        const icon = theme === 'light' ? '🌙' : '☀️';
        const label = `Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`;
        
        this.themeToggle.textContent = icon;
        this.themeToggle.setAttribute('aria-label', label);
        this.themeToggle.setAttribute('title', label);
        
        // Add rotation animation
        if (animate) {
            this.themeToggle.style.transform = 'rotate(360deg) scale(1.1)';
            setTimeout(() => {
                this.themeToggle.style.transform = '';
            }, 300);
        }
    }
    
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Use CSS custom properties colors
        const colors = {
            light: '#ffffff',
            dark: '#0f172a'
        };
        
        metaThemeColor.content = colors[theme] || colors.light;
    }
    
    updateFavicon(theme) {
        // Optional: Update favicon based on theme
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            // You could have different favicons for different themes
            // favicon.href = theme === 'dark' ? '/favicon-dark.svg' : '/favicon.svg';
        }
    }
    
    saveTheme(theme) {
        try {
            localStorage.setItem('portfolio-theme', theme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }
    
    handleSystemThemeChanges() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Only auto-switch if no manual preference is saved
            const hasManualPreference = localStorage.getItem('portfolio-theme');
            if (!hasManualPreference) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.setTheme(newTheme, true);
            }
        };
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
        }
    }
    
    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
    }
    
    // Public methods
    getTheme() {
        return this.currentTheme;
    }
    
    setThemeForced(theme) {
        this.setTheme(theme, true);
        this.saveTheme(theme);
    }
    
    resetToSystemPreference() {
        localStorage.removeItem('portfolio-theme');
        const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.setTheme(systemTheme, true);
    }
}

// Initialize theme manager
let themeManager;

function initThemeToggle() {
    themeManager = new ThemeManager();
    
    // Make theme manager globally available
    window.themeManager = themeManager;
    
    // Listen for custom theme events from other components
    window.addEventListener('themeChanged', (e) => {
        console.log(`Theme changed to: ${e.detail.theme}`);
    });
}

// Add enhanced CSS for smooth transitions
const enhancedThemeStyles = `
    /* Smooth theme transitions */
    .theme-transitioning,
    .theme-transitioning *,
    .theme-transitioning *:before,
    .theme-transitioning *:after {
        transition: background-color 0.3s ease,
                    color 0.3s ease,
                    border-color 0.3s ease,
                    box-shadow 0.3s ease,
                    backdrop-filter 0.3s ease !important;
        transition-delay: 0s !important;
    }
    
    /* Enhanced theme toggle button */
    .theme-toggle {
        position: relative;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .theme-toggle:hover {
        background: var(--bg-secondary);
        transform: scale(1.05);
        box-shadow: var(--glass-shadow);
    }
    
    .theme-toggle:focus {
        outline: 2px solid var(--text-accent);
        outline-offset: 2px;
    }
    
    .theme-toggle:active {
        transform: scale(0.95);
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .theme-toggle {
            border: 2px solid var(--text-primary);
            background: var(--bg-primary);
        }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        .theme-transitioning,
        .theme-transitioning *,
        .theme-toggle {
            transition: none !important;
            animation: none !important;
        }
    }
    
    /* Theme toggle animations */
    @keyframes themeToggleRotate {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg); }
    }
    
    .theme-toggle.animating {
        animation: themeToggleRotate 0.6s ease-in-out;
    }
`;

// Inject enhanced styles
function injectEnhancedStyles() {
    const existingStyle = document.getElementById('enhanced-theme-styles');
    if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'enhanced-theme-styles';
        style.textContent = enhancedThemeStyles;
        document.head.appendChild(style);
    }
}

// Initialize styles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEnhancedStyles);
} else {
    injectEnhancedStyles();
}

// Export for module usage
export { ThemeManager, initThemeToggle };