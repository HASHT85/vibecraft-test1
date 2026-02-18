// Enhanced Project Filter System with WebP Image Optimization
// Integrates with ImageOptimization and ProjectImages modules

import ProjectImages from './project-images.js';

class EnhancedProjectFilter {
    constructor() {
        this.projectImages = null;
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('🔍 Initializing Enhanced Project Filter...');
        
        // Wait for ProjectImages to be ready
        if (window.projectImages) {
            this.projectImages = window.projectImages;
        } else {
            this.projectImages = new ProjectImages();
        }

        // Initialize filter system
        this.initProjectFilters();
        
        // Load and render projects
        await this.loadProjects();
        
        console.log('✅ Enhanced Project Filter initialized');
    }

    initProjectFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.setActiveFilter(filter);
                this.filterProjects(filter);
            });
        });
    }

    setActiveFilter(filter) {
        // Update active button state
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        this.currentFilter = filter;
    }

    async loadProjects() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Try to load from JSON file first
            let projectsData;
            try {
                const response = await fetch('/data/projects.json');
                if (response.ok) {
                    const data = await response.json();
                    projectsData = data.projects || data;
                } else {
                    throw new Error('JSON not found, using fallback');
                }
            } catch (error) {
                console.log('Using fallback project data');
                projectsData = this.getFallbackProjects();
            }

            this.projects = projectsData;
            this.filteredProjects = [...this.projects];

            // Preload featured images
            const featuredProjects = this.projects.filter(p => p.featured).map(p => p.id);
            if (featuredProjects.length > 0) {
                this.projectImages.preloadCriticalImages(featuredProjects);
            }

            // Render projects
            await this.renderProjects(this.filteredProjects);
            
            console.log(`✅ Loaded ${this.projects.length} projects`);
            
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    getFallbackProjects() {
        return [
            {
                id: 'portfolio-2024',
                title: 'Portfolio Personnel 2024',
                description: 'Site portfolio moderne avec effets glassmorphism, animations CSS et thème dark/light. Optimisé WebP pour des performances maximales.',
                image: '/assets/images/portfolio.webp',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'Vite.js', 'WebP'],
                demoUrl: '#',
                githubUrl: '#',
                featured: true,
                category: 'web',
                year: 2024
            },
            {
                id: 'ecommerce-api',
                title: 'API E-commerce',
                description: 'API RESTful complète pour plateforme e-commerce avec gestion des utilisateurs, produits et commandes.',
                image: '/assets/images/api.webp',
                technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
                demoUrl: '#',
                githubUrl: '#',
                featured: true,
                category: 'api',
                year: 2024
            },
            {
                id: 'task-mobile-app',
                title: 'TaskFlow Mobile',
                description: 'Application mobile de gestion de tâches avec synchronisation cloud et mode hors-ligne.',
                image: '/assets/images/mobile-app.webp',
                technologies: ['React Native', 'Expo', 'TypeScript'],
                demoUrl: '#',
                githubUrl: '#',
                featured: false,
                category: 'mobile',
                year: 2024
            }
        ];
    }

    filterProjects(filter) {
        if (filter === 'all') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => 
                project.category === filter
            );
        }

        this.renderProjects(this.filteredProjects);
        
        console.log(`🔍 Filtered projects: ${this.filteredProjects.length} results for "${filter}"`);
    }

    async renderProjects(projects) {
        const projectsGrid = document.querySelector('#projects-grid');
        if (!projectsGrid) {
            console.error('Projects grid not found');
            return;
        }

        // Clear existing projects
        projectsGrid.innerHTML = '';

        if (projects.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create project cards
        const fragment = document.createDocumentFragment();
        
        for (const project of projects) {
            const projectCard = await this.createProjectCard(project);
            fragment.appendChild(projectCard);
        }

        projectsGrid.appendChild(fragment);

        // Trigger animations
        this.animateProjectCards();
    }

    async createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card glass-card animate-on-scroll animate-hover will-animate';
        card.setAttribute('data-category', project.category);
        card.setAttribute('data-project-id', project.id);

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-image';

        // Add optimized image
        const projectImage = this.projectImages.createProjectImage(
            project.id,
            project.category,
            `${project.title} screenshot`,
            'responsive-image aspect-ratio-16-9'
        );

        imageContainer.appendChild(projectImage);

        // Create content
        const content = document.createElement('div');
        content.className = 'project-content';
        content.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${project.demoUrl}" class="project-link animate-hover" target="_blank" rel="noopener">
                    <span>Demo</span>
                </a>
                <a href="${project.githubUrl}" class="project-link animate-hover" target="_blank" rel="noopener">
                    <span>Code</span>
                </a>
            </div>
        `;

        // Add featured badge if applicable
        if (project.featured) {
            const badge = document.createElement('div');
            badge.className = 'featured-badge';
            badge.textContent = 'Featured';
            card.appendChild(badge);
        }

        card.appendChild(imageContainer);
        card.appendChild(content);

        return card;
    }

    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');
        });
    }

    showLoadingState() {
        const projectsGrid = document.querySelector('#projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading projects...</p>
                </div>
            `;
        }
    }

    showErrorState() {
        const projectsGrid = document.querySelector('#projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to load projects</h3>
                    <p>Please check your connection and try again.</p>
                    <button class="btn btn-primary" onclick="window.enhancedProjectFilter.loadProjects()">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    showEmptyState() {
        const projectsGrid = document.querySelector('#projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No projects found</h3>
                    <p>Try selecting a different category.</p>
                </div>
            `;
        }
    }

    // Public API
    refresh() {
        return this.loadProjects();
    }

    getProjects() {
        return this.projects;
    }

    getFilteredProjects() {
        return this.filteredProjects;
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    getMetrics() {
        const imageMetrics = this.projectImages.getMetrics();
        
        return {
            totalProjects: this.projects.length,
            filteredProjects: this.filteredProjects.length,
            currentFilter: this.currentFilter,
            ...imageMetrics
        };
    }
}

// CSS for new states and animations
const enhancedStyles = `
    .loading-state,
    .error-state,
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-xl);
        color: var(--text-secondary);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--accent-color-alpha);
        border-top: 3px solid var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto var(--space-md);
    }

    .error-icon,
    .empty-icon {
        font-size: 3rem;
        margin-bottom: var(--space-md);
    }

    .featured-badge {
        position: absolute;
        top: var(--space-sm);
        right: var(--space-sm);
        background: var(--accent-color);
        color: var(--white);
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 2;
    }

    .fade-in-up {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(30px);
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .project-image img.lazy-loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 2s infinite linear;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;

// Inject enhanced styles
const styleElement = document.createElement('style');
styleElement.textContent = enhancedStyles;
document.head.appendChild(styleElement);

// Initialize global instance
window.enhancedProjectFilter = new EnhancedProjectFilter();

export default EnhancedProjectFilter;