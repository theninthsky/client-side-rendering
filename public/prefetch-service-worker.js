const CACHE_NAME = 'my-csr-app'

const cacheInlinedAssets = async inlinedAssets => {
  const cache = await caches.open(CACHE_NAME)

  inlinedAssets.forEach(({ url, source }) => {
    const response = new Response(source, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'application/javascript'
      }
    })

    console.log(`Cached ${url}`)

    cache.put(url, response)
  })
}

const precacheAssets = async ignoredAssets => {
  const cache = await caches.open(CACHE_NAME)
  const assets = self.__WB_MANIFEST.map(({ url }) => url)
  const assetsToPrecache = assets.filter(asset => !ignoredAssets.includes(asset))

  await cache.addAll(assetsToPrecache)
}

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('message', event => {
  const { type, inlinedAssets } = event.data

  if (type === 'inlined-assets') {
    cacheInlinedAssets(inlinedAssets)
    precacheAssets(inlinedAssets.map(({ url }) => url))
  }
})

self.addEventListener('fetch', async event => {
  const { request } = event

  if (request.destination !== 'script') return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request)

      return cachedResponse || fetch(request)
    })()
  )
})
