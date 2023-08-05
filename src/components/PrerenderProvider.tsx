import 'utils/disable-speedy'

import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

const cache = createCache({ key: 'emotion-cache-no-speedy', speedy: false })

const PrerenderProvider = ({ children }) => {
  return navigator.userAgent.includes('Prerender') ? <CacheProvider value={cache}>{children}</CacheProvider> : children
}

export default PrerenderProvider
