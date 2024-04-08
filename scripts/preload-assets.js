const isStructureEqual = (pathname, path) => {
  const pathnameParts = pathname.split('/')
  const pathParts = path.split('/')

  if (pathnameParts.length !== pathParts.length) return false

  return pathnameParts.every((part, ind) => part === pathParts[ind] || pathParts[ind].startsWith(':'))
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

let { pathname } = window.location

if (pathname !== '/') pathname = pathname.replace(/\/$/, '')

for (const { path, scripts, data } of pages) {
  const match = pathname === path || (path.includes(':') && isStructureEqual(pathname, path))

  if (!match) continue

  scripts.forEach(script => {
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'preload', href: '/' + script, as: 'script' })
    )
  })

  if (!data) break

  data.forEach(({ url, crossorigin, preconnectURL }) => {
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
}
