// Project Filter System

document.addEventListener('DOMContentLoaded', function() {
    initProjectFilters();
    loadProjects();
});

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.querySelector('#projects-grid');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            filterProjects(filter);
            
            console.log(`Filtering projects by: ${filter}`);
        });
    });
    
    console.log('✅ Project filters initialized');
}

function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });
}

async function loadProjects() {
    try {
        // For now, we'll use static data, but this can be replaced with fetch('/data/projects.json')
        const projects = await getProjectsData();
        renderProjects(projects);
        console.log('✅ Projects loaded');
    } catch (error) {
        console.error('Error loading projects:', error);
        showProjectsError();
    }
}

async function getProjectsData() {
    // Simulated data - in real implementation, this would fetch from /data/projects.json
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    title: "Portfolio Website",
                    description: "Un site portfolio moderne avec effets glassmorphism et animations CSS",
                    image: "/assets/images/project1.webp",
                    technologies: ["HTML5", "CSS3", "JavaScript", "Vite"],
                    demoUrl: "#",
                    githubUrl: "#",
                    featured: true,
                    category: "web"
                },
                {
                    id: 2,
                    title: "API REST Node.js",
                    description: "API RESTful complète avec authentification JWT et base de données MongoDB",
                    image: "/assets/images/project2.webp",
                    technologies: ["Node.js", "Express", "MongoDB", "JWT"],
                    demoUrl: "#",
                    githubUrl: "#",
                    featured: false,
                    category: "api"
                },
                {
                    id: 3,
                    title: "Application Mobile",
                    description: "Application mobile cross-platform développée avec React Native",
                    image: "/assets/images/project3.webp",
                    technologies: ["React Native", "Expo", "TypeScript"],
                    demoUrl: "#",
                    githubUrl: "#",
                    featured: true,
                    category: "mobile"
                }
            ]);
        }, 500);
    });
}

function renderProjects(projects) {
    const projectsGrid = document.querySelector('#projects-grid');
    
    // Clear existing projects except the demo one
    const demoProject = projectsGrid.querySelector('.project-card');
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
    
    // Keep demo project if no real projects
    if (projects.length === 0) {
        projectsGrid.appendChild(demoProject);
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card glass-card';
    card.setAttribute('data-category', project.category);
    
    card.innerHTML = `
        <div class="project-image">
            <div class="placeholder-image">🚀</div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${project.demoUrl}" class="project-link" target="_blank" rel="noopener">Demo</a>
                <a href="${project.githubUrl}" class="project-link" target="_blank" rel="noopener">Code</a>
            </div>
        </div>
    `;
    
    return card;
}

function showProjectsError() {
    const projectsGrid = document.querySelector('#projects-grid');
    projectsGrid.innerHTML = `
        <div class="error-message glass-card">
            <p>Erreur lors du chargement des projets. Veuillez réessayer plus tard.</p>
        </div>
    `;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
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
    
    .error-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-xl);
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

export { filterProjects, loadProjects };