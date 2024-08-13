const BOT_AGENTS = [
  'bingbot',
  'yahoo! slurp',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest/0.',
  'developers.google.com/+/web/snippet',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'telegrambot'
]

const fetchPrerendered = async request => {
  const { url, headers } = request
  const headersToSend = new Headers(headers)
  const prerenderUrl = new URL(`https://renderprime.theninthsky.workers.dev?url=${url}`)
  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { body, headers: responseHeaders } = await fetch(prerenderRequest)

  return new Response(body, { headers: responseHeaders })
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname.toLowerCase()
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()

    // non-document request
    if (pathname.includes('.')) return env.ASSETS.fetch(request)

    // crawler request
    if (BOT_AGENTS.some(agent => userAgent.includes(agent))) return fetchPrerendered(request)

    const cachedAssets = request.headers.get('X-Cached')?.split(', ').filter(Boolean) || []

    const pages = INJECT_PAGES_HERE

    let html = INJECT_HTML_HERE

    const uncachedAssets = pages.filter(({ url }) => !cachedAssets.includes(url))

    uncachedAssets.forEach(({ url, source }) => {
      html = html.replace(
        `<script type="module" src="${url}"></script>`,
        () => `<script id="${url}" type="module">${source}</script>`
      )
    })

    const response = new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })

    return response
  }
}
