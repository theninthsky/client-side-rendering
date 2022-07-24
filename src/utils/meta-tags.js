export const setMetaTags = ({ title, description }) => {
  document.title = title
  document.head.querySelector('meta[name="description"]').setAttribute('content', description)
  document.head.querySelector('meta[property="og:title"]').setAttribute('content', title)
  document.head.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href)
}
