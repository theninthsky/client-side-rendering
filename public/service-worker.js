const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

let cacheAssetsPromiseResolve
const cacheAssetsPromise = new Promise(resolve => (cacheAssetsPromiseResolve = resolve))

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
  await removeUnusedAssets()
  await fetchDocument('/')
}

const removeUnusedAssets = async () => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)

  cachedAssets.forEach(asset => {
    if (!allAssets.includes(asset)) cache.delete(asset)
  })
}

const handleFetch = async request => {
  if (request.destination === 'document') return fetchDocument(request.url)

  const cache = await getCache()
  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

const fetchDocument = async url => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)
  const cachedDocument = await cache.match('/')
  const contentHash = cachedDocument?.headers.get('X-Content-Hash')
  const etag = cachedDocument?.headers.get('ETag')
  const headers = { 'X-Cached': cachedAssets.join(', '), 'X-Content-Hash': contentHash, 'If-None-Match': etag }

  const freshDocument = fetch(url, { headers }).then(async response => {
    const { status } = response

    if (status === 200) await cache.put('/', response.clone())

    const [client] = (await self.clients.matchAll()) || []

    client?.postMessage({ status })

    return response
  })

  if (cachedDocument) {
    let body = await cachedDocument.text()

    body = body.replace('<body>', '<body style="visibility: hidden; overflow: hidden">')

    return new Response(body, {
      status: 200,
      statusText: 'OK',
      headers: cachedDocument.headers
    })
  }

  return freshDocument
}

self.addEventListener('install', event => {
  event.waitUntil(cacheAssetsPromise)
  self.skipWaiting()
})

self.addEventListener('activate', event => event.waitUntil(clients.claim()))

self.addEventListener('message', async event => {
  const { type, inlineAssets } = event.data

  if (type !== 'cache-assets') return

  await cacheInlineAssets(inlineAssets)
  await precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })

  cacheAssetsPromiseResolve()
})

self.addEventListener('fetch', async event => {
  if (['document', 'font', 'script'].includes(event.request.destination)) {
    event.respondWith(handleFetch(event.request))
  }
})
