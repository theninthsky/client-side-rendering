const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

const getCache = () => caches.open(CACHE_NAME)

const getCachedAssets = async cache => {
  const keys = await cache.keys()

  return keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`)
}

const cacheInlinedAssets = async assets => {
  const cache = await getCache()

  assets.forEach(({ url, source }) => {
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

const precacheAssets = async ({ ignoreAssets }) => {
  const cache = await getCache()
  const assetsToPrecache = allAssets.filter(asset => !ignoreAssets.includes(asset))

  await cache.addAll(assetsToPrecache)
}

const removeUnusedAssets = async () => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)

  cachedAssets.forEach(asset => {
    if (!allAssets.includes(asset)) cache.delete(asset)
  })
}

const handleFetch = async request => {
  const cache = await getCache()

  if (request.destination === 'document') {
    const cachedAssets = await getCachedAssets(cache)
    const headers = { 'X-Cached': cachedAssets.join(', ') }

    return fetch(request, { headers })
  }

  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('message', event => {
  const { type, inlinedAssets } = event.data

  if (type === 'cache-assets') {
    cacheInlinedAssets(inlinedAssets)
    precacheAssets({ ignoreAssets: inlinedAssets.map(({ url }) => url) })
    removeUnusedAssets()
  }
})

self.addEventListener('fetch', async event => {
  if (['document', 'font', 'script', 'style'].includes(event.request.destination)) {
    event.respondWith(handleFetch(event.request))
  }
})
