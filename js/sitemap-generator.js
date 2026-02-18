/**
 * Générateur de Sitemap Dynamique
 * Génère un sitemap XML basé sur les données du portfolio
 */

class SitemapGenerator {
    constructor() {
        this.siteUrl = window.location.origin;
        this.lastmod = new Date().toISOString().split('T')[0];
        this.profileData = null;
        this.projectsData = null;
    }

    async init() {
        try {
            await Promise.all([
                this.loadProfileData(),
                this.loadProjectsData()
            ]);
            await this.generateSitemap();
        } catch (error) {
            console.error('Erreur lors de la génération du sitemap:', error);
        }
    }

    async loadProfileData() {
        try {
            const response = await fetch('/data/profile.json');
            this.profileData = await response.json();
        } catch (error) {
            console.warn('Impossible de charger profile.json:', error);
        }
    }

    async loadProjectsData() {
        try {
            const response = await fetch('/data/projects.json');
            this.projectsData = await response.json();
        } catch (error) {
            console.warn('Impossible de charger projects.json:', error);
        }
    }

    async generateSitemap() {
        const urls = this.buildUrlList();
        const xmlContent = this.buildSitemapXML(urls);
        
        // Créer et télécharger le sitemap (pour le développement)
        if (window.location.hostname === 'localhost') {
            console.log('Sitemap généré:', xmlContent);
            this.downloadSitemap(xmlContent);
        }
        
        return xmlContent;
    }

    buildUrlList() {
        const urls = [
            {
                loc: this.siteUrl + '/',
                lastmod: this.lastmod,
                changefreq: 'weekly',
                priority: '1.0'
            },
            {
                loc: this.siteUrl + '/#about',
                lastmod: this.lastmod,
                changefreq: 'monthly',
                priority: '0.8'
            },
            {
                loc: this.siteUrl + '/#projects',
                lastmod: this.lastmod,
                changefreq: 'weekly',
                priority: '0.9'
            },
            {
                loc: this.siteUrl + '/#contact',
                lastmod: this.lastmod,
                changefreq: 'monthly',
                priority: '0.7'
            }
        ];

        // Ajouter les projets individuels si disponibles
        if (this.projectsData?.projects) {
            this.projectsData.projects.forEach(project => {
                urls.push({
                    loc: `${this.siteUrl}/#project-${project.id}`,
                    lastmod: project.year ? `${project.year}-01-01` : this.lastmod,
                    changefreq: 'monthly',
                    priority: project.featured ? '0.8' : '0.6'
                });
            });
        }

        // Ajouter les catégories de projets
        if (this.projectsData?.categories) {
            this.projectsData.categories.forEach(category => {
                urls.push({
                    loc: `${this.siteUrl}/#projects?filter=${category.id}`,
                    lastmod: this.lastmod,
                    changefreq: 'monthly',
                    priority: '0.6'
                });
            });
        }

        return urls;
    }

    buildSitemapXML(urls) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        return xml;
    }

    escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    downloadSitemap(xmlContent) {
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Méthode pour générer robots.txt
    generateRobotsTxt() {
        const robots = [
            'User-agent: *',
            'Allow: /',
            '',
            `Sitemap: ${this.siteUrl}/sitemap.xml`,
            '',
            '# Crawling rules',
            'Disallow: /node_modules/',
            'Disallow: /.git/',
            'Disallow: /assets/private/',
            '',
            '# Cache files',
            'Disallow: /*.map$',
            'Disallow: /vite.config.js',
            'Disallow: /package.json',
            'Disallow: /package-lock.json'
        ].join('\n');

        if (window.location.hostname === 'localhost') {
            console.log('Robots.txt généré:', robots);
            const blob = new Blob([robots], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'robots.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        return robots;
    }
}

// Utilitaire pour générer le sitemap en développement
if (window.location.hostname === 'localhost') {
    window.generateSitemap = async () => {
        const generator = new SitemapGenerator();
        await generator.init();
        generator.generateRobotsTxt();
    };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SitemapGenerator;
}