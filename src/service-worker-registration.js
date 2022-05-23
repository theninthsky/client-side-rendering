/* eslint-disable no-console */

const register = () => {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(() => console.log('Service worker registered!'))
      .catch(err => console.error(err))
  })
}

const unregister = () => {
  navigator.serviceWorker.ready
    .then(registration => registration.unregister())
    .then(() => console.log('Service worker unregistered!'))
    .catch(err => console.error(err.message))
}

if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'development') unregister()
  else register()
}
