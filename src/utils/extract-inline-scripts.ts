const extractInlineScripts = () => {
  const inlineScripts = [...document.body.querySelectorAll('script[id]:not([src])')].map(({ id, textContent }) => ({
    url: id,
    source: textContent!
  }))

  return inlineScripts
}

export default extractInlineScripts
