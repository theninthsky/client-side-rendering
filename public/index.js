module.exports = pages => `
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
        const isStructureEqual = (pathname, path) => {
          pathname = pathname.split('/')
          path = path.split('/')

          if (pathname.length !== path.length) return false

          return pathname.every((segment, ind) => segment === path[ind] || path[ind].includes(':'))
        }

        let { pathname } = window.location

        if (pathname !== '/') pathname = pathname.replace(/\\/$/, '')

        const pages = ${JSON.stringify(pages)}

        for (const { path, scripts, data } of pages) {
          const match = pathname === path || (path.includes(':') && isStructureEqual(pathname, path))
      
          if (!match) continue
          
          scripts.forEach(script => {
            document.head.appendChild(
              Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
            )
          })

          if (!data) break
          
          data.forEach(({ url, dynamicPathIndexes, crossorigin, preconnectURL }) => {
            let fullURL = url
            
            if (dynamicPathIndexes) {
              const pathnameArr = pathname.split('/')
              const dynamics = dynamicPathIndexes.map(index => pathnameArr[index])

              let counter = 0
              
              fullURL = url.replace(/\\$/g, match => dynamics[counter++])
            }

            document.head.appendChild(
              Object.assign(document.createElement('link'), { rel: 'preload', href: fullURL, as: 'fetch', crossOrigin: crossorigin })
            )

            if (preconnectURL) {
              document.head.appendChild(
                Object.assign(document.createElement('link'), { rel: 'preconnect', href: preconnectURL })
              )
            }
          })

          break
        }
      </script>
    </head>
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div id="root"></div>
    </body>
  </html>
`
