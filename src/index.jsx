import 'utils/disable-speedy'

import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'

import 'service-worker-registration'
import 'styles'
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
