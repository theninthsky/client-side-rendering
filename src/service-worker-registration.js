/* eslint-disable no-console */

const REVALIDATION_INTERVAL = 1 * 60 * 60

const register = () => {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered!')

        setInterval(() => registration.update(), REVALIDATION_INTERVAL * 1000)
      })
      .catch(err => console.error(err))
  })
}

const unregister = () => {
  navigator.serviceWorker.ready
    .then(registration => registration.unregister())
    .then(() => console.log('Service worker unregistered!'))
    .catch(err => console.error(err))
}

if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'development') unregister()
  else register()
}
