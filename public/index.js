module.exports = (script, data) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#1e90ff">
      <meta name="description" content="A client-side rendering demonstration.">
      <meta property="og:title" content="Client-side Rendering">
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://client-side-rendering.pages.dev">
      <meta property="og:image:secure_url" itemprop="image" content="https://client-side-rendering.pages.dev/icons/icon-x192.png">
      <meta name="google-site-verification" content="VizFjhwWDUBYMsq1bJtp6N2NPjz8sLdGH1513MlrytU" />

      <link rel="shortcut icon" href="icons/favicon.ico">
      <link rel="manifest" href="manifest.json">
      <link rel="preload" href="https://fonts.gstatic.com/s/montserrat/v21/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2" as="font" type="font/woff2" crossorigin>

      <title>Client-side Rendering</title>
    </head>
    <body>
      <link rel="preload" href="${script}" as="script">
      ${
        data
          ?.map(
            ({ url, crossorigin }) =>
              `<link rel="preload" href="${url}" as="fetch" ${crossorigin ? `crossorigin=${crossorigin}` : ''}>`
          )
          .join('') || ''
      }

      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div id="root"></div>
    </body>
  </html>
`
