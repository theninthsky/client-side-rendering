self.addEventListener('install', self.skipWaiting)

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(new Request(self.registration.scope)))
  }
})
