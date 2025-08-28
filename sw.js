
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  // simple network-first for demo
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
