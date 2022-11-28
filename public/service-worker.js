const CACHE_NAME = 'client-side-rendering'
const CACHED_URLS = ['/', ...self.__WB_MANIFEST.map(({ url }) => url)]

const preCache = async () => {
  await caches.delete(CACHE_NAME)

  const cache = await caches.open(CACHE_NAME)

  await cache.addAll(CACHED_URLS)
}

const staleWhileRevalidate = async request => {
  const rootDocumentRequest = new Request(self.registration.scope)

  if (request.destination === 'document') request = rootDocumentRequest

  const cache = await caches.open(CACHE_NAME)
  const cachedResponsePromise = await cache.match(request)
  const networkResponsePromise = fetch(request)

  if (cachedResponsePromise || request.destination === 'document') {
    if (request.destination === 'document') {
      networkResponsePromise.then(response => cache.put(request, response.clone()))
    }

    return cachedResponsePromise || networkResponsePromise
  }

  return networkResponsePromise
}

self.addEventListener('install', event => {
  event.waitUntil(preCache())
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  if (['document', 'script'].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})
