/* eslint-disable no-console */

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
        await registration.periodicSync.register('revalidate-assets', {
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
