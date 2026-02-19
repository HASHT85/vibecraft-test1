# Guide de Résolution des Problèmes de Déploiement Vite

Ce guide documente la méthodologie utilisée pour corriger les erreurs 404 sur les fichiers CSS/JS lors du déploiement d'un projet Vite.

## 1. Le Problème
En développement (`npm run dev`), Vite sert les fichiers sources tels quels (ex: `/css/style.css`).
En production (`npm run build`), Vite bundle et hash les fichiers (ex: `assets/style.a1b2c3d4.css`). 
Les fichiers originaux **n'existent plus** dans le dossier `dist/`.

Toute tentative de charger manuellement les anciens chemins (via HTML, JS ou Service Worker) échouera avec une erreur 404.

## 2. La Solution ("The Vite Way")

### A. Centraliser les Imports (Entry Point)
Au lieu de charger des fichiers éparpillés, importez TOUT dans votre point d'entrée JavaScript principal (`main.js`).

**`index.html` :**
```html
<!-- Une seule entrée propre -->
<script type="module" src="/js/main.js"></script>
```

**`js/main.js` :**
```javascript
// Vite détectera ces imports et générera le CSS final injecté automatiquement
import '../css/themes.css';
import '../css/main.css';
import './animations.js';
```

### B. Supprimer les Chargements Dynamiques Manuels
Si vous avez des scripts d'optimisation (comme `performance-optimizer.js`) qui font :
```javascript
// ❌ À SUPPRIMER
const link = document.createElement('link');
link.href = '/css/themes.css'; // Ce fichier n'existe plus en prod !
document.head.appendChild(link);
```
**Supprimez ce code.** Laissez Vite gérer le chargement et le préchargement des modules via le manifest de build.

### C. Adapter le Service Worker
Le Service Worker ne doit pas mettre en cache des chemins qui n'existent pas.
*   **Mauvais :** `['/css/themes.css', '/js/main.js']`
*   **Bon :** Utiliser un plugin (ex: `vite-plugin-pwa`) qui génère la liste des fichiers hashés, ou cibler uniquement `index.html` et la racine `/`.

### D. Gérer les Fichiers Statiques (Data, Images)
Les fichiers JSON ou images non importés dans le JS ne sont pas bundlés par défaut.
*   Solution : Les placer dans `public/` (copié tel quel à la racine du `dist/`).
*   Ou les copier manuellement via `vite-plugin-static-copy` ou Dockerfile.

## Résumé des Actions sur ce Projet
1.  **`index.html`** : Simplifié à un seul module script.
2.  **`main.js`** : Ajout des imports pour tous les CSS et JS modules.
3.  **`performance-optimizer.js`** : Suppression du code qui chargeait manuellement les CSS/JS.
4.  **`sw.js`** : Réécriture pour être compatible avec les assets hashés de Vite.
5.  **`Dockerfile`** : Ajout de la copie du dossier `data/` manquant.

## 3. Résolution des Problèmes SSL (Traefik / Let's Encrypt)

Si votre domaine (`portfolio.hach.dev`) est accessible en HTTP mais pas en HTTPS (erreur SSL), voici la méthodologie de diagnostic :

### A. Vérifier les Logs ACME
Dans Dokploy (ou via `docker logs`), regardez les logs du conteneur **Traefik**. Cherchez "ACME" ou "LetsEncrypt".

*   **Cas 1 : Erreurs visibles (Rate Limit, DNS, etc.)**
    *   *Rate Limit* : Vous avez demandé trop de certificats. Attendez quelques heures.
    *   *NXDOMAIN* : Le domaine ne pointe pas vers la bonne IP. Vérifiez vos DNS.

*   **Cas 2 : Le domaine est ABSENT des logs** (Ce qui s'est passé ici)
    Traefik n'essaie même pas de générer le certificat. Cela signifie qu'il n'a pas pris en compte la configuration.
    *   **Solution :** Dans Dokploy, **supprimez** le domaine de l'application, sauvegardez, puis **ré-ajoutez** le même domaine (Port 80, HTTPS activé). Cela force Traefik à recharger la configuration ("Hot Reload").
