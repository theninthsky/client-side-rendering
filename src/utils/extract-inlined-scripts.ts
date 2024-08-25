const extractInlinedScripts = () => {
  const inlinedScripts = [...document.head.querySelectorAll('script[type="module"]:not([src])')].map(
    ({ id, textContent }) => ({
      url: id,
      source: textContent
    })
  )

  return inlinedScripts
}

export default extractInlinedScripts
