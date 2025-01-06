const preloadResponses = {}

const originalFetch = window.fetch

window.fetch = async (input, options) => {
  const requestID = `${input.toString()}${options?.body?.toString() || ''}`
  const preloadResponse = preloadResponses[requestID]

  if (preloadResponse) {
    if (!options?.preload) delete preloadResponses[requestID]

    return preloadResponse
  }

  const response = originalFetch(input, options)

  if (options?.preload) preloadResponses[requestID] = response

  return response
}

const getMatchingPage = pathname => {
  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const potentiallyMatchingPages = pages
    .map(page => ({ ...isMatch(pathname, page.path), ...page }))
    .filter(({ match }) => match)
  const matchingPage = potentiallyMatchingPages.find(({ exact }) => exact) || potentiallyMatchingPages[0]

  return matchingPage
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

const preloadScripts = ({ scripts }) => {
  scripts.forEach(script => {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
    )
  })
}

const preloadData = ({ path, data, preconnect }) => {
  data?.forEach(({ url, ...request }) => {
    if (url.startsWith('func:')) url = eval(url.replace('func:', ''))

    const constructedURL = typeof url === 'string' ? url : url(getDynamicProperties(pathname, path))

    fetch(constructedURL, { ...request, preload: true })
  })

  // https://issues.chromium.org/issues/380896837
  preconnect?.forEach(url => {
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preconnect', href: url }))
  })
}

const getDynamicProperties = (pathname, path) => {
  const pathParts = path.split('/')
  const pathnameParts = pathname.split('/')
  const dynamicProperties = {}

  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i].startsWith(':')) dynamicProperties[pathParts[i].slice(1)] = pathnameParts[i]
  }

  return dynamicProperties
}

const matchingPage = getMatchingPage(window.location.pathname)

if (matchingPage) {
  preloadScripts(matchingPage)
  preloadData(matchingPage)

  if (matchingPage.title) document.title = matchingPage.title
}
