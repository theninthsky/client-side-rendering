import 'utils/disable-speedy'

import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'

import 'service-worker-registration'
import 'styles'
import pagesManifest from 'pages-manifest.json'
import App from './App'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </Suspense>
  </BrowserRouter>
)

const reloadIfPossible = () => {
  if (document.visibilityState === 'visible') return

  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const reloadAllowed = !!pagesManifest.find(({ path, allowReload }) => allowReload && isStructureEqual(pathname, path))

  if (reloadAllowed) window.location.reload()
}

navigator.serviceWorker.addEventListener('message', ({ data }) => {
  if (data.type === 'update-available') {
    reloadIfPossible()

    window.addEventListener('visibilitychange', reloadIfPossible)
  } else if (data.type === 'periodic-sync-update-occured') localStorage.setItem('syncTime', data.syncTime)
})
