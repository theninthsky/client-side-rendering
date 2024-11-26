/* eslint-disable no-console */

import extractInlineScripts from './extract-inline-scripts'

const SERVICE_WORKERS = {
  precache: '/precache-service-worker.js',
  swr: '/swr-service-worker.js'
}
const ACTIVE_REVALIDATION_INTERVAL = 10 * 60
const shouldRegister = process.env.NODE_ENV !== 'development'
const appIsInstalled =
  window.matchMedia('(display-mode: standalone)').matches || document.referrer.includes('android-app://')

const register = () => {
  window.addEventListener('load', async () => {
    const serviceWorkerType = appIsInstalled ? 'swr' : 'precache'

    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKERS[serviceWorkerType])

      console.log('Service worker registered!')

      registration.addEventListener('updatefound', () => {
        registration.installing?.postMessage({ type: 'cache-assets', inlineAssets: extractInlineScripts() })
      })

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)
    } catch (err) {
      console.error(err)
    }
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
  if (shouldRegister) register()
  else unregister()
}
