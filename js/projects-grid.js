// Advanced Projects Grid with CSS Grid Layout

class ProjectsGrid {
    constructor() {
        this.projects = [];
        this.categories = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Projects Grid...');
        
        try {
            await this.loadProjectsData();
            this.initializeFilters();
            this.renderProjects();
            this.initializeObserver();
            
            console.log('✅ Projects Grid initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Projects Grid:', error);
            this.renderError(error.message);
        }
    }
    
    async loadProjectsData() {
        this.showLoading();
        
        try {
            const response = await fetch('/data/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.projects = data.projects || [];
            this.categories = data.categories || [];
            this.filteredProjects = [...this.projects];
            
            console.log(`📦 Loaded ${this.projects.length} projects`);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading projects data:', error);
            this.hideLoading();
            throw new Error('Impossible de charger les projets');
        }
    }
    
    initializeFilters() {
        const filtersContainer = document.querySelector('.project-filters');
        if (!filtersContainer) return;
        
        // Clear existing filters
        filtersContainer.innerHTML = '';
        
        // Add "All" filter
        const allFilter = this.createFilterButton('all', 'Tous', this.projects.length);
        filtersContainer.appendChild(allFilter);
        
        // Add category filters
        this.categories.forEach(category => {
            const count = this.projects.filter(p => p.category === category.id).length;
            if (count > 0) {
                const filterBtn = this.createFilterButton(category.id, category.name, count);
                filtersContainer.appendChild(filterBtn);
            }
        });
        
        // Add event listeners
        this.attachFilterListeners();
    }
    
    createFilterButton(filterId, name, count) {
        const button = document.createElement('button');
        button.className = filterId === 'all' ? 'filter-btn active' : 'filter-btn';
        button.setAttribute('data-filter', filterId);
        button.innerHTML = `
            ${name}
            <span class="filter-count">(${count})</span>
        `;
        
        return button;
    }
    
    attachFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter);
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                console.log(`🔍 Filtering by: ${filter}`);
            });
        });
    }
    
    filterProjects(filter) {
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredProjects = [...this.projects];
        } else {
            this.filteredProjects = this.projects.filter(project => project.category === filter);
        }
        
        this.renderProjects(true);
    }
    
    renderProjects(animated = false) {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        // Clear existing projects
        projectsGrid.innerHTML = '';
        
        if (this.filteredProjects.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Sort projects: featured first, then by year
        const sortedProjects = [...this.filteredProjects].sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.year || 0) - (a.year || 0);
        });
        
        // Render each project
        sortedProjects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            projectsGrid.appendChild(projectCard);
            
            // Add staggered animation
            if (animated) {
                setTimeout(() => {
                    projectCard.classList.add('visible');
                }, index * 100);
            } else {
                // Use intersection observer for initial load
                this.observeProject(projectCard);
            }
        });
    }
    
    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = `project-card ${project.featured ? 'featured' : ''}`;
        card.setAttribute('data-category', project.category);
        card.setAttribute('data-id', project.id);
        
        const statusBadge = project.status ? `<div class="project-status ${project.status}">${this.getStatusText(project.status)}</div>` : '';
        const demoLink = project.demoUrl && project.demoUrl !== '#' ? project.demoUrl : null;
        const codeLink = project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : null;
        
        card.innerHTML = `
            ${statusBadge}
            <div class="project-image">
                ${this.renderProjectImage(project)}
            </div>
            <div class="project-content">
                <h3 class="project-title">${this.escapeHtml(project.title)}</h3>
                <p class="project-description">${this.escapeHtml(project.description)}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${this.escapeHtml(tech)}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${demoLink ? `<a href="${demoLink}" class="project-link primary" target="_blank" rel="noopener noreferrer">Demo</a>` : ''}
                    ${codeLink ? `<a href="${codeLink}" class="project-link" target="_blank" rel="noopener noreferrer">Code</a>` : ''}
                    ${!demoLink && !codeLink ? '<span class="project-link disabled">Bientôt disponible</span>' : ''}
                </div>
            </div>
        `;
        
        return card;
    }
    
    renderProjectImage(project) {
        if (project.image && project.image !== '/assets/images/portfolio.webp') {
            return `<img src="${project.image}" alt="${this.escapeHtml(project.title)}" loading="lazy">`;
        } else {
            // Use emoji based on category
            const emojis = {
                'web': '🌐',
                'mobile': '📱',
                'api': '🚀',
                'desktop': '💻',
                'game': '🎮'
            };
            const emoji = emojis[project.category] || '💎';
            return `<div class="placeholder-image">${emoji}</div>`;
        }
    }
    
    getStatusText(status) {
        const statusTexts = {
            'completed': 'Terminé',
            'in-progress': 'En cours',
            'planned': 'Prévu'
        };
        return statusTexts[status] || status;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    initializeObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
        }
    }
    
    observeProject(projectCard) {
        if (this.observer) {
            this.observer.observe(projectCard);
        } else {
            // Fallback for browsers without IntersectionObserver
            setTimeout(() => {
                projectCard.classList.add('visible');
            }, 100);
        }
    }
    
    showLoading() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        this.isLoading = true;
        projectsGrid.innerHTML = '';
        projectsGrid.className = 'projects-loading';
        
        // Create skeleton cards
        for (let i = 0; i < 6; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'project-skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line description"></div>
                    <div class="skeleton-line description"></div>
                    <div class="skeleton-line" style="width: 60%;"></div>
                </div>
            `;
            projectsGrid.appendChild(skeleton);
        }
    }
    
    hideLoading() {
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.className = 'projects-grid';
        }
        this.isLoading = false;
    }
    
    renderEmptyState() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'projects-empty';
        emptyState.innerHTML = `
            <div class="empty-icon">📂</div>
            <p>Aucun projet trouvé pour cette catégorie</p>
            <button class="btn btn-secondary" onclick="projectsGrid.filterProjects('all')">
                Voir tous les projets
            </button>
        `;
        
        projectsGrid.appendChild(emptyState);
    }
    
    renderError(message) {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = `
            <div class="projects-error">
                <h3>Erreur de chargement</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Réessayer
                </button>
            </div>
        `;
    }
    
    // Public API methods
    refresh() {
        console.log('🔄 Refreshing projects...');
        this.init();
    }
    
    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }
    
    getProjectsByCategory(category) {
        return this.projects.filter(project => project.category === category);
    }
    
    searchProjects(query) {
        const searchTerm = query.toLowerCase();
        return this.projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
        );
    }
}

// Enhanced Project Filter functionality (legacy support)
function initProjectFilters() {
    // This function is kept for backward compatibility
    if (window.projectsGrid) {
        window.projectsGrid.refresh();
    }
}

function filterProjects(filter) {
    // This function is kept for backward compatibility
    if (window.projectsGrid) {
        window.projectsGrid.filterProjects(filter);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the projects grid
    window.projectsGrid = new ProjectsGrid();
});

// Export for module usage
export { ProjectsGrid, initProjectFilters, filterProjects };