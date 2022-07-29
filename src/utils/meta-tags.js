export const setMetaTags = ({ title, description, image }) => {
  if (title) {
    document.title = title
    document.head.querySelector('meta[property="og:title"]').setAttribute('content', title)
  }
  if (description) document.head.querySelector('meta[name="description"]').setAttribute('content', description)

  document.head.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href)
  document.head
    .querySelector('meta[property="og:image"]')
    .setAttribute('content', image || `${window.location.origin}/icons/og-icon.png`)
}
