/* eslint-disable no-console */

import pagesManifest from 'pages-manifest.json'

const ACTIVE_REVALIDATION_INTERVAL = 1 * 60 * 60
const PERIODIC_REVALIDATION_INTERVAL = 12 * 60 * 60

const register = () => {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')

      console.log('Service worker registered!')

      setInterval(() => registration.update(), ACTIVE_REVALIDATION_INTERVAL * 1000)

      const { state } = await navigator.permissions.query({ name: 'periodic-background-sync' })

      if (state === 'granted') {
        await registration?.periodicSync.register('revalidate-assets', {
          minInterval: PERIODIC_REVALIDATION_INTERVAL * 1000
        })
      }
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
  if (process.env.NODE_ENV === 'development') unregister()
  else register()
}

const events = ['mousedown', 'keydown']
let userInteracted = false

events.forEach(event => addEventListener(event, () => (userInteracted = true), { once: true }))

const reloadIfPossible = () => {
  if (userInteracted || document.visibilityState === 'visible') return

  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const reloadAllowed = !!pagesManifest.find(
    ({ path, preventReload }) => !preventReload && window.isStructureEqual(pathname, path)
  )

  if (reloadAllowed) window.location.reload()
}

navigator.serviceWorker.addEventListener('message', ({ data }) => {
  if (data.type === 'update-available') {
    reloadIfPossible()

    window.addEventListener('visibilitychange', reloadIfPossible)
  } else if (data.type === 'periodic-sync-update-occured') localStorage.setItem('syncTime', data.syncTime)
})
