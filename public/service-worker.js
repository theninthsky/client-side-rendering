self.addEventListener('install', () => {
  self.skipWaiting()
  self.__WB_MANIFEST.forEach(({ url }) => fetch(url))
})

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(new Request(self.registration.scope)))
  }
})
