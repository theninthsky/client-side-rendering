const extractInlinedScripts = () => {
  const scripts = [...document.querySelectorAll('script[type="module"]:not([src])')].map(({ id, textContent }) => ({
    id,
    source: textContent
  }))

  return scripts
}

export default extractInlinedScripts
