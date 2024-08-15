/* eslint-disable no-console */

import extractInlinedScripts from './extract-inlined-scripts'

const SERVICE_WORKERS = {
  precache: '/precache-service-worker.js',
  swr: '/swr-service-worker.js'
}
const ACTIVE_REVALIDATION_INTERVAL = 10 * 60
const shouldRegisterServiceWorker = process.env.NODE_ENV !== 'development' && navigator.userAgent !== 'Prerender'
const appIsInstalled =
  window.matchMedia('(display-mode: standalone)').matches || document.referrer.includes('android-app://')

const register = () => {
  window.addEventListener('load', async () => {
    const serviceWorkerType = appIsInstalled ? 'swr' : 'precache'

    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKERS[serviceWorkerType])

      console.log('Service worker registered!')

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)

      registration.addEventListener('updatefound', () => {
        const inlinedAssets = extractInlinedScripts()

        registration.installing!.onstatechange = event => {
          // @ts-ignore
          if (event.target.state !== 'activated') return

          registration.active!.postMessage({ type: 'cache-assets', inlinedAssets })
        }
      })
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
  if (shouldRegisterServiceWorker) register()
  else unregister()
}
