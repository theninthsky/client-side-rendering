declare function getPage(path: string): Page

declare function preloadData(page: Page): void

type Page = {
  pathname: string
  title?: string
  data?: Request[]
}

type Request = RequestInit & {
  url: string
  static?: boolean
  preconnect?: string[]
}

export const getDataPreloadHandlers = (pathname: string) => {
  const page = getPage(pathname)
  const { data } = page

  if (!data) return

  const staticData = data.filter(data => data.static)
  const dynamicData = data.filter(data => !data.static)

  return {
    onMouseEnter: () => preloadData({ ...page, pathname, data: staticData }),
    onTouchStart: () => preloadData({ ...page, pathname, data: staticData }),
    onMouseDown: () => preloadData({ ...page, pathname, data: dynamicData }),
    onClick: () => preloadData({ ...page, pathname, data: dynamicData })
  }
}
