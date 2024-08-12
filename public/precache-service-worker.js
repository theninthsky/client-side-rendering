const CACHE_NAME = 'my-csr-app'

const cachePromise = caches.open(CACHE_NAME)
const cachedAssetsPromise = cachePromise.then(cache =>
  cache.keys().then(keys => keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`))
)
const currentAssets = self.__WB_MANIFEST.map(({ url }) => url)

const cacheInlinedAssets = async inlinedAssets => {
  const cache = await cachePromise

  inlinedAssets.forEach(({ url, source }) => {
    const response = new Response(source, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'application/javascript'
      }
    })

    cache.put(url, response)

    console.log(`Cached ${url}`)
  })
}

const precacheAssets = async ignoredAssets => {
  const cache = await cachePromise
  const assetsToPrecache = currentAssets.filter(asset => !ignoredAssets.includes(asset))

  await cache.addAll(assetsToPrecache)
}

const removeStaleAssets = async () => {
  const cache = await cachePromise
  const cachedAssets = await cachedAssetsPromise

  cachedAssets.forEach(asset => {
    if (!currentAssets.includes(asset)) cache.delete(asset)
  })
}

const handleFetch = async request => {
  const cache = await cachePromise
  const cachedAssets = await cachedAssetsPromise

  if (request.destination === 'document') {
    const headers = {
      'X-Cached': cachedAssets.join(', ')
    }

    return fetch(request, { headers })
  }

  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('message', event => {
  const { type, inlinedAssets } = event.data

  if (type === 'inlined-assets') {
    cacheInlinedAssets(inlinedAssets)
    precacheAssets(inlinedAssets.map(({ url }) => url))
    removeStaleAssets()
  }
})

self.addEventListener('fetch', async event => {
  if (['document', 'font', 'script', 'style'].includes(event.request.destination)) {
    event.respondWith(handleFetch(event.request))
  }
})
