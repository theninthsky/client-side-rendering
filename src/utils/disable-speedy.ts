import { sheet } from '@emotion/css'

if (navigator.userAgent.includes('Prerender')) sheet.speedy(false)
