const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

let assetsCacheResolve
let releaseDataResolve
const assetsCachePromise = new Promise(resolve => (assetsCacheResolve = resolve))
const releaseDataPromise = new Promise(resolve => (releaseDataResolve = resolve))

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
  const updatedDocument = await cache.match('/updated')
  const contentHash = cachedDocument?.headers.get('X-Content-Hash')
  const etag = cachedDocument?.headers.get('ETag')
  const headers = { 'X-Cached': cachedAssets.join(', '), 'X-Content-Hash': contentHash, 'If-None-Match': etag }

  if (updatedDocument) {
    releaseDataResolve()

    const clonedUpdatedDocument = updatedDocument.clone()

    cache.delete('/updated')

    return clonedUpdatedDocument
  }

  const currentDocument = fetch(url, { headers }).then(async response => {
    const { status } = response
    const [client] = await self.clients.matchAll()

    if (cachedDocument && !client) {
      console.error(
        'The active service worker has no controlled client, possibly due to the document returning too soon.'
      )
    }

    if (status === 200) {
      if (cachedDocument) {
        await cache.put('/updated', response.clone())

        client?.postMessage({ action: 'reload' })
      }

      await cache.put('/', response.clone())
    } else if (status === 304) {
      releaseDataResolve()
      client?.postMessage({ action: 'make-visible' })
    }

    return response
  })

  if (!cachedDocument) return currentDocument

  let body = await cachedDocument.text()

  body = body.replace('<body>', '<body style="visibility: hidden; overflow: hidden;">')

  return new Response(body, {
    status: 200,
    statusText: 'OK',
    headers: cachedDocument.headers
  })
}

const holdData = async request => {
  await releaseDataPromise

  return fetch(request)
}

self.addEventListener('install', event => event.waitUntil(assetsCachePromise))

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
  self.skipWaiting()
})

self.addEventListener('message', async event => {
  const { inlineAssets } = event.data

  await cacheInlineAssets(inlineAssets)
  await precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })

  assetsCacheResolve()
})

self.addEventListener('fetch', async event => {
  if (['document', 'font', 'script'].includes(event.request.destination)) event.respondWith(handleFetch(event.request))
  else if (event.request.destination === '') event.respondWith(holdData(event.request))
})
