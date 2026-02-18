import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = 8001;

const CONTENT_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return CONTENT_TYPES[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    filePath = path.join(__dirname, filePath);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        const contentType = getContentType(filePath);
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('🚀 Serveur de test démarré');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('');
    console.log('📄 Pages disponibles:');
    console.log(`   • Page principale: http://localhost:${PORT}/index.html`);
    console.log(`   • Test theme toggle: http://localhost:${PORT}/test-theme-toggle.html`);
    console.log('');
    console.log('🔧 Test de la feature: Toggle dark/light mode avec localStorage');
    console.log('📱 Fonctionnalités testées:');
    console.log('   ✓ Sauvegarde localStorage');
    console.log('   ✓ Détection thème système');
    console.log('   ✓ Transitions fluides');
    console.log('   ✓ Accessibilité (keyboard, ARIA)');
    console.log('   ✓ Animations CSS');
    console.log('');
    console.log('⏹️  Appuyez sur Ctrl+C pour arrêter');
});

server.on('error', (err) => {
    console.error('Erreur serveur:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\n⏹️  Arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur arrêté');
        process.exit(0);
    });
});