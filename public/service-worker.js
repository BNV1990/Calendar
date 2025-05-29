const CACHE_NAME = 'calendar-cache-v3';
const urlsToCache = [
  '/',
  '/globals.css',
  '/next.svg',
  '/vercel.svg',
  '/icons/icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // негайна активація нового SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim()) // контроль усіх вкладок
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-new-data') {
    console.log('Background sync triggered: sync-new-data');
    event.waitUntil(
      fetch('/api/data') // Replace with your actual API endpoint for new data
        .then(response => response.json())
        .then(data => {
          console.log('Fetched new data:', data);
          // Here you would typically update your IndexedDB or other persistent storage
          // and then notify the client (e.g., using postMessage) to update the UI.
          // For demonstration, we'll just log it.
          console.log('New data fetched and processed.');
          return Promise.resolve(); // Indicate successful processing
        })
        .catch(error => {
          console.error('Background sync failed:', error);
        })
    );
  }
});
