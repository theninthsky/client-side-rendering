const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

const createPromiseResolve = () => {
  let resolve
  const promise = new Promise(res => (resolve = res))

  return [promise, resolve]
}

const [precacheAssetsPromise, precacheAssetsResolve] = createPromiseResolve()

const getCache = () => caches.open(CACHE_NAME)

const getCachedAssets = async cache => {
  const keys = await cache.keys()

  return keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`)
}

const getRequestHeaders = responseHeaders => ({
  'If-None-Match': responseHeaders?.get('ETag') || responseHeaders?.get('X-ETag'),
  'X-Cached': JSON.stringify(allAssets)
})

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
  await removeUnusedAssets()
  await fetchDocument({ url: '/' })
}

const removeUnusedAssets = async () => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)

  cachedAssets.forEach(asset => {
    if (!allAssets.includes(asset)) cache.delete(asset)
  })
}

const fetchDocument = async ({ url, preloadResponse }) => {
  const cache = await getCache()
  const cachedDocument = await cache.match('/')
  const requestHeaders = getRequestHeaders(cachedDocument?.headers)

  try {
    const response = await (preloadResponse && cachedDocument
      ? preloadResponse
      : fetch(url, { headers: requestHeaders }))

    if (response.status === 304) return cachedDocument

    cache.put('/', response.clone())

    self.clients.matchAll({ includeUncontrolled: true }).then(([client]) => {
      client?.postMessage({ navigationPreloadHeader: JSON.stringify(getRequestHeaders(response.headers)) })
    })

    return response
  } catch (err) {
    return cachedDocument
  }
}

const fetchAsset = async request => {
  const cache = await getCache()
  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

self.addEventListener('install', event => {
  event.waitUntil(precacheAssetsPromise)
  self.skipWaiting()
})

self.addEventListener('activate', event => event.waitUntil(self.registration.navigationPreload?.enable()))

self.addEventListener('message', async event => {
  const { inlineAssets } = event.data

  await cacheInlineAssets(inlineAssets)
  await precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })

  precacheAssetsResolve()
})

self.addEventListener('fetch', event => {
  const { request, preloadResponse } = event

  if (request.destination === 'document') return event.respondWith(fetchDocument({ url: request.url, preloadResponse }))
  if (['font', 'script'].includes(request.destination)) event.respondWith(fetchAsset(request))
})
