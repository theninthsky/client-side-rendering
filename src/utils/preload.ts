export type PreloadOptions = {
  url: string
  as?: string
  crossorigin?: string
}

const preload = ({ url, as = 'fetch', crossorigin }: PreloadOptions) => {
  const preloadElement = document.head.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as,
      crossOrigin: crossorigin
    })
  )

  preloadElement.addEventListener('load', () => document.head.removeChild(preloadElement))
}

export default preload
