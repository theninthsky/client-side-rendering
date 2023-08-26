const BOT_AGENTS = [
  'googlebot',
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

const fetchPrerendered = async (request, env, userAgent) => {
  const { url, headers } = request
  const headersToSend = new Headers(headers)

  /* Prerender.io */
  // const prerenderUrl = `https://service.prerender.io/${url}`
  //
  // headersToSend.set('X-Prerender-Token', '7vGsiwq4BB5avp2mXVfq')
  /****************/

  /* Prerender */
  const prerenderUrl = new URL(`https://renderprime.onrender.com?url=${url}`)

  if (userAgent.includes('android')) prerenderUrl.searchParams.append('width', 375)
  /*************/

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { body, ...rest } = await fetch(prerenderRequest)

  if (!rest.ok && userAgent.includes('googlebot')) return env.ASSETS.fetch(request)

  return new Response(body, rest)
}

export default {
  fetch(request, env) {
    const pathname = new URL(request.url).pathname.toLowerCase()
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()

    // a crawler that requests the document
    if (BOT_AGENTS.some(agent => userAgent.includes(agent)) && !pathname.includes('.')) {
      return fetchPrerendered(request, env, userAgent)
    }

    return env.ASSETS.fetch(request)
  }
}
