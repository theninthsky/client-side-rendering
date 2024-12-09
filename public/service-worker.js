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
  await fetchDocument('/', { skipActions: true })
}

const removeUnusedAssets = async () => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)

  cachedAssets.forEach(asset => {
    if (!allAssets.includes(asset)) cache.delete(asset)
  })
}

const fetchDocument = async (url, { skipActions = false } = {}) => {
  const cache = await getCache()
  const cachedAssets = await getCachedAssets(cache)
  const cachedDocument = await cache.match('/')
  const updatedDocument = await cache.match('/updated')
  const contentHash = cachedDocument?.headers.get('X-Content-Hash')
  const etag = cachedDocument?.headers.get('ETag')
  const headers = { 'X-Cached': cachedAssets.join(', '), 'X-Content-Hash': contentHash, 'If-None-Match': etag }

  if (updatedDocument) {
    releaseRequestsResolve()

    const clonedUpdatedDocument = updatedDocument.clone()

    cache.delete('/updated')

    return clonedUpdatedDocument
  }

  const currentDocument = fetch(url, { headers }).then(async response => {
    const { status } = response
    const client = skipActions ? undefined : await getControlledClient()

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

const getControlledClient = async () => {
  const [client] = await self.clients.matchAll()

  if (client) return client

  return await new Promise(resolve => {
    const intervalID = setInterval(async () => {
      const [client] = await self.clients.matchAll()

      if (!client) return

      clearInterval(intervalID)
      resolve(client)
    }, 50)
  })
}

self.addEventListener('install', event => {
  releaseRequestsResolve()
  event.waitUntil(precacheAssetsPromise)
  self.skipWaiting()
})

self.addEventListener('activate', event => event.waitUntil(clients.claim()))

self.addEventListener('message', async event => {
  const { inlineAssets } = event.data

  await cacheInlineAssets(inlineAssets)
  await precacheAssets({ ignoreAssets: inlineAssets.map(({ url }) => url) })

  precacheAssetsResolve()
})

self.addEventListener('fetch', async event => {
  const { request } = event

  if (request.destination === 'document') return event.respondWith(fetchDocument(request.url))
  if (request.destination === '') return event.respondWith(holdRequest(request))
  if (['font', 'script'].includes(request.destination)) event.respondWith(fetchAsset(request))
})
