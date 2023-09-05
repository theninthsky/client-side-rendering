window['prerender'] = navigator.userAgent.includes('Prerender')
window['googlebot'] = navigator.userAgent.includes('Googlebot')

import { sheet } from '@emotion/css'

if (window['prerender']) sheet.speedy(false)

import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'

const cache = createCache({ key: 'emotion-cache-no-speedy', speedy: false })

const PrerenderProvider = ({ children }) => {
  return window['prerender'] ? <CacheProvider value={cache}>{children}</CacheProvider> : children
}

export default PrerenderProvider
