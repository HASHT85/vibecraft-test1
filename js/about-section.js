// About Section - Dynamic content from profile.json
// Gestion dynamique de la section À propos avec données JSON

class AboutSection {
    constructor() {
        this.profileData = null;
        this.aboutContainer = document.querySelector('#about .about-content');
        this.skillsContainer = document.querySelector('#skills-container');
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadProfileData();
            this.renderAboutSection();
            console.log('✅ About section initialized with dynamic data');
        } catch (error) {
            console.error('❌ Error initializing about section:', error);
            this.renderFallbackContent();
        }
    }
    
    async loadProfileData() {
        try {
            const response = await fetch('/data/profile.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.profileData = await response.json();
            return this.profileData;
        } catch (error) {
            console.error('Error loading profile data:', error);
            throw error;
        }
    }
    
    renderAboutSection() {
        if (!this.aboutContainer || !this.profileData) return;
        
        const { personal, skills, stats, experience } = this.profileData;
        
        // Mise à jour du contenu principal
        this.aboutContainer.innerHTML = `
            <div class="about-header">
                <div class="about-avatar">
                    <img src="${personal.avatar}" alt="${personal.name}" class="avatar-image" onerror="this.style.display='none'">
                </div>
                <div class="about-intro">
                    <h3 class="about-name">${personal.name}</h3>
                    <p class="about-title">${personal.title}</p>
                    <p class="about-tagline">${personal.tagline}</p>
                </div>
            </div>
            
            <div class="about-content-grid">
                <div class="about-bio">
                    <h4>À propos</h4>
                    <p>${personal.bio}</p>
                    <div class="about-details">
                        <div class="detail-item">
                            <span class="detail-icon">📍</span>
                            <span>${personal.location}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">💼</span>
                            <span>${this.profileData.contact.availability}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">⏱️</span>
                            <span>${stats.yearsExperience} ans d'expérience</span>
                        </div>
                    </div>
                </div>
                
                <div class="about-stats">
                    <h4>Statistiques</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-number">${stats.projectsCompleted}+</span>
                            <span class="stat-label">Projets</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.clientsSatisfied}+</span>
                            <span class="stat-label">Clients</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.technologiesMastered}+</span>
                            <span class="stat-label">Technologies</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.formatNumber(stats.codeLines)}+</span>
                            <span class="stat-label">Lignes de code</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="about-skills">
                <h4>Compétences principales</h4>
                <div class="skills-categories">
                    ${this.renderSkillsCategories(skills)}
                </div>
            </div>
            
            <div class="about-experience">
                <h4>Expérience récente</h4>
                <div class="experience-timeline">
                    ${this.renderExperienceTimeline(experience.slice(0, 2))}
                </div>
            </div>
        `;
        
        // Animation des statistiques
        this.animateStats();
        
        // Animation des barres de compétences
        this.animateSkillBars();
    }
    
    renderSkillsCategories(skills) {
        const categories = Object.entries(skills);
        return categories.map(([category, skillList]) => {
            if (category === 'tools' || skillList.length === 0) return '';
            
            const topSkills = skillList.slice(0, 6); // Top 6 skills par catégorie
            
            return `
                <div class="skill-category">
                    <h5 class="category-title">${this.translateCategory(category)}</h5>
                    <div class="skills-list">
                        ${topSkills.map(skill => `
                            <div class="skill-item">
                                <div class="skill-header">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-level">${skill.level}%</span>
                                </div>
                                <div class="skill-bar">
                                    <div class="skill-progress" data-level="${skill.level}"></div>
                                </div>
                                <span class="skill-years">${skill.years} an${skill.years > 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderExperienceTimeline(experiences) {
        return experiences.map(exp => `
            <div class="timeline-item ${exp.current ? 'current' : ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h5 class="timeline-position">${exp.position}</h5>
                        <span class="timeline-period">
                            ${this.formatDate(exp.startDate)} - ${exp.current ? 'Présent' : this.formatDate(exp.endDate)}
                        </span>
                    </div>
                    <p class="timeline-company">${exp.company} • ${exp.location}</p>
                    <p class="timeline-description">${exp.description}</p>
                    <div class="timeline-tech">
                        ${exp.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const current = Math.floor(progress * (end - start) + start);
                
                if (end > 1000) {
                    element.textContent = this.formatNumber(current) + '+';
                } else {
                    element.textContent = current + '+';
                }
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };
        
        // Observer pour déclencher l'animation quand la section est visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(stat => {
                        const finalValue = parseInt(stat.textContent.replace(/\D/g, ''));
                        animateValue(stat, 0, finalValue, 2000);
                    });
                    observer.disconnect();
                }
            });
        });
        
        const statsSection = document.querySelector('.about-stats');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }
    
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBar = entry.target;
                    const level = skillBar.dataset.level;
                    
                    setTimeout(() => {
                        skillBar.style.width = level + '%';
                    }, Math.random() * 500); // Animation décalée aléatoire
                }
            });
        });
        
        skillBars.forEach(bar => observer.observe(bar));
    }
    
    // Méthodes utilitaires
    translateCategory(category) {
        const translations = {
            'frontend': 'Frontend',
            'backend': 'Backend',
            'mobile': 'Mobile',
            'database': 'Base de données',
            'tools': 'Outils'
        };
        return translations[category] || category;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    renderFallbackContent() {
        if (!this.aboutContainer) return;
        
        this.aboutContainer.innerHTML = `
            <div class="about-text">
                <h3>À propos de moi</h3>
                <p>Développeur passionné avec une expertise en technologies web modernes. Je crée des expériences utilisateur exceptionnelles avec un code propre et performant.</p>
                <div class="skills-preview">
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">CSS3</span>
                    <span class="skill-tag">TypeScript</span>
                    <span class="skill-tag">Vue.js</span>
                </div>
            </div>
        `;
        
        console.log('⚠️ Fallback content rendered for about section');
    }
}

// Initialisation automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new AboutSection();
});

// Export pour utilisation dans d'autres modules
export default AboutSection;