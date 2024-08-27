const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

const getCache = () => caches.open(CACHE_NAME)

const getCachedAssets = async cache => {
  const keys = await cache.keys()

  return keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`)
}

const cacheInlineAssets = async assets => {
  const cache = await getCache()

  assets.forEach(({ url, source }) => {
    const response = new Response(source, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'application/javascript'
      }
    })

    cache.put(url, response)

    console.log(`Cached %c${url}`, 'color: yellow; font-style: italic;')
  })
}

const precacheAssets = async ({ ignoreAssets }) => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)
  const assetsToPrecache = allAssets.filter(asset => !cachedAssets.includes(asset) && !ignoreAssets.includes(asset))

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

    return fetch(request, { headers: { 'X-Cached': cachedAssets.join(', ') } })
  }

  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('message', event => {
  const { type, inlineAssets } = event.data

  if (type === 'cache-assets') return cacheInlineAssets(inlineAssets)
  if (type === 'precache-assets') {
    precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })
    removeUnusedAssets()
  }
})

self.addEventListener('fetch', async event => {
  if (['document', 'font', 'script'].includes(event.request.destination)) {
    event.respondWith(handleFetch(event.request))
  }
})
