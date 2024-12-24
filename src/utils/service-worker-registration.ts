/* eslint-disable no-console */

import extractInlineScripts from './extract-inline-scripts'

const REVALIDATION_INTERVAL_HOURS = 1

const register = () => {
  window.addEventListener(
    'load',
    async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js')

        console.log('Service worker registered!')

        registration.addEventListener('updatefound', () => {
          registration.installing?.postMessage({ inlineAssets: extractInlineScripts() })
        })

        setInterval(() => registration.update(), REVALIDATION_INTERVAL_HOURS * 3600 * 1000)
      } catch (err) {
        console.error(err)
      }
    },
    { once: true }
  )

  navigator.serviceWorker?.addEventListener('message', async event => {
    const { navigationPreloadHeader } = event.data

    const registration = await navigator.serviceWorker.ready

    registration.navigationPreload.setHeaderValue(navigationPreloadHeader)
  })
}

const unregister = async () => {
  try {
    const registration = await navigator.serviceWorker.ready

    await registration.unregister()

    console.log('Service worker unregistered!')
  } catch (err) {
    console.error(err)
  }
}

if ('serviceWorker' in navigator) {
  const shouldRegister = process.env.NODE_ENV !== 'development' && navigator.userAgent !== 'Prerender'

  if (shouldRegister) register()
  else unregister()
}
