declare function getPage(path: string): Page | undefined

declare function preloadData(page: Page): void

export enum DataType {
  Static = 'static',
  Dynamic = 'dynamic'
}

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

type Events = {
  [event: string]: DataType
}

type EventHandlers = {
  [event: string]: () => void
}

const defaultEvents: Events = {
  onMouseEnter: DataType.Static,
  onTouchStart: DataType.Static,
  onMouseDown: DataType.Dynamic,
  onClick: DataType.Dynamic
}

export const getDataPreloadHandlers = (pathname: string, events: Events = defaultEvents) => {
  const handlers: EventHandlers = {}
  const page = getPage(pathname)
  const { data } = page || {}

  if (!data) return handlers

  const staticData = data.filter(data => data.static)
  const dynamicData = data.filter(data => !data.static)

  for (const event in events) {
    const relevantData = events[event] === DataType.Static ? staticData : dynamicData

    if (relevantData.length) {
      handlers[event] = () => {
        preloadData({ ...page, pathname, data: relevantData })
        delete handlers[event]
      }
    }
  }

  return handlers
}
