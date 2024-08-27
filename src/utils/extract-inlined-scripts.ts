const extractInlinedScripts = () => {
  const inlinedScripts = [...document.body.querySelectorAll('script[id]:not([src])')].map(({ id, textContent }) => ({
    url: id,
    source: textContent
  }))

  return inlinedScripts
}

export default extractInlinedScripts
