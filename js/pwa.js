/**
 * PWA (Progressive Web App) Module
 * Gère l'enregistrement du service worker, les notifications et l'installation
 */

class PWAManager {
    constructor() {
        this.serviceWorker = null;
        this.deferredPrompt = null;
        this.updateAvailable = false;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    /**
     * Initialise la PWA
     */
    async init() {
        try {
            console.log('PWA: Initializing...');
            
            // Vérifie le support des service workers
            if (!('serviceWorker' in navigator)) {
                console.warn('PWA: Service workers not supported');
                return;
            }

            // Enregistre le service worker
            await this.registerServiceWorker();
            
            // Configure les événements PWA
            this.setupPWAEvents();
            
            // Configure les notifications réseau
            this.setupNetworkStatus();
            
            // Configure l'interface de mise à jour
            this.setupUpdateInterface();
            
            console.log('✅ PWA initialized successfully');
            
        } catch (error) {
            console.error('PWA: Initialization failed:', error);
        }
    }

    /**
     * Enregistre le service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('PWA: Service worker registered:', registration.scope);
            
            // Écoute les mises à jour
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('PWA: New service worker installing...');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('PWA: New service worker available');
                        this.showUpdateAvailable();
                    }
                });
            });

            // Écoute les messages du service worker
            navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
            
            this.serviceWorker = registration;
            
        } catch (error) {
            console.error('PWA: Service worker registration failed:', error);
        }
    }

    /**
     * Configure les événements PWA
     */
    setupPWAEvents() {
        // Événement d'installation de l'app
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
            console.log('PWA: Install prompt available');
        });

        // App installée
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.hideInstallPrompt();
            this.showToast('Application installée avec succès!', 'success');
        });

        // Changement de visibilité
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.updateAvailable) {
                this.showUpdateAvailable();
            }
        });
    }

    /**
     * Configure le statut réseau
     */
    setupNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('Connexion rétablie', 'success');
            console.log('PWA: Back online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('Mode hors ligne activé', 'info');
            console.log('PWA: Gone offline');
        });
    }

    /**
     * Configure l'interface de mise à jour
     */
    setupUpdateInterface() {
        // Crée le bouton de mise à jour s'il n'existe pas
        if (!document.getElementById('pwa-update-banner')) {
            this.createUpdateBanner();
        }

        // Crée le bouton d'installation s'il n'existe pas
        if (!document.getElementById('pwa-install-banner')) {
            this.createInstallBanner();
        }
    }

    /**
     * Crée la bannière de mise à jour
     */
    createUpdateBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-update-banner';
        banner.className = 'pwa-banner pwa-update-banner hidden';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-text">
                    <h4>Mise à jour disponible</h4>
                    <p>Une nouvelle version de l'application est disponible</p>
                </div>
                <div class="pwa-banner-actions">
                    <button class="pwa-btn pwa-btn-update">Mettre à jour</button>
                    <button class="pwa-btn pwa-btn-dismiss">Plus tard</button>
                </div>
            </div>
        `;

        // Événements
        banner.querySelector('.pwa-btn-update').addEventListener('click', () => {
            this.applyUpdate();
        });

        banner.querySelector('.pwa-btn-dismiss').addEventListener('click', () => {
            this.hideUpdateBanner();
        });

        document.body.appendChild(banner);
    }

    /**
     * Crée la bannière d'installation
     */
    createInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-banner pwa-install-banner hidden';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-text">
                    <h4>Installer l'application</h4>
                    <p>Installez ce portfolio pour un accès rapide et hors ligne</p>
                </div>
                <div class="pwa-banner-actions">
                    <button class="pwa-btn pwa-btn-install">Installer</button>
                    <button class="pwa-btn pwa-btn-dismiss">Non merci</button>
                </div>
            </div>
        `;

        // Événements
        banner.querySelector('.pwa-btn-install').addEventListener('click', () => {
            this.installApp();
        });

        banner.querySelector('.pwa-btn-dismiss').addEventListener('click', () => {
            this.hideInstallPrompt();
        });

        document.body.appendChild(banner);
    }

    /**
     * Affiche la bannière d'installation
     */
    showInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('hidden');
            banner.classList.add('slide-in');
        }
    }

    /**
     * Cache la bannière d'installation
     */
    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.add('hidden');
            banner.classList.remove('slide-in');
        }
    }

    /**
     * Installe l'application
     */
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('PWA: No install prompt available');
            return;
        }

        try {
            // Affiche le prompt d'installation
            this.deferredPrompt.prompt();
            
            // Attend la réponse de l'utilisateur
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA: User accepted installation');
            } else {
                console.log('PWA: User dismissed installation');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            
        } catch (error) {
            console.error('PWA: Installation failed:', error);
        }
    }

    /**
     * Affiche la notification de mise à jour
     */
    showUpdateAvailable() {
        this.updateAvailable = true;
        const banner = document.getElementById('pwa-update-banner');
        if (banner) {
            banner.classList.remove('hidden');
            banner.classList.add('slide-in');
        }
    }

    /**
     * Cache la bannière de mise à jour
     */
    hideUpdateBanner() {
        const banner = document.getElementById('pwa-update-banner');
        if (banner) {
            banner.classList.add('hidden');
            banner.classList.remove('slide-in');
        }
        this.updateAvailable = false;
    }

    /**
     * Applique la mise à jour
     */
    async applyUpdate() {
        if (!this.serviceWorker || !this.serviceWorker.waiting) {
            console.log('PWA: No update waiting');
            return;
        }

        try {
            // Demande au SW de prendre le contrôle
            this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Recharge la page après un court délai
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            this.hideUpdateBanner();
            this.showToast('Mise à jour en cours...', 'info');
            
        } catch (error) {
            console.error('PWA: Update failed:', error);
        }
    }

    /**
     * Gère les messages du service worker
     */
    handleSWMessage(event) {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('PWA: Cache updated', payload);
                break;
            case 'OFFLINE_READY':
                this.showToast('Application prête en mode hors ligne', 'success');
                break;
            case 'ERROR':
                console.error('PWA: Service worker error:', payload);
                break;
            default:
                console.log('PWA: Unknown message from SW:', event.data);
        }
    }

    /**
     * Affiche un toast de notification
     */
    showToast(message, type = 'info') {
        // Crée le toast s'il n'existe pas
        let toastContainer = document.getElementById('pwa-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'pwa-toast-container';
            toastContainer.className = 'pwa-toast-container';
            document.body.appendChild(toastContainer);
        }

        // Crée le toast
        const toast = document.createElement('div');
        toast.className = `pwa-toast pwa-toast-${type}`;
        toast.innerHTML = `
            <div class="pwa-toast-content">
                <span class="pwa-toast-icon">${this.getToastIcon(type)}</span>
                <span class="pwa-toast-message">${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => {
            toast.classList.add('pwa-toast-show');
        }, 100);

        // Suppression automatique
        setTimeout(() => {
            toast.classList.remove('pwa-toast-show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Retourne l'icône pour le type de toast
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Vérifie le statut de la cache
     */
    async getCacheStatus() {
        if (!('caches' in window)) {
            return { supported: false };
        }

        try {
            const cacheNames = await caches.keys();
            let totalSize = 0;
            let itemCount = 0;

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                itemCount += keys.length;
            }

            return {
                supported: true,
                cacheNames,
                itemCount,
                totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
            };
        } catch (error) {
            console.error('PWA: Error getting cache status:', error);
            return { supported: true, error: error.message };
        }
    }

    /**
     * Vide la cache
     */
    async clearCache() {
        if (!('caches' in window)) {
            console.warn('PWA: Cache API not supported');
            return;
        }

        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            
            this.showToast('Cache vidée avec succès', 'success');
            console.log('PWA: All caches cleared');
            
        } catch (error) {
            console.error('PWA: Error clearing cache:', error);
            this.showToast('Erreur lors du vidage de la cache', 'error');
        }
    }

    /**
     * Retourne les informations de la PWA
     */
    getInfo() {
        return {
            isOnline: this.isOnline,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            serviceWorkerRegistered: !!this.serviceWorker,
            updateAvailable: this.updateAvailable,
            installPromptAvailable: !!this.deferredPrompt,
            standalone: window.matchMedia('(display-mode: standalone)').matches
        };
    }
}

// Initialise la PWA quand le DOM est prêt
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
    
    // Expose globalement pour le debug
    window.pwa = pwaManager;
});

// Export pour utilisation en module
export default PWAManager;