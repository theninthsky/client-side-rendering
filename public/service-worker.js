const CACHE_NAME = 'my-csr-app'

const allAssets = self.__WB_MANIFEST.map(({ url }) => url)

const createPromiseResolve = () => {
  let resolve
  const promise = new Promise(res => (resolve = res))

  return [promise, resolve]
}

const [precacheAssetsPromise, precacheAssetsResolve] = createPromiseResolve()
const [releaseRequestsPromise, releaseRequestsResolve] = createPromiseResolve()

const getCache = () => caches.open(CACHE_NAME)

const getCachedAssets = async cache => {
  const keys = await cache.keys()

  return keys.map(({ url }) => `/${url.replace(self.registration.scope, '')}`)
}

const getRequestHeaders = responseHeaders => {
  const requestHeaders = { 'X-Cached': allAssets.join(', ') }

  if (responseHeaders) {
    etag = responseHeaders.get('ETag') || responseHeaders.get('X-ETag')

    requestHeaders = { 'If-None-Match': etag, ...requestHeaders }
  }

  return requestHeaders
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

const fetchDocument = async url => {
  const cache = await getCache()
  const updatedDocument = await cache.match('/updated')

  if (updatedDocument) {
    releaseRequestsResolve()

    const clonedUpdatedDocument = updatedDocument.clone()

    cache.delete('/updated')

    return clonedUpdatedDocument
  }

  const cachedDocument = await cache.match('/')
  const requestHeaders = getRequestHeaders(cachedDocument?.headers)

  const currentDocument = fetch(url, { headers: requestHeaders }).then(async response => {
    const { status } = response
    const [client] = await self.clients.matchAll({ includeUncontrolled: true })

    if (status === 200) {
      if (cachedDocument) {
        await cache.put('/updated', response.clone())

        client?.postMessage({ action: 'reload' })

        return response
      }

      await cache.put('/', response.clone())
    }

    releaseRequestsResolve()
    client?.postMessage({ action: 'make-visible' })

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

const fetchAsset = async request => {
  const cache = await getCache()
  const cachedResponse = await cache.match(request)

  return cachedResponse || fetch(request)
}

const holdRequest = async request => {
  await releaseRequestsPromise

  return fetch(request)
}

self.addEventListener('install', event => {
  releaseRequestsResolve()
  event.waitUntil(precacheAssetsPromise)
  self.skipWaiting()
})

self.addEventListener('message', async event => {
  const { inlineAssets } = event.data

  await cacheInlineAssets(inlineAssets)
  await precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })

  precacheAssetsResolve()
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.destination === 'document') return event.respondWith(fetchDocument(request.url))
  if (request.destination === '') return event.respondWith(holdRequest(request))
  if (['font', 'script'].includes(request.destination)) event.respondWith(fetchAsset(request))
})
