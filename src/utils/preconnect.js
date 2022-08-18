export const preconnect = url => {
  if (document.head.querySelector(`link[href="${url}"]`)) return

  document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preconnect', href: url }))
}
