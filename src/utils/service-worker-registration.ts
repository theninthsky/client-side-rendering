/* eslint-disable no-console */

import extractInlineScripts from './extract-inline-scripts'

const ACTIVE_REVALIDATION_INTERVAL = 10 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')

      registration.addEventListener('updatefound', () => {
        registration.installing?.postMessage({ inlineAssets: extractInlineScripts() })
      })

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)
    } catch (err) {
      console.error(err)
    }
  })

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
