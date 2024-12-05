/* eslint-disable no-console */

import extractInlineScripts from './extract-inline-scripts'

const ACTIVE_REVALIDATION_INTERVAL = 10 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')

      registration.addEventListener('updatefound', () => {
        registration.installing?.postMessage({ type: 'cache-assets', inlineAssets: extractInlineScripts() })
      })

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)
    } catch (err) {
      console.error(err)
    }
  })

  navigator.serviceWorker?.addEventListener('message', event => {
    const { status } = event.data

    console.log(status === 304 ? 'Showing body' : 'Reloading...')

    if (status === 200) window.location.reload()
    if (status === 304) document.getElementById('root')!.removeAttribute('style')
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
  if (process.env.NODE_ENV !== 'development') register()
  else unregister()
}
