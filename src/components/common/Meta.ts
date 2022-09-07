import { useLayoutEffect, FC } from 'react'

export type MetaProps = {
  title: string
  description?: string
  image?: string
}

const setAttribute = (selector: string, attribute: string) => {
  document.head.querySelector(selector)?.setAttribute('content', attribute)
}

const Meta: FC<MetaProps> = ({ title, description = '', image = `${window.location.origin}/icons/og-icon.png` }) => {
  useLayoutEffect(() => {
    document.title = title
    setAttribute('meta[property="og:title"]', title)
    setAttribute('meta[name="description"]', description)
    setAttribute('meta[property="og:url"]', window.location.href)
    setAttribute('meta[property="og:image"]', image)

    return () => {
      setAttribute('meta[property="og:title"]', '')
      setAttribute('meta[name="description"]', '')
      setAttribute('meta[property="og:url"]', '')
      setAttribute('meta[property="og:image"]', `${window.location.origin}/icons/og-icon.png`)
    }
  }, [title, description, image])

  return null
}

export default Meta
