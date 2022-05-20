module.exports = (pageScript, pageData) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="A client-side rendering showcase">

      <link rel="preload" href="https://fonts.gstatic.com/s/montserrat/v21/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2" as="font" type="font/woff2" crossorigin>

      <title>Fastest CSR App</title>
    </head>
    <body>
      <link rel="preload" href="${pageScript}" as="script">
      ${pageData ? `<link rel="preload" href="${pageData}" as="fetch">` : ''}

      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div id="root"></div>
    </body>
  </html>
`
