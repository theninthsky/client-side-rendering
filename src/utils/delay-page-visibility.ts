const root = document.getElementById('root') as HTMLDivElement

document.body.style.overflow = 'hidden'
root.style.visibility = 'hidden'

new MutationObserver((_, observer) => {
  if (!document.getElementById('layout')?.hasChildNodes()) return

  document.body.removeAttribute('style')
  root.removeAttribute('style')
  observer.disconnect()
}).observe(root, { childList: true, subtree: true })
