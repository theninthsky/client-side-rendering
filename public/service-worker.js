const CACHE_NAME = 'client-side-rendering'
const CACHED_URLS = ['/', ...self.__WB_MANIFEST.map(({ url }) => url)]
const MAX_STALE_DURATION = 7 * 24 * 60 * 60

const preCache = async () => {
  await caches.delete(CACHE_NAME)

  const cache = await caches.open(CACHE_NAME)
  const [windowClient] = await clients.matchAll({ includeUncontrolled: true, type: 'window' })

  await cache.addAll(CACHED_URLS)
  windowClient.postMessage({ type: 'update-available' })
}

const staleWhileRevalidate = async request => {
  const documentRequest = request.destination === 'document'

  if (documentRequest) request = new Request(self.registration.scope)

  const cache = await caches.open(CACHE_NAME)
  const cachedResponsePromise = await cache.match(request)
  const networkResponsePromise = fetch(request)

  if (documentRequest) {
    networkResponsePromise.then(response => cache.put(request, response.clone()))

    if ((new Date() - new Date(cachedResponsePromise?.headers.get('date'))) / 1000 > MAX_STALE_DURATION) {
      return networkResponsePromise
    }

    return cachedResponsePromise
  }

  return cachedResponsePromise || networkResponsePromise
}

self.addEventListener('install', async event => {
  event.waitUntil(preCache())
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  if (['document', 'font', 'script'].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})

self.addEventListener('periodicsync', async event => {
  if (event.tag === 'revalidate-assets') {
    await event.target.registration.update()

    const [windowClient] = await clients.matchAll({ includeUncontrolled: true, type: 'window' })

    windowClient.postMessage({ type: 'periodic-sync-update-occured', syncTime: new Date().toISOString() })
  }
})
