self.addEventListener('install', event => {
  const assets = self.__WB_MANIFEST.map(({ url }) => url)

  // event.waitUntil(Promise.all(assets.map(asset => fetch(asset))))
  self.skipWaiting()
})

self.addEventListener('activate', event => event.waitUntil(clients.claim()))

self.addEventListener('fetch', event => {
  const inlinedScript = self.inlinedScripts?.find(({ id }) => event.request.url.includes(id))

  if (!inlinedScript) return

  console.log('inlinedScript: ', inlinedScript)

  const response = new Response(inlinedScript.source, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'application/javascript'
    }
  })

  event.respondWith(response)
})

self.addEventListener('message', event => {
  const { type, inlinedScripts } = event.data

  if (type === 'inlined-scripts') self.inlinedScripts = inlinedScripts
})
