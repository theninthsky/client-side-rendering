module.exports = ({ scripts, title, description, data = [] }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="#1e90ff">
      <meta name="description" content="${description}">
      <meta property="og:title" content="${title}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://client-side-rendering.pages.dev">
      <meta property="og:image" content="https://client-side-rendering.pages.dev/icons/icon-x512.png">

      <link rel="shortcut icon" href="icons/favicon.ico">
      <link rel="manifest" href="manifest.json">
      <link rel="preload" href="https://fonts.gstatic.com/s/montserrat/v21/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2" as="font" type="font/woff2" crossorigin>

      <title>${title}</title>
    </head>
    <body>
      ${scripts.map(script => `<link rel="preload" href="${script}" as="script"></link>`).join('')}
      ${data
        .map(
          ({ url, crossorigin }) =>
            `<link rel="preload" href="${url}" as="fetch" ${crossorigin ? `crossorigin=${crossorigin}` : ''}>`
        )
        .join('')}

      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div id="root"></div>
    </body>
  </html>
`
