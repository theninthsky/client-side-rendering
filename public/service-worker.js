self.addEventListener('install', async () => {
  self.skipWaiting()

  const asyncScripts = self.__WB_MANIFEST.filter(script => !/scripts\/(main|runtime)\./.test(script))

  await Promise.all(asyncScripts.map(({ url }) => fetch(url)))

  const [window] = await self.clients.matchAll({ type: 'window' })

  window?.postMessage({ msg: 'reload', url: window.url })
})

self.addEventListener('fetch', event => {
  if (event.request.destination === 'document') {
    event.respondWith(fetch(new Request(self.registration.scope)))
  }
})
