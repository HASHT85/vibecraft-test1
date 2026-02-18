/**
 * SEO Meta Tags Manager
 * Gère les meta tags SEO et Open Graph de manière dynamique
 */

class SEOMetaManager {
    constructor() {
        this.profileData = null;
        this.siteConfig = {
            siteName: 'Portfolio - Développeur Web',
            siteUrl: window.location.origin,
            defaultImage: '/assets/images/og-default.jpg',
            twitterHandle: '@portfolio_dev',
            locale: 'fr_FR',
            themeColor: '#6366f1'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadProfileData();
            this.updateMetaTags();
            this.addStructuredData();
            this.setupDynamicUpdates();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des meta tags:', error);
        }
    }

    async loadProfileData() {
        try {
            const response = await fetch('/data/profile.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.profileData = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            // Fallback data
            this.profileData = {
                personal: {
                    name: 'Développeur Portfolio',
                    title: 'Développeur Full Stack',
                    bio: 'Développeur passionné par les technologies web modernes'
                },
                contact: {
                    email: 'contact@portfolio.dev',
                    website: window.location.origin
                },
                social: {}
            };
        }
    }

    updateMetaTags() {
        if (!this.profileData) return;

        const { personal, contact, social } = this.profileData;
        
        // Meta tags de base
        this.setMetaTag('description', `${personal.bio} | Portfolio de ${personal.name}`);
        this.setMetaTag('author', personal.name);
        this.setMetaTag('keywords', this.generateKeywords());
        
        // Open Graph
        this.setMetaProperty('og:title', `${personal.name} - ${personal.title}`);
        this.setMetaProperty('og:description', personal.bio);
        this.setMetaProperty('og:type', 'profile');
        this.setMetaProperty('og:url', contact.website || this.siteConfig.siteUrl);
        this.setMetaProperty('og:site_name', this.siteConfig.siteName);
        this.setMetaProperty('og:locale', this.siteConfig.locale);
        this.setMetaProperty('og:image', this.getProfileImage());
        this.setMetaProperty('og:image:width', '1200');
        this.setMetaProperty('og:image:height', '630');
        this.setMetaProperty('og:image:alt', `Photo de profil de ${personal.name}`);
        
        // Twitter Card
        this.setMetaProperty('twitter:card', 'summary_large_image');
        this.setMetaProperty('twitter:site', this.getTwitterHandle());
        this.setMetaProperty('twitter:creator', this.getTwitterHandle());
        this.setMetaProperty('twitter:title', `${personal.name} - ${personal.title}`);
        this.setMetaProperty('twitter:description', personal.bio);
        this.setMetaProperty('twitter:image', this.getProfileImage());
        
        // LinkedIn
        this.setMetaProperty('article:author', social.linkedin || '');
        
        // Meta tags supplémentaires pour SEO
        this.setMetaProperty('profile:first_name', personal.name.split(' ')[0] || '');
        this.setMetaProperty('profile:last_name', personal.name.split(' ').slice(1).join(' ') || '');
        this.setMetaProperty('profile:username', personal.name.toLowerCase().replace(/\s+/g, ''));
        
        // Theme color et app
        this.setMetaTag('theme-color', this.siteConfig.themeColor);
        this.setMetaTag('msapplication-TileColor', this.siteConfig.themeColor);
        
        // Canonical URL
        this.setCanonicalUrl();
        
        // Update title
        document.title = `${personal.name} - ${personal.title} | Portfolio`;
    }

    generateKeywords() {
        if (!this.profileData?.skills) return 'développeur, portfolio, web, frontend, backend';
        
        const skills = Object.values(this.profileData.skills).flat();
        const keywords = skills.map(skill => skill.name || skill).join(', ');
        return `développeur, portfolio, web, ${keywords}`;
    }

    getProfileImage() {
        const avatar = this.profileData?.personal?.avatar;
        if (avatar && !avatar.startsWith('http')) {
            return `${this.siteConfig.siteUrl}${avatar}`;
        }
        return avatar || `${this.siteConfig.siteUrl}${this.siteConfig.defaultImage}`;
    }

    getTwitterHandle() {
        const twitter = this.profileData?.social?.twitter;
        if (twitter) {
            const handle = twitter.includes('twitter.com') 
                ? twitter.split('/').pop() 
                : twitter.replace('@', '');
            return `@${handle}`;
        }
        return this.siteConfig.twitterHandle;
    }

    setMetaTag(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    setMetaProperty(property, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    setCanonicalUrl() {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.href = this.siteConfig.siteUrl + window.location.pathname;
    }

    addStructuredData() {
        if (!this.profileData) return;

        const { personal, contact, social, experience, education } = this.profileData;
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": personal.name,
            "jobTitle": personal.title,
            "description": personal.bio,
            "image": this.getProfileImage(),
            "url": contact.website || this.siteConfig.siteUrl,
            "email": contact.email,
            "telephone": contact.phone,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": personal.location?.split(',')[0]?.trim(),
                "addressCountry": personal.location?.split(',')[1]?.trim()
            },
            "sameAs": Object.values(social).filter(url => url),
            "knowsAbout": this.getKnowsAbout(),
            "alumniOf": this.getEducationData(education),
            "worksFor": this.getCurrentEmployer(experience)
        };

        // Supprimer les propriétés undefined/null
        Object.keys(structuredData).forEach(key => {
            if (structuredData[key] === undefined || structuredData[key] === null || structuredData[key] === '') {
                delete structuredData[key];
            }
        });

        this.addJsonLD(structuredData);
        
        // Ajouter les données pour le site web
        this.addWebsiteStructuredData();
    }

    getKnowsAbout() {
        if (!this.profileData?.skills) return [];
        
        return Object.values(this.profileData.skills)
            .flat()
            .map(skill => skill.name || skill)
            .filter(skill => skill);
    }

    getEducationData(education) {
        if (!education || !Array.isArray(education)) return [];
        
        return education.map(edu => ({
            "@type": "EducationalOrganization",
            "name": edu.institution,
            "description": `${edu.degree} en ${edu.field}`
        }));
    }

    getCurrentEmployer(experience) {
        if (!experience || !Array.isArray(experience)) return null;
        
        const current = experience.find(exp => exp.current);
        if (!current) return null;
        
        return {
            "@type": "Organization",
            "name": current.company,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": current.location
            }
        };
    }

    addWebsiteStructuredData() {
        const websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.siteConfig.siteName,
            "url": this.siteConfig.siteUrl,
            "author": {
                "@type": "Person",
                "name": this.profileData?.personal?.name || "Développeur"
            },
            "description": "Portfolio professionnel présentant mes compétences et projets en développement web",
            "inLanguage": "fr-FR"
        };

        this.addJsonLD(websiteData, 'website');
    }

    addJsonLD(data, id = 'person') {
        // Supprimer l'ancien script s'il existe
        const oldScript = document.getElementById(`structured-data-${id}`);
        if (oldScript) {
            oldScript.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${id}`;
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    setupDynamicUpdates() {
        // Écouter les changements de route pour les SPA futures
        window.addEventListener('popstate', () => {
            this.setCanonicalUrl();
        });

        // Mettre à jour les meta tags si les données changent
        window.addEventListener('profile-data-updated', (event) => {
            this.profileData = event.detail;
            this.updateMetaTags();
            this.addStructuredData();
        });
    }

    // Méthode publique pour mettre à jour dynamiquement les meta tags
    updatePageMeta(pageData) {
        const { title, description, image, url } = pageData;
        
        if (title) {
            document.title = title;
            this.setMetaProperty('og:title', title);
            this.setMetaProperty('twitter:title', title);
        }
        
        if (description) {
            this.setMetaTag('description', description);
            this.setMetaProperty('og:description', description);
            this.setMetaProperty('twitter:description', description);
        }
        
        if (image) {
            this.setMetaProperty('og:image', image);
            this.setMetaProperty('twitter:image', image);
        }
        
        if (url) {
            this.setMetaProperty('og:url', url);
            this.setCanonicalUrl();
        }
    }

    // Générer les meta tags pour un projet spécifique
    generateProjectMeta(project) {
        const baseUrl = this.siteConfig.siteUrl;
        const projectImage = project.image?.startsWith('http') 
            ? project.image 
            : `${baseUrl}${project.image}`;
            
        return {
            title: `${project.title} | ${this.profileData?.personal?.name || 'Portfolio'}`,
            description: project.description,
            image: projectImage,
            url: `${baseUrl}#projects`,
            type: 'article',
            publishedTime: project.year ? `${project.year}-01-01` : null,
            tags: project.technologies || []
        };
    }
}

// Initialiser le manager SEO
document.addEventListener('DOMContentLoaded', () => {
    window.seoManager = new SEOMetaManager();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOMetaManager;
}