export type PreloadOptions = {
  crossorigin?: string
}

const preload = (url: string, { crossorigin }: PreloadOptions = {}) => {
  const preloadElement = document.head.appendChild(
    Object.assign(document.createElement('link'), {
      rel: 'preload',
      href: url,
      as: 'fetch',
      crossOrigin: crossorigin
    })
  )

  preloadElement.addEventListener('load', () => document.head.removeChild(preloadElement))
}

export default preload
