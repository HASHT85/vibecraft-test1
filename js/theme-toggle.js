// Theme Toggle - Dark/Light Mode

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
});

function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    // Check for saved theme or default to light mode
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    setTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            setTheme(newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            
            // Add a nice animation effect
            themeToggle.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 300);
        });
        
        console.log('✅ Theme toggle initialized');
    }
}

function setTheme(theme) {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    
    body.setAttribute('data-theme', theme);
    
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label', `Basculer vers le mode ${theme === 'light' ? 'sombre' : 'clair'}`);
    }
    
    // Update meta theme color for mobile browsers
    updateMetaThemeColor(theme);
}

function updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = theme === 'light' ? '#ffffff' : '#0f172a';
}

// Listen for system theme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', function(e) {
        // Only auto-switch if no manual preference is saved
        if (!localStorage.getItem('portfolio-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    // Initial check if no saved preference
    if (!localStorage.getItem('portfolio-theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
    }
}

export { setTheme };