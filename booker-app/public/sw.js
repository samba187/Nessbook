self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim control so refresh isn't required
  event.waitUntil(self.clients.claim());
});

// Pas de stratégie de cache agressive pour éviter de casser les mises à jour
self.addEventListener('fetch', () => {
  // Network-first behavior (default)
});
