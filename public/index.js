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
        const isStructureEqual = (pathname, path) => {
          const pathnameParts = pathname.split('/')
          const pathParts = path.split('/')

          if (pathnameParts.length !== pathParts.length) return false

          return pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind].startsWith(':'))
        }

        const getDynamicProperties = (pathname, path) => {
          const pathParts = path.split('/');
          const pathnameParts = pathname.split('/');
          const dynamicProperties = {};
      
          for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i].startsWith(':')) dynamicProperties[pathParts[i].slice(1)] = pathnameParts[i];
          }
      
          return dynamicProperties;
        }

        let { pathname } = window.location

        if (pathname !== '/') pathname = pathname.replace(/\\/$/, '')

        const pages = ${JSON.stringify(pages, (_, value) => {
          return typeof value === 'function' ? `func:${value.toString()}` : value
        })}

        for (const { path, scripts, data } of pages) {
          const match = pathname === path || (path.includes(':') && isStructureEqual(pathname, path))
      
          if (!match) continue
          
          scripts.forEach(script => {
            document.head.appendChild(
              Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
            )
          })

          if (!data) break

          data.forEach(({ url, crossorigin, preconnectURL }) => {
            if (url.startsWith('func:')) url = eval(url.replace('func:', ''))
            const fullURL = (typeof url === 'string') ? url : url(getDynamicProperties(pathname, path))
            
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
      <div id="root"></div>
    </body>
  </html>
`
