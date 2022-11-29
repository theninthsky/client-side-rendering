const CACHE_NAME = 'client-side-rendering'
const CACHED_URLS = ['/', ...self.__WB_MANIFEST.map(({ url }) => url)]
const MAX_STALE_DURATION = 60

const preCache = async () => {
  await caches.delete(CACHE_NAME)

  const cache = await caches.open(CACHE_NAME)

  await cache.addAll(CACHED_URLS)
}

const staleWhileRevalidate = async request => {
  if (request.destination === 'document') request = new Request(self.registration.scope)

  const cache = await caches.open(CACHE_NAME)
  const cachedResponsePromise = await cache.match(request)
  const networkResponsePromise = fetch(request)

  if (request.destination === 'document') {
    networkResponsePromise.then(response => cache.put(request, response.clone()))

    if (new Date() - new Date(cachedResponsePromise?.headers.get('date')) > MAX_STALE_DURATION) {
      return networkResponsePromise
    }

    return cachedResponsePromise
  }

  return cachedResponsePromise || networkResponsePromise
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
