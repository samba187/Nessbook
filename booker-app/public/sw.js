// Service Worker minimal pour NessBook PWA
const CACHE_NAME = 'nessbook-v1';

self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  // Claim control so refresh isn't required
  event.waitUntil(self.clients.claim());
});

// Pas de fetch handler pour éviter les erreurs "no-op"
// Le navigateur gérera le cache automatiquement
