self.addEventListener('install', event => {
  const assets = self.__WB_MANIFEST.map(({ url }) => url)

  event.waitUntil(Promise.all(assets.map(asset => fetch(asset))))
  self.skipWaiting()
})

self.addEventListener('message', event => {
  console.log(`Message received: ${event}`)
})
