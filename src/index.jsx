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

navigator.serviceWorker.addEventListener('message', ({ data }) => {
  if (data.type === 'update-available') {
    window.addEventListener('visibilitychange', () => {
      let { pathname } = window.location

      if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

      const allowReload = pagesManifest.find(({ path, allowReload }) => allowReload && isStructureEqual(pathname, path))

      if (allowReload && document.visibilityState === 'hidden') window.location.reload()
    })
  }
})

new BroadcastChannel('main').onmessage = ({ data }) => localStorage.setItem('syncTime', data.syncTime)
