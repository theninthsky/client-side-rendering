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

const preloadAssets = () => {
  let { pathname } = window.location

  if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

  const matchingPages = pages.map(page => ({ ...isMatch(pathname, page.path), ...page })).filter(({ match }) => match)

  if (!matchingPages.length) return

  const { path, title, scripts, data } = matchingPages.find(({ exact }) => exact) || matchingPages[0]

  scripts.forEach(script => {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
    )
  })

  data?.forEach(({ url, crossorigin, preconnectURL }) => {
    if (url.startsWith('func:')) url = eval(url.replace('func:', ''))

    const fullURL = typeof url === 'string' ? url : url(getDynamicProperties(pathname, path))

    document.head.appendChild(
      Object.assign(document.createElement('link'), {
        rel: 'preload',
        href: fullURL,
        as: 'fetch',
        crossOrigin: crossorigin
      })
    )

    if (preconnectURL) {
      document.head.appendChild(
        Object.assign(document.createElement('link'), { rel: 'preconnect', href: preconnectURL })
      )
    }
  })

  if (title) document.title = title
}

preloadAssets()
