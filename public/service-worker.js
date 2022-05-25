const networkFirst = async event => {
  try {
    const res = await fetch(event.request)
    const cache = await caches.open('csr')

    event.waitUntil(cache.put(event.request, res.clone()))

    return res
  } catch (err) {
    return caches.match(event.request)
  }
}

self.addEventListener('install', event => {
  const cache = caches.open('csr')

  event.waitUntil(cache.add('./'))
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  if (event.request.url === self.registration.scope) event.respondWith(networkFirst(event))
})
