const preloadRequests = {}

const originalFetch = window.fetch

window.fetch = async (input, options) => {
  const requestID = `${input.toString()}${options?.body?.toString() || ''}`
  const preloadedRequest = preloadRequests[requestID]

  if (preloadedRequest) {
    delete preloadRequests[requestID]
    return preloadedRequest
  }

  const fetchPromise = originalFetch(input, options)

  if (options?.preload) preloadRequests[requestID] = fetchPromise

  return fetchPromise
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

const getDynamicProperties = (pathname, path) => {
  const pathParts = path.split('/')
  const pathnameParts = pathname.split('/')
  const dynamicProperties = {}

  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i].startsWith(':')) dynamicProperties[pathParts[i].slice(1)] = pathnameParts[i]
  }

  return dynamicProperties
}

const preloadData = () => {
  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const matchingPages = pages.map(page => ({ ...isMatch(pathname, page.path), ...page })).filter(({ match }) => match)

  if (!matchingPages.length) return

  const { path, title, data } = matchingPages.find(({ exact }) => exact) || matchingPages[0]

  data?.forEach(({ url, body, preconnectURL }) => {
    if (url.startsWith('func:')) url = eval(url.replace('func:', ''))

    const fullURL = typeof url === 'string' ? url : url(getDynamicProperties(pathname, path))

    fetch(fullURL, { body, preload: true })

    if (preconnectURL) {
      document.head.appendChild(
        Object.assign(document.createElement('link'), { rel: 'preconnect', href: preconnectURL })
      )
    }
  })

  if (title) document.title = title
}

preloadData()
