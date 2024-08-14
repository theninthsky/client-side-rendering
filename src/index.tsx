import 'utils/disable-speedy'

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'

import 'styles'
import 'utils/service-worker-registration'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </BrowserRouter>
)
