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

  response.catch(() => delete preloadResponses[requestID])

  return response
}

const getPathname = () => {
  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  return pathname
}

const getPage = (pathname = getPathname()) => {
  const potentiallyMatchingPages = pages
    .map(page => ({ ...isMatch(pathname, page.path), ...page }))
    .filter(({ match }) => match)

  return potentiallyMatchingPages.find(({ exactMatch }) => exactMatch) || potentiallyMatchingPages[0]
}

const isMatch = (pathname, path) => {
  if (pathname === path) return { exactMatch: true, match: true }
  if (!path.includes(':')) return { match: false }

  const pathnameParts = pathname.split('/')
  const pathParts = path.split('/')
  const match = pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind]?.startsWith(':'))

  return {
    match,
    exactMatch: match && pathnameParts.length === pathParts.length
  }
}

const preloadScripts = scripts => {
  scripts.forEach(script => {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
    )
  })
}

const preloadData = ({ pathname = getPathname(), path, data }) => {
  data.forEach(({ url, preconnect, ...request }) => {
    if (url.startsWith('func:')) url = eval(url.replace('func:', ''))

    const constructedURL = typeof url === 'string' ? url : url(getDynamicProperties(pathname, path))

    fetch(constructedURL, { ...request, preload: true })

    // https://issues.chromium.org/issues/380896837
    preconnect?.forEach(url => {
      document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preconnect', href: url }))
    })
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

const currentPage = getPage()

if (currentPage) {
  const { path, title, scripts, data } = currentPage

  preloadScripts(scripts)

  if (data) preloadData({ path, data })
  if (title) document.title = title
}
