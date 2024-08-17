import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = import.meta.dirname

export default pages => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#1e90ff">
      <meta name="google-site-verification" content="VizFjhwWDUBYMsq1bJtp6N2NPjz8sLdGH1513MlrytU" />

      <link rel="shortcut icon" href="/icons/favicon.ico">
      <link rel="manifest" href="/manifest.json">
      <link rel="preload" href="/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>

      <title>Client-side Rendering</title>

      <script>
        const pages = ${JSON.stringify(pages, (_, value) => {
          return typeof value === 'function' ? `func:${value.toString()}` : value
        })}

        ${readFileSync(join(__dirname, '..', 'scripts', 'preload-assets.js'))}
      </script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
`
