const initialScriptsString = INJECT_INITIAL_SCRIPTS_STRING_HERE
const initialScripts = INJECT_INITIAL_SCRIPTS_HERE
const asyncScripts = INJECT_ASYNC_SCRIPTS_HERE
const html = INJECT_HTML_HERE
const documentEtag = INJECT_DOCUMENT_ETAG_HERE

const documentHeaders = { 'Cache-Control': 'public, max-age=0', 'Content-Type': 'text/html; charset=utf-8' }

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
  const prerenderUrl = new URL(`https://renderless.theninthsky.workers.dev?url=${url}`)
  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual'
  })

  const { body, headers: responseHeaders } = await fetch(prerenderRequest)

  return new Response(body, { headers: responseHeaders })
}

const isMatch = (pathname, path) => {
  if (pathname === path) return { exact: true, match: true }
  if (!path.includes(':')) return { match: false }

  const pathnameParts = pathname.split('/')
  const pathParts = path.split('/')
  const match = pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind]?.startsWith(':'))

  return {
    exact: match && pathnameParts.length === pathParts.length,
    match
  }
}

export default {
  fetch(request, env) {
    let { 'If-None-Match': etag, 'X-Cached': xCached } = JSON.parse(
      request.headers.get('service-worker-navigation-preload') || '{}'
    )

    etag ||= request.headers.get('If-None-Match')

    if (etag === documentEtag) return new Response(null, { status: 304, headers: documentHeaders })

    const pathname = new URL(request.url).pathname.toLowerCase()
    const userAgent = (request.headers.get('User-Agent') || '').toLowerCase()
    const bypassWorker = ['prerender', 'googlebot'].includes(userAgent) || pathname.includes('.')

    if (bypassWorker) return env.ASSETS.fetch(request)
    if (BOT_AGENTS.some(agent => userAgent.includes(agent))) return fetchPrerendered(request)

    xCached ||= request.headers.get('X-Cached')

    const cachedScripts = JSON.parse(xCached || '[]')
    const uncachedScripts = [...initialScripts, ...asyncScripts].filter(({ url }) => !cachedScripts.includes(url))

    if (!uncachedScripts.length) {
      return new Response(html, { headers: { ...documentHeaders, ETag: documentEtag, 'X-ETag': documentEtag } })
    }

    let body = html.replace(initialScriptsString, () => '')

    const injectedInitialScriptsString = initialScripts
      .map(({ url, source }) =>
        cachedScripts.includes(url) ? `<script src="${url}"></script>` : `<script id="${url}">${source}</script>`
      )
      .join('\n')

    body = body.replace('</body>', () => `<!-- INJECT_ASYNC_SCRIPTS_HERE -->${injectedInitialScriptsString}\n</body>`)

    const matchingPageScripts = asyncScripts
      .map(asset => {
        const parentsPaths = asset.parentPaths.map(path => ({ path, ...isMatch(pathname, path) }))
        const parentPathsExactMatch = parentsPaths.some(({ exact }) => exact)
        const parentPathsMatch = parentsPaths.some(({ match }) => match)

        return { ...asset, exact: parentPathsExactMatch, match: parentPathsMatch }
      })
      .filter(({ match }) => match)
    const exactMatchingPageScripts = matchingPageScripts.filter(({ exact }) => exact)
    const pageScripts = exactMatchingPageScripts.length ? exactMatchingPageScripts : matchingPageScripts
    const uncachedPageScripts = pageScripts.filter(({ url }) => !cachedScripts.includes(url))
    const injectedAsyncScriptsString = uncachedPageScripts.reduce(
      (str, { url, source }) => `${str}\n<script id="${url}">${source}</script>`,
      ''
    )

    body = body.replace('<!-- INJECT_ASYNC_SCRIPTS_HERE -->', () => injectedAsyncScriptsString)

    return new Response(body, { headers: documentHeaders })
  }
}
