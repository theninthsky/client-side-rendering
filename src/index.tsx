import PrerenderProvider from 'components/PrerenderProvider'

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'

import 'styles'
import 'utils/delay-page-visibility'
import 'utils/service-worker-registration'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StyledEngineProvider injectFirst>
      <PrerenderProvider>
        <App />
      </PrerenderProvider>
    </StyledEngineProvider>
  </BrowserRouter>
)
