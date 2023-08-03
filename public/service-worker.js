const assets = self.__WB_MANIFEST.map(({ url }) => url)

self.addEventListener('install', () => {
  assets.forEach(asset => fetch(asset))
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') event.respondWith(fetch(new Request(self.registration.scope)))
})
