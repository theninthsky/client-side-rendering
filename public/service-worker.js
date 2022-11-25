self.addEventListener('install', async () => {
  self.skipWaiting()
  await Promise.all(self.__WB_MANIFEST.map(({ url }) => fetch(url)))

  const [window] = await self.clients.matchAll({ type: 'window' })

  window?.postMessage({ msg: 'reload', url: window.url })
})

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(new Request(self.registration.scope)))
  }
})
