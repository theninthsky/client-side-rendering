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
  'google page speed',
  'qwantify',
  'pinterestbot',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot'
]

const fetchPrerendered = async request => {
  const { url, headers } = request
  const prerenderUrl = `https://service.prerender.io/${url}`
  const headersToSend = new Headers(headers)

  headersToSend.set('X-Prerender-Token', '7vGsiwq4BB5avp2mXVfq')

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { status, body } = await fetch(prerenderRequest)

  return new Response(body, { status })
}

export default {
  fetch(request, env) {
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()

    if (BOT_AGENTS.includes(userAgent)) return fetchPrerendered(request)

    return env.ASSETS.fetch(request)
  }
}
