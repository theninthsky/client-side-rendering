import { sheet } from '@emotion/css'

// Check if the root node has any children to detect if the app has been preprendered
// speedy is disabled when the app is being prerendered so that styles render into the DOM
// speedy is significantly faster though so it should only be disabled during prerendering
if (!document.getElementById('root')?.hasChildNodes()) sheet.speedy(false)
