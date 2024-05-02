declare module '*.css'
declare module '*.svg'

type PageData = {
  url: string | ((params: { [x: string]: string }) => string) | any
  crossorigin: string
  preconnectURL: string
  menuPreload: boolean
}

declare module 'pages-manifest' {
  const pages: [
    {
      chunk: string
      path: string
      title: string
      description: string
      data: PageData[]
      menuItem: boolean
    }
  ]

  export default pages
}
